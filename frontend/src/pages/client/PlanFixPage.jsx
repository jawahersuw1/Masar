import PlanFix from '../../components/analysis/PlanFix.jsx';
import { WithAnalysis } from './Analysis.jsx';

export default function PlanFixPage() {
  return <WithAnalysis>{(a) => <PlanFix planFix={a.planFix} />}</WithAnalysis>;
}
