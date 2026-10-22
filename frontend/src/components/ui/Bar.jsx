import { useEffect, useState } from 'react';
import { clamp, isNil } from '../../lib/format.js';
import { TONE_VAR } from '../../lib/tones.js';

export default function Bar({ value, max = 100, tone = 'info', height = 'h-[9px]', className = '' }) {
  const target = isNil(value) ? 0 : clamp((value / max) * 100, 0, 100);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(target));
    return () => cancelAnimationFrame(id);
  }, [target]);
  return (
    <div className={`overflow-hidden rounded-full bg-surface-2 ${height} ${className}`} aria-hidden="true">
      <div className="h-full rounded-full" style={{ width: `${width}%`, background: TONE_VAR[tone], transition: 'width 700ms cubic-bezier(.2,.7,.2,1)' }} />
    </div>
  );
}