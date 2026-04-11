import { LLMProvider, Message } from "./types";

export class AnthropicProvider implements LLMProvider {
  constructor(private apiKey: string, private model: string, private baseUrl = "https://api.anthropic.com") {}

  async chat(messages: Message[], onChunk: (c: string) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const https = require("https") as typeof import("https");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const http = require("http") as typeof import("http");

      const url = new URL(`${this.baseUrl}/v1/messages`);
      const body = JSON.stringify({
        model: this.model, max_tokens: 2048, stream: true,
        messages: messages.filter(m => m.role !== "system"),
        system: messages.find(m => m.role === "system")?.content,
      });

      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: url.pathname + url.search,
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      };

      const transport = url.protocol === "https:" ? https : http;
      const req = transport.request(options, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          let errBody = "";
          res.on("data", (d: Buffer) => errBody += d.toString());
          res.on("end", () => reject(new Error(`Anthropic API ${res.statusCode}: ${errBody}`)));
          return;
        }
        let buf = "";
        res.on("data", (chunk: Buffer) => {
          buf += chunk.toString();
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const p = JSON.parse(data);
              if (p.type === "content_block_delta") onChunk(p.delta?.text ?? "");
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
