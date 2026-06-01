import { useState, useEffect, useRef } from "react";

// ── Config ────────────────────────────────────────────────────────────────────
const CATS = {
  tasks:   { l:"Tasks",      e:"✓",  c:"#2A4A1E", b:"#EEF4EB" },
  grocery: { l:"Grocery",    e:"🛒", c:"#7A5C14", b:"#FBF5E6" },
  toddler: { l:"Toddler",    e:"🧸", c:"#A84228", b:"#FDE8E4" },
  dinner:  { l:"Dinner",     e:"🍽", c:"#5A3A9A", b:"#F2EEF9" },
  date:    { l:"Date Night", e:"♡",  c:"#9E2252", b:"#FAE8F0" },
  workout: { l:"Workout",    e:"◎",  c:"#1A6868", b:"#E4F4F4" },
};
const WEEK = Array.from({ length: 7 }, (_, i) => {
  const d = new Date("2026-05-25"); d.setDate(25 + i); return d.toISOString().split("T")[0];
});
const DAY_NAMES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const TODAY = WEEK[0];
function uid() { return Math.random().toString(36).slice(2, 9); }

const SEED = [
  { id:"s1",  title:"Pediatrician check-up",    category:"toddler", priority:1, assignee:"Both",    done:false, dueDate:"2026-05-27", scheduledDate:null,         scheduledTime:null,  duration:60,  notes:"Bring vaccination card", recurrence:null,     completedDates:[] },
  { id:"s2",  title:"Buy diapers & wipes",       category:"grocery", priority:1, assignee:"Bhargav", done:false, dueDate:null,         scheduledDate:null,         scheduledTime:null,  duration:20,  notes:"",                      recurrence:null,     completedDates:[] },
  { id:"s3",  title:"Sensory play session",      category:"toddler", priority:2, assignee:"Rupa",    done:false, dueDate:null,         scheduledDate:null,         scheduledTime:null,  duration:45,  notes:"Use kinetic sand",        recurrence:null,     completedDates:[] },
  { id:"s4",  title:"Date night — dinner out",   category:"date",    priority:2, assignee:"Both",    done:false, dueDate:"2026-05-31", scheduledDate:null,         scheduledTime:null,  duration:120, notes:"Need babysitter first",   recurrence:null,     completedDates:[] },
  { id:"s5",  title:"Weekly groceries",          category:"grocery", priority:2, assignee:"Both",    done:false, dueDate:null,         scheduledDate:"2026-05-25", scheduledTime:"09:00",duration:60, notes:"",                      recurrence:"weekly", completedDates:[] },
  { id:"s6",  title:"Morning run 5km",           category:"workout", priority:3, assignee:"Bhargav", done:false, dueDate:null,         scheduledDate:"2026-05-26", scheduledTime:"06:15",duration:45, notes:"",                      recurrence:"weekly", completedDates:[] },
  { id:"s7",  title:"Yoga session",              category:"workout", priority:3, assignee:"Rupa",    done:false, dueDate:null,         scheduledDate:"2026-05-26", scheduledTime:"06:30",duration:30, notes:"",                      recurrence:"weekly", completedDates:[] },
  { id:"s8",  title:"Sunday family roast",       category:"dinner",  priority:2, assignee:"Both",    done:false, dueDate:"2026-06-01", scheduledDate:null,         scheduledTime:null,  duration:90,  notes:"",                      recurrence:null,     completedDates:[] },
  { id:"s9",  title:"Evening reading with baby", category:"toddler", priority:1, assignee:"Both",    done:false, dueDate:null,         scheduledDate:"2026-05-25", scheduledTime:"19:30",duration:20, notes:"Daily habit",            recurrence:"daily",  completedDates:[] },
  { id:"s10", title:"Pay utility bills",         category:"tasks",   priority:2, assignee:"Bhargav", done:false, dueDate:"2026-05-30", scheduledDate:null,         scheduledTime:null,  duration:15,  notes:"",                      recurrence:null,     completedDates:[] },
  { id:"s11", title:"Call insurance agent",      category:"tasks",   priority:3, assignee:"Rupa",    done:false, dueDate:"2026-05-28", scheduledDate:null,         scheduledTime:null,  duration:30,  notes:"",                      recurrence:null,     completedDates:[] },
  { id:"s12", title:"Park picnic",               category:"date",    priority:3, assignee:"Both",    done:false, dueDate:null,         scheduledDate:null,         scheduledTime:null,  duration:180, notes:"With the toddler",       recurrence:null,     completedDates:[] },
];

// ── Storage (localStorage) ────────────────────────────────────────────────────
async function loadData() {
  try {
    const raw = localStorage.getItem("hq-v5");
    if (raw) { const p = JSON.parse(raw); return { tasks: p.tasks || SEED, ver: p._v || 0 }; }
  } catch {}
  return { tasks: SEED, ver: 0 };
}
async function persistData(tasks) {
  const ver = Date.now();
  try { localStorage.setItem("hq-v5", JSON.stringify({ tasks, _v: ver })); } catch {}
  return ver;
}
async function loadUser() {
  try { return localStorage.getItem("hq-user") || "Bhargav"; } catch { return "Bhargav"; }
}
async function saveUser(u) { try { localStorage.setItem("hq-user", u); } catch {} }
function loadApiKey() { try { return localStorage.getItem("hq-apikey") || ""; } catch { return ""; } }
function saveApiKey(k) { try { localStorage.setItem("hq-apikey", k); } catch {} }

// ── Browser Notifications ─────────────────────────────────────────────────────
const reqNotif = async () => {
  if ("Notification" in window && Notification.permission === "default")
    await Notification.requestPermission();
};
const pushNotif = (title, body) => {
  if ("Notification" in window && Notification.permission === "granted")
    new Notification(title, { body });
};

