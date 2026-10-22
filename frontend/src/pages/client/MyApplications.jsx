import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/ui/Feedback.jsx';
import Pill from '../../components/ui/Pill.jsx';
import useAsync from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { formatDate, STATUS_LABEL } from '../../lib/format.js';
import { statusTone } from '../../lib/tones.js';

export default function MyApplications() {
  const apps = useAsync(() => api.myApplications(), []);
  const banks = useAsync(() => api.banks(), []);
  const bankName = (id) => banks.data?.find((b) => b.bankId === id)?.name ?? id;

  if (apps.loading) return <LoadingBlock label="Loading applications" />;
  if (apps.status === 'error') return <ErrorBlock error={apps.error} onRetry={apps.run} />;
  if (!apps.data?.length) return <EmptyBlock title="No applications yet" description="When you send your plan to a bank, it shows up here with its status." action={<Button as={Link} to="/submit">Send to a bank</Button>} />;

  return (
    <Card pad="p-2 sm:p-3" className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-[13px]">
        <thead><tr className="text-left text-[11.5px] text-muted"><th className="p-3 font-semibold">Application</th><th className="p-3 font-semibold">Bank</th><th className="p-3 font-semibold">Status</th><th className="p-3 font-semibold">Answers</th><th className="p-3 font-semibold">Sent</th></tr></thead>
        <tbody>
          {apps.data.map((a) => (
            <tr key={a.id} className="border-t border-line-soft transition hover:bg-surface-2">
              <td className="p-3"><Link to={`/applications/${a.id}`} className="font-bold text-heading underline-offset-2 hover:underline">#{a.id}</Link></td>
              <td className="p-3">{bankName(a.bankId)}</td>
              <td className="p-3"><Pill tone={statusTone(a.status)}>{STATUS_LABEL[a.status] ?? a.status}</Pill></td>
              <td className="p-3 font-mono">{a.completenessPct}%</td>
              <td className="p-3 text-muted">{formatDate(a.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
