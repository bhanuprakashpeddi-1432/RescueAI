import { Router } from "express";
import { getIncidents, postIncidentAnalysis } from "../controllers/incidentController.js";

const router = Router();

router.get("/incidents", getIncidents);
router.post("/analyze-incident", postIncidentAnalysis);

export default router;
