import app from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.port, () => {
  console.log(`RescueAI API running on http://localhost:${env.port}`);
});

function shutdown(signal) {
  console.log(`${signal} received. Closing RescueAI API.`);
  server.close(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
