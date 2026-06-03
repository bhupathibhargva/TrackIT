import { useState } from 'react';
import { Box, Typography, Button, Stack, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CATS } from '../constants.js';
import { TaskRow } from './TaskRow.jsx';

export function ListView({ tasks, onToggle, onDelete, onMove, onEdit, onAdd }) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [showCompleted, setShowCompleted]   = useState(false);

  const categoryOptions = [['all', 'All'], ...Object.entries(CATS).map(([key, cat]) => [key, `${cat.e} ${cat.l}`])];

  let filteredTasks = [...tasks];
  if (categoryFilter !== 'all') filteredTasks = filteredTasks.filter(task => task.category === categoryFilter);
  if (assigneeFilter !== 'all') filteredTasks = filteredTasks.filter(task => task.assignee === assigneeFilter || task.assignee === 'Both');
  if (!showCompleted) filteredTasks = filteredTasks.filter(task => !task.done);
  filteredTasks.sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.75}>
        <Typography sx={{ fontSize: 28, fontWeight: 600, color: '#25221F' }}>All Tasks</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>Add Task</Button>
      </Stack>

      <Stack direction="row" flexWrap="wrap" gap={1} mb={1} alignItems="center">
        {categoryOptions.map(([key, label]) => (
          <Chip
            key={key}
            label={label}
            onClick={() => setCategoryFilter(key)}
            variant={categoryFilter === key ? 'filled' : 'outlined'}
            color={categoryFilter === key ? 'primary' : 'default'}
            size="small"
            sx={{ fontWeight: categoryFilter === key ? 600 : 400, fontSize: 12 }}
          />
        ))}
      </Stack>
      <Stack direction="row" spacing={0.75} mb={2.25}>
        {[['all', 'Everyone'], ['Bhargav', 'Bhargav'], ['Rupa', 'Rupa']].map(([value, label]) => (
          <Chip
            key={value}
            label={label}
            onClick={() => setAssigneeFilter(value)}
            variant={assigneeFilter === value ? 'filled' : 'outlined'}
            color={assigneeFilter === value ? 'primary' : 'default'}
            size="small"
            sx={{ fontSize: 12 }}
          />
        ))}
      </Stack>

      <Stack spacing={0.75}>
        {filteredTasks.map(task => (
          <TaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onMove={onMove} onEdit={onEdit} />
        ))}
        {filteredTasks.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6, color: '#706A63' }}>
            <Typography sx={{ color: '#706A63' }}>
              {tasks.filter(t => !t.done).length === 0 ? 'All done! 🎉' : 'No tasks match this filter.'}
            </Typography>
          </Box>
        )}
      </Stack>

      <Button
        onClick={() => setShowCompleted(showing => !showing)}
        sx={{ mt: 1.75, color: '#706A63', fontSize: 13, textDecoration: 'underline', textTransform: 'none' }}
      >
        {showCompleted ? 'Hide' : 'Show'} completed ({tasks.filter(t => t.done).length})
      </Button>
    </Box>
  );
}
