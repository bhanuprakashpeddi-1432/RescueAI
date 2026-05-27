import { createServer } from "node:http";
import { Server } from "socket.io";
import app from "./app.js";
import { env } from "./config/env.js";
import { startAlertSimulator } from "./services/alertSimulator.js";

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.clientOrigin,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.emit("alert-stream-status", {
    connected: true,
    message: "Connected to RescueAI simulated emergency alert stream.",
  });
});

const stopAlertSimulator = startAlertSimulator(io);

server.listen(env.port, () => {
  console.log(`RescueAI API running on http://localhost:${env.port}`);
  console.log("Simulated real-time alert stream active.");
});

function shutdown(signal) {
  console.log(`${signal} received. Closing RescueAI API.`);
  stopAlertSimulator();
  io.close(() => server.close(() => process.exit(0)));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
