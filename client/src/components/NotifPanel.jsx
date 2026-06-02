import { TODAY, WEEK } from "../constants.js";
import { Pill } from "./Pill.jsx";

function Section({ title, color, items, itemColor, itemBorder }) {
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:12, fontWeight:700, color, marginBottom:8, letterSpacing:"0.05em" }}>{title}</div>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {items.map(t => (
          <div key={t.id} style={{ background:itemColor, border:`1px solid ${itemBorder}`, borderRadius:8, padding:"8px 10px" }}>
            <div style={{ fontSize:13, color:"#1C1C1C", fontWeight:500 }}>{t.title}</div>
            <div style={{ fontSize:11, color:"#8B8278", marginTop:3, display:"flex", alignItems:"center", gap:6 }}>
              <Pill cat={t.category} small />
              <span>{t.assignee}</span>
              {t.dueDate && <span style={{ color:"#C05621" }}>Due {t.dueDate}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NotifPanel({ tasks, onClose }) {
  const overdue  = tasks.filter(t => !t.done && t.dueDate && t.dueDate < TODAY);
  const today    = tasks.filter(t => !t.done && t.scheduledDate === TODAY && !t.recurrence);
  const upcoming = tasks.filter(t => !t.done && t.dueDate && t.dueDate > TODAY && t.dueDate <= WEEK[6]);
  return (
    <div style={{ position:"fixed", top:0, right:0, width:320, height:"100vh", background:"white",
      borderLeft:"1px solid #EDE8E0", zIndex:300, boxShadow:"-4px 0 24px rgba(0,0,0,0.1)",
      display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"20px 20px 16px", borderBottom:"1px solid #EDE8E0",
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:600 }}>Alerts</h2>
        <button onClick={onClose} style={{ background:"none", border:"none", fontSize:18, color:"#8B8278", cursor:"pointer" }}>✕</button>
      </div>
      <div style={{ flex:1, overflow:"auto", padding:16 }}>
        <Section title={`⚠ Overdue (${overdue.length})`}   color="#C53030" items={overdue}  itemColor="#FFF5F5" itemBorder="#FED7D7" />
        <Section title={`📅 Today (${today.length})`}       color="#C05621" items={today}    itemColor="#FFFAF0" itemBorder="#FBD38D" />
        <Section title={`📆 This Week (${upcoming.length})`} color="#2A6A4A" items={upcoming} itemColor="#F0FFF4" itemBorder="#C6F6D5" />
        {overdue.length + today.length + upcoming.length === 0 && (
          <div style={{ textAlign:"center", padding:"40px 0", color:"#8B8278", fontSize:14 }}>All clear! ✓</div>
        )}
      </div>
    </div>
  );
}
