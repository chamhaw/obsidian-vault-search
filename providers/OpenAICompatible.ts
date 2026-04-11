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
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const https = require("https") as typeof import("https");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const http = require("http") as typeof import("http");

      const url = new URL(`${this.baseUrl}/chat/completions`);
      const body = JSON.stringify({ model: this.model, messages, stream: true });

      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: url.pathname + url.search,
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      };

      const transport = url.protocol === "https:" ? https : http;
      const req = transport.request(options, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          let errBody = "";
          res.on("data", (d: Buffer) => errBody += d.toString());
          res.on("end", () => reject(new Error(`LLM API ${res.statusCode}: ${errBody}`)));
          return;
        }
        let buf = "";
        res.on("data", (chunk: Buffer) => {
          buf += chunk.toString();
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
            try {
              const d = JSON.parse(line.slice(6))?.choices?.[0]?.delta?.content;
              if (d) onChunk(d);
            } catch {}
          }
        });
        res.on("end", resolve);
        res.on("error", reject);
      });

      req.on("error", reject);
      req.write(body);
      req.end();
    });
  }
}
