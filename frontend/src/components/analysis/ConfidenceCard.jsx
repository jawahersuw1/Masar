import { Info } from 'lucide-react';
import { levelTone } from '../../lib/tones.js';
import Card, { CardHeader } from '../ui/Card.jsx';
import { Notice } from '../ui/Feedback.jsx';
import Pill from '../ui/Pill.jsx';

export default function ConfidenceCard({ confidence }) {
  return (
    <Card>
      <CardHeader title="How far to trust this" description="Confidence reflects how much evidence supports the scores. It does not measure your business."
        action={<Pill tone={levelTone(confidence.level)}>{confidence.level} confidence</Pill>} />
      <ul className="flex flex-col gap-2">
        {confidence.reasons?.map((r) => (
          <li key={r} className="flex items-start gap-2 text-[13px] text-ink-soft"><Info className="mt-0.5 h-4 w-4 shrink-0 text-steel" aria-hidden="true" />{r}</li>
        ))}
      </ul>
      {confidence.mandatoryReview && <Notice variant="strong" className="mt-4"><strong>A reviewer must check this case.</strong> Evidence is too thin for the scores to stand alone.</Notice>}
    </Card>
  );
}