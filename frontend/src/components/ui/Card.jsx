const BORDERS = { default: 'border-line-soft', bad: 'border-bad', good: 'border-good', accent: 'border-accent' };

export default function Card({ as: Tag = 'section', tone = 'default', pad = 'p-5 sm:p-[22px]', className = '', children, ...rest }) {
  return (
    <Tag className={`rounded-card border bg-surface shadow-card ${BORDERS[tone]} ${pad} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, description, action, className = '' }) {
  return (
    <div className={`mb-4 flex flex-wrap items-start justify-between gap-3 ${className}`}>
      <div>
        <h2 className="font-display text-lg font-extrabold">{title}</h2>
        {description && <p className="mt-0.5 max-w-[64ch] text-[12.8px] text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}