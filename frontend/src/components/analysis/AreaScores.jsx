import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { formatMetric, metricLabel, pct } from '../../lib/format.js';
import { bandTone, componentTone } from '../../lib/tones.js';
import Bar from '../ui/Bar.jsx';
import Card from '../ui/Card.jsx';
import Gauge from '../ui/Gauge.jsx';
import Pill from '../ui/Pill.jsx';

const AREAS = {
  business: { title: 'Business', blurb: 'Experience, track record and growth plans' },
  financial: { title: 'Financial', blurb: 'Profit, repayment strength and your own contribution' },
  operational: { title: 'Operational', blurb: 'Cash buffer, team size and stability' },
};

function Breakdown({ area }) {
  return (
    <ul className="flex flex-col gap-3 pt-3">
      {area.components.map((c) => (
        <li key={c.key} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
            <span className="font-semibold text-ink">{c.label ?? metricLabel(c.key)}</span>
            <span className="font-mono text-muted">{formatMetric(c.key, c.value)}</span>
          </div>
          <Bar value={c.componentScore} tone={componentTone(c.componentScore)} height="h-[7px]" />
          {c.reason && <p className="text-[11.5px] text-muted">{c.reason}</p>}
        </li>
      ))}
      {area.missing?.length > 0 && <li className="text-[11.5px] text-warn">Not answered: {area.missing.map(metricLabel).join(', ')}</li>}
    </ul>
  );
}

function AreaCard({ id, area }) {
  const [open, setOpen] = useState(false);
  const meta = AREAS[id];
  const partial = area.coverage !== undefined && area.coverage < 1;
  return (
    <Card className="flex flex-col gap-3" pad="p-5">
      <div className="flex items-center gap-4">
        <Gauge value={area.score} tone={bandTone(area.band)} size={92} stroke={10} label={`${meta.title} score`} />
        <div className="min-w-0">
          <h3 className="font-display text-[15px] font-extrabold">{meta.title}</h3>
          <p className="mb-1.5 text-[11.5px] text-muted">{meta.blurb}</p>
          <Pill tone={bandTone(area.band)}>{area.band}</Pill>
        </div>
      </div>
      {partial && <p className="rounded-lg bg-warn-soft px-3 py-2 text-[11.5px] text-warn">Based on {pct(area.coverage)} of this area’s evidence. Some answers are missing.</p>}
      {area.strengths?.length > 0 && <p className="text-[12px] text-ink-soft"><span className="font-semibold text-good">Strong: </span>{area.strengths.join(', ')}</p>}
      {area.concerns?.length > 0 && <p className="text-[12px] text-ink-soft"><span className="font-semibold text-bad">Weak: </span>{area.concerns.join(', ')}</p>}
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="mt-auto flex items-center gap-1.5 text-[12px] font-bold text-steel hover:text-heading">
        How this score is built
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden"><Breakdown area={area} /></div>
      </div>
    </Card>
  );
}

export default function AreaScores({ feasibility }) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-3">
      {Object.keys(AREAS).map((id) => feasibility[id] && <AreaCard key={id} id={id} area={feasibility[id]} />)}
    </div>
  );
}