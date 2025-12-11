// server/src/controllers/userController.js
const User = require("../models/User");

// Optional: GET /api/users/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name && name.trim()) user.name = name.trim();
    if (email && email.trim()) user.email = email.trim().toLowerCase();

    await user.save();

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.json({
      message: "Profile updated successfully",
      user: safeUser,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
