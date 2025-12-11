const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // if anonymous, user may be null
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ["academics", "facilities", "events", "other"],
      default: "other",
    },
    message: {
      type: String,
      required: [true, "Feedback message is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "under_review", "addressed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