// ── ICS Calendar Export ───────────────────────────────────────────────────────
function exportICS(tasks) {
  const lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Family HQ//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH"];
  for (const t of tasks.filter(t => t.scheduledDate && !t.done)) {
    const dt = t.scheduledDate.replace(/-/g,"") + (t.scheduledTime ? "T" + t.scheduledTime.replace(":","") + "00" : "");
    lines.push("BEGIN:VEVENT", `UID:${t.id}@familyhq`, `DTSTART:${dt}`,
      `SUMMARY:${t.title} (${t.assignee})`, `CATEGORIES:${CATS[t.category]?.l || ""}`,
      ...(t.notes ? [`DESCRIPTION:${t.notes}`] : []),
      ...(t.recurrence === "daily" ? ["RRULE:FREQ=DAILY"] : []),
      ...(t.recurrence === "weekly" ? ["RRULE:FREQ=WEEKLY"] : []),
      "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "family-hq.ics" });
  a.click();
}

// ── Recurring Task Expansion ──────────────────────────────────────────────────
function expandRecurring(tasks, weekDates) {
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

// ── Shared Atoms ──────────────────────────────────────────────────────────────
function Pill({ cat, small }) {
  const C = CATS[cat] || CATS.tasks;
  return <span style={{ display:"inline-flex",alignItems:"center",gap:3,background:C.b,color:C.c,borderRadius:20,
    padding:small?"2px 7px":"3px 9px",fontSize:small?10:11,fontWeight:600,whiteSpace:"nowrap",flexShrink:0 }}>{C.e} {C.l}</span>;
}
function Dot({ p }) {
  const cols = ["","#E53E3E","#DD6B20","#D69E2E","#38A169","#9AA0AA"];
  const labs = ["","Critical","High","Medium","Low","Someday"];
  return <span title={labs[p]} style={{ width:8,height:8,borderRadius:"50%",background:cols[p]||"#ccc",flexShrink:0,display:"inline-block" }} />;
}
function Field({ label, children }) {
  return <div>
    <label style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#8B8278",display:"block",marginBottom:4 }}>{label}</label>
    {children}
  </div>;
}
const iStyle = { width:"100%",padding:"10px 12px",border:"1px solid #E2DAD0",borderRadius:8,fontSize:14,outline:"none",background:"white" };

// ── TaskRow ───────────────────────────────────────────────────────────────────
function TaskRow({ task, onToggle, onDelete, onMove, onEdit }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:h?"#FAFAF8":"white",
        borderRadius:8,border:"1px solid #EDE8E0",transition:"background 0.1s",opacity:task.done?0.48:1 }}>
      <button onClick={()=>onToggle(task.id)} style={{ width:18,height:18,border:`2px solid ${task.done?"#2A4A1E":"#C8BFB0"}`,
        borderRadius:4,background:task.done?"#2A4A1E":"white",color:"white",fontSize:10,display:"flex",
        alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",transition:"all 0.15s" }}>{task.done&&"✓"}</button>
      <Dot p={task.priority} />
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontSize:14,color:"#1C1C1C",fontWeight:task.done?400:500,
          textDecoration:task.done?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
          {task.recurrence && <span style={{ marginRight:5,fontSize:11 }}>🔄</span>}
          {task.title}
        </div>
        <div style={{ display:"flex",gap:7,marginTop:2,alignItems:"center",flexWrap:"wrap" }}>
          <Pill cat={task.category} small />
          <span style={{ fontSize:11,color:"#8B8278" }}>{task.assignee}</span>
          {task.dueDate && <span style={{ fontSize:11,color:"#C05621" }}>Due {task.dueDate}</span>}
          {task.recurrence
            ? <span style={{ fontSize:11,color:"#2A6A4A" }}>🔄 {task.recurrence}{task.scheduledTime?" · "+task.scheduledTime:""}</span>
            : task.scheduledDate && <span style={{ fontSize:11,color:"#2A6A4A" }}>📅 {task.scheduledDate}{task.scheduledTime?" "+task.scheduledTime:""}</span>}
        </div>
      </div>
      {h && (
        <div style={{ display:"flex",gap:4,flexShrink:0 }}>
          {[[()=>onMove(task.id,"up"),"↑","Higher priority",false],[()=>onMove(task.id,"down"),"↓","Lower priority",false],
            [()=>onEdit(task),"✎","Edit",false],[()=>onDelete(task.id),"✕","Delete",true]
          ].map(([fn,icon,title,danger],i)=>(
            <button key={i} onClick={fn} title={title} style={{ width:26,height:26,border:"1px solid",borderRadius:6,fontSize:12,
              cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
              borderColor:danger?"#FEB2B2":"#E2DAD0",background:danger?"#FFF5F5":"#F7F4EF",
              color:danger?"#C53030":"#5A5248" }}>{icon}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Notification Panel ────────────────────────────────────────────────────────
function NotifPanel({ tasks, onClose }) {
  const overdue  = tasks.filter(t => !t.done && t.dueDate && t.dueDate < TODAY);
  const today    = tasks.filter(t => !t.done && t.scheduledDate === TODAY && !t.recurrence);
  const upcoming = tasks.filter(t => !t.done && t.dueDate && t.dueDate > TODAY && t.dueDate <= WEEK[6]);
  const Section  = ({ title, color, items, itemColor, itemBorder }) => items.length === 0 ? null : (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:12,fontWeight:700,color,marginBottom:8,letterSpacing:"0.05em" }}>{title}</div>
      <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
        {items.map(t => (
          <div key={t.id} style={{ background:itemColor,border:`1px solid ${itemBorder}`,borderRadius:8,padding:"8px 10px" }}>
            <div style={{ fontSize:13,color:"#1C1C1C",fontWeight:500 }}>{t.title}</div>
            <div style={{ fontSize:11,color:"#8B8278",marginTop:3,display:"flex",alignItems:"center",gap:6 }}>
              <Pill cat={t.category} small />
              <span>{t.assignee}</span>
              {t.dueDate && <span style={{ color:"#C05621" }}>Due {t.dueDate}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div style={{ position:"fixed",top:0,right:0,width:320,height:"100vh",background:"white",
      borderLeft:"1px solid #EDE8E0",zIndex:300,boxShadow:"-4px 0 24px rgba(0,0,0,0.1)",display:"flex",flexDirection:"column" }}>
      <div style={{ padding:"20px 20px 16px",borderBottom:"1px solid #EDE8E0",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:600 }}>Alerts</h2>
        <button onClick={onClose} style={{ background:"none",border:"none",fontSize:18,color:"#8B8278",cursor:"pointer" }}>✕</button>
      </div>
      <div style={{ flex:1,overflow:"auto",padding:16 }}>
        <Section title={`⚠ Overdue (${overdue.length})`} color="#C53030" items={overdue} itemColor="#FFF5F5" itemBorder="#FED7D7" />
        <Section title={`📅 Today (${today.length})`} color="#C05621" items={today} itemColor="#FFFAF0" itemBorder="#FBD38D" />
        <Section title={`📆 This Week (${upcoming.length})`} color="#2A6A4A" items={upcoming} itemColor="#F0FFF4" itemBorder="#C6F6D5" />
        {overdue.length+today.length+upcoming.length === 0 && (
          <div style={{ textAlign:"center",padding:"40px 0",color:"#8B8278",fontSize:14 }}>All clear! ✓</div>
        )}
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ tasks, onToggle, onAdd, onSchedule, onReprioritize, loading, setView }) {
  const expanded = expandRecurring(tasks, WEEK);
  const overdue  = tasks.filter(t => !t.done && t.dueDate && t.dueDate < TODAY);
  const todayAll = expanded.filter(t => t.scheduledDate === TODAY && !t.done)
    .sort((a,b) => (a.scheduledTime||"").localeCompare(b.scheduledTime||""));
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28 }}>
        <div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:600,color:"#1C1C1C",lineHeight:1 }}>Good morning ✦</h1>
          <p style={{ color:"#8B8278",marginTop:5,fontSize:15 }}>Monday, 25 May 2026 · {tasks.filter(t=>!t.done).length} tasks remaining</p>
        </div>
        <div style={{ display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end" }}>
          <button onClick={onAdd} style={{ padding:"10px 18px",background:"white",border:"1px solid #E2DAD0",borderRadius:8,fontSize:14,color:"#2A4A1E",fontWeight:500,cursor:"pointer" }}>+ Add</button>
          <button onClick={onReprioritize} disabled={loading} style={{ padding:"10px 18px",background:"white",border:"1px solid #FAA",borderRadius:8,fontSize:14,color:"#7B341E",fontWeight:500,cursor:"pointer",opacity:loading?0.6:1 }}>↻ Reprioritize</button>
          <button onClick={onSchedule} disabled={loading} style={{ padding:"10px 18px",background:"#2A4A1E",border:"none",borderRadius:8,fontSize:14,color:"white",fontWeight:500,cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1 }}>
            {loading?"⟳ Thinking…":"✦ Auto-Schedule"}</button>
        </div>
      </div>

      {overdue.length > 0 && (
        <div style={{ background:"#FFF8F5",border:"1px solid #FCC",borderRadius:10,padding:"12px 16px",marginBottom:18,display:"flex",gap:10,alignItems:"center" }}>
          <span style={{ fontSize:18 }}>⚠</span>
          <div style={{ fontSize:14,color:"#7B341E",flex:1 }}>
            <b>{overdue.length} overdue:</b> {overdue.map(t=>t.title).slice(0,3).join(", ")}{overdue.length>3?"…":""}
          </div>
          <button onClick={onReprioritize} style={{ fontSize:12,color:"#7B341E",background:"none",border:"1px solid #FAA",borderRadius:6,padding:"4px 10px",cursor:"pointer" }}>Fix →</button>
        </div>
      )}

      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22 }}>
        {[["Total",tasks.length,"≡"],["Done",tasks.filter(t=>t.done).length,"✓"],
          ["Scheduled",tasks.filter(t=>t.scheduledDate||t.recurrence).length,"◻"],
          ["Due This Week",tasks.filter(t=>t.dueDate&&t.dueDate>=WEEK[0]&&t.dueDate<=WEEK[6]).length,"◈"]
        ].map(([l,v,i])=>(
          <div key={l} style={{ background:"white",border:"1px solid #EDE8E0",borderRadius:10,padding:"16px 18px" }}>
            <div style={{ fontSize:11,color:"#8B8278",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4 }}>{i} {l}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:30,fontWeight:600,color:"#1C1C1C",lineHeight:1 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1.15fr 0.85fr",gap:20 }}>
        <div style={{ background:"white",border:"1px solid #EDE8E0",borderRadius:12,padding:20 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:600 }}>Today's Schedule</h2>
            <button onClick={()=>setView("calendar")} style={{ fontSize:12,color:"#2A4A1E",background:"none",border:"none",cursor:"pointer",textDecoration:"underline" }}>Full week →</button>
          </div>
          {todayAll.length === 0 ? (
            <div style={{ textAlign:"center",padding:"28px 0",color:"#8B8278" }}>
              <div style={{ fontSize:13,marginBottom:10 }}>Nothing scheduled for today.</div>
              <button onClick={onSchedule} disabled={loading} style={{ padding:"8px 16px",background:"#2A4A1E",color:"white",border:"none",borderRadius:7,fontSize:13,cursor:"pointer" }}>
                {loading?"Scheduling…":"Auto-Schedule Week"}</button>
            </div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
              {todayAll.map(t => (
                <div key={t.id} style={{ display:"flex",gap:10,alignItems:"center",padding:"8px 10px",background:"#F7F4EF",borderRadius:8 }}>
                  <span style={{ fontSize:11,color:"#8B8278",minWidth:40,fontVariantNumeric:"tabular-nums" }}>{t.scheduledTime||"—"}</span>
                  <button onClick={()=>onToggle(t.id)} style={{ width:15,height:15,border:`2px solid ${t.done?"#2A4A1E":"#C8BFB0"}`,borderRadius:3,background:t.done?"#2A4A1E":"white",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:9 }}>{t.done&&"✓"}</button>
                  <span style={{ fontSize:13,flex:1,color:"#1C1C1C",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textDecoration:t.done?"line-through":"none" }}>
                    {t.isInst&&"🔄 "}{t.title}
                  </span>
                  <Pill cat={t.category} small />
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ background:"white",border:"1px solid #EDE8E0",borderRadius:12,padding:20 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:600,marginBottom:14 }}>By Category</h2>
          {Object.entries(CATS).map(([key,cat]) => {
            const all=tasks.filter(t=>t.category===key), left=all.filter(t=>!t.done).length;
            const pct=all.length?Math.round((all.length-left)/all.length*100):0;
            return (
              <div key={key} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
                <span style={{ width:18,fontSize:13,textAlign:"center" }}>{cat.e}</span>
                <span style={{ fontSize:13,color:"#3A3530",flex:1 }}>{cat.l}</span>
                <div style={{ width:60,height:3,background:"#EDE8E0",borderRadius:2 }}>
                  <div style={{ height:"100%",width:`${pct}%`,background:cat.c,borderRadius:2,transition:"width 0.4s" }} />
                </div>
                <span style={{ fontSize:12,color:"#8B8278",minWidth:18,textAlign:"right" }}>{left}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── All Tasks List ────────────────────────────────────────────────────────────
function ListView({ tasks, onToggle, onDelete, onMove, onEdit, onAdd }) {
  const [catF,setCatF] = useState("all");
  const [who,setWho]   = useState("all");
  const [showDone,setShowDone] = useState(false);
  const catOpts = [["all","All"],...Object.entries(CATS).map(([k,v])=>[k,v.e+" "+v.l])];
  let vis = [...tasks];
  if (catF !== "all") vis = vis.filter(t=>t.category===catF);
  if (who !== "all")  vis = vis.filter(t=>t.assignee===who||t.assignee==="Both");
  if (!showDone)      vis = vis.filter(t=>!t.done);
  vis.sort((a,b)=>a.priority-b.priority||a.title.localeCompare(b.title));
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:600,color:"#1C1C1C" }}>All Tasks</h1>
        <button onClick={onAdd} style={{ padding:"10px 18px",background:"#2A4A1E",border:"none",borderRadius:8,fontSize:14,color:"white",fontWeight:500,cursor:"pointer" }}>+ Add Task</button>
      </div>
      <div style={{ display:"flex",gap:8,marginBottom:18,flexWrap:"wrap",alignItems:"center" }}>
        {catOpts.map(([k,l]) => (
          <button key={k} onClick={()=>setCatF(k)} style={{ padding:"5px 13px",borderRadius:20,border:"1px solid",cursor:"pointer",fontSize:13,fontWeight:500,
            borderColor:catF===k?"#2A4A1E":"#E2DAD0",background:catF===k?"#2A4A1E":"white",color:catF===k?"white":"#5A5248" }}>{l}</button>
        ))}
        <div style={{ marginLeft:"auto",display:"flex",gap:6 }}>
          {["all","Bhargav","Rupa"].map(w => (
            <button key={w} onClick={()=>setWho(w)} style={{ padding:"5px 11px",borderRadius:20,border:"1px solid",cursor:"pointer",fontSize:12,
              borderColor:who===w?"#2A4A1E":"#E2DAD0",background:who===w?"#EEF4EB":"white",color:who===w?"#2A4A1E":"#5A5248" }}>
              {w==="all"?"Everyone":w}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
        {vis.map(t=><TaskRow key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} onMove={onMove} onEdit={onEdit} />)}
        {vis.length===0&&<div style={{ textAlign:"center",padding:40,color:"#8B8278",fontSize:14 }}>
          {tasks.filter(t=>!t.done).length===0?"All done! 🎉":"No tasks match this filter."}
        </div>}
      </div>
      <button onClick={()=>setShowDone(!showDone)} style={{ marginTop:14,background:"none",border:"none",color:"#8B8278",fontSize:13,cursor:"pointer",textDecoration:"underline" }}>
        {showDone?"Hide":"Show"} completed ({tasks.filter(t=>t.done).length})
      </button>
    </div>
  );
}

// ── Calendar View ─────────────────────────────────────────────────────────────
function CalView({ tasks, onToggle }) {
  const expanded    = expandRecurring(tasks, WEEK);
  const unscheduled = tasks.filter(t=>!t.scheduledDate&&!t.done&&!t.recurrence);
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:22 }}>
        <div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:600,color:"#1C1C1C" }}>This Week</h1>
          <p style={{ color:"#8B8278",fontSize:14 }}>May 25 – 31, 2026</p>
        </div>
        <button onClick={()=>exportICS(tasks)} style={{ padding:"10px 18px",background:"white",border:"1px solid #E2DAD0",borderRadius:8,fontSize:13,color:"#2A4A1E",fontWeight:500,cursor:"pointer",display:"flex",gap:6,alignItems:"center" }}>
          ↓ Export .ics
        </button>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:10,marginBottom:22 }}>
        {WEEK.map((date,i) => {
          const dayTasks = expanded.filter(t=>t.scheduledDate===date)
            .sort((a,b)=>a.priority-b.priority||(a.scheduledTime||"").localeCompare(b.scheduledTime||""));
          const isToday = i===0;
          return (
            <div key={date} style={{ background:"white",border:`1px solid ${isToday?"#2A4A1E":"#EDE8E0"}`,borderRadius:10,padding:12,minHeight:180 }}>
              <div style={{ marginBottom:8 }}>
                <div style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:isToday?"#2A4A1E":"#8B8278" }}>{DAY_NAMES[i]}</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,color:"#1C1C1C" }}>{parseInt(date.split("-")[2])}</div>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
                {dayTasks.map(t=>(
                  <div key={t.id} onClick={()=>onToggle(t.id)} style={{
                    background:CATS[t.category]?.b||"#F7F4EF",
                    borderLeft:`3px solid ${CATS[t.category]?.c||"#ccc"}`,
                    borderRadius:"0 5px 5px 0",padding:"5px 7px",cursor:"pointer",opacity:t.done?0.4:1,transition:"opacity 0.15s" }}>
                    {t.scheduledTime&&<div style={{ fontSize:9,color:CATS[t.category]?.c,fontWeight:700,marginBottom:1 }}>{t.scheduledTime}</div>}
                    <div style={{ fontSize:11,color:"#1C1C1C",fontWeight:500,lineHeight:1.3,textDecoration:t.done?"line-through":"none" }}>
                      {t.isInst&&"🔄 "}{t.title}
                    </div>
                    <div style={{ fontSize:10,color:"#8B8278",marginTop:1 }}>{t.assignee}</div>
                  </div>
                ))}
                {dayTasks.length===0&&<div style={{ fontSize:11,color:"#DDD5C8",textAlign:"center",marginTop:16 }}>—</div>}
              </div>
            </div>
          );
        })}
      </div>
      {unscheduled.length > 0 && (
        <div style={{ background:"white",border:"1px solid #EDE8E0",borderRadius:12,padding:20 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:600,marginBottom:12,color:"#8B8278" }}>Unscheduled · {unscheduled.length}</h2>
          <div style={{ display:"flex",flexWrap:"wrap",gap:7 }}>
            {unscheduled.sort((a,b)=>a.priority-b.priority).map(t=>(
              <div key={t.id} style={{ display:"flex",alignItems:"center",gap:6,background:CATS[t.category]?.b||"#F7F4EF",
                border:`1px solid ${CATS[t.category]?.c||"#ccc"}30`,borderRadius:7,padding:"5px 10px" }}>
                <Dot p={t.priority} />
                <span style={{ fontSize:12,color:"#1C1C1C" }}>{t.title}</span>
                <span style={{ fontSize:11,color:"#8B8278" }}>· {t.assignee}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── AI Assistant View ─────────────────────────────────────────────────────────
function AIView({ log, input, setInput, onSend, onSchedule, loading }) {
  const endRef = useRef(null);
  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[log]);
  const suggestions = [
    "Add swimming lessons for toddler on Saturday mornings, repeating weekly",
    "Make the date night highest priority",
    "Add milk, eggs, bread and butter to grocery list",
    "Remove the insurance call",
  ];
  return (
    <div style={{ maxWidth:680 }}>
      <h1 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:600,marginBottom:5,color:"#1C1C1C" }}>AI Assistant</h1>
      <p style={{ color:"#8B8278",marginBottom:22,fontSize:14 }}>Natural language task management · smart scheduling · auto-reprioritization</p>
      <button onClick={onSchedule} disabled={loading} style={{ width:"100%",padding:"14px",background:"#2A4A1E",color:"white",border:"none",
        borderRadius:10,fontSize:14,fontWeight:500,cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1,marginBottom:22 }}>
        {loading?"⟳ Working…":"✦ Auto-Schedule This Week"}
      </button>
      <div style={{ background:"white",border:"1px solid #EDE8E0",borderRadius:12,overflow:"hidden" }}>
        <div style={{ padding:20,minHeight:280,maxHeight:380,overflow:"auto" }}>
          {log.length===0?(
            <div style={{ color:"#8B8278",textAlign:"center",paddingTop:24 }}>
              <div style={{ fontSize:28,marginBottom:10 }}>✦</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:20,marginBottom:14 }}>Ask me anything</div>
              <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                {suggestions.map((s,i)=>(
                  <button key={i} onClick={()=>setInput(s)} style={{ fontSize:13,color:"#5A5248",background:"#F7F4EF",
                    border:"1px solid #EDE8E0",borderRadius:7,padding:"8px 12px",cursor:"pointer",textAlign:"left" }}>"{s}"</button>
                ))}
              </div>
            </div>
          ):(
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {log.map((m,i)=>(
                <div key={i} style={{ display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
                  <div style={{ maxWidth:"80%",padding:"10px 14px",borderRadius:10,lineHeight:1.55,fontSize:14,
                    background:m.role==="user"?"#2A4A1E":"#F7F4EF",color:m.role==="user"?"white":"#1C1C1C" }}>{m.text}</div>
                </div>
              ))}
              {loading&&<div style={{ fontSize:14,color:"#8B8278",padding:"10px 14px",background:"#F7F4EF",borderRadius:10,maxWidth:"50%" }}>Thinking…</div>}
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div style={{ borderTop:"1px solid #EDE8E0",padding:14,display:"flex",gap:10 }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&onSend()}
            placeholder="Add, change, or remove tasks in plain English…"
            style={{ flex:1,padding:"10px 14px",border:"1px solid #E2DAD0",borderRadius:8,fontSize:14,outline:"none" }} />
          <button onClick={onSend} disabled={loading||!input.trim()} style={{ padding:"10px 18px",background:"#2A4A1E",color:"white",border:"none",
            borderRadius:8,fontSize:14,fontWeight:500,cursor:"pointer",opacity:loading||!input.trim()?0.6:1 }}>Send</button>
        </div>
      </div>
    </div>
  );
}

// ── Task Modal ────────────────────────────────────────────────────────────────
function TaskModal({ task: init, onSave, onClose }) {
  const blank = { title:"",category:"tasks",priority:3,assignee:"Both",dueDate:"",duration:30,notes:"",
                  done:false,scheduledDate:null,scheduledTime:null,recurrence:null,completedDates:[] };
  const [form, setForm] = useState(init || blank);
  const f = (k,v) => setForm(x=>({...x,[k]:v}));
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(28,28,28,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }}>
      <div style={{ background:"white",borderRadius:16,padding:28,width:"100%",maxWidth:500,maxHeight:"92vh",overflow:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.18)" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:600 }}>{init?"Edit Task":"New Task"}</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",fontSize:20,color:"#8B8278",cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <Field label="Title">
            <input value={form.title} onChange={e=>f("title",e.target.value)} placeholder="What needs to be done?" autoFocus style={iStyle} />
          </Field>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <Field label="Category">
              <select value={form.category} onChange={e=>f("category",e.target.value)} style={iStyle}>
                {Object.entries(CATS).map(([k,v])=><option key={k} value={k}>{v.e} {v.l}</option>)}
              </select>
            </Field>
            <Field label="Assignee">
              <select value={form.assignee} onChange={e=>f("assignee",e.target.value)} style={iStyle}>
                {["Bhargav","Rupa","Both"].map(a=><option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <Field label="Priority">
              <select value={form.priority} onChange={e=>f("priority",+e.target.value)} style={iStyle}>
                {[[1,"Critical"],[2,"High"],[3,"Medium"],[4,"Low"],[5,"Someday"]].map(([p,l])=><option key={p} value={p}>{p} — {l}</option>)}
              </select>
            </Field>
            <Field label="Repeats">
              <select value={form.recurrence||""} onChange={e=>f("recurrence",e.target.value||null)} style={iStyle}>
                <option value="">One-time</option>
                <option value="daily">🔄 Daily</option>
                <option value="weekly">🔄 Weekly</option>
              </select>
            </Field>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <Field label="Due Date">
              <input type="date" value={form.dueDate||""} onChange={e=>f("dueDate",e.target.value)} style={iStyle} />
            </Field>
            <Field label="Duration (mins)">
              <input type="number" value={form.duration} onChange={e=>f("duration",+e.target.value)} min={5} step={5} style={iStyle} />
            </Field>
          </div>
          {form.recurrence && (
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              <Field label="Time">
                <input type="time" value={form.scheduledTime||""} onChange={e=>f("scheduledTime",e.target.value)} style={iStyle} />
              </Field>
              {form.recurrence==="weekly"&&(
                <Field label="Day of Week">
                  <select value={form.scheduledDate||WEEK[0]} onChange={e=>f("scheduledDate",e.target.value)} style={iStyle}>
                    {WEEK.map((d,i)=><option key={d} value={d}>{["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][i]}</option>)}
                  </select>
                </Field>
              )}
            </div>
          )}
          <Field label="Notes">
            <textarea value={form.notes} onChange={e=>f("notes",e.target.value)} rows={2}
              style={{ ...iStyle,resize:"none" }} />
          </Field>
        </div>
        <div style={{ display:"flex",gap:10,marginTop:20 }}>
          <button onClick={onClose} style={{ flex:1,padding:"11px",border:"1px solid #E2DAD0",borderRadius:8,background:"white",fontSize:14,color:"#5A5248",cursor:"pointer" }}>Cancel</button>
          <button onClick={()=>{ if(form.title.trim()) onSave({...form,completedDates:form.completedDates||[]}); }} disabled={!form.title.trim()}
            style={{ flex:2,padding:"11px",border:"none",borderRadius:8,background:"#2A4A1E",fontSize:14,color:"white",fontWeight:500,cursor:"pointer",opacity:form.title.trim()?1:0.6 }}>
            {init?"Save Changes":"Add Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Settings Modal ────────────────────────────────────────────────────────────
function SettingsModal({ apiKey: initial, onSave, onDelete, onClose }) {
  const [key, setKey] = useState(initial);
  const [showKey, setShowKey] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const hasKey = !!initial;
  const masked = initial ? initial.slice(0,6) + "••••••••••••" + initial.slice(-4) : "";
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(28,28,28,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }}>
      <div style={{ background:"white",borderRadius:16,padding:28,width:"100%",maxWidth:460,boxShadow:"0 24px 64px rgba(0,0,0,0.18)" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:600 }}>Settings</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",fontSize:20,color:"#8B8278",cursor:"pointer" }}>✕</button>
        </div>

        {/* Current key status */}
        {hasKey && (
          <div style={{ background:"#F0FFF4",border:"1px solid #C6F6D5",borderRadius:10,padding:"12px 14px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10 }}>
            <div>
              <div style={{ fontSize:11,fontWeight:700,color:"#2A6A4A",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2 }}>Active Key</div>
              <div style={{ fontSize:13,color:"#1C1C1C",fontFamily:"monospace" }}>{showKey ? initial : masked}</div>
            </div>
            <button onClick={()=>setShowKey(s=>!s)} style={{ fontSize:12,color:"#2A6A4A",background:"none",border:"1px solid #C6F6D5",borderRadius:6,padding:"4px 9px",cursor:"pointer",flexShrink:0 }}>
              {showKey?"Hide":"Show"}
            </button>
          </div>
        )}

        <Field label={hasKey ? "Replace Key" : "Gemini API Key"}>
          <input type="password" value={key} onChange={e=>setKey(e.target.value)}
            placeholder="AIza..." style={iStyle} />
        </Field>
        <p style={{ fontSize:12,color:"#8B8278",marginTop:8,lineHeight:1.6 }}>
          Get a free key at <b>aistudio.google.com</b> → Get API Key.<br/>
          Stored only in your browser — never sent anywhere except Google.
        </p>

        <div style={{ display:"flex",gap:10,marginTop:20 }}>
          {hasKey && !confirmDelete && (
            <button onClick={()=>setConfirmDelete(true)}
              style={{ flex:1,padding:"11px",border:"1px solid #FEB2B2",borderRadius:8,background:"#FFF5F5",fontSize:14,color:"#C53030",cursor:"pointer" }}>
              🗑 Delete Key
            </button>
          )}
          {hasKey && confirmDelete && (
            <button onClick={onDelete}
              style={{ flex:1,padding:"11px",border:"none",borderRadius:8,background:"#C53030",fontSize:14,color:"white",fontWeight:600,cursor:"pointer" }}>
              Confirm Delete
            </button>
          )}
          {!hasKey && (
            <button onClick={onClose} style={{ flex:1,padding:"11px",border:"1px solid #E2DAD0",borderRadius:8,background:"white",fontSize:14,color:"#5A5248",cursor:"pointer" }}>Cancel</button>
          )}
          <button onClick={()=>{ if(key.trim()) onSave(key.trim()); }} disabled={!key.trim()}
            style={{ flex:2,padding:"11px",border:"none",borderRadius:8,background:"#2A4A1E",fontSize:14,color:"white",fontWeight:500,cursor:"pointer",opacity:key.trim()?1:0.6 }}>
            {hasKey ? "Update Key" : "Save Key"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tasks, setTasks]           = useState([]);
  const [ver, setVer]               = useState(0);
  const [view, setView]             = useState("dashboard");
  const [user, setUser]             = useState("Bhargav");
  const [showAdd, setShowAdd]       = useState(false);
  const [editTask, setEditTask]     = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [apiKey, setApiKey]         = useState("");
  const [aiLog, setAiLog]           = useState([]);
  const [aiInput, setAiInput]       = useState("");
  const [aiLoading, setAiLoading]   = useState(false);
  const [syncMsg, setSyncMsg]       = useState("synced");

  const isMobile = () => window.innerWidth < 768;

  // Init
  useEffect(() => {
    loadData().then(({ tasks: t, ver: v }) => { setTasks(t); setVer(v); });
    loadUser().then(setUser);
    setApiKey(loadApiKey());
    reqNotif();
  }, []);


  const persist = async (newTasks) => {
    setTasks(newTasks);
    setSyncMsg("syncing");
    const v = await persistData(newTasks);
    setVer(v);
    setSyncMsg("synced");
  };

  const toggleDone = (id) => {
    if (id.includes("__")) {
      const [tid, date] = id.split("__");
      persist(tasks.map(t => {
        if (t.id !== tid) return t;
        const cd = t.completedDates || [];
        return { ...t, completedDates: cd.includes(date) ? cd.filter(d=>d!==date) : [...cd,date] };
      }));
    } else {
      persist(tasks.map(t => t.id===id ? {...t,done:!t.done} : t));
    }
  };

  const deleteTask = id => persist(tasks.filter(t=>t.id!==id));

  const saveTask = task => {
    if (task.id && tasks.find(t=>t.id===task.id)) persist(tasks.map(t=>t.id===task.id?task:t));
    else persist([...tasks,{...task,id:uid()}]);
    setShowAdd(false); setEditTask(null);
  };

  const movePriority = (id, dir) => {
    const sorted = [...tasks].sort((a,b)=>a.priority-b.priority||a.id.localeCompare(b.id));
    const idx = sorted.findIndex(t=>t.id===id);
    const swap = dir==="up"?idx-1:idx+1;
    if (swap<0||swap>=sorted.length) return;
    const [p1,p2] = [sorted[idx].priority,sorted[swap].priority];
    persist(tasks.map(t=>{
      if(t.id===sorted[idx].id) return {...t,priority:p2};
      if(t.id===sorted[swap].id) return {...t,priority:p1};
      return t;
    }));
  };

  const switchUser = async (u) => { setUser(u); await saveUser(u); };

  const geminiUrl = () =>
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const geminiCall = (prompt) => fetch(geminiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 1500 } }),
  });
  const geminiText = (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // AI: Auto-schedule
  const autoSchedule = async () => {
    if (!apiKey) { setShowSettings(true); return; }
    setAiLoading(true);
    const toSched = tasks.filter(t=>!t.done&&!t.recurrence);
    try {
      const res = await geminiCall(
`Schedule tasks for Bhargav & Rupa (couple with toddler), week ${WEEK[0]}–${WEEK[6]}.
Tasks: ${JSON.stringify(toSched.map(t=>({id:t.id,title:t.title,category:t.category,priority:t.priority,assignee:t.assignee,duration:t.duration,dueDate:t.dueDate})))}
Rules: Workouts 06:00–07:30 weekday mornings. Toddler 08:30–11:00. Work blocks Mon–Fri 09:00–18:00. Grocery Sat/Sun mornings or weekday evenings 19:30+. Date night Sat 19:30+. Family dinner Sun 17:00. P1→Mon-Tue, P2→Wed-Fri, P3+→weekend. Honour dueDate.
Return ONLY JSON array: [{"id":"...","scheduledDate":"YYYY-MM-DD","scheduledTime":"HH:MM"}]`
      );
      const data = await res.json();
      const sched = JSON.parse((geminiText(data)||"[]").replace(/```json|```/g,"").trim());
      const updated = tasks.map(t=>{ const s=sched.find(x=>x.id===t.id); return s?{...t,scheduledDate:s.scheduledDate,scheduledTime:s.scheduledTime}:t; });
      await persist(updated);
      pushNotif("Family HQ","Week scheduled! "+sched.length+" tasks placed.");
      setAiLog(l=>[...l,{role:"ai",text:`✨ Scheduled ${sched.length} tasks for the week!`}]);
      setView("calendar");
    } catch { setAiLog(l=>[...l,{role:"ai",text:"Scheduling failed. Try again."}]); }
    setAiLoading(false);
  };

  // AI: Reprioritize overdue
  const autoReprioritize = async () => {
    if (!apiKey) { setShowSettings(true); return; }
    setAiLoading(true);
    const overdue = tasks.filter(t=>!t.done&&t.dueDate&&t.dueDate<TODAY);
    if (!overdue.length) { setAiLog(l=>[...l,{role:"ai",text:"No overdue tasks — you're on top of it! 🎉"}]); setView("ai"); setAiLoading(false); return; }
    try {
      const res = await geminiCall(
`Reprioritize these overdue tasks for Bhargav & Rupa. Assign new priority (1=Critical–5=Someday) and reschedule this week.
Overdue: ${JSON.stringify(overdue.map(t=>({id:t.id,title:t.title,category:t.category,priority:t.priority,dueDate:t.dueDate,assignee:t.assignee})))}
Week dates: ${WEEK.join(", ")}
Return ONLY JSON: [{"id":"...","priority":1,"scheduledDate":"YYYY-MM-DD","scheduledTime":"HH:MM"}]`
      );
      const data = await res.json();
      const updates = JSON.parse((geminiText(data)||"[]").replace(/```json|```/g,"").trim());
      const updated = tasks.map(t=>{ const u=updates.find(x=>x.id===t.id); return u?{...t,...u}:t; });
      await persist(updated);
      setAiLog(l=>[...l,{role:"ai",text:`✅ Reprioritized and rescheduled ${updates.length} overdue tasks.`}]);
      setView("ai");
    } catch { setAiLog(l=>[...l,{role:"ai",text:"Reprioritization failed."}]); }
    setAiLoading(false);
  };

  // AI: Natural language chat
  const sendChat = async () => {
    const msg = aiInput.trim();
    if (!msg) return;
    if (!apiKey) { setShowSettings(true); return; }
    setAiInput(""); setAiLog(l=>[...l,{role:"user",text:msg}]); setAiLoading(true);
    try {
      const res = await geminiCall(
`Manage tasks for Bhargav & Rupa (toddler family). Current tasks: ${JSON.stringify(tasks.map(t=>({id:t.id,title:t.title,category:t.category,priority:t.priority,assignee:t.assignee,done:t.done,scheduledDate:t.scheduledDate,recurrence:t.recurrence})))}
User (${user}): "${msg}"
Return ONLY one of these JSON actions (no markdown):
{"action":"add","task":{"title":"...","category":"tasks|grocery|toddler|dinner|date|workout","priority":1-5,"assignee":"Bhargav|Rupa|Both","dueDate":"YYYY-MM-DD or null","duration":30,"notes":"","recurrence":"daily|weekly|null","done":false,"scheduledDate":null,"scheduledTime":null,"completedDates":[]}}
{"action":"update","id":"...","changes":{...}}
{"action":"delete","id":"..."}
{"action":"chat","message":"..."}`
      );
      const data = await res.json();
      const result = JSON.parse((geminiText(data)||"{}").replace(/```json|```/g,"").trim());
      if (result.action==="add") {
        const nt={...result.task,id:uid()};
        await persist([...tasks,nt]);
        setAiLog(l=>[...l,{role:"ai",text:`Added "${nt.title}" to ${CATS[nt.category]?.l||nt.category}.${nt.recurrence?" Repeats "+nt.recurrence+".":""}`}]);
      } else if (result.action==="update") {
        await persist(tasks.map(t=>t.id===result.id?{...t,...result.changes}:t));
        setAiLog(l=>[...l,{role:"ai",text:`Updated "${tasks.find(t=>t.id===result.id)?.title||"task"}".`}]);
      } else if (result.action==="delete") {
        const title=tasks.find(t=>t.id===result.id)?.title;
        await persist(tasks.filter(t=>t.id!==result.id));
        setAiLog(l=>[...l,{role:"ai",text:`Removed "${title}".`}]);
      } else {
        setAiLog(l=>[...l,{role:"ai",text:result.message||"Done!"}]);
      }
    } catch { setAiLog(l=>[...l,{role:"ai",text:"Something went wrong."}]); }
    setAiLoading(false);
  };

  const alertCount = tasks.filter(t=>!t.done&&((t.dueDate&&t.dueDate<=TODAY)||(t.scheduledDate===TODAY))).length;
  const syncColors = { synced:"rgba(255,255,255,0.25)", syncing:"#D69E2E", updated:"#38A169" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input,select,textarea,button{font-family:'DM Sans',sans-serif;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#F7F4EF;} ::-webkit-scrollbar-thumb{background:#C8BFB0;border-radius:2px;}
      `}</style>

      <div style={{ display:"flex",minHeight:"100vh",background:"#F7F4EF",fontFamily:"'DM Sans',sans-serif" }}>

        {/* ── Mobile sidebar backdrop ── */}
        {sidebarOpen && isMobile() && (
          <div onClick={()=>setSidebarOpen(false)} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:150 }} />
        )}

        {/* ── Sidebar ── */}
        <aside style={{ width:224,background:"#1E3612",color:"white",display:"flex",flexDirection:"column",flexShrink:0,
          ...(isMobile() ? { position:"fixed",top:0,left:0,height:"100vh",zIndex:200,
            transform:sidebarOpen?"translateX(0)":"translateX(-100%)",transition:"transform 0.25s ease" } : {}) }}>
          <div style={{ padding:"24px 20px 18px",borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:21,fontWeight:600,lineHeight:1.2 }}>Family HQ</div>
            <div style={{ fontSize:10,opacity:0.35,letterSpacing:"0.12em",textTransform:"uppercase",marginTop:2,marginBottom:14 }}>Life Planner</div>
            {/* User switcher */}
            <div style={{ display:"flex",gap:6 }}>
              {["Bhargav","Rupa"].map(u=>(
                <button key={u} onClick={()=>switchUser(u)} style={{ flex:1,padding:"7px 4px",borderRadius:7,border:"1px solid",cursor:"pointer",fontSize:12,fontWeight:500,transition:"all 0.15s",
                  borderColor:user===u?"rgba(255,255,255,0.55)":"rgba(255,255,255,0.15)",
                  background:user===u?"rgba(255,255,255,0.15)":"transparent",
                  color:user===u?"white":"rgba(255,255,255,0.38)" }}>{u[0]} {u}</button>
              ))}
            </div>
          </div>

          <nav style={{ padding:"14px 0",flex:1 }}>
            {[["dashboard","◈","Dashboard"],["lists","≡","All Tasks"],["calendar","◻","Schedule"],["ai","✦","AI Assistant"]].map(([v,icon,label])=>(
              <button key={v} onClick={()=>{ setView(v); if(isMobile()) setSidebarOpen(false); }} style={{ width:"100%",display:"flex",alignItems:"center",gap:10,padding:"11px 20px",
                background:view===v?"rgba(255,255,255,0.1)":"transparent",border:"none",
                borderLeft:view===v?"2px solid #8DC76B":"2px solid transparent",
                color:view===v?"white":"rgba(255,255,255,0.38)",fontSize:14,cursor:"pointer",transition:"all 0.15s",textAlign:"left" }}>
                <span style={{ fontSize:15,lineHeight:1 }}>{icon}</span>{label}
              </button>
            ))}
          </nav>

          <div style={{ padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",flexDirection:"column",gap:8 }}>
            <button onClick={()=>setShowNotifs(!showNotifs)} style={{ width:"100%",padding:"9px",borderRadius:8,border:"1px solid rgba(255,255,255,0.18)",background:"transparent",color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontSize:13 }}>
              🔔 Alerts
              {alertCount>0&&<span style={{ background:"#E53E3E",color:"white",borderRadius:10,padding:"1px 6px",fontSize:11,fontWeight:700 }}>{alertCount}</span>}
            </button>
            <button onClick={()=>setShowSettings(true)} style={{ width:"100%",padding:"9px",borderRadius:8,border:"1px solid rgba(255,255,255,0.18)",background:apiKey?"transparent":"rgba(214,158,46,0.25)",color:apiKey?"rgba(255,255,255,0.5)":"#FBD38D",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
              ⚙ {apiKey?"Settings":"Set AI Key"}
            </button>
            <div style={{ textAlign:"center",fontSize:11 }}>
              <span style={{ display:"inline-block",width:6,height:6,borderRadius:"50%",background:syncColors[syncMsg],marginRight:4,verticalAlign:"middle" }} />
              <span style={{ opacity:0.35 }}>{syncMsg==="syncing"?"Saving…":"Synced"}</span>
            </div>
            <div style={{ textAlign:"center",fontSize:11,opacity:0.28 }}>{tasks.filter(t=>t.done).length}/{tasks.length} done</div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={{ flex:1,overflow:"auto",padding:isMobile()?"16px 16px 16px 16px":"32px 36px" }}>
          {isMobile() && (
            <button onClick={()=>setSidebarOpen(s=>!s)} style={{ marginBottom:16,background:"#1E3612",border:"none",borderRadius:8,color:"white",padding:"8px 12px",fontSize:18,cursor:"pointer",lineHeight:1 }}>☰</button>
          )}
          {view==="dashboard"&&<Dashboard tasks={tasks} onToggle={toggleDone} onAdd={()=>setShowAdd(true)} onSchedule={autoSchedule} onReprioritize={autoReprioritize} loading={aiLoading} setView={setView} />}
          {view==="lists"    &&<ListView  tasks={tasks} onToggle={toggleDone} onDelete={deleteTask} onMove={movePriority} onEdit={t=>setEditTask(t)} onAdd={()=>setShowAdd(true)} />}
          {view==="calendar" &&<CalView   tasks={tasks} onToggle={toggleDone} />}
          {view==="ai"       &&<AIView    log={aiLog} input={aiInput} setInput={setAiInput} onSend={sendChat} onSchedule={autoSchedule} loading={aiLoading} />}
        </main>
      </div>

      {/* ── Notification panel ── */}
      {showNotifs&&(
        <>
          <div onClick={()=>setShowNotifs(false)} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.2)",zIndex:299 }} />
          <NotifPanel tasks={tasks} onClose={()=>setShowNotifs(false)} />
        </>
      )}

      {/* ── Modals ── */}
      {(showAdd||editTask)&&<TaskModal task={editTask} onSave={saveTask} onClose={()=>{setShowAdd(false);setEditTask(null);}} />}
      {showSettings&&<SettingsModal apiKey={apiKey} onSave={k=>{setApiKey(k);saveApiKey(k);setShowSettings(false);}} onDelete={()=>{setApiKey("");saveApiKey("");setShowSettings(false);}} onClose={()=>setShowSettings(false)} />}
    </>
  );
}
