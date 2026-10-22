import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-accent text-on-accent shadow-[0_6px_16px_-6px_rgba(232,140,45,.6)] hover:shadow-[0_8px_20px_-6px_rgba(232,140,45,.75)]',
  navy: 'bg-navy text-white hover:brightness-110',
  outline: 'border border-line text-heading hover:bg-surface-2',
  ghost: 'bg-surface-2 text-ink-soft hover:brightness-95',
  danger: 'bg-bad text-white hover:brightness-110',
  onDark: 'bg-white/10 text-white hover:bg-white/20',
};
const SIZES = { md: 'rounded-[10px] px-[18px] py-[11px] text-[13px]', sm: 'rounded-lg px-3 py-[7px] text-xs' };

export default function Button({ as: Tag = 'button', variant = 'primary', size = 'md', loading = false, disabled, className = '', children, ...rest }) {
  const isButton = Tag === 'button';
  return (
    <Tag
      {...(isButton ? { type: 'button', disabled: disabled || loading } : {})}
      className={`inline-flex items-center justify-center gap-2 font-display font-bold transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </Tag>
  );
}