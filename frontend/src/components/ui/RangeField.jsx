export default function RangeField({ label, value, onChange, min, max, step = 1, format = (v) => v }) {
  const progress = max === min ? 0 : ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between text-[12.2px] font-semibold text-ink-soft">
        <span>{label}</span>
        <span className="font-mono text-heading">{format(value)}</span>
      </div>
      <input type="range" className="range" min={min} max={max} step={step} value={value} aria-label={label}
        style={{ '--p': `${progress}%` }} onChange={(e) => onChange(Number(e.target.value))} />
      <div className="flex justify-between text-[10.5px] text-faint"><span>{format(min)}</span><span>{format(max)}</span></div>
    </div>
  );
}