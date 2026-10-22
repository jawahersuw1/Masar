import { Home, ClipboardList, BarChart3, SlidersHorizontal, ShieldAlert, Wrench, Send, FolderOpen, Inbox } from 'lucide-react';

export const CLIENT_NAV = [
  { to: '/', label: 'Welcome', title: 'Welcome to Masar', icon: Home, end: true },
  { to: '/assessment', label: 'Questionnaire', title: 'Questionnaire', icon: ClipboardList },
  { to: '/analysis', label: 'Analysis', title: 'Your analysis', icon: BarChart3 },
  { to: '/simulator', label: 'What-if simulator', title: 'What-if simulator', icon: SlidersHorizontal },
  { to: '/stress', label: 'Stress tests', title: 'Stress tests', icon: ShieldAlert },
  { to: '/plan', label: 'Make my plan work', title: 'Make my plan work', icon: Wrench },
  { to: '/submit', label: 'Send to a bank', title: 'Send to a bank', icon: Send },
  { to: '/applications', label: 'My applications', title: 'My applications', icon: FolderOpen },
];
export const BANK_NAV = [{ to: '/bank', label: 'Applications', title: 'Applications to review', icon: Inbox, end: true }];

export function titleFor(pathname) {
  if (/^\/bank\/applications\//.test(pathname)) return 'Application review';
  if (/^\/applications\//.test(pathname)) return 'Application';
  return [...CLIENT_NAV, ...BANK_NAV].find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)))?.title ?? 'Masar';
}