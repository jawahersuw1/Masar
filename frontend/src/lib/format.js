// Display helpers. All numbers shown to people go through here.
const nf0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
export const DASH = '—';
export const isNil = (v) => v === null || v === undefined || Number.isNaN(v);
export const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

export const sar = (v) => (isNil(v) ? DASH : `SAR ${nf0.format(Math.round(v))}`);
export const int = (v) => (isNil(v) ? DASH : nf0.format(Math.round(v)));
export const dec = (v, d = 2) => (isNil(v) ? DASH : Number(v).toFixed(d));
export const pct = (fraction, d = 0) => (isNil(fraction) ? DASH : `${(fraction * 100).toFixed(d)}%`);
export const months = (v) => (isNil(v) ? DASH : `${Number(v).toFixed(1)} months`);
export const times = (v) => (isNil(v) ? DASH : `${Number(v).toFixed(2)}×`);
export const unique = (list) => [...new Set(list ?? [])];

export function formatDate(iso, withTime = true) {
  if (!iso) return DASH;
  const d = new Date(iso);
  const opts = { day: '2-digit', month: 'short', year: 'numeric', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}) };
  return d.toLocaleString('en-GB', opts);
}

export const STATUS_LABEL = {
  submitted: 'Submitted',
  in_review: 'In review',
  changes_requested: 'Changes requested',
  accepted: 'Accepted',
  declined: 'Declined',
  more_info_requested: 'Changes requested', // old value, kept so old data still shows
  modified: 'Changes requested',            // old value, kept so old data still shows
};
export const FINAL_STATUSES = ['accepted', 'declined'];
export const ACTION_LABEL = { accept: 'Accepted', modify: 'Asked for changes', decline: 'Declined', request_info: 'Asked for changes' };

// Friendly names for the keys the engine uses.
export const METRIC_LABELS = {
  experience: 'Owner experience', yearsOperating: 'Years operating', expectedGrowth: 'Expected growth',
  dscr: 'Debt service coverage', margin: 'Profit margin', contributionPct: 'Your share of the project',
  safetyMargin: 'Break-even safety margin', liquidityBuffer: 'Cash buffer', employees: 'Employees',
  cashLeftPct: 'Cash left after the loan', installmentToRevenue: 'Installment vs. sales', loanToAnnualRevenue: 'Loan vs. yearly sales',
  completeness: 'Answers given', closeCases: 'Similar past cases', monthlyRevenue: 'Monthly revenue', sector: 'Sector',
};
export const metricLabel = (key) => METRIC_LABELS[key] ?? key;

const FRACTION_KEYS = ['expectedGrowth', 'margin', 'contributionPct', 'safetyMargin', 'cashLeftPct', 'installmentToRevenue'];
export function formatMetric(key, v) {
  if (isNil(v)) return DASH;
  if (FRACTION_KEYS.includes(key)) return pct(v);
  if (key === 'dscr' || key === 'loanToAnnualRevenue') return times(v);
  if (key === 'liquidityBuffer') return months(v);
  if (key === 'experience' || key === 'yearsOperating') return `${int(v)} yrs`;
  if (key === 'completeness') return `${int(v)}%`;
  return int(v);
}