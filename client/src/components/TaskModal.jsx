import { useState } from "react";
import { CATS, WEEK } from "../constants.js";
import { Field, iStyle } from "./Pill.jsx";

const BLANK = {
  title:"", category:"tasks", priority:3, assignee:"Both", dueDate:"", duration:30,
  notes:"", done:false, scheduledDate:null, scheduledTime:null, recurrence:null, completedDates:[],
};

export function TaskModal({ task: init, onSave, onClose }) {
  const [form, setForm] = useState(init || BLANK);
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }));

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(28,28,28,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
      <div style={{ background:"white", borderRadius:16, padding:28, width:"100%", maxWidth:500, maxHeight:"92vh", overflow:"auto", boxShadow:"0 24px 64px rgba(0,0,0,0.18)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:600 }}>{init ? "Edit Task" : "New Task"}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, color:"#8B8278", cursor:"pointer" }}>✕</button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Field label="Title">
            <input value={form.title} onChange={e => f("title", e.target.value)}
              placeholder="What needs to be done?" autoFocus style={iStyle} />
          </Field>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Category">
              <select value={form.category} onChange={e => f("category", e.target.value)} style={iStyle}>
                {Object.entries(CATS).map(([k,v]) => <option key={k} value={k}>{v.e} {v.l}</option>)}
              </select>
            </Field>
            <Field label="Assignee">
              <select value={form.assignee} onChange={e => f("assignee", e.target.value)} style={iStyle}>
                {["Bhargav","Rupa","Both"].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Priority">
              <select value={form.priority} onChange={e => f("priority", +e.target.value)} style={iStyle}>
                {[[1,"Critical"],[2,"High"],[3,"Medium"],[4,"Low"],[5,"Someday"]].map(([p,l]) => (
                  <option key={p} value={p}>{p} — {l}</option>
                ))}
              </select>
            </Field>
            <Field label="Repeats">
              <select value={form.recurrence||""} onChange={e => f("recurrence", e.target.value||null)} style={iStyle}>
                <option value="">One-time</option>
                <option value="daily">🔄 Daily</option>
                <option value="weekly">🔄 Weekly</option>
              </select>
            </Field>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Due Date">
              <input type="date" value={form.dueDate||""} onChange={e => f("dueDate", e.target.value)} style={iStyle} />
            </Field>
            <Field label="Duration (mins)">
              <input type="number" value={form.duration} onChange={e => f("duration", +e.target.value)} min={5} step={5} style={iStyle} />
            </Field>
          </div>

          {form.recurrence && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label="Time">
                <input type="time" value={form.scheduledTime||""} onChange={e => f("scheduledTime", e.target.value)} style={iStyle} />
              </Field>
              {form.recurrence === "weekly" && (
                <Field label="Day of Week">
                  <select value={form.scheduledDate||WEEK[0]} onChange={e => f("scheduledDate", e.target.value)} style={iStyle}>
                    {WEEK.map((d,i) => (
                      <option key={d} value={d}>{["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][i]}</option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
          )}

          <Field label="Notes">
            <textarea value={form.notes} onChange={e => f("notes", e.target.value)} rows={2}
              style={{ ...iStyle, resize:"none" }} />
          </Field>
        </div>

        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button onClick={onClose}
            style={{ flex:1, padding:"11px", border:"1px solid #E2DAD0", borderRadius:8, background:"white", fontSize:14, color:"#5A5248", cursor:"pointer" }}>
            Cancel
          </button>
          <button onClick={() => { if (form.title.trim()) onSave({ ...form, completedDates: form.completedDates||[] }); }}
            disabled={!form.title.trim()}
            style={{ flex:2, padding:"11px", border:"none", borderRadius:8, background:"#2A4A1E", fontSize:14, color:"white", fontWeight:500, cursor:"pointer", opacity:form.title.trim()?1:0.6 }}>
            {init ? "Save Changes" : "Add Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
