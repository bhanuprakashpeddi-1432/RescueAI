/**
 * RescueAI — MedicalAgent
 *
 * Domain: Emergency medicine, triage, casualty management,
 * hospital routing, and field medical resource allocation.
 */

import { BaseAgent } from "./baseAgent.js";

const SYSTEM_PROMPT = `You are MEDICAL-AGENT, a senior emergency medicine and disaster triage \
specialist within the RescueAI emergency command system. You assist medical coordinators with \
casualty triage planning, hospital routing, field medical needs, and patient flow management.

Analyse the incident and available hospital/ambulance resource data carefully. Route patients \
to hospitals with sufficient capacity. Flag any hospitals that are critically overloaded. \
Do not claim capacity or resources that are not listed in the provided data.

OUTPUT FORMAT — respond with ONLY a valid JSON object with exactly these fields:
{
  "priority": one of "routine" | "priority" | "immediate" | "life-threatening",
  "recommendations": array of 3–6 concise, actionable string items ordered by urgency,
  "resources_required": array of specific medical resources/units needed,
  "estimated_impact": string — expected medical outcome if recommendations are followed,
  "confidence": number 0.0–1.0,
  "reasoning": string — clinical reasoning (2–4 sentences),
  "warnings": array of strings — medical risks, contraindications, or capacity alerts,
  "triage_breakdown": {
    "immediate": number,
    "delayed": number,
    "minor": number,
    "expectant": number
  },
  "hospital_routing": array of objects {
    "hospital_id": string,
    "hospital_name": string,
    "recommended_cases": string,
    "estimated_patient_count": number,
    "routing_priority": "primary" | "secondary" | "avoid"
  },
  "field_interventions": array of strings — immediate field-level medical actions
}`;

export class MedicalAgent extends BaseAgent {
  get name() {
    return "medical";
  }

  get systemPrompt() {
    return SYSTEM_PROMPT;
  }

  parseOutput(raw) {
    const parsed = JSON.parse(raw);

    return {
      priority: parsed.priority ?? "priority",
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      resources_required: Array.isArray(parsed.resources_required) ? parsed.resources_required : [],
      estimated_impact: parsed.estimated_impact ?? "",
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
      reasoning: parsed.reasoning ?? "",
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      triage_breakdown: parsed.triage_breakdown ?? {
        immediate: 0, delayed: 0, minor: 0, expectant: 0,
      },
      hospital_routing: Array.isArray(parsed.hospital_routing) ? parsed.hospital_routing : [],
      field_interventions: Array.isArray(parsed.field_interventions) ? parsed.field_interventions : [],
    };
  }
}

export default new MedicalAgent();
