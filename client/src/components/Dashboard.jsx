import { Box, Typography, Card, CardContent, LinearProgress, Button, Stack, Alert, Checkbox } from '@mui/material';
import AddIcon         from '@mui/icons-material/Add';
import AutorenewIcon   from '@mui/icons-material/Autorenew';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { CATS, WEEK, TODAY } from '../constants.js';
import { expandRecurring } from '../utils.js';
import { Pill } from './Pill.jsx';

export function Dashboard({ tasks, onToggle, onAdd, onSchedule, onReprioritize, loading, setView }) {
  const expanded = expandRecurring(tasks, WEEK);
  const overdue  = tasks.filter(t => !t.done && t.dueDate && t.dueDate < TODAY);
  const todayAll = expanded
    .filter(t => t.scheduledDate === TODAY && !t.done)
    .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));

  const stats = [
    { label: 'Total',         value: tasks.length },
    { label: 'Done',          value: tasks.filter(t => t.done).length },
    { label: 'Scheduled',     value: tasks.filter(t => t.scheduledDate || t.recurrence).length },
    { label: 'Due This Week', value: tasks.filter(t => t.dueDate && t.dueDate >= WEEK[0] && t.dueDate <= WEEK[6]).length },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3.5} flexWrap="wrap" gap={1.5}>
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 600, color: '#1C1C1C', lineHeight: 1 }}>
            Good morning
          </Typography>
          <Typography sx={{ color: '#8B8278', mt: 0.75, fontSize: 14 }}>
            Mon, 25 May 2026 · {tasks.filter(t => !t.done).length} tasks remaining
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
          <Button variant="outlined" onClick={onAdd} startIcon={<AddIcon />}
            sx={{ borderColor: '#E2DAD0', color: '#2A4A1E', '&:hover': { borderColor: '#2A4A1E', bgcolor: '#EEF4EB' } }}>
            Add
          </Button>
          <Button variant="outlined" onClick={onReprioritize} disabled={loading} startIcon={<AutorenewIcon />}
            sx={{ borderColor: '#FAA', color: '#7B341E', '&:hover': { borderColor: '#F77', bgcolor: '#FFF8F5' } }}>
            Reprioritize
          </Button>
          <Button variant="contained" onClick={onSchedule} disabled={loading} startIcon={<AutoAwesomeIcon />}>
            {loading ? 'Thinking…' : 'Auto-Schedule'}
          </Button>
        </Stack>
      </Stack>

      {overdue.length > 0 && (
        <Alert severity="warning" action={
          <Button size="small" color="inherit" onClick={onReprioritize}>Fix</Button>
        } sx={{ mb: 2.5 }}>
          <strong>{overdue.length} overdue:</strong>{' '}
          {overdue.map(t => t.title).slice(0, 3).join(', ')}{overdue.length > 3 ? '…' : ''}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1.75, mb: 2.75 }}>
        {stats.map(({ label, value }) => (
          <Card key={label}>
            <CardContent sx={{ p: '16px 18px !important' }}>
              <Typography sx={{ fontSize: 11, color: '#8B8278', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
                {label}
              </Typography>
              <Typography sx={{ fontSize: 30, fontWeight: 700, color: '#1C1C1C', lineHeight: 1 }}>
                {value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 2.5 }}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.75}>
              <Typography sx={{ fontSize: 17, fontWeight: 600 }}>Today's Schedule</Typography>
              <Button size="small" onClick={() => setView('calendar')} sx={{ fontSize: 12, color: '#2A4A1E' }}>
                Full week →
              </Button>
            </Stack>
            {todayAll.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3.5, color: '#8B8278' }}>
                <Typography sx={{ fontSize: 13, mb: 1.5 }}>Nothing scheduled for today.</Typography>
                <Button variant="contained" size="small" onClick={onSchedule} disabled={loading}>
                  {loading ? 'Scheduling…' : 'Auto-Schedule Week'}
                </Button>
              </Box>
            ) : (
              <Stack spacing={0.875}>
                {todayAll.map(t => (
                  <Box key={t.id} sx={{ display: 'flex', gap: 1.25, alignItems: 'center', px: 1.25, py: 1, bgcolor: '#F7F4EF', borderRadius: 2 }}>
                    <Typography sx={{ fontSize: 11, color: '#8B8278', minWidth: 40, fontVariantNumeric: 'tabular-nums' }}>
                      {t.scheduledTime || '—'}
                    </Typography>
                    <Checkbox size="small" checked={!!t.done} onChange={() => onToggle(t.id)}
                      sx={{ p: 0, color: '#C8BFB0', '&.Mui-checked': { color: 'primary.main' } }} />
                    <Typography sx={{ fontSize: 13, flex: 1, color: '#1C1C1C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: t.done ? 'line-through' : 'none' }}>
                      {t.isInst && '🔄 '}{t.title}
                    </Typography>
                    <Pill cat={t.category} small />
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography sx={{ fontSize: 17, fontWeight: 600, mb: 1.75 }}>By Category</Typography>
            <Stack spacing={1.375}>
              {Object.entries(CATS).map(([key, cat]) => {
                const all  = tasks.filter(t => t.category === key);
                const left = all.filter(t => !t.done).length;
                const pct  = all.length ? Math.round((all.length - left) / all.length * 100) : 0;
                return (
                  <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ width: 20, fontSize: 13, textAlign: 'center' }}>{cat.e}</Typography>
                    <Typography sx={{ fontSize: 13, color: '#3A3530', flex: 1 }}>{cat.l}</Typography>
                    <Box sx={{ width: 64 }}>
                      <LinearProgress variant="determinate" value={pct} sx={{
                        height: 3, borderRadius: 2, bgcolor: '#EDE8E0',
                        '& .MuiLinearProgress-bar': { bgcolor: cat.c },
                      }} />
                    </Box>
                    <Typography sx={{ fontSize: 12, color: '#8B8278', minWidth: 18, textAlign: 'right' }}>{left}</Typography>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
