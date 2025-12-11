const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// ---------------- CORS CONFIG ----------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://suggestionboxgcit.netlify.app", // ✅ no trailing slash
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight for all routes
app.options("*", cors());

// ---------------- GENERAL MIDDLEWARES ----------------
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// ---------------- HEALTH / ROOT ROUTES ----------------

// Root route (useful for Render healthcheck & quick sanity check)
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Suggestion Box API is running ✅",
    timestamp: new Date().toISOString(),
  });
});

// API healthcheck route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ---------------- API ROUTES ----------------
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);

// ---------------- ERROR HANDLERS (MUST BE LAST) ----------------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
