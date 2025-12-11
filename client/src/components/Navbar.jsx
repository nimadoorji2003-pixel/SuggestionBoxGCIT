import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfilePopup from "./ProfilePopup";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <nav className="nav-container">
        <div className="nav-left">

          {/* ADMIN VIEW – only Admin Dashboard */}
          {user && user.role === "admin" && (
            <Link to="/admin" className="nav-link">
              Admin Dashboard
            </Link>
          )}

          {/* STUDENT VIEW – only Student Dashboard */}
          {user && user.role === "student" && (
            <Link to="/dashboard" className="nav-link">
              My Dashboard
            </Link>
          )}
        </div>

        <div className="nav-right">
          {user ? (
            <>
              {/* Profile Icon */}
              <div
                className="profile-avatar"
                onClick={() => setShowProfile(true)}
                title="View profile"
              >
                {user.name?.charAt(0).toUpperCase()}
              </div>

              <button className="nav-button" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </div>
      </nav>

      {showProfile && <ProfilePopup onClose={() => setShowProfile(false)} />}
    </>
  );
};

export default Navbar;
