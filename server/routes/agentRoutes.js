import { Router } from "express";
import { postAgentDispatch } from "../controllers/agentController.js";

const router = Router();

/**
 * POST /agent-dispatch
 *
 * Dispatches all four domain agents (Rescue, Medical, Logistics, Communication)
 * in parallel against the provided IncidentContext and returns a unified
 * AgentMissionBrief containing all recommendations and consolidated actions.
 *
 * Body: { incidentContext: IncidentContext }
 * Response: AgentMissionBrief
 */
router.post("/agent-dispatch", postAgentDispatch);

export default router;
