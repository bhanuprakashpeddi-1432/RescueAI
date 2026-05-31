import { generateSitRep } from "../services/sitRepService.js";
import { Incident } from "../models/Incident.js";
import { Hospital } from "../models/Hospital.js";
import { Shelter } from "../models/Shelter.js";
import { Ambulance } from "../models/Ambulance.js";

async function computeSummary(incidents, shelters, hospitals, ambulances) {
  const activeIncidents = incidents.filter(i => i.status === "active");
  const totalAffected = incidents.reduce((s, i) => s + (i.affectedPeople || 0), 0);
  const totalDisplaced = incidents.reduce((s, i) => s + (i.displaced || 0), 0);
  const totalInjured = incidents.filter(i => i.status !== "resolved").reduce((s, i) => s + (i.injured || 0), 0);
  const totalDeceased = incidents.reduce((s, i) => s + (i.deceased || 0), 0);
  const criticalIncidents = incidents.filter(i => i.severity === "critical" && i.status === "active");

  const openShelters = shelters.filter(s => s.status === "open");
  const totalShelterCap = shelters.reduce((s, sh) => s + (sh.totalCapacity || 0), 0);
  const totalShelterOcc = shelters.reduce((s, sh) => s + (sh.currentOccupancy || 0), 0);

  const criticalHospitals = hospitals.filter(h => h.operationalLoad >= 90);
  const totalFreeBeds = hospitals.reduce((s, h) => s + (h.freeBeds || 0), 0);

  const activeAmbulances = ambulances.filter(a => ["dispatched","on-scene","transporting","airborne"].includes(a.status));

  return {
    incidents: { total: incidents.length, active: activeIncidents.length, critical: criticalIncidents.length, resolved: incidents.filter(i => i.status === "resolved").length },
    casualties: { affected: totalAffected, displaced: totalDisplaced, injured: totalInjured, deceased: totalDeceased },
    shelters: { total: shelters.length, open: openShelters.length, full: shelters.filter(s => s.status === "full").length, totalCapacity: totalShelterCap, totalOccupancy: totalShelterOcc, availableBeds: totalShelterCap - totalShelterOcc, loadPercent: totalShelterCap > 0 ? Math.round((totalShelterOcc / totalShelterCap) * 100) : 0 },
    hospitals: { total: hospitals.length, critical: criticalHospitals.length, freeBeds: totalFreeBeds },
    ambulances: { total: ambulances.length, active: activeAmbulances.length, available: ambulances.filter(a => a.status === "available").length },
    generatedAt: new Date().toISOString(),
  };
}

async function assembleLiveData(overrides = {}) {
  const [dbIncidents, dbHospitals, dbShelters, dbAmbulances] = await Promise.all([
    Incident.find({}), Hospital.find({}), Shelter.find({}), Ambulance.find({})
  ]);

  const incidents = overrides.incidents ?? dbIncidents;
  const hospitals = overrides.hospitals ?? dbHospitals;
  const shelters = overrides.shelters ?? dbShelters;
  const ambulances = overrides.ambulances ?? dbAmbulances;

  return {
    incidents,
    hospitals,
    shelters,
    ambulances,
    summary: await computeSummary(incidents, shelters, hospitals, ambulances),
    reportPeriod: overrides.reportPeriod ?? null,
    operationalArea: overrides.operationalArea ?? null,
  };
}

function validateOverrides(body) {
  const errors = [];
  if (body.incidents !== undefined && !Array.isArray(body.incidents)) errors.push("incidents must be an array if provided.");
  if (body.hospitals !== undefined && !Array.isArray(body.hospitals)) errors.push("hospitals must be an array if provided.");
  if (body.shelters !== undefined && !Array.isArray(body.shelters)) errors.push("shelters must be an array if provided.");
  if (body.ambulances !== undefined && !Array.isArray(body.ambulances)) errors.push("ambulances must be an array if provided.");
  if (body.reportPeriod !== undefined && typeof body.reportPeriod !== "string") errors.push("reportPeriod must be a string.");
  if (body.operationalArea !== undefined && typeof body.operationalArea !== "string") errors.push("operationalArea must be a string.");
  return errors;
}

export async function getSitRep(req, res, next) {
  try {
    const data = await assembleLiveData();
    const sitRep = await generateSitRep(data);
    return res.json(sitRep);
  } catch (error) {
    return next(error);
  }
}

export async function postSitRep(req, res, next) {
  const body = req.body ?? {};
  const errors = validateOverrides(body);
  if (errors.length > 0) return res.status(400).json({ error: "Invalid request body.", details: errors });

  try {
    const data = await assembleLiveData(body);
    const sitRep = await generateSitRep(data);
    return res.json(sitRep);
  } catch (error) {
    return next(error);
  }
}
