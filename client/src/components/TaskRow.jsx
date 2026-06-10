import { useState } from 'react';
import { Box, Checkbox, Typography, IconButton, Tooltip, Stack } from '@mui/material';
import ArrowUpwardIcon    from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon  from '@mui/icons-material/ArrowDownward';
import EditOutlinedIcon   from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon  from '@mui/icons-material/DeleteOutlined';
import { Pill } from './Pill.jsx';

const PRIORITY_COLORS = ['', '#E53E3E', '#DD6B20', '#D69E2E', '#38A169', '#9AA0AA'];

export function TaskRow({ task, onToggle, onDelete, onMove, onEdit }) {
  const [hover, setHover] = useState(false);

  return (
    <Box
      data-testid="task-row"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      sx={{
        display: 'flex', alignItems: 'center',
        bgcolor: hover ? '#F7F2EC' : 'background.paper',
        border: '1px solid', borderColor: 'divider',
        borderRadius: 2, transition: 'background 0.12s',
        opacity: task.done ? 0.55 : 1,
        overflow: 'hidden',
      }}
    >
      {/* Priority stripe */}
      <Box sx={{
        width: 4, alignSelf: 'stretch', flexShrink: 0,
        bgcolor: PRIORITY_COLORS[task.priority] ?? '#EAE4DC',
      }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flex: 1, px: 1.5, py: 1.125, minWidth: 0 }}>
        <Checkbox
          size="small"
          checked={task.done}
          onChange={() => onToggle(task.id)}
          sx={{ p: 0, color: '#C8BFB0', '&.Mui-checked': { color: 'primary.main' }, flexShrink: 0 }}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{
            fontSize: 13.5, color: '#1C1917', fontWeight: task.done ? 400 : 500,
            textDecoration: task.done ? 'line-through' : 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4,
          }}>
            {task.recurrence && <span style={{ marginRight: 5, fontSize: 10, opacity: 0.6 }}>🔄</span>}
            {task.title}
          </Typography>
          <Stack direction="row" spacing={0.75} mt={0.3} alignItems="center" flexWrap="wrap">
            <Pill cat={task.category} small />
            <Typography sx={{ fontSize: 11, color: '#A8A29E' }}>{task.assignee}</Typography>
            {task.dueDate && <Typography sx={{ fontSize: 11, color: '#C05C2E', fontWeight: 500 }}>Due {task.dueDate}</Typography>}
            {task.recurrence
              ? <Typography sx={{ fontSize: 11, color: '#A8A29E' }}>{task.recurrence}{task.scheduledTime ? ' · ' + task.scheduledTime : ''}</Typography>
              : task.scheduledDate && <Typography sx={{ fontSize: 11, color: '#A8A29E' }}>📅 {task.scheduledDate}{task.scheduledTime ? ' ' + task.scheduledTime : ''}</Typography>
            }
          </Stack>
        </Box>

        {hover && (
          <Stack direction="row" spacing={0.5} flexShrink={0}>
            {[
              [() => onMove(task.id, 'up'),   <ArrowUpwardIcon fontSize="small" />,   'Higher priority', false],
              [() => onMove(task.id, 'down'), <ArrowDownwardIcon fontSize="small" />, 'Lower priority',  false],
              [() => onEdit(task),            <EditOutlinedIcon fontSize="small" />,  'Edit',            false],
              [() => onDelete(task.id),       <DeleteOutlineIcon fontSize="small" />, 'Delete',          true],
            ].map(([fn, icon, title, danger], i) => (
              <Tooltip key={i} title={title} arrow>
                <IconButton size="small" aria-label={title} onClick={fn} sx={{
                  border: '1px solid',
                  borderColor: danger ? 'rgba(197,48,48,0.25)' : '#EAE4DC',
                  borderRadius: 1.5,
                  bgcolor: danger ? '#FFF5F5' : '#F7F2EC',
                  color: danger ? 'error.main' : '#78716C',
                  p: '4px',
                  '&:hover': { bgcolor: danger ? '#FED7D7' : '#EDE3D8', color: danger ? 'error.main' : '#1C1917' },
                }}>
                  {icon}
                </IconButton>
              </Tooltip>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
