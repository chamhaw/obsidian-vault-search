import { App, PluginSettingTab, Setting } from "obsidian";
import type VaultSearchPlugin from "./main";

export interface VaultSearchSettings {
  embeddingBaseUrl: string; embeddingModel: string; embeddingApiKey: string;
  rerankerEnabled: boolean; rerankerBaseUrl: string; rerankerModel: string; rerankerApiKey: string;
  rerankerRecallTopK: number; rerankerFinalTopK: number;
  llmProvider: "anthropic" | "openai-compatible"; llmBaseUrl: string; llmModel: string; llmApiKey: string;
}

export const DEFAULT_SETTINGS: VaultSearchSettings = {
  embeddingBaseUrl: "https://api.siliconflow.cn/v1", embeddingModel: "BAAI/bge-large-zh-v1.5", embeddingApiKey: "",
  rerankerEnabled: true, rerankerBaseUrl: "https://api.siliconflow.cn/v1", rerankerModel: "BAAI/bge-reranker-v2-m3", rerankerApiKey: "",
  rerankerRecallTopK: 30, rerankerFinalTopK: 5,
  llmProvider: "anthropic", llmBaseUrl: "https://api.anthropic.com", llmModel: "claude-sonnet-4-6", llmApiKey: "",
};

export class VaultSearchSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: VaultSearchPlugin) { super(app, plugin); }
  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    const addText = (label: string, get: () => string, set: (v: string) => void, password = false) =>
      new Setting(containerEl).setName(label).addText(t => {
        if (password) t.inputEl.type = "password";
        t.setValue(get()).onChange(async v => { set(v); await this.plugin.saveSettings(); });
      });
    containerEl.createEl("h2", { text: "Embedding" });
    addText("Base URL", () => this.plugin.settings.embeddingBaseUrl, v => this.plugin.settings.embeddingBaseUrl = v);
    addText("模型", () => this.plugin.settings.embeddingModel, v => this.plugin.settings.embeddingModel = v);
    addText("API Key", () => this.plugin.settings.embeddingApiKey, v => this.plugin.settings.embeddingApiKey = v, true);
    containerEl.createEl("h2", { text: "Reranker" });
    new Setting(containerEl).setName("启用 Reranker").addToggle(t => t.setValue(this.plugin.settings.rerankerEnabled).onChange(async v => { this.plugin.settings.rerankerEnabled = v; await this.plugin.saveSettings(); }));
    addText("Reranker Base URL", () => this.plugin.settings.rerankerBaseUrl, v => this.plugin.settings.rerankerBaseUrl = v);
    addText("Reranker 模型", () => this.plugin.settings.rerankerModel, v => this.plugin.settings.rerankerModel = v);
    addText("Reranker API Key", () => this.plugin.settings.rerankerApiKey, v => this.plugin.settings.rerankerApiKey = v, true);
    containerEl.createEl("h2", { text: "LLM" });
    new Setting(containerEl).setName("Provider").addDropdown(d => d.addOption("anthropic", "Anthropic Claude").addOption("openai-compatible", "OpenAI Compatible").setValue(this.plugin.settings.llmProvider).onChange(async (v: any) => { this.plugin.settings.llmProvider = v; await this.plugin.saveSettings(); }));
    addText("LLM Base URL", () => this.plugin.settings.llmBaseUrl, v => this.plugin.settings.llmBaseUrl = v);
    addText("LLM 模型", () => this.plugin.settings.llmModel, v => this.plugin.settings.llmModel = v);
    addText("LLM API Key", () => this.plugin.settings.llmApiKey, v => this.plugin.settings.llmApiKey = v, true);
  }
}
