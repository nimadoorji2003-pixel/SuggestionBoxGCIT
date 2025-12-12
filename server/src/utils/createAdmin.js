const User = require("../models/User");

const createAdminIfNotExists = async () => {
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    // Use warn instead of console.log for SAST compliance
    console.warn(
      "No default admin credentials provided. Skipping auto-create."
    );
    return;
  }

  const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

  if (existingAdmin) {
    console.info("Admin already exists. Skipping creation.");
    return;
  }

  await User.create({
    name: "Super Admin",
    email: adminEmail.toLowerCase(),
    password: adminPassword, // plain, will be hashed by pre-save hook
    role: "admin",
  });

  console.info(`Super Admin created: ${adminEmail}`);
};

module.exports = createAdminIfNotExists;
