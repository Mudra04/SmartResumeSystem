import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  // Section links only make sense on the landing page; elsewhere they go back to it.
  const sec = (id) => (onHome ? `#${id}` : `/#${id}`);

  return (
    <header className="nav">
      <div className="nav__inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand__mark" aria-hidden="true" />
          SmartResume
        </Link>
        <button className="nav__toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          Menu
        </button>
        <nav className={`nav__links ${open ? "is-open" : ""}`} onClick={() => setOpen(false)}>
          <a href={sec("how")}>How it works</a>
          <a href={sec("features")}>What you get</a>
          <a href={sec("recruiters")}>For recruiters</a>
          <a href={sec("faq")}>FAQ</a>
          <Link to="/recruiter/login" className="btn btn--ghost">Recruiter login</Link>
          <Link to="/analyser" className="btn btn--primary">Analyse my resume</Link>
        </nav>
      </div>
    </header>
  );
}
