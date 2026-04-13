#!/usr/bin/env node
// Test script for chunkNote logic — ported from Indexer.ts (no Obsidian deps)

import { readFileSync } from "fs";

const MAX_CHUNK_CHARS = 500;
const MIN_CHUNK_CHARS = 30;

function parseFrontmatter(content) {
  if (!content.startsWith("---"))
    return { meta: { title: "", summary: "", tags: [] }, body: content, fmLines: 0 };
  const end = content.indexOf("\n---", 3);
  if (end === -1)
    return { meta: { title: "", summary: "", tags: [] }, body: content, fmLines: 0 };
  const yaml = content.slice(4, end);
  const afterFm = content.slice(end + 4);
  const body = afterFm.trimStart();
  // 精确计算：prefix = content 中 body 之前的全部内容（含 fm + 空行）
  const prefix = content.slice(0, content.length - body.length);
  const fmLines = prefix.split("\n").length - 1;
  const raw = {};
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
  const meta = {
    title: raw.title ?? "",
    summary: raw.summary ?? "",
    tags: Array.isArray(raw.tags) ? raw.tags : (raw.tags ? [raw.tags] : []),
  };
  return { meta, body, fmLines };
}

function chunkNote(body, fmLines) {
  const lines = body.split("\n");
  const sections = [];
  let current = [];
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

  const chunks = [];

  for (const section of sections) {
    const sectionText = section.lines.join("\n");
    const absStart = fmLines + section.startOffset;

    if (sectionText.length <= MAX_CHUNK_CHARS) {
      const trimmed = sectionText.trim();
      if (trimmed.length >= MIN_CHUNK_CHARS) {
        chunks.push({ text: trimmed, startLine: absStart });
      }
    } else {
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

        const paraLines = para.split("\n").length;
        lineIdx += paraLines;
        while (lineIdx < sectionLines.length && sectionLines[lineIdx]?.trim() === "") lineIdx++;
        paraOffset = section.startOffset + lineIdx;
      }
    }
  }

  return chunks;
}

// --- main ---
const notePath = process.argv[2];
if (!notePath) {
  console.error("用法: node test-chunk.mjs <note-path>");
  process.exit(1);
}

const content = readFileSync(notePath, "utf-8");
const { meta, body, fmLines } = parseFrontmatter(content);
const chunks = chunkNote(body, fmLines);

console.log(`文件: ${notePath}`);
console.log(`frontmatter: ${fmLines} 行`);
if (meta.title) console.log(`title: ${meta.title}`);
if (meta.summary) console.log(`summary: ${meta.summary}`);
if (meta.tags.length) console.log(`tags: ${meta.tags.join(", ")}`);
console.log(`共 ${chunks.length} 个 chunk\n`);

for (let i = 0; i < chunks.length; i++) {
  const c = chunks[i];
  const preview = c.text.replace(/\n/g, "\\n").slice(0, 80);
  console.log(`[${i}] startLine=${c.startLine}, 长度=${c.text.length}`);
  console.log(`    "${preview}"`);
  console.log();
}
