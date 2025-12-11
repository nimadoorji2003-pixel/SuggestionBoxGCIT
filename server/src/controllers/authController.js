const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

// In-memory OTP request tracker to avoid spam
const otpRequestTracker = {};
const OTP_REQUEST_LIMIT = 5;          // max OTP requests per email per runtime
const OTP_LOCK_TIME = 15 * 60 * 1000; // 15 minutes lock

// ======================================================
// 👤 REGISTER
// ======================================================
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: role || "student",
    });

    const token = generateToken(user);

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// 🔑 LOGIN
// ======================================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// 🔐 FORGOT PASSWORD – send OTP
// ======================================================
const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email || email.trim() === "") {
      return res.status(400).json({ message: "Invalid request" });
    }

    email = email.trim().toLowerCase();
    const now = Date.now();

    // Initialize tracker
    if (!otpRequestTracker[email]) {
      otpRequestTracker[email] = { count: 0, lockUntil: 0 };
    }

    // Check lockout
    if (now < otpRequestTracker[email].lockUntil) {
      return res.status(429).json({
        message: "Too many OTP requests. Try again later.",
      });
    }

    const user = await User.findOne({ email });

    // Generic response (don't reveal if user exists)
    const genericResponse = {
      message: "If this email is registered, an OTP has been sent.",
    };

    if (!user) {
      // Still respond generically
      return res.status(200).json(genericResponse);
    }

    // If a valid OTP already exists, don't resend
    if (user.resetOTPExpiry && user.resetOTPExpiry > new Date()) {
      return res.status(200).json(genericResponse);
    }

    // Increment OTP request count
    otpRequestTracker[email].count += 1;

    if (otpRequestTracker[email].count >= OTP_REQUEST_LIMIT) {
      otpRequestTracker[email].lockUntil = now + OTP_LOCK_TIME;
      return res.status(429).json({
        message: "Too many OTP requests. Try again later.",
      });
    }

    // Generate 6-digit OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Hash OTP before saving
    const hashedOtp = await bcrypt.hash(rawOtp, 10);

    user.resetOTP = hashedOtp;
    user.resetOTPExpiry = expiry;
    user.isOTPVerified = false;
    await user.save();

    // Email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 15px; background-color: #f9f9f9;">
        <div style="max-width: 500px; margin: auto; background: white; border-radius: 8px; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #006600;">Password Reset OTP</h2>
          <p>Dear ${user.name || "user"},</p>
          <p>You requested to reset your password for the suggestion box system. Use the OTP below:</p>

          <h1 style="color: #333; text-align:center; letter-spacing: 5px;">
            ${rawOtp}
          </h1>

          <p>This OTP will expire in <strong>5 minutes</strong>.</p>

          <p style="margin-top: 20px;">
            Best Regards,<br>
            <strong>Suggestion Box System</strong>
          </p>
        </div>
      </div>
    `;

    await sendEmail(user.email, "Password Reset OTP", htmlContent);

    return res.status(200).json(genericResponse);
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// ======================================================
// ✅ VERIFY OTP
// ======================================================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: "Invalid OTP or email" });
    }

    if (!user.resetOTP || user.resetOTPExpiry < new Date()) {
      return res
        .status(400)
        .json({ message: "OTP expired or not generated" });
    }

    // compare hashed OTP
    const isValidOtp = await bcrypt.compare(otp, user.resetOTP);
    if (!isValidOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isOTPVerified = true;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// 🔁 RESET PASSWORD (after OTP verified)
// ======================================================
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (
      !user.isOTPVerified ||
      !user.resetOTPExpiry ||
      user.resetOTPExpiry < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "OTP not verified or has expired" });
    }

    // new password will be hashed by pre-save hook
    user.password = newPassword;
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    user.isOTPVerified = false;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// 🔐 CHANGE PASSWORD (JWT Protected)
// ======================================================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const createAdmin = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "Admin already exists" });
      }
  
      const admin = await User.create({
        name,
        email: email.trim().toLowerCase(),
        password,
        role: "admin",
      });
  
      return res.status(201).json({
        message: "Admin account created successfully",
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
        },
      });
  
    } catch (err) {
      console.error("Create Admin Error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
  changePassword,
  createAdmin,
};
