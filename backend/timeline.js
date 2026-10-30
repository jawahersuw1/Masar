// timeline.js - turns the applicant's versions and the bank's decisions into ONE list of events (the history).
import { ANSWER_FIELDS } from "./engine/completeness.js";

const empty = (x) => x === null || x === undefined;
const same = (a, b) => (empty(a) || empty(b) ? empty(a) && empty(b) : Number(a) === Number(b));

// Which answers changed between two versions
export function diffInputs(before, after) {
  return ANSWER_FIELDS
    .filter((f) => !same(before?.[f], after?.[f]))
    .map((field) => ({ field, from: before?.[field] ?? null, to: after?.[field] ?? null }));
}

// audience "client": the bank is shown by its name.  audience "bank": the reviewer is shown by name.
export function buildTimeline({ revisions, actions, audience, bankName }) {
  const events = [];
  revisions.forEach((r, i) => events.push({
    type: "submitted", revision: r.revision, at: r.createdAt, completeness: r.completenessPct,
    changes: i === 0 ? [] : diffInputs(revisions[i - 1].inputs, r.inputs), _order: 0, _id: r.revision
  }));
  actions.forEach((a) => events.push({
    type: "decision", action: a.action, comment: a.comment, revision: a.revision, at: a.createdAt,
    by: audience === "bank" ? a.reviewerName : bankName, _order: 1, _id: a.id
  }));
  events.sort((x, y) => x.revision - y.revision || x._order - y._order || x._id - y._id);
  return events.map(({ _order, _id, ...event }) => event);
}
