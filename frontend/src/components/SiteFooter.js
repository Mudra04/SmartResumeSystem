import React from "react";
import { Link } from "react-router-dom";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <div>
          <strong>SmartResume</strong>
          <p>Resume screening and job recommendations, built as a final-year data science project.</p>
        </div>
        <div className="footer__links">
          <Link to="/analyser">Resume analyser</Link>
          <Link to="/recruiter/login">Recruiter login</Link>
          <a href="https://github.com/Mudra04/SmartResumeSystem" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
