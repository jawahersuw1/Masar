// bank.js - turns a row from the banks table (plus its caution sectors) into a bank settings object.
// MySQL returns DECIMAL columns as text, so every number is converted with Number().

export function bankFromRow(row, cautionRows = []) {
  return {
    bankId: row.bank_id,
    name: row.name,
    profileId: Number(row.profile_id),
    minDscr: Number(row.min_dscr),
    minContributionPct: Number(row.min_contribution_pct),
    minCompleteness: Number(row.min_completeness),
    minYearsOperating: Number(row.min_years_operating),
    maxTermYears: Number(row.max_term_years),
    minLoan: Number(row.min_loan),
    maxLoan: Number(row.max_loan),
    rateMin: Number(row.rate_min),
    rateMax: Number(row.rate_max),
    weights: {
      financial: Number(row.w_financial),
      liquidity: Number(row.w_liquidity),
      financingPressure: Number(row.w_financing_pressure),
      business: Number(row.w_business),
      operational: Number(row.w_operational),
      dataConfidence: Number(row.w_data_confidence),
    },
    cautionSectorIds: cautionRows.map((r) => Number(r.sector_id)),
  };
}
