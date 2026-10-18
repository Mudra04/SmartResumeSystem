// Central place for backend settings. Change REACT_APP_API_URL in frontend/.env if your port differs.
export const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

export const getToken = () => localStorage.getItem("token");
export const setToken = (t) => localStorage.setItem("token", t);
export const clearToken = () => localStorage.removeItem("token");

// Reads the recruiter's name from the login token (the token carries it as a claim).
export const getUserName = () => {
  try {
    let p = getToken().split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    p += "=".repeat((4 - (p.length % 4)) % 4);
    const bytes = Uint8Array.from(atob(p), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)).name || "";
  } catch {
    return "";
  }
};
