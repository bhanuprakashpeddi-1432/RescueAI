/**
 * RescueAI — AgentOrchestrator
 *
 * Dispatches all four domain agents in parallel using Promise.allSettled,
 * then merges their outputs into a unified AgentMissionBrief.
 *
 * Design principles:
 * - One failing agent NEVER blocks the others.
 * - Overall priority is the highest across all successful agents.
 * - Consolidated actions are ordered: rescue → medical → communication → logistics.
 * - Critical warnings are deduplicated across agents.
 */

import rescueAgent from "./rescueAgent.js";
import medicalAgent from "./medicalAgent.js";
import logisticsAgent from "./logisticsAgent.js";
import communicationAgent from "./communicationAgent.js";

/* ── Priority ordering for ranking ── */
const PRIORITY_RANK = {
  "life-threatening": 4,
  "immediate":        3,
  "priority":         2,
  "routine":          1,
  "unknown":          0,
};

/** Return the highest-ranked priority string from an array of agents. */
function resolveOverallPriority(agents) {
  let best = "routine";
  for (const report of agents) {
    if (report.status !== "success") continue;
    if ((PRIORITY_RANK[report.priority] ?? 0) > (PRIORITY_RANK[best] ?? 0)) {
      best = report.priority;
    }
  }
  return best;
}

/**
 * Determine execution order for consolidated action list.
 * Default SAR-first order, escalated to SAR → MEDICAL → COMMS → LOGISTICS
 * for life-threatening or immediate scenarios.
 */
function buildExecutionOrder(overallPriority) {
  if (overallPriority === "life-threatening" || overallPriority === "immediate") {
    return ["rescue", "medical", "communication", "logistics"];
  }
  return ["rescue", "medical", "logistics", "communication"];
}

/**
 * Collect top N recommendations from each successful agent in execution order.
 * Prefixed with agent domain tag for clarity in the command display.
 */
function buildConsolidatedActions(agentReports, executionOrder) {
  const actions = [];
  for (const agentName of executionOrder) {
    const report = agentReports[agentName];
    if (!report || report.status !== "success") continue;
    const domain = agentName.toUpperCase();
    (report.recommendations ?? []).slice(0, 3).forEach((rec) => {
      actions.push(`[${domain}] ${rec}`);
    });
  }
  return actions;
}

/**
 * Gather unique warnings from all agents (case-insensitive dedup on first 60 chars).
 */
function buildCriticalWarnings(agentReports) {
  const seen = new Set();
  const warnings = [];
  for (const report of Object.values(agentReports)) {
    if (!Array.isArray(report.warnings)) continue;
    for (const w of report.warnings) {
      const key = w.slice(0, 60).toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        warnings.push(w);
      }
    }
  }
  return warnings;
}

/** Generate a unique mission ID */
function generateMissionId() {
  const ts = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `MISSION-${ts}-${rand}`;
}

/* ══════════════════════════════════════════════════════════════
   dispatchAgents — main orchestration entry point
══════════════════════════════════════════════════════════════ */

/**
 * Fan out to all four domain agents concurrently.
 *
 * @param {IncidentContext} context
 * @returns {Promise<AgentMissionBrief>}
 */
export async function dispatchAgents(context) {
  const startedAt = Date.now();

  console.log(
    `[Orchestrator] Dispatching 4 agents for incident: ${context.incidentId ?? "unknown"} ` +
    `(severity: ${context.severity ?? "unknown"})`,
  );

  /* Run all agents concurrently — Promise.allSettled so no agent can crash the batch */
  const [rescueResult, medicalResult, logisticsResult, communicationResult] =
    await Promise.allSettled([
      rescueAgent.run(context),
      medicalAgent.run(context),
      logisticsAgent.run(context),
      communicationAgent.run(context),
    ]);

  /* Unwrap settled results (allSettled always fulfills) */
  const agentReports = {
    rescue:        rescueResult.value        ?? { agent: "rescue",        status: "failed", error: rescueResult.reason?.message },
    medical:       medicalResult.value       ?? { agent: "medical",       status: "failed", error: medicalResult.reason?.message },
    logistics:     logisticsResult.value     ?? { agent: "logistics",     status: "failed", error: logisticsResult.reason?.message },
    communication: communicationResult.value ?? { agent: "communication", status: "failed", error: communicationResult.reason?.message },
  };

  const successCount = Object.values(agentReports).filter(r => r.status === "success").length;
  const failCount    = 4 - successCount;
  console.log(`[Orchestrator] Complete — ${successCount}/4 agents succeeded in ${Date.now() - startedAt}ms`);
  if (failCount > 0) {
    console.warn(`[Orchestrator] ${failCount} agent(s) failed:`, 
      Object.entries(agentReports).filter(([, r]) => r.status === "failed").map(([k]) => k).join(", ")
    );
  }

  /* Build unified mission brief */
  const overallPriority = resolveOverallPriority(Object.values(agentReports));
  const executionOrder  = buildExecutionOrder(overallPriority);

  const missionBrief = {
    missionId:           generateMissionId(),
    incidentId:          context.incidentId ?? null,
    generatedAt:         new Date().toISOString(),
    durationMs:          Date.now() - startedAt,
    overallPriority,
    executionOrder,
    agentReports,
    consolidatedActions: buildConsolidatedActions(agentReports, executionOrder),
    criticalWarnings:    buildCriticalWarnings(agentReports),
    meta: {
      agentsDispatched: 4,
      agentsSucceeded:  successCount,
      agentsFailed:     failCount,
      incidentCategory: context.category ?? null,
      incidentSeverity: context.severity ?? null,
    },
  };

  return missionBrief;
}
