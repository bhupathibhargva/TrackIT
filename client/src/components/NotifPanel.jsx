import { Drawer, Box, Typography, IconButton, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TODAY, WEEK } from '../constants.js';
import { Pill } from './Pill.jsx';

const SECTION_STYLES = {
  error:   { titleColor: '#C53030', bg: '#FFF5F5', border: '#FED7D7' },
  warning: { titleColor: '#A04A28', bg: '#FFF8F3', border: '#FBBF9D' },
  success: { titleColor: '#8B5E3C', bg: '#FBF5EF', border: '#E8C9AA' },
};

function AlertSection({ label, items, type }) {
  if (items.length === 0) return null;
  const style = SECTION_STYLES[type];
  return (
    <Box mb={2.5}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: style.titleColor, mb: 1, letterSpacing: '0.05em' }}>
        {label} ({items.length})
      </Typography>
      <Stack spacing={0.75}>
        {items.map(task => (
          <Box key={task.id} sx={{ bgcolor: style.bg, border: `1px solid ${style.border}`, borderRadius: 2, p: '8px 10px' }}>
            <Typography sx={{ fontSize: 13, color: '#25221F', fontWeight: 500 }}>{task.title}</Typography>
            <Stack direction="row" spacing={0.75} mt={0.375} alignItems="center" flexWrap="wrap">
              <Pill cat={task.category} small />
              <Typography sx={{ fontSize: 11, color: '#706A63' }}>{task.assignee}</Typography>
              {task.dueDate && <Typography sx={{ fontSize: 11, color: '#C05621' }}>Due {task.dueDate}</Typography>}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export function NotifPanel({ tasks, onClose, open }) {
  const overdue  = tasks.filter(task => !task.done && task.dueDate && task.dueDate < TODAY);
  const today    = tasks.filter(task => !task.done && task.scheduledDate === TODAY && !task.recurrence);
  const upcoming = tasks.filter(task => !task.done && task.dueDate && task.dueDate > TODAY && task.dueDate <= WEEK[6]);
  const hasAlerts = overdue.length + today.length + upcoming.length > 0;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ '& .MuiDrawer-paper': { width: 320 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600 }}>Alerts</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <AlertSection label="Overdue"   items={overdue}  type="error"   />
        <AlertSection label="Today"     items={today}    type="warning" />
        <AlertSection label="This Week" items={upcoming} type="success" />
        {!hasAlerts && (
          <Box sx={{ textAlign: 'center', py: 6, color: '#706A63' }}>
            <Typography>All clear! ✓</Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
