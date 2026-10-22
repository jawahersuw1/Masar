const KEY = 'masar.theme';
const query = () => window.matchMedia('(prefers-color-scheme: dark)');
export const getThemePref = () => localStorage.getItem(KEY) ?? 'system';
const resolve = (pref) => (pref === 'system' ? (query().matches ? 'dark' : 'light') : pref);
export const applyTheme = (pref = getThemePref()) => { document.documentElement.dataset.theme = resolve(pref); };
export function setThemePref(pref) { localStorage.setItem(KEY, pref); applyTheme(pref); }
export function watchSystemTheme() {
  const q = query();
  const handler = () => { if (getThemePref() === 'system') applyTheme('system'); };
  q.addEventListener('change', handler);
  return () => q.removeEventListener('change', handler);
}