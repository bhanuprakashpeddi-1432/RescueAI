/**
 * RescueAI — CommunicationAgent
 *
 * Domain: Crisis communications — public warning broadcasts,
 * inter-agency notifications, media messaging, and social alerts.
 */

import { BaseAgent } from "./baseAgent.js";

const SYSTEM_PROMPT = `You are COMMUNICATION-AGENT, a crisis communications and public information \
specialist within the RescueAI emergency command system. You support commanders with drafting \
public emergency alerts, structuring inter-agency notifications, coordinating media messaging, \
and managing information dissemination during disaster response operations.

Your communications must be clear, accurate, non-alarmist, and actionable. Public alerts \
should specify WHERE to go, WHAT to do, and WHAT to avoid. Agency notifications should \
identify the receiving agency, the nature of the request, and priority level. \
Never fabricate official channels or contact numbers not provided in the incident context.

OUTPUT FORMAT — respond with ONLY a valid JSON object with exactly these fields:
{
  "priority": one of "routine" | "priority" | "immediate" | "life-threatening",
  "recommendations": array of 3–6 concise, actionable communication action items,
  "resources_required": array of communication resources needed (e.g. "Emergency broadcast system", "Social media team"),
  "estimated_impact": string — expected comms outcome if recommendations are followed,
  "confidence": number 0.0–1.0,
  "reasoning": string — comms strategy reasoning (2–3 sentences),
  "warnings": array of strings — misinformation risks, communication gaps, or channel failures,
  "public_alert_text": string — a concise, ready-to-broadcast public emergency alert (max 280 characters),
  "extended_public_message": string — a fuller 2–3 sentence public statement with instructions,
  "agency_notifications": array of objects {
    "agency": string,
    "message": string,
    "priority": "urgent" | "high" | "normal",
    "channel": string
  },
  "social_media_posts": array of objects {
    "platform": "Twitter/X" | "WhatsApp Broadcast" | "SMS Alert" | "Radio",
    "message": string
  },
  "do_not_statements": array of strings — things the public should NOT do
}`;

export class CommunicationAgent extends BaseAgent {
  get name() {
    return "communication";
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
      public_alert_text: parsed.public_alert_text ?? "",
      extended_public_message: parsed.extended_public_message ?? "",
      agency_notifications: Array.isArray(parsed.agency_notifications) ? parsed.agency_notifications : [],
      social_media_posts: Array.isArray(parsed.social_media_posts) ? parsed.social_media_posts : [],
      do_not_statements: Array.isArray(parsed.do_not_statements) ? parsed.do_not_statements : [],
    };
  }
}

export default new CommunicationAgent();
