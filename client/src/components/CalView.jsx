// CalView — the weekly "Schedule" view: one card per day (Mon–Sun) with the
// day's tasks stacked inside, plus a strip of unscheduled tasks below.
import { Box, Typography, Card, CardContent, Stack, Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { CATS, WEEK, TODAY, DAY_NAMES } from '../constants.js';
import { expandRecurring, exportICS, weekRangeLabel } from '../utils.js';
import { Dot } from './Pill.jsx';
import { PageHeader, SectionTitle } from './PageHeader.jsx';

/** A single task chip inside a day column. Clicking toggles done/undone. */
function EventChip({ task, onToggle }) {
  const cat = CATS[task.category] ?? {};
  return (
    <Box onClick={() => onToggle(task.id)} sx={{
      bgcolor: cat.b || '#F7F2EC',
      borderLeft: `2.5px solid ${cat.c || '#C8BFB0'}`,
      borderRadius: '0 6px 6px 0',
      p: '5px 7px', cursor: 'pointer',
      opacity: task.done ? 0.4 : 1, transition: 'opacity 0.15s',
      '&:hover': { opacity: task.done ? 0.4 : 0.85 },
    }}>
      {task.scheduledTime && (
        <Typography sx={{ fontSize: 9, color: cat.c, fontWeight: 700, mb: '1px' }}>
          {task.scheduledTime}
        </Typography>
      )}
      <Typography sx={{ fontSize: 11, color: '#1C1917', fontWeight: 500, lineHeight: 1.3, textDecoration: task.done ? 'line-through' : 'none' }}>
        {task.isInst && '🔄 '}{task.title}
      </Typography>
      <Typography sx={{ fontSize: 10, color: '#78716C', mt: '1px' }}>{task.assignee}</Typography>
    </Box>
  );
}

/** One day of the week: header (day name + date) plus that day's tasks. */
function DayCard({ date, dayName, tasks, onToggle }) {
  const isToday = date === TODAY;
  const dayOfMonth = parseInt(date.split('-')[2]);
  return (
    // !important needed to beat the MuiCard theme border/shadow defaults.
    <Card sx={{
      minHeight: 190,
      border: `1px solid ${isToday ? 'rgba(192,92,46,0.35)' : '#EAE4DC'} !important`,
      boxShadow: isToday ? '0 2px 12px rgba(192,92,46,0.1) !important' : undefined,
    }}>
      <CardContent sx={{ p: '14px 14px 10px !important' }}>
        <Box mb={1.25}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isToday ? 'primary.main' : '#A8A29E', mb: 0.5 }}>
            {dayName}
          </Typography>
          {isToday ? (
            // Today's date gets a filled circle, like most calendar apps.
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.main',
            }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'white', lineHeight: 1 }}>
                {dayOfMonth}
              </Typography>
            </Box>
          ) : (
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1C1917', lineHeight: 1 }}>
              {dayOfMonth}
            </Typography>
          )}
        </Box>
        <Stack spacing={0.625}>
          {tasks.map(task => <EventChip key={task.id} task={task} onToggle={onToggle} />)}
          {tasks.length === 0 && (
            <Typography sx={{ fontSize: 11, color: '#D6CFCA', textAlign: 'center', mt: 2 }}>—</Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

/** Compact chips for tasks that have no scheduled date yet. */
function UnscheduledStrip({ tasks }) {
  if (tasks.length === 0) return null;
  return (
    <Card>
      <CardContent sx={{ p: '18px 20px !important' }}>
        <SectionTitle sx={{ mb: 1.5, color: '#78716C' }}>
          Unscheduled · {tasks.length}
        </SectionTitle>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.875 }}>
          {[...tasks].sort((a, b) => a.priority - b.priority).map(task => (
            <Box key={task.id} sx={{
              display: 'flex', alignItems: 'center', gap: 0.75,
              bgcolor: CATS[task.category]?.b || '#F7F2EC',
              border: `1px solid ${CATS[task.category]?.c || '#ccc'}40`,
              borderRadius: '8px', p: '5px 10px',
            }}>
              <Dot p={task.priority} />
              <Typography sx={{ fontSize: 12, color: '#1C1917' }}>{task.title}</Typography>
              <Typography sx={{ fontSize: 11, color: '#78716C' }}>· {task.assignee}</Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

export function CalView({ tasks, onToggle }) {
  // Recurring tasks become one instance per matching day of this week.
  const expanded    = expandRecurring(tasks, WEEK);
  const unscheduled = tasks.filter(t => !t.scheduledDate && !t.done && !t.recurrence);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'flex-end' }} mb={3} flexWrap="wrap" gap={2}>
        <PageHeader title="This Week" subtitle={weekRangeLabel(WEEK)} />
        <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={() => exportICS(tasks)}
          sx={{ borderColor: '#EAE4DC', color: 'primary.main', '&:hover': { borderColor: 'primary.main', bgcolor: '#FAE8DE' } }}>
          Export .ics
        </Button>
      </Stack>

      {/* On narrow screens the 7 columns scroll horizontally instead of squeezing. */}
      <Box sx={{ overflowX: 'auto', mb: 3, mx: { xs: -2, sm: 0 }, px: { xs: 2, sm: 0 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))', gap: '14px', minWidth: { xs: '840px', lg: 'unset' } }}>
          {WEEK.map((date, i) => {
            const dayTasks = expanded
              .filter(t => t.scheduledDate === date)
              .sort((a, b) => a.priority - b.priority || (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
            return <DayCard key={date} date={date} dayName={DAY_NAMES[i]} tasks={dayTasks} onToggle={onToggle} />;
          })}
        </Box>
      </Box>

      <UnscheduledStrip tasks={unscheduled} />
    </Box>
  );
}
