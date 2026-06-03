import { Box, Typography } from '@mui/material';
import { CATS } from '../constants.js';

export function Pill({ cat, small }) {
  const category = CATS[cat] ?? CATS.tasks;
  return (
    <Box component="span" sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.375,
      bgcolor: category.b, color: category.c, borderRadius: '6px',
      px: small ? 0.875 : 1.125, py: small ? '1px' : '2px',
      fontSize: small ? 10 : 11, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {category.e} {category.l}
    </Box>
  );
}

const PRIORITY_COLORS = ['', '#E53E3E', '#DD6B20', '#D69E2E', '#38A169', '#9AA0AA'];
const PRIORITY_LABELS = ['', 'Critical', 'High', 'Medium', 'Low', 'Someday'];

export function Dot({ p: priority }) {
  return (
    <Box title={PRIORITY_LABELS[priority]} sx={{
      width: 8, height: 8, borderRadius: '50%',
      bgcolor: PRIORITY_COLORS[priority] ?? '#ccc', flexShrink: 0, display: 'inline-block',
    }} />
  );
}

export function Field({ label, children }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#706A63', mb: 0.5, display: 'block' }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}
