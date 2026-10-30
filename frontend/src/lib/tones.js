// One tone vocabulary (good / warn / bad / info / neutral) used by pills, bars and gauges.
export const TONE_VAR = { good: 'var(--good)', warn: 'var(--warn)', bad: 'var(--bad)', info: 'var(--info)', neutral: 'var(--steel)' };
export const TONE_ON_DARK = { good: '#5fd1ae', warn: '#f5b964', bad: '#ff8b7e', info: '#8ec5ee', neutral: '#b9ccdb' };

const by = (map) => (label) => map[String(label ?? '').toLowerCase()] ?? 'neutral';

export const bandTone = by({ strong: 'good', moderate: 'warn', weak: 'bad' });            // scores, resilience
export const levelTone = by({ high: 'good', medium: 'warn', low: 'bad' });                // similarity, confidence
export const riskTone = by({ low: 'good', medium: 'warn', high: 'bad' });                 // risk bands
export const pressureTone = by({ low: 'good', moderate: 'warn', high: 'bad' });           // cash-flow pressure
export const statusTone = by({ submitted: 'info', in_review: 'info', changes_requested: 'warn', more_info_requested: 'warn', modified: 'warn', accepted: 'good', declined: 'bad' });
export const outcomeTone = by({ repaid: 'good', late: 'warn', defaulted: 'bad' });
export const actionTone = by({ accept: 'good', modify: 'warn', decline: 'bad', request_info: 'warn' });

// Same cut-offs the backend uses for strengths (>=70) and concerns (<40).
export const componentTone = (s) => (s >= 70 ? 'good' : s < 40 ? 'bad' : 'warn');
export const dscrTone = (v) => (v === null || v === undefined ? 'neutral' : v >= 1.5 ? 'good' : v >= 1 ? 'warn' : 'bad');