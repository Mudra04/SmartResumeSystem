import React, { useEffect, useState } from "react";

/* Create (job = null) or edit (job = existing job). Fields match your Flask /jobs routes. */
export default function JobFormModal({ job, onClose, onSave }) {
  const editing = !!job;
  const [f, setF] = useState({
    title: job?.title || "",
    company: job?.company || "",
    description: job?.description || "",
    skills: (job?.skills || []).join(", "),
    experience: job?.experience || "",
    domain: job?.domain || "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    if (!f.title.trim() || !f.company.trim() || !f.description.trim()) {
      return setErr("Title, company and description are required.");
    }
    setBusy(true);
    setErr("");
    try {
      await onSave(
        {
          title: f.title.trim(),
          company: f.company.trim(),
          description: f.description.trim(),
          required_skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean),
          experience: f.experience.trim(),
          domain: f.domain.trim(),
        },
        job?.id
      );
    } catch (ex) {
      setErr(ex.message);
      setBusy(false);
    }
  };

  return (
    <div className="rc-overlay rc-overlay--center" onClick={onClose}>
      <form className="rc-modal" role="dialog" aria-modal="true" aria-label={editing ? "Edit job" : "Add job"} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="rc-drawer__head">
          <h2>{editing ? "Edit job" : "Add a job"}</h2>
          <button type="button" className="rc-x" onClick={onClose} aria-label="Close">×</button>
        </div>

        <label className="rc-field"><span>Job title *</span>
          <input className="rc-input" value={f.title} onChange={set("title")} placeholder="e.g. Data Analyst" autoFocus />
        </label>
        <label className="rc-field"><span>Company *</span>
          <input className="rc-input" value={f.company} onChange={set("company")} placeholder="e.g. Acme Analytics" />
        </label>
        <div className="rc-form-row">
          <label className="rc-field"><span>Domain</span>
            <input className="rc-input" value={f.domain} onChange={set("domain")} placeholder="e.g. Finance" />
          </label>
          <label className="rc-field"><span>Experience</span>
            <input className="rc-input" value={f.experience} onChange={set("experience")} placeholder="e.g. 0-2 years" />
          </label>
        </div>
        <label className="rc-field"><span>Required skills (separate with commas)</span>
          <input className="rc-input" value={f.skills} onChange={set("skills")} placeholder="Python, SQL, Power BI" />
        </label>
        <label className="rc-field"><span>Description *</span>
          <textarea className="rc-input" rows="5" value={f.description} onChange={set("description")} placeholder="What will this person do?" />
        </label>

        {err && <p className="alert" role="alert">{err}</p>}

        <div className="rc-form-actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Create job"}</button>
        </div>
      </form>
    </div>
  );
}
