import React, { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await api.post("/api/auth/forgot-password", { email });
      setMsg(data.message);
      // Go to OTP screen with email passed in state
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card float-up">
        <h2 className="auth-title">Forgot your password? 🔐</h2>
        <p className="auth-subtitle">
          Enter your email and we&apos;ll send a one-time password (OTP) to
          verify your identity.
        </p>

        {msg && (
          <p className="auth-error-global" style={{ color: "#bbf7d0", borderColor: "rgba(74, 222, 128, 0.7)", background: "rgba(22, 101, 52, 0.35)" }}>
            {msg}
          </p>
        )}
        {error && <p className="auth-error auth-error-global">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
            />
          </div>

          <button
            type="submit"
            className="btn primary full-width"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Remembered? <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
