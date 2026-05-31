import OpenAI from "openai";
import { env } from "../config/env.js";

const BROADCAST_TIMEOUT_MS = 25_000;

/* ── Lazy client ── */
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
        "X-Title": "RescueAI-Broadcast",
      },
    });
  }
  return _client;
}

/* ── Timeout wrapper ── */
function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Broadcast generation timed out after ${ms}ms`)), ms);
    promise.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });
}

const SYSTEM_PROMPT = `You are a Crisis Communication AI specialized in generating public emergency broadcasts.
Your job is to take incident details and generate targeted messages across three channels: SMS, Push Notifications, and Public Advisories.

Tone Constraints based on severity:
- 'critical' / 'high': Urgent, directive, life-saving instructions. No filler words. Start with ACTION (e.g. EVACUATE IMMEDIATELY).
- 'medium' / 'low': Informational, cautious, advisory. Provide updates and safety tips.

Constraints per channel:
- SMS: STRICTLY under 160 characters. Must contain location and action.
- Push Notifications: Short title (max 40 chars) and short body (max 120 chars).
- Public Advisories: 2-3 paragraphs. Include background, current risk, and detailed instructions for affected population.

You MUST respond with ONLY a valid JSON object with EXACTLY these fields:
{
  "sms_alerts": [ "string (max 160 chars)" ],
  "push_notifications": [ { "title": "string", "body": "string" } ],
  "public_advisories": [ "string (multi-paragraph text)" ]
}`;

export async function generateBroadcasts({ incidentDetails, severity, location, affectedPopulation }) {
  const startedAt = Date.now();

  const userPrompt = `
Generate emergency broadcasts for the following incident:
- Incident: ${incidentDetails}
- Severity: ${severity}
- Location: ${location}
- Affected Population: ${affectedPopulation}

Generate 2 SMS alerts, 2 Push notifications, and 1 detailed Public Advisory.`;

  const apiCall = getClient().chat.completions.create({
    model: env.openRouterModel,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user",   content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const response = await withTimeout(apiCall, BROADCAST_TIMEOUT_MS);
  const raw = response.choices[0].message.content;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Broadcast LLM returned invalid JSON. Raw output: " + raw.slice(0, 200));
  }

  return {
    broadcastId: `BC-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    severity: severity,
    sms_alerts: Array.isArray(parsed.sms_alerts) ? parsed.sms_alerts : [],
    push_notifications: Array.isArray(parsed.push_notifications) ? parsed.push_notifications : [],
    public_advisories: Array.isArray(parsed.public_advisories) ? parsed.public_advisories : [],
  };
}
