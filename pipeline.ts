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

const BODY_CHAR_LIMIT = 2000;

export async function askVault(question: string, notes: NoteEntry[], embedding: EmbeddingProvider, reranker: RerankProvider | null, llm: LLMProvider, config: PipelineConfig, onChunk: (c: string) => void, readFile?: (path: string) => Promise<string>): Promise<AskResult> {
  const results = await semanticSearch(question, notes, embedding, reranker, config);
  const contextParts = await Promise.all(results.map(async (r, i) => {
    let body = r.note.summary ?? "";
    if (readFile) {
      try {
        const raw = await readFile(r.note.path);
        // strip frontmatter
        const stripped = raw.replace(/^---[\s\S]*?---\n?/, "").trim();
        body = stripped.length > BODY_CHAR_LIMIT ? stripped.slice(0, BODY_CHAR_LIMIT) + "…" : stripped;
      } catch { /* fallback to summary */ }
    }
    return `[${i+1}] 标题：${r.note.title}\n${body}`;
  }));
  const context = contextParts.join("\n\n---\n\n");
  const messages: Message[] = [
    { role: "system", content: "你是知识库助手。严格基于提供的笔记内容回答问题，引用来源用 [序号] 格式。如果笔记中没有相关信息，请直接说明。" },
    { role: "user", content: `知识库内容：\n\n${context}\n\n问题：${question}` },
  ];
  await llm.chat(messages, onChunk);
  return { answer: "", sources: results.map(r => ({ title: r.note.title, path: r.note.path })) };
}
