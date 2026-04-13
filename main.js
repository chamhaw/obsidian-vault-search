var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// i18n.ts
function detectLocale() {
  var _a, _b;
  const locale = (_b = (_a = window.moment) == null ? void 0 : _a.locale()) != null ? _b : navigator.language;
  return locale.startsWith("zh") ? "zh" : "en";
}
function t(key) {
  const locale = detectLocale();
  const entry = strings[key];
  if (!entry)
    return key;
  return entry[locale];
}
function tFormat(key, ...args) {
  let result = t(key);
  for (const arg of args) {
    result = result.replace(/%[ds]/, String(arg));
  }
  return result;
}
var strings;
var init_i18n = __esm({
  "i18n.ts"() {
    strings = {
      "tab.search": { zh: "\u641C\u7D22", en: "Search" },
      "tab.ask": { zh: "\u95EE\u7B54", en: "Ask" },
      "tab.related": { zh: "\u5173\u8054", en: "Related" },
      "search.placeholder": { zh: "\u8BED\u4E49\u641C\u7D22...", en: "Semantic search..." },
      "search.loading": { zh: "\u641C\u7D22\u4E2D...", en: "Searching..." },
      "search.noResults": { zh: "\u65E0\u7ED3\u679C", en: "No results" },
      "search.errorPrefix": { zh: "\u9519\u8BEF: ", en: "Error: " },
      "search.indexNotLoaded": { zh: "\u7D22\u5F15\u672A\u52A0\u8F7D", en: "Index not loaded" },
      "ask.placeholder": { zh: "\u5411\u77E5\u8BC6\u5E93\u63D0\u95EE...", en: "Ask your vault..." },
      "ask.submit": { zh: "\u63D0\u95EE", en: "Ask" },
      "ask.thinking": { zh: "\u601D\u8003\u4E2D...", en: "Thinking..." },
      "ask.sourcesLabel": { zh: "\u53C2\u8003\u6765\u6E90\uFF1A", en: "Sources:" },
      "ask.errorPrefix": { zh: "\u9519\u8BEF: ", en: "Error: " },
      "ask.indexNotLoaded": { zh: "\u7D22\u5F15\u672A\u52A0\u8F7D", en: "Index not loaded" },
      "related.insertLink": { zh: "\u63D2\u5165\u94FE\u63A5", en: "Insert link" },
      "related.noActiveNote": { zh: "\u8BF7\u6253\u5F00\u4E00\u7BC7\u7B14\u8BB0", en: "Open a note first" },
      "related.indexNotLoaded": { zh: "\u7D22\u5F15\u672A\u52A0\u8F7D", en: "Index not loaded" },
      "related.notInIndex": { zh: "\u5F53\u524D\u7B14\u8BB0\u4E0D\u5728\u7D22\u5F15\u4E2D\uFF0C\u8BF7\u91CD\u5EFA\u7D22\u5F15", en: "Note not indexed. Please rebuild index." },
      "related.loading": { zh: "\u52A0\u8F7D\u4E2D...", en: "Loading..." },
      "related.titlePrefix": { zh: "\u4E0E\u300C", en: 'Related to "' },
      "related.titleSuffix": { zh: "\u300D\u76F8\u5173\uFF1A", en: '":' },
      "related.allLinked": { zh: "\u6240\u6709\u76F8\u5173\u7B14\u8BB0\u5DF2\u5EFA\u7ACB\u94FE\u63A5", en: "All related notes are already linked" },
      "related.errorPrefix": { zh: "\u9519\u8BEF: ", en: "Error: " },
      "stale.bannerPrefix": { zh: "\u26A0\uFE0F \u7D22\u5F15\u4E0E\u5F53\u524D\u914D\u7F6E\u4E0D\u517C\u5BB9\uFF0C\u641C\u7D22\u7ED3\u679C\u4E0D\u53EF\u4FE1\uFF0C\u8BF7\u91CD\u5EFA\u7D22\u5F15\u3002\n\u539F\u56E0\uFF1A", en: "\u26A0\uFE0F Index is incompatible with current config. Please rebuild.\nReason: " },
      "stale.versionMismatch": { zh: "\u7D22\u5F15\u683C\u5F0F\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u5EFA\u7D22\u5F15", en: "Index format outdated, please rebuild" },
      "indexer.buildComplete": { zh: "\u2713 \u7D22\u5F15\u6784\u5EFA\u5B8C\u6210\uFF0C\u5171 %d \u7BC7\u7B14\u8BB0", en: "\u2713 Index built: %d notes" },
      "indexer.batchFailed": { zh: "\u26A0 \u6279\u91CF embed \u5931\u8D25\uFF08%s\uFF09\uFF1A%s", en: "\u26A0 Embed batch failed (%s): %s" },
      "indexer.upToDate": { zh: "\u7D22\u5F15\u5DF2\u662F\u6700\u65B0\uFF0C\u65E0\u9700\u66F4\u65B0", en: "Index is up to date" },
      "indexer.incrementalComplete": { zh: "\u2713 \u589E\u91CF\u66F4\u65B0\u5B8C\u6210\uFF0C\u66F4\u65B0 %d \u7BC7\u7B14\u8BB0", en: "\u2713 Incremental update: %d notes updated" },
      "indexer.building": { zh: "\u6784\u5EFA\u4E2D...", en: "Building..." },
      "indexer.noChanges": { zh: "\u65E0\u9700\u66F4\u65B0", en: "No changes" },
      "settings.embeddingSection": { zh: "Embedding", en: "Embedding" },
      "settings.embeddingBaseUrl": { zh: "Base URL", en: "Base URL" },
      "settings.embeddingModel": { zh: "\u6A21\u578B", en: "Model" },
      "settings.embeddingApiKey": { zh: "API Key", en: "API Key" },
      "settings.rerankerSection": { zh: "Reranker", en: "Reranker" },
      "settings.rerankerEnabled": { zh: "\u542F\u7528 Reranker", en: "Enable Reranker" },
      "settings.rerankerBaseUrl": { zh: "Reranker Base URL", en: "Reranker Base URL" },
      "settings.rerankerModel": { zh: "Reranker \u6A21\u578B", en: "Reranker Model" },
      "settings.rerankerApiKey": { zh: "Reranker API Key", en: "Reranker API Key" },
      "settings.filterSection": { zh: "\u8FC7\u6EE4", en: "Filtering" },
      "settings.minScoreName": { zh: "\u6700\u4F4E\u5339\u914D\u5EA6", en: "Minimum score" },
      "settings.minScoreDesc": { zh: "\u4F4E\u4E8E\u6B64\u5206\u503C\u7684\u7ED3\u679C\u5C06\u88AB\u8FC7\u6EE4\uFF080\u2013100%\uFF0C\u9ED8\u8BA4 10%\uFF09", en: "Results below this score are filtered out (0\u2013100%, default 10%)" },
      "settings.llmSection": { zh: "LLM", en: "LLM" },
      "settings.llmProvider": { zh: "Provider", en: "Provider" },
      "settings.llmBaseUrl": { zh: "LLM Base URL", en: "LLM Base URL" },
      "settings.llmModel": { zh: "LLM \u6A21\u578B", en: "LLM Model" },
      "settings.llmApiKey": { zh: "LLM API Key", en: "LLM API Key" },
      "settings.indexSection": { zh: "\u7D22\u5F15\u7BA1\u7406", en: "Index Management" },
      "settings.indexLocation": { zh: "\u7D22\u5F15\u4F4D\u7F6E\uFF1Avault\u6839\u76EE\u5F55/.search_index/index.json", en: "Index location: vault root/.search_index/index.json" },
      "settings.buildIndexName": { zh: "\u5168\u91CF\u6784\u5EFA\u7D22\u5F15", en: "Full Rebuild" },
      "settings.buildIndexDesc": { zh: "\u904D\u5386\u6240\u6709\u7B14\u8BB0\u91CD\u65B0\u751F\u6210\u5411\u91CF\u7D22\u5F15\uFF08\u9996\u6B21\u4F7F\u7528\u6216\u6A21\u578B\u53D8\u66F4\u540E\u6267\u884C\uFF09", en: "Rebuild the entire index from scratch (use after first setup or model changes)" },
      "settings.buildIndexBtn": { zh: "Build Index", en: "Build Index" },
      "settings.buildIndexBuilding": { zh: "\u6784\u5EFA\u4E2D...", en: "Building..." },
      "settings.buildIndexDone": { zh: "\u5B8C\u6210", en: "Done" },
      "settings.incrIndexName": { zh: "\u589E\u91CF\u66F4\u65B0\u7D22\u5F15", en: "Incremental Update" },
      "settings.incrIndexDesc": { zh: "\u53EA\u66F4\u65B0\u6709\u53D8\u66F4\u7684\u7B14\u8BB0\uFF0C\u901F\u5EA6\u66F4\u5FEB", en: "Only re-index changed notes (faster)" },
      "settings.incrIndexBtn": { zh: "Update Index", en: "Update Index" },
      "settings.incrIndexUpdating": { zh: "\u66F4\u65B0\u4E2D...", en: "Updating..." },
      "settings.incrIndexRebuildWarning": { zh: "\u68C0\u6D4B\u5230\u914D\u7F6E\u53D8\u66F4\uFF1A%s\n\n\u7531\u4E8E Embedding \u914D\u7F6E\u5DF2\u53D8\u66F4\uFF0C\u65E7\u5411\u91CF\u4E0E\u65B0\u5411\u91CF\u7A7A\u95F4\u4E0D\u517C\u5BB9\uFF0C\u589E\u91CF\u66F4\u65B0\u5C06\u5F3A\u5236\u6267\u884C\u5168\u91CF\u91CD\u5EFA\uFF08\u4F1A\u6D88\u8017\u8F83\u591A token\uFF09\u3002\n\n\u786E\u8BA4\u7EE7\u7EED\uFF1F", en: "Config changed: %s\n\nEmbedding config has changed; the old vectors are incompatible. Incremental update will force a full rebuild (may consume many tokens).\n\nProceed?" },
      "settings.confirmRebuild": { zh: "\u786E\u8BA4\u5168\u91CF\u91CD\u5EFA", en: "Confirm Full Rebuild" },
      "settings.cancel": { zh: "\u53D6\u6D88", en: "Cancel" },
      "settings.fullRebuildBuilding": { zh: "\u5168\u91CF\u91CD\u5EFA\u4E2D...", en: "Rebuilding..." },
      "settings.progress": { zh: "\u8FDB\u5EA6\uFF1A%d / %d", en: "Progress: %d / %d" },
      "settings.testSingleName": { zh: "\u6D4B\u8BD5\uFF1A\u4EC5\u7D22\u5F15\u5F53\u524D\u7B14\u8BB0", en: "Test: Index active note" },
      "settings.testSingleDesc": { zh: "\u4EC5\u5BF9\u5F53\u524D\u6253\u5F00\u7684\u7B14\u8BB0\u751F\u6210\u7D22\u5F15\uFF0C\u7528\u4E8E\u529F\u80FD\u9A8C\u8BC1\uFF0C\u6D88\u8017\u6781\u5C11 token", en: "Index only the currently open note for testing. Minimal token usage." },
      "settings.testSingleBtn": { zh: "\u7D22\u5F15\u5F53\u524D\u7B14\u8BB0", en: "Index active note" },
      "pipeline.systemPrompt": { zh: "\u4F60\u662F\u77E5\u8BC6\u5E93\u52A9\u624B\u3002\u4F60\u7684\u552F\u4E00\u4FE1\u606F\u6765\u6E90\u662F\u7528\u6237\u63D0\u4F9B\u7684\u7B14\u8BB0\u5185\u5BB9\uFF0C\u7981\u6B62\u4F7F\u7528\u4EFB\u4F55\u5916\u90E8\u77E5\u8BC6\u6216\u81EA\u884C\u63A8\u65AD\u8865\u5145\u3002\u56DE\u7B54\u65F6\u4E25\u683C\u5F15\u7528\u7B14\u8BB0\u539F\u6587\uFF0C\u7528 [\u5E8F\u53F7] \u6807\u6CE8\u6765\u6E90\u3002\u5982\u679C\u63D0\u4F9B\u7684\u7B14\u8BB0\u4E2D\u6CA1\u6709\u8DB3\u591F\u4FE1\u606F\u56DE\u7B54\u95EE\u9898\uFF0C\u5FC5\u987B\u660E\u786E\u56DE\u590D\uFF1A\u77E5\u8BC6\u5E93\u4E2D\u672A\u68C0\u7D22\u5230\u76F8\u5173\u5185\u5BB9\uFF0C\u4E0D\u5F97\u7F16\u9020\u6216\u63A8\u6D4B\u3002", en: "You are a knowledge base assistant. Your only information source is the provided note content. Do not use external knowledge or make inferences beyond the notes. When answering, strictly cite the notes using [number] markers. If the notes don't contain enough information, clearly state: 'No relevant content found in the knowledge base.' Do not fabricate or speculate." }
    };
  }
});

