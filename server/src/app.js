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

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://suggestionboxgcit.netlify.app/"],
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Healthcheck route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ✅ API routes – all of them go BEFORE error handlers
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/users", userRoutes);  // ⬅️ moved up here
app.use("/api/categories", categoryRoutes);

// ❗ Error handlers must be LAST
app.use(notFound);
app.use(errorHandler);

module.exports = app;
