const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getActiveCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

// Students / any logged-in user – only active categories
router.get("/", protect, getActiveCategories);

// Admin – full list & CRUD
router.get("/all", protect, admin, getAllCategories);
router.post("/", protect, admin, createCategory);
router.put("/:id", protect, admin, updateCategory);
router.delete("/:id", protect, admin, deleteCategory);

module.exports = router;
