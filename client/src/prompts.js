import { WEEK } from './constants.js';

const toScheduleFields = (task) => ({
  id: task.id, title: task.title, category: task.category,
  priority: task.priority, assignee: task.assignee,
  duration: task.duration, dueDate: task.dueDate,
});

const toCoreFields = (task) => ({
  id: task.id, title: task.title, category: task.category,
  priority: task.priority, assignee: task.assignee,
});

export const schedulePrompt = (tasks) =>
  `Schedule tasks for Bhargav & Rupa (couple with toddler), week ${WEEK[0]}–${WEEK[6]}.
Tasks: ${JSON.stringify(tasks.map(toScheduleFields))}
Rules: Workouts 06:00–07:30 weekday mornings. Toddler 08:30–11:00. Work blocks Mon–Fri 09:00–18:00. Grocery Sat/Sun mornings or weekday evenings 19:30+. Date night Sat 19:30+. Family dinner Sun 17:00. P1→Mon-Tue, P2→Wed-Fri, P3+→weekend. Honour dueDate.
Return ONLY JSON array: [{"id":"...","scheduledDate":"YYYY-MM-DD","scheduledTime":"HH:MM"}]`;

export const reprioritizePrompt = (tasks) =>
  `Reprioritize these overdue tasks for Bhargav & Rupa. Assign new priority (1=Critical–5=Someday) and reschedule this week.
Overdue: ${JSON.stringify(tasks.map(t => ({ ...toCoreFields(t), dueDate: t.dueDate })))}
Week dates: ${WEEK.join(', ')}
Return ONLY JSON: [{"id":"...","priority":1,"scheduledDate":"YYYY-MM-DD","scheduledTime":"HH:MM"}]`;

export const chatPrompt = (tasks, user, message) =>
  `Manage tasks for Bhargav & Rupa (toddler family). Current tasks: ${JSON.stringify(tasks.map(t => ({
    ...toCoreFields(t), done: t.done, scheduledDate: t.scheduledDate, recurrence: t.recurrence,
  })))}
User (${user}): "${message}"
Return ONLY one of these JSON actions (no markdown):
{"action":"add","task":{"title":"...","category":"tasks|grocery|toddler|dinner|date|workout","priority":1-5,"assignee":"Bhargav|Rupa|Both","dueDate":"YYYY-MM-DD or null","duration":30,"notes":"","recurrence":"daily|weekly|null","done":false,"scheduledDate":null,"scheduledTime":null,"completedDates":[]}}
{"action":"update","id":"...","changes":{...}}
{"action":"delete","id":"..."}
{"action":"chat","message":"..."}`;
