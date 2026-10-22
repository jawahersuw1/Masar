import { ANSWER_FIELDS } from "./engine/completeness.js";

const RULES = {
  owner_experience_yrs: { type: "int", min: 0, max: 60 },
  years_operating:      { type: "int", min: 0, max: 100 },
  employees:            { type: "int", min: 0, max: 10000 },
  monthly_revenue:      { type: "number", min: 0, max: 1e9, digits: 2 },
  monthly_costs:        { type: "number", min: 0, max: 1e9, digits: 2 },
  cash_on_hand:         { type: "number", min: 0, max: 1e9, digits: 2 },
  expected_growth:      { type: "number", min: -0.99, max: 1, digits: 2 },
  loan_amount:          { type: "number", min: 1, max: 1e9, digits: 2 },
  term_years:           { type: "int", min: 1, max: 30 },
  annual_interest_rate: { type: "number", min: 0, max: 0.5, digits: 3 },
  owner_contribution:   { type: "number", min: 0, max: 1e9, digits: 2 }
};

const isEmpty = (v) => v === null || v === undefined || v === "";

function checkNumber(name, raw, rule, errors) {
  const n = typeof raw === "string" ? Number(raw.trim()) : raw;
  if (typeof n !== "number" || !Number.isFinite(n)) { errors.push(`${name} must be a number`); return null; }
  if (rule.type === "int" && !Number.isInteger(n)) { errors.push(`${name} must be a whole number`); return null; }
  if (n < rule.min || n > rule.max) { errors.push(`${name} must be between ${rule.min} and ${rule.max}`); return null; }
  return rule.digits === undefined ? n : Number(n.toFixed(rule.digits));
}

export function validateInputs(raw, sectorIds) {
  const errors = [];
  const inputs = {};
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, errors: ["inputs must be an object"], inputs: null };
  }
  for (const key of Object.keys(raw)) {
    if (!ANSWER_FIELDS.includes(key)) errors.push(`Unknown field: ${key}`);
  }
  for (const field of ANSWER_FIELDS) {
    const value = raw[field];
    if (isEmpty(value)) { inputs[field] = null; continue; }
    if (field === "sector_id") {
      const id = Number(value);
      if (!Number.isInteger(id) || !sectorIds.includes(id)) { errors.push("sector_id is not a valid sector"); inputs[field] = null; }
      else inputs[field] = id;
      continue;
    }
    inputs[field] = checkNumber(field, value, RULES[field], errors);
  }
  return { ok: errors.length === 0, errors, inputs };
}

const CHANGE_RULES = {
  revenueChange:      { type: "number", min: -0.9, max: 2, allowText: "expectedGrowth" },
  costChange:         { type: "number", min: -0.5, max: 2 },
  rateChange:         { type: "number", min: -0.1, max: 0.2 },
  delayMonths:        { type: "int", min: 0, max: 36 },
  loan_amount:        { type: "number", min: 1, max: 1e9 },
  owner_contribution: { type: "number", min: 0, max: 1e9 },
  cash_on_hand:       { type: "number", min: 0, max: 1e9 },
  term_years:         { type: "int", min: 1, max: 30 }
};

export function validateChanges(raw) {
  const errors = [];
  const changes = {};
  if (raw === undefined || raw === null) return { ok: true, errors, changes };
  if (typeof raw !== "object" || Array.isArray(raw)) return { ok: false, errors: ["changes must be an object"], changes: null };
  for (const [key, value] of Object.entries(raw)) {
    const rule = CHANGE_RULES[key];
    if (!rule) { errors.push(`Unknown change: ${key}`); continue; }
    if (isEmpty(value)) continue;
    if (rule.allowText && value === rule.allowText) { changes[key] = value; continue; }
    const v = checkNumber(key, value, rule, errors);
    if (v !== null) changes[key] = v;
  }
  return { ok: errors.length === 0, errors, changes };
}