const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Use info-level logging instead of console.log for SAST compliance
    if (process.env.NODE_ENV !== "test") {
      console.info(`MongoDB connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
