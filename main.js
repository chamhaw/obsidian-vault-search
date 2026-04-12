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

// Indexer.ts
var Indexer_exports = {};
__export(Indexer_exports, {
  Indexer: () => Indexer
});
function parseFrontmatter(content) {
  if (!content.startsWith("---"))
    return { meta: {}, body: content };
  const end = content.indexOf("\n---", 3);
  if (end === -1)
    return { meta: {}, body: content };
  const yaml = content.slice(4, end);
  const body = content.slice(end + 4).trimStart();
  const meta = {};
  for (const line of yaml.split("\n")) {
    const m = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (!m)
      continue;
    const val = m[2].trim();
    if (val.startsWith("[")) {
      try {
        meta[m[1]] = JSON.parse(val.replace(/'/g, '"'));
      } catch (e) {
        meta[m[1]] = val;
      }
    } else {
      meta[m[1]] = val.replace(/^['"]|['"]$/g, "");
    }
  }
  return { meta, body };
}
function extractEmbedText(meta, body) {
  const parts = [];
  if (meta.title)
    parts.push(meta.title);
  if (meta.summary)
    parts.push(meta.summary);
  if (meta.tags) {
    const tags = Array.isArray(meta.tags) ? meta.tags : [meta.tags];
    parts.push(tags.join(" "));
  }
  parts.push(body.slice(0, TEXT_LIMIT));
  return parts.join("\n");
}
var import_obsidian4, SKIP_DIRS, BATCH_SIZE, TEXT_LIMIT, Indexer;
var init_Indexer = __esm({
  "Indexer.ts"() {
    import_obsidian4 = require("obsidian");
    SKIP_DIRS = /* @__PURE__ */ new Set([".obsidian", "\u5BC6\u7801", "_templates", ".search_index", "04-projects", "node_modules", ".smart-env"]);
    BATCH_SIZE = 8;
    TEXT_LIMIT = 300;
    Indexer = class {
      constructor(app, embedding, model) {
        this.app = app;
        this.embedding = embedding;
        this.model = model;
      }
      async buildFull(onProgress) {
        const files = this.getVaultFiles();
        const notes = await this.embedFiles(files, {}, onProgress);
        await this.writeIndex(notes);
        new import_obsidian4.Notice(`\u2713 \u7D22\u5F15\u6784\u5EFA\u5B8C\u6210\uFF0C\u5171 ${notes.length} \u7BC7\u7B14\u8BB0`);
      }
      async buildIncremental(onProgress) {
        const existing = await this.loadExisting();
        const files = this.getVaultFiles();
        const changed = files.filter((f) => {
          const prev = existing[f.path];
          return !prev || prev.mtime !== f.stat.mtime;
        });
        if (changed.length === 0) {
          new import_obsidian4.Notice("\u7D22\u5F15\u5DF2\u662F\u6700\u65B0\uFF0C\u65E0\u9700\u66F4\u65B0");
          return;
        }
        const updated = await this.embedFiles(changed, existing, onProgress);
        const unchangedPaths = new Set(files.filter((f) => existing[f.path] && existing[f.path].mtime === f.stat.mtime).map((f) => f.path));
        const unchanged = Object.values(existing).filter((n) => unchangedPaths.has(n.path));
        await this.writeIndex([...unchanged, ...updated]);
        new import_obsidian4.Notice(`\u2713 \u589E\u91CF\u66F4\u65B0\u5B8C\u6210\uFF0C\u66F4\u65B0 ${updated.length} \u7BC7\u7B14\u8BB0`);
      }
      getVaultFiles() {
        return this.app.vault.getMarkdownFiles().filter((f) => {
          const topDir = f.path.split("/")[0];
          return !SKIP_DIRS.has(topDir);
        });
      }
      async loadExisting() {
        try {
          const content = await this.app.vault.adapter.read(".search_index/index.json");
          const idx = JSON.parse(content);
          return Object.fromEntries(idx.notes.map((n) => [n.path, n]));
        } catch (e) {
          return {};
        }
      }
      async embedFiles(files, existing, onProgress) {
        const results = [];
        for (let i = 0; i < files.length; i += BATCH_SIZE) {
          const batch = files.slice(i, i + BATCH_SIZE);
          const contents = await Promise.all(batch.map((f) => this.app.vault.read(f)));
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
              tags: Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : [],
              mtime: f.stat.mtime,
              embedding: embeddings[j]
            });
          });
          onProgress(Math.min(i + BATCH_SIZE, files.length), files.length);
        }
        return results;
      }
      async writeIndex(notes) {
        var _a, _b;
        const dims = (_b = (_a = notes[0]) == null ? void 0 : _a.embedding.length) != null ? _b : 0;
        const index = {
          version: 1,
          updated_at: (/* @__PURE__ */ new Date()).toISOString(),
          embedding_model: this.model,
          embedding_dims: dims,
          notes
        };
        const json = JSON.stringify(index);
        try {
          await this.app.vault.adapter.mkdir(".search_index");
        } catch (e) {
        }
        await this.app.vault.adapter.write(".search_index/index.json", json);
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
var import_obsidian5 = require("obsidian");

// SettingsTab.ts
var import_obsidian = require("obsidian");
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
  llmApiKey: ""
};
var VaultSearchSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    const addText = (label, get, set, password = false) => new import_obsidian.Setting(containerEl).setName(label).addText((t) => {
      if (password)
        t.inputEl.type = "password";
      t.setValue(get()).onChange(async (v) => {
        set(v);
        await this.plugin.saveSettings();
      });
    });
    containerEl.createEl("h2", { text: "Embedding" });
    addText("Base URL", () => this.plugin.settings.embeddingBaseUrl, (v) => this.plugin.settings.embeddingBaseUrl = v);
    addText("\u6A21\u578B", () => this.plugin.settings.embeddingModel, (v) => this.plugin.settings.embeddingModel = v);
    addText("API Key", () => this.plugin.settings.embeddingApiKey, (v) => this.plugin.settings.embeddingApiKey = v, true);
    containerEl.createEl("h2", { text: "Reranker" });
    new import_obsidian.Setting(containerEl).setName("\u542F\u7528 Reranker").addToggle((t) => t.setValue(this.plugin.settings.rerankerEnabled).onChange(async (v) => {
      this.plugin.settings.rerankerEnabled = v;
      await this.plugin.saveSettings();
    }));
    addText("Reranker Base URL", () => this.plugin.settings.rerankerBaseUrl, (v) => this.plugin.settings.rerankerBaseUrl = v);
    addText("Reranker \u6A21\u578B", () => this.plugin.settings.rerankerModel, (v) => this.plugin.settings.rerankerModel = v);
    addText("Reranker API Key", () => this.plugin.settings.rerankerApiKey, (v) => this.plugin.settings.rerankerApiKey = v, true);
    containerEl.createEl("h2", { text: "LLM" });
    new import_obsidian.Setting(containerEl).setName("Provider").addDropdown((d) => d.addOption("anthropic", "Anthropic Claude").addOption("openai-compatible", "OpenAI Compatible").setValue(this.plugin.settings.llmProvider).onChange(async (v) => {
      this.plugin.settings.llmProvider = v;
      await this.plugin.saveSettings();
    }));
    addText("LLM Base URL", () => this.plugin.settings.llmBaseUrl, (v) => this.plugin.settings.llmBaseUrl = v);
    addText("LLM \u6A21\u578B", () => this.plugin.settings.llmModel, (v) => this.plugin.settings.llmModel = v);
    addText("LLM API Key", () => this.plugin.settings.llmApiKey, (v) => this.plugin.settings.llmApiKey = v, true);
    containerEl.createEl("h2", { text: "\u7D22\u5F15\u7BA1\u7406" });
    containerEl.createEl("p", { text: `\u7D22\u5F15\u4F4D\u7F6E\uFF1Avault\u6839\u76EE\u5F55/.search_index/index.json`, cls: "setting-item-description" });
    let progressEl = null;
    new import_obsidian.Setting(containerEl).setName("\u5168\u91CF\u6784\u5EFA\u7D22\u5F15").setDesc("\u904D\u5386\u6240\u6709\u7B14\u8BB0\u91CD\u65B0\u751F\u6210\u5411\u91CF\u7D22\u5F15\uFF08\u9996\u6B21\u4F7F\u7528\u6216\u6A21\u578B\u53D8\u66F4\u540E\u6267\u884C\uFF09").addButton((btn) => btn.setButtonText("Build Index").setCta().onClick(async () => {
      btn.setDisabled(true).setButtonText("\u6784\u5EFA\u4E2D...");
      if (!progressEl) {
        progressEl = containerEl.createEl("p", { cls: "setting-item-description" });
      }
      try {
        await this.plugin.runIndex("full", (cur, total) => {
          if (progressEl)
            progressEl.setText(`\u8FDB\u5EA6\uFF1A${cur} / ${total}`);
        });
      } finally {
        btn.setDisabled(false).setButtonText("Build Index");
        if (progressEl)
          progressEl.setText("\u5B8C\u6210");
      }
    }));
    new import_obsidian.Setting(containerEl).setName("\u589E\u91CF\u66F4\u65B0\u7D22\u5F15").setDesc("\u53EA\u66F4\u65B0\u6709\u53D8\u66F4\u7684\u7B14\u8BB0\uFF0C\u901F\u5EA6\u66F4\u5FEB").addButton((btn) => btn.setButtonText("Update Index").onClick(async () => {
      btn.setDisabled(true).setButtonText("\u66F4\u65B0\u4E2D...");
      if (!progressEl) {
        progressEl = containerEl.createEl("p", { cls: "setting-item-description" });
      }
      try {
        await this.plugin.runIndex("incremental", (cur, total) => {
          if (progressEl)
            progressEl.setText(`\u8FDB\u5EA6\uFF1A${cur} / ${total}`);
        });
      } finally {
        btn.setDisabled(false).setButtonText("Update Index");
        if (progressEl)
          progressEl.setText("\u5B8C\u6210");
      }
    }));
  }
};

// SearchView.ts
var import_obsidian2 = require("obsidian");

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
function embeddingRecall(queryVec, notes, topK) {
  return notes.map((note) => ({ note, score: cosineSimilarity(queryVec, note.embedding) })).sort((a, b) => b.score - a.score).slice(0, topK);
}

// pipeline.ts
async function semanticSearch(query, notes, embedding, reranker, config) {
  const [queryVec] = await embedding.embed([query]);
  const candidates = embeddingRecall(queryVec, notes, config.recallTopK);
  if (!reranker || candidates.length === 0)
    return candidates.slice(0, config.finalTopK);
  const docs = candidates.map((r) => `${r.note.title}
${r.note.summary}`);
  const scores = await reranker.rerank(query, docs);
  return candidates.map((r, i) => ({ ...r, score: scores[i] })).sort((a, b) => b.score - a.score).slice(0, config.finalTopK);
}
var BODY_CHAR_LIMIT = 2e3;
async function askVault(question, notes, embedding, reranker, llm, config, onChunk, readFile) {
  const results = await semanticSearch(question, notes, embedding, reranker, config);
  const contextParts = await Promise.all(results.map(async (r, i) => {
    var _a;
    let body = (_a = r.note.summary) != null ? _a : "";
    if (readFile) {
      try {
        const raw = await readFile(r.note.path);
        const stripped = raw.replace(/^---[\s\S]*?---\n?/, "").trim();
        body = stripped.length > BODY_CHAR_LIMIT ? stripped.slice(0, BODY_CHAR_LIMIT) + "\u2026" : stripped;
      } catch (e) {
      }
    }
    return `[${i + 1}] \u6807\u9898\uFF1A${r.note.title}
${body}`;
  }));
  const context = contextParts.join("\n\n---\n\n");
  const messages = [
    { role: "system", content: "\u4F60\u662F\u77E5\u8BC6\u5E93\u52A9\u624B\u3002\u4F60\u7684\u552F\u4E00\u4FE1\u606F\u6765\u6E90\u662F\u7528\u6237\u63D0\u4F9B\u7684\u7B14\u8BB0\u5185\u5BB9\uFF0C\u7981\u6B62\u4F7F\u7528\u4EFB\u4F55\u5916\u90E8\u77E5\u8BC6\u6216\u81EA\u884C\u63A8\u65AD\u8865\u5145\u3002\u56DE\u7B54\u65F6\u4E25\u683C\u5F15\u7528\u7B14\u8BB0\u539F\u6587\uFF0C\u7528 [\u5E8F\u53F7] \u6807\u6CE8\u6765\u6E90\u3002\u5982\u679C\u63D0\u4F9B\u7684\u7B14\u8BB0\u4E2D\u6CA1\u6709\u8DB3\u591F\u4FE1\u606F\u56DE\u7B54\u95EE\u9898\uFF0C\u5FC5\u987B\u660E\u786E\u56DE\u590D\uFF1A\u77E5\u8BC6\u5E93\u4E2D\u672A\u68C0\u7D22\u5230\u76F8\u5173\u5185\u5BB9\uFF0C\u4E0D\u5F97\u7F16\u9020\u6216\u63A8\u6D4B\u3002" },
    { role: "user", content: `\u77E5\u8BC6\u5E93\u5185\u5BB9\uFF1A

${context}

\u95EE\u9898\uFF1A${question}` }
  ];
  await llm.chat(messages, onChunk);
  return { answer: "", sources: results.map((r) => ({ title: r.note.title, path: r.note.path })) };
}

// SearchView.ts
var VIEW_TYPE = "vault-search-view";
var VaultSearchView = class extends import_obsidian2.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.tab = "search";
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
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => {
      if (this.tab === "related")
        this.renderBody();
    }));
  }
  render() {
    const { contentEl } = this;
    contentEl.empty();
    const bar = contentEl.createDiv({ cls: "vs-tabs" });
    ["search", "ask", "related"].forEach((id) => {
      const b = bar.createEl("button", { text: { search: "\u641C\u7D22", ask: "\u95EE\u7B54", related: "\u5173\u8054" }[id], cls: `vs-tab${this.tab === id ? " active" : ""}` });
      b.onclick = () => {
        this.tab = id;
        this.render();
      };
    });
    this.renderBody(contentEl.createDiv({ cls: "vs-body" }));
  }
  renderBody(el) {
    const body = el != null ? el : this.contentEl.querySelector(".vs-body");
    if (!el)
      body.empty();
    if (this.tab === "search")
      this.renderSearch(body);
    else if (this.tab === "ask")
      this.renderAsk(body);
    else
      this.renderRelated(body);
  }
  renderSearch(el) {
    const input = el.createEl("input", { type: "text", placeholder: "\u8BED\u4E49\u641C\u7D22...", cls: "vs-input" });
    const results = el.createDiv({ cls: "vs-results" });
    let t;
    input.oninput = () => {
      clearTimeout(t);
      t = setTimeout(() => this.doSearch(input.value, results), 300);
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
      el.setText("\u7D22\u5F15\u672A\u52A0\u8F7D");
      return;
    }
    el.setText("\u641C\u7D22\u4E2D...");
    try {
      const results = await semanticSearch(query, index.notes, this.plugin.providers.embedding, this.plugin.providers.reranker, { recallTopK: this.plugin.settings.rerankerRecallTopK, finalTopK: this.plugin.settings.rerankerFinalTopK });
      el.empty();
      if (!results.length) {
        el.setText("\u65E0\u7ED3\u679C");
        return;
      }
      results.forEach((r) => {
        const item = el.createDiv({ cls: "vs-item" });
        const row = item.createDiv({ cls: "vs-title-row" });
        row.createEl("div", { text: r.note.title, cls: "vs-title" });
        row.createEl("div", { text: `${(r.score * 100).toFixed(1)}%`, cls: "vs-score" });
        if (r.note.summary)
          item.createEl("div", { text: r.note.summary, cls: "vs-summary" });
        item.onclick = () => this.openNote(r.note.path);
      });
    } catch (e) {
      el.setText(`\u9519\u8BEF: ${e.message}`);
    }
  }
  renderAsk(el) {
    const ta = el.createEl("textarea", { placeholder: "\u5411\u77E5\u8BC6\u5E93\u63D0\u95EE...", cls: "vs-textarea" });
    const btn = el.createEl("button", { text: "\u63D0\u95EE", cls: "vs-btn" });
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
      el.setText("\u7D22\u5F15\u672A\u52A0\u8F7D");
      return;
    }
    el.empty();
    const ansEl = el.createDiv({ cls: "vs-ans-text" });
    ansEl.setText("\u601D\u8003\u4E2D...");
    let full = "";
    try {
      const readFile = (path) => this.app.vault.adapter.read(path);
      const result = await askVault(question, index.notes, this.plugin.providers.embedding, this.plugin.providers.reranker, this.plugin.providers.llm, { recallTopK: this.plugin.settings.rerankerRecallTopK, finalTopK: this.plugin.settings.rerankerFinalTopK }, (chunk) => {
        full += chunk;
        ansEl.setText(full);
      }, readFile);
      if (result.sources.length) {
        const src = el.createDiv({ cls: "vs-sources" });
        src.createEl("div", { text: "\u53C2\u8003\u6765\u6E90\uFF1A", cls: "vs-src-label" });
        result.sources.forEach((s, i) => {
          const l = src.createEl("div", { text: `[${i + 1}] ${s.title}`, cls: "vs-src-link" });
          l.onclick = () => this.openNote(s.path);
        });
      }
    } catch (e) {
      ansEl.setText(`\u9519\u8BEF: ${e.message}`);
    }
  }
  renderRelated(el) {
    const active = this.app.workspace.getActiveFile();
    if (!active) {
      el.setText("\u8BF7\u6253\u5F00\u4E00\u7BC7\u7B14\u8BB0");
      return;
    }
    const index = this.plugin.indexLoader.getIndex();
    if (!index) {
      el.setText("\u7D22\u5F15\u672A\u52A0\u8F7D");
      return;
    }
    const cur = index.notes.find((n) => n.path === active.path);
    if (!cur) {
      el.setText("\u5F53\u524D\u7B14\u8BB0\u4E0D\u5728\u7D22\u5F15\u4E2D\uFF0C\u8BF7\u91CD\u5EFA\u7D22\u5F15");
      return;
    }
    el.setText("\u52A0\u8F7D\u4E2D...");
    const query = `${cur.title}
${cur.summary}
${cur.tags.join(" ")}`;
    semanticSearch(query, index.notes.filter((n) => n.path !== active.path), this.plugin.providers.embedding, this.plugin.providers.reranker, { recallTopK: 20, finalTopK: 5 }).then((results) => {
      el.empty();
      el.createEl("div", { text: `\u4E0E\u300C${cur.title}\u300D\u76F8\u5173\uFF1A`, cls: "vs-rel-title" });
      results.forEach((r) => {
        const item = el.createDiv({ cls: "vs-item" });
        item.createEl("div", { text: r.note.title, cls: "vs-title" });
        if (r.note.summary)
          item.createEl("div", { text: r.note.summary, cls: "vs-summary" });
        const insBtn = item.createEl("button", { text: "\u63D2\u5165\u94FE\u63A5", cls: "vs-ins-btn" });
        insBtn.onclick = (e) => {
          e.stopPropagation();
          this.insertWikilink(r.note.title);
        };
        item.onclick = () => this.openNote(r.note.path);
      });
    }).catch((e) => el.setText(`\u9519\u8BEF: ${e.message}`));
  }
  async openNote(path) {
    const f = this.app.vault.getAbstractFileByPath(path);
    if (f instanceof import_obsidian2.TFile)
      await this.app.workspace.getLeaf().openFile(f);
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

// IndexLoader.ts
var import_obsidian3 = require("obsidian");
var IndexLoader = class {
  constructor(app) {
    this.app = app;
    this.index = null;
    this.configuredModel = "";
  }
  setConfiguredModel(model) {
    this.configuredModel = model;
  }
  async load() {
    try {
      const content = await this.app.vault.adapter.read(".search_index/index.json");
      const parsed = JSON.parse(content);
      if (this.configuredModel && parsed.embedding_model !== this.configuredModel)
        new import_obsidian3.Notice(`\u26A0\uFE0F \u7D22\u5F15\u6A21\u578B (${parsed.embedding_model}) \u4E0E\u914D\u7F6E\u6A21\u578B (${this.configuredModel}) \u4E0D\u4E00\u81F4\uFF0C\u8BF7\u91CD\u5EFA\u7D22\u5F15`, 1e4);
      this.index = parsed;
      return parsed;
    } catch (e) {
      new import_obsidian3.Notice("\u672A\u627E\u5230 .search_index/index.json\uFF0C\u8BF7\u5148\u8FD0\u884C indexer");
      return null;
    }
  }
  getIndex() {
    return this.index;
  }
  watchAndReload(_onReload) {
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
var VaultSearchPlugin = class extends import_obsidian5.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.lastMarkdownView = null;
  }
  async onload() {
    await this.loadSettings();
    this.indexLoader = new IndexLoader(this.app);
    this.indexLoader.setConfiguredModel(this.settings.embeddingModel);
    this.rebuildProviders();
    this.registerView(VIEW_TYPE, (leaf) => new VaultSearchView(leaf, this));
    this.addRibbonIcon("search", "Vault Search", () => this.activateView());
    this.addCommand({ id: "open-vault-search", name: "\u6253\u5F00 Vault Search", callback: () => this.activateView() });
    this.addSettingTab(new VaultSearchSettingTab(this.app, this));
    this.registerEvent(this.app.workspace.on("active-leaf-change", (leaf) => {
      if ((leaf == null ? void 0 : leaf.view) instanceof import_obsidian5.MarkdownView)
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
    const indexer = new Indexer2(this.app, this.providers.embedding, this.settings.embeddingModel);
    if (mode === "full")
      await indexer.buildFull(onProgress);
    else
      await indexer.buildIncremental(onProgress);
    await this.indexLoader.load();
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
  }
};
