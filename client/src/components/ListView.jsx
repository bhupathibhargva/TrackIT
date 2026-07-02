// ListView — the "All Tasks" view: title, an Add Task tile, two filter
// cards (category + assignee), and the filtered task list.
import { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Stack, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CATS, MEMBERS, BENTO_COLS, BENTO_FULL, BENTO_HALF } from '../constants.js';
import { TaskRow } from './TaskRow.jsx';
import { PageHeader } from './PageHeader.jsx';

// Filter options as [value, label] pairs. 'all' means no filtering.
const ASSIGNEE_OPTIONS = [['all', 'Everyone'], ...MEMBERS.map(m => [m, m])];
const CATEGORY_OPTIONS = [['all', 'All'], ...Object.entries(CATS).map(([key, cat]) => [key, `${cat.e} ${cat.l}`])];

/** A card with a labelled row of filter chips; the selected one is filled. */
function FilterCard({ label, options, selected, onSelect }) {
  return (
    <Card sx={{ gridColumn: BENTO_HALF }}>
      <CardContent sx={{ p: '14px 18px !important' }}>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
          {label}
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          {options.map(([value, optionLabel]) => (
            <Chip
              key={value}
              label={optionLabel}
              onClick={() => onSelect(value)}
              variant={selected === value ? 'filled' : 'outlined'}
              color={selected === value ? 'primary' : 'default'}
              size="small"
              sx={{ fontWeight: selected === value ? 600 : 400, fontSize: 12, borderColor: '#EAE4DC' }}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

/** Dashed "Add Task" call-to-action tile. */
function AddTaskTile({ onAdd }) {
  return (
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
  );
}

export function ListView({ tasks, onToggle, onDelete, onMove, onEdit, onAdd }) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [showCompleted, setShowCompleted]   = useState(false);

  // Apply the three filters, then sort by priority (ties broken by title).
  // "Both" tasks belong to everyone, so they pass any assignee filter.
  let filtered = [...tasks];
  if (categoryFilter !== 'all') filtered = filtered.filter(t => t.category === categoryFilter);
  if (assigneeFilter !== 'all') filtered = filtered.filter(t => t.assignee === assigneeFilter || t.assignee === 'Both');
  if (!showCompleted) filtered = filtered.filter(t => !t.done);
  filtered.sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));

  const completedCount = tasks.filter(t => t.done).length;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: BENTO_COLS, gap: '14px', alignItems: 'start' }}>

      <Card sx={{ gridColumn: { xs: 'span 2', md: 'span 9' } }}>
        <CardContent sx={{ p: '20px 24px !important' }}>
          <PageHeader
            title="All Tasks"
            subtitle={`${tasks.filter(t => !t.done).length} remaining · ${completedCount} done`}
          />
        </CardContent>
      </Card>

      <AddTaskTile onAdd={onAdd} />

      <FilterCard label="Category"    options={CATEGORY_OPTIONS} selected={categoryFilter} onSelect={setCategoryFilter} />
      <FilterCard label="Assigned to" options={ASSIGNEE_OPTIONS} selected={assigneeFilter} onSelect={setAssigneeFilter} />

      <Card sx={{ gridColumn: BENTO_FULL }}>
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

      {completedCount > 0 && (
        <Box sx={{ gridColumn: BENTO_FULL }}>
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
