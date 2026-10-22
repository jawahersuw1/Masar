// completeness.js - how much of the questionnaire was answered.

export const ANSWER_FIELDS = [
  "owner_experience_yrs",
  "sector_id",
  "years_operating",
  "employees",
  "monthly_revenue",
  "monthly_costs",
  "cash_on_hand",
  "expected_growth",
  "loan_amount",
  "term_years",
  "annual_interest_rate",
  "owner_contribution",
];

const isAnswered = (x) =>
  x !== null && x !== undefined && x !== "" && !Number.isNaN(x);

export function calcCompleteness(inputs) {
  const missingFields = ANSWER_FIELDS.filter((f) => !isAnswered(inputs?.[f]));
  const answered = ANSWER_FIELDS.length - missingFields.length;
  const value = Math.round((answered / ANSWER_FIELDS.length) * 100);
  return {
    value,
    answered,
    total: ANSWER_FIELDS.length,
    missing: missingFields,
    why: `${answered} of ${ANSWER_FIELDS.length} answers given`,
  };
}
