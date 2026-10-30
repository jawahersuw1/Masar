import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TimelineLoader } from '../../components/history/Timeline.jsx';
import EditButton from '../../components/history/EditButton.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/ui/Feedback.jsx';
import Pill from '../../components/ui/Pill.jsx';
import useAsync from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { formatDate, STATUS_LABEL } from '../../lib/format.js';
import { statusTone } from '../../lib/tones.js';

// One application. Click the number to open the whole conversation with the bank.
function Row({ a, bankName }) {
  const [open, setOpen] = useState(a.status === 'changes_requested'); // the bank is waiting for you: show its message at once
  return (
    <>
      <tr className="border-t border-line-soft transition hover:bg-surface-2">
        <td className="p-3">
          <button type="button" aria-expanded={open} aria-label={`${open ? 'Hide' : 'Show'} the history of application ${a.id}`} onClick={() => setOpen(!open)}
            className="flex items-center gap-1 font-bold text-heading">
            {open ? <ChevronDown className="h-4 w-4" aria-hidden="true" /> : <ChevronRight className="h-4 w-4" aria-hidden="true" />}#{a.id}
          </button>
        </td>
        <td className="p-3">{bankName}</td>
        <td className="p-3">
          <Pill tone={statusTone(a.status)}>{STATUS_LABEL[a.status] ?? a.status}</Pill>
          {a.revision > 1 && <span className="ml-2 text-[11.5px] text-muted">Round {a.revision}</span>}
        </td>
        <td className="p-3 font-mono">{a.completenessPct}%</td>
        <td className="p-3 text-muted">{formatDate(a.createdAt)}</td>
        <td className="p-3 text-right">{a.status === 'changes_requested' && <EditButton applicationId={a.id} size="sm">Edit</EditButton>}</td>
      </tr>
      {open && (
        <tr className="bg-surface-2/40">
          <td colSpan={6} className="p-4">
            <TimelineLoader applicationId={a.id} audience="client" version={`${a.status}-${a.revision}`} />
            <Link to={`/applications/${a.id}`} className="mt-3 inline-block text-[12.5px] font-bold text-steel hover:underline">Open the full result</Link>
          </td>
        </tr>
      )}
    </>
  );
}

export default function MyApplications() {
  const apps = useAsync(() => api.myApplications(), []);
  const banks = useAsync(() => api.banks(), []);
  const bankName = (id) => banks.data?.find((b) => b.bankId === id)?.name ?? id;

  if (apps.loading) return <LoadingBlock label="Loading applications" />;
  if (apps.status === 'error') return <ErrorBlock error={apps.error} onRetry={apps.run} />;
  if (!apps.data?.length) return <EmptyBlock title="No applications yet" description="When you send your plan to a bank, it shows up here with its status." action={<Button as={Link} to="/submit">Send to a bank</Button>} />;

  return (
    <Card pad="p-2 sm:p-3" className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-[13px]">
        <thead><tr className="text-left text-[11.5px] text-muted"><th className="p-3 font-semibold">Application</th><th className="p-3 font-semibold">Bank</th><th className="p-3 font-semibold">Status</th><th className="p-3 font-semibold">Answers</th><th className="p-3 font-semibold">Sent</th><th className="p-3"><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>{apps.data.map((a) => <Row key={a.id} a={a} bankName={bankName(a.bankId)} />)}</tbody>
      </table>
    </Card>
  );
}
