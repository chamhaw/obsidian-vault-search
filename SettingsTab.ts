import { App, PluginSettingTab, Setting, Modal, Notice } from "obsidian";
import type VaultSearchPlugin from "./main";
import { t, tFormat } from "./i18n";

export interface VaultSearchSettings {
  embeddingBaseUrl: string; embeddingModel: string; embeddingApiKey: string;
  rerankerEnabled: boolean; rerankerBaseUrl: string; rerankerModel: string; rerankerApiKey: string;
  rerankerRecallTopK: number; rerankerFinalTopK: number;
  llmProvider: "anthropic" | "openai-compatible"; llmBaseUrl: string; llmModel: string; llmApiKey: string;
  minScore: number;
}

export const DEFAULT_SETTINGS: VaultSearchSettings = {
  embeddingBaseUrl: "https://api.siliconflow.cn/v1", embeddingModel: "BAAI/bge-large-zh-v1.5", embeddingApiKey: "",
  rerankerEnabled: true, rerankerBaseUrl: "https://api.siliconflow.cn/v1", rerankerModel: "BAAI/bge-reranker-v2-m3", rerankerApiKey: "",
  rerankerRecallTopK: 30, rerankerFinalTopK: 5,
  llmProvider: "anthropic", llmBaseUrl: "https://api.anthropic.com", llmModel: "claude-sonnet-4-6", llmApiKey: "",
  minScore: 0.1,
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
    containerEl.createEl("h2", { text: t("settings.embeddingSection") });
    addText(t("settings.embeddingBaseUrl"), () => this.plugin.settings.embeddingBaseUrl, v => this.plugin.settings.embeddingBaseUrl = v);
    addText(t("settings.embeddingModel"), () => this.plugin.settings.embeddingModel, v => this.plugin.settings.embeddingModel = v);
    addText(t("settings.embeddingApiKey"), () => this.plugin.settings.embeddingApiKey, v => this.plugin.settings.embeddingApiKey = v, true);
    containerEl.createEl("h2", { text: t("settings.rerankerSection") });
    new Setting(containerEl).setName(t("settings.rerankerEnabled")).addToggle(t => t.setValue(this.plugin.settings.rerankerEnabled).onChange(async v => { this.plugin.settings.rerankerEnabled = v; await this.plugin.saveSettings(); }));
    addText(t("settings.rerankerBaseUrl"), () => this.plugin.settings.rerankerBaseUrl, v => this.plugin.settings.rerankerBaseUrl = v);
    addText(t("settings.rerankerModel"), () => this.plugin.settings.rerankerModel, v => this.plugin.settings.rerankerModel = v);
    addText(t("settings.rerankerApiKey"), () => this.plugin.settings.rerankerApiKey, v => this.plugin.settings.rerankerApiKey = v, true);
    containerEl.createEl("h2", { text: t("settings.filterSection") });
    new Setting(containerEl)
      .setName(t("settings.minScoreName"))
      .setDesc(t("settings.minScoreDesc"))
      .addText(text => {
        text.setPlaceholder("10")
          .setValue(String(Math.round(this.plugin.settings.minScore * 100)))
          .onChange(async v => {
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
      })
      .addExtraButton(btn => btn
        .setIcon("reset")
        .setTooltip("Reset to 10%")
        .onClick(async () => {
          this.plugin.settings.minScore = 0.1;
          await this.plugin.saveSettings();
          this.display();
        })
      );
    containerEl.createEl("h2", { text: t("settings.llmSection") });
    new Setting(containerEl).setName(t("settings.llmProvider")).addDropdown(d => d.addOption("anthropic", "Anthropic Claude").addOption("openai-compatible", "OpenAI Compatible").setValue(this.plugin.settings.llmProvider).onChange(async (v: any) => { this.plugin.settings.llmProvider = v; await this.plugin.saveSettings(); }));
    addText(t("settings.llmBaseUrl"), () => this.plugin.settings.llmBaseUrl, v => this.plugin.settings.llmBaseUrl = v);
    addText(t("settings.llmModel"), () => this.plugin.settings.llmModel, v => this.plugin.settings.llmModel = v);
    addText(t("settings.llmApiKey"), () => this.plugin.settings.llmApiKey, v => this.plugin.settings.llmApiKey = v, true);

    // 索引管理
    containerEl.createEl("h2", { text: t("settings.indexSection") });
    containerEl.createEl("p", { text: t("settings.indexLocation"), cls: "setting-item-description" });

    let progressEl: HTMLElement | null = null;

    new Setting(containerEl)
      .setName(t("settings.buildIndexName"))
      .setDesc(t("settings.buildIndexDesc"))
      .addButton(btn => btn.setButtonText(t("settings.buildIndexBtn")).setCta().onClick(async () => {
        btn.setDisabled(true).setButtonText(t("settings.buildIndexBuilding"));
        if (!progressEl) {
          progressEl = containerEl.createEl("p", { cls: "setting-item-description" });
        }
        try {
          await (this.plugin as any).runIndex("full", (cur: number, total: number) => {
            if (progressEl) progressEl.setText(tFormat("settings.progress", cur, total));
          });
          if (progressEl) progressEl.setText(t("settings.buildIndexDone"));
        } catch (e: any) {
          if (progressEl) progressEl.setText(`Error: ${e.message}`);
          new Notice(`Index build failed: ${e.message}`);
        } finally {
          btn.setDisabled(false).setButtonText(t("settings.buildIndexBtn"));
        }
      }));

    new Setting(containerEl)
      .setName(t("settings.incrIndexName"))
      .setDesc(t("settings.incrIndexDesc"))
      .addButton(btn => btn.setButtonText(t("settings.incrIndexBtn")).onClick(async () => {
        const runIncremental = async () => {
          btn.setDisabled(true).setButtonText(t("settings.incrIndexUpdating"));
          if (!progressEl) {
            progressEl = containerEl.createEl("p", { cls: "setting-item-description" });
          }
          try {
            await (this.plugin as any).runIndex("incremental", (cur: number, total: number) => {
              if (progressEl) progressEl.setText(tFormat("settings.progress", cur, total));
            });
            if (progressEl) progressEl.setText(t("settings.buildIndexDone"));
          } catch (e: any) {
            if (progressEl) progressEl.setText(`Error: ${e.message}`);
            new Notice(`Incremental update failed: ${e.message}`);
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
            await (this.plugin as any).runIndex("full", (cur: number, total: number) => {
              if (progressEl) progressEl.setText(tFormat("settings.progress", cur, total));
            });
            if (progressEl) progressEl.setText(t("settings.buildIndexDone"));
          } catch (e: any) {
            if (progressEl) progressEl.setText(`Error: ${e.message}`);
            new Notice(`Full rebuild failed: ${e.message}`);
          } finally {
            btn.setDisabled(false).setButtonText(t("settings.incrIndexBtn"));
          }
        };

        if ((this.plugin as any).indexLoader.isStale()) {
          const reason = (this.plugin as any).indexLoader.getStaleReason();
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

    new Setting(containerEl)
      .setName(t("settings.testSingleName"))
      .setDesc(t("settings.testSingleDesc"))
      .addButton(btn => btn
        .setButtonText(t("settings.testSingleBtn"))
        .onClick(async () => {
          const file = this.app.workspace.getActiveFile();
          if (!file) {
            new Notice("请先在编辑器中打开一篇笔记");
            return;
          }
          btn.setDisabled(true).setButtonText("索引中...");
          try {
            await this.plugin.runIndexSingleFile(file);
          } catch (e: any) {
            new Notice(`Single file index failed: ${e.message}`);
          } finally {
            btn.setDisabled(false).setButtonText(t("settings.testSingleBtn"));
          }
        })
      );
  }
}

class ConfirmModal extends Modal {
  constructor(
    app: App,
    private message: string,
    private onConfirm: () => void,
    private confirmText = t("settings.confirmRebuild"),
    private cancelText = t("settings.cancel")
  ) {
    super(app);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("p", { text: this.message });
    const btnRow = contentEl.createDiv({ cls: "modal-button-container" });
    btnRow.createEl("button", { text: this.cancelText, cls: "mod-warning" }).onclick = () => this.close();
    const confirmBtn = btnRow.createEl("button", { text: this.confirmText, cls: "mod-cta" });
    confirmBtn.onclick = () => { this.close(); this.onConfirm(); };
  }
  onClose() { this.contentEl.empty(); }
}
