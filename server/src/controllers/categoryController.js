const Category = require("../models/Category");

// Student / general use: get active categories only
exports.getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort("name");
    res.json(categories);
  } catch (err) {
    console.error("Get active categories error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: full list (including inactive)
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort("name");
    res.json(categories);
  } catch (err) {
    console.error("Get all categories error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: create
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existing = await Category.findOne({
      name: name.trim(),
    });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || "",
    });

    res.status(201).json(category);
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: update (name / description / isActive)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name && name.trim()) category.name = name.trim();
    if (description !== undefined) category.description = description.trim();
    if (typeof isActive === "boolean") category.isActive = isActive;

    await category.save();
    res.json(category);
  } catch (err) {
    console.error("Update category error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: delete (hard delete – you could also just set isActive=false)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.deleteOne();
    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ message: "Server error" });
  }
};