import { useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { getThemePref, setThemePref } from '../../lib/theme.js';

const ORDER = ['system', 'light', 'dark'];
const ICONS = { system: Monitor, light: Sun, dark: Moon };

export default function ThemeToggle() {
  const [pref, setPref] = useState(getThemePref);
  const Icon = ICONS[pref];
  const next = () => {
    const n = ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length];
    setThemePref(n);
    setPref(n);
  };
  return (
    <button type="button" onClick={next} aria-label={`Theme: ${pref}. Click to change.`} title={`Theme: ${pref}`}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-ink">
      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
    </button>
  );
}