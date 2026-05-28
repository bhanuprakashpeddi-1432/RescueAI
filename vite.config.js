import { defineConfig, createLogger } from "vite";
import react from "@vitejs/plugin-react";

// Create a custom logger that filters out benign proxy error messages.
// These fire when proxied connections close abruptly during HMR, page reload,
// or backend restart and are completely harmless.
const logger = createLogger();
const originalWarn = logger.warn.bind(logger);
const originalError = logger.error.bind(logger);

const NOISY_PROXY_PATTERNS = [
  "ws proxy socket error",
  "ws proxy error",
  "http proxy error",
];

function isNoisyProxyMessage(msg) {
  return NOISY_PROXY_PATTERNS.some((pattern) => msg.includes(pattern));
}

logger.warn = (msg, options) => {
  if (isNoisyProxyMessage(msg)) return;
  originalWarn(msg, options);
};
logger.error = (msg, options) => {
  if (isNoisyProxyMessage(msg)) return;
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
        configure: (proxy) => {
          proxy.on("error", (err) => {
            if (["ECONNRESET", "ECONNABORTED", "ECONNREFUSED", "EPIPE"].includes(err.code)) return;
            console.log("api proxy error", err);
          });
        },
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
