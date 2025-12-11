// client/src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const AdminDashboard = () => {
  const [feedback, setFeedback] = useState([]);
  const [health, setHealth] = useState(null);

  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [loadingHealth, setLoadingHealth] = useState(true);

  const [feedbackError, setFeedbackError] = useState("");
  const [healthError, setHealthError] = useState("");

  // Category management state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");

  // ---------- LOADERS ----------

  const loadFeedback = async () => {
    try {
      setFeedbackError("");
      const { data } = await api.get("/api/feedback"); // admin endpoint
      setFeedback(data);
    } catch (err) {
      console.error("Error loading feedback", err);
      setFeedbackError("Unable to load feedback at the moment.");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const loadHealth = async () => {
    try {
      setHealthError("");
      const { data } = await api.get("/api/auth/health");
      setHealth(data);
    } catch (err) {
      console.error("Error loading health", err);
      setHealthError("Unable to load system health.");
    } finally {
      setLoadingHealth(false);
    }
  };

  const loadCategories = async () => {
    try {
      setCategoryError("");
      const { data } = await api.get("/api/categories/all"); // admin list
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories", err);
      setCategoryError("Unable to load categories.");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    loadFeedback();
    loadHealth();
    loadCategories();
  }, []);

  // ---------- FEEDBACK ACTIONS ----------

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/feedback/${id}/status`, { status });
      await loadFeedback();
    } catch (err) {
      console.error("Error updating status", err);
      alert("Could not update status. Please try again.");
    }
  };

  const downloadCSV = async () => {
    try {
      const res = await api.get("/api/feedback/export/csv", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "feedback_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading CSV", err);
      alert("Could not download CSV report.");
    }
  };

  const downloadPDF = async () => {
    try {
      const res = await api.get("/api/feedback/export/pdf", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "feedback_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading PDF", err);
      alert("Could not download PDF report.");
    }
  };

  // ---------- CATEGORY ACTIONS ----------

  const createCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const { data } = await api.post("/api/categories", {
        name: newCategoryName,
        description: newCategoryDesc,
      });
      setCategories((prev) => [...prev, data]);
      setNewCategoryName("");
      setNewCategoryDesc("");
    } catch (err) {
      console.error("Error creating category", err);
      alert(err.response?.data?.message || "Could not create category.");
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category? This cannot be undone.")) return;
    try {
      await api.delete(`/api/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Error deleting category", err);
      alert("Could not delete category.");
    }
  };

  // ---------- DERIVED STATS ----------

  const stats = useMemo(() => {
    const total = feedback.length;
    const pending = feedback.filter((f) => f.status === "pending").length;
    const underReview = feedback.filter((f) => f.status === "under_review").length;
    const addressed = feedback.filter((f) => f.status === "addressed").length;
    return { total, pending, underReview, addressed };
  }, [feedback]);

  const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return "-";
    const s = Math.floor(seconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const rem = s % 60;
    return `${h}h ${m}m ${rem}s`;
  };

  // ---------- RENDER ----------

  return (
    <div className="admin-page fade-in">
      <header className="admin-header">
        <div>
          <h2 className="admin-title">Admin Dashboard</h2>
          <p className="admin-subtitle">
            Monitor system health, manage categories, review feedback, and export reports.
          </p>
        </div>

        <div className="admin-stats-row float-up">
          <div className="admin-stat-card">
            <span className="stat-label">Total</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Pending</span>
            <span className="stat-value stat-pending">{stats.pending}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Under review</span>
            <span className="stat-value stat-review">{stats.underReview}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Addressed</span>
            <span className="stat-value stat-addressed">{stats.addressed}</span>
          </div>
        </div>
      </header>

      <main className="admin-grid">
        {/* System Health Card */}
        <section className="admin-card float-up">
          <div className="admin-card-header">
            <h3>System health</h3>
            <span
              className={`health-chip ${
                health?.status === "ok" && !healthError ? "ok" : "down"
              }`}
            >
              {loadingHealth
                ? "Checking..."
                : healthError
                ? "Unavailable"
                : health?.status === "ok"
                ? "Healthy"
                : "Issue"}
            </span>
          </div>

          {loadingHealth ? (
            <p className="admin-muted">Loading health data…</p>
          ) : healthError ? (
            <p className="admin-error-text">{healthError}</p>
          ) : health ? (
            <div className="health-grid">
              <div className="health-item">
                <span className="health-label">Status</span>
                <span className="health-value">
                  {health.status || "unknown"}
                </span>
              </div>
              <div className="health-item">
                <span className="health-label">Uptime</span>
                <span className="health-value">
                  {formatUptime(health.uptime)}
                </span>
              </div>
              <div className="health-item">
                <span className="health-label">Timestamp</span>
                <span className="health-value small">
                  {health.timestamp}
                </span>
              </div>
              <div className="health-item">
                <span className="health-label">RSS memory</span>
                <span className="health-value small">
                  {health.memory?.rss
                    ? `${Math.round(health.memory.rss / (1024 * 1024))} MB`
                    : "-"}
                </span>
              </div>
            </div>
          ) : (
            <p className="admin-muted">No health data available.</p>
          )}
        </section>

        {/* Reports card */}
        <section className="admin-card float-up">
          <div className="admin-card-header">
            <h3>Feedback reports</h3>
            <p className="admin-muted">
              Export anonymised data for management meetings or audits.
            </p>
          </div>
          <div className="admin-actions-row">
            <button onClick={downloadCSV} className="btn ghost full-width">
              🧾 Download CSV
            </button>
            <button onClick={downloadPDF} className="btn primary full-width">
              📄 Download PDF
            </button>
          </div>
        </section>

        {/* Category management card */}
        <section className="admin-card admin-feedback-card float-up">
          <div className="admin-card-header">
            <h3>Manage categories</h3>
            <p className="admin-muted">
              Add or remove the categories students can choose when submitting feedback.
            </p>
          </div>

          <form onSubmit={createCategory} className="admin-category-form">
            <div className="admin-category-fields">
              <input
                className="input"
                placeholder="New category name (e.g. Academics)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <input
                className="input"
                placeholder="Optional description"
                value={newCategoryDesc}
                onChange={(e) => setNewCategoryDesc(e.target.value)}
              />
            </div>
            <button type="submit" className="btn primary full-width">
              Add category
            </button>
          </form>

          <div className="admin-category-list">
            {loadingCategories ? (
              <p className="admin-muted">Loading categories…</p>
            ) : categoryError ? (
              <p className="admin-error-text">{categoryError}</p>
            ) : categories.length === 0 ? (
              <p className="admin-muted">No categories defined yet.</p>
            ) : (
              <ul>
                {categories.map((cat) => (
                  <li key={cat._id} className="admin-category-item">
                    <div>
                      <strong>{cat.name}</strong>
                      {cat.description && (
                        <span className="admin-muted">
                          {" "}
                          — {cat.description}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn ghost small"
                      onClick={() => deleteCategory(cat._id)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Feedback table */}
        <section className="admin-card admin-feedback-card float-up">
          <div className="admin-card-header">
            <h3>All feedback</h3>
            <p className="admin-muted">
              Review, triage and update the status of each suggestion.
            </p>
          </div>

          {loadingFeedback ? (
            <p className="admin-muted">Loading feedback…</p>
          ) : feedbackError ? (
            <p className="admin-error-text">{feedbackError}</p>
          ) : feedback.length === 0 ? (
            <p className="admin-muted">No feedback submitted yet.</p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Message</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Update status</th>
                  </tr>
                </thead>
                <tbody>
                  {feedback.map((fb) => (
                    <tr key={fb._id}>
                      <td>{fb.message}</td>
                      <td>{fb.category}</td>
                      <td>
                        <span className={`status-pill ${fb.status}`}>
                          {fb.status === "pending" && "Pending"}
                          {fb.status === "under_review" && "Under review"}
                          {fb.status === "addressed" && "Addressed"}
                        </span>
                      </td>
                      <td>{fb.user?.name || "Anonymous"}</td>
                      <td>{fb.user?.email || "N/A"}</td>
                      <td>
                        <select
                          className="status-select"
                          value={fb.status}
                          onChange={(e) =>
                            updateStatus(fb._id, e.target.value)
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="under_review">Under review</option>
                          <option value="addressed">Addressed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
