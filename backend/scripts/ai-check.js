// ai-check.js - checks that your Gemini key and model name work. Run: npm run ai:check
import "dotenv/config";
import { makeGeminiGenerator } from "../ai/gemini.js";

const generate = makeGeminiGenerator({
  apiKey: process.env.GEMINI_API_KEY,
  model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
  baseUrl: process.env.GEMINI_BASE_URL || undefined
});
if (!generate) { console.log("GEMINI_API_KEY is empty in .env, so the AI layer is OFF. Explanations will answer 503, everything else works."); process.exit(0); }

try {
  const out = await generate({ system: "Reply with the single word OK.", user: "ping" });
  console.log("Gemini works. Model:", out.model, "| Reply:", out.text);
} catch (e) {
  console.log("Gemini FAILED:", e.message);
  console.log("Check: the key in .env, the model name (GEMINI_MODEL), and your internet connection.");
  process.exit(1);
}
