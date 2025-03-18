import { createTheme } from '@mui/material/styles';

// Define color constants for consistent usage
const COLORS = {
  PRIMARY_BLUE: '#1E3A8A',
  SECONDARY_BLUE: '#3B82F6',
  LIGHT_BLUE: '#BFDBFE',
  WHITE: '#FFFFFF',
  BLACK: '#333333',
  GRAY: '#666666',
  LIGHT_GRAY: '#F9FAFB',
  ERROR: '#EF4444',
  ERROR_DARK: '#991B1B'
};

const theme = createTheme({
  palette: {
    primary: {
      main: COLORS.SECONDARY_BLUE,
      dark: COLORS.PRIMARY_BLUE,
      light: COLORS.LIGHT_BLUE,
    },
    secondary: {
      main: COLORS.PRIMARY_BLUE,
      light: COLORS.SECONDARY_BLUE,
    },
    background: {
      default: COLORS.WHITE,
      paper: `rgba(191, 219, 254, 0.1)`, // Light Blue with 10% opacity
    },
    text: {
      primary: COLORS.BLACK,
      secondary: COLORS.GRAY,
    },
    error: {
      main: COLORS.ERROR,
      dark: COLORS.ERROR_DARK,
    }
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '24px',
    },
    h5: {
      fontWeight: 600,
      fontSize: '20px',
    },
    h6: {
      fontWeight: 600,
      fontSize: '18px',
    },
    body1: {
      fontSize: '14px',
    },
    body2: {
      fontSize: '14px',
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
          fontWeight: 'bold',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.02)',
          },
        },
        contained: {
          background: `linear-gradient(to right, ${COLORS.PRIMARY_BLUE}, ${COLORS.SECONDARY_BLUE})`,
          color: COLORS.WHITE,
          '&:hover': {
            background: `linear-gradient(to right, ${COLORS.PRIMARY_BLUE}, #4B92FF)`,
          },
        },
        outlined: {
          borderColor: COLORS.SECONDARY_BLUE,
          color: COLORS.SECONDARY_BLUE,
          '&:hover': {
            backgroundColor: COLORS.LIGHT_BLUE,
            borderColor: COLORS.PRIMARY_BLUE,
            color: COLORS.PRIMARY_BLUE,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(to right, ${COLORS.PRIMARY_BLUE}, ${COLORS.SECONDARY_BLUE})`
          }
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          border: `1px solid ${COLORS.LIGHT_BLUE}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(to right, ${COLORS.PRIMARY_BLUE}, ${COLORS.SECONDARY_BLUE})`,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.PRIMARY_BLUE,
          '& .MuiTableCell-head': {
            color: COLORS.WHITE,
            fontWeight: 'bold',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: COLORS.LIGHT_GRAY,
          },
          '&:hover': {
            backgroundColor: COLORS.LIGHT_BLUE,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: COLORS.SECONDARY_BLUE,
            },
            '&.Mui-focused fieldset': {
              borderColor: COLORS.SECONDARY_BLUE,
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: COLORS.PRIMARY_BLUE,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '&.MuiChip-colorSuccess': {
            backgroundColor: COLORS.LIGHT_BLUE,
            color: COLORS.PRIMARY_BLUE,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: 12,
        },
        standardError: {
          backgroundColor: '#FEE2E2',
          color: COLORS.ERROR_DARK,
          borderLeft: `4px solid ${COLORS.ERROR}`,
        },
        standardSuccess: {
          backgroundColor: COLORS.LIGHT_BLUE,
          color: COLORS.PRIMARY_BLUE,
          borderLeft: `4px solid ${COLORS.SECONDARY_BLUE}`,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: COLORS.LIGHT_BLUE,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: COLORS.SECONDARY_BLUE,
          fontWeight: 'medium',
          textDecoration: 'none',
          '&:hover': {
            color: COLORS.PRIMARY_BLUE,
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.LIGHT_BLUE,
          color: COLORS.PRIMARY_BLUE,
        },
      },
    },
  },
});

export default theme;
