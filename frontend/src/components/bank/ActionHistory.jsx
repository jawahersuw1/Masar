import { ACTION_LABEL, formatDate } from '../../lib/format.js';
import { actionTone } from '../../lib/tones.js';
import Card, { CardHeader } from '../ui/Card.jsx';
import Pill from '../ui/Pill.jsx';

export default function ActionHistory({ actions }) {
  return (
    <Card>
      <CardHeader title="Decision history" description="Every action is recorded and cannot be edited." />
      {!actions?.length ? <p className="text-[13px] text-muted">No action yet.</p> : (
        <ol className="flex flex-col gap-4 border-l border-line pl-4">
          {actions.map((a) => (
            <li key={a.id} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
              <div className="flex flex-wrap items-center gap-2"><Pill tone={actionTone(a.action)}>{ACTION_LABEL[a.action] ?? a.action}</Pill><span className="text-[12px] text-muted">{a.reviewerName ?? ''} · {formatDate(a.createdAt)}</span></div>
              {a.comment && <p className="mt-1.5 text-[13px] text-ink-soft">{a.comment}</p>}
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}