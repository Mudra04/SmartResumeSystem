import React, { useEffect, useRef, useState } from "react";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import { API } from "../api";
import "../styles/analyser.css";
import "../styles/analyser-extra.css";

/* ---------- constants (same data contract as your old dashboard) ---------- */
const SECTION_LIST = [
  { key: "summary", label: "Professional Summary" },
  { key: "education", label: "Education" },
  { key: "experience", label: "Experience" },
  { key: "projects", label: "Projects" },
  { key: "skills", label: "Skills" },
  { key: "certifications", label: "Certifications" },
  { key: "achievements", label: "Achievements" },
];

const CATEGORY_COLORS = {
  programming: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  web: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  data: { bg: "#fdf4ff", color: "#9333ea", border: "#e9d5ff" },
  database: { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
  cloud: { bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd" },
  tools: { bg: "#fefce8", color: "#854d0e", border: "#fef08a" },
};
const FALLBACK_CAT = { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" };
const JOB_COLORS = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#d97706"];

const GRADES = [
  { min: 85, grade: "A", label: "Excellent", color: "#16a34a", bg: "#dcfce7", ring: "#22c55e" },
  { min: 70, grade: "B", label: "Good", color: "#2563eb", bg: "#dbeafe", ring: "#3b82f6" },
  { min: 55, grade: "C", label: "Average", color: "#d97706", bg: "#fef3c7", ring: "#f59e0b" },
  { min: 40, grade: "D", label: "Needs work", color: "#ea580c", bg: "#ffedd5", ring: "#f97316" },
  { min: 0, grade: "F", label: "Poor", color: "#dc2626", bg: "#fee2e2", ring: "#ef4444" },
];
const getGrade = (s) => GRADES.find((g) => s >= g.min) || GRADES[GRADES.length - 1];

/* Short, complete-sentence versions of the backend's suggestion templates (from your old ScoreCard). */
const SHORT_TIPS = [
  { prefix: "Add a Professional Summary", short: "Add a Professional Summary that's tailored to your target role." },
  { prefix: "Add a Work Experience section", short: "Add a Work Experience section with clear, measurable results." },
  { prefix: "Add relevant projects", short: "Add relevant projects, case studies or work samples where possible." },
  { prefix: "Add more quantified achievements", short: "Add more quantified, measurable achievements using numbers or percentages." },
  { prefix: "Consider adding relevant", short: (s) => { const m = s.match(/^Consider adding relevant (.+?) skills/); return m ? `Add a few relevant ${m[1]} skills to your resume.` : "Add a few more relevant skills to your resume."; } },
  { prefix: "Add relevant certifications", short: "Add relevant certifications, licenses or professional training where applicable." },
  { prefix: "Vary your language", short: "Vary your language to avoid frequently repeated words and phrases." },
  { prefix: "Expand the skills section", short: (s) => { const m = s.match(/relevant (.+?) competencies/); return m ? `Expand your skills section with more relevant ${m[1]} competencies.` : "Expand your skills section with more relevant competencies."; } },
  { prefix: "Strong resume", short: "Tailor your resume's content and keywords to each target job." },
];
const STOP = new Set(["or", "and", "the", "a", "an", "of", "to", "in", "on", "for", "with", "using"]);
function shorten(text) {
  const rule = SHORT_TIPS.find((r) => text.startsWith(r.prefix));
  if (rule) return typeof rule.short === "function" ? rule.short(text) : rule.short;
  let w = text.trim().replace(/[.,;:]+$/, "").split(/\s+/);
  if (w.length <= 12) return text;
  w = w.slice(0, 12);
  while (w.length > 1 && STOP.has(w[w.length - 1].toLowerCase())) w.pop();
  return w.join(" ") + "…";
}

/* Lets rings and bars animate from 0 after the results appear. */
function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setM(true)); return () => cancelAnimationFrame(id); }, []);
  return m;
}

/* ---------- result pieces ---------- */
function Bar({ label, score, max, color, go, delay }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="an-bar">
      <div className="an-bar__top">
        <span>{label}</span>
        <strong>{score}<em>/{max}</em></strong>
      </div>
      <div className="an-bar__track">
        <div className="an-bar__fill" style={{ background: color, width: go ? `${pct}%` : 0, transitionDelay: `${delay}s` }} />
      </div>
    </div>
  );
}

