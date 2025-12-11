import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LandingPage from "./pages/LandingPage";

const App = () => {
  const location = useLocation();

  // Pages where navbar should NOT be shown
  const hideNavbarRoutes = [
    "/", 
    "/login", 
    "/register", 
    "/forgot-password",
    "/verify-otp",
    "/reset-password"
  ];

  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div>
      {!hideNavbar && <Navbar />}

      <div style={{ padding: hideNavbar ? 0 : 20 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route path="*" element={<div>404 - Not found</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
