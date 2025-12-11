import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import FeedbackForm from "../components/FeedbackForm";

const StudentDashboard = () => {
  const [myFeedback, setMyFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMyFeedback = async () => {
    try {
      setError("");
      const { data } = await api.get("/api/feedback/my");
      setMyFeedback(data);
    } catch (err) {
      console.error("Error loading my feedback", err);
      setError("Unable to load your feedback right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyFeedback();
  }, []);

  const stats = useMemo(() => {
    const total = myFeedback.length;
    const pending = myFeedback.filter((f) => f.status === "pending").length;
    const underReview = myFeedback.filter((f) => f.status === "under_review").length;
    const addressed = myFeedback.filter((f) => f.status === "addressed").length;
    return { total, pending, underReview, addressed };
  }, [myFeedback]);

  return (
    <div className="student-page fade-in">
      <header className="student-header">
        <div>
          <h2 className="student-title">Student Dashboard</h2>
          <p className="student-subtitle">
            Submit secure, anonymous suggestions and track their status over time.
          </p>
        </div>

        <div className="student-stats-row float-up">
          <div className="admin-stat-card">
            <span className="stat-label">Total sent</span>
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

      <main className="student-grid">
        {/* Left: Feedback form card */}
        <section className="student-card float-up">
          <div className="student-card-header">
            <h3>Submit new feedback</h3>
            <p className="student-muted">
              Your suggestion is securely stored. You can choose to stay anonymous.
            </p>
          </div>

          <FeedbackForm onSubmitted={loadMyFeedback} />
        </section>

        {/* Right: My feedback list */}
        <section className="student-card float-up">
          <div className="student-card-header">
            <h3>My feedback history</h3>
            <p className="student-muted">
              Only you and authorised admins can see this timeline.
            </p>
          </div>

          {loading ? (
            <p className="student-muted">Loading your feedback…</p>
          ) : error ? (
            <p className="student-error-text">{error}</p>
          ) : myFeedback.length === 0 ? (
            <p className="student-muted">
              You haven&apos;t submitted any feedback yet. Your first suggestion
              will appear here.
            </p>
          ) : (
            <ul className="student-feedback-list">
              {myFeedback.map((fb) => (
                <li key={fb._id} className="student-feedback-item">
                  <div className="feedback-main">
                    <div className="feedback-top-row">
                      <span className="feedback-category">
                        {fb.category || "general"}
                      </span>
                      <span className={`status-pill ${fb.status}`}>
                        {fb.status === "pending" && "Pending"}
                        {fb.status === "under_review" && "Under review"}
                        {fb.status === "addressed" && "Addressed"}
                      </span>
                    </div>
                    <p className="feedback-message">{fb.message}</p>
                  </div>
                  <div className="feedback-meta-row">
                    <span className="feedback-meta">
                      Submitted:{" "}
                      {fb.createdAt
                        ? new Date(fb.createdAt).toLocaleString()
                        : "N/A"}
                    </span>
                    {fb.isAnonymous ? (
                      <span className="feedback-meta">Anonymous</span>
                    ) : (
                      <span className="feedback-meta">Linked to your account</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
