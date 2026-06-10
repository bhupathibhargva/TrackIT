import { Box, Typography, Card, CardContent, Stack, Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { CATS, WEEK, DAY_NAMES } from '../constants.js';
import { expandRecurring, exportICS } from '../utils.js';
import { Dot } from './Pill.jsx';

export function CalView({ tasks, onToggle }) {
  const expanded    = expandRecurring(tasks, WEEK);
  const unscheduled = tasks.filter(t => !t.scheduledDate && !t.done && !t.recurrence);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={3} flexWrap="wrap" gap={1.5}>
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#1C1917', letterSpacing: '-0.02em' }}>
            This Week
          </Typography>
          <Typography sx={{ color: '#78716C', fontSize: 13.5, mt: 0.5 }}>May 25 – 31, 2026</Typography>
        </Box>
        <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={() => exportICS(tasks)}
          sx={{ borderColor: '#EAE4DC', color: 'primary.main', '&:hover': { borderColor: 'primary.main', bgcolor: '#FAE8DE' } }}>
          Export .ics
        </Button>
      </Stack>

      <Box sx={{ overflowX: 'auto', mb: 3, mx: { xs: -2, sm: 0 }, px: { xs: 2, sm: 0 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))', gap: 1.5, minWidth: { xs: '840px', lg: 'unset' } }}>
          {WEEK.map((date, i) => {
            const dayTasks = expanded.filter(t => t.scheduledDate === date)
              .sort((a, b) => a.priority - b.priority || (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
            const isToday = i === 0;
            return (
              <Card key={date} sx={{
                minHeight: 190, borderRadius: '12px !important',
                border: `1px solid ${isToday ? 'rgba(192,92,46,0.35)' : '#EAE4DC'} !important`,
                boxShadow: isToday ? '0 2px 12px rgba(192,92,46,0.1) !important' : undefined,
              }}>
                <CardContent sx={{ p: '14px 14px 10px !important' }}>
                  <Box mb={1.25}>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isToday ? 'primary.main' : '#A8A29E', mb: 0.5 }}>
                      {DAY_NAMES[i]}
                    </Typography>
                    {isToday ? (
                      <Box sx={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.main',
                      }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'white', lineHeight: 1 }}>
                          {parseInt(date.split('-')[2])}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1C1917', lineHeight: 1 }}>
                        {parseInt(date.split('-')[2])}
                      </Typography>
                    )}
                  </Box>
                  <Stack spacing={0.625}>
                    {dayTasks.map(t => (
                      <Box key={t.id} onClick={() => onToggle(t.id)} sx={{
                        bgcolor: CATS[t.category]?.b || '#F7F2EC',
                        borderLeft: `2.5px solid ${CATS[t.category]?.c || '#C8BFB0'}`,
                        borderRadius: '0 6px 6px 0',
                        p: '5px 7px', cursor: 'pointer',
                        opacity: t.done ? 0.4 : 1, transition: 'opacity 0.15s',
                        '&:hover': { opacity: t.done ? 0.4 : 0.85 },
                      }}>
                        {t.scheduledTime && (
                          <Typography sx={{ fontSize: 9, color: CATS[t.category]?.c, fontWeight: 700, mb: '1px' }}>
                            {t.scheduledTime}
                          </Typography>
                        )}
                        <Typography sx={{ fontSize: 11, color: '#1C1917', fontWeight: 500, lineHeight: 1.3, textDecoration: t.done ? 'line-through' : 'none' }}>
                          {t.isInst && '🔄 '}{t.title}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: '#78716C', mt: '1px' }}>{t.assignee}</Typography>
                      </Box>
                    ))}
                    {dayTasks.length === 0 && (
                      <Typography sx={{ fontSize: 11, color: '#D6CFCA', textAlign: 'center', mt: 2 }}>—</Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>

      {unscheduled.length > 0 && (
        <Card>
          <CardContent sx={{ p: '18px 20px !important' }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 1.5, color: '#78716C' }}>
              Unscheduled · {unscheduled.length}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.875 }}>
              {unscheduled.sort((a, b) => a.priority - b.priority).map(t => (
                <Box key={t.id} sx={{
                  display: 'flex', alignItems: 'center', gap: 0.75,
                  bgcolor: CATS[t.category]?.b || '#F7F2EC',
                  border: `1px solid ${CATS[t.category]?.c || '#ccc'}40`,
                  borderRadius: '8px', p: '5px 10px',
                }}>
                  <Dot p={t.priority} />
                  <Typography sx={{ fontSize: 12, color: '#1C1917' }}>{t.title}</Typography>
                  <Typography sx={{ fontSize: 11, color: '#78716C' }}>· {t.assignee}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
