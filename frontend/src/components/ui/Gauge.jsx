import { useEffect, useState } from 'react';
import useCountUp from '../../hooks/useCountUp.js';
import { clamp, isNil } from '../../lib/format.js';
import { TONE_ON_DARK, TONE_VAR } from '../../lib/tones.js';

// Circular 0–100 gauge. The arc sweeps in and the number counts up when it first appears.
export default function Gauge({ value, tone = 'info', size = 118, stroke = 12, caption, label, onDark = false }) {
  const target = isNil(value) ? 0 : clamp(value, 0, 100);
  const shown = useCountUp(target);
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const r = (size - stroke) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = (circ * (armed ? target : 0)) / 100;
  const color = onDark ? TONE_ON_DARK[tone] : TONE_VAR[tone];

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}
      role="img" aria-label={`${label ?? 'Score'}: ${isNil(value) ? 'not enough data' : `${Math.round(value)} out of 100`}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={c} cy={c} r={r} fill="none" stroke={onDark ? 'rgba(255,255,255,.14)' : 'var(--surface-2)'} strokeWidth={stroke} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`} style={{ transition: 'stroke-dasharray 1000ms cubic-bezier(.2,.7,.2,1)' }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`font-mono font-semibold leading-none ${onDark ? 'text-white' : 'text-heading'}`} style={{ fontSize: size * 0.22 }}>
          {isNil(value) ? '—' : Math.round(shown)}
        </span>
        {caption && <span className={`mt-1 text-[10px] ${onDark ? 'text-on-navy-soft' : 'text-muted'}`}>{caption}</span>}
      </div>
    </div>
  );
}