import { requestUrl } from "obsidian";
import { LLMProvider, Message } from "./types";

export class AnthropicProvider implements LLMProvider {
  constructor(private apiKey: string, private model: string, private baseUrl = "https://api.anthropic.com") {}

  async chat(messages: Message[], onChunk: (c: string) => void): Promise<void> {
    const resp = await requestUrl({
      url: `${this.baseUrl}/v1/messages`,
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 2048,
        stream: false,
        messages: messages.filter(m => m.role !== "system"),
        system: messages.find(m => m.role === "system")?.content,
      }),
      throw: false,
    });
    if (resp.status >= 400) throw new Error(`Anthropic API ${resp.status}: ${resp.text}`);
    const text = resp.json?.content?.[0]?.text ?? "";
    onChunk(text);
  }
}
