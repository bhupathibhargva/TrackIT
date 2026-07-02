// useAi — every Gemini-powered feature in one place: the chat assistant,
// "Auto-Schedule This Week", and "Reprioritize overdue tasks".
//
// Kept separate from useTasks so AI plumbing can change without touching
// how tasks are stored. It receives the task list and the persist function
// from the caller instead of owning them.
import { useState } from 'react';
import { CATS, TODAY, uid } from '../constants.js';
import { callGemini } from '../gemini.js';
import { schedulePrompt, reprioritizePrompt, chatPrompt } from '../prompts.js';
import { pushNotif } from '../utils.js';

export function useAi({ tasks, persist, apiKey, activeUser, setView, onMissingKey }) {
  const [log, setLog]         = useState([]);   // chat history: { role: 'user' | 'assistant', text }
  const [input, setInput]     = useState('');   // the text box content
  const [loading, setLoading] = useState(false);

  // Append an assistant message to the chat log.
  const say = (text) => setLog(l => [...l, { role: 'assistant', text }]);

  // Every AI action needs a Gemini key. If it's missing, open Settings
  // (via onMissingKey) instead of failing silently.
  const requireApiKey = () => {
    if (!apiKey) { onMissingKey(); return false; }
    return true;
  };

  // Ask Gemini to place every unscheduled one-off task into this week,
  // then jump to the calendar so the user sees the result.
  const autoSchedule = async () => {
    if (!requireApiKey()) return;
    setLoading(true);
    try {
      const schedulable = tasks.filter(task => !task.done && !task.recurrence);
      const schedule = await callGemini(apiKey, schedulePrompt(schedulable));
      const updated = tasks.map(task => {
        const slot = schedule.find(s => s.id === task.id);
        return slot ? { ...task, scheduledDate: slot.scheduledDate, scheduledTime: slot.scheduledTime } : task;
      });
      await persist(updated);
      pushNotif('Family HQ', `Week scheduled! ${schedule.length} tasks placed.`);
      say(`Scheduled ${schedule.length} tasks for the week!`);
      setView('calendar');
    } catch (err) {
      console.error('[ai] auto-schedule failed:', err);
      say('Scheduling failed. Try again.');
    }
    setLoading(false);
  };

  // Ask Gemini to bump priorities and pick new dates for overdue tasks.
  const autoReprioritize = async () => {
    if (!requireApiKey()) return;
    setLoading(true);
    const overdue = tasks.filter(task => !task.done && task.dueDate && task.dueDate < TODAY);
    if (!overdue.length) {
      say("No overdue tasks — you're on top of it! 🎉");
      setView('ai');
      setLoading(false);
      return;
    }
    try {
      const updates = await callGemini(apiKey, reprioritizePrompt(overdue));
      const updated = tasks.map(task => {
        const change = updates.find(u => u.id === task.id);
        return change ? { ...task, ...change } : task;
      });
      await persist(updated);
      say(`Reprioritized and rescheduled ${updates.length} overdue tasks.`);
      setView('ai');
    } catch (err) {
      console.error('[ai] reprioritize failed:', err);
      say('Reprioritization failed.');
    }
    setLoading(false);
  };

  // Free-form chat. Gemini replies with one JSON "action" (add / update /
  // delete / chat) which we apply to the task list.
  const sendChat = async () => {
    const message = input.trim();
    if (!message || loading || !requireApiKey()) return;
    setInput('');
    setLog(l => [...l, { role: 'user', text: message }]);
    setLoading(true);
    try {
      const result = await callGemini(apiKey, chatPrompt(tasks, activeUser, message));
      if (result.action === 'add') {
        const newTask = { ...result.task, id: uid() };
        await persist([...tasks, newTask]);
        say(`Added "${newTask.title}" to ${CATS[newTask.category]?.l ?? newTask.category}.${newTask.recurrence ? ` Repeats ${newTask.recurrence}.` : ''}`);
      } else if (result.action === 'update') {
        await persist(tasks.map(task => task.id === result.id ? { ...task, ...result.changes } : task));
        say(`Updated "${tasks.find(task => task.id === result.id)?.title ?? 'task'}".`);
      } else if (result.action === 'delete') {
        const title = tasks.find(task => task.id === result.id)?.title;
        await persist(tasks.filter(task => task.id !== result.id));
        say(`Removed "${title}".`);
      } else {
        say(result.message ?? 'Done!');
      }
    } catch (err) {
      console.error('[ai] chat failed:', err);
      say('Something went wrong.');
    }
    setLoading(false);
  };

  return { log, input, setInput, loading, autoSchedule, autoReprioritize, sendChat };
}
