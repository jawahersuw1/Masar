import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FastForward, Sparkles } from 'lucide-react';
import { api } from '../../lib/api.js';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import { Notice, Skeleton } from '../ui/Feedback.jsx';
import Pill from '../ui/Pill.jsx';
import { parseExplanation, SWOT_TITLES } from './parseExplanation.js';
import StreamText from './StreamText.jsx';

const WAITING = ['Reading your scores', 'Checking strengths and concerns', 'Writing the summary', 'Preparing next steps'];
const QUAD = {
  strengths: 'bg-good-soft text-good', weaknesses: 'bg-warn-soft text-warn',
  opportunities: 'bg-info-soft text-info', threats: 'bg-bad-soft text-bad',
};

function Reveal({ show, className = '', children }) {
  return <div className={`transition duration-500 ${show ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'} ${className}`}>{children}</div>;
}

function Item({ item, cursor, setCursor, as: Tag = 'p', className = '' }) {
  const state = item.i < cursor ? 'done' : item.i === cursor ? 'typing' : 'waiting';
  return (
    <Tag className={className}>
      <StreamText text={item.text} state={state} onDone={() => setCursor((c) => Math.max(c, item.i + 1))} />
    </Tag>
  );
}

const firstIndex = (items) => (items.length ? items[0].i : Infinity);

function Section({ section, cursor, setCursor }) {
  const common = { cursor, setCursor };
  if (section.kind === 'swot') {
    return (
      <div>
        <h3 className="mb-3 font-display text-[14px] font-extrabold">{section.title}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(section.swot).map(([key, items]) => (
            <Reveal key={key} show={cursor >= firstIndex(items)} className={`rounded-2xl p-4 ${QUAD[key]}`}>
              <h4 className="mb-2 text-[12px] font-bold !text-current">{SWOT_TITLES[key]}</h4>
              <ul className="flex flex-col gap-1.5 pl-4 text-[12.8px] leading-relaxed text-ink [&>li]:list-disc">
                {items.map((it) => <Item key={it.i} item={it} as="li" {...common} />)}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    );
  }
  const items = [...section.paragraphs, ...section.bullets];
  const body = (
    <>
      {section.paragraphs.map((p) => <Item key={p.i} item={p} className="text-[14px] leading-[1.7] text-ink" {...common} />)}
      {section.bullets.length > 0 && (
        <ul className="flex flex-col gap-2">
          {section.bullets.map((b) => (
            <li key={b.i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink">
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              <Item item={b} as="span" {...common} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
  return (
    <Reveal show={cursor >= firstIndex(items)}>
      {section.kind === 'summary' ? (
        <div className="rounded-r-2xl border-l-4 border-accent bg-surface-2 p-5"><h3 className="mb-2 font-display text-[14px] font-extrabold">{section.title}</h3><div className="flex flex-col gap-2.5">{body}</div></div>
      ) : (
        <div><h3 className="mb-2.5 font-display text-[14px] font-extrabold">{section.title}</h3><div className="flex flex-col gap-2.5">{body}</div></div>
      )}
    </Reveal>
  );
}

function Thinking() {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((n) => (n + 1) % WAITING.length), 1800); return () => clearInterval(id); }, []);
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-steel"><Sparkles className="h-4 w-4 animate-pulse" aria-hidden="true" />{WAITING[i]}…</p>
      <Skeleton className="h-20 w-full" />
      <div className="grid gap-3 sm:grid-cols-2"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
      <Skeleton className="h-4 w-3/5" />
    </div>
  );
}

// Fetches the AI-written explanation for a saved application and reveals it section by section.
export default function AiExplanation({ applicationId, autoStart = false }) {
  const [phase, setPhase] = useState(autoStart ? 'loading' : 'idle'); // idle | loading | ready | error
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [cursor, setCursor] = useState(0);
  const started = useRef(false);

  const load = useCallback(async () => {
    setPhase('loading'); setError(null);
    try { const res = await api.explanation(applicationId); setData(res); setCursor(0); setPhase('ready'); }
    catch (e) { setError(e); setPhase('error'); }
  }, [applicationId]);

  useEffect(() => { if (autoStart && !started.current) { started.current = true; load(); } }, [autoStart, load]);

  const parsed = useMemo(() => (data ? parseExplanation(data.text) : null), [data]);
  const finished = parsed && cursor >= parsed.total;

  return (
    <Card className="flex flex-col gap-5" aria-label="AI explanation">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-white"><Sparkles className="h-5 w-5" aria-hidden="true" /></span>
          <div>
            <h2 className="font-display text-lg font-extrabold">Written explanation</h2>
            <p className="text-[12.5px] text-muted">Every number comes from Masar’s rules. The AI only writes the words.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data?.model && <Pill tone="neutral" dot={false} className="font-mono">{data.model}</Pill>}
          {phase === 'ready' && !finished && <Button variant="ghost" size="sm" onClick={() => setCursor(parsed.total)}><FastForward className="h-3.5 w-3.5" aria-hidden="true" />Skip animation</Button>}
        </div>
      </div>

      {phase === 'idle' && (
        <div className="flex flex-col items-start gap-3 rounded-xl bg-surface-2 p-5">
          <p className="max-w-[56ch] text-[13.5px] text-ink-soft">Get a plain-language summary, a SWOT view and suggested next steps based on the results above.</p>
          <Button onClick={load}><Sparkles className="h-4 w-4" aria-hidden="true" />Explain this result</Button>
        </div>
      )}
      {phase === 'loading' && <Thinking />}
      {phase === 'error' && (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-xl bg-bad-soft p-5">
          <p className="text-[13.5px] text-ink">{error?.status === 503 ? 'The AI explanation is not available right now. Your scores and numbers are not affected.' : error?.message}</p>
          <Button variant="outline" size="sm" onClick={load}>Try again</Button>
        </div>
      )}
      {phase === 'ready' && parsed && (
        <div className="flex flex-col gap-6">
          {parsed.total === 0 ? <p className="whitespace-pre-line text-[14px] leading-[1.7]">{data.text}</p>
            : parsed.sections.map((s) => <Section key={s.title + s.paragraphs.length + s.bullets.length} section={s} cursor={cursor} setCursor={setCursor} />)}
          <Reveal show={finished || parsed.total === 0}>{data.disclaimer && <Notice variant="strong">{data.disclaimer}</Notice>}</Reveal>
        </div>
      )}
    </Card>
  );
}