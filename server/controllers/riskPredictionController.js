import { generateRiskForecast } from "../services/riskPredictionService.js";
import { Incident } from "../models/Incident.js";
import { Shelter } from "../models/Shelter.js";

function validateOverrides(body) {
  const errors = [];
  if (body.incidents !== undefined && !Array.isArray(body.incidents)) errors.push("incidents must be an array if provided.");
  if (body.shelters !== undefined && !Array.isArray(body.shelters)) errors.push("shelters must be an array if provided.");
  if (body.weather !== undefined && (typeof body.weather !== "object" || body.weather === null)) errors.push("weather must be an object with a 'conditions' sub-object if provided.");
  return errors;
}

export async function getRiskForecast(req, res, next) {
  try {
    const [incidents, shelters] = await Promise.all([ Incident.find({}), Shelter.find({}) ]);
    const forecast = generateRiskForecast({ incidents, shelters });
    return res.json(forecast);
  } catch (error) {
    return next(error);
  }
}

export async function postRiskForecast(req, res, next) {
  const body = req.body ?? {};
  const errors = validateOverrides(body);
  if (errors.length > 0) return res.status(400).json({ error: "Invalid request body.", details: errors });

  try {
    let incidents = body.incidents;
    let shelters = body.shelters;

    if (!incidents || !shelters) {
      const [dbIncidents, dbShelters] = await Promise.all([ Incident.find({}), Shelter.find({}) ]);
      if (!incidents) incidents = dbIncidents;
      if (!shelters) shelters = dbShelters;
    }

    const forecast = generateRiskForecast({ incidents, shelters, weather: body.weather ?? undefined });
    return res.json(forecast);
  } catch (error) {
    return next(error);
  }
}

export async function getRiskSummary(req, res, next) {
  try {
    const [incidents, shelters] = await Promise.all([ Incident.find({}), Shelter.find({}) ]);
    const forecast = generateRiskForecast({ incidents, shelters });

    return res.json({
      forecastId:   forecast.forecastId,
      generatedAt:  forecast.generatedAt,
      overallRisk:  forecast.overallRisk,
      topPredictions: forecast.predictions.items.slice(0, 3).map(p => ({
        category:    p.predictedCategory,
        probability: p.probability,
        timeframe:   `${p.timeframeHours}h`,
        level:       p.riskLevel.level,
      })),
      immediateActions: forecast.recommendedActions.items
        .filter(a => a.priority === "immediate")
        .slice(0, 5)
        .map(a => a.action),
      shelterLoad:  forecast.shelterPressure.overallLoadPct,
      weatherAlerts: forecast.weatherRisk.weatherWarnings.length,
    });
  } catch (error) {
    return next(error);
  }
}
