// repo.js - ALL database reads and writes live here. Every query uses ? placeholders (no SQL injection).
import { pool } from "./db.js";
import { bankFromRow } from "./engine/bank.js";
import { ANSWER_FIELDS } from "./engine/completeness.js";

const toNumberOrNull = (v) => (v === null || v === undefined ? null : Number(v));
const inputsFromRow = (row) => {
  if (!row) return null;
  const out = {};
  for (const f of ANSWER_FIELDS) out[f] = toNumberOrNull(row[f]);
  return out;
};

async function ping() { await pool.query("SELECT 1"); return true; }

async function getSectors() {
  const [rows] = await pool.query("SELECT sector_id, name FROM sectors ORDER BY sector_id");
  return rows;
}

async function getBanks() {
  const [banks] = await pool.query(
    "SELECT b.*, p.name AS profile_name FROM banks b JOIN bank_profiles p ON p.profile_id = b.profile_id ORDER BY b.bank_id");
  const [caution] = await pool.query("SELECT bank_id, sector_id FROM bank_caution_sectors");
  return banks.map((b) => ({
    ...bankFromRow(b, caution.filter((c) => c.bank_id === b.bank_id)),
    profileName: b.profile_name
  }));
}

async function getBank(bankId) {
  return (await getBanks()).find((b) => b.bankId === bankId) ?? null;
}

async function getCases() {
  const [rows] = await pool.query("SELECT * FROM historical_cases ORDER BY case_id");
  return rows;
}

async function listUsers() {
  const [rows] = await pool.query("SELECT id, name, role, bank_id FROM users ORDER BY id");
  return rows.map((u) => ({ id: u.id, name: u.name, role: u.role, bankId: u.bank_id }));
}

async function getUser(id) {
  const [rows] = await pool.query("SELECT id, name, role, bank_id FROM users WHERE id = ?", [id]);
  const u = rows[0];
  return u ? { id: u.id, name: u.name, role: u.role, bankId: u.bank_id } : null;
}

async function createApplication({ clientUserId, bankId, inputs, completeness, results }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      "INSERT INTO applications (client_user_id, bank_id, completeness_pct, results_json) VALUES (?, ?, ?, ?)",
      [clientUserId, bankId, completeness, JSON.stringify(results)]);
    const id = r.insertId;
    const columns = ANSWER_FIELDS.join(", ");          // trusted constant list, not user input
    const marks = ANSWER_FIELDS.map(() => "?").join(", ");
    await conn.query(
      `INSERT INTO application_inputs (application_id, ${columns}) VALUES (?, ${marks})`,
      [id, ...ANSWER_FIELDS.map((f) => inputs[f])]);
    await conn.commit();
    return id;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

function applicationFromRow(a, inputsRow) {
  return {
    id: a.id, clientUserId: a.client_user_id, bankId: a.bank_id, status: a.status,
    completenessPct: a.completeness_pct, createdAt: a.created_at, updatedAt: a.updated_at,
    results: a.results_json ? JSON.parse(a.results_json) : null,
    inputs: inputsFromRow(inputsRow)
  };
}

async function getApplication(id) {
  const [apps] = await pool.query("SELECT * FROM applications WHERE id = ?", [id]);
  if (!apps[0]) return null;
  const [inputs] = await pool.query("SELECT * FROM application_inputs WHERE application_id = ?", [id]);
  return applicationFromRow(apps[0], inputs[0]);
}

async function listApplicationsForBank(bankId) {
  const [rows] = await pool.query(
    `SELECT a.id, a.client_user_id, u.name AS client_name, a.status, a.completeness_pct, a.created_at
     FROM applications a JOIN users u ON u.id = a.client_user_id
     WHERE a.bank_id = ? ORDER BY a.created_at DESC, a.id DESC`, [bankId]);
  return rows.map((r) => ({ id: r.id, clientName: r.client_name, status: r.status,
    completenessPct: r.completeness_pct, createdAt: r.created_at }));
}

async function listApplicationsForClient(userId) {
  const [rows] = await pool.query(
    `SELECT id, bank_id, status, completeness_pct, created_at
     FROM applications WHERE client_user_id = ? ORDER BY created_at DESC, id DESC`, [userId]);
  return rows.map((r) => ({ id: r.id, bankId: r.bank_id, status: r.status,
    completenessPct: r.completeness_pct, createdAt: r.created_at }));
}

const FINAL = ["accepted", "modified", "declined"];

// Saves the audit row AND moves the status in ONE transaction. Locks the row so two reviewers cannot both decide.
async function addReviewerAction({ applicationId, bankId, reviewerId, action, comment, newStatus }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query("SELECT status FROM applications WHERE id = ? FOR UPDATE", [applicationId]);
    if (!rows[0]) { await conn.rollback(); return { notFound: true }; }
    if (FINAL.includes(rows[0].status)) { await conn.rollback(); return { conflict: true, status: rows[0].status }; }
    await conn.query(
      "INSERT INTO reviewer_actions (application_id, bank_id, reviewer_id, action, comment) VALUES (?, ?, ?, ?, ?)",
      [applicationId, bankId, reviewerId, action, comment || null]);
    await conn.query("UPDATE applications SET status = ? WHERE id = ?", [newStatus, applicationId]);
    await conn.commit();
    return { ok: true, status: newStatus };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

async function listActions(applicationId) {
  const [rows] = await pool.query(
    `SELECT a.id, a.action, a.comment, a.created_at, a.reviewer_id, u.name AS reviewer_name
     FROM reviewer_actions a JOIN users u ON u.id = a.reviewer_id
     WHERE a.application_id = ? ORDER BY a.id`, [applicationId]);
  return rows.map((r) => ({ id: r.id, action: r.action, comment: r.comment, createdAt: r.created_at,
    reviewerId: r.reviewer_id, reviewerName: r.reviewer_name }));
}

async function getNarrative(applicationId, audience) {
  const [rows] = await pool.query(
    "SELECT text, model FROM application_narratives WHERE application_id = ? AND audience = ?",
    [applicationId, audience]);
  return rows[0] ? { text: rows[0].text, model: rows[0].model } : null;
}

async function saveNarrative({ applicationId, audience, text, model }) {
  await pool.query(
    `INSERT INTO application_narratives (application_id, audience, model, text) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE model = VALUES(model), text = VALUES(text)`,
    [applicationId, audience, model ?? null, text]);
}

export const repo = {
  ping, getSectors, getBanks, getBank, getCases, listUsers, getUser,
  createApplication, getApplication, listApplicationsForBank, listApplicationsForClient,
  addReviewerAction, listActions, getNarrative, saveNarrative
};
