const rateLimit = require("express-rate-limit");

const authWindowMs = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);
const authMax = Number(process.env.AUTH_RATE_LIMIT_MAX || 25);

const authLimiter = rateLimit({
  windowMs: Number.isFinite(authWindowMs) ? authWindowMs : 10 * 60 * 1000,
  max: Number.isFinite(authMax) ? authMax : 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication requests. Please try again later.",
  },
});

module.exports = { authLimiter };
