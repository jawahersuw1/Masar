// openai.js - the ONLY file that talks to OpenAI. The API key stays on the server.
const DEFAULT_BASE = "https://api.openai.com/v1";

export function makeOpenAIGenerator({ apiKey, model = "gpt-4o-mini", baseUrl = DEFAULT_BASE, timeoutMs = 10000 }) {
  if (!apiKey) return null;

  return async function generate({ system, user }) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user }
          ],
          temperature: 0.2,
          max_completion_tokens: 2000
        }),
        signal: controller.signal
      });
      if (!res.ok) throw new Error(`OpenAI returned HTTP ${res.status}`);
      const data = await res.json();
      const text = (data.choices?.[0]?.message?.content ?? "").trim();
      if (!text) throw new Error("OpenAI returned no text");
      return { text, model };
    } finally {
      clearTimeout(timer);
    }
  };
}