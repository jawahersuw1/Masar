const TONES = {
  good: 'bg-good-soft text-good', warn: 'bg-warn-soft text-warn', bad: 'bg-bad-soft text-bad',
  info: 'bg-info-soft text-info', neutral: 'bg-surface-2 text-ink-soft', navy: 'bg-navy text-white',
};

export default function Pill({ tone = 'neutral', dot = true, className = '', children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${TONES[tone]} ${className}`}>
      {dot && <span className="h-[7px] w-[7px] rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}