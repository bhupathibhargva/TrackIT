import { Box, Typography, Card, CardContent, LinearProgress, Button, Stack, Alert, Checkbox } from '@mui/material';
import AddIcon         from '@mui/icons-material/Add';
import AutorenewIcon   from '@mui/icons-material/Autorenew';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { CATS, WEEK, TODAY } from '../constants.js';
import { expandRecurring } from '../utils.js';
import { Pill } from './Pill.jsx';

const PRIORITY_COLORS = ['', '#E53E3E', '#DD6B20', '#D69E2E', '#38A169', '#9AA0AA'];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const todayLabel = new Date(TODAY + 'T12:00:00').toLocaleDateString('en-GB', {
  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
});

const BENTO = { xs: 'repeat(2, 1fr)', md: 'repeat(12, 1fr)' };
const FULL  = { xs: 'span 2', md: 'span 12' };

export function Dashboard({ tasks, user, onToggle, onAdd, onSchedule, onReprioritize, loading, setView }) {
  const expanded = expandRecurring(tasks, WEEK);
  const overdue  = tasks.filter(t => !t.done && t.dueDate && t.dueDate < TODAY);

  const todayScheduled = expanded
    .filter(t => t.scheduledDate === TODAY && !t.done)
    .sort((a, b) => (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? ''));

  const done  = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const completionPct = total ? Math.round(done / total * 100) : 0;

  const upcoming = tasks
    .filter(t => !t.done && t.dueDate && t.dueDate > TODAY && t.dueDate <= WEEK[6])
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.priority - b.priority)
    .slice(0, 6);

  const stats = [
    { label: 'Total',         value: total },
    { label: 'Done',          value: done },
    { label: 'Scheduled',     value: tasks.filter(t => t.scheduledDate || t.recurrence).length },
    { label: 'Due This Week', value: tasks.filter(t => t.dueDate && t.dueDate >= WEEK[0] && t.dueDate <= WEEK[6]).length },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: BENTO, gap: '14px', alignItems: 'start' }}>

      {/* ── GREETING HERO ── */}
      <Card sx={{ gridColumn: FULL }}>
        <CardContent sx={{ p: '22px 24px !important' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'flex-start' }} gap={2}>
            <Box>
              <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#1C1917', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {greeting()}{user ? `, ${user}` : ''}
              </Typography>
              <Typography sx={{ color: '#78716C', mt: 0.625, fontSize: 13.5 }}>
                {todayLabel} · {tasks.filter(t => !t.done).length} remaining · {completionPct}% done
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexShrink={0} flexWrap="wrap" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
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
          <LinearProgress variant="determinate" value={completionPct} sx={{
            mt: 2, height: 4, borderRadius: 2, bgcolor: '#EAE4DC',
            '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 2 },
          }} />
        </CardContent>
      </Card>

      {/* ── OVERDUE ALERT ── */}
      {overdue.length > 0 && (
        <Alert severity="warning"
          action={<Button size="small" color="inherit" onClick={onReprioritize}>Fix</Button>}
          sx={{ gridColumn: FULL, borderRadius: '14px !important' }}>
          <strong>{overdue.length} overdue:</strong>{' '}
          {overdue.map(t => t.title).slice(0, 3).join(', ')}{overdue.length > 3 ? '…' : ''}
        </Alert>
      )}

      {/* ── STAT TILES (4 × span-3, 2×2 on mobile) ── */}
      {stats.map(({ label, value }) => (
        <Card key={label} sx={{ gridColumn: { xs: 'span 1', md: 'span 3' } }}>
          <CardContent sx={{ p: '20px 22px !important', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 38, fontWeight: 700, color: '#1C1917', lineHeight: 1, letterSpacing: '-0.04em' }}>
              {value}
            </Typography>
            <Typography sx={{ fontSize: 10.5, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.08em', mt: 1 }}>
              {label}
            </Typography>
          </CardContent>
        </Card>
      ))}

      {/* ── TODAY'S FOCUS (7 cols) ── */}
      <Card sx={{ gridColumn: { xs: 'span 2', md: 'span 7' } }}>
        <CardContent sx={{ p: '20px 22px !important', display: 'flex', flexDirection: 'column', minHeight: 270 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1C1917' }}>Today's Focus</Typography>
            <Button size="small" onClick={() => setView('calendar')}
              sx={{ fontSize: 12, color: 'primary.main', minWidth: 0, px: 1 }}>
              Week →
            </Button>
          </Stack>
          {todayScheduled.length === 0 ? (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: 13, color: '#A8A29E', mb: 1.5, textAlign: 'center' }}>
                Nothing scheduled yet.
              </Typography>
              <Button variant="contained" size="small" onClick={onSchedule} disabled={loading} startIcon={<AutoAwesomeIcon />}>
                {loading ? 'Scheduling…' : 'Auto-Schedule Week'}
              </Button>
            </Box>
          ) : (
            <Stack spacing={0.75} sx={{ flex: 1 }}>
              {todayScheduled.map(task => (
                <Box key={task.id} sx={{
                  display: 'flex', gap: 1.25, alignItems: 'center',
                  px: 1.25, py: 0.875, bgcolor: '#F7F2EC', borderRadius: 2,
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

      {/* ── BY CATEGORY (5 cols) ── */}
      <Card sx={{ gridColumn: { xs: 'span 2', md: 'span 5' } }}>
        <CardContent sx={{ p: '20px 22px !important', display: 'flex', flexDirection: 'column', minHeight: 270 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1C1917', mb: 2 }}>By Category</Typography>
          <Stack spacing={1.5} sx={{ flex: 1 }}>
            {Object.entries(CATS).map(([key, cat]) => {
              const catTasks  = tasks.filter(t => t.category === key);
              const remaining = catTasks.filter(t => !t.done).length;
              const pct       = catTasks.length ? Math.round((catTasks.length - remaining) / catTasks.length * 100) : 0;
              return (
                <Box key={key}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 0.75 }}>
                    <Typography sx={{ fontSize: 13 }}>{cat.e}</Typography>
                    <Typography sx={{ fontSize: 13, color: '#1C1917', flex: 1 }}>{cat.l}</Typography>
                    <Typography sx={{ fontSize: 11, color: '#A8A29E' }}>
                      {catTasks.length - remaining}/{catTasks.length}
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

      {/* ── COMING UP (full-width bento row of mini tiles) ── */}
      {upcoming.length > 0 && (
        <Card sx={{ gridColumn: FULL }}>
          <CardContent sx={{ p: '20px 22px !important' }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1C1917', mb: 1.75 }}>Coming Up</Typography>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
              gap: '10px',
            }}>
              {upcoming.map(task => (
                <Box key={task.id} sx={{
                  display: 'flex', flexDirection: 'column', gap: 0.5,
                  px: 1.5, py: 1.25, borderRadius: '10px',
                  bgcolor: '#F7F2EC',
                  borderLeft: `3px solid ${PRIORITY_COLORS[task.priority] || '#EAE4DC'}`,
                }}>
                  <Typography sx={{ fontSize: 11, color: '#A8A29E', fontVariantNumeric: 'tabular-nums' }}>
                    {task.dueDate?.slice(5).replace('-', '/')}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: '#1C1917', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" mt={0.25}>
                    <Pill cat={task.category} small />
                    <Typography sx={{ fontSize: 11, color: '#A8A29E' }}>{task.assignee}</Typography>
                  </Stack>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
