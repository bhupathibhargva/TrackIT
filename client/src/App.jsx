import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { CATS, WEEK, TODAY, uid } from "./constants.js";
import { loadData, persistData, loadUser, saveUser, loadApiKey, saveApiKey } from "./storage.js";
import { reqNotif, pushNotif } from "./utils.js";
import { Sidebar }       from "./components/Sidebar.jsx";
import { Dashboard }     from "./components/Dashboard.jsx";
import { ListView }      from "./components/ListView.jsx";
import { CalView }       from "./components/CalView.jsx";
import { AIView }        from "./components/AIView.jsx";
import { TaskModal }     from "./components/TaskModal.jsx";
import { SettingsModal } from "./components/SettingsModal.jsx";
import { NotifPanel }    from "./components/NotifPanel.jsx";

export default function App() {
  const [tasks, setTasks]               = useState([]);
  const [view, setView]                 = useState("dashboard");
  const [user, setUser]                 = useState("Bhargav");
  const [showAdd, setShowAdd]           = useState(false);
  const [editTask, setEditTask]         = useState(null);
  const [showNotifs, setShowNotifs]     = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [mobile, setMobile]             = useState(() => window.innerWidth < 768);
  const [apiKey, setApiKey]             = useState("");
  const [aiLog, setAiLog]               = useState([]);
  const [aiInput, setAiInput]           = useState("");
  const [aiLoading, setAiLoading]       = useState(false);
  const [syncMsg, setSyncMsg]           = useState("synced");

  useEffect(() => {
    loadData().then(({ tasks: t }) => setTasks(t));
    loadUser().then(setUser);
    setApiKey(loadApiKey());
    reqNotif();
  }, []);

  // Keep mobile/desktop layout in sync across resize and rotation.
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const persist = async (newTasks) => {
    setTasks(newTasks);
    setSyncMsg("syncing");
    await persistData(newTasks);
    setSyncMsg("synced");
  };

  const toggleDone = (id) => {
    if (id.includes("__")) {
      const [tid, date] = id.split("__");
      persist(tasks.map(t => {
        if (t.id !== tid) return t;
        const cd = t.completedDates || [];
        return { ...t, completedDates: cd.includes(date) ? cd.filter(d => d !== date) : [...cd, date] };
      }));
    } else {
      persist(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    }
  };

  const deleteTask = id => persist(tasks.filter(t => t.id !== id));

  const saveTask = task => {
    if (task.id && tasks.find(t => t.id === task.id)) persist(tasks.map(t => t.id === task.id ? task : t));
    else persist([...tasks, { ...task, id: uid() }]);
    setShowAdd(false);
    setEditTask(null);
  };

  const movePriority = (id, dir) => {
    const sorted = [...tasks].sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
    const idx  = sorted.findIndex(t => t.id === id);
    const swap = dir === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= sorted.length) return;
    const [p1, p2] = [sorted[idx].priority, sorted[swap].priority];
    persist(tasks.map(t => {
      if (t.id === sorted[idx].id)  return { ...t, priority: p2 };
      if (t.id === sorted[swap].id) return { ...t, priority: p1 };
      return t;
    }));
  };

  const switchUser = async (u) => { setUser(u); await saveUser(u); };

  // ── Gemini helpers ────────────────────────────────────────────────────────────
  const geminiUrl  = () => `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const geminiCall = (prompt) => fetch(geminiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 1500 } }),
  });
  const geminiText = (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const autoSchedule = async () => {
    if (!apiKey) { setShowSettings(true); return; }
    setAiLoading(true);
    const toSched = tasks.filter(t => !t.done && !t.recurrence);
    try {
      const res  = await geminiCall(
`Schedule tasks for Bhargav & Rupa (couple with toddler), week ${WEEK[0]}–${WEEK[6]}.
Tasks: ${JSON.stringify(toSched.map(t=>({id:t.id,title:t.title,category:t.category,priority:t.priority,assignee:t.assignee,duration:t.duration,dueDate:t.dueDate})))}
Rules: Workouts 06:00–07:30 weekday mornings. Toddler 08:30–11:00. Work blocks Mon–Fri 09:00–18:00. Grocery Sat/Sun mornings or weekday evenings 19:30+. Date night Sat 19:30+. Family dinner Sun 17:00. P1→Mon-Tue, P2→Wed-Fri, P3+→weekend. Honour dueDate.
Return ONLY JSON array: [{"id":"...","scheduledDate":"YYYY-MM-DD","scheduledTime":"HH:MM"}]`
      );
      const data  = await res.json();
      const sched = JSON.parse((geminiText(data) || "[]").replace(/```json|```/g, "").trim());
      const updated = tasks.map(t => { const s = sched.find(x => x.id === t.id); return s ? { ...t, scheduledDate: s.scheduledDate, scheduledTime: s.scheduledTime } : t; });
      await persist(updated);
      pushNotif("Family HQ", "Week scheduled! " + sched.length + " tasks placed.");
      setAiLog(l => [...l, { role: "ai", text: `Scheduled ${sched.length} tasks for the week!` }]);
      setView("calendar");
    } catch { setAiLog(l => [...l, { role: "ai", text: "Scheduling failed. Try again." }]); }
    setAiLoading(false);
  };

  const autoReprioritize = async () => {
    if (!apiKey) { setShowSettings(true); return; }
    setAiLoading(true);
    const overdue = tasks.filter(t => !t.done && t.dueDate && t.dueDate < TODAY);
    if (!overdue.length) {
      setAiLog(l => [...l, { role: "ai", text: "No overdue tasks — you're on top of it! 🎉" }]);
      setView("ai");
      setAiLoading(false);
      return;
    }
    try {
      const res  = await geminiCall(
`Reprioritize these overdue tasks for Bhargav & Rupa. Assign new priority (1=Critical–5=Someday) and reschedule this week.
Overdue: ${JSON.stringify(overdue.map(t=>({id:t.id,title:t.title,category:t.category,priority:t.priority,dueDate:t.dueDate,assignee:t.assignee})))}
Week dates: ${WEEK.join(", ")}
Return ONLY JSON: [{"id":"...","priority":1,"scheduledDate":"YYYY-MM-DD","scheduledTime":"HH:MM"}]`
      );
      const data    = await res.json();
      const updates = JSON.parse((geminiText(data) || "[]").replace(/```json|```/g, "").trim());
      const updated = tasks.map(t => { const u = updates.find(x => x.id === t.id); return u ? { ...t, ...u } : t; });
      await persist(updated);
      setAiLog(l => [...l, { role: "ai", text: `Reprioritized and rescheduled ${updates.length} overdue tasks.` }]);
      setView("ai");
    } catch { setAiLog(l => [...l, { role: "ai", text: "Reprioritization failed." }]); }
    setAiLoading(false);
  };

  const sendChat = async () => {
    const msg = aiInput.trim();
    if (!msg) return;
    if (!apiKey) { setShowSettings(true); return; }
    setAiInput(""); setAiLog(l => [...l, { role: "user", text: msg }]); setAiLoading(true);
    try {
      const res  = await geminiCall(
`Manage tasks for Bhargav & Rupa (toddler family). Current tasks: ${JSON.stringify(tasks.map(t=>({id:t.id,title:t.title,category:t.category,priority:t.priority,assignee:t.assignee,done:t.done,scheduledDate:t.scheduledDate,recurrence:t.recurrence})))}
User (${user}): "${msg}"
Return ONLY one of these JSON actions (no markdown):
{"action":"add","task":{"title":"...","category":"tasks|grocery|toddler|dinner|date|workout","priority":1-5,"assignee":"Bhargav|Rupa|Both","dueDate":"YYYY-MM-DD or null","duration":30,"notes":"","recurrence":"daily|weekly|null","done":false,"scheduledDate":null,"scheduledTime":null,"completedDates":[]}}
{"action":"update","id":"...","changes":{...}}
{"action":"delete","id":"..."}
{"action":"chat","message":"..."}`
      );
      const data   = await res.json();
      const result = JSON.parse((geminiText(data) || "{}").replace(/```json|```/g, "").trim());
      if (result.action === "add") {
        const nt = { ...result.task, id: uid() };
        await persist([...tasks, nt]);
        setAiLog(l => [...l, { role: "ai", text: `Added "${nt.title}" to ${CATS[nt.category]?.l || nt.category}.${nt.recurrence ? " Repeats " + nt.recurrence + "." : ""}` }]);
      } else if (result.action === "update") {
        await persist(tasks.map(t => t.id === result.id ? { ...t, ...result.changes } : t));
        setAiLog(l => [...l, { role: "ai", text: `Updated "${tasks.find(t => t.id === result.id)?.title || "task"}".` }]);
      } else if (result.action === "delete") {
        const title = tasks.find(t => t.id === result.id)?.title;
        await persist(tasks.filter(t => t.id !== result.id));
        setAiLog(l => [...l, { role: "ai", text: `Removed "${title}".` }]);
      } else {
        setAiLog(l => [...l, { role: "ai", text: result.message || "Done!" }]);
      }
    } catch { setAiLog(l => [...l, { role: "ai", text: "Something went wrong." }]); }
    setAiLoading(false);
  };

  const alertCount = tasks.filter(t => !t.done && ((t.dueDate && t.dueDate <= TODAY) || t.scheduledDate === TODAY)).length;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar
        user={user}
        view={view}
        setView={setView}
        apiKey={apiKey}
        alertCount={alertCount}
        syncMsg={syncMsg}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setShowNotifs={setShowNotifs}
        setShowSettings={setShowSettings}
        switchUser={switchUser}
        isMobile={mobile}
        tasks={tasks}
      />

      <Box component="main" sx={{ flex: 1, overflow: "auto", p: mobile ? 2 : "32px 36px" }}>
        {mobile && (
          <Box
            component="button"
            onClick={() => setSidebarOpen(s => !s)}
            sx={{ mb: 2, bgcolor: "#1E3612", border: "none", borderRadius: 2, color: "white", p: "8px 12px", fontSize: 18, cursor: "pointer", lineHeight: 1 }}
          >
            ☰
          </Box>
        )}
        {view === "dashboard" && <Dashboard tasks={tasks} onToggle={toggleDone} onAdd={() => setShowAdd(true)} onSchedule={autoSchedule} onReprioritize={autoReprioritize} loading={aiLoading} setView={setView} />}
        {view === "lists"     && <ListView  tasks={tasks} onToggle={toggleDone} onDelete={deleteTask} onMove={movePriority} onEdit={t => setEditTask(t)} onAdd={() => setShowAdd(true)} />}
        {view === "calendar"  && <CalView   tasks={tasks} onToggle={toggleDone} />}
        {view === "ai"        && <AIView    log={aiLog} input={aiInput} setInput={setAiInput} onSend={sendChat} onSchedule={autoSchedule} loading={aiLoading} />}
      </Box>

      {/* NotifPanel as MUI Drawer — always mounted, open prop controls visibility */}
      <NotifPanel tasks={tasks} onClose={() => setShowNotifs(false)} open={showNotifs} />

      {(showAdd || editTask) && (
        <TaskModal task={editTask} onSave={saveTask} onClose={() => { setShowAdd(false); setEditTask(null); }} />
      )}
      {showSettings && (
        <SettingsModal
          apiKey={apiKey}
          onSave={k => { setApiKey(k); saveApiKey(k); setShowSettings(false); }}
          onDelete={() => { setApiKey(""); saveApiKey(""); setShowSettings(false); }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </Box>
  );
}
