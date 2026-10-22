import { levelTone, outcomeTone } from '../../lib/tones.js';
import { pct } from '../../lib/format.js';
import Bar from '../ui/Bar.jsx';
import Card, { CardHeader } from '../ui/Card.jsx';
import Gauge from '../ui/Gauge.jsx';
import Pill from '../ui/Pill.jsx';

function Chips({ items, className }) {
  return items?.length ? <div className="flex flex-wrap gap-1.5">{items.map((t) => <span key={t} className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${className}`}>{t}</span>)}</div> : null;
}

// showOutcome is reviewer-only: clients never see how past cases ended.
export default function SimilarityPanel({ similarity, showOutcome = false }) {
  const score = similarity.score === null ? null : similarity.score * 100;
  return (
    <Card>
      <CardHeader title="Similar past cases" description="Masar compares your profile with past cases to check how much evidence it has. This is context, not a prediction." />
      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-3">
          <Gauge value={score} tone={levelTone(similarity.level)} size={124} label="Similarity" caption="similarity" />
          <Pill tone={levelTone(similarity.level)}>{similarity.level}</Pill>
          <p className="text-center text-[11.5px] text-muted">
            {similarity.closeCount} close {similarity.closeCount === 1 ? 'case' : 'cases'}
            {showOutcome && similarity.compared !== undefined && <><br />{similarity.compared} compared · {similarity.skipped} skipped</>}
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {similarity.matches?.length === 0 && <li className="text-[13px] text-muted">No past case was close enough to compare.</li>}
          {similarity.matches?.map((m) => (
            <li key={m.caseId} className="rounded-xl border border-line-soft p-3.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="max-w-[52ch] text-[13px] font-semibold text-ink">{m.description}</p>
                {showOutcome && m.outcome && <Pill tone={outcomeTone(m.outcome)}>{m.outcome}</Pill>}
              </div>
              <div className="my-2.5 flex items-center gap-3">
                <Bar value={m.similarity * 100} tone={levelTone(m.similarity >= 0.8 ? 'high' : m.similarity >= 0.65 ? 'medium' : 'low')} className="flex-1" />
                <span className="w-10 text-right font-mono text-[12px] text-ink-soft">{pct(m.similarity)}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <Chips items={m.matching} className="bg-good-soft text-good" />
                <Chips items={m.differing} className="bg-warn-soft text-warn" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}