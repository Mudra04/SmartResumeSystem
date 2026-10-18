import React from "react";
import { initials } from "./recruiterApi";
import Icon from "./icons";

export default function TopCandidates({ candidates, onOpen }) {
  const top = candidates
    .filter((c) => c.status !== "rejected" && c.status !== "selected")
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div>
      <span className="rc-pillbadge"><Icon name="spark" size={14} /> Best matches</span>
      <h3 className="rc-top3__title">Top candidates to review</h3>
      {top.length === 0 && <p className="rc-muted">No active candidates yet. Upload resumes to a job to see your best matches here.</p>}
      <div className="rc-top3">
        {top.map((c, i) => (
          <button key={c.id} className="rc-top3__row" onClick={() => onOpen(c.id)}>
            <span className="rc-avatar">{initials(c.name)}</span>
            <span className="rc-top3__who"><strong title={c.name}>{c.name}</strong><span>{c.jobTitle}</span></span>
            <strong className="rc-top3__score">{c.score}%</strong>
            <span className="rc-top3__rank">{i + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
