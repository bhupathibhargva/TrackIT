import { CATS } from "../constants.js";

export const iStyle = {
  width:"100%", padding:"10px 12px", border:"1px solid #E2DAD0",
  borderRadius:8, fontSize:14, outline:"none", background:"white",
};

export function Pill({ cat, small }) {
  const C = CATS[cat] || CATS.tasks;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:3, background:C.b, color:C.c,
      borderRadius:20, padding:small?"2px 7px":"3px 9px", fontSize:small?10:11,
      fontWeight:600, whiteSpace:"nowrap", flexShrink:0 }}>
      {C.e} {C.l}
    </span>
  );
}

export function Dot({ p }) {
  const cols = ["","#E53E3E","#DD6B20","#D69E2E","#38A169","#9AA0AA"];
  const labs = ["","Critical","High","Medium","Low","Someday"];
  return <span title={labs[p]} style={{ width:8, height:8, borderRadius:"50%",
    background:cols[p]||"#ccc", flexShrink:0, display:"inline-block" }} />;
}

export function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize:11, fontWeight:700, textTransform:"uppercase",
        letterSpacing:"0.08em", color:"#8B8278", display:"block", marginBottom:4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
