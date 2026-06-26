import { Box } from '@mui/material';
import { CATS, PRIORITY_COLORS, PRIORITY_LABELS } from '../constants.js';

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

export function Dot({ p: priority }) {
  return (
    <Box title={PRIORITY_LABELS[priority]} sx={{
      width: 8, height: 8, borderRadius: '50%',
      bgcolor: PRIORITY_COLORS[priority] ?? '#ccc', flexShrink: 0, display: 'inline-block',
    }} />
  );
}
