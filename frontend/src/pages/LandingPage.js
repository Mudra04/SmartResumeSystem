import React from "react";
import { Link } from "react-router-dom";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";

const STEPS = [
  { t: "Upload your resume", d: "Drop in a PDF or DOCX. Nothing to fill in by hand." },
  { t: "Get your analysis", d: "See your ATS score, the skills we found, and how each section reads." },
  { t: "Fix and match", d: "Follow the suggestions, close skill gaps, and see jobs that fit your profile." },
];

const FEATURES = [
  { t: "ATS score", d: "A single score for how well automated screening tools can read and rank your resume." },
  { t: "Skill extraction", d: "Every technical and soft skill detected in your resume, in one list." },
  { t: "Section analysis", d: "Education, experience, projects and summary checked one by one." },
  { t: "Job matching", d: "Roles ranked by how closely your skills line up with each posting." },
  { t: "Skill gap analysis", d: "The skills a target role asks for that your resume does not show yet." },
  { t: "Specific suggestions", d: "Concrete edits to make, not generic advice." },
];

const FAQ = [
  { q: "Which file types can I upload?", a: "PDF and DOCX resumes. Text-based files give the most accurate results." },
  { q: "Do I need an account to analyse my resume?", a: "No. The analyser is open to everyone. Recruiters sign in to manage jobs and candidates." },
  { q: "How is the ATS score calculated?", a: "It combines how clearly your sections are structured, how many relevant skills are detected, and how readable the file is to parsing software." },
  { q: "What can recruiters do?", a: "Post and edit jobs, upload candidate resumes, see each candidate's score and matched skills, and update their hiring status." },
];

export default function LandingPage() {
  return (
    <>
      <SiteNav />
      <main>
        <section className="hero">
          <div className="wrap hero__grid">
            <div>
              <h1>See your resume the way a recruiter's software does.</h1>
              <p className="lead">
                Upload your resume and get an ATS score, your detected skills, matching jobs and the exact gaps to fix.
                Recruiters get a dashboard to screen candidates against open roles.
              </p>
              <div className="row">
                <Link to="/analyser" className="btn btn--primary btn--lg">Analyse my resume</Link>
                <Link to="/recruiter/login" className="btn btn--ghost btn--lg">I'm a recruiter</Link>
              </div>
            </div>

            <div className="resume-card" aria-hidden="true">
              <div className="resume-card__head">
                <div>
                  <div className="line line--name" />
                  <div className="line line--sub" />
                </div>
                <div className="score">
                  <span className="score__num">82</span>
                  <span className="score__lbl">ATS score</span>
                </div>
              </div>
              <div className="resume-card__sec">
                <span className="tag tag--ok">Education</span>
                <div className="line" /><div className="line line--short" />
              </div>
              <div className="resume-card__sec">
                <span className="tag tag--ok">Experience</span>
                <div className="line" /><div className="line" /><div className="line line--short" />
              </div>
              <div className="resume-card__sec">
                <span className="tag tag--warn">Projects</span>
                <div className="line line--short" />
              </div>
              <div className="chips">
                <span className="chip chip--hit">Python</span>
                <span className="chip chip--hit">SQL</span>
                <span className="chip chip--hit">Machine learning</span>
                <span className="chip chip--miss">Docker</span>
                <span className="chip chip--miss">Power BI</span>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="section">
          <div className="wrap">
            <h2>From upload to a better resume in three steps</h2>
            <ol className="steps">
              {STEPS.map((s, i) => (
                <li key={s.t} className="step">
                  <span className="step__n">{i + 1}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="features" className="section section--tint">
          <div className="wrap">
            <h2>What you get with every analysis</h2>
            <div className="feature-grid">
              {FEATURES.map((f) => (
                <div key={f.t} className="feature">
                  <h3>{f.t}</h3>
                  <p>{f.d}</p>
                </div>
              ))}
            </div>
            <div className="center">
              <Link to="/analyser" className="btn btn--primary btn--lg">Try the analyser</Link>
            </div>
          </div>
        </section>

        <section id="recruiters" className="section">
          <div className="wrap split">
            <div>
              <h2>Screen candidates without reading every resume</h2>
              <p className="lead">
                Create a job, upload the resumes you receive, and see every candidate ranked by how well they match.
              </p>
              <ul className="ticks">
                <li>Candidate scores and matched skills per job</li>
                <li>Filter and sort your shortlist</li>
                <li>Move candidates through hiring stages</li>
              </ul>
              <Link to="/recruiter/login" className="btn btn--primary btn--lg">Sign in as recruiter</Link>
            </div>
            <div className="mini-table" aria-hidden="true">
              <div className="mini-table__row mini-table__row--head"><span>Candidate</span><span>Match</span><span>Status</span></div>
              <div className="mini-table__row"><span>Candidate A</span><span>91%</span><span className="pill pill--ok">Shortlisted</span></div>
              <div className="mini-table__row"><span>Candidate B</span><span>78%</span><span className="pill">In review</span></div>
              <div className="mini-table__row"><span>Candidate C</span><span>64%</span><span className="pill">In review</span></div>
              <div className="mini-table__row"><span>Candidate D</span><span>41%</span><span className="pill pill--no">Rejected</span></div>
            </div>
          </div>
        </section>

        <section id="faq" className="section section--tint">
          <div className="wrap wrap--narrow">
            <h2>Questions</h2>
            {FAQ.map((f) => (
              <details key={f.q} className="faq">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="cta">
          <div className="wrap center">
            <h2>Find out what your resume is missing</h2>
            <Link to="/analyser" className="btn btn--light btn--lg">Analyse my resume</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
