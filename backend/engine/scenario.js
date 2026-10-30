// scenario.js - the "what if" engine: simulator, stress tests, and "Make My Plan Work".
// Everything re-uses computeMetrics, so the numbers always match the rest of the system.
// Results are ILLUSTRATIVE. They are never an approval and never a bank decision.
import { computeMetrics } from "./metrics.js";

const num = (x) =>
  x === null || x === undefined || x === "" ? null : Number(x);

// ---------- 1. apply changes to a COPY of the inputs ----------
// changes: revenueChange (+0.10 = 10% more sales), costChange, rateChange (+0.02 = 2 points),
//          loan_amount, owner_contribution, term_years, cash_on_hand (absolute values),
//          delayMonths (months before the revenue change starts)
// revenueChange may be the text "expectedGrowth" to use the applicant's own expected growth.
export function applyChanges(inputs, changes = {}) {
  const out = { ...inputs };
  const revenue = num(inputs.monthly_revenue);
  const costs = num(inputs.monthly_costs);
  const rate = num(inputs.annual_interest_rate);

  let revenueChange = changes.revenueChange ?? 0;
  if (revenueChange === "expectedGrowth")
    revenueChange = num(inputs.expected_growth) ?? 0;

  if (revenue !== null) out.monthly_revenue = revenue * (1 + revenueChange);
  if (costs !== null)
    out.monthly_costs = costs * (1 + (changes.costChange ?? 0));
  if (rate !== null)
    out.annual_interest_rate = rate + (changes.rateChange ?? 0);
  for (const k of [
    "loan_amount",
    "owner_contribution",
    "term_years",
    "cash_on_hand",
  ]) {
    if (changes[k] !== undefined) out[k] = changes[k];
  }
  return out;
}

// ---------- 2. labels ----------
export function pressureLabel(dscr, bands) {
  if (dscr === null) return "Not enough data";
  if (dscr >= bands.low) return "Low";
  if (dscr >= bands.moderate) return "Moderate";
  return "High";
}
export function resilienceLabel(safetyMargin, bands) {
  if (safetyMargin === null) return "Not enough data";
  if (safetyMargin >= bands.strong) return "Strong";
  if (safetyMargin >= bands.moderate) return "Moderate";
  return "Weak";
}

// ---------- 3. run one scenario ----------
export function runScenario(inputs, changes, config) {
  const modified = applyChanges(inputs, changes);
  const v = computeMetrics(modified).values;

  const cash = num(modified.cash_on_hand);
  const months = Number(changes?.delayMonths ?? 0);

  // Expansion timing: the installment starts now, but the revenue change starts only after the delay.
  let delay = null;
  if (months > 0 && v.installment !== null) {
    const before = computeMetrics(
      applyChanges(inputs, { ...changes, revenueChange: 0 }),
    ).values;
    const cashLeftPerMonth =
      before.profit === null ? null : before.profit - v.installment;
    const cashAfterDelay =
      cash === null || cashLeftPerMonth === null
        ? null
        : cash + months * cashLeftPerMonth;
    delay = {
      months,
      cashLeftPerMonth,
      cashAfterDelay,
      runwayMonths:
        cash !== null && cashLeftPerMonth !== null && cashLeftPerMonth < 0
          ? cash / -cashLeftPerMonth
          : null,
      runsOutDuringDelay: cashAfterDelay === null ? null : cashAfterDelay < 0,
    };
  }

  const n = num(modified.term_years);
  const totalInterest =
    v.installment !== null && n !== null
      ? v.installment * n * 12 - num(modified.loan_amount)
      : null;

  return {
    inputs: modified,
    values: { ...v, totalInterest },
    pressure: pressureLabel(v.dscr, config.pressureBands),
    resilience: resilienceLabel(v.safetyMargin, config.resilienceBands),
    delay,
  };
}

// ---------- 4. compare with the baseline ----------
export function compareToBaseline(base, scn) {
  const diff = (k) => {
    const a = base.values[k],
      b = scn.values[k];
    return {
      before: a,
      after: b,
      change: a === null || b === null ? null : b - a,
    };
  };
  return {
    dscr: diff("dscr"),
    cashLeft: diff("cashLeft"),
    liquidityBuffer: diff("liquidityBuffer"),
    safetyMargin: diff("safetyMargin"),
    installment: diff("installment"),
    pressure: { before: base.pressure, after: scn.pressure },
  };
}

