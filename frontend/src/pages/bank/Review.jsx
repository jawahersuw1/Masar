import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronLeft, FileText } from 'lucide-react';
import AiExplanation from '../../components/ai/AiExplanation.jsx';
import AreaScores from '../../components/analysis/AreaScores.jsx';
import ConfidenceCard from '../../components/analysis/ConfidenceCard.jsx';
import MetricsGrid from '../../components/analysis/MetricsGrid.jsx';
import PlanFix from '../../components/analysis/PlanFix.jsx';
import ReadinessHero from '../../components/analysis/ReadinessHero.jsx';
import SimilarityPanel from '../../components/analysis/SimilarityPanel.jsx';
import StressTests from '../../components/analysis/StressTests.jsx';
import { TimelineLoader } from '../../components/history/Timeline.jsx';
import ApplicantAnswers from '../../components/bank/ApplicantAnswers.jsx';
import DecisionPanel from '../../components/bank/DecisionPanel.jsx';

///22
import RiskPanel from '../../components/bank/RiskPanel.jsx';
import RulesPanel from '../../components/bank/RulesPanel.jsx';
import Button from '../../components/ui/Button.jsx';
import Card, { CardHeader } from '../../components/ui/Card.jsx';
import { ErrorBlock, LoadingBlock, Notice } from '../../components/ui/Feedback.jsx';
import Pill from '../../components/ui/Pill.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import useAsync from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { formatDate, STATUS_LABEL } from '../../lib/format.js';
import { statusTone } from '../../lib/tones.js';

const TABS = [
  { id: 'risk', label: 'Risk' }, { id: 'rules', label: 'Rules' }, { id: 'benchmark', label: 'Benchmarking' },
  { id: 'scores', label: 'Scores and numbers' }, { id: 'stress', label: 'Stress and plan' }, { id: 'answers', label: 'Answers' },
];

export default function Review() {
  const { id } = useParams();
  const { state } = useLocation();
  const [tab, setTab] = useState('risk');
  const app = useAsync(() => api.application(id), [id]);
  const sectors = useAsync(() => api.sectors(), []);

  if (app.loading && !app.data) return <LoadingBlock label="Loading application" rows={5} />;
  if (app.status === 'error') return <ErrorBlock error={app.error} onRetry={app.run} />;
  const a = app.data;
  const v = a.view;
  const bank = v.bank;

  return (
    <div className="flex flex-col gap-5">
      <Link to="/bank" className="flex w-fit items-center gap-1 text-[12.5px] font-semibold text-steel hover:text-heading"><ChevronLeft className="h-4 w-4" aria-hidden="true" />Applications</Link>
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-extrabold">Application #{a.id}{(a.clientName ?? state?.clientName) ? ` · ${a.clientName ?? state?.clientName}` : ''}</h2>
          <p className="mt-0.5 text-[12.5px] text-muted">Received {formatDate(a.createdAt)} · {bank?.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button as={Link} to={`/bank/applications/${a.id}/report`} variant="outline" size="sm"><FileText className="h-4 w-4" aria-hidden="true" />Combined report</Button>
          {bank?.mandatoryReview && <Pill tone="bad">Mandatory review</Pill>}
          <Pill tone="info">Round {a.revision}</Pill>
          <Pill tone={statusTone(a.status)}>{STATUS_LABEL[a.status] ?? a.status}</Pill>
        </div>
      </Card>

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <ReadinessHero readiness={v.readiness} completeness={v.completeness} />
          <AiExplanation applicationId={a.id} />
          <Tabs tabs={TABS} value={tab} onChange={setTab} label="Review sections" />
          {tab === 'risk' && bank?.risk && <RiskPanel risk={bank.risk} />}
          {tab === 'rules' && bank?.rules && <RulesPanel rules={bank.rules} />}
          {tab === 'benchmark' && <div className="flex flex-col gap-5"><SimilarityPanel similarity={v.similarity} showOutcome /><ConfidenceCard confidence={v.confidence} /></div>}
          {tab === 'scores' && <div className="flex flex-col gap-5"><AreaScores feasibility={v.feasibility} /><MetricsGrid metrics={v.metrics} why={v.why} /></div>}
          {tab === 'stress' && <div className="flex flex-col gap-5"><StressTests stressTests={v.stressTests} /><PlanFix planFix={bank?.planFix ?? v.planFix} subtitle="Adjusted to this bank’s target debt service coverage." /></div>}
          {tab === 'answers' && <ApplicantAnswers inputs={a.inputs} sectors={sectors.data ?? []} />}
          <Notice>{v.dataNote ?? v.note}</Notice>
        </div>
        <aside className="flex flex-col gap-5 xl:sticky xl:top-24">
          <DecisionPanel application={a} mandatoryReview={Boolean(bank?.mandatoryReview)} onDone={app.run} />
          <Card><CardHeader title="History" description="Every round with the applicant, oldest first." /><TimelineLoader applicationId={a.id} audience="bank" version={`${a.status}-${a.revision}`} /></Card>
        </aside>
      </div>
    </div>
  );
}
