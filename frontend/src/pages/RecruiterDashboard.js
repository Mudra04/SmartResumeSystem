import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken, getUserName } from "../api";
import { api, asArray, normJob, normCand, statusOf, statusValue } from "../components/recruiter/recruiterApi";
import useStored from "../components/recruiter/useStored";
import { todayKey, fmtDate, fmtTime } from "../components/recruiter/dates";
import Sidebar from "../components/recruiter/Sidebar";
import Topbar from "../components/recruiter/Topbar";
import StatCard from "../components/recruiter/StatCard";
import JobCard from "../components/recruiter/JobCard";
import FilterBar from "../components/recruiter/FilterBar";
import CandidateTable from "../components/recruiter/CandidateTable";
import CandidateDrawer from "../components/recruiter/CandidateDrawer";
import UploadResumes from "../components/recruiter/UploadResumes";
import Analytics from "../components/recruiter/Analytics";
import JobFormModal from "../components/recruiter/JobFormModal";
import FunnelChart from "../components/recruiter/FunnelChart";
import StatusBar from "../components/recruiter/StatusBar";
import TopCandidates from "../components/recruiter/TopCandidates";
import InterviewPanel from "../components/recruiter/InterviewPanel";
import ActivityFeed from "../components/recruiter/ActivityFeed";
import ScheduleModal from "../components/recruiter/ScheduleModal";
import "../styles/recruiter.css";
import "../styles/recruiter-extra.css";
import "../styles/recruiter-dash.css";

const DEFAULT_FILTERS = { job: "", status: "", minScore: 0, sort: "score", query: "" };

