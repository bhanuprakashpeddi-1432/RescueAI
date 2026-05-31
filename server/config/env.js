import "dotenv/config";

function readPort(value) {
  const port = Number(value ?? 5000);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid TCP port number.");
  }

  return port;
}

export const env = {
  port: readPort(process.env.PORT),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  openRouterModel: process.env.OPENROUTER_MODEL ?? "meta-llama/llama-3.3-70b-instruct",
  mongoUri: process.env.MONGO_URI ?? "mongodb://localhost:27017/rescueai",
  nodeEnv: process.env.NODE_ENV ?? "development",
};
