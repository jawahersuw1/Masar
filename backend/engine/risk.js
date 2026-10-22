// risk.js - the Loan Risk Assessment: six risk areas, an overall risk, and named risk drivers.
// Risk is 0-100, higher = riskier. It is NOT a credit score and NOT a repayment probability.
//   area risk   = 100 - area score          (business, financial, operational reuse the feasibility scores)
//   overall     = weighted average of area risks, using THIS BANK's weights (missing areas are skipped, weights re-scaled)
//   driver      = one component's share of the overall risk. All driver contributions add up to the overall risk.
import { scoreArea } from "./scoring.js";

const AREAS = [
  { key: "business", label: "Business risk", from: "feasibility" },
  { key: "financial", label: "Financial risk", from: "feasibility" },
  { key: "liquidity", label: "Liquidity risk", from: "config" },
  {
    key: "financingPressure",
    label: "Financing-pressure risk",
    from: "config",
  },
  { key: "operational", label: "Operational risk", from: "feasibility" },
  { key: "dataConfidence", label: "Data-confidence risk", from: "config" },
];
const DUMMY_BANDS = { strong: 70, moderate: 45 }; // scoreArea needs bands; we use our own risk bands below

export function riskBand(risk, bands) {
  if (risk === null) return "Not assessed";
  if (risk >= bands.high) return "High";
  if (risk >= bands.medium) return "Medium";
  return "Low";
}

export function assessRisk({
  values,
  feasibility,
  bank,
  config,
  completeness,
  similarity,
}) {
  const vals = {
    ...values,
    completeness,
    closeCount: similarity?.closeCount ?? 0,
  };

  // 1. score every area
  const areas = AREAS.map((a) => {
    const res =
      a.from === "feasibility"
        ? feasibility[a.key]
        : scoreArea(vals, config[a.key], DUMMY_BANDS);
    const risk = res.score === null ? null : 100 - res.score;
    return { ...a, res, risk, weight: bank.weights[a.key] };
  });

  // 2. overall risk with this bank's weights
  const used = areas.filter((a) => a.risk !== null);
  const totalW = used.reduce((s, a) => s + a.weight, 0);
  const overallRisk =
    totalW === 0
      ? null
      : used.reduce((s, a) => s + a.weight * a.risk, 0) / totalW;
  // How much of the bank's total weight could actually be assessed (1 = all six areas)
  const allW = areas.reduce((s, a) => s + a.weight, 0);
  const coverage = allW === 0 ? 0 : totalW / allW;

  // 3. drivers: each component's share of the overall risk (same component in two areas is merged)
  const byKey = new Map();
  for (const a of used) {
    const compW = a.res.components.reduce((s, c) => s + c.weight, 0);
    for (const c of a.res.components) {
      const contribution =
        (100 - c.componentScore) * (c.weight / compW) * (a.weight / totalW);
      const d = byKey.get(c.key) ?? {
        key: c.key,
        label: c.label,
        value: c.value,
        componentScore: c.componentScore,
        reason: c.reason,
        contribution: 0,
        areas: [],
      };
      d.contribution += contribution;
      d.areas.push(a.label);
      byKey.set(c.key, d);
    }
  }
  const drivers = [...byKey.values()].sort(
    (x, y) => y.contribution - x.contribution,
  );

  return {
    overall: {
      risk: overallRisk,
      band: riskBand(overallRisk, config.bands),
      coverage, // 1 = every area assessed
      provisional: coverage < 0.999, // true = some areas could not be assessed, do not read the band as final
    },
    areas: areas.map((a) => ({
      key: a.key,
      label: a.label,
      risk: a.risk,
      band: riskBand(a.risk, config.bands),
      weight: a.weight,
      coverage: a.res.coverage,
      missing: a.res.missing,
    })),
    drivers,
    topDriver: drivers[0] ?? null,
  };
}
