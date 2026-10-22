// rules.js - the visible rule engine. Rules are DATA (config/rules.json), not hidden code.
// Each rule says: IF metric <op> limit THEN flag.  The limit is either fixed or read from the bank's settings.
// If the number needed for a rule is missing, the rule is listed as "not checked" (never silently passed).

const isMissing = (x) => x === null || x === undefined || Number.isNaN(x);
const SEVERITY_ORDER = { mandatory_review: 0, high: 1, medium: 2, low: 3 };

function fmt(value, format) {
  if (Array.isArray(value)) return value.join(", ");
  if (format === "pct") return `${Math.round(value * 100)}%`;
  if (format === "points") return `${Math.round(value)}%`;
  if (format === "money") return Number(value).toLocaleString("en-US");
  if (format === "num") return String(Math.round(value * 100) / 100);
  return String(value);
}

function test(value, op, limit) {
  switch (op) {
    case "<":
      return value < limit;
    case "<=":
      return value <= limit;
    case ">":
      return value > limit;
    case ">=":
      return value >= limit;
    case "==":
      return value === limit;
    case "inList":
      return Array.isArray(limit) && limit.includes(value);
    default:
      throw new Error(`Unknown operator: ${op}`);
  }
}

// context = the metrics values + completeness + mandatoryReview
export function buildContext(metricValues, completeness, confidence) {
  return {
    ...metricValues,
    completeness,
    mandatoryReview: confidence.mandatoryReview,
  };
}

export function evaluateRules(context, bank, rules) {
  const fired = [];
  const notChecked = [];
  let checked = 0;

  for (const rule of rules) {
    const value = context[rule.metric];
    const limit = rule.limitFromBank ? bank[rule.limitFromBank] : rule.limit;

    if (isMissing(value) || isMissing(limit)) {
      notChecked.push({
        id: rule.id,
        name: rule.name,
        reason: "A number needed for this rule is missing",
      });
      continue;
    }
    checked++;
    if (!test(value, rule.op, limit)) continue;

    const limitText = rule.limitFromBank
      ? `${rule.limitFromBank} (${fmt(limit, rule.format)})`
      : fmt(limit, rule.format);

    fired.push({
      id: rule.id,
      name: rule.name,
      severity: rule.severity,
      readable: `IF ${rule.metric} ${rule.op} ${limitText} THEN flag "${rule.name}"`,
      message: rule.message
        .replace("{value}", fmt(value, rule.format))
        .replace("{limit}", fmt(limit, rule.format))
        .replace("{bank}", bank.name),
    });
  }

  fired.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  return { fired, notChecked, checked };
}
