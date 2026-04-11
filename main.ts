import { Plugin } from "obsidian";
import { VaultSearchSettingTab, VaultSearchSettings, DEFAULT_SETTINGS } from "./SettingsTab";
import { VaultSearchView, VIEW_TYPE } from "./SearchView";
import { IndexLoader } from "./IndexLoader";
import { buildProviders } from "./providers";
import type { EmbeddingProvider, RerankProvider, LLMProvider, PluginConfig } from "./providers/types";

export default class VaultSearchPlugin extends Plugin {
  settings: VaultSearchSettings = DEFAULT_SETTINGS;
  indexLoader!: IndexLoader;
  providers!: { embedding: EmbeddingProvider; reranker: RerankProvider | null; llm: LLMProvider };

  async onload() {
    await this.loadSettings();
    this.indexLoader = new IndexLoader(this.app);
    this.indexLoader.setConfiguredModel(this.settings.embeddingModel);
    this.rebuildProviders();
    this.registerView(VIEW_TYPE, leaf => new VaultSearchView(leaf, this));
    this.addRibbonIcon("search", "Vault Search", () => this.activateView());
    this.addCommand({ id: "open-vault-search", name: "打开 Vault Search", callback: () => this.activateView() });
    this.addSettingTab(new VaultSearchSettingTab(this.app, this));
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

  rebuildProviders() {
    const config: PluginConfig = {
      embedding: { base_url: this.settings.embeddingBaseUrl, model: this.settings.embeddingModel, api_key: this.settings.embeddingApiKey },
      reranker: { enabled: this.settings.rerankerEnabled, base_url: this.settings.rerankerBaseUrl, model: this.settings.rerankerModel, api_key: this.settings.rerankerApiKey, recall_top_k: this.settings.rerankerRecallTopK, final_top_k: this.settings.rerankerFinalTopK },
      llm: { provider: this.settings.llmProvider, base_url: this.settings.llmBaseUrl, model: this.settings.llmModel, api_key: this.settings.llmApiKey },
    };
    this.providers = buildProviders(config);
  }

  async loadSettings() { this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()); }
  async saveSettings() { await this.saveData(this.settings); this.rebuildProviders(); }
}
