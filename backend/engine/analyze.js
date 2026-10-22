// analyze.js - runs the WHOLE engine once for one application, then builds two views of the same result.
// Client view: friendly guidance. Bank view: the same evidence plus rules, risk and bank-specific details.
import { computeMetrics } from "./metrics.js";
import { calcCompleteness } from "./completeness.js";
import { findSimilarCases } from "./similarity.js";
import { scoreFeasibility } from "./scoring.js";
import { calcConfidence } from "./confidence.js";
import { buildContext, evaluateRules } from "./rules.js";
import { assessRisk } from "./risk.js";
import { runStressTests, makeMyPlanWork } from "./scenario.js";
import { calcReadiness } from "./readiness.js";

const slim = (s) => { if (!s) return s; const { inputs, ...rest } = s; return rest; };
const slimPlan = (p) => ({ ...p, baseline: slim(p.baseline), scenario: slim(p.scenario) });

export const CLIENT_NOTE = "Masar gives guidance only. It is not a credit score and not a financing decision. The bank's reviewer decides.";
export const BANK_NOTE = "Decision support only. Not a credit score and not a repayment probability. A human reviewer makes the final decision.";
const DATA_NOTE = "Historical cases are synthetic demonstration data and their outcomes are simulated.";

export function analyzeApplication({ inputs, bank = null, cases, configs }) {
  const metrics = computeMetrics(inputs);
  const completeness = calcCompleteness(inputs);
  const similarity = findSimilarCases(metrics.values, cases, configs.similarity);
  const feasibility = scoreFeasibility(metrics.values, configs.scoring);
  const confidence = calcConfidence({ completeness: completeness.value, similarity }, configs.confidence);

  const stress = runStressTests(inputs, configs.scenarios);
  const analysis = {
    meta: { analyzedAt: new Date().toISOString(), dataNote: DATA_NOTE },
    completeness,
    metrics: metrics.values,
    why: metrics.why,
    feasibility,
    similarity,
    confidence,
    readiness: calcReadiness(feasibility, confidence, configs.scoring),
    stressTests: { baseline: slim(stress.baseline), tests: stress.tests.map((t) => ({ ...t, result: slim(t.result) })) },
    planFix: slimPlan(makeMyPlanWork(inputs, configs.scenarios, null)),   // client target: default, NOT the bank's secret limit
    bank: null
  };

  if (bank) {
    const context = buildContext(metrics.values, completeness.value, confidence);
    const rules = evaluateRules(context, bank, configs.rules);
    analysis.bank = {
      id: bank.bankId,
      name: bank.name,
      rules,
      mandatoryReview: rules.fired.some((f) => f.severity === "mandatory_review"),
      risk: assessRisk({ values: metrics.values, feasibility, bank, config: configs.risk, completeness: completeness.value, similarity }),
      planFix: slimPlan(makeMyPlanWork(inputs, configs.scenarios, bank))
    };
  }
  return analysis;
}

// What the SME owner may see: no bank thresholds, no rules, no risk drivers, no simulated outcomes.
export function toClientView(a) {
  return {
    note: CLIENT_NOTE,
    dataNote: a.meta.dataNote,
    analyzedAt: a.meta.analyzedAt,
    completeness: a.completeness,
    metrics: a.metrics,
    feasibility: a.feasibility,
    readiness: a.readiness,
    similarity: {
      score: a.similarity.score, level: a.similarity.level, closeCount: a.similarity.closeCount,
      matches: a.similarity.matches.map((m) => ({
        caseId: m.caseId, description: m.description, similarity: m.similarity,
        coverage: m.coverage, matching: m.matching, differing: m.differing
      }))
    },
    confidence: { level: a.confidence.level, reasons: a.confidence.reasons },
    stressTests: a.stressTests,
    planFix: a.planFix
  };
}

// What the bank reviewer sees: everything, including this bank's rules, risk and outcomes (simulated).
export function toBankView(a) {
  return {
    note: BANK_NOTE,
    dataNote: a.meta.dataNote,
    analyzedAt: a.meta.analyzedAt,
    completeness: a.completeness,
    metrics: a.metrics,
    why: a.why,
    feasibility: a.feasibility,
    readiness: a.readiness,
    similarity: a.similarity,
    confidence: a.confidence,
    stressTests: a.stressTests,
    bank: a.bank
  };
}
