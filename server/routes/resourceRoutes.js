import { Router } from "express";
import { hospitals, shelters, ambulanceTeams, computeSummary } from "../data/mockData.js";

const router = Router();

router.get("/hospitals", (req, res) => {
  const { status } = req.query;
  const data = status
    ? hospitals.filter(h => h.status === status.toLowerCase())
    : hospitals;
  res.json({ data, total: data.length, updatedAt: new Date().toISOString() });
});

router.get("/hospitals/:id", (req, res) => {
  const hospital = hospitals.find(h => h.id === req.params.id);
  if (!hospital) return res.status(404).json({ error: "Hospital not found." });
  return res.json(hospital);
});

router.get("/shelters", (req, res) => {
  const { status } = req.query;
  const data = status
    ? shelters.filter(s => s.status === status.toLowerCase())
    : shelters;
  res.json({ data, total: data.length, updatedAt: new Date().toISOString() });
});

router.get("/shelters/:id", (req, res) => {
  const shelter = shelters.find(s => s.id === req.params.id);
  if (!shelter) return res.status(404).json({ error: "Shelter not found." });
  return res.json(shelter);
});

router.get("/ambulances", (req, res) => {
  const { status } = req.query;
  const data = status
    ? ambulanceTeams.filter(a => a.status === status.toLowerCase())
    : ambulanceTeams;
  res.json({ data, total: data.length, updatedAt: new Date().toISOString() });
});

router.get("/ambulances/:id", (req, res) => {
  const ambulance = ambulanceTeams.find(a => a.id === req.params.id);
  if (!ambulance) return res.status(404).json({ error: "Ambulance unit not found." });
  return res.json(ambulance);
});

router.get("/summary", (req, res) => {
  res.json(computeSummary());
});

export default router;
