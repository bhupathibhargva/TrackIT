import { useState } from 'react';
import { Box, Typography, Button, Stack, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CATS } from '../constants.js';
import { TaskRow } from './TaskRow.jsx';

export function ListView({ tasks, onToggle, onDelete, onMove, onEdit, onAdd }) {
  const [catF, setCatF]         = useState('all');
  const [who, setWho]           = useState('all');
  const [showDone, setShowDone] = useState(false);

  let vis = [...tasks];
  if (catF !== 'all') vis = vis.filter(t => t.category === catF);
  if (who !== 'all')  vis = vis.filter(t => t.assignee === who || t.assignee === 'Both');
  if (!showDone)      vis = vis.filter(t => !t.done);
  vis.sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));

  const catOpts = [['all', 'All'], ...Object.entries(CATS).map(([k, v]) => [k, v.e + ' ' + v.l])];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.75}>
        <Typography sx={{ fontSize: 28, fontWeight: 600, color: '#25221F' }}>All Tasks</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>Add Task</Button>
      </Stack>

      <Stack direction="row" flexWrap="wrap" gap={1} mb={1} alignItems="center">
        {catOpts.map(([k, l]) => (
          <Chip
            key={k}
            label={l}
            onClick={() => setCatF(k)}
            variant={catF === k ? 'filled' : 'outlined'}
            color={catF === k ? 'primary' : 'default'}
            size="small"
            sx={{ fontWeight: catF === k ? 600 : 400, fontSize: 12 }}
          />
        ))}
      </Stack>
      <Stack direction="row" spacing={0.75} mb={2.25}>
        {['all', 'Bhargav', 'Rupa'].map(w => (
          <Chip
            key={w}
            label={w === 'all' ? 'Everyone' : w}
            onClick={() => setWho(w)}
            variant={who === w ? 'filled' : 'outlined'}
            color={who === w ? 'primary' : 'default'}
            size="small"
            sx={{ fontSize: 12 }}
          />
        ))}
      </Stack>

      <Stack spacing={0.75}>
        {vis.map(t => (
          <TaskRow key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} onMove={onMove} onEdit={onEdit} />
        ))}
        {vis.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6, color: '#8B8278' }}>
            <Typography sx={{ color: '#706A63' }}>{tasks.filter(t => !t.done).length === 0 ? 'All done! 🎉' : 'No tasks match this filter.'}</Typography>
          </Box>
        )}
      </Stack>

      <Button
        onClick={() => setShowDone(!showDone)}
        sx={{ mt: 1.75, color: '#706A63', fontSize: 13, textDecoration: 'underline', textTransform: 'none' }}
      >
        {showDone ? 'Hide' : 'Show'} completed ({tasks.filter(t => t.done).length})
      </Button>
    </Box>
  );
}
