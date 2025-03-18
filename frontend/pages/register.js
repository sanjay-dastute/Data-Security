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
  Divider
} from '@mui/material';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    orgName: '',
  });
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

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate a successful registration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success message and redirect to login
      alert('Registration successful! Please wait for admin approval before logging in.');
      router.push('/login');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
        bgcolor: 'background.default'
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
              background: 'linear-gradient(to right, #1E3A8A, #3B82F6)'
            }
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              color: 'primary.dark',
              mb: 1
            }}
          >
            QuantumTrust Data Security
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3, 
              color: 'text.secondary' 
            }}
          >
            Create a new account
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%', 
                mb: 3,
                borderLeft: '4px solid #EF4444',
                '& .MuiAlert-icon': {
                  color: '#991B1B'
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
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'primary.dark',
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'primary.dark',
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
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'primary.dark',
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'primary.dark',
                },
              }}
            />

            <TextField
              margin="normal"
              fullWidth
              name="orgName"
              label="Organization Name (Optional)"
              id="orgName"
              value={formData.orgName}
              onChange={handleChange}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'primary.dark',
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2,
                mb: 3,
                py: 1.5,
                background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
                color: '#FFFFFF',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(to right, #1E3A8A, #4B92FF)',
                  transform: 'scale(1.02)',
                  transition: 'transform 0.2s'
                },
                '&.Mui-disabled': {
                  opacity: 0.7
                }
              }}
            >
              {loading ? 'Processing...' : 'Register'}
            </Button>

            <Divider sx={{ mb: 2, borderColor: 'primary.light' }} />

            <Box sx={{ textAlign: 'center' }}>
              <Link href="/login" passHref>
                <MuiLink 
                  variant="body2" 
                  sx={{ 
                    color: 'primary.main',
                    fontWeight: 'medium',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'primary.dark',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Already have an account? Sign in
                </MuiLink>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
