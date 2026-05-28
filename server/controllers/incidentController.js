import { createIncidentSummary, listIncidents } from "../services/incidentService.js";
import { analyzeIncident } from "../services/openrouterService.js";

export function getIncidents(req, res) {
  const { severity, status } = req.query;
  const data = listIncidents({ severity, status });

  res.json({
    data,
    summary: {
      ...createIncidentSummary(),
      returned: data.length,
    },
    updatedAt: new Date().toISOString(),
  });
}

export async function postIncidentAnalysis(req, res, next) {
  const { incidentText } = req.body;

  if (typeof incidentText !== "string" || !incidentText.trim()) {
    return res.status(400).json({
      error: "A non-empty incidentText string is required.",
      example: {
        incidentText:
          "Flood water has reached homes near River Ward. Five residents are trapped on rooftops.",
      },
    });
  }

  if (incidentText.length > 5000) {
    return res.status(400).json({
      error: "incidentText must be 5000 characters or fewer.",
    });
  }

  try {
    const analysis = await analyzeIncident(incidentText.trim());

    return res.json(analysis);
  } catch (error) {
    return next(error);
  }
}
