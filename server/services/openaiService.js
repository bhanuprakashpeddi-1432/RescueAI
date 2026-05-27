import OpenAI from "openai";
import { env } from "../config/env.js";

let client;

function getClient() {
  if (!env.openAiApiKey) {
    const error = new Error("OPENAI_API_KEY is not configured on the server.");
    error.statusCode = 503;
    throw error;
  }

  if (!client) {
    client = new OpenAI({ apiKey: env.openAiApiKey });
  }

  return client;
}

export async function analyzeIncident(incidentText) {
  const response = await getClient().responses.create({
    model: env.openAiModel,
    instructions:
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
      "if none can be identified.",
    input:
      "Analyze this emergency incident text for a real-time response dashboard. Return only the requested " +
      `structured fields.\n\nINCIDENT TEXT:\n${incidentText}`,
    text: {
      format: {
        type: "json_schema",
        name: "incident_analysis",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            disasterType: { type: "string" },
            severity: { type: "string", enum: ["low", "moderate", "high", "critical"] },
            urgency: { type: "string", enum: ["routine", "priority", "immediate", "life-threatening"] },
            recommendedAction: { type: "string" },
            affectedResources: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["disasterType", "severity", "urgency", "recommendedAction", "affectedResources"],
        },
      },
    },
  });

  return JSON.parse(response.output_text);
}

export async function chatWithAssistant({ message, context }) {
  const contextText = context ? `\nOperational context:\n${JSON.stringify(context)}` : "";
  const response = await getClient().responses.create({
    model: env.openAiModel,
    instructions:
      "You are the RescueAI command assistant supporting trained emergency coordinators. " +
      "Be concise, action-oriented, and flag when local authority confirmation is required.",
    input: `${message}${contextText}`,
  });

  return {
    message: response.output_text,
    responseId: response.id,
    model: response.model,
  };
}
