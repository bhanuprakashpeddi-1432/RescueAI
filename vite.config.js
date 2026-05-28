import { defineConfig, createLogger } from "vite";
import react from "@vitejs/plugin-react";

// Create a custom logger that filters out the benign "ws proxy socket error"
// messages. These fire when a proxied WebSocket (socket.io) closes abruptly
// during HMR or page reload and are completely harmless.
const logger = createLogger();
const originalWarn = logger.warn.bind(logger);
const originalError = logger.error.bind(logger);

logger.warn = (msg, options) => {
  if (msg.includes("ws proxy socket error")) return;
  originalWarn(msg, options);
};
logger.error = (msg, options) => {
  if (msg.includes("ws proxy socket error")) return;
  originalError(msg, options);
};

export default defineConfig({
  plugins: [react()],
  customLogger: logger,
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:5000",
        changeOrigin: true,
        ws: true,
        configure: (proxy, _options) => {
          // Suppress benign proxy-level errors (connection resets during reload / HMR)
          proxy.on("error", (err, _req, _res) => {
            if (
              err.code !== "ECONNRESET" &&
              err.code !== "ECONNABORTED" &&
              err.code !== "ECONNREFUSED" &&
              err.code !== "EPIPE"
            ) {
              console.log("proxy error", err);
            }
          });
          proxy.on("proxyReqWs", (proxyReq, req, socket, options, head) => {
            socket.on("error", (err) => {
              if (
                err.code !== "ECONNRESET" &&
                err.code !== "ECONNABORTED" &&
                err.code !== "EPIPE"
              ) {
                console.error("ws client socket error", err);
              }
            });
          });
          proxy.on("open", (proxySocket) => {
            proxySocket.on("error", (err) => {
              if (
                err.code !== "ECONNRESET" &&
                err.code !== "ECONNABORTED" &&
                err.code !== "EPIPE"
              ) {
                console.error("ws target socket error", err);
              }
            });
          });
        },
      },
    },
  },
});
