export function Sidebar({ user, view, setView, apiKey, alertCount, syncMsg, sidebarOpen,
  setSidebarOpen, setShowNotifs, setShowSettings, switchUser, isMobile, tasks }) {

  const syncColors = { synced:"rgba(255,255,255,0.25)", syncing:"#D69E2E" };

  return (
    <aside style={{ width:224, background:"#1E3612", color:"white", display:"flex",
      flexDirection:"column", flexShrink:0,
      ...(isMobile ? { position:"fixed", top:0, left:0, height:"100vh", zIndex:200,
        transform:sidebarOpen?"translateX(0)":"translateX(-100%)", transition:"transform 0.25s ease" } : {}) }}>

      {/* Header */}
      <div style={{ padding:"24px 20px 18px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:21, fontWeight:600, lineHeight:1.2 }}>Family HQ</div>
        <div style={{ fontSize:10, opacity:0.35, letterSpacing:"0.12em", textTransform:"uppercase", marginTop:2, marginBottom:14 }}>Life Planner</div>
        <div style={{ display:"flex", gap:6 }}>
          {["Bhargav","Rupa"].map(u => (
            <button key={u} onClick={()=>switchUser(u)}
              style={{ flex:1, padding:"7px 4px", borderRadius:7, border:"1px solid", cursor:"pointer",
                fontSize:12, fontWeight:500, transition:"all 0.15s",
                borderColor:user===u?"rgba(255,255,255,0.55)":"rgba(255,255,255,0.15)",
                background:user===u?"rgba(255,255,255,0.15)":"transparent",
                color:user===u?"white":"rgba(255,255,255,0.38)" }}>
              {u[0]} {u}
            </button>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding:"14px 0", flex:1 }}>
        {[["dashboard","◈","Dashboard"],["lists","≡","All Tasks"],["calendar","◻","Schedule"],["ai","✦","AI Assistant"]].map(([v,icon,label]) => (
          <button key={v} onClick={()=>{ setView(v); if(isMobile) setSidebarOpen(false); }}
            style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"11px 20px",
              background:view===v?"rgba(255,255,255,0.1)":"transparent", border:"none",
              borderLeft:view===v?"2px solid #8DC76B":"2px solid transparent",
              color:view===v?"white":"rgba(255,255,255,0.38)",
              fontSize:14, cursor:"pointer", transition:"all 0.15s", textAlign:"left" }}>
            <span style={{ fontSize:15, lineHeight:1 }}>{icon}</span>{label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding:"16px 20px", borderTop:"1px solid rgba(255,255,255,0.08)", display:"flex", flexDirection:"column", gap:8 }}>
        <button onClick={()=>setShowNotifs(v=>!v)}
          style={{ width:"100%", padding:"9px", borderRadius:8, border:"1px solid rgba(255,255,255,0.18)",
            background:"transparent", color:"white", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontSize:13 }}>
          🔔 Alerts
          {alertCount > 0 && (
            <span style={{ background:"#E53E3E", color:"white", borderRadius:10, padding:"1px 6px", fontSize:11, fontWeight:700 }}>
              {alertCount}
            </span>
          )}
        </button>
        <button onClick={()=>setShowSettings(true)}
          style={{ width:"100%", padding:"9px", borderRadius:8, border:"1px solid rgba(255,255,255,0.18)",
            background:apiKey?"transparent":"rgba(214,158,46,0.25)",
            color:apiKey?"rgba(255,255,255,0.5)":"#FBD38D",
            cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          ⚙ {apiKey ? "Settings" : "Set AI Key"}
        </button>
        <div style={{ textAlign:"center", fontSize:11 }}>
          <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%",
            background:syncColors[syncMsg]||"rgba(255,255,255,0.25)", marginRight:4, verticalAlign:"middle" }} />
          <span style={{ opacity:0.35 }}>{syncMsg==="syncing" ? "Saving…" : "Synced"}</span>
        </div>
        {tasks && (
          <div style={{ textAlign:"center", fontSize:11, opacity:0.28 }}>
            {tasks.filter(t => t.done).length}/{tasks.length} done
          </div>
        )}
      </div>
    </aside>
  );
}
