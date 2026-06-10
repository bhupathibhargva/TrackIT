import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { CATS, WEEK, TODAY, uid, MOBILE_BREAKPOINT, RECURRING_SEPARATOR } from './constants.js';
import { loadData, persistData, loadUser, saveUser, loadApiKey, saveApiKey } from './storage.js';
import { supabase } from './supabase.js';
import { reqNotif, pushNotif } from './utils.js';
import { callGemini } from './gemini.js';
import { schedulePrompt, reprioritizePrompt, chatPrompt } from './prompts.js';
import { Sidebar }       from './components/Sidebar.jsx';
import { Dashboard }     from './components/Dashboard.jsx';
import { ListView }      from './components/ListView.jsx';
import { CalView }       from './components/CalView.jsx';
import { AIView }        from './components/AIView.jsx';
import { TaskModal }     from './components/TaskModal.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { NotifPanel }    from './components/NotifPanel.jsx';

export default function App() {
  const [tasks, setTasks]               = useState([]);
  const [view, setView]                 = useState('dashboard');
  const [activeUser, setActiveUser]     = useState('Bhargav');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask]   = useState(null);
  const [showNotifs, setShowNotifs]     = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [isMobile, setIsMobile]         = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
  const [apiKey, setApiKey]             = useState('');
  const [aiLog, setAiLog]               = useState([]);
  const [aiInput, setAiInput]           = useState('');
  const [aiLoading, setAiLoading]       = useState(false);
  const [syncMsg, setSyncMsg]           = useState('synced');

  useEffect(() => {
    loadData().then(({ tasks: saved }) => setTasks(saved));
    loadUser().then(setActiveUser);
    setApiKey(loadApiKey());
    reqNotif();
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Poll Supabase every 30 s so Siri-added tasks appear without a refresh
  useEffect(() => {
    if (!supabase) return;
    const poll = setInterval(async () => {
      const { tasks: fresh } = await loadData();
      setTasks(prev => {
        const prevIds = new Set(prev.map(t => t.id));
        return fresh.some(t => !prevIds.has(t.id)) ? fresh : prev;
      });
    }, 30_000);
    return () => clearInterval(poll);
  }, []);

  const persist = async (updated) => {
    setTasks(updated);
    setSyncMsg('syncing');
    await persistData(updated);
    setSyncMsg('synced');
  };

  const toggleDone = (id) => {
    if (id.includes(RECURRING_SEPARATOR)) {
      const [taskId, date] = id.split(RECURRING_SEPARATOR);
      persist(tasks.map(task => {
        if (task.id !== taskId) return task;
        const completed = task.completedDates ?? [];
        const alreadyDone = completed.includes(date);
        return {
          ...task,
          completedDates: alreadyDone
            ? completed.filter(d => d !== date)
            : [...completed, date],
        };
      }));
    } else {
      persist(tasks.map(task => task.id === id ? { ...task, done: !task.done } : task));
    }
  };

  const deleteTask = (id) => persist(tasks.filter(task => task.id !== id));

  const saveTask = (task) => {
    if (task.id && tasks.find(t => t.id === task.id)) {
      persist(tasks.map(t => t.id === task.id ? task : t));
    } else {
      persist([...tasks, { ...task, id: uid() }]);
    }
    setShowAddModal(false);
    setEditingTask(null);
  };

  const movePriority = (id, direction) => {
    const sorted = [...tasks].sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
    const index = sorted.findIndex(task => task.id === id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;
    const currentPriority = sorted[index].priority;
    const swapPriority = sorted[swapIndex].priority;
    persist(tasks.map(task => {
      if (task.id === sorted[index].id)    return { ...task, priority: swapPriority };
      if (task.id === sorted[swapIndex].id) return { ...task, priority: currentPriority };
      return task;
    }));
  };

  const switchUser = async (userName) => {
    setActiveUser(userName);
    await saveUser(userName);
  };

  const openSettings = () => { setSidebarOpen(false); setShowSettings(true); };
  const openNotifs   = () => { setSidebarOpen(false); setShowNotifs(true); };
  const openAddModal = () => { setSidebarOpen(false); setShowAddModal(true); };
  const openEditModal = (task) => { setSidebarOpen(false); setEditingTask(task); };
  const navigateTo = (destination) => { setSidebarOpen(false); setView(destination); };

  // ── AI actions ──────────────────────────────────────────────────────────────

  const requireApiKey = () => {
    if (!apiKey) { openSettings(); return false; }
    return true;
  };

  const appendAiMessage = (text) => setAiLog(log => [...log, { role: 'ai', text }]);

  const autoSchedule = async () => {
    if (!requireApiKey()) return;
    setAiLoading(true);
    try {
      const schedulable = tasks.filter(task => !task.done && !task.recurrence);
      const schedule = await callGemini(apiKey, schedulePrompt(schedulable));
      const updated = tasks.map(task => {
        const slot = schedule.find(s => s.id === task.id);
        return slot ? { ...task, scheduledDate: slot.scheduledDate, scheduledTime: slot.scheduledTime } : task;
      });
      await persist(updated);
      pushNotif('Family HQ', `Week scheduled! ${schedule.length} tasks placed.`);
      appendAiMessage(`Scheduled ${schedule.length} tasks for the week!`);
      setView('calendar');
    } catch {
      appendAiMessage('Scheduling failed. Try again.');
    }
    setAiLoading(false);
  };

  const autoReprioritize = async () => {
    if (!requireApiKey()) return;
    setAiLoading(true);
    const overdue = tasks.filter(task => !task.done && task.dueDate && task.dueDate < TODAY);
    if (!overdue.length) {
      appendAiMessage("No overdue tasks — you're on top of it! 🎉");
      setView('ai');
      setAiLoading(false);
      return;
    }
    try {
      const updates = await callGemini(apiKey, reprioritizePrompt(overdue));
      const updated = tasks.map(task => {
        const change = updates.find(u => u.id === task.id);
        return change ? { ...task, ...change } : task;
      });
      await persist(updated);
      appendAiMessage(`Reprioritized and rescheduled ${updates.length} overdue tasks.`);
      setView('ai');
    } catch {
      appendAiMessage('Reprioritization failed.');
    }
    setAiLoading(false);
  };

  const sendChat = async () => {
    const message = aiInput.trim();
    if (!message || !requireApiKey()) return;
    setAiInput('');
    setAiLog(log => [...log, { role: 'user', text: message }]);
    setAiLoading(true);
    try {
      const result = await callGemini(apiKey, chatPrompt(tasks, activeUser, message));
      if (result.action === 'add') {
        const newTask = { ...result.task, id: uid() };
        await persist([...tasks, newTask]);
        appendAiMessage(`Added "${newTask.title}" to ${CATS[newTask.category]?.l ?? newTask.category}.${newTask.recurrence ? ` Repeats ${newTask.recurrence}.` : ''}`);
      } else if (result.action === 'update') {
        await persist(tasks.map(task => task.id === result.id ? { ...task, ...result.changes } : task));
        appendAiMessage(`Updated "${tasks.find(task => task.id === result.id)?.title ?? 'task'}".`);
      } else if (result.action === 'delete') {
        const title = tasks.find(task => task.id === result.id)?.title;
        await persist(tasks.filter(task => task.id !== result.id));
        appendAiMessage(`Removed "${title}".`);
      } else {
        appendAiMessage(result.message ?? 'Done!');
      }
    } catch {
      appendAiMessage('Something went wrong.');
    }
    setAiLoading(false);
  };

  const alertCount = tasks.filter(
    task => !task.done && ((task.dueDate && task.dueDate <= TODAY) || task.scheduledDate === TODAY)
  ).length;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar
        user={activeUser}
        view={view}
        setView={navigateTo}
        apiKey={apiKey}
        alertCount={alertCount}
        syncMsg={syncMsg}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setShowNotifs={openNotifs}
        setShowSettings={openSettings}
        switchUser={switchUser}
        isMobile={isMobile}
        tasks={tasks}
      />

      <Box component="main" sx={{ flex: 1, overflow: 'auto', p: isMobile ? 2 : '32px 36px' }}>
        {isMobile && (
          <Box
            component="button"
            onClick={() => setSidebarOpen(open => !open)}
            sx={{ mb: 2, bgcolor: '#27201A', border: 'none', borderRadius: 2, color: 'white', p: '8px 12px', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}
          >
            ☰
          </Box>
        )}
        {view === 'dashboard' && <Dashboard tasks={tasks} user={activeUser} onToggle={toggleDone} onAdd={openAddModal} onSchedule={autoSchedule} onReprioritize={autoReprioritize} loading={aiLoading} setView={navigateTo} />}
        {view === 'lists'     && <ListView  tasks={tasks} onToggle={toggleDone} onDelete={deleteTask} onMove={movePriority} onEdit={openEditModal} onAdd={openAddModal} />}
        {view === 'calendar'  && <CalView   tasks={tasks} onToggle={toggleDone} />}
        {view === 'ai'        && <AIView    log={aiLog} input={aiInput} setInput={setAiInput} onSend={sendChat} onSchedule={autoSchedule} loading={aiLoading} />}
      </Box>

      <NotifPanel tasks={tasks} onClose={() => setShowNotifs(false)} open={showNotifs} />

      {(showAddModal || editingTask) && (
        <TaskModal task={editingTask} onSave={saveTask} onClose={() => { setShowAddModal(false); setEditingTask(null); }} />
      )}
      {showSettings && (
        <SettingsModal
          apiKey={apiKey}
          onSave={key => { setApiKey(key); saveApiKey(key); setShowSettings(false); }}
          onDelete={() => { setApiKey(''); saveApiKey(''); setShowSettings(false); }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </Box>
  );
}
