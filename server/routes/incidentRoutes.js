import { Router } from "express";
import { getIncidents, postIncidentAnalysis, postIncident } from "../controllers/incidentController.js";

const router = Router();

router.get("/incidents", getIncidents);
router.post("/incidents", postIncident);
router.post("/analyze-incident", postIncidentAnalysis);

export default router;
