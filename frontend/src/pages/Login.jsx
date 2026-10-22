import { Navigate, useNavigate } from 'react-router-dom';
import { Briefcase, Landmark } from 'lucide-react';
import { homeFor } from '../components/layout/RequireRole.jsx';
import { ErrorBlock, LoadingBlock } from '../components/ui/Feedback.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useAsync from '../hooks/useAsync.js';
import { api } from '../lib/api.js';

function UserButton({ u, onPick }) {
  const Icon = u.role === 'reviewer' ? Landmark : Briefcase;
  return (
    <button type="button" onClick={() => onPick(u)} className="flex w-full items-center gap-3 rounded-xl border border-line-soft bg-surface p-4 text-left shadow-card transition hover:border-accent">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 text-steel"><Icon className="h-5 w-5" aria-hidden="true" /></span>
      <span><span className="block text-[14px] font-bold">{u.name}</span><span className="text-[12px] text-muted">{u.role === 'reviewer' ? `Reviewer${u.bankId ? ` at ${u.bankId}` : ''}` : 'Business owner'}</span></span>
    </button>
  );
}

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const users = useAsync(() => api.users(), []);
  if (user) return <Navigate to={homeFor(user.role)} replace />;

  const pick = (u) => { login(u); navigate(homeFor(u.role), { replace: true }); };
  const list = users.data ?? [];

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,var(--navy)_0%,#08283f_100%)] p-8 text-white sm:p-14">
        <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-accent to-[#c96e17] font-display font-extrabold">M</div>
          <span className="font-display text-lg font-extrabold">Masar</span>
        </div>
        <div className="relative my-16 max-w-[34rem]">
          <p className="font-display text-sm font-bold text-accent">Don’t finance the idea. Understand it first.</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.08] tracking-tight !text-white sm:text-5xl">Know where your plan stands before you ask a bank.</h1>
        </div>
        <p className="relative text-[12px] text-on-navy-soft">Masar recommends. The bank decides.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px]">
          <h2 className="font-display text-2xl font-extrabold">Choose who to sign in as</h2>
          <p className="mb-6 mt-1.5 text-[13px] text-muted">Demo sign-in. There is no password, and the server identifies you by id only.</p>
          {users.loading && <LoadingBlock label="Loading users" rows={2} />}
          {users.status === 'error' && <ErrorBlock error={users.error} title="Could not load the user list" onRetry={users.run} />}
          <div className="flex flex-col gap-5">
            {['client', 'reviewer'].map((role) => {
              const group = list.filter((u) => u.role === role);
              return group.length > 0 && (
                <div key={role}>
                  <h3 className="mb-2 text-[12.5px] font-bold text-muted">{role === 'client' ? 'Business owners' : 'Bank reviewers'}</h3>
                  <div className="flex flex-col gap-2">{group.map((u) => <UserButton key={u.id} u={u} onPick={pick} />)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}