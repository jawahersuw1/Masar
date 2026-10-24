import Bar from '../../components/ui/Bar.jsx';
import Card, { CardHeader } from '../../components/ui/Card.jsx';
import { ErrorBlock, LoadingBlock, Notice } from '../../components/ui/Feedback.jsx';
import Pill from '../../components/ui/Pill.jsx';
import useAsync from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { int, pct, sar, times } from '../../lib/format.js';

const WEIGHT_LABELS = {
  financial: 'Financial', liquidity: 'Liquidity', financingPressure: 'Financing pressure',
  business: 'Business', operational: 'Operational', dataConfidence: 'Data confidence',
};

// Read only. These numbers are the pass marks the rule engine and the risk score use for THIS bank.
export default function Settings() {
  const settings = useAsync(() => api.bankSettings(), []);
  if (settings.loading) return <LoadingBlock label="Loading bank rules" rows={4} />;
  if (settings.status === 'error') return <ErrorBlock error={settings.error} onRetry={settings.run} />;
  const s = settings.data;
  const t = s.thresholds;

  const rows = [
    ['Minimum debt service coverage (DSCR)', times(t.minDscr), 'Monthly profit divided by the monthly installment.'],
    ['Minimum owner contribution', pct(t.minContributionPct), 'Share of the project the owner pays with their own money.'],
    ['Minimum answers given', `${int(t.minCompleteness)}%`, 'Below this, the case needs mandatory review.'],
    ['Minimum years operating', `${int(t.minYearsOperating)} yrs`, 'Age of the business.'],
    ['Longest repayment period', `${int(t.maxTermYears)} yrs`, 'Also the limit used by "Make my plan work".'],
    ['Loan amount range', `${sar(t.minLoan)} to ${sar(t.maxLoan)}`, 'Requests outside this range raise a flag.'],
    ['Interest rate range', `${pct(s.rateRange.min, 1)} to ${pct(s.rateRange.max, 1)}`, 'For information. The applicant enters the rate they expect.'],
  ];

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold">{s.name}</h2>
          <p className="mt-0.5 text-[12.5px] text-muted">These are the rules Masar applies to every application sent to your bank.</p>
        </div>
        <Pill tone="navy">{s.profile}</Pill>
      </Card>

      <Card>
        <CardHeader title="Pass marks" description="Each rule that fires on an application is one of these, shown with the real numbers." />
        <ul className="flex flex-col">
          {rows.map(([label, value, note]) => (
            <li key={label} className="flex flex-wrap items-baseline justify-between gap-3 border-t border-line-soft py-3 first:border-t-0 first:pt-0">
              <div><div className="text-[13px] font-semibold">{label}</div><div className="text-[11.5px] text-muted">{note}</div></div>
              <div className="font-mono text-[15px] font-semibold text-heading">{value}</div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader title="Risk weights" description="How much each risk area counts in the overall risk indication. They add up to 100%." />
        <ul className="flex flex-col gap-3">
          {Object.entries(s.riskWeights).map(([key, w]) => (
            <li key={key} className="grid grid-cols-[150px_1fr_48px] items-center gap-3 text-[13px]">
              <span className="font-semibold">{WEIGHT_LABELS[key] ?? key}</span>
              <Bar value={w * 100} tone="info" />
              <span className="text-right font-mono">{pct(w)}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader title="Sectors treated with extra care" description="An application in one of these sectors raises a flag for the reviewer." />
        {s.cautionSectors.length === 0
          ? <p className="text-[13px] text-muted">None. This bank has no extra-care sectors.</p>
          : <div className="flex flex-wrap gap-2">{s.cautionSectors.map((c) => <Pill key={c.id} tone="warn">{c.name}</Pill>)}</div>}
      </Card>

      <Notice>These settings are read only here. They are stored in the database tables banks and bank_caution_sectors. All values are illustrative and are not real bank policy.</Notice>
    </div>
  );
}
