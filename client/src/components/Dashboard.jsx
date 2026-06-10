import { Box, Typography, Card, CardContent, LinearProgress, Button, Stack, Alert, Checkbox, Divider } from '@mui/material';
import AddIcon         from '@mui/icons-material/Add';
import AutorenewIcon   from '@mui/icons-material/Autorenew';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { CATS, WEEK, TODAY } from '../constants.js';
import { expandRecurring } from '../utils.js';
import { Pill } from './Pill.jsx';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const PRIORITY_COLORS = ['', '#E53E3E', '#DD6B20', '#D69E2E', '#38A169', '#9AA0AA'];

export function Dashboard({ tasks, user, onToggle, onAdd, onSchedule, onReprioritize, loading, setView }) {
  const expanded = expandRecurring(tasks, WEEK);
  const overdue  = tasks.filter(task => !task.done && task.dueDate && task.dueDate < TODAY);
  const todayScheduled = expanded
    .filter(task => task.scheduledDate === TODAY && !task.done)
    .sort((a, b) => (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? ''));

  const done  = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const completionPct = total ? Math.round(done / total * 100) : 0;

  // Upcoming: tasks with due dates in the next 6 days (not today)
  const upcoming = tasks
    .filter(t => !t.done && t.dueDate && t.dueDate > TODAY && t.dueDate <= WEEK[6])
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.priority - b.priority)
    .slice(0, 5);

  const stats = [
    { label: 'Total',         value: total },
    { label: 'Done',          value: done },
    { label: 'Scheduled',     value: tasks.filter(t => t.scheduledDate || t.recurrence).length },
    { label: 'Due This Week', value: tasks.filter(t => t.dueDate && t.dueDate >= WEEK[0] && t.dueDate <= WEEK[6]).length },
  ];

  return (
    <Box>
      {/* Header */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mb: 3.5, gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#1C1917', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {greeting()}{user ? `, ${user}` : ''}
          </Typography>
          <Typography sx={{ color: '#78716C', mt: 0.625, fontSize: 13.5 }}>
            Mon, 25 May 2026 · {tasks.filter(t => !t.done).length} tasks remaining · {completionPct}% done
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
          <Button variant="outlined" onClick={onAdd} startIcon={<AddIcon />}
            sx={{ whiteSpace: 'nowrap', borderColor: '#EAE4DC', color: 'primary.main', '&:hover': { borderColor: 'primary.main', bgcolor: '#FAE8DE' } }}>
            Add
          </Button>
          <Button variant="outlined" onClick={onReprioritize} disabled={loading} startIcon={<AutorenewIcon />}
            sx={{ whiteSpace: 'nowrap', borderColor: 'rgba(197,48,48,0.3)', color: '#9A3C20', '&:hover': { borderColor: '#C53030', bgcolor: '#FFF5F5' } }}>
            Reprioritize
          </Button>
          <Button variant="contained" onClick={onSchedule} disabled={loading} startIcon={<AutoAwesomeIcon />}
            sx={{ whiteSpace: 'nowrap' }}>
            {loading ? 'Thinking…' : 'Auto-Schedule'}
          </Button>
        </Stack>
      </Stack>

      {overdue.length > 0 && (
        <Alert severity="warning" action={<Button size="small" color="inherit" onClick={onReprioritize}>Fix</Button>}
          sx={{ mb: 2.5, borderRadius: 2 }}>
          <strong>{overdue.length} overdue:</strong>{' '}
          {overdue.map(t => t.title).slice(0, 3).join(', ')}{overdue.length > 3 ? '…' : ''}
        </Alert>
      )}

      {/* Compact stats strip */}
      <Card sx={{ mb: 2.5, overflow: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {stats.map(({ label, value }, i) => (
            <Box key={label} sx={{
              py: 2, px: 2.5,
              borderRight: i < 3 ? '1px solid #EAE4DC' : 'none',
              textAlign: 'center',
            }}>
              <Typography sx={{ fontSize: 26, fontWeight: 700, color: '#1C1917', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {value}
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.07em', mt: 0.5 }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
        {/* Completion bar */}
        <LinearProgress variant="determinate" value={completionPct} sx={{
          height: 3, borderRadius: 0, bgcolor: '#EAE4DC',
          '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' },
        }} />
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' }, gap: 2.5, mb: 2.5 }}>
        {/* Today's Focus */}
        <Card>
          <CardContent sx={{ p: '20px 22px !important' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1C1917' }}>Today's Focus</Typography>
              <Button size="small" onClick={() => setView('calendar')}
                sx={{ fontSize: 12, color: 'primary.main', minWidth: 0, px: 1 }}>
                Full week →
              </Button>
            </Stack>
            {todayScheduled.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3.5 }}>
                <Typography sx={{ fontSize: 13, color: '#A8A29E', mb: 1.5 }}>Nothing scheduled yet.</Typography>
                <Button variant="contained" size="small" onClick={onSchedule} disabled={loading} startIcon={<AutoAwesomeIcon />}>
                  {loading ? 'Scheduling…' : 'Auto-Schedule Week'}
                </Button>
              </Box>
            ) : (
              <Stack spacing={0.75}>
                {todayScheduled.map((task, i) => (
                  <Box key={task.id} sx={{
                    display: 'flex', gap: 1.25, alignItems: 'center',
                    px: 1.25, py: 0.875,
                    bgcolor: '#F7F2EC', borderRadius: 2,
                    borderLeft: `3px solid ${PRIORITY_COLORS[task.priority] || '#EAE4DC'}`,
                  }}>
                    <Typography sx={{ fontSize: 11, color: '#A8A29E', minWidth: 38, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                      {task.scheduledTime ?? '—'}
                    </Typography>
                    <Checkbox size="small" checked={!!task.done} onChange={() => onToggle(task.id)}
                      sx={{ p: 0, color: '#C8BFB0', '&.Mui-checked': { color: 'primary.main' } }} />
                    <Typography sx={{ fontSize: 13, flex: 1, color: '#1C1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500, textDecoration: task.done ? 'line-through' : 'none' }}>
                      {task.isInst && '🔄 '}{task.title}
                    </Typography>
                    <Pill cat={task.category} small />
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* By Category */}
        <Card>
          <CardContent sx={{ p: '20px 22px !important' }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1C1917', mb: 2 }}>By Category</Typography>
            <Stack spacing={1.5}>
              {Object.entries(CATS).map(([key, cat]) => {
                const categoryTasks = tasks.filter(task => task.category === key);
                const remaining     = categoryTasks.filter(task => !task.done).length;
                const pct           = categoryTasks.length
                  ? Math.round((categoryTasks.length - remaining) / categoryTasks.length * 100) : 0;
                return (
                  <Box key={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 0.75 }}>
                      <Typography sx={{ fontSize: 13 }}>{cat.e}</Typography>
                      <Typography sx={{ fontSize: 13, color: '#1C1917', flex: 1 }}>{cat.l}</Typography>
                      <Typography sx={{ fontSize: 11, color: '#A8A29E' }}>
                        {categoryTasks.length - remaining}/{categoryTasks.length}
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={pct} sx={{
                      height: 4, borderRadius: 2, bgcolor: '#EAE4DC',
                      '& .MuiLinearProgress-bar': { bgcolor: cat.c, borderRadius: 2 },
                    }} />
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Upcoming this week */}
      {upcoming.length > 0 && (
        <Card>
          <CardContent sx={{ p: '20px 22px !important' }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1C1917', mb: 1.75 }}>Coming Up</Typography>
            <Stack spacing={0.75}>
              {upcoming.map(task => (
                <Box key={task.id} sx={{
                  display: 'flex', gap: 1.5, alignItems: 'center',
                  px: 1.25, py: 0.875, borderRadius: 2,
                  bgcolor: '#F7F2EC',
                  borderLeft: `3px solid ${PRIORITY_COLORS[task.priority] || '#EAE4DC'}`,
                }}>
                  <Typography sx={{ fontSize: 11, color: '#A8A29E', minWidth: 50, fontVariantNumeric: 'tabular-nums' }}>
                    {task.dueDate?.slice(5).replace('-', '/')}
                  </Typography>
                  <Typography sx={{ fontSize: 13, flex: 1, color: '#1C1917', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                  </Typography>
                  <Pill cat={task.category} small />
                  <Typography sx={{ fontSize: 11, color: '#A8A29E' }}>{task.assignee}</Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
