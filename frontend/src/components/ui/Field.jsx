const BASE = 'w-full rounded-[9px] border border-line bg-surface px-[11px] py-2.5 text-[13.5px] text-ink outline-none transition focus:border-steel';

export function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-[12.2px] font-semibold text-ink-soft">
      {label}
      {children}
      {hint && <span className="text-[10.5px] font-medium text-faint">{hint}</span>}
    </label>
  );
}

export function TextInput({ className = '', ...props }) {
  return <input className={`${BASE} ${className}`} {...props} />;
}

export function NumberInput({ unit, className = '', ...props }) {
  return (
    <div className="relative">
      <input type="number" inputMode="decimal" className={`${BASE} font-mono ${unit ? 'pr-16' : ''} ${className}`} {...props} />
      {unit && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-faint">{unit}</span>}
    </div>
  );
}

export function SelectInput({ options, placeholder = 'Choose…', ...props }) {
  return (
    <select className={BASE} {...props}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function TextArea(props) {
  return <textarea className={`${BASE} min-h-[96px] resize-y`} {...props} />;
}