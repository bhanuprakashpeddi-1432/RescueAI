/**
 * RescueAI — SitRepController
 *
 * GET  /api/sitrep         — Generate a SitRep from all live operational data
 * POST /api/sitrep         — Generate a SitRep from caller-supplied data override
 *
 * Both endpoints return a SitRepOutput containing:
 *   - reportId, classification, threatLevel
 *   - reportText (full Markdown SitRep document)
 *   - executiveSummary, immediateActions, criticalAlerts
 *   - sections (TOC), model, generatedAt, durationMs
 */

import { generateSitRep } from "../services/sitRepService.js";
import {
  incidents,
  hospitals,
  shelters,
  ambulanceTeams,
  computeSummary,
} from "../data/mockData.js";

/* ── Shared data assembler ── */
function assembleLiveData(overrides = {}) {
  return {
    incidents:       overrides.incidents   ?? incidents,
    hospitals:       overrides.hospitals   ?? hospitals,
    shelters:        overrides.shelters    ?? shelters,
    ambulances:      overrides.ambulances  ?? ambulanceTeams,
    summary:         computeSummary(),
    reportPeriod:    overrides.reportPeriod   ?? null,   // null → service uses current timestamp
    operationalArea: overrides.operationalArea ?? null,  // null → service uses default region
  };
}

/* ── Input validation ── */
function validateOverrides(body) {
  const errors = [];

  if (body.incidents !== undefined && !Array.isArray(body.incidents)) {
    errors.push("incidents must be an array if provided.");
  }
  if (body.hospitals !== undefined && !Array.isArray(body.hospitals)) {
    errors.push("hospitals must be an array if provided.");
  }
  if (body.shelters !== undefined && !Array.isArray(body.shelters)) {
    errors.push("shelters must be an array if provided.");
  }
  if (body.ambulances !== undefined && !Array.isArray(body.ambulances)) {
    errors.push("ambulances must be an array if provided.");
  }
  if (body.reportPeriod !== undefined && typeof body.reportPeriod !== "string") {
    errors.push("reportPeriod must be a string (ISO date or descriptive period label).");
  }
  if (body.operationalArea !== undefined && typeof body.operationalArea !== "string") {
    errors.push("operationalArea must be a string.");
  }

  return errors;
}

/* ══════════════════════════════════════════════════════════════
   GET /api/sitrep
   Uses all live operational data from mockData.js
══════════════════════════════════════════════════════════════ */

export async function getSitRep(req, res, next) {
  try {
    const data = assembleLiveData();
    const sitRep = await generateSitRep(data);
    return res.json(sitRep);
  } catch (error) {
    return next(error);
  }
}

/* ══════════════════════════════════════════════════════════════
   POST /api/sitrep
   Accepts optional data overrides in the request body.
   Any field omitted defaults to live data.
══════════════════════════════════════════════════════════════ */

export async function postSitRep(req, res, next) {
  const body = req.body ?? {};

  /* Validate any overrides supplied */
  const errors = validateOverrides(body);
  if (errors.length > 0) {
    return res.status(400).json({
      error: "Invalid request body.",
      details: errors,
      hint: "All fields are optional. Omit any field to use live operational data.",
      acceptedFields: {
        incidents:       "array — override incident list",
        hospitals:       "array — override hospital list",
        shelters:        "array — override shelter list",
        ambulances:      "array — override ambulance list",
        reportPeriod:    "string — e.g. '2026-05-26T00:00Z / 2026-05-27T23:59Z'",
        operationalArea: "string — e.g. 'Pune Metropolitan District'",
      },
    });
  }

  try {
    const data = assembleLiveData(body);
    const sitRep = await generateSitRep(data);
    return res.json(sitRep);
  } catch (error) {
    return next(error);
  }
}
