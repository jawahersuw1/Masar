import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { unique } from '../../lib/format.js';
import { bandTone } from '../../lib/tones.js';
import Gauge from '../ui/Gauge.jsx';

const SENTENCE = {
  Strong: 'Your numbers support this plan well.',
  Moderate: 'The plan holds up, with a few areas to strengthen.',
  Weak: 'The plan is under strain right now. The notes below show where to start.',
};

function Factors({ title, items, icon: Icon, iconClass }) {
  return (
    <div>
      <h3 className="mb-2 font-display text-[13px] font-bold text-white">{title}</h3>
      {items.length === 0 ? <p className="text-[12.5px] text-on-navy-soft">Nothing stands out here.</p> : (
        <ul className="flex flex-col gap-1.5">
          {items.map((t) => (
            <li key={t} className="flex items-start gap-2 text-[12.8px] text-on-navy"><Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} aria-hidden="true" />{t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// The one bold moment of the results: a large gauge on a navy panel.
export default function ReadinessHero({ readiness, completeness }) {
  const tone = bandTone(readiness.band);
  const chip = 'rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-bold text-white';
  return (
    <section className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(160deg,var(--navy)_0%,#08283f_100%)] p-6 text-white sm:p-8" aria-label="Financing readiness">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="relative grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
        <div className="flex justify-center">
          <Gauge value={readiness.score} tone={tone} size={184} stroke={14} onDark label="Financing readiness" caption="out of 100" />
        </div>
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="font-display text-2xl font-extrabold !text-white">Financing readiness</h2>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <span className={chip}>{readiness.band}</span>
              <span className={chip}>{readiness.confidence} confidence</span>
              {completeness && <span className={chip}>{completeness.answered} of {completeness.total} answers</span>}
            </div>
            <p className="mt-3 max-w-[56ch] text-sm text-on-navy-soft">
              {SENTENCE[readiness.band] ?? 'There is not enough information yet to score this plan.'}
              {readiness.areasUsed?.length > 0 && readiness.areasUsed.length < 3 && ` Only ${readiness.areasUsed.length} of 3 areas could be scored.`}
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Factors title="What is working" items={unique(readiness.strengths)} icon={CheckCircle2} iconClass="text-[#5fd1ae]" />
            <Factors title="What needs attention" items={unique(readiness.concerns)} icon={AlertTriangle} iconClass="text-[#f5b964]" />
          </div>
          <p className="text-[11.5px] text-on-navy-soft">{readiness.label}</p>
        </div>
      </div>
    </section>
  );
}