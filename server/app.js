import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import chatRoutes from "./routes/chatRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";

const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin: env.clientOrigin,
  }),
);
app.use(express.json({ limit: "1mb" }));

function healthHandler(req, res) {
  res.json({
    status: "ok",
    service: "rescueai-api",
    openRouterConfigured: Boolean(env.openRouterApiKey),
  });
}

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);
app.use(incidentRoutes);
app.use(chatRoutes);
app.use(resourceRoutes);
app.use("/api", incidentRoutes);
app.use("/api", chatRoutes);
app.use("/api", resourceRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
