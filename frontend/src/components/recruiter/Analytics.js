import React from "react";
import { STATUSES } from "./recruiterApi";

function Bars({ rows, color }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="rc-bars">
      {rows.map((r) => (
        <div key={r.label} className="rc-bars__row">
          <span className="rc-bars__label">{r.label}</span>
          <span className="rc-bars__track"><span style={{ width: `${(r.value / max) * 100}%`, background: r.color || color }} /></span>
          <strong>{r.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function Analytics({ candidates, jobs }) {
  if (candidates.length === 0) return <div className="rc-empty">Analytics appear once candidates have been uploaded.</div>;

  const buckets = [
    { label: "0–29", value: candidates.filter((c) => c.score < 30).length, color: "#c0392b" },
    { label: "30–49", value: candidates.filter((c) => c.score >= 30 && c.score < 50).length, color: "#b7791f" },
    { label: "50–74", value: candidates.filter((c) => c.score >= 50 && c.score < 75).length, color: "#2457d6" },
    { label: "75–100", value: candidates.filter((c) => c.score >= 75).length, color: "#1d8a5a" },
  ];
  const stages = STATUSES.map((s) => ({ label: s.label, value: candidates.filter((c) => c.status === s.id).length }));
  const perJob = jobs.map((j) => ({ label: j.title, value: candidates.filter((c) => c.jobId === j.id).length })).filter((r) => r.value > 0);

  const counts = {};
  candidates.forEach((c) => c.skills.forEach((s) => { const k = s.toLowerCase(); counts[k] = (counts[k] || 0) + 1; }));
  const topSkills = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label, value }));

  return (
    <div className="rc-grid2">
      <section className="rc-card"><h3>Score distribution</h3><Bars rows={buckets} /></section>
      <section className="rc-card"><h3>Candidates by stage</h3><Bars rows={stages} color="#2457d6" /></section>
      <section className="rc-card"><h3>Candidates per job</h3><Bars rows={perJob} color="#2457d6" /></section>
      <section className="rc-card"><h3>Most common skills</h3><Bars rows={topSkills} color="#6d5bd0" /></section>
    </div>
  );
}
