import OpenAI from "openai";
import { env } from "../config/env.js";

let client;
let cachedKey;

function getClient() {
  const key = env.openRouterApiKey;

  // Reject missing or obvious placeholder keys with a clear message.
  if (
    !key ||
    key === "your_openrouter_api_key_here" ||
    key.startsWith("your_")
  ) {
    const error = new Error(
      "OPENROUTER_API_KEY is not configured on the server. " +
      "Set a valid API key in the .env file and restart the server.",
    );
    error.statusCode = 503;
    throw error;
  }

  // Re-create the client if the key has changed (e.g. after .env hot-reload).
  if (!client || cachedKey !== key) {
    cachedKey = key;
    client = new OpenAI({
      apiKey: key,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": env.clientOrigin,
        "X-Title": "RescueAI",
      },
    });
  }

  return client;
}


export async function analyzeIncident(incidentText) {
  const systemPrompt =
    "You are RescueAI, an emergency incident triage analyst supporting disaster response coordinators. " +
    "Analyze only the facts stated in the incoming report. Infer the most likely disaster category only " +
    "when supported by the report, and use 'unknown' when evidence is insufficient. Rate severity based " +
    "on likely harm, scale, infrastructure damage, hazardous conditions, and vulnerable people. Rate " +
    "urgency based on how quickly action is needed to protect life. Prioritize evacuation, emergency " +
    "dispatch, medical triage, fire/flood isolation, sheltering, and public warnings when appropriate. " +
    "Do not claim that responders, beds, vehicles, supplies, or routes are available unless the report " +
    "states it. Recommended action must be concise, operational, and include verification or escalation " +
    "when key details are missing. affectedResources must list people, facilities, utilities, roads, " +
    "medical needs, or response assets explicitly affected or reasonably at risk; return an empty array " +
    "if none can be identified. " +
    "You MUST respond with ONLY a valid JSON object — no markdown, no code fences, no extra text. " +
    'The JSON must have exactly these fields: disasterType (string), severity (one of: "low","moderate","high","critical"), ' +
    'urgency (one of: "routine","priority","immediate","life-threatening"), recommendedAction (string), affectedResources (array of strings).';

  const userPrompt =
    "Analyze this emergency incident text for a real-time response dashboard. " +
    "Return ONLY a valid JSON object with the specified fields.\n\n" +
    `INCIDENT TEXT:\n${incidentText}`;

  const response = await getClient().chat.completions.create({
    model: env.openRouterModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0].message.content;
  return JSON.parse(raw);
}

export async function chatWithAssistant({ message, context }) {
  const contextText = context ? `\nOperational context:\n${JSON.stringify(context)}` : "";

  const response = await getClient().chat.completions.create({
    model: env.openRouterModel,
    messages: [
      {
        role: "system",
        content:
          "You are the RescueAI command assistant supporting trained emergency coordinators. " +
          "Be concise, action-oriented, and flag when local authority confirmation is required.",
      },
      {
        role: "user",
        content: `${message}${contextText}`,
      },
    ],
  });

  return {
    message: response.choices[0].message.content,
    responseId: response.id,
    model: response.model,
  };
}
