export default function Stat({ label, value, hint, valueClass = '' }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`font-mono text-[22px] font-semibold text-heading ${valueClass}`}>{value}</span>
      <span className="text-[11px] font-semibold text-muted">{label}</span>
      {hint && <span className="text-[11px] text-faint">{hint}</span>}
    </div>
  );
}