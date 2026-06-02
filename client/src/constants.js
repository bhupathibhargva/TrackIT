export const CATS = {
  tasks:   { l:"Tasks",      e:"✓",  c:"#2A4A1E", b:"#EEF4EB" },
  grocery: { l:"Grocery",    e:"🛒", c:"#7A5C14", b:"#FBF5E6" },
  toddler: { l:"Toddler",    e:"🧸", c:"#A84228", b:"#FDE8E4" },
  dinner:  { l:"Dinner",     e:"🍽", c:"#5A3A9A", b:"#F2EEF9" },
  date:    { l:"Date Night", e:"♡",  c:"#9E2252", b:"#FAE8F0" },
  workout: { l:"Workout",    e:"◎",  c:"#1A6868", b:"#E4F4F4" },
};

// Build dates from UTC primitives so parsing and ISO formatting agree —
// otherwise behind-UTC timezones shift the whole week by a day. (month is 0-indexed)
export const WEEK = Array.from({ length: 7 }, (_, i) =>
  new Date(Date.UTC(2026, 4, 25 + i)).toISOString().split("T")[0]
);

export const DAY_NAMES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
export const TODAY = WEEK[0];
export function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2, 9);
}

export const SEED = [
  { id:"s1",  title:"Pediatrician check-up",    category:"toddler", priority:1, assignee:"Both",    done:false, dueDate:"2026-05-27", scheduledDate:null,          scheduledTime:null,   duration:60,  notes:"Bring vaccination card", recurrence:null,     completedDates:[] },
  { id:"s2",  title:"Buy diapers & wipes",       category:"grocery", priority:1, assignee:"Bhargav", done:false, dueDate:null,         scheduledDate:null,          scheduledTime:null,   duration:20,  notes:"",                      recurrence:null,     completedDates:[] },
  { id:"s3",  title:"Sensory play session",      category:"toddler", priority:2, assignee:"Rupa",    done:false, dueDate:null,         scheduledDate:null,          scheduledTime:null,   duration:45,  notes:"Use kinetic sand",        recurrence:null,     completedDates:[] },
  { id:"s4",  title:"Date night — dinner out",   category:"date",    priority:2, assignee:"Both",    done:false, dueDate:"2026-05-31", scheduledDate:null,          scheduledTime:null,   duration:120, notes:"Need babysitter first",   recurrence:null,     completedDates:[] },
  { id:"s5",  title:"Weekly groceries",          category:"grocery", priority:2, assignee:"Both",    done:false, dueDate:null,         scheduledDate:"2026-05-25",  scheduledTime:"09:00",duration:60,  notes:"",                      recurrence:"weekly", completedDates:[] },
  { id:"s6",  title:"Morning run 5km",           category:"workout", priority:3, assignee:"Bhargav", done:false, dueDate:null,         scheduledDate:"2026-05-26",  scheduledTime:"06:15",duration:45,  notes:"",                      recurrence:"weekly", completedDates:[] },
  { id:"s7",  title:"Yoga session",              category:"workout", priority:3, assignee:"Rupa",    done:false, dueDate:null,         scheduledDate:"2026-05-26",  scheduledTime:"06:30",duration:30,  notes:"",                      recurrence:"weekly", completedDates:[] },
  { id:"s8",  title:"Sunday family roast",       category:"dinner",  priority:2, assignee:"Both",    done:false, dueDate:"2026-06-01", scheduledDate:null,          scheduledTime:null,   duration:90,  notes:"",                      recurrence:null,     completedDates:[] },
  { id:"s9",  title:"Evening reading with baby", category:"toddler", priority:1, assignee:"Both",    done:false, dueDate:null,         scheduledDate:"2026-05-25",  scheduledTime:"19:30",duration:20,  notes:"Daily habit",            recurrence:"daily",  completedDates:[] },
  { id:"s10", title:"Pay utility bills",         category:"tasks",   priority:2, assignee:"Bhargav", done:false, dueDate:"2026-05-30", scheduledDate:null,          scheduledTime:null,   duration:15,  notes:"",                      recurrence:null,     completedDates:[] },
  { id:"s11", title:"Call insurance agent",      category:"tasks",   priority:3, assignee:"Rupa",    done:false, dueDate:"2026-05-28", scheduledDate:null,          scheduledTime:null,   duration:30,  notes:"",                      recurrence:null,     completedDates:[] },
  { id:"s12", title:"Park picnic",               category:"date",    priority:3, assignee:"Both",    done:false, dueDate:null,         scheduledDate:null,          scheduledTime:null,   duration:180, notes:"With the toddler",       recurrence:null,     completedDates:[] },
];
