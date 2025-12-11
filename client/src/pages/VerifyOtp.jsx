import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await api.post("/api/auth/verify-otp", { email, otp });
      setMsg(data.message);
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card float-up">
        <h2 className="auth-title">Verify OTP ✉️</h2>
        <p className="auth-subtitle">
          We&apos;ve sent a one-time password (OTP) to your email. Enter it
          below to continue.
        </p>

        {msg && (
          <p className="auth-error-global" style={{ color: "#bbf7d0", borderColor: "rgba(74, 222, 128, 0.7)", background: "rgba(22, 101, 52, 0.35)" }}>
            {msg}
          </p>
        )}
        {error && <p className="auth-error auth-error-global">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!location.state?.email && (
            <div className="auth-field">
              <label htmlFor="verify-email">Email</label>
              <input
                id="verify-email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="otp">OTP</label>
            <input
              id="otp"
              type="text"
              className="input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
            />
          </div>

          <button
            type="submit"
            className="btn primary full-width"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Didn’t get OTP? <Link to="/forgot-password">Request again</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
