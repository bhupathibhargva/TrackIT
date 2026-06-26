import { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Stack, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CATS } from '../constants.js';
import { TaskRow } from './TaskRow.jsx';

const ASSIGNEES = [['all', 'Everyone'], ['Bhargav', 'Bhargav'], ['Rupa', 'Rupa']];
const BENTO = { xs: 'repeat(2, 1fr)', md: 'repeat(12, 1fr)' };
const FULL  = { xs: 'span 2', md: 'span 12' };
const HALF  = { xs: 'span 2', md: 'span 6' };

export function ListView({ tasks, onToggle, onDelete, onMove, onEdit, onAdd }) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [showCompleted, setShowCompleted]   = useState(false);

  const categoryOptions = [['all', 'All'], ...Object.entries(CATS).map(([key, cat]) => [key, `${cat.e} ${cat.l}`])];

  let filtered = [...tasks];
  if (categoryFilter !== 'all') filtered = filtered.filter(t => t.category === categoryFilter);
  if (assigneeFilter !== 'all') filtered = filtered.filter(t => t.assignee === assigneeFilter || t.assignee === 'Both');
  if (!showCompleted) filtered = filtered.filter(t => !t.done);
  filtered.sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));

  const completedCount = tasks.filter(t => t.done).length;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: BENTO, gap: '14px', alignItems: 'start' }}>

      {/* ── TITLE CARD ── */}
      <Card sx={{ gridColumn: { xs: 'span 2', md: 'span 9' } }}>
        <CardContent sx={{ p: '20px 24px !important' }}>
          <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#1C1917', letterSpacing: '-0.02em', lineHeight: 1 }}>
            All Tasks
          </Typography>
          <Typography sx={{ color: '#78716C', mt: 0.625, fontSize: 13.5 }}>
            {tasks.filter(t => !t.done).length} remaining · {completedCount} done
          </Typography>
        </CardContent>
      </Card>

      {/* ── ADD TASK BENTO CTA ── */}
      <Box
        component="button"
        onClick={onAdd}
        sx={{
          gridColumn: { xs: 'span 2', md: 'span 3' },
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 0.75, p: 2.5, borderRadius: '14px', cursor: 'pointer',
          border: '2px dashed #D1C9C0', bgcolor: 'transparent', fontFamily: 'inherit',
          transition: 'all 0.15s',
          '&:hover': { borderColor: 'primary.main', bgcolor: '#FAE8DE', borderStyle: 'solid' },
        }}
      >
        <Box sx={{
          width: 36, height: 36, borderRadius: '50%', bgcolor: '#FAE8DE',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AddIcon sx={{ fontSize: 20, color: 'primary.main' }} />
        </Box>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'primary.main', fontFamily: 'inherit' }}>
          Add Task
        </Typography>
      </Box>

      {/* ── CATEGORY FILTER CARD ── */}
      <Card sx={{ gridColumn: HALF }}>
        <CardContent sx={{ p: '14px 18px !important' }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
            Category
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {categoryOptions.map(([key, label]) => (
              <Chip
                key={key}
                label={label}
                onClick={() => setCategoryFilter(key)}
                variant={categoryFilter === key ? 'filled' : 'outlined'}
                color={categoryFilter === key ? 'primary' : 'default'}
                size="small"
                sx={{ fontWeight: categoryFilter === key ? 600 : 400, fontSize: 12, borderColor: '#EAE4DC' }}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* ── ASSIGNEE FILTER CARD ── */}
      <Card sx={{ gridColumn: HALF }}>
        <CardContent sx={{ p: '14px 18px !important' }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
            Assigned to
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {ASSIGNEES.map(([value, label]) => (
              <Chip
                key={value}
                label={label}
                onClick={() => setAssigneeFilter(value)}
                variant={assigneeFilter === value ? 'filled' : 'outlined'}
                color={assigneeFilter === value ? 'primary' : 'default'}
                size="small"
                sx={{ fontWeight: assigneeFilter === value ? 600 : 400, fontSize: 12, borderColor: '#EAE4DC' }}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* ── TASK LIST CARD ── */}
      <Card sx={{ gridColumn: FULL }}>
        <CardContent sx={{ p: '14px 16px !important' }}>
          {filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography sx={{ color: '#A8A29E', fontSize: 14 }}>
                {tasks.filter(t => !t.done).length === 0 ? 'All done! 🎉' : 'No tasks match this filter.'}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={0.75}>
              {filtered.map(task => (
                <TaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onMove={onMove} onEdit={onEdit} />
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* ── SHOW COMPLETED ── */}
      {completedCount > 0 && (
        <Box sx={{ gridColumn: FULL }}>
          <Button
            onClick={() => setShowCompleted(s => !s)}
            sx={{ color: '#78716C', fontSize: 13, textDecoration: 'underline', textTransform: 'none', p: 0, '&:hover': { bgcolor: 'transparent', color: '#1C1917' } }}
            disableRipple
          >
            {showCompleted ? 'Hide' : 'Show'} completed ({completedCount})
          </Button>
        </Box>
      )}
    </Box>
  );
}
