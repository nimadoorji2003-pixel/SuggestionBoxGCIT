import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const ProfilePopup = ({ onClose }) => {
  const { user, login } = useAuth();

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // --- helpers ---
  const isValidEmail = (value) =>
    /^\S+@\S+\.\S+$/.test(value.trim());

  // Update name/email
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileError("");

    if (!name.trim()) {
      setProfileError("Name cannot be empty.");
      return;
    }
    if (!email.trim() || !isValidEmail(email)) {
      setProfileError("Please enter a valid email address.");
      return;
    }

    try {
      const { data } = await api.put("/api/users/profile", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });

      // Reuse existing token from storage
      const existingToken = localStorage.getItem("token");
      if (existingToken) {
        login(data.user, existingToken);
      } else {
        // Fallback: update user with null token if your context allows it
        login(data.user, null);
      }

      setProfileMsg(data.message || "Profile updated successfully!");
      setProfileError("");
    } catch (err) {
      setProfileError(err.response?.data?.message || "Update failed");
      setProfileMsg("");
    }
  };

  // Update password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    try {
      const { data } = await api.post("/api/auth/change-password", {
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      });

      setPasswordMsg(data.message || "Password changed successfully.");
      setPasswordError("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "Password change failed"
      );
      setPasswordMsg("");
    }
  };

  return (
    <div className="profile-backdrop">
      <div className="profile-modal float-up">
        <h2 className="profile-title">My Profile</h2>

        {/* PROFILE SECTION */}
        {profileMsg && <p className="profile-msg success">{profileMsg}</p>}
        {profileError && <p className="profile-msg error">{profileError}</p>}

        <form onSubmit={handleProfileUpdate} className="profile-section">
          <h3>Profile Information</h3>

          <label>Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Email</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="btn primary full-width" type="submit">
            Save Changes
          </button>
        </form>

        {/* PASSWORD SECTION */}
        {passwordMsg && <p className="profile-msg success">{passwordMsg}</p>}
        {passwordError && <p className="profile-msg error">{passwordError}</p>}

        <form onSubmit={handlePasswordChange} className="profile-section">
          <h3>Change Password</h3>

          <label>Current Password</label>
          <input
            className="input"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <label>New Password</label>
          <input
            className="input"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <label>Confirm Password</label>
          <input
            className="input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button className="btn primary full-width" type="submit">
            Update Password
          </button>
        </form>

        <button onClick={onClose} className="btn ghost full-width">
          Close
        </button>
      </div>
    </div>
  );
};

export default ProfilePopup;
