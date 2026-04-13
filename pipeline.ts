import { EmbeddingProvider, RerankProvider, LLMProvider, Message } from "./providers/types";
import { ChunkEntry, ChunkResult, chunkEmbeddingRecall } from "./SearchEngine";
import { t } from "./i18n";

export interface PipelineConfig { recallTopK: number; finalTopK: number; minScore?: number; }
export interface AskResult { answer: string; sources: Array<{ title: string; path: string }>; }
export interface RelatedNote { path: string; title: string; summary: string; score: number; bestChunkText: string; }

export async function semanticSearch(
  query: string,
  chunks: ChunkEntry[],
  embedding: EmbeddingProvider,
  reranker: RerankProvider | null,
  config: PipelineConfig
): Promise<ChunkResult[]> {
  const [queryVec] = await embedding.embed([query]);
  const candidates = chunkEmbeddingRecall(queryVec, chunks, config.recallTopK);
  if (!reranker || candidates.length === 0) return candidates.slice(0, config.finalTopK).filter(r => r.score >= (config.minScore ?? 0));
  const docs = candidates.map(r => r.chunk.text);
  const scores = await reranker.rerank(query, docs);
  return candidates
    .map((r, i) => ({ ...r, score: scores[i] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, config.finalTopK)
    .filter(r => r.score >= (config.minScore ?? 0));
}

export async function findRelatedNotes(
  queryTitle: string,
  querySummary: string,
  queryTags: string[],
  excludePath: string,
  chunks: ChunkEntry[],
  embedding: EmbeddingProvider,
  reranker: RerankProvider | null,
  config: PipelineConfig
): Promise<RelatedNote[]> {
  const queryStr = [queryTitle, querySummary, queryTags.join(" ")].filter(Boolean).join("\n");
  const otherChunks = chunks.filter(c => c.path !== excludePath);
  const chunkResults = await semanticSearch(queryStr, otherChunks, embedding, reranker, { recallTopK: 40, finalTopK: 40 });
  // Group by path, take best score per note
  const noteMap = new Map<string, RelatedNote>();
  for (const r of chunkResults) {
    const existing = noteMap.get(r.chunk.path);
    if (!existing || r.score > existing.score) {
      noteMap.set(r.chunk.path, {
        path: r.chunk.path,
        title: r.chunk.title,
        summary: r.chunk.summary,
        score: r.score,
        bestChunkText: r.chunk.text,
      });
    }
  }
  return Array.from(noteMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, config.finalTopK);
}

export async function askVault(
  question: string,
  chunks: ChunkEntry[],
  embedding: EmbeddingProvider,
  reranker: RerankProvider | null,
  llm: LLMProvider,
  config: PipelineConfig,
  onChunk: (c: string) => void
): Promise<AskResult> {
  const results = await semanticSearch(question, chunks, embedding, reranker, config);
  const contextParts = results.map((r, i) =>
    `[${i + 1}] 标题：${r.chunk.title}\n${r.chunk.text}`
  );
  const context = contextParts.join("\n\n---\n\n");
  const messages: Message[] = [
    { role: "system", content: t("pipeline.systemPrompt") },
    { role: "user", content: `知识库内容：\n\n${context}\n\n问题：${question}` },
  ];
  await llm.chat(messages, onChunk);
  // Deduplicate sources by path
  const seen = new Set<string>();
  const sources: Array<{ title: string; path: string }> = [];
  for (const r of results) {
    if (!seen.has(r.chunk.path)) {
      seen.add(r.chunk.path);
      sources.push({ title: r.chunk.title, path: r.chunk.path });
    }
  }
  return { answer: "", sources };
}
