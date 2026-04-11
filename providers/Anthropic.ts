import { LLMProvider, Message } from "./types";

export class AnthropicProvider implements LLMProvider {
  constructor(private apiKey: string, private model: string) {}
  async chat(messages: Message[], onChunk: (c: string) => void): Promise<void> {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": this.apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model, max_tokens: 2048, stream: true,
        messages: messages.filter(m => m.role !== "system"),
        system: messages.find(m => m.role === "system")?.content,
      }),
    });
    if (!r.ok) throw new Error(`Anthropic API ${r.status}`);
    const reader = r.body!.getReader(), dec = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of dec.decode(value).split("\n")) {
        if (!line.startsWith("data: ")) continue;
        try { const p = JSON.parse(line.slice(6)); if (p.type === "content_block_delta") onChunk(p.delta?.text ?? ""); } catch {}
      }
    }
  }
}
