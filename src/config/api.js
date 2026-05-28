export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";

export const socketConfig = {
  url: import.meta.env.VITE_SOCKET_URL ?? window.location.origin,
  path: import.meta.env.VITE_SOCKET_PATH ?? "/socket.io",
};
