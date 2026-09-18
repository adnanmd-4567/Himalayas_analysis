const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export async function fetchRegions() {
  const res = await fetch(`${API_BASE}/regions`);
  if (!res.ok) throw new Error("Failed to fetch regions");
  return res.json();
}

export async function fetchLandslideEvents() {
  const res = await fetch(`${API_BASE}/events/landslides`);
  if (!res.ok) throw new Error("Failed to fetch landslide events");
  return res.json();
}

export async function recomputeRisk(weights) {
  const params = new URLSearchParams(weights).toString();
  const res = await fetch(`${API_BASE}/risk/recompute?${params}`);
  if (!res.ok) throw new Error("Failed to recompute risk");
  return res.json();
}