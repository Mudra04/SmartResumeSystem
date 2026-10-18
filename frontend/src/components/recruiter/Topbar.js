import React from "react";
import Icon from "./icons";

const SUBS = {
  overview: "Here's how your hiring pipeline looks today.",
  jobs: "Open roles and how candidates match them.",
  candidates: "Screen, filter and move candidates through stages.",
  interviews: "Your interview calendar.",
  upload: "Add candidates to a job and score them automatically.",
  analytics: "Scores, stages and skills across all candidates.",
};
const TITLES = { jobs: "Jobs", candidates: "Candidates", interviews: "Interviews", upload: "Upload resumes", analytics: "Analytics" };

export default function Topbar({ view, userName, onCreateJob, onRefresh, refreshing }) {
  const title = view === "overview" ? (userName ? `Welcome back, ${userName}` : "Welcome back") : TITLES[view];
  return (
    <header className="rc-top">
      <div>
        <h1>{title}</h1>
        <p>{SUBS[view]}</p>
      </div>
      <div className="rc-top__tools">
        <button className="rc-iconbtn" onClick={onRefresh} disabled={refreshing} aria-label="Refresh data" title="Refresh data"><Icon name="refresh" /></button>
        <button className="btn btn--primary rc-create" onClick={onCreateJob}><Icon name="plus" size={16} /> Create new job</button>
      </div>
    </header>
  );
}
