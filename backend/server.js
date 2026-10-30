import "dotenv/config";
import { createApp } from "./app.js";
import { repo } from "./repo.js";
import { loadConfigs } from "./configs.js";
import { makeOpenAIGenerator  } from "./ai/openai.js";
import { makeExplainer } from "./ai/explain.js";

const generate = makeOpenAIGenerator({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  baseUrl: process.env.OPENAI_BASE_URL || undefined
});
console.log(generate ? "AI layer: OpenAI ON" : "AI layer: OFF (no OPENAI_API_KEY)");

const app = createApp({
  repo,
  configs: loadConfigs(),
  explain: makeExplainer({ generate }),
   corsOrigin: "*"
});

try {
  await repo.ping();
  console.log("Database connected");
} catch (e) {
  console.error("Database NOT connected:", e.message);
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Masar API running on http://localhost:${PORT}`));
