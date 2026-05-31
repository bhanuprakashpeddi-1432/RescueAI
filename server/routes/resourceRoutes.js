import { Router } from "express";
import { Hospital } from "../models/Hospital.js";
import { Shelter } from "../models/Shelter.js";
import { Ambulance } from "../models/Ambulance.js";
import { Incident } from "../models/Incident.js";

const router = Router();

router.get("/hospitals", async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status: status.toLowerCase() } : {};
    const data = await Hospital.find(query);
    res.json({ data, total: data.length, updatedAt: new Date().toISOString() });
  } catch(e) { next(e); }
});

router.get("/hospitals/:id", async (req, res, next) => {
  try {
    const hospital = await Hospital.findOne({ id: req.params.id });
    if (!hospital) return res.status(404).json({ error: "Hospital not found." });
    return res.json(hospital);
  } catch(e) { next(e); }
});

router.get("/shelters", async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status: status.toLowerCase() } : {};
    const data = await Shelter.find(query);
    res.json({ data, total: data.length, updatedAt: new Date().toISOString() });
  } catch(e) { next(e); }
});

router.get("/shelters/:id", async (req, res, next) => {
  try {
    const shelter = await Shelter.findOne({ id: req.params.id });
    if (!shelter) return res.status(404).json({ error: "Shelter not found." });
    return res.json(shelter);
  } catch(e) { next(e); }
});

router.get("/ambulances", async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status: status.toLowerCase() } : {};
    const data = await Ambulance.find(query);
    res.json({ data, total: data.length, updatedAt: new Date().toISOString() });
  } catch(e) { next(e); }
});

router.get("/ambulances/:id", async (req, res, next) => {
  try {
    const ambulance = await Ambulance.findOne({ id: req.params.id });
    if (!ambulance) return res.status(404).json({ error: "Ambulance unit not found." });
    return res.json(ambulance);
  } catch(e) { next(e); }
});

router.get("/summary", async (req, res, next) => {
  try {
    const [incidents, shelters, hospitals, ambulances] = await Promise.all([
      Incident.find({}), Shelter.find({}), Hospital.find({}), Ambulance.find({})
    ]);

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

    res.json({
      incidents: {
        total: incidents.length,
        active: activeIncidents.length,
        critical: criticalIncidents.length,
        resolved: incidents.filter(i => i.status === "resolved").length,
      },
      casualties: { affected: totalAffected, displaced: totalDisplaced, injured: totalInjured, deceased: totalDeceased },
      shelters: {
        total: shelters.length, open: openShelters.length, full: shelters.filter(s => s.status === "full").length,
        totalCapacity: totalShelterCap, totalOccupancy: totalShelterOcc, availableBeds: totalShelterCap - totalShelterOcc,
        loadPercent: totalShelterCap > 0 ? Math.round((totalShelterOcc / totalShelterCap) * 100) : 0,
      },
      hospitals: { total: hospitals.length, critical: criticalHospitals.length, freeBeds: totalFreeBeds },
      ambulances: { total: ambulances.length, active: activeAmbulances.length, available: ambulances.filter(a => a.status === "available").length },
      generatedAt: new Date().toISOString(),
    });
  } catch(e) { next(e); }
});

export default router;
