function requestLogger(req, res, next) {
  const enabled =
    process.env.NODE_ENV !== "production" || process.env.LOG_REQUESTS === "true";
  if (!enabled) return next();

  const start = Date.now();
  res.on("finish", () => {
    const elapsedMs = Date.now() - start;
    // Keep logs concise so debugging in hosted logs remains readable.
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${elapsedMs}ms`
    );
  });

  return next();
}

module.exports = { requestLogger };
