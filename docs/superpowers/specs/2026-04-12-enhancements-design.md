# Vault Search Plugin — Enhancement Design
Date: 2026-04-12

## Overview
Four enhancements: (1) chunk-level indexing & search with line-level navigation, (2) tab content persistence, (3) multi-note Q&A context, (4) i18n (zh/en).

---

## 1. Index Schema v2 — ChunkEntry

Replace `NoteEntry` / `notes[]` with `ChunkEntry` / `chunks[]`.

```typescript
interface ChunkEntry {
  path: string;       // note file path
  title: string;      // note title (frontmatter or basename)
  summary: string;    // note summary (frontmatter)
  tags: string[];
  mtime: number;      // for incremental update
  chunkIdx: number;   // 0-based index within note
  startLine: number;  // 0-based line in source file (for editor scroll)
  text: string;       // chunk text (used for Q&A context and result snippet)
  embedding: number[];
}

interface VaultIndex {
  version: 2;
  updated_at: string;
  embedding_model: string;
  embedding_base_url?: string;
  embedding_dims: number;
  chunks: ChunkEntry[];
}
```

`IndexLoader`: version < 2 → stale, reason = "索引格式已过期，请重建".

---

## 2. Chunking Strategy (Indexer.ts)

Function `chunkNote(rawContent: string): Array<{text: string, startLine: number}>`:

1. Strip frontmatter block.
2. Split at H2/H3 heading lines (`^#{2,3} `). Each heading starts a new chunk; heading line is included.
3. If a resulting section > 500 chars → further split by double-newline (`\n\n`).
4. Skip chunks < 30 chars.
5. Record `startLine` = 0-based line of the chunk's first line in the **original** file (including frontmatter lines).

Embed text per chunk = `"${noteTitle}\n${chunkText}"` (prepend title for semantic anchoring).

Incremental update: group chunks by `path`, compare `mtime`. If note unchanged, keep all its chunks. If changed, re-chunk and re-embed the whole note.

---

## 3. Search Pipeline (pipeline.ts + SearchEngine.ts)

`semanticSearch(query, chunks: ChunkEntry[], ...)` → `ChunkResult[]` (chunk + score).

Reranker input = `chunk.text` (was `title\nsummary` — better quality now).

**Related notes** (`findRelatedNotes`): run embedding recall on chunks, group by `path`, take max score per note, deduplicate, return top N unique notes.

**Q&A** (`askVault`): use `chunk.text` directly as context (no file reads). Include all top-K chunks as context, not capped per note.

---

## 4. SearchView — Tab Persistence

On `render()` (called once on open):
- Create stale banner div (always visible at top, updated separately).
- Create tab bar with buttons storing refs in `tabBtns`.
- Create one body div per tab, store in `tabBodies`, hide non-active via `display:none`.
- Init each tab's UI once.

`switchTab(id)`: toggle display + active class. For "related": call `refreshRelated()`.

Clear behavior: search results auto-clear when input is empty (existing). Ask answer is overwritten on new submit. No explicit clear button needed.

---

## 5. Line-Level Navigation (SearchView.ts)

```typescript
async openNoteAtLine(path: string, startLine: number) {
  const file = app.vault.getAbstractFileByPath(path);
  const leaf = app.workspace.getLeaf();
  await leaf.openFile(file as TFile);
  const view = leaf.view;
  if (view instanceof MarkdownView) {
    view.editor.scrollIntoView(
      { from: { line: startLine, ch: 0 }, to: { line: startLine, ch: 0 } }, true
    );
    view.editor.setCursor({ line: startLine, ch: 0 });
  }
}
```

Search result card: show `chunk.text` (first 120 chars) as snippet below title.

---

## 6. i18n (i18n.ts)

```typescript
export function t(key: string): string
```

- Detect locale: `(window as any).moment?.locale() ?? navigator.language`.
- Map `zh*` → Chinese strings; everything else → English.
- Keys cover: tab labels, placeholders, buttons, status messages, error messages, settings labels, LLM system prompt.

---

## 7. Files Changed

| File | Change |
|------|--------|
| `i18n.ts` | **New** — locale detection + string map |
| `SearchEngine.ts` | `NoteEntry` → `ChunkEntry`, update `embeddingRecall` signature |
| `IndexLoader.ts` | v2 schema, version stale check |
| `Indexer.ts` | `chunkNote()`, chunk-level embed loop |
| `pipeline.ts` | Use chunks, `findRelatedNotes`, remove file reads |
| `SearchView.ts` | Tab persistence, chunk result cards, `openNoteAtLine`, i18n |
| `SettingsTab.ts` | i18n |
| `main.ts` | Minor: pass chunks to providers |
