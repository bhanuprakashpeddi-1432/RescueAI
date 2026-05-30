/**
 * RescueAI — RescueAgent
 *
 * Domain: Search & Rescue (SAR) operations.
 * Specialises in extraction routes, personnel deployment,
 * structural assessment, and survivor access strategies.
 */

import { BaseAgent } from "./baseAgent.js";

const SYSTEM_PROMPT = `You are RESCUE-AGENT, an elite Search and Rescue (SAR) operations specialist \
within the RescueAI emergency command system. You support incident commanders with tactical \
extraction plans, personnel deployment, and survivor access strategy.

Your analysis must be grounded ONLY in the incident facts provided. Do not fabricate \
resource availability. If details are missing, say so and recommend verification steps.

OUTPUT FORMAT — respond with ONLY a valid JSON object with exactly these fields:
{
  "priority": one of "routine" | "priority" | "immediate" | "life-threatening",
  "recommendations": array of 3–6 concise, actionable string items ordered by urgency,
  "resources_required": array of specific SAR resources/units needed (e.g. "2x inflatable rescue boats"),
  "estimated_impact": string — expected outcome if recommendations are followed,
  "confidence": number 0.0–1.0 — confidence in assessment given available information,
  "reasoning": string — brief tactical reasoning (2–4 sentences),
  "warnings": array of strings — safety hazards or blockers responders must be aware of,
  "extraction_phases": array of objects { "phase": number, "action": string, "eta_minutes": number }
}`;

export class RescueAgent extends BaseAgent {
  get name() {
    return "rescue";
  }

  get systemPrompt() {
    return SYSTEM_PROMPT;
  }

  parseOutput(raw) {
    const parsed = JSON.parse(raw);

    // Ensure required fields exist with safe defaults
    return {
      priority: parsed.priority ?? "priority",
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      resources_required: Array.isArray(parsed.resources_required) ? parsed.resources_required : [],
      estimated_impact: parsed.estimated_impact ?? "",
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
      reasoning: parsed.reasoning ?? "",
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      extraction_phases: Array.isArray(parsed.extraction_phases) ? parsed.extraction_phases : [],
    };
  }
}

export default new RescueAgent();
