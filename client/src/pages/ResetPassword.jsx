import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    if (!newPassword) {
      setError("New password is required");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await api.post("/api/auth/reset-password", {
        email,
        newPassword,
        confirmPassword,
      });
      setMsg(data.message);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card float-up">
        <h2 className="auth-title">Reset your password 🔑</h2>
        <p className="auth-subtitle">
          Choose a new password for your account. Make sure it&apos;s strong and
          unique.
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
              <label htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirm-password">Confirm password</label>
            <input
              id="confirm-password"
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="btn primary full-width"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Back to <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
