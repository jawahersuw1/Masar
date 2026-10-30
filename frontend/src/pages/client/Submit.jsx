import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Card, { CardHeader } from '../../components/ui/Card.jsx';
import { EmptyBlock, ErrorBlock, LoadingBlock, Notice } from '../../components/ui/Feedback.jsx';
import Pill from '../../components/ui/Pill.jsx';
import { useAssessment } from '../../context/AssessmentContext.jsx';
import useAsync from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { pct, sar } from '../../lib/format.js';
import { isFilled, toApiInputs } from '../../lib/inputs.js';

function Fit({ ok, children }) {
  if (ok === null) return <li className="flex items-center gap-2 text-faint"><span className="h-3.5 w-3.5 rounded-full border border-line" aria-hidden="true" />{children}</li>;
  const Icon = ok ? Check : X;
  return <li className={`flex items-center gap-2 ${ok ? 'text-ink-soft' : 'text-warn'}`}><Icon className={`h-3.5 w-3.5 ${ok ? 'text-good' : 'text-warn'}`} aria-hidden="true" />{children}</li>;
}

const within = (v, lo, hi) => (v === null ? null : v >= lo && v <= hi);

export default function Submit() {
  const navigate = useNavigate();
  const { answers, answered, editing } = useAssessment();
  const banks = useAsync(() => api.banks(), []);
  const [bankId, setBankId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const num = (k) => (isFilled(answers[k]) ? Number(answers[k]) : null);
  const loan = num('loan_amount'), term = num('term_years'), rate = num('annual_interest_rate') === null ? null : num('annual_interest_rate') / 100;

  if (answered === 0) return <EmptyBlock title="Answer a few questions first" description="You need at least one answer before you can send an application." action={<Button as={Link} to="/assessment">Go to the questionnaire</Button>} />;

  const send = async () => {
    setBusy(true); setError(null);
    try { const res = await api.submitApplication(bankId, toApiInputs(answers)); navigate(`/applications/${res.applicationId}`, { state: { justSubmitted: true } }); }
    catch (e) { setError(e); setBusy(false); }
  };

  return (
    <div className="flex flex-col gap-5">
      {editing && (
        <Notice variant="strong">
          You are editing application #{editing.applicationId}. To send your changes, use <Link to="/assessment" className="font-bold underline">Send changes to the bank</Link> on the questionnaire. Sending from this page would create a second application.
        </Notice>
      )}
      <Card>
        <CardHeader title="Choose a bank" description="Each bank has its own limits and reviews applications its own way. Your answers are sent as they are now." />
        {banks.loading && <LoadingBlock label="Loading banks" rows={2} />}
        {banks.status === 'error' && <ErrorBlock error={banks.error} onRetry={banks.run} />}
        <div className="grid gap-4 md:grid-cols-3" role="radiogroup" aria-label="Bank">
          {(banks.data ?? []).map((b) => {
            const selected = bankId === b.bankId;
            return (
              <button key={b.bankId} type="button" role="radio" aria-checked={selected} onClick={() => setBankId(b.bankId)}
                className={`flex flex-col gap-3 rounded-2xl border p-5 text-left transition ${selected ? 'border-accent bg-surface-2 shadow-card' : 'border-line-soft hover:border-line'}`}>
                <div className="flex items-start justify-between gap-2"><h3 className="font-display text-[15px] font-extrabold">{b.name}</h3><Pill tone="info" dot={false}>{b.profile}</Pill></div>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
                  <dt className="text-muted">Loan range</dt><dd className="text-right font-mono">{sar(b.minLoan)} to {sar(b.maxLoan)}</dd>
                  <dt className="text-muted">Longest term</dt><dd className="text-right font-mono">{b.maxTermYears} years</dd>
                  <dt className="text-muted">Rate range</dt><dd className="text-right font-mono">{pct(b.rateMin, 1)} to {pct(b.rateMax, 1)}</dd>
                </dl>
                <ul className="flex flex-col gap-1 border-t border-line-soft pt-3 text-[12px]">
                  <Fit ok={loan === null ? null : within(loan, b.minLoan, b.maxLoan)}>Your loan is {loan === null ? 'not answered' : within(loan, b.minLoan, b.maxLoan) ? 'in range' : 'outside the range'}</Fit>
                  <Fit ok={term === null ? null : term <= b.maxTermYears}>Your term is {term === null ? 'not answered' : term <= b.maxTermYears ? 'allowed' : 'too long'}</Fit>
                  <Fit ok={within(rate, b.rateMin, b.rateMax)}>Your rate is {rate === null ? 'not answered' : within(rate, b.rateMin, b.rateMax) ? 'in range' : 'outside the range'}</Fit>
                </ul>
              </button>
            );
          })}
        </div>
      </Card>
      {error && <ErrorBlock error={error} title="The application was not sent" />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Notice className="max-w-[60ch]">After you send it, a reviewer at the bank makes the decision. You will see its status under My applications.</Notice>
        <Button onClick={send} disabled={!bankId} loading={busy}>Send application</Button>
      </div>
    </div>
  );
}
