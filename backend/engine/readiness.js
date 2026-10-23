// readiness.js - the client's Financing Readiness score: a weighted average of the three feasibility scores.
// It is NOT a credit score and NOT a Bank X decision. Missing areas are skipped and the weights re-scaled.
import { bandFor } from "./scoring.js";

export function calcReadiness(feasibility, confidence, scoringConfig) {
  console.log(scoringConfig.readiness)
  const weights = scoringConfig.readiness.weights;
  const used = Object.keys(weights).filter((k) => feasibility[k].score !== null);
  const totalW = used.reduce((s, k) => s + weights[k], 0);
  const score = totalW === 0 ? null : used.reduce((s, k) => s + weights[k] * feasibility[k].score, 0) / totalW;

  return {
    score,
    band: bandFor(score, scoringConfig.bands),
    confidence: confidence.level,                       
    areasUsed: used,
    strengths: Object.keys(weights).flatMap((k) => feasibility[k].strengths),
    concerns: Object.keys(weights).flatMap((k) => feasibility[k].concerns),
    label: "Financing Readiness is guidance for you. It is not a credit score and not a Bank X decision."
  };
}
