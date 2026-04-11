import { App, Notice, TFile } from "obsidian";
import type { EmbeddingProvider } from "./providers/types";

const SKIP_DIRS = new Set([".obsidian", "密码", "_templates", ".search_index", "04-projects", "node_modules", ".smart-env"]);
const BATCH_SIZE = 8;
const TEXT_LIMIT = 300;

interface NoteRecord {
  path: string; title: string; summary: string; tags: string[];
  mtime: number; embedding: number[];
}

interface VaultIndex {
  version: number; updated_at: string;
  embedding_model: string; embedding_dims: number;
  notes: NoteRecord[];
}

function parseFrontmatter(content: string): { meta: Record<string, any>; body: string } {
  if (!content.startsWith("---")) return { meta: {}, body: content };
  const end = content.indexOf("\n---", 3);
  if (end === -1) return { meta: {}, body: content };
  const yaml = content.slice(4, end);
  const body = content.slice(end + 4).trimStart();
  const meta: Record<string, any> = {};
  for (const line of yaml.split("\n")) {
    const m = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (!m) continue;
    const val = m[2].trim();
    if (val.startsWith("[")) {
      try { meta[m[1]] = JSON.parse(val.replace(/'/g, '"')); } catch { meta[m[1]] = val; }
    } else {
      meta[m[1]] = val.replace(/^['"]|['"]$/g, "");
    }
  }
  return { meta, body };
}

function extractEmbedText(meta: Record<string, any>, body: string): string {
  const parts: string[] = [];
  if (meta.title) parts.push(meta.title);
  if (meta.summary) parts.push(meta.summary);
  if (meta.tags) {
    const tags = Array.isArray(meta.tags) ? meta.tags : [meta.tags];
    parts.push(tags.join(" "));
  }
  parts.push(body.slice(0, TEXT_LIMIT));
  return parts.join("\n");
}

export class Indexer {
  constructor(private app: App, private embedding: EmbeddingProvider, private model: string) {}

  async buildFull(onProgress: (cur: number, total: number) => void): Promise<void> {
    const files = this.getVaultFiles();
    const notes = await this.embedFiles(files, {}, onProgress);
    await this.writeIndex(notes);
    new Notice(`✓ 索引构建完成，共 ${notes.length} 篇笔记`);
  }

  async buildIncremental(onProgress: (cur: number, total: number) => void): Promise<void> {
    const existing = await this.loadExisting();
    const files = this.getVaultFiles();
    const changed = files.filter(f => {
      const prev = existing[f.path];
      return !prev || prev.mtime !== f.stat.mtime;
    });
    if (changed.length === 0) { new Notice("索引已是最新，无需更新"); return; }
    const updated = await this.embedFiles(changed, existing, onProgress);
    // merge: keep unchanged notes from existing index
    const unchangedPaths = new Set(files.filter(f => existing[f.path] && existing[f.path].mtime === f.stat.mtime).map(f => f.path));
    const unchanged = Object.values(existing).filter(n => unchangedPaths.has(n.path));
    await this.writeIndex([...unchanged, ...updated]);
    new Notice(`✓ 增量更新完成，更新 ${updated.length} 篇笔记`);
  }

  private getVaultFiles(): TFile[] {
    return this.app.vault.getMarkdownFiles().filter(f => {
      const topDir = f.path.split("/")[0];
      return !SKIP_DIRS.has(topDir);
    });
  }

  private async loadExisting(): Promise<Record<string, NoteRecord>> {
    try {
      const content = await this.app.vault.adapter.read(".search_index/index.json");
      const idx: VaultIndex = JSON.parse(content);
      return Object.fromEntries(idx.notes.map(n => [n.path, n]));
    } catch { return {}; }
  }

  private async embedFiles(
    files: TFile[],
    existing: Record<string, NoteRecord>,
    onProgress: (cur: number, total: number) => void
  ): Promise<NoteRecord[]> {
    const results: NoteRecord[] = [];
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      const contents = await Promise.all(batch.map(f => this.app.vault.read(f)));
      const texts = contents.map((c, j) => {
        const { meta, body } = parseFrontmatter(c);
        return extractEmbedText(meta, body);
      });
      const embeddings = await this.embedding.embed(texts);
      batch.forEach((f, j) => {
        const { meta } = parseFrontmatter(contents[j]);
        results.push({
          path: f.path,
          title: meta.title || f.basename,
          summary: meta.summary || "",
          tags: Array.isArray(meta.tags) ? meta.tags : (meta.tags ? [meta.tags] : []),
          mtime: f.stat.mtime,
          embedding: embeddings[j],
        });
      });
      onProgress(Math.min(i + BATCH_SIZE, files.length), files.length);
    }
    return results;
  }

  private async writeIndex(notes: NoteRecord[]): Promise<void> {
    const dims = notes[0]?.embedding.length ?? 0;
    const index: VaultIndex = {
      version: 1,
      updated_at: new Date().toISOString(),
      embedding_model: this.model,
      embedding_dims: dims,
      notes,
    };
    const json = JSON.stringify(index);
    try {
      await this.app.vault.adapter.mkdir(".search_index");
    } catch {}
    await this.app.vault.adapter.write(".search_index/index.json", json);
  }
}
