import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Card, { CardHeader } from '../../components/ui/Card.jsx';
import { Field, NumberInput, SelectInput } from '../../components/ui/Field.jsx';
import { ErrorBlock, Notice } from '../../components/ui/Feedback.jsx';
import Bar from '../../components/ui/Bar.jsx';
import { useAssessment } from '../../context/AssessmentContext.jsx';
import useAsync from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { exampleAnswers, QUESTION_GROUPS, toApiInputs } from '../../lib/inputs.js';

export default function Questionnaire() {
  const navigate = useNavigate();
  const { answers, answered, total, setAnswer, replaceAnswers, reset, runAnalysis, status, error, editing, stopEdit } = useAssessment();
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const sectors = useAsync(() => api.sectors(), []);
  const sectorOptions = (sectors.data ?? []).map((s) => ({ value: String(s.id), label: s.name }));
  const share = (answered / total) * 100;
  const tone = share >= 90 ? 'good' : share >= 60 ? 'warn' : 'bad';

  // Editing an application the bank sent back: send the changed answers to the same application (a new round).
  const resend = async () => {
    setSending(true);
    setSendError(null);
    try {
      await api.reviseApplication(editing.applicationId, toApiInputs(answers));
      const id = editing.applicationId;
      stopEdit();
      navigate(`/applications/${id}`, { state: { justSubmitted: true } });
    } catch (e) { setSendError(e); setSending(false); }
  };
  const cancelEdit = () => { const id = editing.applicationId; stopEdit(); navigate(`/applications/${id}`); };

  const analyze = async () => { try { await runAnalysis(); navigate('/analysis'); } catch { /* shown below */ } };

  return (
    <div className="flex flex-col gap-4">
      {editing && <Notice variant="strong">You are editing application #{editing.applicationId} (round {editing.revision}). Change what the bank asked for, then use <b>Send changes to the bank</b>.</Notice>}
      <Card className="flex flex-wrap items-center justify-between gap-6">
        <div className="max-w-[60ch]">
          <h2 className="font-display text-xl font-extrabold">{editing ? 'Update your answers' : 'Tell Masar about the plan'}</h2>
          <p className="mt-1 text-[13px] text-muted">Every answer feeds your analysis. You can skip a question, but Masar will be less sure of its results.</p>
        </div>
        <div className="min-w-[170px]" aria-live="polite">
          <div className="flex items-baseline justify-between text-[12px] text-muted"><span>Answered</span><span className="font-mono text-lg font-semibold text-heading">{answered} / {total}</span></div>
          <Bar value={share} tone={tone} className="mt-1.5" />
        </div>
      </Card>

      {QUESTION_GROUPS.map((g) => (
        <Card key={g.id}>
          <CardHeader title={g.title} description={g.description} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.fields.map((f) => (
              <Field key={f.key} label={f.label} hint={f.hint}>
                {f.kind === 'sector' ? (
                  <SelectInput options={sectorOptions} value={answers[f.key]} onChange={(e) => setAnswer(f.key, e.target.value)} placeholder={sectors.loading ? 'Loading…' : 'Choose a sector'} />
                ) : (
                  <NumberInput unit={f.unit} min={f.min} max={f.max} step={f.step ?? 'any'} value={answers[f.key]} onChange={(e) => setAnswer(f.key, e.target.value)} />
                )}
              </Field>
            ))}
          </div>
        </Card>
      ))}

      {sectors.status === 'error' && <ErrorBlock error={sectors.error} title="Sectors did not load" onRetry={sectors.run} />}
      {status === 'error' && <ErrorBlock error={error} title="The analysis could not run" onRetry={analyze} />}
      {sendError && <ErrorBlock error={sendError} title="Your changes were not sent" />}

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line-soft bg-surface p-3 shadow-pop">
        <div className="flex flex-wrap gap-2">
          {editing && <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel editing</Button>}
          <Button variant="outline" size="sm" onClick={() => replaceAnswers(exampleAnswers(sectors.data?.[0]?.id))}><Sparkles className="h-3.5 w-3.5" aria-hidden="true" />Fill with an example</Button>
          <Button variant="ghost" size="sm" onClick={reset} disabled={answered === 0}><Trash2 className="h-3.5 w-3.5" aria-hidden="true" />Clear</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={editing ? 'outline' : 'primary'} onClick={analyze} loading={status === 'loading'} disabled={answered === 0}>Analyze my plan</Button>
          {editing && <Button onClick={resend} loading={sending} disabled={answered === 0}>Send changes to the bank</Button>}
        </div>
      </div>
    </div>
  );
}
