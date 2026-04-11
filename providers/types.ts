export interface Message { role: "user" | "assistant" | "system"; content: string; }
export interface EmbeddingProvider { embed(texts: string[]): Promise<number[][]>; }
export interface RerankProvider { rerank(query: string, documents: string[]): Promise<number[]>; }
export interface LLMProvider { chat(messages: Message[], onChunk: (chunk: string) => void): Promise<void>; }
export interface PluginConfig {
  embedding: { base_url: string; model: string; api_key: string; };
  reranker: { enabled: boolean; base_url: string; model: string; api_key: string; recall_top_k: number; final_top_k: number; };
  llm: { provider: "anthropic" | "openai-compatible"; base_url: string; model: string; api_key: string; };
}
