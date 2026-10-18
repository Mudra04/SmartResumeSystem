import React from "react";
import { Link } from "react-router-dom";
import Icon from "./icons";

const ITEMS = [
  { id: "overview", label: "Dashboard", icon: "dashboard" },
  { id: "jobs", label: "Jobs", icon: "jobs" },
  { id: "candidates", label: "Candidates", icon: "candidates" },
  { id: "interviews", label: "Interviews", icon: "calendar" },
  { id: "upload", label: "Upload resumes", icon: "upload" },
  { id: "analytics", label: "Analytics", icon: "analytics" },
];

export default function Sidebar({ view, setView, onLogout, counts, query, onQuery }) {
  return (
    <aside className="rc-side">
      <Link to="/" className="rc-brand"><span className="brand__mark" aria-hidden="true" /> SmartResume</Link>
      <label className="rc-sidesearch">
        <Icon name="search" size={16} />
        <input type="search" placeholder="Search candidates" value={query} onChange={(e) => onQuery(e.target.value)} aria-label="Search candidates" />
      </label>
      <nav className="rc-nav" aria-label="Dashboard">
        {ITEMS.map((i) => (
          <button key={i.id} className={`rc-nav__item ${view === i.id ? "is-on" : ""}`} onClick={() => setView(i.id)} aria-current={view === i.id ? "page" : undefined}>
            <Icon name={i.icon} />
            <b className="rc-nav__label">{i.label}</b>
            {counts[i.id] != null && <em className="rc-nav__count">{counts[i.id]}</em>}
          </button>
        ))}
      </nav>
      <button className="rc-nav__item rc-logout" onClick={onLogout}><Icon name="logout" /><b className="rc-nav__label">Log out</b></button>
    </aside>
  );
}
