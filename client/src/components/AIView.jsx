import { useRef, useEffect } from "react";

const SUGGESTIONS = [
  "Add swimming lessons for toddler on Saturday mornings, repeating weekly",
  "Make the date night highest priority",
  "Add milk, eggs, bread and butter to grocery list",
  "Remove the insurance call",
];

export function AIView({ log, input, setInput, onSend, onSchedule, loading }) {
  const endRef = useRef(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior:"smooth" }), [log]);

  return (
    <div style={{ maxWidth:680 }}>
      <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:34, fontWeight:600, marginBottom:5, color:"#1C1C1C" }}>AI Assistant</h1>
      <p style={{ color:"#8B8278", marginBottom:22, fontSize:14 }}>Natural language task management · smart scheduling · auto-reprioritization</p>

      <button onClick={onSchedule} disabled={loading}
        style={{ width:"100%", padding:"14px", background:"#2A4A1E", color:"white", border:"none",
          borderRadius:10, fontSize:14, fontWeight:500, cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1, marginBottom:22 }}>
        {loading ? "⟳ Working…" : "✦ Auto-Schedule This Week"}
      </button>

      <div style={{ background:"white", border:"1px solid #EDE8E0", borderRadius:12, overflow:"hidden" }}>
        <div style={{ padding:20, minHeight:280, maxHeight:380, overflow:"auto" }}>
          {log.length === 0 ? (
            <div style={{ color:"#8B8278", textAlign:"center", paddingTop:24 }}>
              <div style={{ fontSize:28, marginBottom:10 }}>✦</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, marginBottom:14 }}>Ask me anything</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => setInput(s)}
                    style={{ fontSize:13, color:"#5A5248", background:"#F7F4EF", border:"1px solid #EDE8E0", borderRadius:7, padding:"8px 12px", cursor:"pointer", textAlign:"left" }}>
                    "{s}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {log.map((m, i) => (
                <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
                  <div style={{ maxWidth:"80%", padding:"10px 14px", borderRadius:10, lineHeight:1.55, fontSize:14,
                    background:m.role==="user"?"#2A4A1E":"#F7F4EF", color:m.role==="user"?"white":"#1C1C1C" }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ fontSize:14, color:"#8B8278", padding:"10px 14px", background:"#F7F4EF", borderRadius:10, maxWidth:"50%" }}>Thinking…</div>
              )}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div style={{ borderTop:"1px solid #EDE8E0", padding:14, display:"flex", gap:10 }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==="Enter" && !e.shiftKey && onSend()}
            placeholder="Add, change, or remove tasks in plain English…"
            style={{ flex:1, padding:"10px 14px", border:"1px solid #E2DAD0", borderRadius:8, fontSize:14, outline:"none" }} />
          <button onClick={onSend} disabled={loading || !input.trim()}
            style={{ padding:"10px 18px", background:"#2A4A1E", color:"white", border:"none",
              borderRadius:8, fontSize:14, fontWeight:500, cursor:"pointer", opacity:loading||!input.trim()?0.6:1 }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
