import { Incident } from "../models/Incident.js";

export async function listIncidents({ severity, status } = {}) {
  const query = {};
  if (severity) query.severity = severity.toLowerCase();
  if (status) query.status = status.toLowerCase();

  return await Incident.find(query).sort({ createdAt: -1 });
}

export async function createIncidentSummary() {
  const incidents = await Incident.find({});
  return {
    total: incidents.length,
    active: incidents.filter((incident) => incident.status === "active").length,
    critical: incidents.filter((incident) => incident.severity === "critical").length,
    affectedPeople: incidents.reduce((total, incident) => total + (incident.affectedPeople || 0), 0),
  };
}

export async function createIncident(data) {
  const newIncident = new Incident({
    id: `INC-${Date.now()}`,
    ...data,
    status: 'active',
  });
  return await newIncident.save();
}
