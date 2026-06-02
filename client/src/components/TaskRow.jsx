import { useState } from "react";
import { Pill, Dot } from "./Pill.jsx";

export function TaskRow({ task, onToggle, onDelete, onMove, onEdit }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
        background:h?"#FAFAF8":"white", borderRadius:8, border:"1px solid #EDE8E0",
        transition:"background 0.1s", opacity:task.done?0.48:1 }}>
      <button onClick={()=>onToggle(task.id)}
        style={{ width:18, height:18, border:`2px solid ${task.done?"#2A4A1E":"#C8BFB0"}`,
          borderRadius:4, background:task.done?"#2A4A1E":"white", color:"white", fontSize:10,
          display:"flex", alignItems:"center", justifyContent:"center",
          flexShrink:0, cursor:"pointer", transition:"all 0.15s" }}>
        {task.done && "✓"}
      </button>
      <Dot p={task.priority} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, color:"#1C1C1C", fontWeight:task.done?400:500,
          textDecoration:task.done?"line-through":"none",
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {task.recurrence && <span style={{ marginRight:5, fontSize:11 }}>🔄</span>}
          {task.title}
        </div>
        <div style={{ display:"flex", gap:7, marginTop:2, alignItems:"center", flexWrap:"wrap" }}>
          <Pill cat={task.category} small />
          <span style={{ fontSize:11, color:"#8B8278" }}>{task.assignee}</span>
          {task.dueDate && <span style={{ fontSize:11, color:"#C05621" }}>Due {task.dueDate}</span>}
          {task.recurrence
            ? <span style={{ fontSize:11, color:"#2A6A4A" }}>🔄 {task.recurrence}{task.scheduledTime?" · "+task.scheduledTime:""}</span>
            : task.scheduledDate && <span style={{ fontSize:11, color:"#2A6A4A" }}>📅 {task.scheduledDate}{task.scheduledTime?" "+task.scheduledTime:""}</span>}
        </div>
      </div>
      {h && (
        <div style={{ display:"flex", gap:4, flexShrink:0 }}>
          {[
            [()=>onMove(task.id,"up"),  "↑", "Higher priority", false],
            [()=>onMove(task.id,"down"),"↓", "Lower priority",  false],
            [()=>onEdit(task),          "✎", "Edit",            false],
            [()=>onDelete(task.id),     "✕", "Delete",          true ],
          ].map(([fn,icon,title,danger],i) => (
            <button key={i} onClick={fn} title={title}
              style={{ width:26, height:26, border:"1px solid", borderRadius:6, fontSize:12,
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                borderColor:danger?"#FEB2B2":"#E2DAD0",
                background:danger?"#FFF5F5":"#F7F4EF",
                color:danger?"#C53030":"#5A5248" }}>
              {icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
