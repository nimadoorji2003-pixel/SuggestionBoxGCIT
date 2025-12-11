const express = require("express");
const {
  createFeedback,
  getMyFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  exportCSV,
  exportPDF,
} = require("../controllers/feedbackController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Student routes
router.post("/", protect, createFeedback);
router.get("/my", protect, getMyFeedback);

// Admin routes
router.get("/", protect, admin, getAllFeedback);
router.patch("/:id/status", protect, admin, updateFeedbackStatus);
router.get("/export/csv", protect, admin, exportCSV);
router.get("/export/pdf", protect, admin, exportPDF);

module.exports = router;
