import { alertScenarios } from "../data/mockData.js";
import { Alert } from "../models/Alert.js";

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
  return 4500 + Math.floor(Math.random() * 5500);
}

export function startAlertSimulator(io) {
  let timeoutId;

  async function broadcastAlert() {
    const alertData = createRandomAlert();
    try {
      await Alert.create(alertData);
    } catch (error) {
      console.error("Failed to save simulated alert to DB:", error.message);
    }
    io.emit("emergency-alert", alertData);
    timeoutId = setTimeout(broadcastAlert, nextDelay());
  }

  timeoutId = setTimeout(broadcastAlert, 2000);

  return () => clearTimeout(timeoutId);
}
