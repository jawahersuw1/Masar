import { useState } from 'react';
import { CheckCircle2, Hourglass } from 'lucide-react';
import { api } from '../../lib/api.js';
import { FINAL_STATUSES, STATUS_LABEL } from '../../lib/format.js';
import Button from '../ui/Button.jsx';
import Card, { CardHeader } from '../ui/Card.jsx';
import { Notice } from '../ui/Feedback.jsx';
import { TextArea } from '../ui/Field.jsx';

const OPTIONS = [
  { id: 'accept', label: 'Accept', hint: 'The reviewer agrees to take the case forward.' },
  { id: 'modify', label: 'Modify', hint: 'Send it back to the applicant to update. They read your message and can edit their answers.' },
  { id: 'decline', label: 'Decline', hint: 'The case does not go forward. The applicant reads your reason.' },
];
const PLACEHOLDER = {
  accept: 'Optional note for the applicant',
  modify: 'Tell the applicant what to change and why',
  decline: 'Tell the applicant why the application is declined',
};

// Mirrors the backend rules: asking for changes or declining needs a message (the applicant reads it);
// accepting a mandatory-review case needs a comment too.
export default function DecisionPanel({ application, mandatoryReview, onDone }) {
  const [action, setAction] = useState('');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (FINAL_STATUSES.includes(application.status)) {
    return (
      <Card tone="good"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-good" aria-hidden="true" />
        <p className="text-[13px]">This case is closed: <strong>{STATUS_LABEL[application.status]}</strong>. See the history for the message.</p></div></Card>
    );
  }
  if (application.status !== 'submitted') {
    return (
      <Card tone="accent"><div className="flex items-start gap-3"><Hourglass className="mt-0.5 h-5 w-5 text-accent" aria-hidden="true" />
        <p className="text-[13px]">Waiting for the applicant. You asked for changes in round {application.revision}. You can decide again after they send the updated application.</p></div></Card>
    );
  }

  const minLength = action === 'accept' ? (mandatoryReview ? 10 : 0) : action ? 10 : 0;
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
          <label className="text-[12.2px] font-semibold text-ink-soft" htmlFor="decision-comment">
            {action === 'accept' ? `Comment${minLength === 0 ? ' (optional)' : ''}` : 'Message to the applicant'}
          </label>
          <TextArea id="decision-comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder={PLACEHOLDER[action]} />
          <p className="text-[11.5px] text-muted">The applicant can read this.</p>
          {tooShort && <p className="text-[11.5px] text-warn">{action === 'accept' ? 'This case needs a closer look, so accepting it needs a comment of at least 10 characters.' : 'Write at least 10 characters. The applicant will read it.'}</p>}
        </div>
      )}
      {mandatoryReview && <Notice variant="strong" className="mt-4">Masar flagged this case for mandatory review.</Notice>}
      {error && <p role="alert" className="mt-3 text-[12.5px] text-bad">{error.message}</p>}
      <Button className="mt-4 w-full" disabled={!canSubmit} loading={busy} onClick={submit}>
        {action === 'modify' ? 'Send back to the applicant' : action === 'decline' ? 'Decline application' : 'Record decision'}
      </Button>
    </Card>
  );
}
