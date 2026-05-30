/**
 * RescueAI — SitRepService
 *
 * Generates a professional Situation Report (SitRep) in structured Markdown
 * using the OpenRouter LLM. The report follows standard emergency management
 * formatting used by FEMA / ICS (Incident Command System) practitioners.
 *
 * The service accepts a pre-assembled SitRepInput bundle (incidents, shelters,
 * hospitals, ambulances, summary stats) and returns:
 *   - reportText   : full Markdown document
 *   - classification : overall threat classification
 *   - threatLevel  : numeric 1–5
 *   - sections     : array of section title strings (for TOC)
 *   - model        : which LLM model produced the report
 *   - generatedAt  : ISO timestamp
 *   - durationMs   : generation latency
 */

import OpenAI from "openai";
import { env } from "../config/env.js";

const SITREP_TIMEOUT_MS = 45_000;

/* ── Lazy client (mirrors openrouterService.js pattern) ── */
let _client = null;
let _cachedKey = null;

function getClient() {
  const key = env.openRouterApiKey;
  if (!key || key === "your_openrouter_api_key_here" || key.startsWith("your_")) {
    const err = new Error(
      "OPENROUTER_API_KEY is not configured. Set a valid key in .env and restart.",
    );
    err.statusCode = 503;
    throw err;
  }
  if (!_client || _cachedKey !== key) {
    _cachedKey = key;
    _client = new OpenAI({
      apiKey: key,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": env.clientOrigin,
        "X-Title": "RescueAI-SitRep",
      },
    });
  }
  return _client;
}

/* ── Timeout wrapper ── */
function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`SitRep generation timed out after ${ms}ms`)), ms);
    promise.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });
}

/* ══════════════════════════════════════════════════════════════
   Prompt builders
══════════════════════════════════════════════════════════════ */

const SYSTEM_PROMPT = `You are a senior Emergency Management Officer with 20+ years of experience \
drafting Situation Reports (SitReps) for state and national disaster response agencies. \
You follow the FEMA / ICS SitRep standard format precisely.

Your report must be professional, objective, data-driven, and written for an executive audience \
(emergency directors, state officials, and field commanders). Do not speculate beyond the data \
provided. Use clear, authoritative language. Flag critical risks prominently.

You MUST respond with a valid JSON object with EXACTLY these fields:
{
  "classification": one of "ROUTINE" | "PRIORITY" | "IMMEDIATE" | "FLASH",
  "threatLevel": integer 1–5 (1 = minimal, 5 = catastrophic),
  "reportText": string containing the full Situation Report formatted in GitHub-Flavored Markdown,
  "sections": array of section title strings present in reportText (for table of contents),
  "executiveSummary": string — a 3–5 sentence stand-alone summary paragraph,
  "immediateActions": array of up to 6 string action items for the next 6 hours,
  "criticalAlerts": array of strings — items requiring immediate commander attention
}

The reportText Markdown MUST contain ALL of these sections in order:
1. SITUATION REPORT HEADER (report ID, period, classification, prepared by)
2. EXECUTIVE SUMMARY
3. INCIDENT STATUS (table of all incidents with ID, type, severity, status, affected people)
4. CASUALTY & DISPLACEMENT SUMMARY
5. SHELTER STATUS (table: name, capacity, occupancy, status, supply window, power backup)
6. MEDICAL FACILITY STATUS (table: name, type, free beds, ICU free, load %, status)
7. RESOURCE DEPLOYMENT STATUS
8. CRITICAL RISKS & WARNINGS
9. RECOMMENDED IMMEDIATE ACTIONS (next 6 hours)
10. FORECAST & ANTICIPATED ESCALATIONS`;

/**
 * Build the user-turn prompt from the assembled SitRep data bundle.
 * @param {SitRepInput} data
 * @returns {string}
 */
