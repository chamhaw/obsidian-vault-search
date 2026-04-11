import { EmbeddingProvider, RerankProvider, LLMProvider, Message } from "./providers/types";
import { NoteEntry, SearchResult, embeddingRecall } from "./SearchEngine";

export interface PipelineConfig { recallTopK: number; finalTopK: number; }
export interface AskResult { answer: string; sources: Array<{ title: string; path: string }>; }

export async function semanticSearch(query: string, notes: NoteEntry[], embedding: EmbeddingProvider, reranker: RerankProvider | null, config: PipelineConfig): Promise<SearchResult[]> {
  const [queryVec] = await embedding.embed([query]);
  const candidates = embeddingRecall(queryVec, notes, config.recallTopK);
  if (!reranker || candidates.length === 0) return candidates.slice(0, config.finalTopK);
  const docs = candidates.map(r => `${r.note.title}\n${r.note.summary}`);
  const scores = await reranker.rerank(query, docs);
  return candidates.map((r, i) => ({ ...r, score: scores[i] })).sort((a, b) => b.score - a.score).slice(0, config.finalTopK);
}

export async function askVault(question: string, notes: NoteEntry[], embedding: EmbeddingProvider, reranker: RerankProvider | null, llm: LLMProvider, config: PipelineConfig, onChunk: (c: string) => void): Promise<AskResult> {
  const results = await semanticSearch(question, notes, embedding, reranker, config);
  const context = results.map((r, i) => `[${i+1}] ${r.note.title}\n${r.note.summary}`).join("\n\n");
  const messages: Message[] = [
    { role: "system", content: "你是知识库助手。基于提供的笔记内容回答问题，引用来源用 [序号] 格式。" },
    { role: "user", content: `知识库内容：\n\n${context}\n\n问题：${question}` },
  ];
  await llm.chat(messages, onChunk);
  return { answer: "", sources: results.map(r => ({ title: r.note.title, path: r.note.path })) };
}
