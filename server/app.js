import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import chatRoutes from "./routes/chatRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";

const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin: env.clientOrigin,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "rescueai-api",
    openAiConfigured: Boolean(env.openAiApiKey),
  });
});

app.use(incidentRoutes);
app.use(chatRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