// Indexer.ts
var Indexer_exports = {};
__export(Indexer_exports, {
  Indexer: () => Indexer
});
function parseFrontmatter(content) {
  var _a, _b;
  if (!content.startsWith("---"))
    return { meta: { title: "", summary: "", tags: [] }, body: content, fmLines: 0 };
  const end = content.indexOf("\n---", 3);
  if (end === -1)
    return { meta: { title: "", summary: "", tags: [] }, body: content, fmLines: 0 };
  const yaml = content.slice(4, end);
  const afterFm = content.slice(end + 4);
  const body = afterFm.trimStart();
  const prefix = content.slice(0, content.length - body.length);
  const fmLines = prefix.split("\n").length - 1;
  const raw = {};
  for (const line of yaml.split("\n")) {
    const m = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (!m)
      continue;
    const val = m[2].trim();
    if (val.startsWith("[")) {
      try {
        raw[m[1]] = JSON.parse(val.replace(/'/g, '"'));
      } catch (e) {
        raw[m[1]] = val;
      }
    } else {
      raw[m[1]] = val.replace(/^['"]|['"]$/g, "");
    }
  }
  const meta = {
    title: (_a = raw.title) != null ? _a : "",
    summary: (_b = raw.summary) != null ? _b : "",
    tags: Array.isArray(raw.tags) ? raw.tags : raw.tags ? [raw.tags] : []
  };
  return { meta, body, fmLines };
}
function chunkNote(body, fmLines) {
  var _a, _b, _c, _d;
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
  if (current.length > 0)
    sections.push({ lines: current, startOffset: currentStart });
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
      const firstParaTrimmed = (_b = (_a = paragraphs[0]) == null ? void 0 : _a.trim()) != null ? _b : "";
      const hasHeading = /^#{2,3} /.test(firstParaTrimmed) && !firstParaTrimmed.includes("\n");
      const headingPrefix = hasHeading ? firstParaTrimmed + "\n" : "";
      let lineIdx = 0;
      let paraOffset = section.startOffset;
      let firstSubChunk = true;
      const sectionLines = section.lines;
      for (const para of paragraphs) {
        const trimmed = para.trim();
        if (hasHeading && trimmed === firstParaTrimmed) {
          const paraLines2 = para.split("\n").length;
          lineIdx += paraLines2;
          while (lineIdx < sectionLines.length && ((_c = sectionLines[lineIdx]) == null ? void 0 : _c.trim()) === "")
            lineIdx++;
          paraOffset = section.startOffset + lineIdx;
          continue;
        }
        if (trimmed.length >= MIN_CHUNK_CHARS) {
          if (firstSubChunk && headingPrefix) {
            chunks.push({ text: headingPrefix + trimmed, startLine: fmLines + section.startOffset });
            firstSubChunk = false;
          } else {
            chunks.push({ text: trimmed, startLine: fmLines + paraOffset });
          }
        }
        const paraLines = para.split("\n").length;
        lineIdx += paraLines;
        while (lineIdx < sectionLines.length && ((_d = sectionLines[lineIdx]) == null ? void 0 : _d.trim()) === "")
          lineIdx++;
        paraOffset = section.startOffset + lineIdx;
      }
    }
  }
  return chunks;
}
var import_obsidian3, SKIP_DIRS, BATCH_SIZE, EMBED_BATCH_SIZE, MAX_EMBED_CHARS, MAX_CHUNK_CHARS, MIN_CHUNK_CHARS, Indexer;
var init_Indexer = __esm({
  "Indexer.ts"() {
    import_obsidian3 = require("obsidian");
    init_i18n();
    SKIP_DIRS = /* @__PURE__ */ new Set([".obsidian", "_templates", ".search_index", "node_modules", ".smart-env"]);
    BATCH_SIZE = 8;
    EMBED_BATCH_SIZE = 32;
    MAX_EMBED_CHARS = 350;
    MAX_CHUNK_CHARS = 500;
    MIN_CHUNK_CHARS = 30;
    Indexer = class {
      constructor(app, embedding, model, baseUrl = "") {
        this.app = app;
        this.embedding = embedding;
        this.model = model;
        this.baseUrl = baseUrl;
      }
      async buildFull(onProgress) {
        const files = this.getVaultFiles();
        const chunks = await this.embedFiles(files, {}, onProgress);
        await this.writeIndex(chunks);
        const noteCount = new Set(chunks.map((c) => c.path)).size;
        new import_obsidian3.Notice(tFormat("indexer.buildComplete", noteCount));
      }
      async buildIncremental(onProgress) {
        const existing = await this.loadExisting();
        const files = this.getVaultFiles();
        const changed = files.filter((f) => {
          const mtime = existing.mtimes[f.path];
          return mtime === void 0 || mtime !== f.stat.mtime;
        });
        if (changed.length === 0) {
          new import_obsidian3.Notice(tFormat("indexer.upToDate"));
          return;
        }
        const newChunks = await this.embedFiles(changed, existing.mtimes, onProgress);
        const unchangedPaths = new Set(
          files.filter((f) => existing.mtimes[f.path] === f.stat.mtime).map((f) => f.path)
        );
        const kept = existing.chunks.filter((c) => unchangedPaths.has(c.path));
        await this.writeIndex([...kept, ...newChunks]);
        const noteCount = new Set(newChunks.map((c) => c.path)).size;
        new import_obsidian3.Notice(tFormat("indexer.incrementalComplete", noteCount));
      }
      async buildSingleFile(file) {
        const existing = await this.loadExisting();
        const otherChunks = existing.chunks.filter((c) => c.path !== file.path);
        const newChunks = await this.embedFiles([file], {}, (_cur, _total) => {
        });
        await this.writeIndex([...otherChunks, ...newChunks]);
        new import_obsidian3.Notice(`\u2713 \u5DF2\u7D22\u5F15\uFF1A${file.basename}\uFF08${newChunks.length} \u4E2A chunk\uFF09`);
      }
      getVaultFiles() {
        return this.app.vault.getMarkdownFiles().filter((f) => {
          const topDir = f.path.split("/")[0];
          return !SKIP_DIRS.has(topDir);
        });
      }
      async loadExisting() {
        var _a;
        try {
          const content = await this.app.vault.adapter.read(".search_index/index.json");
          const idx = JSON.parse(content);
          const chunks = (_a = idx.chunks) != null ? _a : [];
          const mtimes = {};
          for (const c of chunks) {
            mtimes[c.path] = c.mtime;
          }
          return { chunks, mtimes };
        } catch (e) {
          return { chunks: [], mtimes: {} };
        }
      }
      async embedFiles(files, existingMtimes, onProgress) {
        var _a, _b;
        const results = [];
        let processed = 0;
        for (let i = 0; i < files.length; i += BATCH_SIZE) {
          const batch = files.slice(i, i + BATCH_SIZE);
          const contents = await Promise.all(batch.map((f) => this.app.vault.read(f)));
          const allChunkData = [];
          for (let j = 0; j < batch.length; j++) {
            const file = batch[j];
            const { meta, body, fmLines } = parseFrontmatter(contents[j]);
            const title = meta.title || file.basename;
            const noteChunks = chunkNote(body, fmLines);
            if (noteChunks.length === 0) {
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
            const embedTexts = allChunkData.map((d) => {
              const raw = `${d.meta.title}
${d.chunkText}`;
              return raw.length > MAX_EMBED_CHARS ? raw.slice(0, MAX_EMBED_CHARS) : raw;
            });
            const embeddingMap = /* @__PURE__ */ new Map();
            for (let k = 0; k < embedTexts.length; k += EMBED_BATCH_SIZE) {
              const subTexts = embedTexts.slice(k, k + EMBED_BATCH_SIZE);
              try {
                const subEmbeddings = await this.embedding.embed(subTexts);
                subEmbeddings.forEach((emb, j) => embeddingMap.set(k + j, emb));
              } catch (e) {
                for (let m = 0; m < subTexts.length; m++) {
                  try {
                    const [emb] = await this.embedding.embed([subTexts[m]]);
                    embeddingMap.set(k + m, emb);
                  } catch (e2) {
                    const name = (_b = (_a = allChunkData[k + m]) == null ? void 0 : _a.file.basename) != null ? _b : "?";
                    console.warn(`[vault-search] skip chunk (${name}): ${e2.message}`);
                  }
                }
              }
            }
            allChunkData.forEach((d, idx) => {
              const embedding = embeddingMap.get(idx);
              if (!embedding)
                return;
              results.push({
                path: d.file.path,
                title: d.meta.title,
                summary: d.meta.summary,
                tags: d.meta.tags,
                mtime: d.file.stat.mtime,
                chunkIdx: d.chunkIdx,
                startLine: d.startLine,
                text: d.chunkText,
                embedding
              });
            });
          }
          processed += batch.length;
          onProgress(Math.min(processed, files.length), files.length);
        }
        return results;
      }
      async writeIndex(chunks) {
        var _a, _b;
        const dims = (_b = (_a = chunks[0]) == null ? void 0 : _a.embedding.length) != null ? _b : 0;
        const index = {
          version: 2,
          updated_at: (/* @__PURE__ */ new Date()).toISOString(),
          embedding_model: this.model,
          embedding_base_url: this.baseUrl,
          embedding_dims: dims,
          chunks
        };
        try {
          await this.app.vault.adapter.mkdir(".search_index");
        } catch (e) {
        }
        await this.app.vault.adapter.write(".search_index/index.json", JSON.stringify(index));
      }
    };
  }
});

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => VaultSearchPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian4 = require("obsidian");

// SettingsTab.ts
var import_obsidian = require("obsidian");
init_i18n();
var DEFAULT_SETTINGS = {
  embeddingBaseUrl: "https://api.siliconflow.cn/v1",
  embeddingModel: "BAAI/bge-large-zh-v1.5",
  embeddingApiKey: "",
  rerankerEnabled: true,
  rerankerBaseUrl: "https://api.siliconflow.cn/v1",
  rerankerModel: "BAAI/bge-reranker-v2-m3",
  rerankerApiKey: "",
  rerankerRecallTopK: 30,
  rerankerFinalTopK: 5,
  llmProvider: "anthropic",
  llmBaseUrl: "https://api.anthropic.com",
  llmModel: "claude-sonnet-4-6",
  llmApiKey: "",
  minScore: 0.1
};
var VaultSearchSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    const addText = (label, get, set, password = false) => new import_obsidian.Setting(containerEl).setName(label).addText((t2) => {
      if (password)
        t2.inputEl.type = "password";
      t2.setValue(get()).onChange(async (v) => {
        set(v);
        await this.plugin.saveSettings();
      });
    });
    containerEl.createEl("h2", { text: t("settings.embeddingSection") });
    addText(t("settings.embeddingBaseUrl"), () => this.plugin.settings.embeddingBaseUrl, (v) => this.plugin.settings.embeddingBaseUrl = v);
    addText(t("settings.embeddingModel"), () => this.plugin.settings.embeddingModel, (v) => this.plugin.settings.embeddingModel = v);
    addText(t("settings.embeddingApiKey"), () => this.plugin.settings.embeddingApiKey, (v) => this.plugin.settings.embeddingApiKey = v, true);
    containerEl.createEl("h2", { text: t("settings.rerankerSection") });
    new import_obsidian.Setting(containerEl).setName(t("settings.rerankerEnabled")).addToggle((t2) => t2.setValue(this.plugin.settings.rerankerEnabled).onChange(async (v) => {
      this.plugin.settings.rerankerEnabled = v;
      await this.plugin.saveSettings();
    }));
    addText(t("settings.rerankerBaseUrl"), () => this.plugin.settings.rerankerBaseUrl, (v) => this.plugin.settings.rerankerBaseUrl = v);
    addText(t("settings.rerankerModel"), () => this.plugin.settings.rerankerModel, (v) => this.plugin.settings.rerankerModel = v);
    addText(t("settings.rerankerApiKey"), () => this.plugin.settings.rerankerApiKey, (v) => this.plugin.settings.rerankerApiKey = v, true);
    containerEl.createEl("h2", { text: t("settings.filterSection") });
    new import_obsidian.Setting(containerEl).setName(t("settings.minScoreName")).setDesc(t("settings.minScoreDesc")).addText((text) => {
      text.setPlaceholder("10").setValue(String(Math.round(this.plugin.settings.minScore * 100))).onChange(async (v) => {
        const n = parseFloat(v);
        if (!isNaN(n) && n >= 0 && n <= 100) {
          this.plugin.settings.minScore = n / 100;
          await this.plugin.saveSettings();
        }
      });
      text.inputEl.type = "number";
      text.inputEl.min = "0";
      text.inputEl.max = "100";
      text.inputEl.style.width = "70px";
    }).addExtraButton(
      (btn) => btn.setIcon("reset").setTooltip("Reset to 10%").onClick(async () => {
        this.plugin.settings.minScore = 0.1;
        await this.plugin.saveSettings();
        this.display();
      })
    );
    containerEl.createEl("h2", { text: t("settings.llmSection") });
    new import_obsidian.Setting(containerEl).setName(t("settings.llmProvider")).addDropdown((d) => d.addOption("anthropic", "Anthropic Claude").addOption("openai-compatible", "OpenAI Compatible").setValue(this.plugin.settings.llmProvider).onChange(async (v) => {
      this.plugin.settings.llmProvider = v;
      await this.plugin.saveSettings();
    }));
    addText(t("settings.llmBaseUrl"), () => this.plugin.settings.llmBaseUrl, (v) => this.plugin.settings.llmBaseUrl = v);
    addText(t("settings.llmModel"), () => this.plugin.settings.llmModel, (v) => this.plugin.settings.llmModel = v);
    addText(t("settings.llmApiKey"), () => this.plugin.settings.llmApiKey, (v) => this.plugin.settings.llmApiKey = v, true);
    containerEl.createEl("h2", { text: t("settings.indexSection") });
    containerEl.createEl("p", { text: t("settings.indexLocation"), cls: "setting-item-description" });
    let progressEl = null;
    new import_obsidian.Setting(containerEl).setName(t("settings.buildIndexName")).setDesc(t("settings.buildIndexDesc")).addButton((btn) => btn.setButtonText(t("settings.buildIndexBtn")).setCta().onClick(async () => {
      btn.setDisabled(true).setButtonText(t("settings.buildIndexBuilding"));
      if (!progressEl) {
        progressEl = containerEl.createEl("p", { cls: "setting-item-description" });
      }
      try {
        await this.plugin.runIndex("full", (cur, total) => {
          if (progressEl)
            progressEl.setText(tFormat("settings.progress", cur, total));
        });
        if (progressEl)
          progressEl.setText(t("settings.buildIndexDone"));
      } catch (e) {
        if (progressEl)
          progressEl.setText(`Error: ${e.message}`);
        new import_obsidian.Notice(`Index build failed: ${e.message}`);
      } finally {
        btn.setDisabled(false).setButtonText(t("settings.buildIndexBtn"));
      }
    }));
    new import_obsidian.Setting(containerEl).setName(t("settings.incrIndexName")).setDesc(t("settings.incrIndexDesc")).addButton((btn) => btn.setButtonText(t("settings.incrIndexBtn")).onClick(async () => {
      const runIncremental = async () => {
        btn.setDisabled(true).setButtonText(t("settings.incrIndexUpdating"));
        if (!progressEl) {
          progressEl = containerEl.createEl("p", { cls: "setting-item-description" });
        }
        try {
          await this.plugin.runIndex("incremental", (cur, total) => {
            if (progressEl)
              progressEl.setText(tFormat("settings.progress", cur, total));
          });
          if (progressEl)
            progressEl.setText(t("settings.buildIndexDone"));
        } catch (e) {
          if (progressEl)
            progressEl.setText(`Error: ${e.message}`);
          new import_obsidian.Notice(`Incremental update failed: ${e.message}`);
        } finally {
          btn.setDisabled(false).setButtonText(t("settings.incrIndexBtn"));
        }
      };
      const runFull = async () => {
        btn.setDisabled(true).setButtonText(t("settings.fullRebuildBuilding"));
        if (!progressEl) {
          progressEl = containerEl.createEl("p", { cls: "setting-item-description" });
        }
        try {
          await this.plugin.runIndex("full", (cur, total) => {
            if (progressEl)
              progressEl.setText(tFormat("settings.progress", cur, total));
          });
          if (progressEl)
            progressEl.setText(t("settings.buildIndexDone"));
        } catch (e) {
          if (progressEl)
            progressEl.setText(`Error: ${e.message}`);
          new import_obsidian.Notice(`Full rebuild failed: ${e.message}`);
        } finally {
          btn.setDisabled(false).setButtonText(t("settings.incrIndexBtn"));
        }
      };
      if (this.plugin.indexLoader.isStale()) {
        const reason = this.plugin.indexLoader.getStaleReason();
        new ConfirmModal(
          this.app,
          tFormat("settings.incrIndexRebuildWarning", reason),
          runFull,
          t("settings.confirmRebuild"),
          t("settings.cancel")
        ).open();
      } else {
        await runIncremental();
      }
    }));
    new import_obsidian.Setting(containerEl).setName(t("settings.testSingleName")).setDesc(t("settings.testSingleDesc")).addButton(
      (btn) => btn.setButtonText(t("settings.testSingleBtn")).onClick(async () => {
        const file = this.app.workspace.getActiveFile();
        if (!file) {
          new import_obsidian.Notice("\u8BF7\u5148\u5728\u7F16\u8F91\u5668\u4E2D\u6253\u5F00\u4E00\u7BC7\u7B14\u8BB0");
          return;
        }
        btn.setDisabled(true).setButtonText("\u7D22\u5F15\u4E2D...");
        try {
          await this.plugin.runIndexSingleFile(file);
        } catch (e) {
          new import_obsidian.Notice(`Single file index failed: ${e.message}`);
        } finally {
          btn.setDisabled(false).setButtonText(t("settings.testSingleBtn"));
        }
      })
    );
  }
};
var ConfirmModal = class extends import_obsidian.Modal {
  constructor(app, message, onConfirm, confirmText = t("settings.confirmRebuild"), cancelText = t("settings.cancel")) {
    super(app);
    this.message = message;
    this.onConfirm = onConfirm;
    this.confirmText = confirmText;
    this.cancelText = cancelText;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("p", { text: this.message });
    const btnRow = contentEl.createDiv({ cls: "modal-button-container" });
    btnRow.createEl("button", { text: this.cancelText, cls: "mod-warning" }).onclick = () => this.close();
    const confirmBtn = btnRow.createEl("button", { text: this.confirmText, cls: "mod-cta" });
    confirmBtn.onclick = () => {
      this.close();
      this.onConfirm();
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};

// SearchView.ts
var import_obsidian2 = require("obsidian");
var import_view = require("@codemirror/view");

// SearchEngine.ts
function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}
function chunkEmbeddingRecall(queryVec, chunks, topK) {
  return chunks.map((chunk) => ({ chunk, score: cosineSimilarity(queryVec, chunk.embedding) })).sort((a, b) => b.score - a.score).slice(0, topK);
}

// pipeline.ts
init_i18n();
async function semanticSearch(query, chunks, embedding, reranker, config) {
  const [queryVec] = await embedding.embed([query]);
  const candidates = chunkEmbeddingRecall(queryVec, chunks, config.recallTopK);
  if (!reranker || candidates.length === 0)
    return candidates.slice(0, config.finalTopK).filter((r) => {
      var _a;
      return r.score >= ((_a = config.minScore) != null ? _a : 0);
    });
  const docs = candidates.map((r) => r.chunk.text);
  const scores = await reranker.rerank(query, docs);
  return candidates.map((r, i) => ({ ...r, score: scores[i] })).sort((a, b) => b.score - a.score).slice(0, config.finalTopK).filter((r) => {
    var _a;
    return r.score >= ((_a = config.minScore) != null ? _a : 0);
  });
}
async function findRelatedNotes(queryTitle, querySummary, queryTags, excludePath, chunks, embedding, reranker, config) {
  const queryStr = [queryTitle, querySummary, queryTags.join(" ")].filter(Boolean).join("\n");
  const otherChunks = chunks.filter((c) => c.path !== excludePath);
  const chunkResults = await semanticSearch(queryStr, otherChunks, embedding, reranker, { recallTopK: 40, finalTopK: 40 });
  const noteMap = /* @__PURE__ */ new Map();
  for (const r of chunkResults) {
    const existing = noteMap.get(r.chunk.path);
    if (!existing || r.score > existing.score) {
      noteMap.set(r.chunk.path, {
        path: r.chunk.path,
        title: r.chunk.title,
        summary: r.chunk.summary,
        score: r.score,
        bestChunkText: r.chunk.text
      });
    }
  }
  return Array.from(noteMap.values()).sort((a, b) => b.score - a.score).filter((r) => {
    var _a;
    return r.score >= ((_a = config.minScore) != null ? _a : 0);
  }).slice(0, config.finalTopK);
}
async function askVault(question, chunks, embedding, reranker, llm, config, onChunk) {
  const results = await semanticSearch(question, chunks, embedding, reranker, config);
  const contextParts = results.map(
    (r, i) => `[${i + 1}] \u6807\u9898\uFF1A${r.chunk.title}
${r.chunk.text}`
  );
  const context = contextParts.join("\n\n---\n\n");
  const messages = [
    { role: "system", content: t("pipeline.systemPrompt") },
    { role: "user", content: `\u77E5\u8BC6\u5E93\u5185\u5BB9\uFF1A

${context}

\u95EE\u9898\uFF1A${question}` }
  ];
  await llm.chat(messages, onChunk);
  const seen = /* @__PURE__ */ new Set();
  const sources = [];
  for (const r of results) {
    if (!seen.has(r.chunk.path)) {
      seen.add(r.chunk.path);
      sources.push({ title: r.chunk.title, path: r.chunk.path });
    }
  }
  return { answer: "", sources };
}

// SearchView.ts
init_i18n();
var VIEW_TYPE = "vault-search-view";
var VaultSearchView = class extends import_obsidian2.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.tab = "search";
    this.tabBtns = {};
    this.tabBodies = {};
    this.staleBannerEl = null;
  }
  getViewType() {
    return VIEW_TYPE;
  }
  getDisplayText() {
    return "Vault Search";
  }
  getIcon() {
    return "search";
  }
  async onOpen() {
    this.render();
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        if (this.tab === "related")
          this.refreshRelated();
      })
    );
  }
  refresh() {
    this.updateStaleBanner();
    if (this.tab === "related")
      this.refreshRelated();
  }
  // ---------- Layout ----------
  render() {
    const { contentEl } = this;
    contentEl.empty();
    this.staleBannerEl = contentEl.createDiv({ cls: "vs-stale-banner" });
    this.updateStaleBanner();
    const bar = contentEl.createDiv({ cls: "vs-tabs" });
    const tabIds = ["search", "ask", "related"];
    for (const id of tabIds) {
      const btn = bar.createEl("button", {
        text: t(`tab.${id}`),
        cls: `vs-tab${this.tab === id ? " active" : ""}`
      });
      btn.onclick = () => this.switchTab(id);
      this.tabBtns[id] = btn;
    }
    const wrapper = contentEl.createDiv({ cls: "vs-body-wrapper" });
    for (const id of tabIds) {
      const body = wrapper.createDiv({ cls: "vs-body" });
      body.style.display = this.tab === id ? "" : "none";
      this.tabBodies[id] = body;
    }
    this.renderSearch(this.tabBodies.search);
    this.renderAsk(this.tabBodies.ask);
    this.renderRelated(this.tabBodies.related);
  }
  switchTab(id) {
    this.tab = id;
    for (const [k, btn] of Object.entries(this.tabBtns)) {
      btn == null ? void 0 : btn.classList.toggle("active", k === id);
    }
    for (const [k, body] of Object.entries(this.tabBodies)) {
      if (body)
        body.style.display = k === id ? "" : "none";
    }
    if (id === "related")
      this.refreshRelated();
  }
  updateStaleBanner() {
    if (!this.staleBannerEl)
      return;
    if (this.plugin.indexLoader.isStale()) {
      this.staleBannerEl.style.display = "";
      this.staleBannerEl.setText(
        t("stale.bannerPrefix") + this.plugin.indexLoader.getStaleReason()
      );
    } else {
      this.staleBannerEl.style.display = "none";
    }
  }
  // ---------- Search Tab ----------
  renderSearch(el) {
    const input = el.createEl("input", {
      type: "text",
      placeholder: t("search.placeholder"),
      cls: "vs-input"
    });
    const results = el.createDiv({ cls: "vs-results" });
    let timer;
    input.oninput = () => {
      clearTimeout(timer);
      timer = setTimeout(() => this.doSearch(input.value, results), 300);
    };
    input.focus();
  }
  async doSearch(query, el) {
    if (!query.trim()) {
      el.empty();
      return;
    }
    const index = this.plugin.indexLoader.getIndex();
    if (!index) {
      el.setText(t("search.indexNotLoaded"));
      return;
    }
    el.setText(t("search.loading"));
    try {
      const results = await semanticSearch(
        query,
        index.chunks,
        this.plugin.providers.embedding,
        this.plugin.providers.reranker,
        { recallTopK: this.plugin.settings.rerankerRecallTopK, finalTopK: this.plugin.settings.rerankerFinalTopK, minScore: this.plugin.settings.minScore }
      );
      el.empty();
      if (!results.length) {
        el.setText(t("search.noResults"));
        return;
      }
      results.forEach((r) => {
        const item = el.createDiv({ cls: "vs-item" });
        const row = item.createDiv({ cls: "vs-title-row" });
        const titleEl = row.createDiv({ cls: "vs-title" });
        highlightTerms(titleEl, r.chunk.title, query);
        row.createEl("div", { text: `${(r.score * 100).toFixed(1)}%`, cls: "vs-score" });
        const snippet = r.chunk.text.slice(0, 120).replace(/\n/g, " ");
        const summaryEl = item.createDiv({ cls: "vs-summary" });
        highlightTerms(summaryEl, snippet, query);
        item.onclick = () => this.openNoteAtLine(r.chunk.path, r.chunk.startLine);
      });
    } catch (e) {
      el.setText(t("search.errorPrefix") + e.message);
    }
  }
  // ---------- Ask Tab ----------
  renderAsk(el) {
    const ta = el.createEl("textarea", {
      placeholder: t("ask.placeholder"),
      cls: "vs-textarea"
    });
    const btn = el.createEl("button", { text: t("ask.submit"), cls: "vs-btn" });
    const ans = el.createDiv({ cls: "vs-answer" });
    const run = () => this.doAsk(ta.value, ans);
    btn.onclick = run;
    ta.onkeydown = (e) => {
      if (e.key === "Enter" && e.metaKey)
        run();
    };
  }
  async doAsk(question, el) {
    if (!question.trim())
      return;
    const index = this.plugin.indexLoader.getIndex();
    if (!index) {
      el.setText(t("ask.indexNotLoaded"));
      return;
    }
    el.empty();
    const ansEl = el.createDiv({ cls: "vs-ans-text" });
    ansEl.setText(t("ask.thinking"));
    let full = "";
    try {
      const result = await askVault(
        question,
        index.chunks,
        this.plugin.providers.embedding,
        this.plugin.providers.reranker,
        this.plugin.providers.llm,
        { recallTopK: this.plugin.settings.rerankerRecallTopK, finalTopK: this.plugin.settings.rerankerFinalTopK, minScore: this.plugin.settings.minScore },
        (chunk) => {
          full += chunk;
          ansEl.setText(full);
        }
      );
      if (result.sources.length) {
        const src = el.createDiv({ cls: "vs-sources" });
        src.createEl("div", { text: t("ask.sourcesLabel"), cls: "vs-src-label" });
        result.sources.forEach((s, i) => {
          const l = src.createEl("div", { text: `[${i + 1}] ${s.title}`, cls: "vs-src-link" });
          l.onclick = () => this.openNoteAtLine(s.path, 0);
        });
      }
    } catch (e) {
      ansEl.setText(t("ask.errorPrefix") + e.message);
    }
  }
  // ---------- Related Tab ----------
  renderRelated(el) {
    el.empty();
    const active = this.app.workspace.getActiveFile();
    if (!active) {
      el.setText(t("related.noActiveNote"));
      return;
    }
    const index = this.plugin.indexLoader.getIndex();
    if (!index) {
      el.setText(t("related.indexNotLoaded"));
      return;
    }
    const curChunks = index.chunks.filter((c) => c.path === active.path);
    if (curChunks.length === 0) {
      el.setText(t("related.notInIndex"));
      return;
    }
    const curChunk = curChunks[0];
    el.setText(t("related.loading"));
    const noteBodyText = curChunks.slice(0, 4).map((c) => c.text).join("\n\n").slice(0, 500);
    findRelatedNotes(
      curChunk.title,
      noteBodyText,
      curChunk.tags,
      active.path,
      index.chunks,
      this.plugin.providers.embedding,
      this.plugin.providers.reranker,
      { recallTopK: 40, finalTopK: 5, minScore: this.plugin.settings.minScore }
    ).then(async (results) => {
      let linkedTitles = /* @__PURE__ */ new Set();
      try {
        const content = await this.app.vault.read(active);
        const re = /\[\[([^\]|#]+)/g;
        let m;
        while ((m = re.exec(content)) !== null) {
          linkedTitles.add(m[1].trim().toLowerCase());
        }
      } catch (e) {
      }
      const unlinked = results.filter(
        (r) => !linkedTitles.has(r.title.trim().toLowerCase())
      );
      el.empty();
      el.createEl("div", {
        text: t("related.titlePrefix") + curChunk.title + t("related.titleSuffix"),
        cls: "vs-rel-title"
      });
      if (unlinked.length === 0) {
        el.createEl("div", { text: t("related.allLinked"), cls: "vs-empty" });
        return;
      }
      unlinked.forEach((r) => {
        const item = el.createDiv({ cls: "vs-item" });
        const row = item.createDiv({ cls: "vs-title-row" });
        row.createEl("div", { text: r.title, cls: "vs-title" });
        row.createEl("div", { text: `${(r.score * 100).toFixed(1)}%`, cls: "vs-score" });
        if (r.summary)
          item.createEl("div", { text: r.summary, cls: "vs-summary" });
        const insBtn = item.createEl("button", { text: t("related.insertLink"), cls: "vs-ins-btn" });
        insBtn.onclick = (e) => {
          e.stopPropagation();
          this.insertWikilink(r.title);
        };
        item.onclick = () => this.openNoteAtLine(r.path, 0);
      });
    }).catch((e) => el.setText(t("related.errorPrefix") + e.message));
  }
  refreshRelated() {
    const body = this.tabBodies.related;
    if (body)
      this.renderRelated(body);
  }
  // ---------- Helpers ----------
  async openNoteAtLine(path, startLine) {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof import_obsidian2.TFile))
      return;
    const leaf = this.app.workspace.getLeaf();
    await leaf.openFile(file);
    const view = leaf.view;
    if (!(view instanceof import_obsidian2.MarkdownView))
      return;
    const cm = view.editor.cm;
    const lineNum = Math.min(Math.max(startLine + 1, 1), cm.state.doc.lines);
    const line = cm.state.doc.line(lineNum);
    cm.dispatch({
      selection: { anchor: line.from, head: line.to },
      // Place the target line near the top of the viewport (80px from top)
      effects: import_view.EditorView.scrollIntoView(line.from, { y: "start", yMargin: 80 })
    });
  }
  insertWikilink(title) {
    const view = this.plugin.lastMarkdownView;
    if (view == null ? void 0 : view.editor) {
      const content = view.editor.getValue();
      if (content.includes(`[[${title}]]`)) {
        new import_obsidian2.Notice(`[[${title}]] \u5DF2\u5B58\u5728`);
        return;
      }
      view.editor.replaceSelection(`[[${title}]]`);
    } else {
      navigator.clipboard.writeText(`[[${title}]]`);
      new import_obsidian2.Notice(`\u5DF2\u590D\u5236 [[${title}]] \u5230\u526A\u8D34\u677F`);
    }
  }
};
function highlightTerms(container, text, query) {
  const terms = query.trim().split(/\s+/).filter((t2) => t2.length > 1);
  if (terms.length === 0) {
    container.textContent = text;
    return;
  }
  const escaped = terms.map((t2) => t2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);
  parts.forEach((part, i) => {
    if (i % 2 === 1) {
      container.createEl("mark", { cls: "vs-highlight", text: part });
    } else if (part) {
      container.appendText(part);
    }
  });
}

