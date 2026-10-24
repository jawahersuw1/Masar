import { useEffect, useRef, useState } from 'react';
import useReducedMotion from './useReducedMotion.js';

// Animates a number from its previous value to `target`.
export default function useCountUp(target, duration = 900) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  const from = useRef(reduced ? target : 0);

  useEffect(() => {
    if (reduced) { setValue(target); from.current = target; return undefined; }
    const start = performance.now();
    const a = from.current;
    let raf;
    const tick = (now) => {
      const p = Math.max(0, Math.min(1, (now - start) / duration));
      const eased = 1 - (1 - p) ** 3;
      const v = a + (target - a) * eased;
      from.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduced]);

  return value;
}