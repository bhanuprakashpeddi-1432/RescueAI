import { generateBroadcasts } from "../services/broadcastGeneratorService.js";

export async function createBroadcasts(req, res) {
  try {
    const { incidentDetails, severity, location, affectedPopulation } = req.body;

    if (!incidentDetails || !severity || !location) {
      return res.status(400).json({
        error: "Missing required fields: incidentDetails, severity, location",
      });
    }

    const broadcasts = await generateBroadcasts({
      incidentDetails,
      severity,
      location,
      affectedPopulation: affectedPopulation || "Unknown",
    });

    res.json(broadcasts);
  } catch (error) {
    console.error("Broadcast Generation Error:", error.message);
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
}
