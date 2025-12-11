const Feedback = require("../models/Feedback");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const sendEmail = require("../utils/sendEmail");

// Helper: notify admins when new feedback is submitted
const notifyAdminsOnNewFeedback = async (feedback, user) => {
  try {
    // You can set this in .env like:
    // ADMIN_NOTIFICATION_EMAILS=admin1@example.com,admin2@example.com
    const adminList =
      process.env.ADMIN_NOTIFICATION_EMAILS ||
      process.env.DEFAULT_ADMIN_EMAIL || // fallback: super admin
      process.env.EMAIL_USER; // ultimate fallback: your own email

    if (!adminList) return;

    const adminEmails = adminList.split(",").map((e) => e.trim()).filter(Boolean);

    if (adminEmails.length === 0) return;

    const html = `
      <h2>New Feedback Submitted</h2>
      <p><strong>Message:</strong> ${feedback.message}</p>
      <p><strong>Category:</strong> ${feedback.category}</p>
      <p><strong>Status:</strong> ${feedback.status}</p>
      <p><strong>Anonymous:</strong> ${feedback.isAnonymous ? "Yes" : "No"}</p>
      ${
        !feedback.isAnonymous && user
          ? `<p><strong>Submitted By:</strong> ${user.name} (${user.email})</p>`
          : `<p><strong>Submitted By:</strong> Anonymous</p>`
      }
      <p><strong>Date:</strong> ${feedback.createdAt}</p>
    `;

    await Promise.all(
      adminEmails.map((email) =>
        sendEmail(email, "New Feedback Submitted", html)
      )
    );
  } catch (err) {
    console.error("Notification error (new feedback):", err.message);
  }
};

const createFeedback = async (req, res) => {
  try {
    const { category, message, isAnonymous } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Feedback message is required" });
    }

    const feedback = await Feedback.create({
      user: isAnonymous ? null : req.user._id,
      isAnonymous: !!isAnonymous,
      category: category || "other",
      message,
    });

    // Try to populate user for email notification (optional)
    let user = null;
    if (!feedback.isAnonymous && req.user) {
      user = { name: req.user.name, email: req.user.email };
    }

    // Fire-and-forget admin notification (no need to await for response)
    notifyAdminsOnNewFeedback(feedback, user).catch(() => {});

    return res.status(201).json(feedback);
  } catch (error) {
    console.error("Create feedback error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json(feedback);
  } catch (error) {
    console.error("Get my feedback error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    return res.json(feedback);
  } catch (error) {
    console.error("Get all feedback error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    feedback.status = status || feedback.status;
    await feedback.save();

    return res.json(feedback);
  } catch (error) {
    console.error("Update feedback status error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const exportCSV = async (req, res) => {
  try {
    const feedback = await Feedback.find().populate("user", "name email");

    const fields = [
      { label: "Message", value: "message" },
      { label: "Category", value: "category" },
      { label: "Status", value: "status" },
      { label: "User Name", value: "user.name" },
      { label: "User Email", value: "user.email" },
      { label: "Created At", value: "createdAt" },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(feedback);

    res.header("Content-Type", "text/csv");
    res.attachment("feedback_report.csv");
    res.send(csv);
  } catch (err) {
    console.error("Export CSV error:", err);
    res
      .status(500)
      .json({ message: "Error exporting CSV", error: err.message });
  }
};

const exportPDF = async (req, res) => {
  try {
    const feedback = await Feedback.find().populate("user", "name email");

    const doc = new PDFDocument();
    const filename = "feedback_report.pdf";

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    doc.fontSize(20).text("Feedback Report", { underline: true });
    doc.moveDown();

    feedback.forEach((fb) => {
      doc.fontSize(12).text(`Message: ${fb.message}`);
      doc.text(`Category: ${fb.category}`);
      doc.text(`Status: ${fb.status}`);
      doc.text(`User: ${fb.user?.name || "Anonymous"}`);
      doc.text(`Email: ${fb.user?.email || "N/A"}`);
      doc.text(`Date: ${fb.createdAt}`);
      doc.moveDown();
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error("Export PDF error:", err);
    res
      .status(500)
      .json({ message: "Error exporting PDF", error: err.message });
  }
};

module.exports = {
  createFeedback,
  getMyFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  exportCSV,
  exportPDF,
};
