import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import AiExplanation from '../../components/ai/AiExplanation.jsx';
import AreaScores from '../../components/analysis/AreaScores.jsx';
import ConfidenceCard from '../../components/analysis/ConfidenceCard.jsx';
import MetricsGrid from '../../components/analysis/MetricsGrid.jsx';
import PlanFix from '../../components/analysis/PlanFix.jsx';
import ReadinessHero from '../../components/analysis/ReadinessHero.jsx';
import SimilarityPanel from '../../components/analysis/SimilarityPanel.jsx';
import StressTests from '../../components/analysis/StressTests.jsx';
import Card from '../../components/ui/Card.jsx';
import { ErrorBlock, LoadingBlock, Notice } from '../../components/ui/Feedback.jsx';
import Pill from '../../components/ui/Pill.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import useAsync from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { formatDate, STATUS_LABEL } from '../../lib/format.js';
import { statusTone } from '../../lib/tones.js';

const STATUS_TEXT = {
  submitted: 'Your application has been sent. A reviewer at the bank will look at it.',
  in_review: 'A reviewer at the bank is looking at your application.',
  more_info_requested: 'The reviewer asked for more information. Contact the bank to continue.',
  accepted: 'The reviewer accepted your application. The bank will contact you about next steps.',
  modified: 'The reviewer accepted your application with changes. The bank will contact you.',
  declined: 'The reviewer declined this application.',
};
const TABS = [{ id: 'summary', label: 'Summary' }, { id: 'stress', label: 'Stress tests' }, { id: 'plan', label: 'Make the plan work' }];

export default function ApplicationDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const [tab, setTab] = useState('summary');
  const app = useAsync(() => api.application(id), [id]);
  const banks = useAsync(() => api.banks(), []);

  if (app.loading) return <LoadingBlock label="Loading application" rows={5} />;
  if (app.status === 'error') return <ErrorBlock error={app.error} onRetry={app.run} />;
  const a = app.data;
  const v = a.view;
  const bankName = banks.data?.find((b) => b.bankId === a.bankId)?.name ?? a.bankId;

  return (
    <div className="flex flex-col gap-5">
      <Link to="/applications" className="flex w-fit items-center gap-1 text-[12.5px] font-semibold text-steel hover:text-heading"><ChevronLeft className="h-4 w-4" aria-hidden="true" />My applications</Link>
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-extrabold">Application #{a.id} · {bankName}</h2>
          <p className="mt-0.5 text-[12.5px] text-muted">Sent {formatDate(a.createdAt)}</p>
          <p className="mt-2 max-w-[60ch] text-[13px] text-ink-soft">{STATUS_TEXT[a.status]}</p>
        </div>
        <Pill tone={statusTone(a.status)}>{STATUS_LABEL[a.status] ?? a.status}</Pill>
      </Card>

      <ReadinessHero readiness={v.readiness} completeness={v.completeness} />
      <AiExplanation applicationId={a.id} autoStart={Boolean(state?.justSubmitted)} />

      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'summary' && (
        <div className="flex flex-col gap-5">
          <AreaScores feasibility={v.feasibility} />
          <MetricsGrid metrics={v.metrics} />
          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]"><SimilarityPanel similarity={v.similarity} /><ConfidenceCard confidence={v.confidence} /></div>
        </div>
      )}
      {tab === 'stress' && <StressTests stressTests={v.stressTests} />}
      {tab === 'plan' && <PlanFix planFix={v.planFix} />}
      <Notice>{v.dataNote ?? v.note}</Notice>
    </div>
  );
}
