import { useRef, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Card, CardContent, Stack, Button } from '@mui/material';
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxWidth: 680 }}>
      {/* Header */}
      <Box sx={{ mb: 3, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#1C1917', letterSpacing: '-0.02em', mb: 0.5 }}>
          AI Assistant
        </Typography>
        <Typography sx={{ color: '#78716C', fontSize: 13.5 }}>
          Natural language task management · smart scheduling · auto-reprioritization
        </Typography>
      </Box>

      {/* Auto-schedule CTA */}
      <Button
        variant="contained"
        fullWidth
        startIcon={<AutoAwesomeIcon />}
        onClick={onSchedule}
        disabled={loading}
        sx={{ mb: 2.5, py: 1.25, fontSize: 14, fontWeight: 600, borderRadius: 2, flexShrink: 0 }}
      >
        {loading ? 'Working…' : 'Auto-Schedule This Week'}
      </Button>

      {/* Chat area */}
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Messages */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
          {log.length === 0 ? (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{
                width: 52, height: 52, borderRadius: '50%', bgcolor: '#FAE8DE',
                display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5,
              }}>
                <AutoAwesomeIcon sx={{ fontSize: 24, color: 'primary.main' }} />
              </Box>
              <Typography sx={{ fontSize: 17, fontWeight: 600, color: '#1C1917', mb: 0.5 }}>
                Ask me anything
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#A8A29E', mb: 2.5, textAlign: 'center' }}>
                Try one of these to get started
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, width: '100%', maxWidth: 560 }}>
                {SUGGESTIONS.map((s, i) => (
                  <Button key={i} variant="outlined" onClick={() => setInput(s)} sx={{
                    fontSize: 12, color: '#5C4A3A', textAlign: 'left',
                    borderColor: '#EAE4DC', bgcolor: '#F7F2EC',
                    textTransform: 'none', justifyContent: 'flex-start', alignItems: 'flex-start',
                    p: '10px 12px', lineHeight: 1.45, borderRadius: 2,
                    '&:hover': { bgcolor: '#EDE3D8', borderColor: '#C05C2E' },
                  }}>
                    "{s}"
                  </Button>
                ))}
              </Box>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {log.map((m, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {m.role === 'assistant' && (
                    <Box sx={{
                      width: 26, height: 26, borderRadius: '50%', bgcolor: '#FAE8DE',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      mr: 1, mt: 0.25, flexShrink: 0,
                    }}>
                      <AutoAwesomeIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                    </Box>
                  )}
                  <Box sx={{
                    maxWidth: '75%', px: 1.75, py: 1.125, lineHeight: 1.6, fontSize: 14,
                    borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                    bgcolor: m.role === 'user' ? 'primary.main' : '#F7F2EC',
                    color: m.role === 'user' ? 'white' : '#1C1917',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                  }}>
                    {m.text}
                  </Box>
                </Box>
              ))}
              {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 26, height: 26, borderRadius: '50%', bgcolor: '#FAE8DE',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <AutoAwesomeIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                  </Box>
                  <Box sx={{ fontSize: 14, color: '#78716C', px: 1.75, py: 1.125, bgcolor: '#F7F2EC', borderRadius: '4px 14px 14px 14px' }}>
                    Thinking…
                  </Box>
                </Box>
              )}
            </Stack>
          )}
          <div ref={endRef} />
        </Box>

        {/* Input */}
        <Box sx={{ borderTop: '1px solid #EAE4DC', p: 1.5, display: 'flex', gap: 1, alignItems: 'flex-end', bgcolor: '#FDFAF6' }}>
          <TextField
            fullWidth size="small"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && onSend()}
            placeholder="Add, change, or remove tasks in plain English…"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'white' } }}
          />
          <IconButton
            onClick={onSend}
            disabled={loading || !input.trim()}
            sx={{
              bgcolor: 'primary.main', color: 'white', borderRadius: 2, width: 38, height: 38, flexShrink: 0,
              '&:hover': { bgcolor: 'primary.dark' },
              '&.Mui-disabled': { bgcolor: '#EAE4DC', color: '#A8A29E' },
            }}
          >
            <SendIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Box>
      </Card>
    </Box>
  );
}
