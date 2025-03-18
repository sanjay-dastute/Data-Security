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
  Link as MuiLink
} from '@mui/material';

export default function Login() {
  const router = useRouter();
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
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
            QuantumTrust Data Security
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Sign in to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
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
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Loading...' : showMfa ? 'Verify' : 'Sign in'}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link href="/register" passHref>
              <MuiLink variant="body2" sx={{ color: 'primary.main' }}>
                Don't have an account? Register
              </MuiLink>
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
