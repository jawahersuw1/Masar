import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import Delta from "../../components/analysis/Delta.jsx";
import Button from "../../components/ui/Button.jsx";
import Card, { CardHeader } from "../../components/ui/Card.jsx";
import { ErrorBlock, Notice } from "../../components/ui/Feedback.jsx";
import Pill from "../../components/ui/Pill.jsx";
import RangeField from "../../components/ui/RangeField.jsx";
import { useAssessment } from "../../context/AssessmentContext.jsx";
import useAsync from "../../hooks/useAsync.js";
import useDebounced from "../../hooks/useDebounced.js";
import { api } from "../../lib/api.js";
import { months, pct, sar, times } from "../../lib/format.js";
import { toApiInputs } from "../../lib/inputs.js";
import { bandTone, pressureTone } from "../../lib/tones.js";
import { WithAnalysis } from "./Analysis.jsx";

const sign = (v) => `${v > 0 ? "+" : ""}${v}%`;

function Simulation({ baseline }) {
  const { answers } = useAssessment();
  const inputs = useMemo(() => toApiInputs(answers), [answers]);
  const initial = useMemo(
    () => ({
      revenueChange: 0,
      costChange: 0,
      rateChange: 0,
      delayMonths: 0,
      term_years: inputs.term_years ?? 5,
      loan_amount: inputs.loan_amount ?? 0,
      owner_contribution: inputs.owner_contribution ?? 0,
    }),
    [inputs],
  );
  const [s, setS] = useState(initial);
  const set = (k) => (v) => setS((x) => ({ ...x, [k]: v }));
  const debounced = useDebounced(s, 350);
  const sim = useAsync(
    () =>
      api.simulate(inputs, {
        revenueChange: debounced.revenueChange / 100,
        costChange: debounced.costChange / 100,
        rateChange: debounced.rateChange / 100,
        delayMonths: debounced.delayMonths,
        term_years: debounced.term_years,
        loan_amount: debounced.loan_amount,
        owner_contribution: debounced.owner_contribution,
      }),
    [debounced],
  );

  useEffect(() => {
    setS(initial);
  }, [initial]);
  const result = sim.data?.result;
  const before = baseline?.values ?? {};
  const after = result?.values ?? {};
  const loanMax = Math.max(1_000_000, (inputs.loan_amount ?? 0) * 2);
  const ownerMax = Math.max(500_000, (inputs.owner_contribution ?? 0) * 2);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      <Card className="flex flex-col gap-5">
        <CardHeader
          title="Change the plan"
          description="Move a slider and the result updates."
          action={
            <Button variant="ghost" size="sm" onClick={() => setS(initial)}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset
            </Button>
          }
        />
        <RangeField
          label="Sales"
          value={s.revenueChange}
          onChange={set("revenueChange")}
          min={-40}
          max={60}
          format={sign}
        />
        <RangeField
          label="Costs"
          value={s.costChange}
          onChange={set("costChange")}
          min={-20}
          max={40}
          format={sign}
        />
        <RangeField
          label="Interest rate change"
          value={s.rateChange}
          onChange={set("rateChange")}
          min={-3}
          max={5}
          step={0.5}
          format={(v) => `${v > 0 ? "+" : ""}${v} pts`}
        />
        <RangeField
          label="Loan amount"
          value={s.loan_amount}
          onChange={set("loan_amount")}
          min={0}
          max={loanMax}
          step={10000}
          format={sar}
        />
        <RangeField
          label="Your own money"
          value={s.owner_contribution}
          onChange={set("owner_contribution")}
          min={0}
          max={ownerMax}
          step={10000}
          format={sar}
        />
        <RangeField
          label="Repayment period"
          value={s.term_years}
          onChange={set("term_years")}
          min={1}
          max={15}
          format={(v) => `${v} years`}
        />
        <RangeField
          label="Delay before sales grow"
          value={s.delayMonths}
          onChange={set("delayMonths")}
          min={0}
          max={12}
          format={(v) => `${v} months`}
        />
      </Card>

      <div className="flex flex-col gap-4" aria-live="polite">
        {sim.status === "error" && (
          <ErrorBlock
            error={sim.error}
            title="The simulation could not run"
            onRetry={() => sim.run()}
          />
        )}
        <Card
          className={`transition-opacity ${sim.loading ? "opacity-60" : "opacity-100"}`}
        >
          <CardHeader
            title="Live result"
            description="Compared with your current plan."
          />
          {[
            ["Debt service coverage", "dscr", times, "higher"],
            ["Cash left each month", "cashLeft", sar, "higher"],
            ["Monthly installment", "installment", sar, "lower"],
            ["Cash buffer", "liquidityBuffer", months, "higher"],
            ["Safety margin", "safetyMargin", pct, "higher"],
            ["Total interest", "totalInterest", sar, "lower"],
          ].map(([label, key, fmt, better]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-3 border-b border-line-soft py-2.5 text-[13px] last:border-0"
            >
              <span className="text-muted">{label}</span>
              {result ? (
                <Delta
                  before={before[key]}
                  after={after[key]}
                  format={fmt}
                  better={better}
                />
              ) : (
                <span className="font-mono text-muted">{fmt(before[key])}</span>
              )}
            </div>
          ))}
          {result && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill tone={pressureTone(result.pressure)}>
                Pressure: {result.pressure}
              </Pill>
              <Pill tone={bandTone(result.resilience)}>
                Resilience: {result.resilience}
              </Pill>
            </div>
          )}
          {result?.delay && (
            <p
              className={`mt-3 rounded-lg px-3 py-2 text-[12.5px] ${result.delay.runsOutDuringDelay ? "bg-bad-soft text-bad" : "bg-surface-2 text-ink-soft"}`}
            >
              {result.delay.runsOutDuringDelay
                ? "Cash runs out during the delay."
                : "Cash lasts through the delay."}{" "}
              Cash after the delay: {sar(result.delay.cashAfterDelay)}.
            </p>
          )}
        </Card>
        <Notice>
          What-if results show how the plan reacts to changes. They do not
          predict the future.
        </Notice>
      </div>
    </div>
  );
}

export default function SimulatorPage() {
  return (
    <WithAnalysis>
      {(a) => <Simulation baseline={a.stressTests?.baseline} />}
    </WithAnalysis>
  );
}
