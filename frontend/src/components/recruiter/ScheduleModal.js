import React, { useEffect, useState } from "react";
import { todayKey } from "./dates";

export default function ScheduleModal({ candidate, existing, onClose, onSave }) {
  const [date, setDate] = useState(existing?.date || todayKey());
  const [time, setTime] = useState(existing?.time || "10:00");
  const [note, setNote] = useState(existing?.note || "");
  const [err, setErr] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();
    if (!date || !time) return setErr("Pick a date and a time.");
    onSave({ date, time, note: note.trim() });
  };

  return (
    <div className="rc-overlay rc-overlay--center" onClick={onClose}>
      <form className="rc-modal" role="dialog" aria-modal="true" aria-label="Schedule interview" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="rc-drawer__head">
          <h2>Schedule interview</h2>
          <button type="button" className="rc-x" onClick={onClose} aria-label="Close">×</button>
        </div>
        <p className="rc-muted">{candidate.name} · {candidate.jobTitle}</p>
        <div className="rc-form-row">
          <label className="rc-field"><span>Date</span><input className="rc-input" type="date" min={todayKey()} value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <label className="rc-field"><span>Time</span><input className="rc-input" type="time" value={time} onChange={(e) => setTime(e.target.value)} /></label>
        </div>
        <label className="rc-field"><span>Note (optional)</span><input className="rc-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Google Meet, round 1" /></label>
        {err && <p className="alert" role="alert">{err}</p>}
        <div className="rc-form-actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary">{existing ? "Reschedule" : "Schedule"}</button>
        </div>
      </form>
    </div>
  );
}
