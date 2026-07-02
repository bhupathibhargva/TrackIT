// AIView — the chat interface for the Gemini assistant. Layout is a fixed-
// height column: header → auto-schedule button → chat card (messages scroll,
// input pinned to the bottom).
import { useRef, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Card, Stack, Button } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon        from '@mui/icons-material/Send';
import { PageHeader } from './PageHeader.jsx';

// Example prompts shown before the first message; clicking one fills the input.
const SUGGESTIONS = [
  'Add swimming lessons for toddler on Saturday mornings, repeating weekly',
  'Make the date night highest priority',
  'Add milk, eggs, bread and butter to grocery list',
  'Remove the insurance call',
];

/** The sparkle-in-a-circle avatar shown next to assistant messages. */
function AiAvatar({ size = 26 }) {
  return (
    <Box sx={{
      width: size, height: size, borderRadius: '50%', bgcolor: '#FAE8DE',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <AutoAwesomeIcon sx={{ fontSize: size * 0.54, color: 'primary.main' }} />
    </Box>
  );
}

/** One chat message. User messages align right in orange; assistant left with avatar. */
function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      {!isUser && <Box sx={{ mr: 1, mt: 0.25 }}><AiAvatar /></Box>}
      <Box sx={{
        maxWidth: '75%', px: 1.75, py: 1.125, lineHeight: 1.6, fontSize: 14,
        // The corner nearest the sender is squared off, like most chat apps.
        borderRadius: isUser ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
        bgcolor: isUser ? 'primary.main' : '#F7F2EC',
        color: isUser ? 'white' : '#1C1917',
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      }}>
        {message.text}
      </Box>
    </Box>
  );
}

/** Shown before the first message: a prompt to start plus tappable suggestions. */
function EmptyChat({ onPick }) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ mb: 1.5 }}><AiAvatar size={52} /></Box>
      <Typography sx={{ fontSize: 17, fontWeight: 600, color: '#1C1917', mb: 0.5 }}>
        Ask me anything
      </Typography>
      <Typography sx={{ fontSize: 13, color: '#A8A29E', mb: 2.5, textAlign: 'center' }}>
        Try one of these to get started
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', maxWidth: 560 }}>
        {SUGGESTIONS.map(suggestion => (
          <Button key={suggestion} variant="outlined" onClick={() => onPick(suggestion)} sx={{
            fontSize: 12, color: '#5C4A3A', textAlign: 'left',
            border: '1.5px solid #EAE4DC', bgcolor: '#F7F2EC',
            textTransform: 'none', justifyContent: 'flex-start', alignItems: 'flex-start',
            p: '12px 14px', lineHeight: 1.5, borderRadius: '12px',
            transition: 'all 0.15s',
            '&:hover': { bgcolor: '#EDE3D8', borderColor: '#C05C2E', border: '1.5px solid', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(192,92,46,0.12)' },
          }}>
            "{suggestion}"
          </Button>
        ))}
      </Box>
    </Box>
  );
}

export function AIView({ log, input, setInput, onSend, onSchedule, loading }) {
  // Keep the newest message in view whenever the log grows.
  const endRef = useRef(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [log]);

  return (
    // 120px ≈ the main area's vertical padding; subtracting it lets the chat
    // card fill the rest of the screen without the page itself scrolling.
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxWidth: 680 }}>
      <Box sx={{ mb: 3, flexShrink: 0 }}>
        <PageHeader
          title="AI Assistant"
          subtitle="Natural language task management · smart scheduling · auto-reprioritization"
        />
      </Box>

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

      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Message history (scrolls) */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
          {log.length === 0 ? (
            <EmptyChat onPick={setInput} />
          ) : (
            <Stack spacing={1.5}>
              {log.map((message, i) => <ChatBubble key={i} message={message} />)}
              {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AiAvatar />
                  <Box sx={{ fontSize: 14, color: '#78716C', px: 1.75, py: 1.125, bgcolor: '#F7F2EC', borderRadius: '4px 14px 14px 14px' }}>
                    Thinking…
                  </Box>
                </Box>
              )}
            </Stack>
          )}
          <div ref={endRef} />
        </Box>

        {/* Input row (pinned to the bottom of the card) */}
        <Box sx={{ borderTop: '1px solid #EAE4DC', p: 1.5, display: 'flex', gap: 1, alignItems: 'flex-end', bgcolor: '#FDFAF6' }}>
          <TextField
            fullWidth size="small"
            value={input}
            onChange={e => setInput(e.target.value)}
            // Ignore Enter while a reply is loading so a message can't be sent twice.
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !loading) onSend(); }}
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
