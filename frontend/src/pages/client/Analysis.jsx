import { Link } from 'react-router-dom';
import AreaScores from '../../components/analysis/AreaScores.jsx';
import ConfidenceCard from '../../components/analysis/ConfidenceCard.jsx';
import MetricsGrid from '../../components/analysis/MetricsGrid.jsx';
import ReadinessHero from '../../components/analysis/ReadinessHero.jsx';
import SimilarityPanel from '../../components/analysis/SimilarityPanel.jsx';
import Button from '../../components/ui/Button.jsx';
import { EmptyBlock, ErrorBlock, LoadingBlock, Notice } from '../../components/ui/Feedback.jsx';
import { useEnsureAnalysis } from '../../context/AssessmentContext.jsx';

export function NeedAnswers() {
  return <EmptyBlock title="Answer a few questions first" description="Masar needs at least one answer to analyze your plan." action={<Button as={Link} to="/assessment">Go to the questionnaire</Button>} />;
}

// Wraps pages that need the analysis: handles the empty / loading / error states in one place.
export function WithAnalysis({ children }) {
  const { answered, analysis, status, error, runAnalysis } = useEnsureAnalysis();
  if (answered === 0) return <NeedAnswers />;
  if (status === 'error' && !analysis) return <ErrorBlock error={error} title="The analysis could not run" onRetry={() => runAnalysis().catch(() => {})} />;
  if (!analysis) return <LoadingBlock label="Analyzing your plan" rows={5} />;
  return children(analysis);
}

export default function Analysis() {
  return (
    <WithAnalysis>
      {(a) => (
        <div className="flex flex-col gap-5">
          <ReadinessHero readiness={a.readiness} completeness={a.completeness} />
          <AreaScores feasibility={a.feasibility} />
          <MetricsGrid metrics={a.metrics} />
          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <SimilarityPanel similarity={a.similarity} />
            <ConfidenceCard confidence={a.confidence} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button as={Link} to="/simulator" variant="outline">Try what-ifs</Button>
            <Button as={Link} to="/submit">Send to a bank</Button>
          </div>
          <Notice>{a.dataNote ?? a.note}</Notice>
        </div>
      )}
    </WithAnalysis>
  );
}
