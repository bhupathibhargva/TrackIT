import { useState } from "react";
import { Field, iStyle } from "./Pill.jsx";

export function SettingsModal({ apiKey: initial, onSave, onDelete, onClose }) {
  const [key, setKey]                 = useState(initial);
  const [showKey, setShowKey]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const hasKey = !!initial;
  const masked = initial ? initial.slice(0,6) + "••••••••••••" + initial.slice(-4) : "";

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(28,28,28,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
      <div style={{ background:"white", borderRadius:16, padding:28, width:"100%", maxWidth:460, boxShadow:"0 24px 64px rgba(0,0,0,0.18)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:600 }}>Settings</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, color:"#8B8278", cursor:"pointer" }}>✕</button>
        </div>

        {hasKey && (
          <div style={{ background:"#F0FFF4", border:"1px solid #C6F6D5", borderRadius:10, padding:"12px 14px", marginBottom:16,
            display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"#2A6A4A", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:2 }}>Active Key</div>
              <div style={{ fontSize:13, color:"#1C1C1C", fontFamily:"monospace" }}>{showKey ? initial : masked}</div>
            </div>
            <button onClick={() => setShowKey(s => !s)}
              style={{ fontSize:12, color:"#2A6A4A", background:"none", border:"1px solid #C6F6D5", borderRadius:6, padding:"4px 9px", cursor:"pointer", flexShrink:0 }}>
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
        )}

        <Field label={hasKey ? "Replace Key" : "Gemini API Key"}>
          <input type="password" value={key} onChange={e => setKey(e.target.value)}
            placeholder="AIza..." style={iStyle} />
        </Field>
        <p style={{ fontSize:12, color:"#8B8278", marginTop:8, lineHeight:1.6 }}>
          Get a free key at <b>aistudio.google.com</b> → Get API Key.<br/>
          Stored only in your browser — never sent anywhere except Google.
        </p>

        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          {hasKey && !confirmDelete && (
            <button onClick={() => setConfirmDelete(true)}
              style={{ flex:1, padding:"11px", border:"1px solid #FEB2B2", borderRadius:8, background:"#FFF5F5", fontSize:14, color:"#C53030", cursor:"pointer" }}>
              🗑 Delete Key
            </button>
          )}
          {hasKey && confirmDelete && (
            <button onClick={onDelete}
              style={{ flex:1, padding:"11px", border:"none", borderRadius:8, background:"#C53030", fontSize:14, color:"white", fontWeight:600, cursor:"pointer" }}>
              Confirm Delete
            </button>
          )}
          {!hasKey && (
            <button onClick={onClose}
              style={{ flex:1, padding:"11px", border:"1px solid #E2DAD0", borderRadius:8, background:"white", fontSize:14, color:"#5A5248", cursor:"pointer" }}>
              Cancel
            </button>
          )}
          <button onClick={() => { if (key.trim()) onSave(key.trim()); }} disabled={!key.trim()}
            style={{ flex:2, padding:"11px", border:"none", borderRadius:8, background:"#2A4A1E", fontSize:14, color:"white", fontWeight:500, cursor:"pointer", opacity:key.trim()?1:0.6 }}>
            {hasKey ? "Update Key" : "Save Key"}
          </button>
        </div>
      </div>
    </div>
  );
}