// ---------- 5. preset stress tests ----------
export function runStressTests(inputs, config) {
  const baseline = runScenario(inputs, {}, config);
  const tests = config.presets.map((p) => {
    const result = runScenario(inputs, p.changes, config);
    const dscrOk =
      result.values.dscr === null ? null : result.values.dscr >= 1.0;
    const survives =
      dscrOk === null
        ? null
        : dscrOk && result.delay?.runsOutDuringDelay !== true;
    return {
      id: p.id,
      name: p.name,
      result,
      comparison: compareToBaseline(baseline, result),
      survives,
    };
  });
  return { baseline, tests };
}

// ---------- 6. "Make My Plan Work" ----------
// Two levers only: a longer term, and extra owner money that replaces part of the loan (project cost stays the same).
// Rules: extra owner money is capped at a share of the cash on hand, and the cash buffer must not fall below
// the lower of (baseline buffer, minimum buffer). Picks the SMALLEST change that reaches the target DSCR.
export function makeMyPlanWork(inputs, config, bank = null) {
  const opt = config.optimizer;
  const baseline = runScenario(inputs, {}, config);
  const label =
    "Illustrative scenario only. Not approved or offered by any bank.";
  const dscr0 = baseline.values.dscr;
  const loan = num(inputs.loan_amount),
    owner = num(inputs.owner_contribution) ?? 0,
    term0 = num(inputs.term_years);

  if (dscr0 === null || loan === null || term0 === null) {
    return {
      status: "not_possible",
      label,
      reason: "Revenue, costs, loan, rate or term is missing",
    };
  }
  const target = bank?.minDscr ?? opt.defaultTargetDscr;
  if (dscr0 >= target) return { status: "not_needed", label, target, baseline };

  // Far from the target: a longer term and a little more owner money cannot close a gap this big.
  // Most often the loan is too large for the profit, or a number was typed wrong (for example extra zeros).
  // So we say that clearly instead of showing a useless "closest plan".
  const farDscr = opt.farDscr ?? 0.5;
  if (dscr0 < farDscr)
    return { status: "too_far", label, target, farDscr, baseline };

  const maxTerm = Math.max(term0, bank?.maxTermYears ?? opt.maxTermYears);
  const cash = num(inputs.cash_on_hand);
  const cap = cash === null ? 0 : opt.cashShareLimit * cash;
  const bufferFloor =
    baseline.values.liquidityBuffer === null
      ? null
      : Math.min(opt.minBufferMonths, baseline.values.liquidityBuffer);

  const candidates = [];
  for (let t = term0; t <= maxTerm; t++) {
    for (let k = 0; k <= opt.steps; k++) {
      const extra = Math.min(
        loan,
        Math.round((cap * k) / opt.steps / 1000) * 1000,
      );
      const changes = {
        term_years: t,
        loan_amount: loan - extra,
        owner_contribution: owner + extra,
      };
      if (cash !== null) changes.cash_on_hand = cash - extra;
      const scn = runScenario(inputs, changes, config);
      const bufferOk =
        bufferFloor === null ||
        scn.values.liquidityBuffer === null ||
        scn.values.liquidityBuffer >= bufferFloor;
      if (!bufferOk) continue;
      const cost =
        (t - term0) / Math.max(1, maxTerm - term0) +
        (cap > 0 ? extra / cap : 0);
      candidates.push({
        t,
        extra,
        changes,
        scn,
        cost,
        reaches: scn.values.dscr >= target,
      });
    }
  }
  const reaching = candidates
    .filter((c) => c.reaches)
    .sort((a, b) => a.cost - b.cost || a.extra - b.extra);
  const best =
    reaching[0] ??
    candidates.sort((a, b) => b.scn.values.dscr - a.scn.values.dscr)[0];
  if (!best)
    return {
      status: "not_possible",
      label,
      reason: "No option keeps the cash buffer safe",
    };

  const notes = [];
  if (best.t > term0)
    notes.push(
      `Longer term: ${term0} to ${best.t} years. This lowers the installment but increases total interest paid.`,
    );
  if (best.extra > 0)
    notes.push(
      `Owner adds ${best.extra.toLocaleString("en-US")} SAR, so the loan falls to ${(loan - best.extra).toLocaleString("en-US")} SAR. The project cost stays the same.`,
    );
  if (!reaching.length)
    notes.push(
      "These two levers are not enough to reach the target DSCR. A smaller project or higher profit would be needed.",
    );

  return {
    status: reaching.length ? "found" : "partial",
    label,
    target,
    baseline,
    scenario: best.scn,
    changes: {
      termFrom: term0,
      termTo: best.t,
      extraOwner: best.extra,
      newLoan: loan - best.extra,
    },
    comparison: compareToBaseline(baseline, best.scn),
    notes,
  };
}
