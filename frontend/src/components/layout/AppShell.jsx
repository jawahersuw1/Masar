import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Rail from './Rail.jsx';
import Topbar from './Topbar.jsx';

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); setOpen(false); }, [pathname]);

  return (
    <div className="flex min-h-screen bg-canvas">
      <Rail open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 pb-24 pt-6 sm:px-7 print:max-w-none print:px-0 print:pb-0">
          <div key={pathname} className="animate-fade-up"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}