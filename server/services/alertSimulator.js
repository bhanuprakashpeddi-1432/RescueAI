import { alertScenarios } from "../data/mockData.js";

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
  // Random interval between 4.5 s and 10 s for realistic pacing
  return 4500 + Math.floor(Math.random() * 5500);
}

export function startAlertSimulator(io) {
  let timeoutId;

  function broadcastAlert() {
    io.emit("emergency-alert", createRandomAlert());
    timeoutId = setTimeout(broadcastAlert, nextDelay());
  }

  // First alert arrives after 2 s so the UI sees it quickly on connect
  timeoutId = setTimeout(broadcastAlert, 2000);

  return () => clearTimeout(timeoutId);
}
