import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Printer } from 'lucide-react';
import AreaScores from '../../components/analysis/AreaScores.jsx';
import ConfidenceCard from '../../components/analysis/ConfidenceCard.jsx';
import MetricsGrid from '../../components/analysis/MetricsGrid.jsx';
import PlanFix from '../../components/analysis/PlanFix.jsx';
import ReadinessHero from '../../components/analysis/ReadinessHero.jsx';
import SimilarityPanel from '../../components/analysis/SimilarityPanel.jsx';
import StressTests from '../../components/analysis/StressTests.jsx';
import ActionHistory from '../../components/bank/ActionHistory.jsx';
import ApplicantAnswers from '../../components/bank/ApplicantAnswers.jsx';
import RiskPanel from '../../components/bank/RiskPanel.jsx';
import RulesPanel from '../../components/bank/RulesPanel.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { ErrorBlock, LoadingBlock, Notice } from '../../components/ui/Feedback.jsx';
import Pill from '../../components/ui/Pill.jsx';
import useAsync from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { formatDate, STATUS_LABEL } from '../../lib/format.js';
import { statusTone } from '../../lib/tones.js';

function Part({ number, title, subtitle, children }) {
  return (
    <section className="flex flex-col gap-4 break-before-page first:break-before-auto">
      <div className="border-b border-line pb-2">
        <h2 className="font-display text-xl font-extrabold">{number}. {title}</h2>
        {subtitle && <p className="mt-0.5 text-[12.5px] text-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

// The combined report: what the applicant saw (Client Insights) and what only the bank sees (Bank Decision Support).
export default function Report() {
  const { id } = useParams();
  const report = useAsync(() => api.report(id), [id]);
  const sectors = useAsync(() => api.sectors(), []);

  if (report.loading && !report.data) return <LoadingBlock label="Preparing the report" rows={5} />;
  if (report.status === 'error') return <ErrorBlock error={report.error} onRetry={report.run} />;

  const r = report.data;
  const client = r.clientInsights;
  const bank = r.bankDecisionSupport;
  const aiText = r.explanation?.text?.replace(/\*\*/g, '').replace(/^#{1,6}\s*/gm, '');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to={`/bank/applications/${r.application.id}`} className="flex w-fit items-center gap-1 text-[12.5px] font-semibold text-steel hover:text-heading">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />Back to the application
        </Link>
        <Button variant="navy" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden="true" />Print or save as PDF</Button>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Combined report · Application #{r.application.id}</h1>
          <p className="mt-0.5 text-[12.5px] text-muted">{r.application.clientName} · {bank.bank?.name} · Received {formatDate(r.application.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {bank.bank?.mandatoryReview && <Pill tone="bad">Mandatory review</Pill>}
          <Pill tone={statusTone(r.application.status)}>{STATUS_LABEL[r.application.status] ?? r.application.status}</Pill>
        </div>
      </Card>
      <Notice variant="strong">Masar recommends. The bank decides. Nothing in this report is a credit score or a repayment probability.</Notice>

      <Part number="1" title="Client insights" subtitle="What the applicant saw: guidance to understand and improve their own case.">
        <ReadinessHero readiness={client.readiness} completeness={client.completeness} />
        <AreaScores feasibility={client.feasibility} />
        <MetricsGrid metrics={client.metrics} why={bank.why} />
        <SimilarityPanel similarity={client.similarity} />
        <StressTests stressTests={client.stressTests} />
        <PlanFix planFix={client.planFix} subtitle="Shown to the applicant, with the default target. Illustrative only." />
      </Part>

      <Part number="2" title="Bank decision support" subtitle="What only the bank sees: risk, the rules that fired, and benchmarking against past cases.">
        {bank.bank?.risk && <RiskPanel risk={bank.bank.risk} />}
        {bank.bank?.rules && <RulesPanel rules={bank.bank.rules} />}
        <SimilarityPanel similarity={bank.similarity} showOutcome />
        <ConfidenceCard confidence={bank.confidence} />
        <PlanFix planFix={bank.bank?.planFix ?? client.planFix} subtitle="Current request compared with the optimized scenario, adjusted to this bank’s target." />
      </Part>

      <Part number="3" title="AI explanation and SWOT" subtitle="Written by an AI model from the numbers above. The numbers are calculated by Masar’s rules, not by the AI.">
        <Card>
          {aiText
            ? <div className="whitespace-pre-line text-[13px] leading-relaxed">{aiText}</div>
            : <p className="text-[13px] text-muted">No AI explanation has been generated yet. Open the application and request it, then reload this report.</p>}
        </Card>
      </Part>

      <Part number="4" title="Applicant answers">
        <ApplicantAnswers inputs={r.inputs} sectors={sectors.data ?? []} />
      </Part>

      <Part number="5" title="Reviewer actions" subtitle="Every action is recorded with who did it and when.">
        <ActionHistory actions={r.reviewerActions} />
      </Part>
    </div>
  );
}
