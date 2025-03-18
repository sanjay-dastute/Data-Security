import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Link as MuiLink,
  CircularProgress,
  Divider,
  useTheme
} from '@mui/material';

export default function Login() {
  const router = useRouter();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    mfaCode: '',
  });
  const [showMfa, setShowMfa] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate a successful login
      if (!showMfa) {
        // First step: validate username/password
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Check if MFA is required
        if (formData.username === 'admin') {
          setShowMfa(true);
          setLoading(false);
          return;
        }
      } else {
        // Second step: validate MFA code
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Validate MFA code
        if (formData.mfaCode !== '123456') {
          throw new Error('Invalid MFA code');
        }
      }

      // Determine redirect based on role
      let redirectPath = '/user/dashboard';
      if (formData.username === 'admin') {
        redirectPath = '/admin/dashboard';
      } else if (formData.username.includes('org-admin')) {
        redirectPath = '/org-admin/dashboard';
      }

      // Redirect to appropriate dashboard
      router.push(redirectPath);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: '10px',
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
              background: `linear-gradient(to right, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`
            }
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              color: theme.palette.secondary.main,
              mb: 1
            }}
          >
            QuantumTrust Data Security
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3, 
              color: theme.palette.text.secondary 
            }}
          >
            Sign in to your account
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%', 
                mb: 3,
                borderLeft: `4px solid ${theme.palette.error.main}`,
                '& .MuiAlert-icon': {
                  color: theme.palette.error.dark
                }
              }}
            >
              {error}
            </Alert>
          )}

          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              width: '100%',
              mt: 1
            }}
          >
            {!showMfa ? (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username or Email"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={formData.username}
                  onChange={handleChange}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                       borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 2,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: theme.palette.secondary.main,
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                       borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 2,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: theme.palette.secondary.main,
                    },
                  }}
                />
              </>
            ) : (
              <TextField
                margin="normal"
                required
                fullWidth
                name="mfaCode"
                label="MFA Code"
                type="text"
                id="mfaCode"
                placeholder="Enter 6-digit code"
                value={formData.mfaCode}
                onChange={handleChange}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme.palette.secondary.main,
                  },
                }}
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              aria-label={showMfa ? "Verify MFA code" : "Sign in"}
              sx={{
                mt: 2,
                mb: 3,
                py: 1.5,
                background: `linear-gradient(to right, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                color: theme.palette.common.white,
                fontWeight: 'bold',
                '&:hover': {
                  background: `linear-gradient(to right, ${theme.palette.secondary.main}, ${theme.palette.primary.light})`,
                  transform: 'scale(1.02)',
                  transition: 'transform 0.2s'
                },
                '&.Mui-disabled': {
                  opacity: 0.7
                }
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Loading...
                </Box>
              ) : (
                showMfa ? 'Verify' : 'Sign in'
              )}
            </Button>
          </Box>

          <Divider sx={{ width: '100%', mb: 2, borderColor: theme.palette.primary.light }} />

          <Box sx={{ textAlign: 'center' }}>
            <Link href="/register" passHref legacyBehavior>
              <MuiLink 
                variant="body2" 
                sx={{ 
                  color: theme.palette.primary.main,
                  fontWeight: 'medium',
                  textDecoration: 'none',
                  '&:hover': {
                    color: theme.palette.secondary.main,
                    textDecoration: 'underline'
                  }
                }}
              >
                Don't have an account? Register
              </MuiLink>
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
