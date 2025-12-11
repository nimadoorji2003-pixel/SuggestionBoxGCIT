import React, { useState } from "react";
import api from "../api/axios";

const FeedbackForm = ({ onSubmitted }) => {
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("other");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!message.trim()) {
      return "Please enter your feedback message.";
    }
    if (message.trim().length < 10) {
      return "Feedback should be at least 10 characters.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await api.post("/api/feedback", {
        message: message.trim(),
        category,
        isAnonymous,
      });

      setMsg("Feedback submitted securely. Thank you! 🎉");
      setMessage("");
      setCategory("other");
      setIsAnonymous(false);

      if (onSubmitted) onSubmitted(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-form-root">
      <h3 className="feedback-title">Submit feedback</h3>

      {msg && (
        <p className="feedback-alert success">
          {msg}
        </p>
      )}

      {error && (
        <p className="feedback-alert error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="feedback-field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input"
          >
            <option value="academics">Academics</option>
            <option value="facilities">Facilities</option>
            <option value="events">Events</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="feedback-field">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input feedback-textarea"
            placeholder="Share your suggestion, issue, or idea..."
          />
        </div>

        <div className="feedback-field feedback-checkbox">
          <label>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />{" "}
            Submit anonymously
          </label>
          <span className="feedback-hint">
            When checked, your identity will not be shown to admins.
          </span>
        </div>

        <button
          type="submit"
          className="btn primary full-width"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send feedback"}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
