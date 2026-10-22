import StressTests from '../../components/analysis/StressTests.jsx';
import { WithAnalysis } from './Analysis.jsx';

export default function StressTestPage() {
  return <WithAnalysis>{(a) => <StressTests stressTests={a.stressTests} />}</WithAnalysis>;
}
