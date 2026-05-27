const alertScenarios = [
  {
    severity: "Critical",
    title: "Rapid river rise detected near occupied housing",
    location: "River Ward Sector 3",
    action: "Dispatch evacuation and water rescue teams",
  },
  {
    severity: "High",
    title: "Wildfire perimeter advanced toward access route",
    location: "Coastal Ridge Corridor",
    action: "Reroute responders and warn nearby shelters",
  },
  {
    severity: "Critical",
    title: "Multiple SOS signals reported after structure collapse",
    location: "Metro East Block 7",
    action: "Deploy search and rescue with medical support",
  },
  {
    severity: "High",
    title: "Emergency department intake threshold exceeded",
    location: "St. Helena Medical Center",
    action: "Coordinate patient diversion immediately",
  },
  {
    severity: "Medium",
    title: "Shelter supplies projected below safety threshold",
    location: "Horizon Community Hub",
    action: "Prioritize logistics replenishment",
  },
  {
    severity: "Info",
    title: "Drone survey confirms passable relief corridor",
    location: "Western Coastal Corridor",
    action: "Validate route before convoy deployment",
  },
];

let nextId = 1;

function createRandomAlert() {
  const source = alertScenarios[Math.floor(Math.random() * alertScenarios.length)];

  return {
    ...source,
    id: `SIM-${String(nextId++).padStart(4, "0")}`,
    createdAt: new Date().toISOString(),
    simulated: true,
  };
}

function nextDelay() {
  return 4000 + Math.floor(Math.random() * 4500);
}

export function startAlertSimulator(io) {
  let timeoutId;

  function broadcastAlert() {
    io.emit("emergency-alert", createRandomAlert());
    timeoutId = setTimeout(broadcastAlert, nextDelay());
  }

  timeoutId = setTimeout(broadcastAlert, 2000);

  return () => clearTimeout(timeoutId);
}
