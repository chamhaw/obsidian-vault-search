import { App } from "obsidian";
import { ChunkEntry } from "./SearchEngine";

export interface VaultIndex {
  version: number;
  updated_at: string;
  embedding_model: string;
  embedding_dims: number;
  embedding_base_url?: string;
  chunks: ChunkEntry[];
}

export class IndexLoader {
  private index: VaultIndex | null = null;
  private configuredModel = "";
  private configuredBaseUrl = "";
  private stale = false;
  private staleReason = "";

  constructor(private app: App) {}

  setConfig(config: { model: string; baseUrl: string }) {
    this.configuredModel = config.model;
    this.configuredBaseUrl = config.baseUrl;
    this.checkStaleness();
  }

  setConfiguredModel(model: string) {
    this.configuredModel = model;
    this.checkStaleness();
  }

  async load(): Promise<VaultIndex | null> {
    try {
      const content = await this.app.vault.adapter.read(".search_index/index.json");
      this.index = JSON.parse(content) as VaultIndex;
      this.checkStaleness();
      return this.index;
    } catch {
      this.index = null;
      this.stale = false;
      this.staleReason = "";
      return null;
    }
  }

  getIndex(): VaultIndex | null { return this.index; }
  isStale(): boolean { return this.stale; }
  getStaleReason(): string { return this.staleReason; }

  watchAndReload(_onReload: (index: VaultIndex) => void) {}

  private checkStaleness() {
    if (!this.index) {
      this.stale = false;
      this.staleReason = "";
      return;
    }
    // Version check: v1 index has notes[], v2 has chunks[]
    if (!this.index.version || this.index.version < 2) {
      this.stale = true;
      this.staleReason = "索引格式已过期，请重建索引（Index format outdated, please rebuild）";
      return;
    }
    const modelOk = !this.configuredModel || this.index.embedding_model === this.configuredModel;
    const urlOk =
      !this.index.embedding_base_url ||
      !this.configuredBaseUrl ||
      this.index.embedding_base_url === this.configuredBaseUrl;

    if (!modelOk) {
      this.stale = true;
      this.staleReason = `Embedding 模型不匹配（索引: ${this.index.embedding_model}，当前: ${this.configuredModel}）`;
    } else if (!urlOk) {
      this.stale = true;
      this.staleReason = `Embedding 服务地址不匹配（索引: ${this.index.embedding_base_url}，当前: ${this.configuredBaseUrl}）`;
    } else {
      this.stale = false;
      this.staleReason = "";
    }
  }
}
