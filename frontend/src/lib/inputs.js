// The questionnaire: the 12 answers the backend engine understands, with plain-language labels.
import { isNil, sar, pct, int } from './format.js';

export const ANSWER_KEYS = [
  'owner_experience_yrs', 'sector_id', 'years_operating', 'employees', 'monthly_revenue', 'monthly_costs',
  'cash_on_hand', 'expected_growth', 'loan_amount', 'term_years', 'annual_interest_rate', 'owner_contribution',
];

export const QUESTION_GROUPS = [
  {
    id: 'owner', title: 'About you', description: 'Your own experience running or managing a business.',
    fields: [{ key: 'owner_experience_yrs', label: 'Years of business experience', unit: 'years', min: 0, max: 60, step: 1 }],
  },
  {
    id: 'business', title: 'About the business', description: 'Use a typical month, before the new loan.',
    fields: [
      { key: 'sector_id', label: 'Sector', kind: 'sector' },
      { key: 'years_operating', label: 'Years operating', unit: 'years', min: 0, max: 100, step: 1 },
      { key: 'employees', label: 'Employees', unit: 'people', min: 0, step: 1 },
      { key: 'monthly_revenue', label: 'Monthly revenue', unit: 'SAR', kind: 'money', min: 0, hint: 'Money coming in each month' },
      { key: 'monthly_costs', label: 'Monthly costs', unit: 'SAR', kind: 'money', min: 0, hint: 'Rent, salaries, supplies. Leave out the new loan.' },
      { key: 'cash_on_hand', label: 'Cash on hand', unit: 'SAR', kind: 'money', min: 0, hint: 'Spare cash the business has today' },
      { key: 'expected_growth', label: 'Expected sales growth', unit: '%', kind: 'percent', min: 0, max: 100, hint: 'Per year. 10 means 10% more sales.' },
    ],
  },
  {
    id: 'financing', title: 'The financing you want', description: 'The loan you are thinking about.',
    fields: [
      { key: 'loan_amount', label: 'Loan amount', unit: 'SAR', kind: 'money', min: 0 },
      { key: 'term_years', label: 'Repayment period', unit: 'years', min: 1, max: 30, step: 1 },
      { key: 'annual_interest_rate', label: 'Interest rate per year', unit: '%', kind: 'percent', min: 0, max: 40, step: 0.1, hint: 'Ask the bank for its rate. 8 means 8%.' },
      { key: 'owner_contribution', label: 'Your own money in the project', unit: 'SAR', kind: 'money', min: 0 },
    ],
  },
];

export const FIELD_BY_KEY = Object.fromEntries(QUESTION_GROUPS.flatMap((g) => g.fields).map((f) => [f.key, f]));
export const emptyAnswers = () => Object.fromEntries(ANSWER_KEYS.map((k) => [k, '']));
export const isFilled = (v) => v !== '' && v !== null && v !== undefined && !Number.isNaN(Number(v));
export const countAnswered = (answers) => ANSWER_KEYS.filter((k) => isFilled(answers[k])).length;

export const exampleAnswers = (sectorId) => ({
  owner_experience_yrs: '5', sector_id: String(sectorId ?? ''), years_operating: '3', employees: '12',
  monthly_revenue: '120000', monthly_costs: '96000', cash_on_hand: '60000', expected_growth: '15',
  loan_amount: '700000', term_years: '5', annual_interest_rate: '8', owner_contribution: '150000',
});

// Form strings → the numbers the API expects (percent fields become fractions, blanks become null).
export function toApiInputs(answers) {
  const out = {};
  for (const key of ANSWER_KEYS) {
    const raw = answers[key];
    if (!isFilled(raw)) { out[key] = null; continue; }
    const n = Number(raw);
    out[key] = FIELD_BY_KEY[key].kind === 'percent' ? Number((n / 100).toFixed(4)) : n;
  }
  return out;
}

// API inputs → readable text (used on the reviewer's "answers" tab).
export function formatAnswer(key, value, sectors = []) {
  if (isNil(value)) return null;
  const field = FIELD_BY_KEY[key];
  if (key === 'sector_id') return sectors.find((s) => s.id === Number(value))?.name ?? `Sector ${value}`;
  if (field?.kind === 'money') return sar(value);
  if (field?.kind === 'percent') return pct(Number(value), 1);
  return `${int(value)} ${field?.unit ?? ''}`.trim();
}