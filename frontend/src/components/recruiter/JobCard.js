import React from "react";

export default function JobCard({ job, stats, onView, onUpload, onEdit, onDelete }) {
  const meta = [job.company, job.domain, job.experience, job.location, job.type].filter(Boolean).join(" · ");
  return (
    <article className="rc-card rc-job">
      <div className="rc-job__head">
        <h3>{job.title}</h3>
        <p className="rc-muted">{meta || "No details added"}</p>
      </div>
      {job.skills.length > 0 && (
        <div className="rc-chips">
          {job.skills.slice(0, 6).map((s) => <span key={s} className="rc-chip">{s}</span>)}
          {job.skills.length > 6 && <span className="rc-chip rc-chip--more">+{job.skills.length - 6}</span>}
        </div>
      )}
      <div className="rc-job__stats">
        <div><strong>{stats.total}</strong><span>Candidates</span></div>
        <div><strong>{stats.shortlisted}</strong><span>Shortlisted</span></div>
        <div><strong>{stats.avg || "–"}</strong><span>Avg score</span></div>
      </div>
      <div className="rc-job__actions">
        <button className="btn btn--primary" onClick={onView}>View candidates</button>
        <button className="btn btn--ghost" onClick={onUpload}>Upload resumes</button>
      </div>
      <div className="rc-job__manage">
        <button className="rc-link" onClick={onEdit}>Edit job</button>
        <button className="rc-link rc-link--danger" onClick={onDelete}>Delete</button>
      </div>
    </article>
  );
}
