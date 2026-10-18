import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AnalyserPage from "./pages/AnalyserPage";
import RecruiterLogin from "./pages/RecruiterLogin";
import RecruiterDashboard from "./pages/RecruiterDashboard"; // your existing file, untouched
import { getToken } from "./api";
import "./styles/site.css";

function RequireAuth({ children }) {
  const location = useLocation();
  if (!getToken()) return <Navigate to="/recruiter/login" state={{ from: location }} replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/analyser" element={<AnalyserPage />} />
        <Route path="/recruiter/login" element={<RecruiterLogin />} />
        <Route
          path="/recruiter/*"
          element={
            <RequireAuth>
              <RecruiterDashboard />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
