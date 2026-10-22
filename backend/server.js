import "dotenv/config";
import { createApp } from "./app.js";
import { repo } from "./repo.js";
import { loadConfigs } from "./configs.js";
import { makeGeminiGenerator } from "./ai/gemini.js";
import { makeExplainer } from "./ai/explain.js";

const generate = makeGeminiGenerator({
  apiKey: process.env.GEMINI_API_KEY,
  model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
  baseUrl: process.env.GEMINI_BASE_URL || undefined
});
console.log(generate ? "AI layer: Gemini ON" : "AI layer: OFF (no GEMINI_API_KEY)");

const app = createApp({
  repo,
  configs: loadConfigs(),
  explain: makeExplainer({ generate }),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173"   // the Vite dev server
});

try {
  await repo.ping();
  console.log("Database connected");
} catch (e) {
  console.error("Database NOT connected:", e.message);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Masar API running on http://localhost:${PORT}`));