function ScoreCard({ data }) {
  const go = useMounted();
  const { score = 0, breakdown = {}, word_count = 0, skills_found = [], sections = {}, domain, suggestions = [] } = data;
  const g = getGrade(score);
  const C = 2 * Math.PI * 52;
  const found = Object.values(sections).filter(Boolean).length;
  const bars = [
    { label: "Sections", score: breakdown.sections?.score || 0, max: 35, color: "#3b82f6" },
    { label: "Skills", score: breakdown.skills?.score || 0, max: 30, color: "#8b5cf6" },
    { label: "Achievements", score: breakdown.achievements?.score || 0, max: 25, color: "#f59e0b" },
    { label: "Writing quality", score: breakdown.writing?.score || 0, max: 10, color: "#10b981" },
  ];

  return (
    <aside className="an-card an-score">
      <div className="an-score__head">
        <div className="an-ring">
          <svg width="128" height="128" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#eef2f7" strokeWidth="10" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={g.ring} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${go ? (score / 100) * C : 0} ${C}`} transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dasharray 1.2s ease" }} />
          </svg>
          <div className="an-ring__txt"><strong>{score}</strong><span>out of 100</span></div>
        </div>
        <div>
          <span className="an-grade" style={{ background: g.bg, color: g.color }}>Grade {g.grade}</span>
          <p className="an-score__label">{g.label}</p>
          <p className="an-muted">Resume score</p>
          {domain && <span className="an-badge">{domain}</span>}
        </div>
      </div>

      <div className="an-stats">
        <div><strong>{skills_found.length}</strong><span>Skills</span></div>
        <div><strong>{found}/7</strong><span>Sections</span></div>
        <div><strong>{word_count}</strong><span>Words</span></div>
      </div>

      <h3 className="an-eyebrow">Score breakdown</h3>
      {bars.map((b, i) => <Bar key={b.label} {...b} go={go} delay={0.1 * (i + 1)} />)}

      {suggestions.length > 0 && (
        <div className="an-quick">
          <h3 className="an-eyebrow">Quick wins</h3>
          {suggestions.slice(0, 2).map((s, i) => <p key={i} className="an-quick__item">{shorten(s)}</p>)}
        </div>
      )}
    </aside>
  );
}

function SectionRow({ label, present, tips }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`an-sec ${present ? "is-ok" : "is-miss"}`}>
      <button type="button" className="an-sec__head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="an-sec__icon" aria-hidden="true">{present ? "✓" : "✕"}</span>
        <span className="an-sec__name">{label}</span>
        <span className="an-sec__state">{present ? "Found" : "Missing"}</span>
        <span className="an-sec__tips">{open ? "Hide tips" : "Tips"}</span>
      </button>
      {open && (
        <ul className="an-sec__body">
          {tips.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      )}
    </div>
  );
}

