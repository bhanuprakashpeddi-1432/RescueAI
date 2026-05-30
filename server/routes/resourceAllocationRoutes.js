import { Router } from "express";
import { postResourceAllocation } from "../controllers/resourceAllocationController.js";

const router = Router();

/**
 * POST /resource-allocation
 * Calculate optimal resource allocation (hospitals, shelters, rescue teams)
 * for a specific incident based on geospatial distance, capacity, and capabilities.
 * 
 * Body: { incidentId: "INC-2401" } OR { incident: { location: { latitude, longitude }, severity: "...", ... } }
 * Optional Overrides: { hospitals: [], shelters: [], rescueTeams: [] }
 * 
 * Response: ResourceAllocation Output
 */
router.post("/resource-allocation", postResourceAllocation);

export default router;