function buildUserPrompt(data) {
  const { incidents, shelters, hospitals, ambulances, summary, reportPeriod, operationalArea } = data;

  const incidentRows = incidents.map(i =>
    `| ${i.id} | ${i.type ?? i.category} | ${i.severity} | ${i.status} | ${i.affectedPeople?.toLocaleString() ?? "?"} | ${i.displaced?.toLocaleString() ?? "?"} | ${i.injured ?? 0} | ${i.deceased ?? 0} |`
  ).join("\n");

  const shelterRows = shelters.map(s =>
    `| ${s.name} | ${s.totalCapacity?.toLocaleString() ?? s.totalCapacity} | ${s.currentOccupancy?.toLocaleString() ?? s.currentOccupancy} | ${s.loadPercent ?? "?"}% | ${s.status} | ${s.supplyStatus?.food ?? "?"} food | ${s.hasPowerBackup ? "Yes" : "No"} | ${s.hasMedicalStaff ? "Yes" : "No"} |`
  ).join("\n");

  const hospitalRows = hospitals.map(h =>
    `| ${h.name} | ${h.type} | ${h.freeBeds} | ${h.icuFree} | ${h.operationalLoad ?? h.load}% | ${h.status} | ${h.helipads ?? 0} helipads |`
  ).join("\n");

  const ambulanceRows = ambulances.map(a =>
    `| ${a.callSign} | ${a.type} | ${a.status} | ${a.assignedIncident ?? "—"} | ${a.eta ?? "—"} |`
  ).join("\n");

  return `Generate a professional SitRep for the following operational data.

OPERATIONAL PARAMETERS:
- Report Period: ${reportPeriod ?? new Date().toISOString()}
- Operational Area: ${operationalArea ?? "Pune Metropolitan & Coastal Districts, India"}
- Data As-Of: ${new Date().toISOString()}

AGGREGATE SUMMARY STATISTICS:
${JSON.stringify(summary, null, 2)}

ACTIVE INCIDENTS (${incidents.length} total):
| ID | Type | Severity | Status | Affected | Displaced | Injured | Deceased |
|----|------|----------|--------|----------|-----------|---------|----------|
${incidentRows}

SHELTER STATUS (${shelters.length} facilities):
| Name | Capacity | Occupancy | Load | Status | Food Supply | Power Backup | Medical Staff |
|------|----------|-----------|------|--------|-------------|--------------|---------------|
${shelterRows}

HOSPITAL STATUS (${hospitals.length} facilities):
| Name | Type | Free Beds | ICU Free | Load% | Status | Notes |
|------|------|-----------|----------|-------|--------|-------|
${hospitalRows}

AMBULANCE/MEDICAL TEAMS (${ambulances.length} units):
| Call Sign | Type | Status | Assigned To | ETA |
|-----------|------|--------|-------------|-----|
${ambulanceRows}

Produce the complete SitRep now. Ensure all Markdown tables are correctly formatted with alignment pipes.`;
}

/* ══════════════════════════════════════════════════════════════
   generateSitRep — main export
══════════════════════════════════════════════════════════════ */

/**
 * Generate a professional Situation Report from operational data.
 *
 * @param {SitRepInput} data
 * @returns {Promise<SitRepOutput>}
 */
export async function generateSitRep(data) {
  const startedAt = Date.now();

  const apiCall = getClient().chat.completions.create({
    model: env.openRouterModel,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user",   content: buildUserPrompt(data) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,   // Very low — SitReps must be precise and consistent
    max_tokens: 4096,   // Allow for long, detailed reports
  });

  const response = await withTimeout(apiCall, SITREP_TIMEOUT_MS);
  const raw = response.choices[0].message.content;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("SitRep LLM returned invalid JSON. Raw output: " + raw.slice(0, 200));
  }

  /* Validate and normalise required fields */
  const validClassifications = ["ROUTINE", "PRIORITY", "IMMEDIATE", "FLASH"];
  const classification = validClassifications.includes(parsed.classification)
    ? parsed.classification
    : "PRIORITY";

  const threatLevel = Number.isInteger(parsed.threatLevel) && parsed.threatLevel >= 1 && parsed.threatLevel <= 5
    ? parsed.threatLevel
    : 3;

  return {
    reportId:        `SITREP-${Date.now()}`,
    classification,
    threatLevel,
    reportText:      parsed.reportText      ?? "",
    sections:        Array.isArray(parsed.sections) ? parsed.sections : [],
    executiveSummary: parsed.executiveSummary ?? "",
    immediateActions: Array.isArray(parsed.immediateActions) ? parsed.immediateActions : [],
    criticalAlerts:  Array.isArray(parsed.criticalAlerts)  ? parsed.criticalAlerts  : [],
    model:           response.model,
    generatedAt:     new Date().toISOString(),
    durationMs:      Date.now() - startedAt,
  };
}
