import { Box, Typography, Paper, Stack, Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { CATS, WEEK, DAY_NAMES } from '../constants.js';
import { expandRecurring, exportICS } from '../utils.js';
import { Dot } from './Pill.jsx';

export function CalView({ tasks, onToggle }) {
  const expanded    = expandRecurring(tasks, WEEK);
  const unscheduled = tasks.filter(t => !t.scheduledDate && !t.done && !t.recurrence);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={2.75} flexWrap="wrap" gap={1.5}>
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 600, color: '#1C1C1C' }}>This Week</Typography>
          <Typography sx={{ color: '#8B8278', fontSize: 14 }}>May 25 – 31, 2026</Typography>
        </Box>
        <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={() => exportICS(tasks)}
          sx={{ borderColor: '#E2DAD0', color: '#2A4A1E' }}>
          Export .ics
        </Button>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1.25, mb: 2.75 }}>
        {WEEK.map((date, i) => {
          const dayTasks = expanded.filter(t => t.scheduledDate === date)
            .sort((a, b) => a.priority - b.priority || (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
          const isToday = i === 0;
          return (
            <Paper key={date} variant="outlined" sx={{
              p: 1.5, minHeight: 180, borderRadius: 2,
              borderColor: isToday ? 'primary.main' : 'divider',
            }}>
              <Box mb={1}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isToday ? 'primary.main' : '#8B8278' }}>
                  {DAY_NAMES[i]}
                </Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#1C1C1C' }}>
                  {parseInt(date.split('-')[2])}
                </Typography>
              </Box>
              <Stack spacing={0.625}>
                {dayTasks.map(t => (
                  <Box key={t.id} onClick={() => onToggle(t.id)} sx={{
                    bgcolor: CATS[t.category]?.b || '#F7F4EF',
                    borderLeft: `3px solid ${CATS[t.category]?.c || '#ccc'}`,
                    borderRadius: '0 5px 5px 0',
                    p: '5px 7px', cursor: 'pointer',
                    opacity: t.done ? 0.4 : 1, transition: 'opacity 0.15s',
                  }}>
                    {t.scheduledTime && (
                      <Typography sx={{ fontSize: 9, color: CATS[t.category]?.c, fontWeight: 700, mb: '1px' }}>
                        {t.scheduledTime}
                      </Typography>
                    )}
                    <Typography sx={{ fontSize: 11, color: '#1C1C1C', fontWeight: 500, lineHeight: 1.3, textDecoration: t.done ? 'line-through' : 'none' }}>
                      {t.isInst && '🔄 '}{t.title}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: '#8B8278', mt: '1px' }}>{t.assignee}</Typography>
                  </Box>
                ))}
                {dayTasks.length === 0 && (
                  <Typography sx={{ fontSize: 11, color: '#DDD5C8', textAlign: 'center', mt: 2 }}>—</Typography>
                )}
              </Stack>
            </Paper>
          );
        })}
      </Box>

      {unscheduled.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 600, mb: 1.5, color: '#8B8278' }}>
            Unscheduled · {unscheduled.length}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.875 }}>
            {unscheduled.sort((a, b) => a.priority - b.priority).map(t => (
              <Box key={t.id} sx={{
                display: 'flex', alignItems: 'center', gap: 0.75,
                bgcolor: CATS[t.category]?.b || '#F7F4EF',
                border: `1px solid ${CATS[t.category]?.c || '#ccc'}30`,
                borderRadius: '7px', p: '5px 10px',
              }}>
                <Dot p={t.priority} />
                <Typography sx={{ fontSize: 12, color: '#1C1C1C' }}>{t.title}</Typography>
                <Typography sx={{ fontSize: 11, color: '#8B8278' }}>· {t.assignee}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
