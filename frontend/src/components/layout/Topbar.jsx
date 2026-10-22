import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { titleFor } from '../../lib/nav.js';
import Pill from '../ui/Pill.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function Topbar({ onMenu }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line-soft px-4 py-3.5 backdrop-blur sm:px-7"
      style={{ background: 'color-mix(in srgb, var(--bg) 88%, transparent)' }}>
      <div className="flex items-center gap-3">
        <button type="button" onClick={onMenu} className="rounded-lg p-2 text-muted hover:bg-surface-2 lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
        <div>
          <h1 className="font-display text-[19px] font-extrabold leading-tight">{titleFor(pathname)}</h1>
          <p className="text-xs text-muted">{user.role === 'reviewer' ? `Reviewer view${user.bankId ? ` · ${user.bankId}` : ''}` : 'Business owner view'}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Pill tone="navy" className="hidden md:inline-flex">Masar recommends · the bank decides</Pill>
        <ThemeToggle />
      </div>
    </header>
  );
}