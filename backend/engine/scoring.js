// scoring.js - turns numbers into 0-100 scores with visible reasons.
// Component score = how far the value is between "worst" (0 points) and "best" (100 points).
// Area score = weighted average of its components.
// If a number is missing, that component is skipped and the other weights are re-scaled.

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

export function scoreComponent(value, worst, best) {
  return clamp((value - worst) / (best - worst), 0, 1) * 100;
}

export function bandFor(score, bands) {
  if (score === null) return "Not enough data";
  if (score >= bands.strong) return "Strong";
  if (score >= bands.moderate) return "Moderate";
  return "Weak";
}

export function scoreArea(values, area, bands) {
  const totalWeight = area.components.reduce((s, c) => s + c.weight, 0);
  const used = [];
  const missing = [];

  for (const c of area.components) {
    const value = values[c.key];
    if (value === null || value === undefined || Number.isNaN(value)) {
      missing.push(c.key);
    } else {
      used.push({
        ...c,
        value,
        componentScore: scoreComponent(value, c.worst, c.best),
      });
    }
  }

  const usedWeight = used.reduce((s, c) => s + c.weight, 0);
  if (usedWeight === 0) {
    return {
      score: null,
      band: bandFor(null, bands),
      coverage: 0,
      components: [],
      missing,
      strengths: [],
      concerns: [],
    };
  }

  const score =
    used.reduce((s, c) => s + c.weight * c.componentScore, 0) / usedWeight;
  const components = used.map((c) => ({
    key: c.key,
    label: c.label,
    value: c.value,
    componentScore: c.componentScore,
    weight: c.weight,
    points: (c.weight / usedWeight) * c.componentScore,
    reason: c.reason,
  }));

  return {
    score,
    band: bandFor(score, bands),
    coverage: usedWeight / totalWeight,
    components,
    missing,
    strengths: components
      .filter((c) => c.componentScore >= 70)
      .map((c) => c.label),
    concerns: components
      .filter((c) => c.componentScore < 40)
      .map((c) => c.label),
  };
}

export function scoreFeasibility(values, config) {
  return {
    business: scoreArea(values, config.business, config.bands),
    financial: scoreArea(values, config.financial, config.bands),
    operational: scoreArea(values, config.operational, config.bands),
  };
}
