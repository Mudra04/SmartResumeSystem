import React, { useMemo, useState } from "react";
import Icon from "./icons";
import { toKey, todayKey, fmtDate, fmtTime } from "./dates";
import "../../styles/recruiter-calendar.css";

const LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

/* Shows the next few upcoming interviews across all days.
   Click a day in the week strip to see just that day; click it again to go back. */
export default function InterviewPanel({ interviews, onOpen, onRemove, onViewAll, limit = 5 }) {
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState(null);
  const today = todayKey();

  const days = useMemo(() => {
    const now = new Date();
    const shift = (now.getDay() + 6) % 7; // week starts on Monday
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - shift + offset * 7);
    return Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }, [offset]);

  const busy = new Set(interviews.map((i) => i.date));
  const upcoming = interviews
    .filter((i) => i.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const shown = selected
    ? interviews.filter((i) => i.date === selected).sort((a, b) => a.time.localeCompare(b.time))
    : upcoming.slice(0, limit);
  const more = selected ? 0 : upcoming.length - shown.length;

  return (
    <div>
      <div className="rc-card__head">
        <h3>Upcoming interviews</h3>
        <span className="rc-cal-nav">
          <button aria-label="Previous week" onClick={() => setOffset(offset - 1)}><Icon name="left" size={16} /></button>
          <button aria-label="Next week" onClick={() => setOffset(offset + 1)}><Icon name="right" size={16} /></button>
        </span>
      </div>
      <p className="rc-muted rc-cal-month">{days[3].toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
      <div className="rc-week">
        {days.map((d, i) => {
          const k = toKey(d);
          return (
            <button key={k} className={`rc-day ${k === selected ? "is-on" : ""} ${k === today ? "is-today" : ""}`} onClick={() => setSelected(k === selected ? null : k)} aria-pressed={k === selected} aria-label={d.toDateString()}>
              <span>{LETTERS[i]}</span>
              <strong>{d.getDate()}</strong>
              {busy.has(k) && <i className="rc-dot" />}
            </button>
          );
        })}
      </div>

      <div className="rc-intlist__head">
        <strong>{selected ? fmtDate(selected) : "Next up"}</strong>
        {selected && <button className="rc-link" onClick={() => setSelected(null)}>Show all upcoming</button>}
      </div>
      <div className="rc-intlist">
        {shown.length === 0 && (
          <p className="rc-muted">{selected ? "No interviews on this day." : "No interviews scheduled. Open a candidate and choose Schedule interview."}</p>
        )}
        {shown.map((i) => (
          <div key={i.id} className="rc-int">
            <span className="rc-int__time"><b>{fmtDate(i.date)}</b>{fmtTime(i.time)}</span>
            <button className="rc-int__who" onClick={() => onOpen(i.candidateId)}>
              <strong title={i.name}>{i.name}</strong>
              <span>{i.jobTitle}{i.note ? ` · ${i.note}` : ""}</span>
            </button>
            <button className="rc-int__x" aria-label={`Remove interview with ${i.name}`} onClick={() => onRemove(i.id)}><Icon name="close" size={14} /></button>
          </div>
        ))}
        {more > 0 && onViewAll && <button className="rc-link rc-int__more" onClick={onViewAll}>View all {upcoming.length} upcoming</button>}
      </div>
    </div>
  );
}
