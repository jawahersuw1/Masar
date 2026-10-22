import { useCallback, useEffect, useRef, useState } from 'react';

// Runs an async function and tracks loading / success / error. Ignores results from outdated calls.
export default function useAsync(fn, deps = [], { immediate = true } = {}) {
  const [state, setState] = useState({ status: immediate ? 'loading' : 'idle', data: null, error: null });
  const seq = useRef(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(async (...args) => {
    const id = ++seq.current;
    setState((s) => ({ ...s, status: 'loading', error: null }));
    try {
      const data = await fnRef.current(...args);
      if (id === seq.current) setState({ status: 'success', data, error: null });
      return data;
    } catch (error) {
      if (id === seq.current) setState({ status: 'error', data: null, error });
      throw error;
    }
  }, []);

  useEffect(() => {
    if (immediate) run().catch(() => {});
    return () => { seq.current += 1; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, loading: state.status === 'loading', run };
}