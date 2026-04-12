import { Plugin, MarkdownView } from "obsidian";
import { VaultSearchSettingTab, VaultSearchSettings, DEFAULT_SETTINGS } from "./SettingsTab";
import { VaultSearchView, VIEW_TYPE } from "./SearchView";
import { IndexLoader } from "./IndexLoader";
import { buildProviders } from "./providers";
import type { EmbeddingProvider, RerankProvider, LLMProvider, PluginConfig } from "./providers/types";

export default class VaultSearchPlugin extends Plugin {
  settings: VaultSearchSettings = DEFAULT_SETTINGS;
  indexLoader!: IndexLoader;
  providers!: { embedding: EmbeddingProvider; reranker: RerankProvider | null; llm: LLMProvider };
  lastMarkdownView: MarkdownView | null = null;

  async onload() {
    await this.loadSettings();
    this.indexLoader = new IndexLoader(this.app);
    this.indexLoader.setConfig({ model: this.settings.embeddingModel, baseUrl: this.settings.embeddingBaseUrl });
    this.rebuildProviders();
    this.registerView(VIEW_TYPE, leaf => new VaultSearchView(leaf, this));
    this.addRibbonIcon("search", "Vault Search", () => this.activateView());
    this.addCommand({ id: "open-vault-search", name: "打开 Vault Search", callback: () => this.activateView() });
    this.addSettingTab(new VaultSearchSettingTab(this.app, this));
    this.registerEvent(this.app.workspace.on("active-leaf-change", leaf => {
      if (leaf?.view instanceof MarkdownView) this.lastMarkdownView = leaf.view;
    }));
    await this.indexLoader.load();
    this.indexLoader.watchAndReload(() => {});
  }

  onunload() { this.app.workspace.detachLeavesOfType(VIEW_TYPE); }

  async activateView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];
    if (!leaf) { leaf = workspace.getRightLeaf(false)!; await leaf.setViewState({ type: VIEW_TYPE, active: true }); }
    workspace.revealLeaf(leaf);
  }

  async runIndex(mode: "full" | "incremental", onProgress: (cur: number, total: number) => void) {
    const { Indexer } = await import("./Indexer");
    const indexer = new Indexer(this.app, this.providers.embedding, this.settings.embeddingModel, this.settings.embeddingBaseUrl);
    if (mode === "full") await indexer.buildFull(onProgress);
    else await indexer.buildIncremental(onProgress);
    await this.indexLoader.load();
    this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach(leaf => {
      if (leaf.view instanceof VaultSearchView) (leaf.view as VaultSearchView).refresh();
    });
  }

  rebuildProviders() {
    const config: PluginConfig = {
      embedding: { base_url: this.settings.embeddingBaseUrl, model: this.settings.embeddingModel, api_key: this.settings.embeddingApiKey },
      reranker: { enabled: this.settings.rerankerEnabled, base_url: this.settings.rerankerBaseUrl, model: this.settings.rerankerModel, api_key: this.settings.rerankerApiKey, recall_top_k: this.settings.rerankerRecallTopK, final_top_k: this.settings.rerankerFinalTopK },
      llm: { provider: this.settings.llmProvider, base_url: this.settings.llmBaseUrl, model: this.settings.llmModel, api_key: this.settings.llmApiKey },
    };
    this.providers = buildProviders(config);
  }

  async loadSettings() { this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()); }
  async saveSettings() {
    await this.saveData(this.settings);
    this.rebuildProviders();
    this.indexLoader.setConfig({ model: this.settings.embeddingModel, baseUrl: this.settings.embeddingBaseUrl });
    this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach(leaf => {
      if (leaf.view instanceof VaultSearchView) (leaf.view as VaultSearchView).refresh();
    });
  }
}
