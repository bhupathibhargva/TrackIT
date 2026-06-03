import { SEED, STORAGE_KEYS } from './constants.js';

export async function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.tasks);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { tasks: parsed.tasks || SEED };
    }
  } catch {}
  return { tasks: SEED };
}

export async function persistData(tasks) {
  try { localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify({ tasks })); } catch {}
}

export async function loadUser() {
  try { return localStorage.getItem(STORAGE_KEYS.user) || 'Bhargav'; } catch { return 'Bhargav'; }
}

export async function saveUser(userName) {
  try { localStorage.setItem(STORAGE_KEYS.user, userName); } catch {}
}

export function loadApiKey() {
  try { return localStorage.getItem(STORAGE_KEYS.apiKey) || ''; } catch { return ''; }
}

export function saveApiKey(apiKey) {
  try { localStorage.setItem(STORAGE_KEYS.apiKey, apiKey); } catch {}
}
