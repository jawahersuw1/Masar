import { DASH } from '../../lib/format.js';
import { formatAnswer, QUESTION_GROUPS } from '../../lib/inputs.js';
import Card, { CardHeader } from '../ui/Card.jsx';

export default function ApplicantAnswers({ inputs, sectors }) {
  return (
    <Card>
      <CardHeader title="Applicant’s answers" description="Exactly what the applicant submitted." />
      <div className="grid gap-6 md:grid-cols-3">
        {QUESTION_GROUPS.map((g) => (
          <div key={g.id}>
            <h3 className="mb-2 text-[13px] font-bold">{g.title}</h3>
            <dl className="flex flex-col">
              {g.fields.map((f) => (
                <div key={f.key} className="flex items-baseline justify-between gap-3 border-b border-line-soft py-2 text-[12.5px] last:border-0">
                  <dt className="text-muted">{f.label}</dt>
                  <dd className="text-right font-mono font-semibold">{formatAnswer(f.key, inputs?.[f.key], sectors) ?? <span className="font-sans font-normal text-faint">Not answered {DASH}</span>}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </Card>
  );
}