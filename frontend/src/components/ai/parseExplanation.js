// Turns the AI's markdown-ish text into sections the UI can lay out and reveal one item at a time.
// The AI is asked for: a Summary, a SWOT, and next steps, but the parser tolerates other shapes.
const SWOT_KEYS = ['strengths', 'weaknesses', 'opportunities', 'threats'];
export const SWOT_TITLES = { strengths: 'Strengths', weaknesses: 'Weaknesses', opportunities: 'Opportunities', threats: 'Threats' };

const clean = (s) => s.replace(/\*\*|__|`/g, '').replace(/^\*(?=\S)|(?<=\S)\*$/g, '').trim();
const isBullet = (l) => /^([-*•]|\d+[.)])\s+/.test(l);
const stripBullet = (l) => l.replace(/^([-*•]|\d+[.)])\s+/, '');

function asHeading(line) {
  if (/^#{1,6}\s+/.test(line)) return clean(line.replace(/^#{1,6}\s+/, '')).replace(/[:：]$/, '');
  const bold = line.match(/^\*\*(.+?)\*\*:?$/);
  if (bold) return clean(bold[1]).replace(/[:：]$/, '');
  const plain = clean(line).replace(/^\d+[.)]\s*/, '').replace(/[:：]$/, '');
  if (/^(summary|swot.*|strengths|weaknesses|opportunities|threats|what to .+|next steps|key .+|things to .+)$/i.test(plain) && plain.length < 48) return plain;
  return null;
}

export function parseExplanation(text) {
  const lines = String(text ?? '').replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean);
  const sections = [];
  let cur = null;
  let sub = null;
  const start = (title) => { cur = { title, paragraphs: [], bullets: [], swot: {} }; sections.push(cur); sub = null; };

  for (const line of lines) {
    const heading = asHeading(line);
    if (heading) {
      const key = heading.toLowerCase();
      if (SWOT_KEYS.includes(key)) { if (!cur) start('SWOT'); sub = key; cur.swot[key] ??= []; } else start(heading);
      continue;
    }
    if (!cur) start('Summary');
    const body = clean(isBullet(line) ? stripBullet(line) : line);
    if (!body) continue;
    if (sub) cur.swot[sub].push(body);
    else if (isBullet(line)) cur.bullets.push(body);
    else cur.paragraphs.push(body);
  }

  // Number every revealable text so the UI can type them out in order.
  let i = 0;
  const num = (text) => ({ text, i: i++ });
  const out = sections.map((s) => {
    const hasSwot = Object.keys(s.swot).length > 0;
    return {
      title: s.title,
      kind: hasSwot ? 'swot' : /summary/i.test(s.title) ? 'summary' : 'list',
      paragraphs: s.paragraphs.map(num),
      bullets: s.bullets.map(num),
      swot: Object.fromEntries(SWOT_KEYS.filter((k) => s.swot[k]).map((k) => [k, s.swot[k].map(num)])),
    };
  });
  return { sections: out, total: i };
}