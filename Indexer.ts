import { App, Notice, TFile } from "obsidian";
import type { EmbeddingProvider } from "./providers/types";
import { ChunkEntry } from "./SearchEngine";
import { tFormat } from "./i18n";

const SKIP_DIRS = new Set([".obsidian", "_templates", ".search_index", "node_modules", ".smart-env"]);
const BATCH_SIZE = 8;
const MAX_CHUNK_CHARS = 500;
const MIN_CHUNK_CHARS = 30;

interface ParsedMeta { title: string; summary: string; tags: string[]; }

function parseFrontmatter(content: string): { meta: ParsedMeta; body: string; fmLines: number } {
  if (!content.startsWith("---")) return { meta: { title: "", summary: "", tags: [] }, body: content, fmLines: 0 };
  const end = content.indexOf("\n---", 3);
  if (end === -1) return { meta: { title: "", summary: "", tags: [] }, body: content, fmLines: 0 };
  const yaml = content.slice(4, end);
  const afterFm = content.slice(end + 4);
  const body = afterFm.trimStart();
  // 精确计算：prefix = content 中 body 之前的全部内容（含 fm + 空行）
  const prefix = content.slice(0, content.length - body.length);
  const fmLines = prefix.split("\n").length - 1;
  const raw: Record<string, any> = {};
  for (const line of yaml.split("\n")) {
    const m = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (!m) continue;
    const val = m[2].trim();
    if (val.startsWith("[")) {
      try { raw[m[1]] = JSON.parse(val.replace(/'/g, '"')); } catch { raw[m[1]] = val; }
    } else {
      raw[m[1]] = val.replace(/^['"]|['"]$/g, "");
    }
  }
  const meta: ParsedMeta = {
    title: raw.title ?? "",
    summary: raw.summary ?? "",
    tags: Array.isArray(raw.tags) ? raw.tags : (raw.tags ? [raw.tags] : []),
  };
  return { meta, body, fmLines };
}

function chunkNote(body: string, fmLines: number): Array<{ text: string; startLine: number }> {
  const lines = body.split("\n");
  const sections: Array<{ lines: string[]; startOffset: number }> = [];
  let current: string[] = [];
  let currentStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^#{2,3} /.test(line) && current.length > 0) {
      sections.push({ lines: [...current], startOffset: currentStart });
      current = [line];
      currentStart = i;
    } else if (current.length === 0) {
      current = [line];
      currentStart = i;
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) sections.push({ lines: current, startOffset: currentStart });

  const chunks: Array<{ text: string; startLine: number }> = [];

  for (const section of sections) {
    const sectionText = section.lines.join("\n");
    const absStart = fmLines + section.startOffset;

    if (sectionText.length <= MAX_CHUNK_CHARS) {
      const trimmed = sectionText.trim();
      if (trimmed.length >= MIN_CHUNK_CHARS) {
        chunks.push({ text: trimmed, startLine: absStart });
      }
    } else {
      // Split by paragraph
      const paragraphs = sectionText.split(/\n\n+/);

      // 提取首行标题（如果有）
      const firstParaTrimmed = paragraphs[0]?.trim() ?? "";
      const hasHeading = /^#{2,3} /.test(firstParaTrimmed) && !firstParaTrimmed.includes("\n");
      const headingPrefix = hasHeading ? firstParaTrimmed + "\n" : "";

      let lineIdx = 0;
      let paraOffset = section.startOffset;
      let firstSubChunk = true;
      const sectionLines = section.lines;

      for (const para of paragraphs) {
        const trimmed = para.trim();

        // 跳过独立标题段（已提取为 headingPrefix）
        if (hasHeading && trimmed === firstParaTrimmed) {
          const paraLines = para.split("\n").length;
          lineIdx += paraLines;
          while (lineIdx < sectionLines.length && sectionLines[lineIdx]?.trim() === "") lineIdx++;
          paraOffset = section.startOffset + lineIdx;
          continue;
        }

        if (trimmed.length >= MIN_CHUNK_CHARS) {
          if (firstSubChunk && headingPrefix) {
            // 第一个子 chunk：prepend 标题，startLine 指向标题所在行
            chunks.push({ text: headingPrefix + trimmed, startLine: fmLines + section.startOffset });
            firstSubChunk = false;
          } else {
            chunks.push({ text: trimmed, startLine: fmLines + paraOffset });
          }
        }

        // Advance lineIdx to find the start of next paragraph
        const paraLines = para.split("\n").length;
        lineIdx += paraLines;
        // Skip blank lines
        while (lineIdx < sectionLines.length && sectionLines[lineIdx]?.trim() === "") lineIdx++;
        paraOffset = section.startOffset + lineIdx;
      }
    }
  }

  return chunks;
}

export class Indexer {
  constructor(
    private app: App,
    private embedding: EmbeddingProvider,
    private model: string,
    private baseUrl = ""
  ) {}

  async buildFull(onProgress: (cur: number, total: number) => void): Promise<void> {
    const files = this.getVaultFiles();
    const chunks = await this.embedFiles(files, {}, onProgress);
    await this.writeIndex(chunks);
    // Count unique notes
    const noteCount = new Set(chunks.map(c => c.path)).size;
    new Notice(tFormat("indexer.buildComplete", noteCount));
  }

  async buildIncremental(onProgress: (cur: number, total: number) => void): Promise<void> {
    const existing = await this.loadExisting();
    const files = this.getVaultFiles();
    const changed = files.filter(f => {
      const mtime = existing.mtimes[f.path];
      return mtime === undefined || mtime !== f.stat.mtime;
    });
    if (changed.length === 0) { new Notice(tFormat("indexer.upToDate")); return; }
    const newChunks = await this.embedFiles(changed, existing.mtimes, onProgress);
    // Keep unchanged notes' chunks
    const unchangedPaths = new Set(
      files.filter(f => existing.mtimes[f.path] === f.stat.mtime).map(f => f.path)
    );
    const kept = existing.chunks.filter(c => unchangedPaths.has(c.path));
    await this.writeIndex([...kept, ...newChunks]);
    const noteCount = new Set(newChunks.map(c => c.path)).size;
    new Notice(tFormat("indexer.incrementalComplete", noteCount));
  }

  async buildSingleFile(file: TFile): Promise<void> {
    const existing = await this.loadExisting();
    const otherChunks = existing.chunks.filter(c => c.path !== file.path);
    const newChunks = await this.embedFiles([file], {}, (_cur, _total) => {});
    await this.writeIndex([...otherChunks, ...newChunks]);
    new Notice(`✓ 已索引：${file.basename}（${newChunks.length} 个 chunk）`);
  }

  private getVaultFiles(): TFile[] {
    return this.app.vault.getMarkdownFiles().filter(f => {
      const topDir = f.path.split("/")[0];
      return !SKIP_DIRS.has(topDir);
    });
  }

  private async loadExisting(): Promise<{ chunks: ChunkEntry[]; mtimes: Record<string, number> }> {
    try {
      const content = await this.app.vault.adapter.read(".search_index/index.json");
      const idx = JSON.parse(content);
      const chunks: ChunkEntry[] = idx.chunks ?? [];
      const mtimes: Record<string, number> = {};
      for (const c of chunks) {
        mtimes[c.path] = c.mtime;
      }
      return { chunks, mtimes };
    } catch {
      return { chunks: [], mtimes: {} };
    }
  }

  private async embedFiles(
    files: TFile[],
    existingMtimes: Record<string, number>,
    onProgress: (cur: number, total: number) => void
  ): Promise<ChunkEntry[]> {
    const results: ChunkEntry[] = [];
    let processed = 0;

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      const contents = await Promise.all(batch.map(f => this.app.vault.read(f)));

      // Build all texts to embed for this batch
      const allChunkData: Array<{
        file: TFile;
        meta: ParsedMeta;
        chunkText: string;
        chunkIdx: number;
        startLine: number;
      }> = [];

      for (let j = 0; j < batch.length; j++) {
        const file = batch[j];
        const { meta, body, fmLines } = parseFrontmatter(contents[j]);
        const title = meta.title || file.basename;
        const noteChunks = chunkNote(body, fmLines);

        if (noteChunks.length === 0) {
          // Fallback: use title+summary as a single chunk
          const fallbackText = [title, meta.summary].filter(Boolean).join("\n");
          if (fallbackText.trim().length >= MIN_CHUNK_CHARS) {
            allChunkData.push({ file, meta: { ...meta, title }, chunkText: fallbackText, chunkIdx: 0, startLine: 0 });
          }
        } else {
          noteChunks.forEach((c, idx) => {
            allChunkData.push({ file, meta: { ...meta, title }, chunkText: c.text, chunkIdx: idx, startLine: c.startLine });
          });
        }
      }

      if (allChunkData.length > 0) {
        const embedTexts = allChunkData.map(d => `${d.meta.title}\n${d.chunkText}`);
        try {
          const embeddings = await this.embedding.embed(embedTexts);

          allChunkData.forEach((d, idx) => {
            results.push({
              path: d.file.path,
              title: d.meta.title,
              summary: d.meta.summary,
              tags: d.meta.tags,
              mtime: d.file.stat.mtime,
              chunkIdx: d.chunkIdx,
              startLine: d.startLine,
              text: d.chunkText,
              embedding: embeddings[idx],
            });
          });
        } catch (e: any) {
          const paths = [...new Set(allChunkData.map(d => d.file.basename))].join(", ");
          console.error(`[vault-search] embed batch failed (${paths}):`, e);
          new Notice(tFormat("indexer.batchFailed", paths, e.message));
        }
      }

      processed += batch.length;
      onProgress(Math.min(processed, files.length), files.length);
    }

    return results;
  }

  private async writeIndex(chunks: ChunkEntry[]): Promise<void> {
    const dims = chunks[0]?.embedding.length ?? 0;
    const index = {
      version: 2,
      updated_at: new Date().toISOString(),
      embedding_model: this.model,
      embedding_base_url: this.baseUrl,
      embedding_dims: dims,
      chunks,
    };
    try { await this.app.vault.adapter.mkdir(".search_index"); } catch {}
    await this.app.vault.adapter.write(".search_index/index.json", JSON.stringify(index));
  }
}
