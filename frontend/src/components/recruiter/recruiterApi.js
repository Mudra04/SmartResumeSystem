import { API, getToken } from "../../api";

/* ---- Hiring stages: these match the allowed_statuses in your Flask route. ---- */
export const STATUSES = [
  { id: "applied", label: "Applied", value: "Applied", tone: "neutral" },
  { id: "screening", label: "Screening", value: "Screening", tone: "blue" },
  { id: "shortlisted", label: "Shortlisted", value: "Shortlisted", tone: "blue" },
  { id: "interview", label: "Interview", value: "Interview", tone: "amber" },
  { id: "selected", label: "Selected", value: "Selected", tone: "green" },
  { id: "rejected", label: "Rejected", value: "Rejected", tone: "red" },
];
export const statusOf = (id) =>
  STATUSES.find((s) => s.id === String(id || "applied").toLowerCase()) || { id: String(id), label: String(id), tone: "neutral" };
/* the exact word your Flask route expects (it checks against its own allowed list) */
export const statusValue = (id) => (STATUSES.find((s) => s.id === id) || {}).value || id;

/* ---- fetch wrapper: adds the JWT, turns failures into readable errors ---- */
export async function api(path, { method = "GET", json, form } = {}) {
  const headers = { Authorization: `Bearer ${getToken()}` };
  let body;
  if (json) { headers["Content-Type"] = "application/json"; body = JSON.stringify(json); }
  if (form) body = form;
  let res;
  try {
    res = await fetch(`${API}${path}`, { method, headers, body });
  } catch {
    const e = new Error(`The request to ${path} never got a valid reply. Check that Flask is running at ${API} and that this route exists.`);
    e.network = true;
    throw e;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(data.error || data.message || data.msg || `Request failed (${res.status})`);
    e.status = res.status;
    throw e;
  }
  return data;
}

/* ---- normalisers: map whatever field names the backend uses onto one shape ---- */
const first = (o, keys, fallback) => {
  for (const k of keys) if (o && o[k] !== undefined && o[k] !== null && o[k] !== "") return o[k];
  return fallback;
};
const NAME_RE = /^(full_?name|candidate_?name|name)$/i;
const EMAIL_RE = /^(candidate_?)?e-?mail$/i;
/* looks for a matching key at the top level, then inside nested objects (2 levels) */
const deepFind = (obj, re, depth = 2) => {
  if (!obj || typeof obj !== "object") return undefined;
  for (const [k, v] of Object.entries(obj)) {
    if (re.test(k) && (typeof v === "string" || typeof v === "number") && String(v).trim()) return v;
  }
  if (depth > 0) {
    for (const v of Object.values(obj)) {
      if (v && typeof v === "object" && !Array.isArray(v)) {
        const r = deepFind(v, re, depth - 1);
        if (r !== undefined) return r;
      }
    }
  }
  return undefined;
};
const toId = (v) => (v && typeof v === "object" ? v.$oid || JSON.stringify(v) : String(v));
export const toList = (v) => {
  if (!v) return [];
  if (typeof v === "string") return v.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  if (Array.isArray(v)) return v.map((x) => (typeof x === "string" ? x : x?.name || x?.skill || "")).filter(Boolean);
  if (typeof v === "object") return Object.keys(v);
  return [];
};
export const asArray = (r, ...keys) => {
  if (Array.isArray(r)) return r;
  for (const k of keys) if (Array.isArray(r?.[k])) return r[k];
  return [];
};

export function normJob(j) {
  return {
    id: toId(first(j, ["_id", "id", "job_id"], "")),
    title: first(j, ["title", "job_title", "role", "name"], "Untitled role"),
    company: first(j, ["company", "company_name"], ""),
    location: first(j, ["location", "city"], ""),
    type: first(j, ["type", "job_type", "employment_type"], ""),
    experience: first(j, ["experience"], ""),
    domain: first(j, ["domain"], ""),
    skills: toList(first(j, ["required_skills", "skills", "requirements"], [])),
    description: first(j, ["description", "summary"], ""),
  };
}

export function normCand(c, job) {
  const a = c.analysis || c.resume_analysis || {};
  let score = first(c, ["match_score", "score", "ats_score", "resume_score"], first(a, ["score", "ats_score"], 0));
  score = Number(score) || 0;
  if (score > 0 && score <= 1) score *= 100;
  const email = first(c, ["email", "candidate_email"], first(a, ["email"], deepFind(c, EMAIL_RE) || ""));
  const fileName = String(first(c, ["filename", "file_name", "resume_name", "resume_filename"], "")).replace(/\.pdf$/i, "");
  return {
    id: toId(first(c, ["_id", "id", "candidate_id"], "")),
    jobId: job.id,
    jobTitle: job.title,
    name: first(c, ["name", "candidate_name", "full_name"], deepFind(c, NAME_RE) || email || fileName || "Unnamed candidate"),
    email,
    phone: first(c, ["phone", "mobile"], first(a, ["phone"], "")),
    score: Math.round(score),
    skills: toList(first(c, ["skills", "skills_found", "extracted_skills"], first(a, ["skills_found", "skills"], []))),
    matched: toList(first(c, ["matched_skills"], first(a, ["matched_skills"], []))),
    missing: toList(first(c, ["missing_skills"], first(a, ["missing_skills"], []))),
    experience: first(c, ["experience", "years_experience"], first(a, ["experience"], "")),
    education: first(c, ["education"], first(a, ["education"], "")),
    summary: first(c, ["summary"], first(a, ["summary"], "")),
    status: String(first(c, ["status"], "applied")).toLowerCase(),
    createdAt: first(c, ["created_at", "uploaded_at", "date"], ""),
  };
}

export const initials = (name) =>
  String(name).split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";
