import { NavLink } from 'react-router-dom';
import { Check, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAssessment } from '../../context/AssessmentContext.jsx';
import { BANK_NAV, CLIENT_NAV } from '../../lib/nav.js';

export default function Rail({ open, onClose }) {
  const { user, logout } = useAuth();
  const { answered, analysis } = useAssessment();
  const isReviewer = user.role === 'reviewer';
  const items = isReviewer ? BANK_NAV : CLIENT_NAV;
  const done = { '/assessment': answered > 0, '/analysis': Boolean(analysis) };

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside className={`print:hidden fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col gap-5 overflow-y-auto bg-navy p-3.5 pt-5 text-on-navy transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between gap-2.5 px-1.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-gradient-to-br from-accent to-[#c96e17] font-display text-[15px] font-extrabold text-white">M</div>
            <div>
              <div className="font-display text-[16.5px] font-extrabold text-white">Masar</div>
              <div className="text-[10.5px] text-on-navy-soft">Financing readiness</div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-on-navy-soft hover:bg-white/10 lg:hidden" aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>

        <nav aria-label="Main" className="flex flex-col gap-0.5">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={onClose}
              className={({ isActive }) => `flex items-center gap-2.5 rounded-[10px] border px-2.5 py-[9px] text-[12.6px] font-semibold transition ${isActive ? 'border-white/15 bg-white/[0.13] text-white' : 'border-transparent text-on-navy-soft hover:bg-white/[0.07]'}`}>
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {done[to] && <Check className="h-3.5 w-3.5 text-[#5fd1ae]" aria-label="done" />}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-3 text-[11px] leading-relaxed text-on-navy-soft">
          <div className="mb-3 flex items-center justify-between gap-2 rounded-[10px] bg-white/[0.07] px-3 py-2.5">
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-bold text-white">{user.name}</div>
              <div>{isReviewer ? 'Bank reviewer' : 'Business owner'}</div>
            </div>
            <button type="button" onClick={logout} aria-label="Sign out" title="Sign out" className="rounded-md p-1.5 hover:bg-white/10"><LogOut className="h-4 w-4" /></button>
          </div>
          {isReviewer ? 'Decision support only. A person makes every decision.' : 'Guidance only. Not a credit score or a financing decision.'}
        </div>
      </aside>
    </>
  );
}