import { App, Notice, TFile } from "obsidian";
import { NoteEntry } from "./SearchEngine";

export interface VaultIndex { version: number; updated_at: string; embedding_model: string; embedding_dims: number; notes: NoteEntry[]; }

export class IndexLoader {
  private index: VaultIndex | null = null;
  private configuredModel = "";
  constructor(private app: App) {}

  setConfiguredModel(model: string) { this.configuredModel = model; }

  async load(): Promise<VaultIndex | null> {
    const file = this.app.vault.getAbstractFileByPath(".search_index/index.json");
    if (!(file instanceof TFile)) { new Notice("未找到 .search_index/index.json，请先运行 indexer"); return null; }
    const parsed: VaultIndex = JSON.parse(await this.app.vault.read(file));
    if (this.configuredModel && parsed.embedding_model !== this.configuredModel)
      new Notice(`⚠️ 索引模型 (${parsed.embedding_model}) 与配置模型 (${this.configuredModel}) 不一致，请重建索引`, 10000);
    this.index = parsed;
    return parsed;
  }

  getIndex(): VaultIndex | null { return this.index; }

  watchAndReload(onReload: (index: VaultIndex) => void) {
    this.app.vault.on("modify", async (file) => {
      if (file instanceof TFile && file.path === ".search_index/index.json") {
        const idx = await this.load();
        if (idx) onReload(idx);
      }
    });
  }
}
