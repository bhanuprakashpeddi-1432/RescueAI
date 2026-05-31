import { createIncidentSummary, listIncidents, createIncident } from "../services/incidentService.js";
import { analyzeIncident } from "../services/openrouterService.js";
import { Alert } from "../models/Alert.js";
import Joi from "joi";

export async function getIncidents(req, res, next) {
  try {
    const { severity, status } = req.query;
    const data = await listIncidents({ severity, status });
    const summary = await createIncidentSummary();

    res.json({
      data,
      summary: {
        ...summary,
        returned: data.length,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

export async function postIncident(req, res, next) {
  const schema = Joi.object({
    category: Joi.string().required(),
    type: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    severity: Joi.string().required(),
    location: Joi.object({
      name: Joi.string().required(),
      district: Joi.string().allow(''),
      latitude: Joi.number().required(),
      longitude: Joi.number().required()
    }).required(),
    affectedPeople: Joi.number().optional()
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const newIncident = await createIncident(value);
    res.status(201).json(newIncident);
  } catch (err) {
    next(err);
  }
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

export async function getAlerts(req, res, next) {
  try {
    const alerts = await Alert.find({}).sort({ createdAt: -1 }).limit(20);
    res.json({ data: alerts });
  } catch (err) {
    next(err);
  }
}
