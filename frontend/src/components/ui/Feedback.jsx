import { AlertCircle, Inbox } from 'lucide-react';
import Button from './Button.jsx';
import Card from './Card.jsx';

export function Notice({ variant = 'note', className = '', children }) {
  const border = variant === 'strong' ? 'border-l-accent' : 'border-l-steel';
  return <div className={`rounded-r-[10px] border-l-[3px] bg-surface-2 px-3.5 py-3 text-[12px] leading-relaxed text-ink-soft ${border} ${className}`}>{children}</div>;
}

export const Skeleton = ({ className = 'h-4 w-full' }) => <div className={`skeleton ${className}`} aria-hidden="true" />;

export function LoadingBlock({ label = 'Loading', rows = 3 }) {
  return (
    <Card role="status" aria-live="polite" aria-label={label}>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-1/3" />
        {Array.from({ length: rows }, (_, i) => <Skeleton key={i} className={`h-4 ${i % 2 ? 'w-4/5' : 'w-full'}`} />)}
      </div>
    </Card>
  );
}

export function ErrorBlock({ error, title = 'This did not load', onRetry }) {
  const details = Array.isArray(error?.details) ? error.details : [];
  return (
    <Card tone="bad" role="alert">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-bad" aria-hidden="true" />
        <div className="flex-1">
          <h3 className="font-display text-[15px] font-extrabold">{title}</h3>
          <p className="mt-1 text-[13px] text-ink-soft">{error?.message ?? 'Unknown error.'}</p>
          {details.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-[12.5px] text-ink-soft">
              {details.map((d, i) => <li key={i}>{typeof d === 'string' ? d : JSON.stringify(d)}</li>)}
            </ul>
          )}
          {onRetry && <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>Try again</Button>}
        </div>
      </div>
    </Card>
  );
}

export function EmptyBlock({ title, description, action }) {
  return (
    <Card className="flex flex-col items-center gap-3 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-steel"><Inbox className="h-6 w-6" aria-hidden="true" /></span>
      <h3 className="font-display text-base font-extrabold">{title}</h3>
      {description && <p className="max-w-[46ch] text-[13px] text-muted">{description}</p>}
      {action}
    </Card>
  );
}