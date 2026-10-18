import React from "react";
import { STATUSES } from "./recruiterApi";

export default function FilterBar({ filters, setFilters, jobs, shown, total }) {
  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });
  const active = filters.job || filters.status || filters.minScore > 0 || filters.query;
  return (
    <div className="rc-filters">
      <label>
        <span>Job</span>
        <select className="rc-input" value={filters.job} onChange={set("job")}>
          <option value="">All jobs</option>
          {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </label>
      <label>
        <span>Stage</span>
        <select className="rc-input" value={filters.status} onChange={set("status")}>
          <option value="">All stages</option>
          {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </label>
      <label>
        <span>Minimum score: <strong>{filters.minScore}</strong></span>
        <input type="range" min="0" max="100" step="5" value={filters.minScore} onChange={(e) => setFilters({ ...filters, minScore: Number(e.target.value) })} />
      </label>
      <label>
        <span>Sort by</span>
        <select className="rc-input" value={filters.sort} onChange={set("sort")}>
          <option value="score">Highest score</option>
          <option value="name">Name (A–Z)</option>
          <option value="recent">Most recent</option>
        </select>
      </label>
      <div className="rc-filters__meta">
        <span>{shown} of {total} candidates</span>
        {active && <button className="rc-link" onClick={() => setFilters({ job: "", status: "", minScore: 0, sort: "score", query: "" })}>Clear filters</button>}
      </div>
    </div>
  );
}
