import { useEffect, useRef, useState } from 'react';
import useReducedMotion from '../../hooks/useReducedMotion.js';

// Reveals text word by word. The full text is always laid out (the unseen part is transparent),
// so the page never jumps while it types. state: 'waiting' | 'typing' | 'done'
export default function StreamText({ text, state, onDone, wordsPerSecond = 55, className = '' }) {
  const tokens = useRef(text.split(/(\s+)/)).current; // words and the spaces between them
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(state === 'done' ? tokens.length : 0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (state === 'done' || (state === 'typing' && reduced)) { setShown(tokens.length); if (state === 'typing') doneRef.current?.(); return undefined; }
    if (state === 'waiting') { setShown(0); return undefined; }
    const perTick = Math.max(2, Math.round((wordsPerSecond * 2) / 20)); // tokens per 50 ms
    let n = 0;
    const id = setInterval(() => {
      n = Math.min(tokens.length, n + perTick);
      setShown(n);
      if (n >= tokens.length) { clearInterval(id); doneRef.current?.(); }
    }, 50);
    return () => clearInterval(id);
  }, [state, reduced, tokens.length, wordsPerSecond]);

  const visible = tokens.slice(0, shown).join('');
  const rest = tokens.slice(shown).join('');
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {visible}
        {state === 'typing' && shown < tokens.length && <span className="caret" />}
        <span className="opacity-0">{rest}</span>
      </span>
    </span>
  );
}