import { Router } from "express";
import {
  getRiskForecast,
  postRiskForecast,
  getRiskSummary,
} from "../controllers/riskPredictionController.js";

const router = Router();

/**
 * GET /risk-forecast
 * Generate a full risk forecast from all live operational data.
 * No body required. Uses current incidents, shelters, and simulated weather.
 *
 * Response: RiskForecast
 */
router.get("/risk-forecast", getRiskForecast);

/**
 * POST /risk-forecast
 * Generate forecast with optional data overrides.
 *
 * Body (all fields optional):
 *   { incidents?, shelters?, weather? }
 *
 * Response: RiskForecast
 */
router.post("/risk-forecast", postRiskForecast);

/**
 * GET /risk-forecast/summary
 * Lightweight summary for dashboard widgets and polling.
 * Returns: overallRisk, top 3 predictions, immediate actions, shelter load.
 */
router.get("/risk-forecast/summary", getRiskSummary);

export default router;