// IndexLoader.ts
var IndexLoader = class {
  constructor(app) {
    this.app = app;
    this.index = null;
    this.configuredModel = "";
    this.configuredBaseUrl = "";
    this.stale = false;
    this.staleReason = "";
  }
  setConfig(config) {
    this.configuredModel = config.model;
    this.configuredBaseUrl = config.baseUrl;
    this.checkStaleness();
  }
  setConfiguredModel(model) {
    this.configuredModel = model;
    this.checkStaleness();
  }
  async load() {
    try {
      const content = await this.app.vault.adapter.read(".search_index/index.json");
      this.index = JSON.parse(content);
      this.checkStaleness();
      return this.index;
    } catch (e) {
      this.index = null;
      this.stale = false;
      this.staleReason = "";
      return null;
    }
  }
  getIndex() {
    return this.index;
  }
  isStale() {
    return this.stale;
  }
  getStaleReason() {
    return this.staleReason;
  }
  watchAndReload(_onReload) {
  }
  checkStaleness() {
    if (!this.index) {
      this.stale = false;
      this.staleReason = "";
      return;
    }
    if (!this.index.version || this.index.version < 2) {
      this.stale = true;
      this.staleReason = "\u7D22\u5F15\u683C\u5F0F\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u5EFA\u7D22\u5F15\uFF08Index format outdated, please rebuild\uFF09";
      return;
    }
    const modelOk = !this.configuredModel || this.index.embedding_model === this.configuredModel;
    const urlOk = !this.index.embedding_base_url || !this.configuredBaseUrl || this.index.embedding_base_url === this.configuredBaseUrl;
    if (!modelOk) {
      this.stale = true;
      this.staleReason = `Embedding \u6A21\u578B\u4E0D\u5339\u914D\uFF08\u7D22\u5F15: ${this.index.embedding_model}\uFF0C\u5F53\u524D: ${this.configuredModel}\uFF09`;
    } else if (!urlOk) {
      this.stale = true;
      this.staleReason = `Embedding \u670D\u52A1\u5730\u5740\u4E0D\u5339\u914D\uFF08\u7D22\u5F15: ${this.index.embedding_base_url}\uFF0C\u5F53\u524D: ${this.configuredBaseUrl}\uFF09`;
    } else {
      this.stale = false;
      this.staleReason = "";
    }
  }
};

