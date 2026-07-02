// Small shared text blocks so every view's headings look identical.
import { Box, Typography } from '@mui/material';

/** The "big title + small subtitle" block at the top of each view. */
export function PageHeader({ title, subtitle }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#1C1917', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ color: '#78716C', mt: 0.625, fontSize: 13.5 }}>{subtitle}</Typography>
      )}
    </Box>
  );
}

/** Heading used inside cards, e.g. "Today's Focus", "By Category". */
export function SectionTitle({ children, sx }) {
  return (
    <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1C1917', ...sx }}>
      {children}
    </Typography>
  );
}
