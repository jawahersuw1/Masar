export default function Tabs({ tabs, value, onChange, label = 'Sections' }) {
  return (
    <div role="tablist" aria-label={label} className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-[11px] bg-surface-2 p-1">
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button key={t.id} type="button" role="tab" aria-selected={active} onClick={() => onChange(t.id)}
            className={`whitespace-nowrap rounded-lg px-3.5 py-2 font-display text-xs font-bold transition ${active ? 'bg-surface text-heading shadow-card' : 'text-muted hover:text-ink'}`}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}