import { Router } from "express";
import { getIncidents, postIncidentAnalysis, postIncident, getAlerts } from "../controllers/incidentController.js";

const router = Router();

router.get("/incidents", getIncidents);
router.post("/incidents", postIncident);
router.post("/analyze-incident", postIncidentAnalysis);
router.get("/alerts", getAlerts);

export default router;
