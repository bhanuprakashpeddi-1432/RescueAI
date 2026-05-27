export function notFoundHandler(req, res) {
  res.status(404).json({
    error: "Route not found.",
    path: req.originalUrl,
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode ?? error.status ?? 500;
  const message =
    statusCode >= 500 && !error.statusCode ? "An unexpected server error occurred." : error.message;

  if (statusCode >= 500 && !error.statusCode) {
    console.error(error);
  }

  return res.status(statusCode).json({ error: message });
}
