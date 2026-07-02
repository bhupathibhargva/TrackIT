// App — the root component. It wires together three concerns:
//   1. Task data     → useTasks()  (load, save, toggle, delete, reorder)
//   2. AI assistant  → useAi()     (chat, auto-schedule, reprioritize)
//   3. UI shell      → which view is showing, which modals/drawers are open
import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { TODAY, MOBILE_BREAKPOINT, MEMBERS } from './constants.js';
import { loadUser, saveUser, loadApiKey, saveApiKey } from './storage.js';
import { reqNotif } from './utils.js';
import { useTasks } from './hooks/useTasks.js';
import { useAi } from './hooks/useAi.js';
import { Sidebar }       from './components/Sidebar.jsx';
import { Dashboard }     from './components/Dashboard.jsx';
import { ListView }      from './components/ListView.jsx';
import { CalView }       from './components/CalView.jsx';
import { AIView }        from './components/AIView.jsx';
import { TaskModal }     from './components/TaskModal.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { NotifPanel }    from './components/NotifPanel.jsx';

export default function App() {
  // ---- UI shell state ----
  const [view, setView]                 = useState('dashboard');
  const [activeUser, setActiveUser]     = useState(MEMBERS[0]);
  const [apiKey, setApiKey]             = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask]   = useState(null); // task being edited, or null
  const [showNotifs, setShowNotifs]     = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false); // mobile drawer only
  const [isMobile, setIsMobile]         = useState(() => window.innerWidth < MOBILE_BREAKPOINT);

  // ---- Task data (see hooks/useTasks.js) ----
  const { tasks, syncMsg, persist, toggleDone, deleteTask, saveTask, movePriority } = useTasks();

  // On mobile the sidebar is a temporary drawer, so every action launched
  // from it should also close it. Wrapping handlers in closeDrawerAnd keeps
  // that rule in one place.
  const closeDrawerAnd = (fn) => (...args) => { setSidebarOpen(false); fn(...args); };
  const openSettings  = closeDrawerAnd(() => setShowSettings(true));
  const openNotifs    = closeDrawerAnd(() => setShowNotifs(true));
  const openAddModal  = closeDrawerAnd(() => setShowAddModal(true));
  const openEditModal = closeDrawerAnd(setEditingTask);
  const navigateTo    = closeDrawerAnd(setView);

  // ---- AI assistant (see hooks/useAi.js) ----
  const ai = useAi({ tasks, persist, apiKey, activeUser, setView, onMissingKey: openSettings });

  // One-time startup: restore the active user + API key, ask for browser
  // notification permission.
  useEffect(() => {
    loadUser().then(setActiveUser);
    setApiKey(loadApiKey());
    reqNotif();
  }, []);

  // Track window size so we can swap between the fixed and drawer sidebar.
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const switchUser = async (userName) => {
    setActiveUser(userName);
    await saveUser(userName);
  };

  const handleSaveTask = (task) => {
    saveTask(task);
    setShowAddModal(false);
    setEditingTask(null);
  };

  // Badge count for the sidebar: anything due today (or earlier) plus
  // anything scheduled for today.
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

      <Box component="main" sx={{ flex: 1, overflow: 'auto', p: isMobile ? '16px 16px' : '32px 40px' }}>
        <Box sx={{ maxWidth: 1060, mx: 'auto' }}>
          {isMobile && (
            <Box
              component="button"
              onClick={() => setSidebarOpen(open => !open)}
              sx={{ mb: 2.5, bgcolor: '#1E1511', border: 'none', borderRadius: 2, color: 'white', p: '8px 12px', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}
            >
              ☰
            </Box>
          )}
          {view === 'dashboard' && <Dashboard tasks={tasks} user={activeUser} onToggle={toggleDone} onAdd={openAddModal} onSchedule={ai.autoSchedule} onReprioritize={ai.autoReprioritize} loading={ai.loading} setView={navigateTo} />}
          {view === 'lists'     && <ListView  tasks={tasks} onToggle={toggleDone} onDelete={deleteTask} onMove={movePriority} onEdit={openEditModal} onAdd={openAddModal} />}
          {view === 'calendar'  && <CalView   tasks={tasks} onToggle={toggleDone} />}
          {view === 'ai'        && <AIView    log={ai.log} input={ai.input} setInput={ai.setInput} onSend={ai.sendChat} onSchedule={ai.autoSchedule} loading={ai.loading} />}
        </Box>
      </Box>

      <NotifPanel tasks={tasks} onClose={() => setShowNotifs(false)} open={showNotifs} />

      {(showAddModal || editingTask) && (
        <TaskModal task={editingTask} onSave={handleSaveTask} onClose={() => { setShowAddModal(false); setEditingTask(null); }} />
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
