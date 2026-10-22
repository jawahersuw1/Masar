import { ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { months, pct, sar, times } from '../../lib/format.js';
import Card, { CardHeader } from '../ui/Card.jsx';
import { Notice } from '../ui/Feedback.jsx';
import Delta from './Delta.jsx';

function Change({ label, from, to }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-line-soft py-2 text-[13px] last:border-0">
      <span className="text-muted">{label}</span>
      <span className="flex items-center gap-2 font-mono text-[12.5px]"><span className="text-muted">{from}</span><ArrowRight className="h-3 w-3 text-faint" aria-hidden="true" /><span className="font-semibold text-good">{to}</span></span>
    </li>
  );
}

export default function PlanFix({ planFix, subtitle }) {
  if (!planFix) return null;
  const { status, target, changes: ch, comparison: c, notes } = planFix;

  if (status === 'not_needed') {
    return (
      <Card tone="good"><div className="flex gap-3"><CheckCircle2 className="h-6 w-6 shrink-0 text-good" aria-hidden="true" />
        <div><h2 className="font-display text-lg font-extrabold">Your plan already meets the target</h2>
          <p className="mt-1 text-[13px] text-ink-soft">Debt service coverage is {times(planFix.baseline?.values?.dscr)}, above the target of {times(target)}. No change is needed.</p></div></div></Card>
    );
  }
  if (status === 'not_possible') {
    return (
      <Card tone="accent"><div className="flex gap-3"><Info className="h-6 w-6 shrink-0 text-warn" aria-hidden="true" />
        <div><h2 className="font-display text-lg font-extrabold">No small change reaches the target</h2><p className="mt-1 text-[13px] text-ink-soft">{planFix.reason}</p></div></div></Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader title={status === 'found' ? 'A small change gets you to the target' : 'The closest plan Masar could find'}
          description={subtitle ?? `Target: debt service coverage of ${times(target)}. Masar tried a longer repayment period and more of your own money.`} />
        <ul>
          {ch?.termTo !== ch?.termFrom && <Change label="Repayment period" from={`${ch.termFrom} years`} to={`${ch.termTo} years`} />}
          {ch?.extraOwner > 0 && <Change label="Your own money, extra" from="—" to={`+ ${sar(ch.extraOwner)}`} />}
          {ch?.newLoan !== undefined && <Change label="Loan amount" from="current" to={sar(ch.newLoan)} />}
        </ul>
      </Card>
      {c && (
        <Card>
          <CardHeader title="What it does to the numbers" />
          {[['Debt service coverage', c.dscr, times, 'higher'], ['Cash left each month', c.cashLeft, sar, 'higher'], ['Cash buffer', c.liquidityBuffer, months, 'higher'],
            ['Safety margin', c.safetyMargin, pct, 'higher'], ['Monthly installment', c.installment, sar, 'lower']].map(([label, v, fmt, better]) => v && (
            <div key={label} className="flex items-center justify-between gap-3 border-b border-line-soft py-2 text-[12.8px] last:border-0">
              <span className="text-muted">{label}</span><Delta before={v.before} after={v.after} format={fmt} better={better} />
            </div>
          ))}
        </Card>
      )}
      {notes?.length > 0 && <ul className="flex flex-col gap-1.5 text-[12.8px] text-ink-soft">{notes.map((n) => <li key={n} className="flex gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0 text-steel" aria-hidden="true" />{n}</li>)}</ul>}
      {planFix.label && <Notice variant="strong">{planFix.label}</Notice>}
    </div>
  );
}