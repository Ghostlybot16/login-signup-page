// api.js
const API_BASE = "http://localhost:8000"; // adjust if needed

async function apiFetch(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "omit",
  });

  let data = null;
  try { data = await res.json(); } catch { /* ignore */ }

  if (!res.ok) {
    const msg = data?.detail || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
