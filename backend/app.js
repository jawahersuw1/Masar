// app.js - the API routes. createApp receives the repository, so tests can use a fake in-memory one.
import express from "express";
import cors from "cors";
import { validateInputs, validateChanges } from "./validation.js";
import { analyzeApplication, toClientView, toBankView, CLIENT_NOTE, BANK_NOTE } from "./engine/analyze.js";
import { runScenario } from "./engine/scenario.js";
import { calcCompleteness } from "./engine/completeness.js";

// A reviewer action and the status it leads to. Only these four can end a case, and only a human can call them.
const ACTION_STATUS = { accept: "accepted", modify: "modified", decline: "declined", request_info: "more_info_requested" };

export function createApp({ repo, configs, explain, corsOrigin = true }) {
  const app = express();
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: "100kb" }));

  // ---- DEMO LOGIN: the browser sends x-user-id. This is NOT real security (see the report: future work). ----
  const auth = async (req, res, next) => {
    const id = Number(req.header("x-user-id"));
    if (!Number.isInteger(id) || id <= 0) return res.status(401).json({ error: "Login required (send the x-user-id header)" });
    const user = await repo.getUser(id);
    if (!user) return res.status(401).json({ error: "Unknown user" });
    req.user = user;
    next();
  };
  const only = (role) => (req, res, next) =>
    req.user.role === role ? next() : res.status(403).json({ error: `Only ${role} users can do this` });

  const sectorIds = async () => (await repo.getSectors()).map((s) => s.sector_id);
  const parseId = (v) => { const n = Number(v); return Number.isInteger(n) && n > 0 ? n : null; };

  // ---------- public ----------
  app.get("/api/health", async (req, res) => {
    let db = "ok";
    try { await repo.ping(); } catch { db = "down"; }
    res.json({ status: "ok", app: "Masar API", database: db });
  });

  app.get("/api/sectors", async (req, res) => {
    res.json((await repo.getSectors()).map((s) => ({ id: s.sector_id, name: s.name })));
  });

  // Only what a client needs to know. NO thresholds, weights or caution sectors.
  app.get("/api/banks", async (req, res) => {
    res.json((await repo.getBanks()).map((b) => ({
      bankId: b.bankId, name: b.name, profile: b.profileName,
      minLoan: b.minLoan, maxLoan: b.maxLoan, maxTermYears: b.maxTermYears, rateMin: b.rateMin, rateMax: b.rateMax
    })));
  });

  app.get("/api/users", async (req, res) => { res.json(await repo.listUsers()); });   // for the demo "Login as" list

  // ---------- client ----------
  app.post("/api/analyze", auth, only("client"), async (req, res) => {
    const v = validateInputs(req.body?.inputs, await sectorIds());
    if (!v.ok) return res.status(400).json({ error: "Invalid inputs", details: v.errors });
    const cases = await repo.getCases();
    const analysis = analyzeApplication({ inputs: v.inputs, bank: null, cases, configs });
    res.json({ view: toClientView(analysis) });
  });

  app.post("/api/simulate", auth, only("client"), async (req, res) => {
    const vi = validateInputs(req.body?.inputs, await sectorIds());
    const vc = validateChanges(req.body?.changes);
    if (!vi.ok || !vc.ok) return res.status(400).json({ error: "Invalid request", details: [...vi.errors, ...vc.errors] });
    const { inputs: _unused, ...result } = runScenario(vi.inputs, vc.changes, configs.scenarios);
    res.json({ result });
  });

  app.post("/api/applications", auth, only("client"), async (req, res) => {
    const bankId = req.body?.bankId;
    const bank = typeof bankId === "string" ? await repo.getBank(bankId) : null;
    if (!bank) return res.status(400).json({ error: "bankId is missing or unknown" });
    const v = validateInputs(req.body?.inputs, await sectorIds());
    if (!v.ok) return res.status(400).json({ error: "Invalid inputs", details: v.errors });
    const completeness = calcCompleteness(v.inputs);
    if (completeness.answered === 0) return res.status(400).json({ error: "Answer at least one question before submitting" });

    const cases = await repo.getCases();
    const analysis = analyzeApplication({ inputs: v.inputs, bank, cases, configs });
    const id = await repo.createApplication({
      clientUserId: req.user.id, bankId: bank.bankId, inputs: v.inputs, completeness: completeness.value, results: analysis });
    res.status(201).json({ applicationId: id, status: "submitted", view: toClientView(analysis) });
  });

  app.get("/api/applications/mine", auth, only("client"), async (req, res) => {
    res.json(await repo.listApplicationsForClient(req.user.id));
  });

  // ---------- reviewer ----------
  app.get("/api/bank/applications", auth, only("reviewer"), async (req, res) => {
    res.json(await repo.listApplicationsForBank(req.user.bankId));
  });

  app.post("/api/applications/:id/actions", auth, only("reviewer"), async (req, res) => {
    const id = parseId(req.params.id);
    const application = id ? await repo.getApplication(id) : null;
    if (!application) return res.status(404).json({ error: "Application not found" });
    if (application.bankId !== req.user.bankId) return res.status(403).json({ error: "This application belongs to another bank" });

    const action = req.body?.action;
    const comment = typeof req.body?.comment === "string" ? req.body.comment.trim() : "";
    if (!Object.hasOwn(ACTION_STATUS, action)) {
      return res.status(400).json({ error: `action must be one of: ${Object.keys(ACTION_STATUS).join(", ")}` });
    }
    if (comment.length > 2000) return res.status(400).json({ error: "comment is too long (max 2000 characters)" });

    const mandatory = application.results?.bank?.mandatoryReview === true;
    if (action !== "accept" && comment.length < 3) {
      return res.status(400).json({ error: "A comment is required for this action" });
    }
    if (action === "accept" && mandatory && comment.length < 10) {
      return res.status(400).json({ error: "This case needs mandatory review: write a comment (at least 10 characters) to accept it" });
    }

    const out = await repo.addReviewerAction({
      applicationId: id, bankId: application.bankId, reviewerId: req.user.id,
      action, comment, newStatus: ACTION_STATUS[action] });
    if (out.conflict) return res.status(409).json({ error: `This application is already ${out.status}` });
    res.json({ status: out.status });
  });

  app.get("/api/applications/:id/actions", auth, only("reviewer"), async (req, res) => {
    const id = parseId(req.params.id);
    const application = id ? await repo.getApplication(id) : null;
    if (!application) return res.status(404).json({ error: "Application not found" });
    if (application.bankId !== req.user.bankId) return res.status(403).json({ error: "This application belongs to another bank" });
    res.json(await repo.listActions(id));
  });

  // ---------- one application, two views ----------
  app.get("/api/applications/:id", auth, async (req, res) => {
    const id = parseId(req.params.id);
    const application = id ? await repo.getApplication(id) : null;
    if (!application) return res.status(404).json({ error: "Application not found" });

    const base = { id: application.id, bankId: application.bankId, status: application.status, createdAt: application.createdAt };

    if (req.user.role === "client") {
      if (application.clientUserId !== req.user.id) return res.status(403).json({ error: "Not your application" });
      return res.json({ ...base, view: toClientView(application.results) });      // no reviewer comments
    }
    if (application.bankId !== req.user.bankId) return res.status(403).json({ error: "This application belongs to another bank" });
    res.json({ ...base, clientName: application.clientName, inputs: application.inputs, view: toBankView(application.results),
      actions: await repo.listActions(id) });
  });

  // ---------- the AI layer: a written explanation of one application ----------
  app.get("/api/applications/:id/explanation", auth, async (req, res) => {
    const id = parseId(req.params.id);
    const application = id ? await repo.getApplication(id) : null;
    if (!application) return res.status(404).json({ error: "Application not found" });

    const audience = req.user.role === "client" ? "client" : "bank";
    const allowed = audience === "client" ? application.clientUserId === req.user.id : application.bankId === req.user.bankId;
    if (!allowed) return res.status(403).json({ error: "Not allowed" });

    let n = await repo.getNarrative(id, audience);             // already written before? reuse it
    if (!n) {
      const view = audience === "client" ? toClientView(application.results) : toBankView(application.results);
      const out = await explain(view, audience);
      if (!out) return res.status(503).json({ error: "The AI explanation is not available right now. Try again later." });
      n = { text: out.text, model: out.model };
      await repo.saveNarrative({ applicationId: id, audience, ...n });
    }
    res.json({
      text: n.text,
      model: n.model,
      disclaimer: audience === "client" ? CLIENT_NOTE : BANK_NOTE   // added by our code, never by the AI
    });
  });

  // ---------- the combined report (reviewer): client insights and bank decision support, clearly separated ----------
  app.get("/api/applications/:id/report", auth, only("reviewer"), async (req, res) => {
    const id = parseId(req.params.id);
    const application = id ? await repo.getApplication(id) : null;
    if (!application) return res.status(404).json({ error: "Application not found" });
    if (application.bankId !== req.user.bankId) return res.status(403).json({ error: "This application belongs to another bank" });
    res.json({
      application: { id: application.id, clientName: application.clientName, bankId: application.bankId, status: application.status, createdAt: application.createdAt },
      inputs: application.inputs,
      clientInsights: toClientView(application.results),            // what the SME owner saw
      bankDecisionSupport: toBankView(application.results),         // rules, risk and benchmarking for the reviewer
      explanation: await repo.getNarrative(id, "bank"),             // AI text, if it was already generated
      reviewerActions: await repo.listActions(id)
    });
  });

  // ---------- the reviewer's own bank settings (read only) ----------
  app.get("/api/bank/settings", auth, only("reviewer"), async (req, res) => {
    const bank = await repo.getBank(req.user.bankId);
    if (!bank) return res.status(404).json({ error: "Bank not found" });
    const sectors = await repo.getSectors();
    const nameOf = (id) => sectors.find((s) => s.sector_id === id)?.name ?? `Sector ${id}`;
    res.json({
      bankId: bank.bankId, name: bank.name, profile: bank.profileName,
      thresholds: {
        minDscr: bank.minDscr, minContributionPct: bank.minContributionPct, minCompleteness: bank.minCompleteness,
        minYearsOperating: bank.minYearsOperating, maxTermYears: bank.maxTermYears, minLoan: bank.minLoan, maxLoan: bank.maxLoan
      },
      rateRange: { min: bank.rateMin, max: bank.rateMax },
      riskWeights: bank.weights,
      cautionSectors: bank.cautionSectorIds.map((id) => ({ id, name: nameOf(id) }))
    });
  });

  // ---------- errors ----------
  app.use((req, res) => res.status(404).json({ error: "Not found" }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Request body is not valid JSON" });
    console.error(err);                                    // details stay in the server log, never sent to the browser
    res.status(500).json({ error: "Something went wrong" });
  });

  return app;
}