// providers/OpenAICompatible.ts
var OpenAICompatibleEmbeddingProvider = class {
  constructor(baseUrl, model, apiKey) {
    this.baseUrl = baseUrl;
    this.model = model;
    this.apiKey = apiKey;
  }
  async embed(texts) {
    const r = await fetch(`${this.baseUrl}/embeddings`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.model, input: texts })
    });
    if (!r.ok)
      throw new Error(`Embedding API ${r.status}: ${await r.text()}`);
    const data = await r.json();
    return [...data.data].sort((a, b) => a.index - b.index).map((i) => i.embedding);
  }
};
var HttpRerankProvider = class {
  constructor(baseUrl, model, apiKey) {
    this.baseUrl = baseUrl;
    this.model = model;
    this.apiKey = apiKey;
  }
  async rerank(query, documents) {
    const r = await fetch(`${this.baseUrl}/rerank`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.model, query, documents })
    });
    if (!r.ok)
      throw new Error(`Reranker API ${r.status}`);
    const scores = new Array(documents.length).fill(0);
    for (const item of (await r.json()).results)
      scores[item.index] = item.relevance_score;
    return scores;
  }
};
var OpenAICompatibleLLMProvider = class {
  constructor(baseUrl, model, apiKey) {
    this.baseUrl = baseUrl;
    this.model = model;
    this.apiKey = apiKey;
  }
  async chat(messages, onChunk) {
    return new Promise((resolve, reject) => {
      const https = require("https");
      const http = require("http");
      const url = new URL(`${this.baseUrl}/chat/completions`);
      const body = JSON.stringify({ model: this.model, messages, stream: true });
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: url.pathname + url.search,
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        }
      };
      const transport = url.protocol === "https:" ? https : http;
      const req = transport.request(options, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          let errBody = "";
          res.on("data", (d) => errBody += d.toString());
          res.on("end", () => reject(new Error(`LLM API ${res.statusCode}: ${errBody}`)));
          return;
        }
        let buf = "";
        res.on("data", (chunk) => {
          var _a, _b, _c, _d, _e;
          buf += chunk.toString();
          const lines = buf.split("\n");
          buf = (_a = lines.pop()) != null ? _a : "";
          for (const line of lines) {
            if (!line.startsWith("data: ") || line === "data: [DONE]")
              continue;
            try {
              const d = (_e = (_d = (_c = (_b = JSON.parse(line.slice(6))) == null ? void 0 : _b.choices) == null ? void 0 : _c[0]) == null ? void 0 : _d.delta) == null ? void 0 : _e.content;
              if (d)
                onChunk(d);
            } catch (e) {
            }
          }
        });
        res.on("end", resolve);
        res.on("error", reject);
      });
      req.on("error", reject);
      req.write(body);
      req.end();
    });
  }
};

