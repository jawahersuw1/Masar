import { dscrTone } from '../../lib/tones.js';
import { DASH, dec, isNil, months, pct, sar, times } from '../../lib/format.js';
import Card, { CardHeader } from '../ui/Card.jsx';

const TONE_TEXT = { good: 'text-good', warn: 'text-warn', bad: 'text-bad', neutral: 'text-heading', info: 'text-info' };

function Tile({ label, value, hint, tone = 'neutral', why }) {
  return (
    <div className="rounded-xl border border-line-soft p-4">
      <div className="text-[11.5px] font-semibold text-muted">{label}</div>
      <div className={`mt-1 font-mono text-[21px] font-semibold ${TONE_TEXT[tone]}`}>{value}</div>
      <p className="mt-1 text-[11.5px] leading-snug text-faint">{hint}</p>
      {why && <p className="mt-2 break-words border-t border-line-soft pt-2 font-mono text-[10.5px] text-muted">{why}</p>}
    </div>
  );
}

// `why` (the engine's own calculation notes) is only present in the reviewer view.
export default function MetricsGrid({ metrics: m, why = {} }) {
  const cashTone = isNil(m.cashLeft) ? 'neutral' : m.cashLeft < 0 ? 'bad' : 'good';
  return (
    <Card>
      <CardHeader title="Your numbers" description="Worked out from your answers with standard formulas." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Monthly profit" value={sar(m.profit)} hint="Revenue minus costs" why={why.profit} />
        <Tile label="Profit margin" value={pct(m.margin)} hint="Share of each riyal of sales you keep" />
        <Tile label="Monthly installment" value={sar(m.installment)} hint="What the loan costs you every month" why={why.installment} />
        <Tile label="Debt service coverage" value={times(m.dscr)} tone={dscrTone(m.dscr)} hint="Profit divided by installment. Above 1.0 means profit covers the payment." why={why.dscr} />
        <Tile label="Cash left each month" value={sar(m.cashLeft)} tone={cashTone} hint="Profit after paying the installment" why={why.cashLeft} />
        <Tile label="Break-even sales" value={sar(m.breakEvenRevenue)} hint="Lowest monthly sales that still cover the installment" />
        <Tile label="Safety margin" value={pct(m.safetyMargin)} hint="How far sales can fall before you hit break-even" why={why.safetyMargin} />
        <Tile label="Cash buffer" value={months(m.liquidityBuffer)} hint="Installments your spare cash could pay" why={why.liquidityBuffer} />
      </div>
      <p className="mt-3 text-[11.5px] text-faint">Your share of the project: {pct(m.contributionPct)} · Loan vs. yearly sales: {isNil(m.loanToAnnualRevenue) ? DASH : dec(m.loanToAnnualRevenue)}×</p>
    </Card>
  );
}