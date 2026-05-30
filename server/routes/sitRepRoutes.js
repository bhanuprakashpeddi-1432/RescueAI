import { Router } from "express";
import { getSitRep, postSitRep } from "../controllers/sitRepController.js";

const router = Router();

/**
 * GET /sitrep
 * Generate a professional Situation Report from all live operational data.
 * No body required. Pulls incidents, shelters, hospitals, and ambulances
 * from the live data store automatically.
 *
 * Response: SitRepOutput
 */
router.get("/sitrep", getSitRep);

/**
 * POST /sitrep
 * Generate a SitRep with optional data overrides.
 * Any field omitted falls back to live operational data.
 *
 * Body (all fields optional):
 *   { incidents?, hospitals?, shelters?, ambulances?, reportPeriod?, operationalArea? }
 *
 * Response: SitRepOutput
 */
router.post("/sitrep", postSitRep);

export default router;
