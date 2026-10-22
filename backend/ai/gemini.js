// gemini.js - the ONLY file that talks to Gemini. The API key stays here on the server, never in React.
// If there is no key, makeGeminiGenerator returns null and the explanation endpoint answers 503. The rest of Masar still works.
const DEFAULT_BASE = "https://generativelanguage.googleapis.com/v1beta";

export function makeGeminiGenerator({ apiKey, model = "gemini-3.5-flash", baseUrl = DEFAULT_BASE, timeoutMs = 10000 }) {
  if (!apiKey) return null;

  return async function generate({ system, user }) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);      // never make the user wait forever
    try {
      const res = await fetch(`${baseUrl}/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2000 }
        }),
        signal: controller.signal
      });
      if (!res.ok) throw new Error(`Gemini returned HTTP ${res.status}`);   // the key is never put in an error message
      const data = await res.json();
      const text = (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("").trim();
      if (!text) throw new Error("Gemini returned no text");
      return { text, model };
    } finally {
      clearTimeout(timer);
    }
  };
}
