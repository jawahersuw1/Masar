import { pct } from '../../lib/format.js';
import { riskTone } from '../../lib/tones.js';
import Bar from '../ui/Bar.jsx';
import Card, { CardHeader } from '../ui/Card.jsx';
import Gauge from '../ui/Gauge.jsx';
import { Notice } from '../ui/Feedback.jsx';
import Pill from '../ui/Pill.jsx';

export default function RiskPanel({ risk }) {
  const { overall, areas, drivers, topDriver } = risk;
  const tone = riskTone(overall.band);
  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-wrap items-center gap-6">
        <Gauge value={overall.risk} tone={tone} size={132} label="Overall modeled risk" caption="risk" />
        <div className="max-w-[56ch]">
          <h2 className="font-display text-lg font-extrabold">Overall modeled risk</h2>
          <div className="my-2 flex flex-wrap gap-2"><Pill tone={tone}>{overall.band}</Pill>{overall.provisional && <Pill tone="warn">Provisional</Pill>}</div>
          <p className="text-[12.8px] text-muted">A weighted view of six areas using this bank’s own weights. It is not one hidden number.</p>
          {overall.provisional && <p className="mt-2 text-[12.5px] text-warn">Only {pct(overall.coverage)} of the evidence was available, so treat this band as provisional.</p>}
          {topDriver && <p className="mt-2 text-[12.8px] text-ink"><strong>Biggest driver:</strong> {topDriver.label ?? topDriver}</p>}
        </div>
      </Card>

      <Card>
        <CardHeader title="Risk by area" description="Higher bar means higher risk. Weight shows how much the area counts for this bank." />
        <ul className="flex flex-col gap-4">
          {areas.map((a) => (
            <li key={a.key} className="grid gap-2 sm:grid-cols-[190px_1fr_auto] sm:items-center">
              <div><span className="text-[13px] font-semibold">{a.label}</span><span className="ml-2 text-[11px] text-faint">weight {pct(a.weight)}</span></div>
              {a.risk === null ? <p className="text-[12px] text-muted">Not assessed{a.missing?.length ? `: missing ${a.missing.join(', ')}` : ''}</p> : <Bar value={a.risk} tone={riskTone(a.band)} />}
              <Pill tone={riskTone(a.band)}>{a.band}</Pill>
            </li>
          ))}
        </ul>
      </Card>

      {drivers?.length > 0 && (
        <Card>
          <CardHeader title="What drives the risk" description="Components ranked by how many risk points they add." />
          <ul className="flex flex-col gap-3">
            {drivers.slice(0, 6).map((d) => (
              <li key={d.key} className="flex flex-col gap-1">
                <div className="flex justify-between gap-3 text-[12.8px]"><span className="font-semibold">{d.label}</span><span className="font-mono text-muted">+{Number(d.contribution).toFixed(1)}</span></div>
                <Bar value={d.contribution} max={Math.max(...drivers.map((x) => x.contribution), 1)} tone="bad" height="h-[7px]" />
                {d.reason && <p className="text-[11.5px] text-muted">{d.reason}</p>}
              </li>
            ))}
          </ul>
        </Card>
      )}
      <Notice variant="strong">Masar does not predict default or repayment, and it never approves or declines financing. The reviewer decides.</Notice>
    </div>
  );
}