import { ItemView, WorkspaceLeaf, TFile, MarkdownView, Notice } from "obsidian";
import { EditorView } from "@codemirror/view";
import type VaultSearchPlugin from "./main";
import { semanticSearch, findRelatedNotes, askVault } from "./pipeline";
import { t } from "./i18n";

export const VIEW_TYPE = "vault-search-view";

type TabId = "search" | "ask" | "related";

export class VaultSearchView extends ItemView {
  private tab: TabId = "search";
  private tabBtns: Partial<Record<TabId, HTMLElement>> = {};
  private tabBodies: Partial<Record<TabId, HTMLElement>> = {};
  private staleBannerEl: HTMLElement | null = null;

  constructor(leaf: WorkspaceLeaf, private plugin: VaultSearchPlugin) { super(leaf); }
  getViewType() { return VIEW_TYPE; }
  getDisplayText() { return "Vault Search"; }
  getIcon() { return "search"; }

  async onOpen() {
    this.render();
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        if (this.tab === "related") this.refreshRelated();
      })
    );
  }

  refresh() {
    this.updateStaleBanner();
    if (this.tab === "related") this.refreshRelated();
  }

  // ---------- Layout ----------

  private render() {
    const { contentEl } = this;
    contentEl.empty();

    // Stale banner (always present, hidden when not stale)
    this.staleBannerEl = contentEl.createDiv({ cls: "vs-stale-banner" });
    this.updateStaleBanner();

    // Tab bar
    const bar = contentEl.createDiv({ cls: "vs-tabs" });
    const tabIds: TabId[] = ["search", "ask", "related"];
    for (const id of tabIds) {
      const btn = bar.createEl("button", {
        text: t(`tab.${id}`),
        cls: `vs-tab${this.tab === id ? " active" : ""}`,
      });
      btn.onclick = () => this.switchTab(id);
      this.tabBtns[id] = btn;
    }

    // Body wrapper — one div per tab, show/hide
    const wrapper = contentEl.createDiv({ cls: "vs-body-wrapper" });
    for (const id of tabIds) {
      const body = wrapper.createDiv({ cls: "vs-body" });
      body.style.display = this.tab === id ? "" : "none";
      this.tabBodies[id] = body;
    }

    // Init each tab's content
    this.renderSearch(this.tabBodies.search!);
    this.renderAsk(this.tabBodies.ask!);
    this.renderRelated(this.tabBodies.related!);
  }

  private switchTab(id: TabId) {
    this.tab = id;
    for (const [k, btn] of Object.entries(this.tabBtns)) {
      btn?.classList.toggle("active", k === id);
    }
    for (const [k, body] of Object.entries(this.tabBodies)) {
      if (body) body.style.display = k === id ? "" : "none";
    }
    if (id === "related") this.refreshRelated();
  }

  private updateStaleBanner() {
    if (!this.staleBannerEl) return;
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

  private renderSearch(el: HTMLElement) {
    const input = el.createEl("input", {
      type: "text",
      placeholder: t("search.placeholder"),
      cls: "vs-input",
    });
    const results = el.createDiv({ cls: "vs-results" });
    let timer: ReturnType<typeof setTimeout>;
    input.oninput = () => {
      clearTimeout(timer);
      timer = setTimeout(() => this.doSearch(input.value, results), 300);
    };
    input.focus();
  }

  private async doSearch(query: string, el: HTMLElement) {
    if (!query.trim()) { el.empty(); return; }
    const index = this.plugin.indexLoader.getIndex();
    if (!index) { el.setText(t("search.indexNotLoaded")); return; }
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
      if (!results.length) { el.setText(t("search.noResults")); return; }
      results.forEach(r => {
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
    } catch (e: any) {
      el.setText(t("search.errorPrefix") + e.message);
    }
  }

  // ---------- Ask Tab ----------

  private renderAsk(el: HTMLElement) {
    const ta = el.createEl("textarea", {
      placeholder: t("ask.placeholder"),
      cls: "vs-textarea",
    });
    const btn = el.createEl("button", { text: t("ask.submit"), cls: "vs-btn" });
    const ans = el.createDiv({ cls: "vs-answer" });
    const run = () => this.doAsk(ta.value, ans);
    btn.onclick = run;
    ta.onkeydown = e => { if (e.key === "Enter" && e.metaKey) run(); };
  }

  private async doAsk(question: string, el: HTMLElement) {
    if (!question.trim()) return;
    const index = this.plugin.indexLoader.getIndex();
    if (!index) { el.setText(t("ask.indexNotLoaded")); return; }
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
        chunk => { full += chunk; ansEl.setText(full); }
      );
      if (result.sources.length) {
        const src = el.createDiv({ cls: "vs-sources" });
        src.createEl("div", { text: t("ask.sourcesLabel"), cls: "vs-src-label" });
        result.sources.forEach((s, i) => {
          const l = src.createEl("div", { text: `[${i + 1}] ${s.title}`, cls: "vs-src-link" });
          l.onclick = () => this.openNoteAtLine(s.path, 0);
        });
      }
    } catch (e: any) {
      ansEl.setText(t("ask.errorPrefix") + e.message);
    }
  }

  // ---------- Related Tab ----------

  private renderRelated(el: HTMLElement) {
    el.empty();
    const active = this.app.workspace.getActiveFile();
    if (!active) { el.setText(t("related.noActiveNote")); return; }
    const index = this.plugin.indexLoader.getIndex();
    if (!index) { el.setText(t("related.indexNotLoaded")); return; }

    const curChunks = index.chunks.filter(c => c.path === active.path);
    if (curChunks.length === 0) { el.setText(t("related.notInIndex")); return; }
    const curChunk = curChunks[0];

    el.setText(t("related.loading"));

    // Use actual chunk text (up to 4 chunks) so notes without frontmatter summary still produce a rich query
    const noteBodyText = curChunks.slice(0, 4).map(c => c.text).join("\n\n").slice(0, 500);

    findRelatedNotes(
      curChunk.title,
      noteBodyText,
      curChunk.tags,
      active.path,
      index.chunks,
      this.plugin.providers.embedding,
      this.plugin.providers.reranker,
      { recallTopK: 40, finalTopK: 5, minScore: this.plugin.settings.minScore }
    ).then(async results => {
      // filter out already-linked notes
      let linkedTitles = new Set<string>();
      try {
        const content = await this.app.vault.read(active);
        const re = /\[\[([^\]|#]+)/g;
        let m;
        while ((m = re.exec(content)) !== null) {
          linkedTitles.add(m[1].trim().toLowerCase());
        }
      } catch { /* if read fails, skip dedup */ }

      const unlinked = results.filter(
        r => !linkedTitles.has(r.title.trim().toLowerCase())
      );

      el.empty();
      el.createEl("div", {
        text: t("related.titlePrefix") + curChunk.title + t("related.titleSuffix"),
        cls: "vs-rel-title",
      });

      if (unlinked.length === 0) {
        el.createEl("div", { text: t("related.allLinked"), cls: "vs-empty" });
        return;
      }

      unlinked.forEach(r => {
        const item = el.createDiv({ cls: "vs-item" });
        const row = item.createDiv({ cls: "vs-title-row" });
        row.createEl("div", { text: r.title, cls: "vs-title" });
        row.createEl("div", { text: `${(r.score * 100).toFixed(1)}%`, cls: "vs-score" });
        if (r.summary) item.createEl("div", { text: r.summary, cls: "vs-summary" });
        const insBtn = item.createEl("button", { text: t("related.insertLink"), cls: "vs-ins-btn" });
        insBtn.onclick = e => { e.stopPropagation(); this.insertWikilink(r.title); };
        item.onclick = () => this.openNoteAtLine(r.path, 0);
      });
    }).catch((e: any) => el.setText(t("related.errorPrefix") + e.message));
  }

  private refreshRelated() {
    const body = this.tabBodies.related;
    if (body) this.renderRelated(body);
  }

  // ---------- Helpers ----------

  private async openNoteAtLine(path: string, startLine: number) {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) return;
    const leaf = this.app.workspace.getLeaf();
    await leaf.openFile(file);
    const view = leaf.view;
    if (!(view instanceof MarkdownView)) return;
    const cm = (view.editor as any).cm as EditorView;
    // CM6 lines are 1-based; clamp to valid document range
    const lineNum = Math.min(Math.max(startLine + 1, 1), cm.state.doc.lines);
    const line = cm.state.doc.line(lineNum);
    cm.dispatch({
      selection: { anchor: line.from, head: line.to },
      // Place the target line near the top of the viewport (80px from top)
      effects: EditorView.scrollIntoView(line.from, { y: "start", yMargin: 80 }),
    });
  }

  private insertWikilink(title: string) {
    const view = this.plugin.lastMarkdownView;
    if (view?.editor) {
      const content = view.editor.getValue();
      if (content.includes(`[[${title}]]`)) {
        new Notice(`[[${title}]] 已存在`);
        return;
      }
      view.editor.replaceSelection(`[[${title}]]`);
    } else {
      navigator.clipboard.writeText(`[[${title}]]`);
      new Notice(`已复制 [[${title}]] 到剪贴板`);
    }
  }
}

function highlightTerms(container: HTMLElement, text: string, query: string): void {
  const terms = query.trim().split(/\s+/).filter(t => t.length > 1);
  if (terms.length === 0) { container.textContent = text; return; }
  const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
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
