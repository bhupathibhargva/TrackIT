import { CATS } from "./constants.js";

export function expandRecurring(tasks, weekDates) {
  const out = [];
  for (const t of tasks) {
    if (!t.recurrence || t.done) { out.push(t); continue; }
    if (t.recurrence === "daily") {
      for (const d of weekDates)
        out.push({ ...t, scheduledDate:d, id:`${t.id}__${d}`, isInst:true, tid:t.id, done:(t.completedDates||[]).includes(d) });
    } else if (t.recurrence === "weekly" && t.scheduledDate) {
      const orig = new Date(t.scheduledDate + "T12:00:00").getDay();
      for (const d of weekDates)
        if (new Date(d + "T12:00:00").getDay() === orig)
          out.push({ ...t, scheduledDate:d, id:`${t.id}__${d}`, isInst:true, tid:t.id, done:(t.completedDates||[]).includes(d) });
    }
  }
  return out;
}

export function exportICS(tasks) {
  const lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Family HQ//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH"];
  for (const t of tasks.filter(t => t.scheduledDate && !t.done)) {
    const dt = t.scheduledDate.replace(/-/g,"") + (t.scheduledTime ? "T" + t.scheduledTime.replace(":","") + "00" : "");
    lines.push("BEGIN:VEVENT", `UID:${t.id}@familyhq`, `DTSTART:${dt}`,
      `SUMMARY:${t.title} (${t.assignee})`, `CATEGORIES:${CATS[t.category]?.l || ""}`,
      ...(t.notes ? [`DESCRIPTION:${t.notes}`] : []),
      ...(t.recurrence === "daily"  ? ["RRULE:FREQ=DAILY"]  : []),
      ...(t.recurrence === "weekly" ? ["RRULE:FREQ=WEEKLY"] : []),
      "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  const blob = new Blob([lines.join("\r\n")], { type:"text/calendar;charset=utf-8" });
  const a = Object.assign(document.createElement("a"), { href:URL.createObjectURL(blob), download:"family-hq.ics" });
  a.click();
}

export const reqNotif = async () => {
  if ("Notification" in window && Notification.permission === "default")
    await Notification.requestPermission();
};

export const pushNotif = (title, body) => {
  if ("Notification" in window && Notification.permission === "granted")
    new Notification(title, { body });
};
