// useTasks — owns the task list and everything that changes it.
//
// This hook is the ONLY place tasks are loaded and saved. Components never
// talk to storage.js directly; they call the handlers returned here. Every
// handler updates React state first (so the UI feels instant) and then
// writes to Supabase / localStorage in the background.
import { useState, useEffect } from 'react';
import { uid, RECURRING_SEPARATOR, POLL_INTERVAL_MS } from '../constants.js';
import { loadData, persistData } from '../storage.js';
import { supabase } from '../supabase.js';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  // 'synced' | 'syncing' — drives the little status dot in the sidebar.
  const [syncMsg, setSyncMsg] = useState('synced');

  // Load saved tasks once on startup.
  useEffect(() => {
    loadData().then(({ tasks: saved }) => setTasks(saved));
  }, []);

  // Poll Supabase so tasks added from outside the app (e.g. the Siri
  // Shortcut) appear without a manual refresh.
  useEffect(() => {
    if (!supabase) return;
    const poll = setInterval(async () => {
      const { tasks: fresh } = await loadData();
      // Only replace state when a genuinely new task arrived — otherwise we
      // would clobber unsaved local edits and re-render for nothing.
      setTasks(prev => {
        const prevIds = new Set(prev.map(t => t.id));
        return fresh.some(t => !prevIds.has(t.id)) ? fresh : prev;
      });
    }, POLL_INTERVAL_MS);
    return () => clearInterval(poll);
  }, []);

  // Update the UI immediately, then save in the background.
  const persist = async (updated) => {
    setTasks(updated);
    setSyncMsg('syncing');
    await persistData(updated);
    setSyncMsg('synced');
  };

  // Check / uncheck a task.
  //
  // Recurring tasks are special: the calendar shows one "instance" per day,
  // with ids like "s5__2026-07-02" (task id + separator + date). Completing
  // an instance doesn't mark the whole task done — it just records that date
  // in the task's completedDates list.
  const toggleDone = (id) => {
    if (id.includes(RECURRING_SEPARATOR)) {
      const [taskId, date] = id.split(RECURRING_SEPARATOR);
      persist(tasks.map(task => {
        if (task.id !== taskId) return task;
        const completed = task.completedDates ?? [];
        const alreadyDone = completed.includes(date);
        return {
          ...task,
          completedDates: alreadyDone
            ? completed.filter(d => d !== date)
            : [...completed, date],
        };
      }));
    } else {
      persist(tasks.map(task => task.id === id ? { ...task, done: !task.done } : task));
    }
  };

  const deleteTask = (id) => persist(tasks.filter(task => task.id !== id));

  // Save from the task modal: update if the id already exists, add otherwise.
  const saveTask = (task) => {
    if (task.id && tasks.some(t => t.id === task.id)) {
      persist(tasks.map(t => t.id === task.id ? task : t));
    } else {
      persist([...tasks, { ...task, id: uid() }]);
    }
  };

  // Nudge a task one slot up or down in the priority-sorted list by swapping
  // its priority value with its neighbour's.
  const movePriority = (id, direction) => {
    const sorted = [...tasks].sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
    const index = sorted.findIndex(task => task.id === id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return; // already at the edge
    const currentPriority = sorted[index].priority;
    const swapPriority = sorted[swapIndex].priority;
    persist(tasks.map(task => {
      if (task.id === sorted[index].id)     return { ...task, priority: swapPriority };
      if (task.id === sorted[swapIndex].id) return { ...task, priority: currentPriority };
      return task;
    }));
  };

  return { tasks, syncMsg, persist, toggleDone, deleteTask, saveTask, movePriority };
}
