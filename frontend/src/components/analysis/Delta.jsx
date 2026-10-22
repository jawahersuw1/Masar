import { ArrowRight } from 'lucide-react';
import { isNil } from '../../lib/format.js';

// "before → after", coloured by whether the change helps. better: 'higher' | 'lower'
export default function Delta({ before, after, format, better = 'higher' }) {
  let tone = 'text-ink-soft';
  if (!isNil(before) && !isNil(after) && before !== after) {
    const improved = better === 'higher' ? after > before : after < before;
    tone = improved ? 'text-good' : 'text-bad';
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[12.5px]">
      <span className="text-muted">{format(before)}</span>
      <ArrowRight className="h-3 w-3 text-faint" aria-hidden="true" />
      <span className={`font-semibold ${tone}`}>{format(after)}</span>
    </span>
  );
}