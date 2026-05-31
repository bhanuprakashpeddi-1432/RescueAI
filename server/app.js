import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";
import fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import chatRoutes from "./routes/chatRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import sitRepRoutes from "./routes/sitRepRoutes.js";
import riskPredictionRoutes from "./routes/riskPredictionRoutes.js";
import resourceAllocationRoutes from "./routes/resourceAllocationRoutes.js";
import broadcastGeneratorRoutes from "./routes/broadcastGeneratorRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.disable("x-powered-by");

// Security Middlewares
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

app.use(
  cors({
    origin: env.clientOrigin,
  }),
);
app.use(express.json({ limit: "1mb" }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api", apiLimiter);

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
app.use(agentRoutes);
app.use(sitRepRoutes);
app.use(riskPredictionRoutes);
app.use(resourceAllocationRoutes);
app.use("/api", incidentRoutes);
app.use("/api", chatRoutes);
app.use("/api", resourceRoutes);
app.use("/api", agentRoutes);
app.use("/api", sitRepRoutes);
app.use("/api", riskPredictionRoutes);
app.use("/api", resourceAllocationRoutes);
app.use("/api/broadcast", broadcastGeneratorRoutes);

// Serve frontend assets if built
const distPath = path.join(__dirname, "../dist");
const hasDist = fs.existsSync(distPath);

if (hasDist) {
  app.use(express.static(distPath));
  
  app.get("*", (req, res, next) => {
    // If it looks like an API route, pass it along so it gets a clean JSON 404
    if (req.path.startsWith("/api") || req.path.startsWith("/health")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  // Friendly API welcome page in dev/fallback mode
  app.get("/", (req, res) => {
    res.json({
      message: "RescueAI API is up and running!",
      health: "/health",
      frontendDevServer: "http://localhost:5173",
      note: "To serve the frontend static build from this API server, compile it first using 'npm run build'."
    });
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
