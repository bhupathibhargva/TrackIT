import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert, Typography, Stack, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export function SettingsModal({ apiKey: initial, onSave, onDelete, onClose }) {
  const [key, setKey]                     = useState(initial);
  const [showKey, setShowKey]             = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const hasKey = !!initial;
  const masked = initial ? initial.slice(0, 6) + '••••••••••••' + initial.slice(-4) : '';

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        Settings
        <IconButton size="small" onClick={onClose} edge="end"><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} pt={0.5}>
          {hasKey && (
            <Alert severity="success" action={
              <Button size="small" color="inherit" onClick={() => setShowKey(s => !s)}>
                {showKey ? 'Hide' : 'Show'}
              </Button>
            }>
              <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.25 }}>
                Active Key
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                {showKey ? initial : masked}
              </Typography>
            </Alert>
          )}

          <TextField
            label={hasKey ? 'Replace Key' : 'Gemini API Key'}
            type="password"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="AIza…"
            fullWidth size="small"
          />
          <Typography sx={{ fontSize: 12, color: '#8B8278', lineHeight: 1.6 }}>
            Get a free key at <strong>aistudio.google.com</strong> → Get API Key.
            Stored only in your browser — never sent anywhere except Google.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        {hasKey && !confirmDelete && (
          <Button color="error" variant="outlined" onClick={() => setConfirmDelete(true)} sx={{ mr: 'auto' }}>
            Delete Key
          </Button>
        )}
        {hasKey && confirmDelete && (
          <Button color="error" variant="contained" onClick={onDelete} sx={{ mr: 'auto' }}>
            Confirm Delete
          </Button>
        )}
        {!hasKey && (
          <Button onClick={onClose} variant="outlined" sx={{ borderColor: '#E2DAD0', color: '#5A5248' }}>
            Cancel
          </Button>
        )}
        <Button variant="contained" disabled={!key.trim()} onClick={() => { if (key.trim()) onSave(key.trim()); }}>
          {hasKey ? 'Update Key' : 'Save Key'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