function JobRow({ role, d, rank }) {
  const go = useMounted();
  const color = JOB_COLORS[rank % JOB_COLORS.length];
  return (
    <div className="an-job">
      <div className="an-job__top">
        <span className="an-job__role">
          {rank === 0 && <span className="an-best">Best match</span>}
          {role}
        </span>
        <span className="an-job__right">
          <a className="an-li" href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role)}`} target="_blank" rel="noopener noreferrer" aria-label={`Search ${role} jobs on LinkedIn (opens in a new tab)`}>
            Find on LinkedIn <span aria-hidden="true">&#8599;</span>
          </a>
          <strong style={{ color }}>{d.match}%</strong>
        </span>
      </div>
      <div className="an-bar__track">
        <div className="an-bar__fill" style={{ background: color, width: go ? `${d.match}%` : 0 }} />
      </div>
      <div className="an-tags">
        {(d.matched_skills || []).map((s) => <span key={s} className="an-tag an-tag--have">{s}</span>)}
        {(d.missing_skills || []).slice(0, 3).map((s) => <span key={s} className="an-tag an-tag--lack">{s} missing</span>)}
      </div>
    </div>
  );
}

function TagGroup({ title, items, cls }) {
  if (!items?.length) return null;
  return (
    <div className="an-group">
      <h3 className={`an-eyebrow ${cls || ""}`}>{title}</h3>
      <div className="an-tags">
        {items.map((x, i) => <span key={i} className={`an-tag an-tag--${cls}`}>{x}</span>)}
      </div>
    </div>
  );
}

function Panel({ data, tab }) {
  const skillsFound = data.skills_found || [];
  const byCat = data.skills_by_category || {};
  const sections = data.sections || {};
  const secTips = data.section_tips || {};
  const jobs = Object.entries(data.job_matches || {});
  const sugg = data.suggestions || [];

  if (tab === "skills") {
    return (
      <>
        <h3 className="an-eyebrow">Skills by category ({skillsFound.length} found)</h3>
        {Object.keys(byCat).length === 0 && <p className="an-muted">No skills detected.</p>}
        {Object.entries(byCat).map(([cat, list]) => {
          const t = CATEGORY_COLORS[cat] || FALLBACK_CAT;
          return (
            <div key={cat} className="an-group">
              <h4 className="an-cat">{cat.charAt(0).toUpperCase() + cat.slice(1)}</h4>
              <div className="an-tags">
                {list.map((s) => <span key={s} className="an-tag" style={{ background: t.bg, color: t.color, borderColor: t.border }}>{s}</span>)}
              </div>
            </div>
          );
        })}
        <TagGroup title="High-demand skills missing" items={data.missing_skills} cls="lack" />
        <TagGroup title="Quantified achievements detected" items={data.achievements} cls="good" />
        <TagGroup title="Overused words" items={data.repetitions} cls="warn" />
      </>
    );
  }

  if (tab === "sections") {
    return (
      <>
        <h3 className="an-eyebrow">Resume sections · select one to see tips</h3>
        {SECTION_LIST.map(({ key, label }) => (
          <SectionRow key={key} label={label} present={!!sections[key]}
            tips={secTips[key]?.tips || ["Keep this section concise and relevant.", "Use bullet points for readability."]} />
        ))}
      </>
    );
  }

  if (tab === "jobs") {
    return (
      <>
        <h3 className="an-eyebrow">Top job role matches based on your skills</h3>
        {jobs.length === 0 && <p className="an-muted">Add more skills to see job matches.</p>}
        {jobs.map(([role, d], i) => <JobRow key={role} role={role} d={d} rank={i} />)}
      </>
    );
  }

  return (
    <>
      <h3 className="an-eyebrow">{sugg.length} improvement suggestions</h3>
      {sugg.length === 0 && <p className="an-muted">No suggestions. This is a strong resume.</p>}
      {sugg.map((s, i) => (
        <div key={i} className="an-sug"><span>{i + 1}</span><p>{s}</p></div>
      ))}
    </>
  );
}

function Results({ data, onReset }) {
  const [tab, setTab] = useState("skills");
  const tabs = [
    { id: "skills", label: "Skills", n: (data.skills_found || []).length },
    { id: "sections", label: "Sections", n: Object.values(data.sections || {}).filter(Boolean).length + "/7" },
    { id: "jobs", label: "Job match", n: Object.keys(data.job_matches || {}).length },
    { id: "suggestions", label: "Suggestions", n: (data.suggestions || []).length },
  ];
  return (
    <div className="an-results">
      <div className="an-bar-top">
        <h1>Resume analysis</h1>
        <button className="btn btn--ghost" onClick={onReset}>New analysis</button>
      </div>
      <div className="an-layout">
        <ScoreCard data={data} />
        <section className="an-card an-panel">
          <div className="an-tabs" role="tablist">
            {tabs.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} className={`an-tab ${tab === t.id ? "is-on" : ""}`} onClick={() => setTab(t.id)}>
                {t.label}<span>{t.n}</span>
              </button>
            ))}
          </div>
          <div className="an-panel__body" key={tab}><Panel data={data} tab={tab} /></div>
        </section>
      </div>
    </div>
  );
}

/* ---------- page ---------- */
export default function AnalyserPage() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const pick = (f) => {
    if (!f) return;
    if (!/\.pdf$/i.test(f.name)) return setError("Upload a PDF file.");
    setError("");
    setFile(f);
  };

  const reset = () => { setData(null); setFile(null); setError(""); window.scrollTo({ top: 0 }); };

  const analyse = async () => {
    if (!file) return setError("Choose a resume first.");
    setLoading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("resume", file);
      const res = await fetch(`${API}/analyze_resume`, { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || json.message || `Analysis failed (${res.status}).`);
      setData(json);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(e.message.includes("Failed to fetch") ? `Can't reach the server at ${API}. Is the Flask backend running?` : e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SiteNav />
      <main className="page">
        {data ? (
          <div className="wrap"><Results data={data} onReset={reset} /></div>
        ) : (
          <div className="wrap wrap--narrow">
            <h1 className="page__title">Resume analyser</h1>
            <p className="lead">Upload your resume to see your score, skills, job matches and what to improve.</p>

            <div
              className={`drop ${drag ? "is-drag" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
            >
              <input ref={inputRef} type="file" accept=".pdf" hidden onChange={(e) => pick(e.target.files[0])} />
              {file ? (
                <p><strong>{file.name}</strong> <span className="muted">({Math.round(file.size / 1024)} KB)</span></p>
              ) : (
                <p>Drag your PDF resume here, or</p>
              )}
              <button type="button" className="btn btn--ghost" onClick={() => inputRef.current.click()}>
                {file ? "Choose a different file" : "Choose a file"}
              </button>
            </div>

            {error && <p className="alert" role="alert">{error}</p>}

            <button className="btn btn--primary btn--lg" disabled={!file || loading} onClick={analyse}>
              {loading ? "Analysing…" : "Analyse resume"}
            </button>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
