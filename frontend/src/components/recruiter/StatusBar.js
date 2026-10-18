import React from "react";

const SEGMENTS = [
  { id: "applied", label: "Applied", color: "#94a3b8" },
  { id: "screening", label: "Screening", color: "#6d8fe0" },
  { id: "shortlisted", label: "Shortlisted", color: "#1f4fb4" },
  { id: "interview", label: "Interview", color: "#f59e0b" },
  { id: "selected", label: "Selected", color: "#16a34a" },
  { id: "rejected", label: "Rejected", color: "#ef4444" },
];

export default function StatusBar({ counts, total }) {
  const summary = SEGMENTS.map((s) => `${s.label} ${counts[s.id]}`).join(", ");
  return (
    <div>
      <div className="rc-status__nums">
        <div><span>Screened</span><strong>{total}</strong></div>
        <div><span>Interviewing</span><strong>{counts.interview}</strong></div>
        <div><span>Selected</span><strong>{counts.selected}</strong></div>
      </div>
      <div className="rc-stack" role="img" aria-label={`Candidates by stage: ${summary}`}>
        {SEGMENTS.map((s) => counts[s.id] > 0 && <span key={s.id} title={`${s.label}: ${counts[s.id]}`} style={{ flexGrow: counts[s.id], background: s.color }} />)}
      </div>
      <ul className="rc-legend">
        {SEGMENTS.map((s) => (
          <li key={s.id}><i style={{ background: s.color }} />{s.label}<strong>{counts[s.id]}</strong></li>
        ))}
      </ul>
    </div>
  );
}
