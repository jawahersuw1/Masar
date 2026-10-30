import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Search } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/ui/Feedback.jsx';
import Pill from '../../components/ui/Pill.jsx';
import Stat from '../../components/ui/Stat.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import useAsync from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { DASH, FINAL_STATUSES, formatDate, int, sar, STATUS_LABEL } from '../../lib/format.js';
import { bandTone, riskTone, statusTone } from '../../lib/tones.js';

export default function Inbox() {
  const apps = useAsync(() => api.bankApplications(), []);
  const [filter, setFilter] = useState('open');
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  if (apps.loading) return <LoadingBlock label="Loading applications" rows={4} />;
  if (apps.status === 'error') return <ErrorBlock error={apps.error} onRetry={apps.run} />;

  const all = apps.data ?? [];
  const isOpen = (a) => !FINAL_STATUSES.includes(a.status);
  const open = all.filter(isOpen);
  const closed = all.filter((a) => !isOpen(a));
  const needReview = open.filter((a) => a.mandatoryReview);
  const highRisk = open.filter((a) => a.risk?.band === 'High');

  const q = query.trim().toLowerCase();
  const matches = (a) => !q || `#${a.id} ${a.id} ${a.clientName} ${a.sector ?? ''}`.toLowerCase().includes(q);
  const base = filter === 'open' ? open : filter === 'closed' ? closed : all;
  // Cases that need a closer look come first. The rest stay newest first.
  const rows = base.filter(matches).sort((a, b) => Number(b.mandatoryReview) - Number(a.mandatoryReview));
  const tabs = [{ id: 'open', label: `Open (${open.length})` }, { id: 'closed', label: `Closed (${closed.length})` }, { id: 'all', label: `All (${all.length})` }];

  const openApplication = (a) => navigate(`/bank/applications/${a.id}`, { state: { clientName: a.clientName } });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card pad="p-4"><Stat label="Open applications" value={int(open.length)} hint="Waiting for a decision" /></Card>
        <Card pad="p-4" tone={needReview.length ? 'bad' : 'default'}><Stat label="Mandatory review" value={int(needReview.length)} valueClass={needReview.length ? 'text-bad' : ''} hint="Read these first" /></Card>
        <Card pad="p-4"><Stat label="High risk" value={int(highRisk.length)} hint="Overall risk indication" /></Card>
        <Card pad="p-4"><Stat label="Decided" value={int(closed.length)} hint="Accepted, modified or declined" /></Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={tabs} value={filter} onChange={setFilter} label="Filter applications" />
        <label className="relative">
          <span className="sr-only">Search applications</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by number, name or sector"
            className="w-[260px] rounded-[10px] border border-line bg-surface py-2 pl-9 pr-3 text-[13px] text-heading placeholder:text-faint" />
        </label>
      </div>

      {rows.length === 0 ? <EmptyBlock title="Nothing here" description="No applications match this filter." /> : (
        <Card pad="p-2 sm:p-3" className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] text-muted">
                {['Application', 'Applicant', 'Loan', 'Risk', 'Readiness', 'Flags', 'Status', 'Received'].map((h) => <th key={h} className="p-3 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} onClick={() => openApplication(a)} className="cursor-pointer border-t border-line-soft transition hover:bg-surface-2">
                  <td className="p-3">
                    <Link to={`/bank/applications/${a.id}`} state={{ clientName: a.clientName }} onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 font-bold text-heading underline underline-offset-2">#{a.id}<ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
                    {a.revision > 1 && <div className="text-[11.5px] text-muted">Round {a.revision}</div>}
                  </td>
                  <td className="p-3"><div className="font-semibold">{a.clientName}</div><div className="text-[11.5px] text-muted">{a.sector ?? DASH}</div></td>
                  <td className="p-3 font-mono">{sar(a.loanAmount)}</td>
                  <td className="p-3">{a.risk ? <Pill tone={riskTone(a.risk.band)}>{a.risk.band} · {Math.round(a.risk.score)}</Pill> : <span className="text-muted">{DASH}</span>}</td>
                  <td className="p-3">{a.readiness?.score != null ? <span className="inline-flex items-center gap-2"><span className="font-mono font-semibold">{Math.round(a.readiness.score)}</span><Pill tone={bandTone(a.readiness.band)} dot={false}>{a.readiness.band}</Pill></span> : <span className="text-muted">{DASH}</span>}</td>
                  <td className="p-3"><div className="flex flex-wrap gap-1.5">
                    {a.mandatoryReview && <Pill tone="bad">Mandatory review</Pill>}
                    {a.risk?.provisional && <Pill tone="warn">Provisional</Pill>}
                    {!a.mandatoryReview && !a.risk?.provisional && <span className="text-muted">{DASH}</span>}
                  </div></td>
                  <td className="p-3"><Pill tone={statusTone(a.status)}>{STATUS_LABEL[a.status] ?? a.status}</Pill></td>
                  <td className="p-3 text-muted">{formatDate(a.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
