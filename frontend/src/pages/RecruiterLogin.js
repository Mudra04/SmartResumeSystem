import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import SiteNav from "../components/SiteNav";
import { API, setToken } from "../api";

export default function RecruiterLogin() {
  const nav = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // change to {username, password} if your /login expects that
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || json.message || "Wrong email or password.");
      const token = json.token || json.access_token;
      if (!token) throw new Error("Login worked but no token came back. Check the key name in RecruiterLogin.js.");
      setToken(token);
      nav(location.state?.from?.pathname || "/recruiter", { replace: true });
    } catch (err) {
      setError(err.message.includes("Failed to fetch") ? `Can't reach the server at ${API}. Is the Flask backend running?` : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SiteNav />
      <main className="page page--center">
        <form className="auth" onSubmit={submit}>
          <h1>Recruiter login</h1>
          <p className="muted">Sign in to manage jobs and screen candidates.</p>

          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />

          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />

          {error && <p className="alert" role="alert">{error}</p>}

          <button className="btn btn--primary btn--lg" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
          <p className="muted small">Just want to check your own resume? <Link to="/analyser">Use the analyser</Link></p>
        </form>
      </main>
    </>
  );
}
