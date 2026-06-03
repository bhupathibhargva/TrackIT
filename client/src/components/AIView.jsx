import { useRef, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Stack } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon        from '@mui/icons-material/Send';

const SUGGESTIONS = [
  'Add swimming lessons for toddler on Saturday mornings, repeating weekly',
  'Make the date night highest priority',
  'Add milk, eggs, bread and butter to grocery list',
  'Remove the insurance call',
];

export function AIView({ log, input, setInput, onSend, onSchedule, loading }) {
  const endRef = useRef(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [log]);

  return (
    <Box sx={{ maxWidth: 680 }}>
      <Typography sx={{ fontSize: 28, fontWeight: 600, mb: 0.75, color: '#25221F' }}>
        AI Assistant
      </Typography>
      <Typography sx={{ color: '#706A63', mb: 2.75, fontSize: 14 }}>
        Natural language task management · smart scheduling · auto-reprioritization
      </Typography>

      <Button
        variant="contained"
        fullWidth
        size="large"
        startIcon={<AutoAwesomeIcon />}
        onClick={onSchedule}
        disabled={loading}
        sx={{ mb: 2.75, py: 1.5, fontSize: 15 }}
      >
        {loading ? 'Working…' : 'Auto-Schedule This Week'}
      </Button>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, minHeight: 280, maxHeight: 380, overflow: 'auto' }}>
          {log.length === 0 ? (
            <Box sx={{ color: '#706A63', textAlign: 'center', pt: 2.5 }}>
              <AutoAwesomeIcon sx={{ fontSize: 30, mb: 1.25, opacity: 0.4 }} />
              <Typography sx={{ fontSize: 18, fontWeight: 500, mb: 1.75, color: '#5C4A3A' }}>
                Ask me anything
              </Typography>
              <Stack spacing={0.75}>
                {SUGGESTIONS.map((s, i) => (
                  <Button key={i} variant="outlined" size="small" onClick={() => setInput(s)} sx={{
                    fontSize: 13, color: '#5C4A3A', textAlign: 'left',
                    borderColor: '#E4DDD3', bgcolor: '#F5EFE8',
                    textTransform: 'none', justifyContent: 'flex-start',
                    '&:hover': { bgcolor: '#EDE3D8', borderColor: '#E4DDD3' },
                  }}>
                    "{s}"
                  </Button>
                ))}
              </Stack>
            </Box>
          ) : (
            <Stack spacing={1.25}>
              {log.map((m, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <Box sx={{
                    maxWidth: '80%', px: 1.75, py: 1.25, borderRadius: 2, lineHeight: 1.55, fontSize: 14,
                    bgcolor: m.role === 'user' ? 'primary.main' : '#F5EFE8',
                    color: m.role === 'user' ? 'white' : '#25221F',
                  }}>
                    {m.text}
                  </Box>
                </Box>
              ))}
              {loading && (
                <Box sx={{ fontSize: 14, color: '#706A63', px: 1.75, py: 1.25, bgcolor: '#F5EFE8', borderRadius: 2, maxWidth: '50%' }}>
                  Thinking…
                </Box>
              )}
            </Stack>
          )}
          <div ref={endRef} />
        </Box>

        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 1.75, display: 'flex', gap: 1.25 }}>
          <TextField
            fullWidth size="small"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && onSend()}
            placeholder="Add, change, or remove tasks in plain English…"
          />
          <Button
            variant="contained"
            onClick={onSend}
            disabled={loading || !input.trim()}
            endIcon={<SendIcon />}
            sx={{ px: 2.25, flexShrink: 0, textTransform: 'none' }}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
