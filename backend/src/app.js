const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const { notFound } = require("./middleware/notFound");
const { requestLogger } = require("./middleware/requestLogger");

const app = express();
const isProduction = process.env.NODE_ENV === "production";
app.set("trust proxy", 1);

const configuredOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

const localDevOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "http://127.0.0.1:5176",
];

const allowedOrigins = [
  ...new Set([...configuredOrigins, ...(isProduction ? [] : localDevOrigins)]),
];
// Default to allowing Vercel/Render preview domains unless explicitly disabled.
const allowPreviewOrigins = !isProduction || process.env.ALLOW_PREVIEW_ORIGINS !== "false";

app.use(
  cors({
    origin(origin, callback) {
      const isPreviewOrigin =
        origin?.endsWith(".vercel.app") || origin?.endsWith(".onrender.com");

      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        (allowPreviewOrigins && isPreviewOrigin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(requestLogger);
app.use(express.json({ limit: "10mb" }));

app.get("/", (_req, res) => {
  res.json({
    service: "backend-api",
    status: "ok",
    health: "/api/health",
  });
});

app.get(["/favicon.ico", "/favicon.png"], (_req, res) => {
  res.status(204).end();
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

app.use(notFound);

app.use((err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid identifier";
  }
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(", ");
  }

  if (statusCode === 500 && process.env.NODE_ENV === "production") {
    message = "Server error";
  }

  res.status(statusCode).json({ message });
});

module.exports = app;
