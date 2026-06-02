import { useState } from "react";
import { CATS } from "../constants.js";
import { TaskRow } from "./TaskRow.jsx";

export function ListView({ tasks, onToggle, onDelete, onMove, onEdit, onAdd }) {
  const [catF, setCatF]       = useState("all");
  const [who, setWho]         = useState("all");
  const [showDone, setShowDone] = useState(false);

  const catOpts = [["all","All"], ...Object.entries(CATS).map(([k,v]) => [k, v.e+" "+v.l])];
  let vis = [...tasks];
  if (catF !== "all") vis = vis.filter(t => t.category === catF);
  if (who !== "all")  vis = vis.filter(t => t.assignee === who || t.assignee === "Both");
  if (!showDone)      vis = vis.filter(t => !t.done);
  vis.sort((a,b) => a.priority - b.priority || a.title.localeCompare(b.title));

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:34, fontWeight:600, color:"#1C1C1C" }}>All Tasks</h1>
        <button onClick={onAdd} style={{ padding:"10px 18px", background:"#2A4A1E", border:"none", borderRadius:8, fontSize:14, color:"white", fontWeight:500, cursor:"pointer" }}>+ Add Task</button>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap", alignItems:"center" }}>
        {catOpts.map(([k,l]) => (
          <button key={k} onClick={() => setCatF(k)}
            style={{ padding:"5px 13px", borderRadius:20, border:"1px solid", cursor:"pointer", fontSize:13, fontWeight:500,
              borderColor:catF===k?"#2A4A1E":"#E2DAD0", background:catF===k?"#2A4A1E":"white", color:catF===k?"white":"#5A5248" }}>
            {l}
          </button>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
          {["all","Bhargav","Rupa"].map(w => (
            <button key={w} onClick={() => setWho(w)}
              style={{ padding:"5px 11px", borderRadius:20, border:"1px solid", cursor:"pointer", fontSize:12,
                borderColor:who===w?"#2A4A1E":"#E2DAD0", background:who===w?"#EEF4EB":"white", color:who===w?"#2A4A1E":"#5A5248" }}>
              {w==="all" ? "Everyone" : w}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {vis.map(t => (
          <TaskRow key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} onMove={onMove} onEdit={onEdit} />
        ))}
        {vis.length === 0 && (
          <div style={{ textAlign:"center", padding:40, color:"#8B8278", fontSize:14 }}>
            {tasks.filter(t => !t.done).length === 0 ? "All done! 🎉" : "No tasks match this filter."}
          </div>
        )}
      </div>

      <button onClick={() => setShowDone(!showDone)}
        style={{ marginTop:14, background:"none", border:"none", color:"#8B8278", fontSize:13, cursor:"pointer", textDecoration:"underline" }}>
        {showDone ? "Hide" : "Show"} completed ({tasks.filter(t => t.done).length})
      </button>
    </div>
  );
}
