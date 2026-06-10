import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.jsx';

const theme = createTheme({
  palette: {
    primary:    { main: '#C05C2E', light: '#E8916B', dark: '#8A3F18', contrastText: '#fff' },
    secondary:  { main: '#E8916B' },
    background: { default: '#F5EFE7', paper: '#FDFAF6' },
    error:      { main: '#C53030' },
    warning:    { main: '#DD6B20' },
    divider:    '#EAE4DC',
    text: { primary: '#1C1917', secondary: '#78716C' },
  },
  typography: {
    fontFamily: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500, borderRadius: 8 },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: '1px solid #EAE4DC',
          boxShadow: '0 1px 4px rgba(28,25,23,0.06)',
          backgroundColor: '#FDFAF6',
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiDrawer: {
      styleOverrides: { paper: { border: 'none', backgroundImage: 'none' } },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10, fontSize: 14, backgroundColor: '#FDFAF6' },
        notchedOutline: { borderColor: '#EAE4DC' },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { fontSize: 14 } },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
