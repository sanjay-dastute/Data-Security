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
  Avatar,
  Divider,
  useTheme
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

export default function ForgotPassword() {
  const router = useRouter();
  const theme = useTheme();
  
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setStatus('loading');
    setError('');

    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate a successful request
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Failed to send password reset email. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: theme.palette.background.default
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
            Reset Your Password
          </Typography>

          {status === 'success' ? (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Avatar 
                sx={{ 
                  width: 64, 
                  height: 64, 
                  mx: 'auto',
                  bgcolor: theme.palette.primary.light,
                  color: theme.palette.secondary.main,
                  mb: 2
                }}
              >
                <CheckIcon fontSize="large" />
              </Avatar>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  color: theme.palette.secondary.main,
                  mb: 2
                }}
              >
                Check Your Email
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                If an account exists for <strong>{email}</strong>, we've sent password reset instructions to that email address.
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  mb: 4
                }}
              >
                If you don't see the email, please check your spam folder.
              </Typography>
              <Button
                component={Link}
                href="/login"
                variant="contained"
                sx={{
                  mt: 2,
                  py: 1.5,
                  px: 4,
                  background: `linear-gradient(to right, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                  color: theme.palette.common.white,
                  fontWeight: 'bold',
                  '&:hover': {
                    background: `linear-gradient(to right, ${theme.palette.secondary.main}, ${theme.palette.primary.light})`,
                    transform: 'scale(1.02)',
                    transition: 'transform 0.2s'
                  }
                }}
              >
                Back to Login
              </Button>
            </Box>
          ) : (
            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              sx={{ 
                width: '100%',
                mt: 1
              }}
            >
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

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={status === 'loading'}
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
                {status === 'loading' ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    Sending...
                  </Box>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </Box>
          )}

          <Divider sx={{ width: '100%', mb: 2, borderColor: theme.palette.primary.light }} />

          <Box sx={{ textAlign: 'center' }}>
            <Link href="/login" passHref legacyBehavior>
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
                Back to Login
              </MuiLink>
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
