import { allocateResources } from "../services/resourceAllocationService.js";
import { Incident } from "../models/Incident.js";
import { Hospital } from "../models/Hospital.js";
import { Shelter } from "../models/Shelter.js";
import { Ambulance } from "../models/Ambulance.js";

export async function postResourceAllocation(req, res, next) {
    const body = req.body ?? {};
    let incident = null;

    try {
        if (body.incidentId) {
            incident = await Incident.findOne({ id: body.incidentId });
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

        const [hospitals, shelters, rescueTeams] = await Promise.all([
            Hospital.find({}),
            Shelter.find({}),
            Ambulance.find({})
        ]);

        const allocation = allocateResources({
            incident,
            hospitals: body.hospitals ?? hospitals,
            shelters: body.shelters ?? shelters,
            rescueTeams: body.rescueTeams ?? rescueTeams
        });

        return res.json(allocation);
    } catch (error) {
        return next(error);
    }
}
