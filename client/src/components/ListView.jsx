import { useState } from 'react';
import { Box, Typography, Button, Stack, Chip, Card, CardContent, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CATS } from '../constants.js';
import { TaskRow } from './TaskRow.jsx';

const ASSIGNEES = [['all', 'Everyone'], ['Bhargav', 'Bhargav'], ['Rupa', 'Rupa']];

export function ListView({ tasks, onToggle, onDelete, onMove, onEdit, onAdd }) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [showCompleted, setShowCompleted]   = useState(false);

  const categoryOptions = [['all', 'All'], ...Object.entries(CATS).map(([key, cat]) => [key, `${cat.e} ${cat.l}`])];

  let filteredTasks = [...tasks];
  if (categoryFilter !== 'all') filteredTasks = filteredTasks.filter(t => t.category === categoryFilter);
  if (assigneeFilter !== 'all') filteredTasks = filteredTasks.filter(t => t.assignee === assigneeFilter || t.assignee === 'Both');
  if (!showCompleted) filteredTasks = filteredTasks.filter(t => !t.done);
  filteredTasks.sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));

  const completedCount = tasks.filter(t => t.done).length;

  return (
    <Box>
      {/* Page header — consistent with all other views */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#1C1917', letterSpacing: '-0.02em', lineHeight: 1 }}>
            All Tasks
          </Typography>
          <Typography sx={{ color: '#78716C', mt: 0.625, fontSize: 13.5 }}>
            {tasks.filter(t => !t.done).length} remaining · {completedCount} done
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{ flexShrink: 0, alignSelf: { xs: 'flex-start', sm: 'center' } }}
        >
          Add Task
        </Button>
      </Stack>

      {/* Filters card */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: '14px 18px !important' }}>
          {/* Category row */}
          <Box sx={{ mb: 1.5 }}>
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
                  sx={{
                    fontWeight: categoryFilter === key ? 600 : 400,
                    fontSize: 12,
                    borderColor: '#EAE4DC',
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Divider sx={{ borderColor: '#EAE4DC', mb: 1.5 }} />

          {/* Assignee row */}
          <Box>
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
                  sx={{
                    fontWeight: assigneeFilter === value ? 600 : 400,
                    fontSize: 12,
                    borderColor: '#EAE4DC',
                  }}
                />
              ))}
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Task list */}
      <Stack spacing={0.75}>
        {filteredTasks.map(task => (
          <TaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onMove={onMove} onEdit={onEdit} />
        ))}
        {filteredTasks.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography sx={{ color: '#A8A29E', fontSize: 14 }}>
              {tasks.filter(t => !t.done).length === 0 ? 'All done! 🎉' : 'No tasks match this filter.'}
            </Typography>
          </Box>
        )}
      </Stack>

      {completedCount > 0 && (
        <Button
          onClick={() => setShowCompleted(s => !s)}
          sx={{ mt: 2, color: '#78716C', fontSize: 13, textDecoration: 'underline', textTransform: 'none', p: 0, '&:hover': { bgcolor: 'transparent', color: '#1C1917' } }}
          disableRipple
        >
          {showCompleted ? 'Hide' : 'Show'} completed ({completedCount})
        </Button>
      )}
    </Box>
  );
}
