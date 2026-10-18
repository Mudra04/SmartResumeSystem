import React, { useRef, useState } from "react";
import { api } from "./recruiterApi";

export default function UploadResumes({ jobs, initialJobId, onDone }) {
  const inputRef = useRef(null);
  const [jobId, setJobId] = useState(initialJobId || "");
  const [files, setFiles] = useState([]);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState({}); // name -> "ok" | error text

  const add = (list) => {
    const pdfs = Array.from(list).filter((f) => /\.pdf$/i.test(f.name));
    setFiles((prev) => [...prev, ...pdfs.filter((p) => !prev.some((x) => x.name === p.name))]);
    setResults({});
  };

  const run = async () => {
    setBusy(true);
    const out = {};
    for (const f of files) {
      try {
        const form = new FormData();
        form.append("resume", f); // change "resume" if your Flask route expects another field name
        await api(`/jobs/${jobId}/candidates`, { method: "POST", form });
        out[f.name] = "ok";
      } catch (e) {
        out[f.name] = e.message;
      }
      setResults({ ...out });
    }
    setBusy(false);
    onDone(Object.values(out).filter((v) => v === "ok").length);
  };

  const okCount = Object.values(results).filter((v) => v === "ok").length;

  return (
    <div className="rc-card rc-upload">
      <label className="rc-field">
        <span>Job</span>
        <select className="rc-input" value={jobId} onChange={(e) => setJobId(e.target.value)}>
          <option value="">Select a job</option>
          {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </label>

      <div
        className={`rc-drop ${drag ? "is-drag" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
      >
        <input ref={inputRef} type="file" accept=".pdf" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
        <p>Drag PDF resumes here, or</p>
        <button type="button" className="btn btn--ghost" onClick={() => inputRef.current.click()}>Choose files</button>
      </div>

      {files.length > 0 && (
        <ul className="rc-files">
          {files.map((f) => (
            <li key={f.name}>
              <span>{f.name} <em>{Math.round(f.size / 1024)} KB</em></span>
              {results[f.name] === "ok" && <b className="rc-ok">Scored</b>}
              {results[f.name] && results[f.name] !== "ok" && <b className="rc-err">{results[f.name]}</b>}
              {!results[f.name] && !busy && <button className="rc-link" onClick={() => setFiles(files.filter((x) => x !== f))}>Remove</button>}
              {!results[f.name] && busy && <b className="rc-wait">Waiting…</b>}
            </li>
          ))}
        </ul>
      )}

      {okCount > 0 && !busy && <p className="rc-success">{okCount} resume{okCount > 1 ? "s" : ""} added to this job.</p>}

      <button className="btn btn--primary btn--lg" disabled={!jobId || files.length === 0 || busy} onClick={run}>
        {busy ? "Uploading…" : `Upload and score ${files.length || ""} resume${files.length === 1 ? "" : "s"}`}
      </button>
    </div>
  );
}
