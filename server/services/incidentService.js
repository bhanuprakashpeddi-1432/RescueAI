import { incidents } from "../data/incidents.js";

export function listIncidents({ severity, status } = {}) {
  return incidents.filter((incident) => {
    const matchesSeverity = !severity || incident.severity === severity.toLowerCase();
    const matchesStatus = !status || incident.status === status.toLowerCase();

    return matchesSeverity && matchesStatus;
  });
}

export function createIncidentSummary() {
  return {
    total: incidents.length,
    active: incidents.filter((incident) => incident.status === "active").length,
    critical: incidents.filter((incident) => incident.severity === "critical").length,
    affectedPeople: incidents.reduce((total, incident) => total + incident.affectedPeople, 0),
  };
}
