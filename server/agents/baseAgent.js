/**
 * RescueAI — BaseAgent
 *
 * Abstract foundation for all domain agents.
 * Subclasses must implement:
 *   - get name()         → string agent identifier
 *   - get systemPrompt() → string system instruction
 *   - buildUserPrompt(context) → string user message
 *   - parseOutput(raw)   → validated recommendation object
 */

import { env } from "../config/env.js";
import OpenAI from "openai";

const AGENT_TIMEOUT_MS = 30_000;

/* ── Shared lazy client (same pattern as openrouterService.js) ── */
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
        "X-Title": "RescueAI-Agents",
      },
    });
  }

  return _client;
}

/* ── Timeout-wrapped promise ── */
function withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms,
    );
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

/* ══════════════════════════════════════════════════════════════
   BaseAgent
══════════════════════════════════════════════════════════════ */

export class BaseAgent {
  /** @returns {string} Unique agent name (lowercase, no spaces) */
  get name() {
    throw new Error("BaseAgent.name must be implemented by subclass.");
  }

  /** @returns {string} LLM system prompt for this agent's domain */
  get systemPrompt() {
    throw new Error("BaseAgent.systemPrompt must be implemented by subclass.");
  }

  /**
   * Build the user-turn prompt from incident context.
   * @param {object} context — IncidentContext object
   * @returns {string}
   */
  buildUserPrompt(context) {
    const resourceSummary = [
      context.resources?.hospitals
        ? `Hospitals: ${JSON.stringify(context.resources.hospitals.map(h => ({
            id: h.id, name: h.name, freeBeds: h.freeBeds, load: h.operationalLoad ?? h.load, status: h.status,
          })))}`
        : "",
      context.resources?.shelters
        ? `Shelters: ${JSON.stringify(context.resources.shelters.map(s => ({
            id: s.id, name: s.name, availableBeds: s.availableBeds ?? s.available,
            loadPercent: s.loadPercent ?? s.load, status: s.status,
          })))}`
        : "",
      context.resources?.ambulances
        ? `Ambulances: ${JSON.stringify(context.resources.ambulances.map(a => ({
            id: a.id, callSign: a.callSign, type: a.type, status: a.status,
            assignedIncident: a.assignedIncident ?? null,
          })))}`
        : "",
    ].filter(Boolean).join("\n");

    return (
      `INCIDENT CONTEXT:\n` +
      `- ID: ${context.incidentId ?? "unknown"}\n` +
      `- Category: ${context.category ?? "unknown"}\n` +
      `- Severity: ${context.severity ?? "unknown"}\n` +
      `- Affected People: ${context.affectedPeople ?? "unknown"}\n` +
      `- Location: ${context.location?.name ?? "unknown"}\n` +
      `- Coordinates: ${context.location?.latitude}, ${context.location?.longitude}\n` +
      `- Incident Description:\n${context.incidentText}\n\n` +
      (resourceSummary ? `LIVE RESOURCE STATUS:\n${resourceSummary}\n\n` : "") +
      `Respond ONLY with a valid JSON object following the exact schema defined in your instructions.`
    );
  }

  parseOutput(raw) {
    let cleanRaw = raw.trim();
    if (cleanRaw.startsWith("```json")) {
      cleanRaw = cleanRaw.replace(/^```json\s*/, "");
      cleanRaw = cleanRaw.replace(/\s*```$/, "");
    } else if (cleanRaw.startsWith("```")) {
      cleanRaw = cleanRaw.replace(/^```\s*/, "");
      cleanRaw = cleanRaw.replace(/\s*```$/, "");
    }
    const parsed = JSON.parse(cleanRaw);
    return parsed;
  }

  /**
   * Execute this agent against the given incident context.
   * Always resolves (never rejects) — failures return status: "failed".
   *
   * @param {object} context — IncidentContext
   * @returns {Promise<AgentRecommendation>}
   */
  async run(context) {
    const startedAt = Date.now();

    try {
      const client = getClient();

      const apiCall = client.chat.completions.create({
        model: env.openRouterModel,
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user",   content: this.buildUserPrompt(context) },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,  // Lower temp for deterministic tactical output
      });

      const response = await withTimeout(apiCall, AGENT_TIMEOUT_MS, `[${this.name}]`);
      const raw = response.choices[0].message.content;
      const parsed = this.parseOutput(raw);

      return {
        agent: this.name,
        status: "success",
        durationMs: Date.now() - startedAt,
        ...parsed,
      };
    } catch (error) {
      console.error(`[${this.name}] Agent failed:`, error.message);
      return {
        agent: this.name,
        status: "failed",
        error: error.message,
        durationMs: Date.now() - startedAt,
        priority: "unknown",
        recommendations: [],
        resources_required: [],
        estimated_impact: "N/A — agent unavailable",
        confidence: 0,
        reasoning: "",
        warnings: [],
      };
    }
  }
}