// providers/Anthropic.ts
var AnthropicProvider = class {
  constructor(apiKey, model, baseUrl = "https://api.anthropic.com") {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl;
  }
  async chat(messages, onChunk) {
    return new Promise((resolve, reject) => {
      var _a;
      const https = require("https");
      const http = require("http");
      const url = new URL(`${this.baseUrl}/v1/messages`);
      const body = JSON.stringify({
        model: this.model,
        max_tokens: 2048,
        stream: true,
        messages: messages.filter((m) => m.role !== "system"),
        system: (_a = messages.find((m) => m.role === "system")) == null ? void 0 : _a.content
      });
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: url.pathname + url.search,
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        }
      };
      const transport = url.protocol === "https:" ? https : http;
      const req = transport.request(options, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          let errBody = "";
          res.on("data", (d) => errBody += d.toString());
          res.on("end", () => reject(new Error(`Anthropic API ${res.statusCode}: ${errBody}`)));
          return;
        }
        let buf = "";
        res.on("data", (chunk) => {
          var _a2, _b, _c;
          buf += chunk.toString();
          const lines = buf.split("\n");
          buf = (_a2 = lines.pop()) != null ? _a2 : "";
          for (const line of lines) {
            if (!line.startsWith("data: "))
              continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]")
              continue;
            try {
              const p = JSON.parse(data);
              if (p.type === "content_block_delta")
                onChunk((_c = (_b = p.delta) == null ? void 0 : _b.text) != null ? _c : "");
            } catch (e) {
            }
          }
        });
        res.on("end", resolve);
        res.on("error", reject);
      });
      req.on("error", reject);
      req.write(body);
      req.end();
    });
  }
};

