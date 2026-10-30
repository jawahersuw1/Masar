import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ErrorBlock, LoadingBlock } from '../ui/Feedback.jsx';
import Pill from '../ui/Pill.jsx';
import useAsync from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { ACTION_LABEL, DASH, formatDate } from '../../lib/format.js';
import { FIELD_BY_KEY, formatAnswer } from '../../lib/inputs.js';
import { actionTone } from '../../lib/tones.js';

const SHOW_AT_FIRST = 6;

function Event({ e, audience, sectors }) {
  if (e.type === 'submitted') {
    const who = audience === 'client' ? 'You' : 'The applicant';
    return (
      <li className="relative">
        <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-info" aria-hidden="true" />
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="info">Round {e.revision}</Pill>
          <span className="text-[13px] font-bold">{who} {e.revision === 1 ? 'sent the application' : 'updated the answers and sent it again'}</span>
          <span className="text-[11.5px] text-muted">{formatDate(e.at)}</span>
        </div>
        {e.changes.length > 0 && (
          <ul className="mt-1.5 flex flex-col gap-0.5 text-[12.5px]">
            {e.changes.map((c) => (
              <li key={c.field}>
                <span className="text-muted">{FIELD_BY_KEY[c.field]?.label ?? c.field}: </span>
                {formatAnswer(c.field, c.from, sectors) ?? 'not answered'} <span aria-label="changed to">→</span> <b>{formatAnswer(c.field, c.to, sectors) ?? 'not answered'}</b>
              </li>
            ))}
          </ul>
        )}
        {e.revision > 1 && e.changes.length === 0 && <p className="mt-1 text-[12.5px] text-muted">No answers were changed.</p>}
      </li>
    );
  }
  return (
    <li className="relative">
      <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone={actionTone(e.action)}>{ACTION_LABEL[e.action] ?? e.action}</Pill>
        <span className="text-[13px] font-bold">{e.by}</span>
        <span className="text-[11.5px] text-muted">Round {e.revision} · {formatDate(e.at)}</span>
      </div>
      {e.comment ? <p className="mt-1.5 whitespace-pre-wrap rounded-lg bg-surface-2 p-2.5 text-[13px] text-ink-soft">{e.comment}</p>
        : <p className="mt-1 text-[12.5px] text-faint">No message {DASH}</p>}
    </li>
  );
}

// The whole story of an application, oldest first. Long stories show the latest events and can be opened fully.
export default function Timeline({ events, audience }) {
  const sectors = useAsync(() => api.sectors(), []);
  const [all, setAll] = useState(false);
  const hidden = all ? 0 : Math.max(0, events.length - SHOW_AT_FIRST);
  const shown = hidden ? events.slice(events.length - SHOW_AT_FIRST) : events;

  return (
    <div>
      {hidden > 0 && (
        <button type="button" onClick={() => setAll(true)} className="mb-3 flex items-center gap-1 text-[12.5px] font-bold text-steel hover:text-heading">
          <ChevronDown className="h-4 w-4" aria-hidden="true" />Show {hidden} earlier {hidden === 1 ? 'event' : 'events'}
        </button>
      )}
      <ol className="flex flex-col gap-4 border-l border-line pl-4">
        {shown.map((e, i) => <Event key={`${e.type}-${e.revision}-${i}`} e={e} audience={audience} sectors={sectors.data ?? []} />)}
      </ol>
    </div>
  );
}

// Loads the story of one application and shows it. `version` makes it load again after a decision or an update.
export function TimelineLoader({ applicationId, audience, version }) {
  const tl = useAsync(() => api.timeline(applicationId), [applicationId, version]);
  if (tl.loading && !tl.data) return <LoadingBlock label="Loading history" rows={2} />;
  if (tl.status === 'error') return <ErrorBlock error={tl.error} onRetry={tl.run} />;
  return <Timeline events={tl.data.events} audience={audience} />;
}
