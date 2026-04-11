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
    { role: "system", content: "你是知识库助手。你的唯一信息来源是用户提供的笔记内容，禁止使用任何外部知识或自行推断补充。回答时严格引用笔记原文，用 [序号] 标注来源。如果提供的笔记中没有足够信息回答问题，必须明确回复：知识库中未检索到相关内容，不得编造或推测。" },
    { role: "user", content: `知识库内容：\n\n${context}\n\n问题：${question}` },
  ];
  await llm.chat(messages, onChunk);
  return { answer: "", sources: results.map(r => ({ title: r.note.title, path: r.note.path })) };
}
