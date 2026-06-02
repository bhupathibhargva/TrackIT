import { CATS, WEEK, DAY_NAMES } from "../constants.js";
import { expandRecurring, exportICS } from "../utils.js";
import { Dot } from "./Pill.jsx";

export function CalView({ tasks, onToggle }) {
  const expanded    = expandRecurring(tasks, WEEK);
  const unscheduled = tasks.filter(t => !t.scheduledDate && !t.done && !t.recurrence);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:22 }}>
        <div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:34, fontWeight:600, color:"#1C1C1C" }}>This Week</h1>
          <p style={{ color:"#8B8278", fontSize:14 }}>May 25 – 31, 2026</p>
        </div>
        <button onClick={() => exportICS(tasks)}
          style={{ padding:"10px 18px", background:"white", border:"1px solid #E2DAD0", borderRadius:8, fontSize:13, color:"#2A4A1E", fontWeight:500, cursor:"pointer", display:"flex", gap:6, alignItems:"center" }}>
          ↓ Export .ics
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:10, marginBottom:22 }}>
        {WEEK.map((date, i) => {
          const dayTasks = expanded.filter(t => t.scheduledDate === date)
            .sort((a,b) => a.priority - b.priority || (a.scheduledTime||"").localeCompare(b.scheduledTime||""));
          const isToday = i === 0;
          return (
            <div key={date} style={{ background:"white", border:`1px solid ${isToday?"#2A4A1E":"#EDE8E0"}`, borderRadius:10, padding:12, minHeight:180 }}>
              <div style={{ marginBottom:8 }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:isToday?"#2A4A1E":"#8B8278" }}>{DAY_NAMES[i]}</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:600, color:"#1C1C1C" }}>{parseInt(date.split("-")[2])}</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {dayTasks.map(t => (
                  <div key={t.id} onClick={() => onToggle(t.id)}
                    style={{ background:CATS[t.category]?.b||"#F7F4EF", borderLeft:`3px solid ${CATS[t.category]?.c||"#ccc"}`,
                      borderRadius:"0 5px 5px 0", padding:"5px 7px", cursor:"pointer", opacity:t.done?0.4:1, transition:"opacity 0.15s" }}>
                    {t.scheduledTime && (
                      <div style={{ fontSize:9, color:CATS[t.category]?.c, fontWeight:700, marginBottom:1 }}>{t.scheduledTime}</div>
                    )}
                    <div style={{ fontSize:11, color:"#1C1C1C", fontWeight:500, lineHeight:1.3, textDecoration:t.done?"line-through":"none" }}>
                      {t.isInst && "🔄 "}{t.title}
                    </div>
                    <div style={{ fontSize:10, color:"#8B8278", marginTop:1 }}>{t.assignee}</div>
                  </div>
                ))}
                {dayTasks.length === 0 && (
                  <div style={{ fontSize:11, color:"#DDD5C8", textAlign:"center", marginTop:16 }}>—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {unscheduled.length > 0 && (
        <div style={{ background:"white", border:"1px solid #EDE8E0", borderRadius:12, padding:20 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, marginBottom:12, color:"#8B8278" }}>
            Unscheduled · {unscheduled.length}
          </h2>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
            {unscheduled.sort((a,b) => a.priority - b.priority).map(t => (
              <div key={t.id}
                style={{ display:"flex", alignItems:"center", gap:6, background:CATS[t.category]?.b||"#F7F4EF",
                  border:`1px solid ${CATS[t.category]?.c||"#ccc"}30`, borderRadius:7, padding:"5px 10px" }}>
                <Dot p={t.priority} />
                <span style={{ fontSize:12, color:"#1C1C1C" }}>{t.title}</span>
                <span style={{ fontSize:11, color:"#8B8278" }}>· {t.assignee}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
