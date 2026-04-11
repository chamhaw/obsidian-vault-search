import { App, Notice } from "obsidian";
import { NoteEntry } from "./SearchEngine";

export interface VaultIndex { version: number; updated_at: string; embedding_model: string; embedding_dims: number; notes: NoteEntry[]; }

export class IndexLoader {
  private index: VaultIndex | null = null;
  private configuredModel = "";
  constructor(private app: App) {}

  setConfiguredModel(model: string) { this.configuredModel = model; }

  async load(): Promise<VaultIndex | null> {
    try {
      const content = await this.app.vault.adapter.read(".search_index/index.json");
      const parsed: VaultIndex = JSON.parse(content);
      if (this.configuredModel && parsed.embedding_model !== this.configuredModel)
        new Notice(`⚠️ 索引模型 (${parsed.embedding_model}) 与配置模型 (${this.configuredModel}) 不一致，请重建索引`, 10000);
      this.index = parsed;
      return parsed;
    } catch {
      new Notice("未找到 .search_index/index.json，请先运行 indexer");
      return null;
    }
  }

  getIndex(): VaultIndex | null { return this.index; }

  watchAndReload(_onReload: (index: VaultIndex) => void) {
    // adapter.on 不在 DataAdapter 类型定义中，watch 为可选功能，暂不实现
  }
}
