import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { ANSWER_KEYS, countAnswered, emptyAnswers, toApiInputs } from '../lib/inputs.js';

const AssessmentContext = createContext(null);

function load(key) {
  try { return { ...emptyAnswers(), ...JSON.parse(localStorage.getItem(key)) }; } catch { return emptyAnswers(); }
}

// Holds the client's questionnaire answers and the latest analysis returned by the backend.
export function AssessmentProvider({ userId, children }) {
  const storageKey = `masar.answers.${userId ?? 'anon'}`;
  const [answers, setAnswers] = useState(() => load(storageKey));
  const [analysis, setAnalysis] = useState(null);
  const [analyzedKey, setAnalyzedKey] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [error, setError] = useState(null);

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(answers)); }, [answers, storageKey]);

  const answersKey = useMemo(() => JSON.stringify(answers), [answers]);
  const answered = useMemo(() => countAnswered(answers), [answers]);
  const stale = analysis !== null && analyzedKey !== answersKey;

  const setAnswer = useCallback((key, value) => setAnswers((a) => ({ ...a, [key]: value })), []);
  const replaceAnswers = useCallback((next) => setAnswers({ ...emptyAnswers(), ...next }), []);
  const reset = useCallback(() => { setAnswers(emptyAnswers()); setAnalysis(null); setAnalyzedKey(null); setStatus('idle'); setError(null); }, []);

  const runAnalysis = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const { view } = await api.analyze(toApiInputs(answers));
      setAnalysis(view);
      setAnalyzedKey(answersKey);
      setStatus('ready');
      return view;
    } catch (e) {
      setError(e);
      setStatus('error');
      throw e;
    }
  }, [answers, answersKey]);

  const value = useMemo(() => ({
    answers, answered, total: ANSWER_KEYS.length, answersKey, setAnswer, replaceAnswers, reset,
    analysis, stale, status, error, runAnalysis,
  }), [answers, answered, answersKey, setAnswer, replaceAnswers, reset, analysis, stale, status, error, runAnalysis]);

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

export const useAssessment = () => useContext(AssessmentContext);

// For pages that need results: runs the analysis once per set of answers if it is missing or out of date.
export function useEnsureAnalysis() {
  const a = useAssessment();
  const needs = a.answered > 0 && (!a.analysis || a.stale);
  const tried = useRef(null);
  useEffect(() => {
    if (needs && a.status !== 'loading' && tried.current !== a.answersKey) {
      tried.current = a.answersKey;
      a.runAnalysis().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needs, a.answersKey]);
  return a;
}