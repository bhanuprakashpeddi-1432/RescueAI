/**
 * RescueAI — Resource Allocation Controller
 * 
 * POST /api/resource-allocation
 * Calculates optimal resources for a provided incident, using live
 * hospital, shelter, and ambulance data.
 */

import { allocateResources } from "../services/resourceAllocationService.js";
import { incidents, hospitals, shelters, ambulanceTeams } from "../data/mockData.js";

export function postResourceAllocation(req, res, next) {
    const body = req.body ?? {};

    // Expecting either an incident ID or a full incident object
    let incident = null;

    if (body.incidentId) {
        incident = incidents.find(i => i.id === body.incidentId);
        if (!incident) {
             return res.status(404).json({ error: `Incident with ID ${body.incidentId} not found.` });
        }
    } else if (body.incident && body.incident.location) {
        incident = body.incident;
    } else {
         return res.status(400).json({ 
             error: "Request must include either a valid 'incidentId' or an 'incident' object with a 'location'.",
             example: { incidentId: "INC-2401" }
         });
    }

    try {
        const allocation = allocateResources({
            incident,
            hospitals: body.hospitals ?? hospitals,
            shelters: body.shelters ?? shelters,
            rescueTeams: body.rescueTeams ?? ambulanceTeams
        });

        return res.json(allocation);
    } catch (error) {
        return next(error);
    }
}
