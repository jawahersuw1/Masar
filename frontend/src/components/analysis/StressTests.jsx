import { months, pct, sar, times } from "../../lib/format.js";
import { bandTone, pressureTone } from "../../lib/tones.js";
import Card, { CardHeader } from "../ui/Card.jsx";
import { Notice } from "../ui/Feedback.jsx";
import Pill from "../ui/Pill.jsx";
import Delta from "./Delta.jsx";

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line-soft py-2 text-[12.5px] last:border-0">
      <span className="text-muted">{label}</span>
      {children}
    </div>
  );
}

function TestCard({ test }) {
  const c = test.comparison ?? {};
  const survives = test.survives;
  const delay = test.result?.delay;
  return (
    <Card
      tone={survives === false ? "bad" : "default"}
      pad="p-4 sm:p-5"
      className="flex flex-col gap-2"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-[14px] font-extrabold">{test.name}</h3>
        <Pill
          tone={
            survives === true ? "good" : survives === false ? "bad" : "neutral"
          }
        >
          {survives === true
            ? "Holds up"
            : survives === false
              ? "Does not hold up"
              : "Not enough data"}
        </Pill>
      </div>
      <div>
        <Row label="Debt service coverage">
          {c.dscr && (
            <Delta before={c.dscr.before} after={c.dscr.after} format={times} />
          )}
        </Row>
        <Row label="Cash left each month">
          {c.cashLeft && (
            <Delta
              before={c.cashLeft.before}
              after={c.cashLeft.after}
              format={sar}
            />
          )}
        </Row>
        <Row label="Cash buffer">
          {c.liquidityBuffer && (
            <Delta
              before={c.liquidityBuffer.before}
              after={c.liquidityBuffer.after}
              format={months}
            />
          )}
        </Row>
        <Row label="Safety margin">
          {c.safetyMargin && (
            <Delta
              before={c.safetyMargin.before}
              after={c.safetyMargin.after}
              format={pct}
            />
          )}
        </Row>
        {c.pressure && (
          <Row label="Cash-flow pressure">
            <span className="flex items-center gap-1.5">
              <Pill tone={pressureTone(c.pressure.before)} dot={false}>
                {c.pressure.before}
              </Pill>
              →
              <Pill tone={pressureTone(c.pressure.after)} dot={false}>
                {c.pressure.after}
              </Pill>
            </span>
          </Row>
        )}
      </div>
      {delay && (
        <p
          className={`rounded-lg px-3 py-2 text-[12px] ${delay.runsOutDuringDelay ? "bg-bad-soft text-bad" : "bg-surface-2 text-ink-soft"}`}
        >
          {delay.runsOutDuringDelay
            ? "Cash runs out during the delay."
            : "Cash lasts through the delay."}{" "}
          Cash after the delay: {sar(delay.cashAfterDelay)}.
        </p>
      )}
    </Card>
  );
}

export default function StressTests({ stressTests }) {
  const { baseline, tests } = stressTests;
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader
          title="Current plan"
          description="The baseline each stress test is compared with."
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <div className="font-mono text-xl font-semibold text-heading">
              {times(baseline?.values?.dscr)}
            </div>
            <div className="text-[11px] text-muted">Debt service coverage</div>
          </div>
          <div>
            <div className="font-mono text-xl font-semibold text-heading">
              {sar(baseline?.values?.cashLeft)}
            </div>
            <div className="text-[11px] text-muted">Cash left each month</div>
          </div>
          <div className="flex flex-col items-start gap-1">
            <Pill tone={pressureTone(baseline?.pressure)}>
              {baseline?.pressure ?? "—"}
            </Pill>
            <div className="text-[11px] text-muted">Cash-flow pressure</div>
          </div>
          <div className="flex flex-col items-start gap-1">
            <Pill tone={bandTone(baseline?.resilience)}>
              {baseline?.resilience ?? "—"}
            </Pill>
            <div className="text-[11px] text-muted">Resilience</div>
          </div>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {tests.map((t) => (
          <TestCard key={t.id} test={t} />
        ))}
      </div>
      <Notice>
        “Holds up” means debt service coverage stays at or above 1.0 and, where
        there is a delay, cash does not run out. These are what-if scenarios,
        not forecasts.
      </Notice>
    </div>
  );
}
