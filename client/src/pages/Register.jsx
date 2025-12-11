import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await api.post("/api/auth/register", form);
      const { token, ...user } = data;
      login(user, token);
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card float-up">
        <h2 className="auth-title">Create your account 🎓</h2>
        <p className="auth-subtitle">
          Register as a student to submit secure suggestions.
        </p>

        {serverError && (
          <p className="auth-error auth-error-global">{serverError}</p>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? "input error" : "input"}
              placeholder="Thinley Yeshi"
            />
            {errors.name && <p className="auth-error">{errors.name}</p>}
          </div>

          <div className="auth-field">
            <label htmlFor="email">College email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? "input error" : "input"}
              placeholder="you@college.edu"
            />
            {errors.email && <p className="auth-error">{errors.email}</p>}
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? "input error" : "input"}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="auth-error">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn primary full-width"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Already registered? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
