import createTheme from '@mui/material/styles/createTheme';

export const buildTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#2d3748' : '#f6ad55'
      },
      secondary: {
        main: mode === 'light' ? '#e07a5f' : '#81e6d9'
      },
      background: {
        default: mode === 'light' ? '#f7f4ef' : '#1b2029',
        paper: mode === 'light' ? '#ffffff' : '#232a36'
      }
    },
    typography: {
      fontFamily: '"Space Grotesk", sans-serif',
      h4: {
        fontWeight: 600,
        letterSpacing: '-0.02em'
      },
      h6: {
        fontWeight: 600
      },
      subtitle1: {
        fontFamily: '"IBM Plex Mono", monospace'
      }
    },
    shape: {
      borderRadius: 16
    }
  });
