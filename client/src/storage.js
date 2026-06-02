import { SEED } from "./constants.js";

export async function loadData() {
  try {
    const raw = localStorage.getItem("hq-v5");
    if (raw) { const p = JSON.parse(raw); return { tasks: p.tasks || SEED }; }
  } catch {}
  return { tasks: SEED };
}

export async function persistData(tasks) {
  try { localStorage.setItem("hq-v5", JSON.stringify({ tasks })); } catch {}
}

export async function loadUser() {
  try { return localStorage.getItem("hq-user") || "Bhargav"; } catch { return "Bhargav"; }
}

export async function saveUser(u) {
  try { localStorage.setItem("hq-user", u); } catch {}
}

export function loadApiKey() {
  try { return localStorage.getItem("hq-apikey") || ""; } catch { return ""; }
}

export function saveApiKey(k) {
  try { localStorage.setItem("hq-apikey", k); } catch {}
}
