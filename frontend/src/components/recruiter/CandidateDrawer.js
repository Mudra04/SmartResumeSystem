import React, { useEffect } from "react";
import { STATUSES, initials } from "./recruiterApi";
import { fmtDate, fmtTime } from "./dates";
import StatusBadge from "./StatusBadge";

export default function CandidateDrawer({ candidate: c, interview, onClose, onStatus, onSchedule }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!c) return null;
  const details = [
    ["Email", c.email], ["Phone", c.phone], ["Experience", c.experience], ["Education", c.education], ["Applied for", c.jobTitle],
  ].filter(([, v]) => v);

  return (
    <div className="rc-overlay" onClick={onClose}>
      <aside className="rc-drawer" role="dialog" aria-modal="true" aria-label={`Candidate ${c.name}`} onClick={(e) => e.stopPropagation()}>
        <div className="rc-drawer__head">
          <div className="rc-person rc-person--lg">
            <span className="rc-avatar">{initials(c.name)}</span>
            <div><strong>{c.name}</strong><span>{c.jobTitle}</span></div>
          </div>
          <button className="rc-x" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="rc-drawer__score">
          <div><strong>{c.score}</strong><span>Match score</span></div>
          <StatusBadge status={c.status} />
        </div>

        <h4>Move to stage</h4>
        <div className="rc-stagebtns">
          {STATUSES.map((s) => (
            <button key={s.id} className={`rc-stagebtn ${c.status === s.id ? "is-on" : ""}`} onClick={() => onStatus(c, s.id)}>{s.label}</button>
          ))}
        </div>

        <h4>Interview</h4>
        {interview ? (
          <p className="rc-drawer__text"><strong>{fmtDate(interview.date)}</strong> at {fmtTime(interview.time)}{interview.note ? ` · ${interview.note}` : ""}</p>
        ) : (
          <p className="rc-muted">None scheduled yet.</p>
        )}
        <button className="btn btn--ghost" style={{ marginTop: ".6rem" }} onClick={() => onSchedule(c)}>{interview ? "Reschedule interview" : "Schedule interview"}</button>

        {c.summary && (<><h4>Summary</h4><p className="rc-drawer__text">{c.summary}</p></>)}

        {details.length > 0 && (
          <>
            <h4>Details</h4>
            <dl className="rc-dl">{details.map(([k, v]) => (<React.Fragment key={k}><dt>{k}</dt><dd>{String(v)}</dd></React.Fragment>))}</dl>
          </>
        )}

        {c.matched.length > 0 && (<><h4>Matched skills</h4><div className="rc-chips">{c.matched.map((s) => <span key={s} className="rc-chip rc-chip--ok">{s}</span>)}</div></>)}
        {c.missing.length > 0 && (<><h4>Missing skills</h4><div className="rc-chips">{c.missing.map((s) => <span key={s} className="rc-chip rc-chip--miss">{s}</span>)}</div></>)}
        {c.skills.length > 0 && (<><h4>All skills found</h4><div className="rc-chips">{c.skills.map((s) => <span key={s} className="rc-chip">{s}</span>)}</div></>)}
      </aside>
    </div>
  );
}
