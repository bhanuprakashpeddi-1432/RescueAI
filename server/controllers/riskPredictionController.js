/**
 * RescueAI — Risk Prediction Controller
 *
 * GET  /api/risk-forecast         — Generate forecast from all live data
 * POST /api/risk-forecast         — Generate forecast with optional overrides
 * GET  /api/risk-forecast/summary — Lightweight summary (overall risk + top predictions only)
 */

import { generateRiskForecast } from "../services/riskPredictionService.js";
import { incidents, shelters } from "../data/mockData.js";

/* ── Input validation ── */
function validateOverrides(body) {
  const errors = [];
  if (body.incidents !== undefined && !Array.isArray(body.incidents)) {
    errors.push("incidents must be an array if provided.");
  }
  if (body.shelters !== undefined && !Array.isArray(body.shelters)) {
    errors.push("shelters must be an array if provided.");
  }
  if (body.weather !== undefined && (typeof body.weather !== "object" || body.weather === null)) {
    errors.push("weather must be an object with a 'conditions' sub-object if provided.");
  }
  return errors;
}

/* ══════════════════════════════════════════════════════════════
   GET /api/risk-forecast
   Full forecast from all live operational data
══════════════════════════════════════════════════════════════ */

export function getRiskForecast(req, res, next) {
  try {
    const forecast = generateRiskForecast({
      incidents,
      shelters,
    });
    return res.json(forecast);
  } catch (error) {
    return next(error);
  }
}

/* ══════════════════════════════════════════════════════════════
   POST /api/risk-forecast
   Accepts optional data overrides and/or custom weather
══════════════════════════════════════════════════════════════ */

export function postRiskForecast(req, res, next) {
  const body = req.body ?? {};
  const errors = validateOverrides(body);
  if (errors.length > 0) {
    return res.status(400).json({
      error: "Invalid request body.",
      details: errors,
      hint: "All fields are optional. Omit any field to use live/simulated data.",
      acceptedFields: {
        incidents: "array — override incident list",
        shelters:  "array — override shelter list",
        weather:   "object — override weather conditions { conditions: { rainfallMmPerHour, windSpeedKmh, ... } }",
      },
    });
  }

  try {
    const forecast = generateRiskForecast({
      incidents: body.incidents ?? incidents,
      shelters:  body.shelters  ?? shelters,
      weather:   body.weather   ?? undefined,
    });
    return res.json(forecast);
  } catch (error) {
    return next(error);
  }
}

/* ══════════════════════════════════════════════════════════════
   GET /api/risk-forecast/summary
   Lightweight endpoint — dashboard widgets, polling-friendly
══════════════════════════════════════════════════════════════ */

export function getRiskSummary(req, res, next) {
  try {
    const forecast = generateRiskForecast({
      incidents,
      shelters,
    });

    /* Return compact summary only */
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
