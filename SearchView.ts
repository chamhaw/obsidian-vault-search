import { ItemView, WorkspaceLeaf, TFile, MarkdownView } from "obsidian";
import type VaultSearchPlugin from "./main";
import { semanticSearch, askVault } from "./pipeline";

export const VIEW_TYPE = "vault-search-view";

export class VaultSearchView extends ItemView {
  private tab: "search" | "ask" | "related" = "search";
  constructor(leaf: WorkspaceLeaf, private plugin: VaultSearchPlugin) { super(leaf); }
  getViewType() { return VIEW_TYPE; }
  getDisplayText() { return "Vault Search"; }
  getIcon() { return "search"; }

  async onOpen() {
    this.render();
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => { if (this.tab === "related") this.renderBody(); }));
  }

  private render() {
    const { contentEl } = this;
    contentEl.empty();
    const bar = contentEl.createDiv({ cls: "vs-tabs" });
    (["search", "ask", "related"] as const).forEach(id => {
      const b = bar.createEl("button", { text: {search:"搜索",ask:"问答",related:"关联"}[id], cls: `vs-tab${this.tab===id?" active":""}` });
      b.onclick = () => { this.tab = id; this.render(); };
    });
    this.renderBody(contentEl.createDiv({ cls: "vs-body" }));
  }

  private renderBody(el?: HTMLElement) {
    const body = el ?? this.contentEl.querySelector(".vs-body") as HTMLElement;
    if (!el) body.empty();
    if (this.tab === "search") this.renderSearch(body);
    else if (this.tab === "ask") this.renderAsk(body);
    else this.renderRelated(body);
  }

  private renderSearch(el: HTMLElement) {
    const input = el.createEl("input", { type: "text", placeholder: "语义搜索...", cls: "vs-input" });
    const results = el.createDiv({ cls: "vs-results" });
    let t: ReturnType<typeof setTimeout>;
    input.oninput = () => { clearTimeout(t); t = setTimeout(() => this.doSearch(input.value, results), 300); };
    input.focus();
  }

  private async doSearch(query: string, el: HTMLElement) {
    if (!query.trim()) { el.empty(); return; }
    const index = this.plugin.indexLoader.getIndex();
    if (!index) { el.setText("索引未加载"); return; }
    el.setText("搜索中...");
    try {
      const results = await semanticSearch(query, index.notes, this.plugin.providers.embedding, this.plugin.providers.reranker, { recallTopK: this.plugin.settings.rerankerRecallTopK, finalTopK: this.plugin.settings.rerankerFinalTopK });
      el.empty();
      if (!results.length) { el.setText("无结果"); return; }
      results.forEach(r => {
        const item = el.createDiv({ cls: "vs-item" });
        item.createEl("div", { text: r.note.title, cls: "vs-title" });
        item.createEl("div", { text: r.note.summary, cls: "vs-summary" });
        item.createEl("div", { text: `${(r.score*100).toFixed(1)}%`, cls: "vs-score" });
        item.onclick = () => this.openNote(r.note.path);
      });
    } catch(e: any) { el.setText(`错误: ${e.message}`); }
  }

  private renderAsk(el: HTMLElement) {
    const ta = el.createEl("textarea", { placeholder: "向知识库提问...", cls: "vs-textarea" });
    const btn = el.createEl("button", { text: "提问", cls: "vs-btn" });
    const ans = el.createDiv({ cls: "vs-answer" });
    const run = () => this.doAsk(ta.value, ans);
    btn.onclick = run;
    ta.onkeydown = e => { if (e.key === "Enter" && e.metaKey) run(); };
  }

  private async doAsk(question: string, el: HTMLElement) {
    if (!question.trim()) return;
    const index = this.plugin.indexLoader.getIndex();
    if (!index) { el.setText("索引未加载"); return; }
    el.empty();
    const ansEl = el.createDiv({ cls: "vs-ans-text" });
    ansEl.setText("思考中...");
    let full = "";
    try {
      const result = await askVault(question, index.notes, this.plugin.providers.embedding, this.plugin.providers.reranker, this.plugin.providers.llm, { recallTopK: this.plugin.settings.rerankerRecallTopK, finalTopK: this.plugin.settings.rerankerFinalTopK }, chunk => { full += chunk; ansEl.setText(full); });
      if (result.sources.length) {
        const src = el.createDiv({ cls: "vs-sources" });
        src.createEl("div", { text: "参考来源：", cls: "vs-src-label" });
        result.sources.forEach((s, i) => { const l = src.createEl("div", { text: `[${i+1}] ${s.title}`, cls: "vs-src-link" }); l.onclick = () => this.openNote(s.path); });
      }
    } catch(e: any) { ansEl.setText(`错误: ${e.message}`); }
  }

  private renderRelated(el: HTMLElement) {
    const active = this.app.workspace.getActiveFile();
    if (!active) { el.setText("请打开一篇笔记"); return; }
    const index = this.plugin.indexLoader.getIndex();
    if (!index) { el.setText("索引未加载"); return; }
    const cur = index.notes.find(n => n.path === active.path);
    if (!cur) { el.setText("当前笔记不在索引中，请重建索引"); return; }
    el.setText("加载中...");
    const query = `${cur.title}\n${cur.summary}\n${cur.tags.join(" ")}`;
    semanticSearch(query, index.notes.filter(n => n.path !== active.path), this.plugin.providers.embedding, this.plugin.providers.reranker, { recallTopK: 20, finalTopK: 5 })
      .then(results => {
        el.empty();
        el.createEl("div", { text: `与「${cur.title}」相关：`, cls: "vs-rel-title" });
        results.forEach(r => {
          const item = el.createDiv({ cls: "vs-item" });
          item.createEl("div", { text: r.note.title, cls: "vs-title" });
          item.createEl("div", { text: r.note.summary, cls: "vs-summary" });
          const insBtn = item.createEl("button", { text: "插入链接", cls: "vs-ins-btn" });
          insBtn.onclick = e => { e.stopPropagation(); this.insertWikilink(r.note.title); };
          item.onclick = () => this.openNote(r.note.path);
        });
      }).catch((e: any) => el.setText(`错误: ${e.message}`));
  }

  private async openNote(path: string) {
    const f = this.app.vault.getAbstractFileByPath(path);
    if (f instanceof TFile) await this.app.workspace.getLeaf().openFile(f);
  }

  private insertWikilink(title: string) {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (view) view.editor.replaceSelection(`[[${title}]]`);
  }
}
