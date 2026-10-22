import { Link } from 'react-router-dom';
import { Activity, Calculator, Send } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Gauge from '../../components/ui/Gauge.jsx';
import { Notice } from '../../components/ui/Feedback.jsx';
import { useAssessment } from '../../context/AssessmentContext.jsx';

const BENEFITS = [
  { icon: Calculator, title: 'Know your numbers', text: 'Profit, installment, cash buffer and break-even, worked out from your answers with the calculation shown.' },
  { icon: Activity, title: 'Test the plan', text: 'Move sales, costs and the interest rate, or run preset bad months, and see how much room you have.' },
  { icon: Send, title: 'Send it with confidence', text: 'Pick a bank, submit, and read a plain-language explanation. A reviewer makes the final decision.' },
];

export default function Landing() {
  const { answered, total, analysis } = useAssessment();
  return (
    <div className="flex flex-col gap-5">
      <section className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(160deg,var(--navy)_0%,#08283f_100%)] p-7 text-white sm:p-12">
        <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <div>
            <p className="font-display text-sm font-bold text-accent">Don’t finance the idea. Understand it first.</p>
            <h2 className="mt-3 text-4xl font-extrabold leading-[1.08] tracking-tight !text-white sm:text-5xl">Know where your plan stands before you ask a bank.</h2>
            <p className="mt-4 max-w-[52ch] text-[14.5px] text-on-navy-soft">Answer {total} questions about your business and the loan you want. Masar works out your repayment strength, tests it against bad months, and shows what to change.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button as={Link} to="/assessment" className="px-6 py-3.5 text-sm">{answered > 0 ? 'Continue the questionnaire' : 'Start the questionnaire'}</Button>
              {analysis && <Button as={Link} to="/analysis" variant="onDark" className="px-6 py-3.5 text-sm">See my analysis</Button>}
            </div>
          </div>
          <div className="rounded-2xl bg-white/[0.07] p-6 backdrop-blur-sm">
            <div className="flex items-center gap-5">
              <Gauge value={72} tone="good" size={116} stroke={11} onDark label="Example readiness" caption="example" />
              <dl className="flex flex-col gap-2.5 text-[12.5px]">
                <div><dt className="text-on-navy-soft">Debt service coverage</dt><dd className="font-mono text-base font-semibold text-white">1.78×</dd></div>
                <div><dt className="text-on-navy-soft">Cash buffer</dt><dd className="font-mono text-base font-semibold text-white">4.1 months</dd></div>
              </dl>
            </div>
            <p className="mt-4 text-[11.5px] text-on-navy-soft">An example result. Yours is calculated from your own answers.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <Card key={title}>
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-steel"><Icon className="h-5 w-5" aria-hidden="true" /></span>
            <h3 className="font-display text-[15px] font-extrabold">{title}</h3>
            <p className="mt-1.5 text-[13px] text-muted">{text}</p>
          </Card>
        ))}
      </div>
      <Notice>Masar gives guidance only. It is not a credit score and not a financing decision. The bank’s reviewer decides.</Notice>
    </div>
  );
}
