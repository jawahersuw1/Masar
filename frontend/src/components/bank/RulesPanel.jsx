import { CheckCircle2, Flag } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card.jsx';
import Pill from '../ui/Pill.jsx';

const SEVERITY = { mandatory_review: ['bad', 'Review required'], high: ['bad', 'High'], medium: ['warn', 'Medium'], low: ['info', 'Low'] };

// Every flag a reviewer sees traces back to a visible rule: nothing is a hidden black box.
export default function RulesPanel({ rules }) {
  const { fired = [], notChecked = [], checked = 0 } = rules;
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader title="Business rules" description={`${fired.length} of ${checked} checked rules fired for this application.`} />
        {fired.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl bg-good-soft p-4 text-[13px] text-good"><CheckCircle2 className="h-5 w-5" aria-hidden="true" />No rule fired. This does not replace the reviewer’s judgement.</div>
        ) : (
          <ul className="flex flex-col gap-3">
            {fired.map((r) => {
              const [tone, label] = SEVERITY[r.severity] ?? ['neutral', r.severity];
              return (
                <li key={r.id} className="flex gap-3 rounded-xl border border-accent p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-on-accent"><Flag className="h-4 w-4" aria-hidden="true" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[13.5px] font-bold">{r.name ?? r.id}</span><Pill tone={tone}>{label}</Pill></div>
                    {r.message && <p className="mt-1 text-[12.8px] text-ink-soft">{r.message}</p>}
                    {r.readable && <p className="mt-1.5 break-words font-mono text-[11px] text-muted">{r.readable}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      {notChecked.length > 0 && (
        <Card>
          <CardHeader title="Could not be checked" description="These rules need answers the applicant did not give. They are not counted as passed." />
          <ul className="flex flex-col gap-1.5 text-[12.8px] text-ink-soft">{notChecked.map((r) => <li key={r.id}>• {r.name}</li>)}</ul>
        </Card>
      )}
    </div>
  );
}