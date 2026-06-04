import { SEED, STORAGE_KEYS } from './constants.js';
import { supabase } from './supabase.js';

// ---------- Supabase column mapping ----------

function toRow(task) {
  return {
    id:              task.id,
    title:           task.title,
    category:        task.category       ?? 'tasks',
    priority:        task.priority       ?? 3,
    assignee:        task.assignee       ?? 'Both',
    done:            task.done           ?? false,
    recurrence:      task.recurrence     ?? null,
    scheduled_date:  task.scheduledDate  ?? null,
    scheduled_time:  task.scheduledTime  ?? null,
    due_date:        task.dueDate        ?? null,
    duration:        task.duration       ?? null,
    notes:           task.notes          ?? '',
    completed_dates: task.completedDates ?? [],
  };
}

function fromRow(row) {
  return {
    id:             row.id,
    title:          row.title,
    category:       row.category,
    priority:       row.priority,
    assignee:       row.assignee,
    done:           row.done,
    recurrence:     row.recurrence     ?? null,
    scheduledDate:  row.scheduled_date ?? null,
    scheduledTime:  row.scheduled_time ?? null,
    dueDate:        row.due_date       ?? null,
    duration:       row.duration       ?? null,
    notes:          row.notes          ?? '',
    completedDates: row.completed_dates ?? [],
  };
}

// ---------- Diff-based delete tracking ----------
// Tracks IDs known to be in Supabase so we can distinguish
// intentional user deletes from Siri-added tasks we haven't loaded yet.
let trackedCloudIds = new Set();

// ---------- Public API ----------

export async function loadData() {
  if (supabase) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('priority')
      .order('id');

    if (!error && data) {
      if (data.length === 0) {
        // First-run: seed the database with sample tasks
        await supabase.from('tasks').insert(SEED.map(toRow));
        trackedCloudIds = new Set(SEED.map(t => t.id));
        return { tasks: SEED };
      }
      trackedCloudIds = new Set(data.map(r => r.id));
      return { tasks: data.map(fromRow) };
    }
    console.error('[storage] Supabase load error:', error);
  }

  // localStorage fallback
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
  if (supabase) {
    const appIds = new Set(tasks.map(t => t.id));

    // Delete IDs that were in the cloud set but are no longer in the app —
    // these are tasks the user intentionally deleted.
    // (Siri-added IDs not yet loaded have never been in trackedCloudIds,
    //  so they are never accidentally deleted here.)
    const toDelete = [...trackedCloudIds].filter(id => !appIds.has(id));
    if (toDelete.length > 0) {
      const { error } = await supabase.from('tasks').delete().in('id', toDelete);
      if (!error) toDelete.forEach(id => trackedCloudIds.delete(id));
    }

    // Upsert all current tasks (handles adds and edits)
    if (tasks.length > 0) {
      const { error } = await supabase.from('tasks').upsert(tasks.map(toRow));
      if (!error) tasks.forEach(t => trackedCloudIds.add(t.id));
      else console.error('[storage] Supabase upsert error:', error);
    }
    return;
  }

  // localStorage fallback
  try { localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify({ tasks })); } catch {}
}

// ---------- User + API key (always local) ----------

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
