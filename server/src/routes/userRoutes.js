// server/src/routes/userRoutes.js
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getMe, updateProfile } = require("../controllers/userController");

const router = express.Router();

// Optional: fetch current user profile
router.get("/me", protect, getMe);

// Update name/email of logged-in user
router.put("/profile", protect, updateProfile);

module.exports = router;
