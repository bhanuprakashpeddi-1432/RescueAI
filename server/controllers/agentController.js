/**
 * RescueAI — AgentController
 *
 * Handles POST /api/agent-dispatch requests:
 *   1. Validates the incoming IncidentContext
 *   2. Enriches it with live resource snapshots from mockData
 *   3. Calls the AgentOrchestrator
 *   4. Broadcasts AgentMissionBrief via Socket.io
 *   5. Returns the full brief in the REST response
 *
 * Requires `io` (Socket.io server instance) to be injected via setSocketIo().
 */

import { dispatchAgents } from "../agents/orchestrator.js";
import { hospitals, shelters, ambulanceTeams } from "../data/mockData.js";

/* ── Socket.io instance injected by server.js ── */
let _io = null;

export function setSocketIo(io) {
  _io = io;
}

/* ── Input validation helpers ── */
const VALID_CATEGORIES = ["flood", "fire", "cyclone", "earthquake", "gas", "collapse", "medical", "shelter", "logistics", "other"];
const VALID_SEVERITIES  = ["low", "moderate", "medium", "high", "critical"];

function validateIncidentContext(ctx) {
  const errors = [];

  if (!ctx || typeof ctx !== "object") {
    return ["incidentContext must be a non-null object."];
  }

  if (typeof ctx.incidentText !== "string" || !ctx.incidentText.trim()) {
    errors.push("incidentContext.incidentText must be a non-empty string.");
  } else if (ctx.incidentText.length > 5000) {
    errors.push("incidentContext.incidentText must be 5000 characters or fewer.");
  }

  if (ctx.category && !VALID_CATEGORIES.includes(ctx.category.toLowerCase())) {
    errors.push(`incidentContext.category must be one of: ${VALID_CATEGORIES.join(", ")}.`);
  }

  if (ctx.severity && !VALID_SEVERITIES.includes(ctx.severity.toLowerCase())) {
    errors.push(`incidentContext.severity must be one of: ${VALID_SEVERITIES.join(", ")}.`);
  }

  return errors;
}

/**
 * Enrich the incoming context with live resource snapshots.
 * This gives agents accurate, current hospital/shelter/ambulance data.
 */
function enrichContext(raw) {
  return {
    incidentId:     raw.incidentId    ?? null,
    incidentText:   raw.incidentText.trim(),
    category:       (raw.category    ?? "other").toLowerCase(),
    severity:       (raw.severity    ?? "high").toLowerCase(),
    affectedPeople: raw.affectedPeople ?? null,
    location:       raw.location      ?? { name: "Unknown", latitude: null, longitude: null },
    resources: {
      hospitals:  hospitals.map(h => ({
        id:               h.id,
        name:             h.name,
        type:             h.type,
        freeBeds:         h.freeBeds,
        icuFree:          h.icuFree,
        operationalLoad:  h.operationalLoad,
        status:           h.status,
        specialties:      h.specialties,
        helipads:         h.helipads,
        bloodBankAvailable: h.bloodBankAvailable,
        surgicalTeamsOnCall: h.surgicalTeamsOnCall,
        location:         h.location,
      })),
      shelters: shelters.map(s => ({
        id:               s.id,
        name:             s.name,
        type:             s.type,
        availableBeds:    s.availableBeds,
        currentOccupancy: s.currentOccupancy,
        totalCapacity:    s.totalCapacity,
        loadPercent:      s.loadPercent,
        status:           s.status,
        hasMedicalStaff:  s.hasMedicalStaff,
        hasPowerBackup:   s.hasPowerBackup,
        hasCleanWater:    s.hasCleanWater,
        supplyStatus:     s.supplyStatus,
        location:         s.location,
      })),
      ambulances: ambulanceTeams.map(a => ({
        id:               a.id,
        callSign:         a.callSign,
        type:             a.type,
        vehicleType:      a.vehicleType,
        status:           a.status,
        assignedIncident: a.assignedIncident ?? null,
        eta:              a.eta ?? null,
        equipment:        a.equipment,
        crewCount:        a.crewCount,
      })),
    },
  };
}

/* ══════════════════════════════════════════════════════════════
   Controller
══════════════════════════════════════════════════════════════ */

export async function postAgentDispatch(req, res, next) {
  const { incidentContext } = req.body ?? {};

  /* Validate */
  const validationErrors = validateIncidentContext(incidentContext);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      error: "Invalid incidentContext.",
      details: validationErrors,
      example: {
        incidentContext: {
          incidentId: "INC-2401",
          incidentText: "Flash flood in North Valley. Five residents stranded on rooftops. Road submerged.",
          category: "flood",
          severity: "critical",
          affectedPeople: 4800,
          location: { name: "River Ward, North Valley", latitude: 18.543, longitude: 73.87 },
        },
      },
    });
  }

  try {
    /* Enrich context with live resource data */
    const enrichedContext = enrichContext(incidentContext);

    /* Run orchestrator */
    const missionBrief = await dispatchAgents(enrichedContext);

    /* Broadcast to all connected command panels via Socket.io */
    if (_io) {
      _io.emit("agent-mission-complete", {
        missionId:       missionBrief.missionId,
        incidentId:      missionBrief.incidentId,
        overallPriority: missionBrief.overallPriority,
        consolidatedActions: missionBrief.consolidatedActions,
        criticalWarnings:    missionBrief.criticalWarnings,
        meta:                missionBrief.meta,
        generatedAt:         missionBrief.generatedAt,
      });
    }

    return res.json(missionBrief);
  } catch (error) {
    return next(error);
  }
}
