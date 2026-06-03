import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.jsx';

const theme = createTheme({
  palette: {
    primary:    { main: '#B85C38' },
    secondary:  { main: '#E8956A' },
    background: { default: '#F7F3ED', paper: '#FFFDF9' },
    error:      { main: '#C53030' },
    divider:    '#E4DDD3',
  },
  typography: {
    fontFamily: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 500 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: 'none', fontWeight: 500 } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: '1px solid #E4DDD3', borderRadius: 10 } },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
    },
    MuiDrawer: {
      styleOverrides: { paper: { border: 'none' } },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 6 } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 12 } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 8, fontSize: 14 },
        notchedOutline: { borderColor: '#E4DDD3' },
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
