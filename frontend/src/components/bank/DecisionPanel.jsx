import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { FINAL_STATUSES, STATUS_LABEL } from '../../lib/format.js';
import Button from '../ui/Button.jsx';
import Card, { CardHeader } from '../ui/Card.jsx';
import { Notice } from '../ui/Feedback.jsx';
import { TextArea } from '../ui/Field.jsx';

const OPTIONS = [
  { id: 'accept', label: 'Accept', hint: 'The reviewer agrees to take the case forward.' },
  { id: 'modify', label: 'Modify', hint: 'Accept with changes, for example a different amount.' },
  { id: 'decline', label: 'Decline', hint: 'The case does not go forward.' },
  { id: 'request_info', label: 'Ask for more information', hint: 'The applicant is asked for more detail.' },
];

// Mirrors the backend rules: changes need a comment; accepting a mandatory-review case needs a longer one.
export default function DecisionPanel({ application, mandatoryReview, onDone }) {
  const [action, setAction] = useState('');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (FINAL_STATUSES.includes(application.status)) {
    return (
      <Card tone="good"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-good" aria-hidden="true" />
        <p className="text-[13px]">This case is closed: <strong>{STATUS_LABEL[application.status]}</strong>. See the history for the comment.</p></div></Card>
    );
  }

  const minLength = action === 'accept' ? (mandatoryReview ? 10 : 0) : action ? 3 : 0;
  const tooShort = comment.trim().length < minLength;
  const canSubmit = action && !tooShort && !busy;

  const submit = async () => {
    setBusy(true); setError(null);
    try { await api.act(application.id, action, comment.trim()); setAction(''); setComment(''); await onDone(); }
    catch (e) { setError(e); } finally { setBusy(false); }
  };

  return (
    <Card>
      <CardHeader title="Your decision" description="Masar recommends. You decide." />
      <div role="radiogroup" aria-label="Decision" className="flex flex-col gap-2">
        {OPTIONS.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={action === o.id} onClick={() => setAction(o.id)}
            className={`rounded-xl border p-3 text-left transition ${action === o.id ? 'border-accent bg-surface-2' : 'border-line-soft hover:border-line'}`}>
            <span className="block text-[13px] font-bold">{o.label}</span><span className="text-[11.5px] text-muted">{o.hint}</span>
          </button>
        ))}
      </div>
      {action && (
        <div className="mt-4 flex flex-col gap-2">
          <label className="text-[12.2px] font-semibold text-ink-soft" htmlFor="decision-comment">Comment{minLength === 0 ? ' (optional)' : ''}</label>
          <TextArea id="decision-comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Explain your reasoning for the record" />
          {tooShort && <p className="text-[11.5px] text-warn">{action === 'accept' ? 'This case needs a closer look, so accepting it needs a comment of at least 10 characters.' : 'Add a short comment for the record.'}</p>}
        </div>
      )}
      {mandatoryReview && <Notice variant="strong" className="mt-4">Masar flagged this case for mandatory review.</Notice>}
      {error && <p role="alert" className="mt-3 text-[12.5px] text-bad">{error.message}</p>}
      <Button className="mt-4 w-full" disabled={!canSubmit} loading={busy} onClick={submit}>Record decision</Button>
    </Card>
  );
}