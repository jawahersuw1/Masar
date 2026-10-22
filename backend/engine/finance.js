//Basic Formulas

const missing = (...xs) =>
  xs.some((x) => x === null || x === undefined || Number.isNaN(x));

// 1) Profit and margin
// profit = revenue - costs        margin = profit / revenue
export function calcProfit(revenue, costs) {
  if (missing(revenue, costs)) {
    return { profit: null, margin: null, why: "Revenue or costs missing" };
  }
  const profit = revenue - costs;
  const margin = revenue === 0 ? null : profit / revenue;
  return {
    profit,
    margin,
    why: `profit = ${revenue} - ${costs} = ${profit}`,
  };
}

// 2) Monthly installment (standard loan formula)
// r = yearlyRate / 12      n = years * 12
// installment = loan * r / (1 - (1 + r)^-n)       (if rate is 0: loan / n)
export function calcInstallment(loan, annualRate, years) {
  if (missing(loan, annualRate, years) || years <= 0) {
    return { value: null, why: "Loan, rate or term missing" };
  }
  const n = years * 12;
  if (annualRate === 0) {
    return { value: loan / n, why: `${loan} / ${n} months (0% rate)` };
  }
  const r = annualRate / 12;
  const value = (loan * r) / (1 - Math.pow(1 + r, -n));
  return {
    value,
    why: `loan ${loan}, rate ${annualRate * 100}% a year, ${n} months`,
  };
}

// 3) DSCR = monthly profit / monthly installment
export function calcDSCR(profit, installment) {
  if (missing(profit, installment) || installment <= 0) {
    return { value: null, why: "Profit or installment missing" };
  }
  const value = profit / installment;
  return {
    value,
    why: `profit ${profit} / installment ${Math.round(installment)}`,
  };
}

// 4) Owner contribution % = owner money / (loan + owner money)
export function calcContributionPct(ownerContribution, loan) {
  if (missing(ownerContribution, loan) || ownerContribution + loan <= 0) {
    return { value: null, why: "Owner contribution or loan missing" };
  }
  const value = ownerContribution / (loan + ownerContribution);
  return {
    value,
    why: `owner ${ownerContribution} / (loan ${loan} + owner ${ownerContribution})`,
  };
}

// 5) Monthly cash left = profit - installment (negative means money is short)
export function calcCashLeft(profit, installment) {
  if (missing(profit, installment)) {
    return { value: null, why: "Profit or installment missing" };
  }
  const value = profit - installment;
  return {
    value,
    why: `profit ${profit} - installment ${Math.round(installment)}`,
  };
}

// 6) Break-even (how much minium sales we need to do to generate enough profit to cover the installment)
// break-even revenue = installment / margin
// safety margin = (revenue - break-even revenue) / revenue   (Current sales kitni percentage kam ho sakti hain before tum break-even point par aa jao.)
export function calcBreakEven(revenue, margin, installment) {
  if (missing(revenue, margin, installment) || revenue <= 0) {
    return {
      breakEvenRevenue: null,
      safetyMargin: null,
      why: "Revenue, margin or installment missing",
    };
  }
  if (margin <= 0) {
    return {
      breakEvenRevenue: null,
      safetyMargin: null,
      why: "Margin is zero or negative, profit can never cover the installment",
    };
  }
  const breakEvenRevenue = installment / margin;
  const safetyMargin = (revenue - breakEvenRevenue) / revenue;
  return {
    breakEvenRevenue,
    safetyMargin,
    why: `installment ${Math.round(installment)} / margin ${(margin * 100).toFixed(0)}%`,
  };
}

// 7) Liquidity buffer = months of installments the cash on hand can cover
export function calcLiquidityBuffer(cashOnHand, installment) {
  if (missing(cashOnHand, installment) || installment <= 0) {
    return { value: null, why: "Cash on hand or installment missing" };
  }
  const value = cashOnHand / installment;
  return {
    value,
    why: `cash ${cashOnHand} / installment ${Math.round(installment)}`,
  };
}
