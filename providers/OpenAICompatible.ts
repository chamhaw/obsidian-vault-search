import { EmbeddingProvider, RerankProvider, LLMProvider, Message } from "./types";

export class OpenAICompatibleEmbeddingProvider implements EmbeddingProvider {
  constructor(private baseUrl: string, private model: string, private apiKey: string) {}
  async embed(texts: string[]): Promise<number[][]> {
    const r = await fetch(`${this.baseUrl}/embeddings`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.model, input: texts }),
    });
    if (!r.ok) throw new Error(`Embedding API ${r.status}: ${await r.text()}`);
    const data = await r.json();
    return [...data.data].sort((a: any, b: any) => a.index - b.index).map((i: any) => i.embedding);
  }
}

export class HttpRerankProvider implements RerankProvider {
  constructor(private baseUrl: string, private model: string, private apiKey: string) {}
  async rerank(query: string, documents: string[]): Promise<number[]> {
    const r = await fetch(`${this.baseUrl}/rerank`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.model, query, documents }),
    });
    if (!r.ok) throw new Error(`Reranker API ${r.status}`);
    const scores = new Array(documents.length).fill(0);
    for (const item of (await r.json()).results) scores[item.index] = item.relevance_score;
    return scores;
  }
}

export class OpenAICompatibleLLMProvider implements LLMProvider {
  constructor(private baseUrl: string, private model: string, private apiKey: string) {}
  async chat(messages: Message[], onChunk: (c: string) => void): Promise<void> {
    const r = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.model, messages, stream: true }),
    });
    if (!r.ok) throw new Error(`LLM API ${r.status}`);
    const reader = r.body!.getReader(), dec = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of dec.decode(value).split("\n")) {
        if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
        try { const d = JSON.parse(line.slice(6))?.choices?.[0]?.delta?.content; if (d) onChunk(d); } catch {}
      }
    }
  }
}
