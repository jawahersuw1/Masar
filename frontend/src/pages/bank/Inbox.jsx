import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/ui/Feedback.jsx';
import Pill from '../../components/ui/Pill.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import useAsync from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { FINAL_STATUSES, formatDate, STATUS_LABEL } from '../../lib/format.js';
import { statusTone } from '../../lib/tones.js';

export default function Inbox() {
  const apps = useAsync(() => api.bankApplications(), []);
  const [filter, setFilter] = useState('open');

  if (apps.loading) return <LoadingBlock label="Loading applications" rows={4} />;
  if (apps.status === 'error') return <ErrorBlock error={apps.error} onRetry={apps.run} />;

  const all = apps.data ?? [];
  const open = all.filter((a) => !FINAL_STATUSES.includes(a.status));
  const closed = all.filter((a) => FINAL_STATUSES.includes(a.status));
  const rows = filter === 'open' ? open : filter === 'closed' ? closed : all;
  const tabs = [{ id: 'open', label: `Open (${open.length})` }, { id: 'closed', label: `Closed (${closed.length})` }, { id: 'all', label: `All (${all.length})` }];

  return (
    <div className="flex flex-col gap-4">
      <Tabs tabs={tabs} value={filter} onChange={setFilter} label="Filter applications" />
      {rows.length === 0 ? <EmptyBlock title="Nothing here" description="No applications match this filter." /> : (
        <Card pad="p-2 sm:p-3" className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[13px]">
            <thead><tr className="text-left text-[11.5px] text-muted"><th className="p-3 font-semibold">Application</th><th className="p-3 font-semibold">Applicant</th><th className="p-3 font-semibold">Status</th><th className="p-3 font-semibold">Answers</th><th className="p-3 font-semibold">Received</th></tr></thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-t border-line-soft transition hover:bg-surface-2">
                  <td className="p-3"><Link to={`/bank/applications/${a.id}`} state={{ clientName: a.clientName }} className="font-bold text-heading underline-offset-2 hover:underline">#{a.id}</Link></td>
                  <td className="p-3">{a.clientName}</td>
                  <td className="p-3"><Pill tone={statusTone(a.status)}>{STATUS_LABEL[a.status] ?? a.status}</Pill></td>
                  <td className="p-3 font-mono">{a.completenessPct}%</td>
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