// providers/index.ts
function buildProviders(config) {
  const embedding = new OpenAICompatibleEmbeddingProvider(config.embedding.base_url, config.embedding.model, config.embedding.api_key);
  const reranker = config.reranker.enabled ? new HttpRerankProvider(config.reranker.base_url, config.reranker.model, config.reranker.api_key) : null;
  const llm = config.llm.provider === "anthropic" ? new AnthropicProvider(config.llm.api_key, config.llm.model, config.llm.base_url) : new OpenAICompatibleLLMProvider(config.llm.base_url, config.llm.model, config.llm.api_key);
  return { embedding, reranker, llm };
}

// main.ts
var VaultSearchPlugin = class extends import_obsidian4.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.lastMarkdownView = null;
  }
  async onload() {
    await this.loadSettings();
    this.indexLoader = new IndexLoader(this.app);
    this.indexLoader.setConfig({ model: this.settings.embeddingModel, baseUrl: this.settings.embeddingBaseUrl });
    this.rebuildProviders();
    this.registerView(VIEW_TYPE, (leaf) => new VaultSearchView(leaf, this));
    this.addRibbonIcon("search", "Vault Search", () => this.activateView());
    this.addCommand({ id: "open-vault-search", name: "\u6253\u5F00 Vault Search", callback: () => this.activateView() });
    this.addSettingTab(new VaultSearchSettingTab(this.app, this));
    this.registerEvent(this.app.workspace.on("active-leaf-change", (leaf) => {
      if ((leaf == null ? void 0 : leaf.view) instanceof import_obsidian4.MarkdownView)
        this.lastMarkdownView = leaf.view;
    }));
    await this.indexLoader.load();
    this.indexLoader.watchAndReload(() => {
    });
  }
  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }
  async activateView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
    }
    workspace.revealLeaf(leaf);
  }
  async runIndex(mode, onProgress) {
    const { Indexer: Indexer2 } = await Promise.resolve().then(() => (init_Indexer(), Indexer_exports));
    const indexer = new Indexer2(this.app, this.providers.embedding, this.settings.embeddingModel, this.settings.embeddingBaseUrl);
    if (mode === "full")
      await indexer.buildFull(onProgress);
    else
      await indexer.buildIncremental(onProgress);
    await this.indexLoader.load();
    this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach((leaf) => {
      if (leaf.view instanceof VaultSearchView)
        leaf.view.refresh();
    });
  }
  async runIndexSingleFile(file) {
    const { Indexer: Indexer2 } = await Promise.resolve().then(() => (init_Indexer(), Indexer_exports));
    const indexer = new Indexer2(this.app, this.providers.embedding, this.settings.embeddingModel, this.settings.embeddingBaseUrl);
    await indexer.buildSingleFile(file);
    await this.indexLoader.load();
    this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach((leaf) => {
      if (leaf.view instanceof VaultSearchView)
        leaf.view.refresh();
    });
  }
  rebuildProviders() {
    const config = {
      embedding: { base_url: this.settings.embeddingBaseUrl, model: this.settings.embeddingModel, api_key: this.settings.embeddingApiKey },
      reranker: { enabled: this.settings.rerankerEnabled, base_url: this.settings.rerankerBaseUrl, model: this.settings.rerankerModel, api_key: this.settings.rerankerApiKey, recall_top_k: this.settings.rerankerRecallTopK, final_top_k: this.settings.rerankerFinalTopK },
      llm: { provider: this.settings.llmProvider, base_url: this.settings.llmBaseUrl, model: this.settings.llmModel, api_key: this.settings.llmApiKey }
    };
    this.providers = buildProviders(config);
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
    this.rebuildProviders();
    this.indexLoader.setConfig({ model: this.settings.embeddingModel, baseUrl: this.settings.embeddingBaseUrl });
    this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach((leaf) => {
      if (leaf.view instanceof VaultSearchView)
        leaf.view.refresh();
    });
  }
};
