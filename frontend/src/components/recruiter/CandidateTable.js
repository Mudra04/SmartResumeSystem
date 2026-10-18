import React from "react";
import { STATUSES, initials } from "./recruiterApi";

const scoreColor = (s) => (s >= 75 ? "#1d8a5a" : s >= 50 ? "#2457d6" : s >= 30 ? "#b7791f" : "#c0392b");

export default function CandidateTable({ rows, onOpen, onStatus, empty }) {
  if (rows.length === 0) return <div className="rc-empty">{empty || "No candidates match these filters."}</div>;
  return (
    <div className="rc-tablewrap">
      <table className="rc-table">
        <thead>
          <tr><th>Candidate</th><th>Job</th><th>Score</th><th>Top skills</th><th>Stage</th></tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} onClick={() => onOpen(c)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onOpen(c)}>
              <td>
                <div className="rc-person">
                  <span className="rc-avatar">{initials(c.name)}</span>
                  <div><strong>{c.name}</strong>{c.email && c.email !== c.name && <span>{c.email}</span>}</div>
                </div>
              </td>
              <td>{c.jobTitle}</td>
              <td>
                <div className="rc-score">
                  <strong style={{ color: scoreColor(c.score) }}>{c.score}</strong>
                  <span className="rc-score__track"><span style={{ width: `${c.score}%`, background: scoreColor(c.score) }} /></span>
                </div>
              </td>
              <td>
                <div className="rc-chips">
                  {(c.matched.length ? c.matched : c.skills).slice(0, 3).map((s) => <span key={s} className="rc-chip">{s}</span>)}
                </div>
              </td>
              <td onClick={(e) => e.stopPropagation()}>
                <select className={`rc-stage rc-stage--${c.status}`} value={c.status} onChange={(e) => onStatus(c, e.target.value)} aria-label={`Stage for ${c.name}`}>
                  {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  {!STATUSES.some((s) => s.id === c.status) && <option value={c.status}>{c.status}</option>}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