export default function RecruiterDashboard() {
  const nav = useNavigate();
  const userName = useMemo(() => getUserName().split(" ")[0], []);
  const [view, setView] = useState("overview");
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [open, setOpen] = useState(null); // candidate id shown in the drawer
  const [uploadJob, setUploadJob] = useState("");
  const [toast, setToast] = useState("");
  const [jobForm, setJobForm] = useState(null); // null = closed, {} = new job, job object = editing
  const [schedFor, setSchedFor] = useState(null); // candidate id being scheduled
  // Interviews and the activity feed are kept in this browser (the backend has no routes for them yet).
  const [interviews, setInterviews] = useStored("rc:interviews", []);
  const [activity, setActivity] = useStored("rc:activity", []);

  const logout = useCallback(() => { clearToken(); nav("/recruiter/login", { replace: true }); }, [nav]);
  const logActivity = useCallback((text, detail) => {
    setActivity((list) => [{ id: `${Date.now()}-${Math.random()}`, text, detail, at: Date.now() }, ...list].slice(0, 30));
  }, [setActivity]);

  const load = useCallback(async (quiet) => {
    quiet ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const rawJobs = await api("/jobs");
      const js = asArray(rawJobs, "jobs", "data", "results").map(normJob);
      const lists = await Promise.all(
        js.map((j) => api(`/jobs/${j.id}/candidates`).then((r) => asArray(r, "candidates", "data", "results")).catch(() => []))
      );
      setJobs(js);
      setCandidates(lists.flatMap((arr, i) => arr.map((c) => normCand(c, js[i]))));
    } catch (e) {
      if (e.status === 401) return logout();
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout]);

  useEffect(() => { load(false); }, [load]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 3500); return () => clearTimeout(t); }, [toast]);

  /* stage change: update the screen immediately, undo if the server refuses */
  const changeStatus = async (c, status) => {
    if (c.status === status) return;
    const prev = c.status;
    const patch = (s) => setCandidates((list) => list.map((x) => (x.id === c.id ? { ...x, status: s } : x)));
    patch(status);
    try {
      await api(`/candidates/${c.id}/status`, { method: "PUT", json: { status: statusValue(status) } });
      setToast(`${c.name} moved to ${statusOf(status).label}`);
      logActivity(`${c.name} moved to ${statusOf(status).label}`, c.jobTitle);
    } catch (e) {
      patch(prev);
      setToast(`Could not update stage: ${e.message}`);
    }
  };

  const saveJob = async (payload, id) => {
    await api(id ? `/jobs/${id}` : "/jobs", { method: id ? "PUT" : "POST", json: payload });
    setJobForm(null);
    setToast(id ? "Job updated" : "Job created");
    logActivity(id ? "Job updated" : "Job created", payload.title);
    load(true);
  };
  const removeJob = async (job) => {
    if (!window.confirm(`Delete "${job.title}"? This can't be undone.`)) return;
    try {
      await api(`/jobs/${job.id}`, { method: "DELETE" });
      setToast("Job deleted");
      logActivity("Job deleted", job.title);
      load(true);
    } catch (e) {
      setToast(`Could not delete job: ${e.message}`);
    }
  };

  const saveInterview = (c, { date, time, note }) => {
    setInterviews((list) => [
      ...list.filter((i) => i.candidateId !== c.id),
      { id: `${c.id}-${date}-${time}`, candidateId: c.id, name: c.name, jobTitle: c.jobTitle, date, time, note },
    ]);
    if (c.status !== "interview" && c.status !== "selected") changeStatus(c, "interview");
    logActivity(`Interview scheduled with ${c.name}`, `${fmtDate(date)} at ${fmtTime(time)}`);
    setSchedFor(null);
  };
  const removeInterview = (id) => setInterviews((list) => list.filter((i) => i.id !== id));

  const jobStats = useMemo(() => {
    const m = {};
    jobs.forEach((j) => {
      const list = candidates.filter((c) => c.jobId === j.id);
      m[j.id] = {
        total: list.length,
        shortlisted: list.filter((c) => c.status === "shortlisted").length,
        avg: list.length ? Math.round(list.reduce((a, c) => a + c.score, 0) / list.length) : 0,
      };
    });
    return m;
  }, [jobs, candidates]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const rows = candidates.filter((c) =>
      (!filters.job || c.jobId === filters.job) &&
      (!filters.status || c.status === filters.status) &&
      c.score >= filters.minScore &&
      (!q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.skills.some((s) => s.toLowerCase().includes(q)))
    );
    const sorters = {
      score: (a, b) => b.score - a.score,
      name: (a, b) => a.name.localeCompare(b.name),
      recent: (a, b) => String(b.createdAt).localeCompare(String(a.createdAt)),
    };
    return rows.sort(sorters[filters.sort]);
  }, [candidates, filters]);

  /* numbers for the overview */
  const total = candidates.length;
  const n = (s) => candidates.filter((c) => c.status === s).length;
  const counts = { applied: n("applied"), screening: n("screening"), shortlisted: n("shortlisted"), interview: n("interview"), selected: n("selected"), rejected: n("rejected") };
  const funnel = [
    { label: "Applications", value: total },
    { label: "Shortlisted", value: counts.shortlisted + counts.interview + counts.selected },
    { label: "Interviews", value: counts.interview + counts.selected },
    { label: "Selected", value: counts.selected },
  ];
  const avgScore = total ? Math.round(candidates.reduce((a, c) => a + c.score, 0) / total) : 0;
  const today = todayKey();
  const upcoming = [...interviews].filter((i) => i.date >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const todayCount = upcoming.filter((i) => i.date === today).length;

  const openCandidate = candidates.find((c) => c.id === open) || null;
  const schedCandidate = candidates.find((c) => c.id === schedFor) || null;

  const onQuery = (query) => { setFilters({ ...filters, query }); if (query && view !== "candidates") setView("candidates"); };
  const goCandidates = (jobId) => { setFilters({ ...DEFAULT_FILTERS, job: jobId }); setView("candidates"); };
  const goUpload = (jobId) => { setUploadJob(jobId); setView("upload"); };
  const jobCard = (j) => (
    <JobCard key={j.id} job={j} stats={jobStats[j.id]} onView={() => goCandidates(j.id)} onUpload={() => goUpload(j.id)} onEdit={() => setJobForm(j)} onDelete={() => removeJob(j)} />
  );

  let body;
  if (loading) {
    body = <div className="rc-empty">Loading your jobs and candidates…</div>;
  } else if (error) {
    body = (
      <div className="rc-error">
        <strong>Couldn't load the dashboard</strong>
        <p>{error}</p>
        <button className="btn btn--primary" onClick={() => load(false)}>Try again</button>
      </div>
    );
  } else if (view === "overview") {
    body = (
      <div className="rc-dash">
        <div className="rc-dash__left">
          <section className="rc-card"><TopCandidates candidates={[...candidates]} onOpen={setOpen} /></section>
          <section className="rc-card"><InterviewPanel interviews={interviews} onOpen={setOpen} onRemove={removeInterview} onViewAll={() => setView("interviews")} /></section>
        </div>
        <div className="rc-dash__right">
          <div className="rc-stats">
            <StatCard label="Active jobs" value={jobs.length} hint={`${total} candidates in total`} />
            <StatCard label="In pipeline" value={total - counts.selected - counts.rejected} hint={`${counts.applied} newly applied`} />
            <StatCard label="Interviews coming up" value={upcoming.length} hint={`${todayCount} today`} />
            <StatCard label="Average match score" value={avgScore || "–"} hint="across all candidates" />
          </div>
          <section className="rc-card">
            <div className="rc-card__head"><h3>Recruitment progress</h3></div>
            <FunnelChart stages={funnel} />
          </section>
          <div className="rc-dash__pair">
            <section className="rc-card"><div className="rc-card__head"><h3>Recruitment status</h3></div><StatusBar counts={counts} total={total} /></section>
            <section className="rc-card"><div className="rc-card__head"><h3>Recent activity</h3></div><ActivityFeed items={activity} /></section>
          </div>
        </div>
      </div>
    );
  } else if (view === "jobs") {
    body = (
      <>
        <div className="rc-section__head"><h2>{jobs.length} job{jobs.length === 1 ? "" : "s"}</h2></div>
        <div className="rc-jobs">{jobs.map(jobCard)}</div>
        {jobs.length === 0 && <div className="rc-empty">No jobs yet. Use "Create new job" to add your first one.</div>}
      </>
    );
  } else if (view === "candidates") {
    body = (
      <>
        <FilterBar filters={filters} setFilters={setFilters} jobs={jobs} shown={filtered.length} total={candidates.length} />
        <CandidateTable rows={filtered} onOpen={(c) => setOpen(c.id)} onStatus={changeStatus} />
      </>
    );
  } else if (view === "interviews") {
    body = (
      <div className="rc-int-view">
        <section className="rc-card"><InterviewPanel interviews={interviews} onOpen={setOpen} onRemove={removeInterview} limit={50} /></section>
        <section className="rc-card">
          <div className="rc-card__head"><h3>All upcoming ({upcoming.length})</h3></div>
          {upcoming.length === 0 && <p className="rc-muted">Nothing scheduled. Open a candidate and choose "Schedule interview".</p>}
          <ul className="rc-upcoming">
            {upcoming.map((i) => (
              <li key={i.id}>
                <span className="rc-upcoming__when"><strong>{fmtDate(i.date)}</strong>{fmtTime(i.time)}</span>
                <button className="rc-link" onClick={() => setOpen(i.candidateId)}>{i.name}</button>
                <span className="rc-muted">{i.jobTitle}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  } else if (view === "upload") {
    body = (
      <UploadResumes
        key={uploadJob}
        jobs={jobs}
        initialJobId={uploadJob}
        onDone={(count) => { load(true); if (count) logActivity(`${count} resume${count > 1 ? "s" : ""} uploaded`, "Candidates scored and added"); }}
      />
    );
  } else {
    body = <Analytics candidates={candidates} jobs={jobs} />;
  }

  return (
    <div className="rc-shell">
      <Sidebar view={view} setView={setView} onLogout={logout} counts={{ jobs: jobs.length, candidates: candidates.length }} query={filters.query} onQuery={onQuery} />
      <div className="rc-main">
        <Topbar view={view} userName={userName} onCreateJob={() => setJobForm({})} onRefresh={() => load(true)} refreshing={refreshing} />
        <div className="rc-content">{body}</div>
      </div>
      <CandidateDrawer
        candidate={openCandidate}
        interview={interviews.find((i) => i.candidateId === open)}
        onClose={() => setOpen(null)}
        onStatus={changeStatus}
        onSchedule={(c) => setSchedFor(c.id)}
      />
      {schedCandidate && (
        <ScheduleModal candidate={schedCandidate} existing={interviews.find((i) => i.candidateId === schedCandidate.id)} onClose={() => setSchedFor(null)} onSave={(v) => saveInterview(schedCandidate, v)} />
      )}
      {jobForm && <JobFormModal job={jobForm.id ? jobForm : null} onClose={() => setJobForm(null)} onSave={saveJob} />}
      {toast && <div className="rc-toast" role="status">{toast}</div>}
    </div>
  );
}
