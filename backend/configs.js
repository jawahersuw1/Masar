
import { readFileSync } from "node:fs";

const read = (name) => JSON.parse(readFileSync(new URL(`./config/${name}.json`, import.meta.url)));

export function loadConfigs() {
  return {
    scoring: read("scoring"),
    similarity: read("similarity"),
    confidence: read("confidence"),
    rules: read("rules"),
    risk: read("risk"),
    scenarios: read("scenarios")
  };
}