// similarity.js - how close is this application to each historical case?
// Method: normalized weighted distance.
//   1. Put every feature on a 0-1 line (normalize).
//   2. For each feature, difference = |applicant - case|  (category: 0 if same, 1 if different).
//   3. distance = sum(weight * difference) / sum(weights of features both sides have).
//   4. similarity = 1 - distance.
import { computeMetrics } from "./metrics.js";

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const isMissing = (x) => x === null || x === undefined || Number.isNaN(x);

function normalize(value, f) {
  if (f.type === "log") {
    return clamp(
      (Math.log(value) - Math.log(f.min)) / (Math.log(f.max) - Math.log(f.min)),
      0,
      1,
    );
  }
  return clamp((value - f.min) / (f.max - f.min), 0, 1);
}

function featureDiff(a, b, f) {
  if (f.type === "category") return a === b ? 0 : 1;
  return Math.abs(normalize(a, f) - normalize(b, f));
}

export function levelFor(similarity, levels) {
  if (similarity === null) return "Not enough data";
  if (similarity >= levels.high) return "High";
  if (similarity >= levels.medium) return "Medium";
  return "Low";
}


export function compare(valuesA, valuesB, config) {
  const totalWeight = config.features.reduce((s, f) => s + f.weight, 0);
  const used = [];
  for (const f of config.features) {
    const a = valuesA[f.key];
    const b = valuesB[f.key];
    if (isMissing(a) || isMissing(b)) continue;
    used.push({
      key: f.key,
      label: f.label,
      a,
      b,
      weight: f.weight,
      diff: featureDiff(a, b, f),
    });
  }
  const usedWeight = used.reduce((s, f) => s + f.weight, 0);
  if (usedWeight === 0)
    return {
      similarity: null,
      coverage: 0,
      matching: [],
      differing: [],
      features: [],
    };

  const distance = used.reduce((s, f) => s + f.weight * f.diff, 0) / usedWeight;
  return {
    similarity: 1 - distance,
    coverage: usedWeight / totalWeight,
    matching: used
      .filter((f) => f.diff <= config.matchingDiff)
      .map((f) => f.label),
    differing: used
      .filter((f) => f.diff >= config.differingDiff)
      .map((f) => f.label),
    features: used,
  };
}

export function findSimilarCases(applicantValues, cases, config) {
  const results = [];
  let skipped = 0;
  for (const c of cases) {
    const cmp = compare(applicantValues, computeMetrics(c).values, config);
    if (cmp.similarity === null || cmp.coverage < config.minCoverage) {
      skipped++;
      continue;
    }
    results.push({
      caseId: c.case_id,
      caseType: c.case_type,
      description: c.description,
      outcome: c.outcome, 
      similarity: cmp.similarity,
      coverage: cmp.coverage,
      matching: cmp.matching,
      differing: cmp.differing,
    });
  }
  results.sort((x, y) => y.similarity - x.similarity);

  const top = results.slice(0, config.topK);
  const score =
    top.length === 0
      ? null
      : top.reduce((s, r) => s + r.similarity, 0) / top.length;
  return {
    score, 
    level: levelFor(score, config.levels),
    closeCount: results.filter((r) => r.similarity >= config.closeThreshold)
      .length,
    compared: results.length,
    skipped,
    matches: results.slice(0, 5),
  };
}
