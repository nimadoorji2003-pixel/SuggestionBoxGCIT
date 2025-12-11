import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="landing-root centered fade-in">
      <div className="landing-hero-card">
        <span className="landing-badge">DevSecOps · Secure · Anonymous</span>

        <h1 className="landing-title">
          Secure Suggestion Box for <span>Modern Colleges</span>
        </h1>

        <p className="landing-subtitle">
          Collect honest, anonymous feedback from students and staff with
          built-in security, auditability, and admin controls.
        </p>

        <div className="landing-actions">
          <Link to="/login" className="btn primary">
            Login
          </Link>

          <Link to="/register" className="btn ghost">
            Register as Student
          </Link>
        </div>

        <div className="landing-meta">
          <p>🔐 End-to-end protected · 🧾 Report Exports · 📬 Email Alerts</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
