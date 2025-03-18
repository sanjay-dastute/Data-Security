import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3B82F6',     // Secondary Blue
      dark: '#1E3A8A',     // Primary Blue
      light: '#BFDBFE',    // Light Blue
    },
    secondary: {
      main: '#1E3A8A',     // Primary Blue
      light: '#3B82F6',    // Secondary Blue
    },
    background: {
      default: '#FFFFFF',
      paper: 'rgba(191, 219, 254, 0.1)', // Light Blue with 10% opacity
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '12px 24px',
        },
        contained: {
          background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
          color: '#FFFFFF',
          '&:hover': {
            background: 'linear-gradient(to right, #1E3A8A, #4B92FF)',
          },
        },
        outlined: {
          borderColor: '#3B82F6',
          color: '#3B82F6',
          '&:hover': {
            backgroundColor: '#BFDBFE',
            borderColor: '#1E3A8A',
            color: '#1E3A8A',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          border: '1px solid #BFDBFE',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E3A8A',
          '& .MuiTableCell-head': {
            color: '#FFFFFF',
            fontWeight: 'bold',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: '#F9FAFB',
          },
          '&:hover': {
            backgroundColor: '#BFDBFE',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#3B82F6',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3B82F6',
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#1E3A8A',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '&.MuiChip-colorSuccess': {
            backgroundColor: '#BFDBFE',
            color: '#1E3A8A',
          },
        },
      },
    },
  },
});

export default theme;
