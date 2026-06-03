import { useState } from 'react';
import { Box, Checkbox, Typography, IconButton, Tooltip, Stack } from '@mui/material';
import ArrowUpwardIcon    from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon  from '@mui/icons-material/ArrowDownward';
import EditOutlinedIcon   from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon  from '@mui/icons-material/DeleteOutlined';
import { Pill, Dot } from './Pill.jsx';

export function TaskRow({ task, onToggle, onDelete, onMove, onEdit }) {
  const [hover, setHover] = useState(false);

  return (
    <Box
      data-testid="task-row"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.25, px: 1.75, py: 1.25,
        bgcolor: hover ? '#F5EFE8' : 'background.paper',
        border: '1px solid', borderColor: 'divider',
        borderRadius: 2, transition: 'background 0.1s',
        opacity: task.done ? 0.5 : 1,
      }}
    >
      <Checkbox
        size="small"
        checked={task.done}
        onChange={() => onToggle(task.id)}
        sx={{ p: 0, color: '#C8BFB0', '&.Mui-checked': { color: 'primary.main' } }}
      />
      <Dot p={task.priority} />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          fontSize: 14, color: '#25221F', fontWeight: task.done ? 400 : 500,
          textDecoration: task.done ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {task.recurrence && <span style={{ marginRight: 4, fontSize: 11 }}>🔄</span>}
          {task.title}
        </Typography>
        <Stack direction="row" spacing={0.75} mt={0.25} alignItems="center" flexWrap="wrap">
          <Pill cat={task.category} small />
          <Typography sx={{ fontSize: 11, color: '#706A63' }}>{task.assignee}</Typography>
          {task.dueDate && <Typography sx={{ fontSize: 11, color: '#C05621' }}>Due {task.dueDate}</Typography>}
          {task.recurrence
            ? <Typography sx={{ fontSize: 11, color: '#8B5E3C' }}>🔄 {task.recurrence}{task.scheduledTime ? ' · ' + task.scheduledTime : ''}</Typography>
            : task.scheduledDate && <Typography sx={{ fontSize: 11, color: '#8B5E3C' }}>📅 {task.scheduledDate}{task.scheduledTime ? ' ' + task.scheduledTime : ''}</Typography>
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
                borderColor: danger ? '#FEB2B2' : '#E4DDD3',
                borderRadius: 1.5,
                bgcolor: danger ? '#FFF5F5' : '#F5EFE8',
                color: danger ? 'error.main' : '#5C4A3A',
                p: '4px',
                '&:hover': { bgcolor: danger ? '#FED7D7' : '#EDE3D8' },
              }}>
                {icon}
              </IconButton>
            </Tooltip>
          ))}
        </Stack>
      )}
    </Box>
  );
}
