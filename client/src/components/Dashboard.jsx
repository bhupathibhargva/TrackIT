import { CATS, WEEK, TODAY } from "../constants.js";
import { expandRecurring } from "../utils.js";
import { Pill } from "./Pill.jsx";

export function Dashboard({ tasks, onToggle, onAdd, onSchedule, onReprioritize, loading, setView }) {
  const expanded = expandRecurring(tasks, WEEK);
  const overdue  = tasks.filter(t => !t.done && t.dueDate && t.dueDate < TODAY);
  const todayAll = expanded.filter(t => t.scheduledDate === TODAY && !t.done)
    .sort((a,b) => (a.scheduledTime||"").localeCompare(b.scheduledTime||""));

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:34, fontWeight:600, color:"#1C1C1C", lineHeight:1 }}>Good morning ✦</h1>
          <p style={{ color:"#8B8278", marginTop:5, fontSize:15 }}>Monday, 25 May 2026 · {tasks.filter(t=>!t.done).length} tasks remaining</p>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"flex-end" }}>
          <button onClick={onAdd} style={{ padding:"10px 18px", background:"white", border:"1px solid #E2DAD0", borderRadius:8, fontSize:14, color:"#2A4A1E", fontWeight:500, cursor:"pointer" }}>+ Add</button>
          <button onClick={onReprioritize} disabled={loading} style={{ padding:"10px 18px", background:"white", border:"1px solid #FAA", borderRadius:8, fontSize:14, color:"#7B341E", fontWeight:500, cursor:"pointer", opacity:loading?0.6:1 }}>↻ Reprioritize</button>
          <button onClick={onSchedule} disabled={loading} style={{ padding:"10px 18px", background:"#2A4A1E", border:"none", borderRadius:8, fontSize:14, color:"white", fontWeight:500, cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1 }}>
            {loading ? "⟳ Thinking…" : "✦ Auto-Schedule"}
          </button>
        </div>
      </div>

      {overdue.length > 0 && (
        <div style={{ background:"#FFF8F5", border:"1px solid #FCC", borderRadius:10, padding:"12px 16px", marginBottom:18, display:"flex", gap:10, alignItems:"center" }}>
          <span style={{ fontSize:18 }}>⚠</span>
          <div style={{ fontSize:14, color:"#7B341E", flex:1 }}>
            <b>{overdue.length} overdue:</b> {overdue.map(t=>t.title).slice(0,3).join(", ")}{overdue.length>3?"…":""}
          </div>
          <button onClick={onReprioritize} style={{ fontSize:12, color:"#7B341E", background:"none", border:"1px solid #FAA", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Fix →</button>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
        {[
          ["Total",         tasks.length,                                                          "≡"],
          ["Done",          tasks.filter(t=>t.done).length,                                        "✓"],
          ["Scheduled",     tasks.filter(t=>t.scheduledDate||t.recurrence).length,                 "◻"],
          ["Due This Week", tasks.filter(t=>t.dueDate&&t.dueDate>=WEEK[0]&&t.dueDate<=WEEK[6]).length,"◈"],
        ].map(([l,v,i]) => (
          <div key={l} style={{ background:"white", border:"1px solid #EDE8E0", borderRadius:10, padding:"16px 18px" }}>
            <div style={{ fontSize:11, color:"#8B8278", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>{i} {l}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, fontWeight:600, color:"#1C1C1C", lineHeight:1 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.15fr 0.85fr", gap:20 }}>
        {/* Today's schedule */}
        <div style={{ background:"white", border:"1px solid #EDE8E0", borderRadius:12, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:600 }}>Today's Schedule</h2>
            <button onClick={()=>setView("calendar")} style={{ fontSize:12, color:"#2A4A1E", background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }}>Full week →</button>
          </div>
          {todayAll.length === 0 ? (
            <div style={{ textAlign:"center", padding:"28px 0", color:"#8B8278" }}>
              <div style={{ fontSize:13, marginBottom:10 }}>Nothing scheduled for today.</div>
              <button onClick={onSchedule} disabled={loading} style={{ padding:"8px 16px", background:"#2A4A1E", color:"white", border:"none", borderRadius:7, fontSize:13, cursor:"pointer" }}>
                {loading ? "Scheduling…" : "Auto-Schedule Week"}
              </button>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {todayAll.map(t => (
                <div key={t.id} style={{ display:"flex", gap:10, alignItems:"center", padding:"8px 10px", background:"#F7F4EF", borderRadius:8 }}>
                  <span style={{ fontSize:11, color:"#8B8278", minWidth:40, fontVariantNumeric:"tabular-nums" }}>{t.scheduledTime||"—"}</span>
                  <button onClick={()=>onToggle(t.id)} style={{ width:15, height:15, border:`2px solid ${t.done?"#2A4A1E":"#C8BFB0"}`, borderRadius:3, background:t.done?"#2A4A1E":"white", cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:9 }}>{t.done&&"✓"}</button>
                  <span style={{ fontSize:13, flex:1, color:"#1C1C1C", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", textDecoration:t.done?"line-through":"none" }}>
                    {t.isInst && "🔄 "}{t.title}
                  </span>
                  <Pill cat={t.category} small />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By category */}
        <div style={{ background:"white", border:"1px solid #EDE8E0", borderRadius:12, padding:20 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:600, marginBottom:14 }}>By Category</h2>
          {Object.entries(CATS).map(([key,cat]) => {
            const all = tasks.filter(t=>t.category===key);
            const left = all.filter(t=>!t.done).length;
            const pct = all.length ? Math.round((all.length-left)/all.length*100) : 0;
            return (
              <div key={key} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <span style={{ width:18, fontSize:13, textAlign:"center" }}>{cat.e}</span>
                <span style={{ fontSize:13, color:"#3A3530", flex:1 }}>{cat.l}</span>
                <div style={{ width:60, height:3, background:"#EDE8E0", borderRadius:2 }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:cat.c, borderRadius:2, transition:"width 0.4s" }} />
                </div>
                <span style={{ fontSize:12, color:"#8B8278", minWidth:18, textAlign:"right" }}>{left}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
