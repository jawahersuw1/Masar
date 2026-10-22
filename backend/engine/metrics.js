//turns the client's answers into the numbers the scores use.
import {
  calcProfit,
  calcInstallment,
  calcDSCR,
  calcContributionPct,
  calcCashLeft,
  calcBreakEven,
  calcLiquidityBuffer,
} from "./finance.js";

const num = (x) =>
  x === null || x === undefined || x === "" ? null : Number(x);

export function computeMetrics(inputs) {
  const revenue = num(inputs.monthly_revenue);
  const costs = num(inputs.monthly_costs);
  const loan = num(inputs.loan_amount);
  const rate = num(inputs.annual_interest_rate);
  const term = num(inputs.term_years);
  const owner = num(inputs.owner_contribution);
  const cash = num(inputs.cash_on_hand);

  const p = calcProfit(revenue, costs);
  const inst = calcInstallment(loan, rate, term);
  const dscr = calcDSCR(p.profit, inst.value);
  const contrib = calcContributionPct(owner, loan);
  const cashLeft = calcCashLeft(p.profit, inst.value);
  const be = calcBreakEven(revenue, p.margin, inst.value);
  const buffer = calcLiquidityBuffer(cash, inst.value);
  const ratio = (a, b) => (a === null || b === null || b <= 0 ? null : a / b);

  return {
    values: {
      sector: inputs.sector_id ?? null,
      monthlyRevenue: revenue,
      termYears: term,
      loanAmount: loan,
      experience: num(inputs.owner_experience_yrs),
      yearsOperating: num(inputs.years_operating),
      expectedGrowth: num(inputs.expected_growth),
      employees: num(inputs.employees),
      profit: p.profit,
      margin: p.margin,
      installment: inst.value,
      dscr: dscr.value,
      contributionPct: contrib.value,
      cashLeft: cashLeft.value,
      breakEvenRevenue: be.breakEvenRevenue,
      safetyMargin: be.safetyMargin,
      liquidityBuffer: buffer.value,
      installmentToRevenue: ratio(inst.value, revenue),
      loanToAnnualRevenue: ratio(loan, revenue === null ? null : revenue * 12),
      cashLeftPct: ratio(cashLeft.value, revenue),
    },
    why: {
      profit: p.why,
      installment: inst.why,
      dscr: dscr.why,
      contributionPct: contrib.why,
      cashLeft: cashLeft.why,
      safetyMargin: be.why,
      liquidityBuffer: buffer.why,
    },
  };
}
