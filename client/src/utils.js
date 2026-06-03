import { CATS, RECURRING_SEPARATOR } from './constants.js';

export function expandRecurring(tasks, weekDates) {
  const instances = [];
  for (const task of tasks) {
    if (!task.recurrence || task.done) { instances.push(task); continue; }
    const completedDates = task.completedDates ?? [];
    if (task.recurrence === 'daily') {
      for (const date of weekDates)
        instances.push({
          ...task,
          scheduledDate: date,
          id: `${task.id}${RECURRING_SEPARATOR}${date}`,
          isInst: true,
          tid: task.id,
          done: completedDates.includes(date),
        });
    } else if (task.recurrence === 'weekly' && task.scheduledDate) {
      const originalDay = new Date(task.scheduledDate + 'T12:00:00').getDay();
      for (const date of weekDates)
        if (new Date(date + 'T12:00:00').getDay() === originalDay)
          instances.push({
            ...task,
            scheduledDate: date,
            id: `${task.id}${RECURRING_SEPARATOR}${date}`,
            isInst: true,
            tid: task.id,
            done: completedDates.includes(date),
          });
    }
  }
  return instances;
}

// Escape RFC 5545 special chars so punctuation in titles/notes can't corrupt .ics output.
const escICS = (value = '') =>
  String(value).replace(/\\/g, '\\\\').replace(/[,;]/g, '\\$&').replace(/\r?\n/g, '\\n');

export function exportICS(tasks) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Family HQ//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  for (const task of tasks.filter(t => t.scheduledDate && !t.done)) {
    const dateTime = task.scheduledDate.replace(/-/g, '') +
      (task.scheduledTime ? `T${task.scheduledTime.replace(':', '')}00` : '');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${task.id}@familyhq`,
      `DTSTART:${dateTime}`,
      `SUMMARY:${escICS(task.title)} (${escICS(task.assignee)})`,
      `CATEGORIES:${escICS(CATS[task.category]?.l ?? '')}`,
      ...(task.notes   ? [`DESCRIPTION:${escICS(task.notes)}`] : []),
      ...(task.recurrence === 'daily'  ? ['RRULE:FREQ=DAILY']  : []),
      ...(task.recurrence === 'weekly' ? ['RRULE:FREQ=WEEKLY'] : []),
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const anchor = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: 'family-hq.ics',
  });
  anchor.click();
}

export const reqNotif = async () => {
  if ('Notification' in window && Notification.permission === 'default')
    await Notification.requestPermission();
};

export const pushNotif = (title, body) => {
  if ('Notification' in window && Notification.permission === 'granted')
    new Notification(title, { body });
};
