import { PluginConfig, EmbeddingProvider, RerankProvider, LLMProvider } from "./types";
import { OpenAICompatibleEmbeddingProvider, HttpRerankProvider, OpenAICompatibleLLMProvider } from "./OpenAICompatible";
import { AnthropicProvider } from "./Anthropic";
export type { EmbeddingProvider, RerankProvider, LLMProvider, PluginConfig } from "./types";

export function buildProviders(config: PluginConfig): { embedding: EmbeddingProvider; reranker: RerankProvider | null; llm: LLMProvider; } {
  const embedding = new OpenAICompatibleEmbeddingProvider(config.embedding.base_url, config.embedding.model, config.embedding.api_key);
  const reranker = config.reranker.enabled ? new HttpRerankProvider(config.reranker.base_url, config.reranker.model, config.reranker.api_key) : null;
  const llm = config.llm.provider === "anthropic"
    ? new AnthropicProvider(config.llm.api_key, config.llm.model)
    : new OpenAICompatibleLLMProvider(config.llm.base_url, config.llm.model, config.llm.api_key);
  return { embedding, reranker, llm };
}
