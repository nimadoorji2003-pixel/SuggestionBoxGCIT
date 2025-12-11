const express = require("express");
const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
  changePassword,
  createAdmin,
} = require("../controllers/authController");
const { getSystemHealth } = require("../controllers/systemController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Auth
router.post("/register", registerUser);
router.post("/login", loginUser);

// Forgot password flow
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

// Change password (logged-in user)
router.post("/change-password", protect, changePassword);

// Admin: create another admin
router.post("/create-admin", protect, admin, createAdmin);

// Admin: system health (protected)
router.get("/health", protect, admin, getSystemHealth);

module.exports = router;
