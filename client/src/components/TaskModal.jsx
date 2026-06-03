import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Button, Box, IconButton, Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { CATS, WEEK } from '../constants.js';

const BLANK = {
  title: '', category: 'tasks', priority: 3, assignee: 'Both', dueDate: '',
  duration: 30, notes: '', done: false, scheduledDate: null, scheduledTime: null,
  recurrence: null, completedDates: [],
};

export function TaskModal({ task: init, onSave, onClose }) {
  const [form, setForm] = useState(init || BLANK);
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }));

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        {init ? 'Edit Task' : 'New Task'}
        <IconButton size="small" onClick={onClose} edge="end"><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} pt={0.5}>
          <TextField
            label="Title"
            value={form.title}
            onChange={e => f('title', e.target.value)}
            placeholder="What needs to be done?"
            autoFocus fullWidth size="small"
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select label="Category" value={form.category} onChange={e => f('category', e.target.value)}>
                {Object.entries(CATS).map(([k, v]) => <MenuItem key={k} value={k}>{v.e} {v.l}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Assignee</InputLabel>
              <Select label="Assignee" value={form.assignee} onChange={e => f('assignee', e.target.value)}>
                {['Bhargav', 'Rupa', 'Both'].map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select label="Priority" value={form.priority} onChange={e => f('priority', +e.target.value)}>
                {[[1,'Critical'],[2,'High'],[3,'Medium'],[4,'Low'],[5,'Someday']].map(([p,l]) => (
                  <MenuItem key={p} value={p}>{p} — {l}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Repeats</InputLabel>
              <Select label="Repeats" value={form.recurrence || ''} onChange={e => f('recurrence', e.target.value || null)}>
                <MenuItem value="">One-time</MenuItem>
                <MenuItem value="daily">🔄 Daily</MenuItem>
                <MenuItem value="weekly">🔄 Weekly</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <TextField
              label="Due Date" type="date"
              value={form.dueDate || ''}
              onChange={e => f('dueDate', e.target.value)}
              fullWidth size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Duration (mins)" type="number"
              value={form.duration}
              onChange={e => f('duration', +e.target.value)}
              inputProps={{ min: 5, step: 5 }}
              fullWidth size="small"
            />
          </Box>

          {form.recurrence && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <TextField
                label="Time" type="time"
                value={form.scheduledTime || ''}
                onChange={e => f('scheduledTime', e.target.value)}
                fullWidth size="small"
                InputLabelProps={{ shrink: true }}
              />
              {form.recurrence === 'weekly' && (
                <FormControl fullWidth size="small">
                  <InputLabel>Day of Week</InputLabel>
                  <Select label="Day of Week" value={form.scheduledDate || WEEK[0]} onChange={e => f('scheduledDate', e.target.value)}>
                    {WEEK.map((d, i) => (
                      <MenuItem key={d} value={d}>
                        {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][i]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          )}

          <TextField
            label="Notes"
            value={form.notes}
            onChange={e => f('notes', e.target.value)}
            multiline rows={2}
            fullWidth size="small"
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: '#E2DAD0', color: '#5A5248' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!form.title.trim()}
          onClick={() => { if (form.title.trim()) onSave({ ...form, completedDates: form.completedDates || [] }); }}
        >
          {init ? 'Save Changes' : 'Add Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
