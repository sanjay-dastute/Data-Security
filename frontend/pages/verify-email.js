import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Avatar,
  Stack,
  CircularProgress,
  Divider
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;
  
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        // In a real implementation, this would call the backend API
        // For now, we'll simulate a successful verification
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Simulate API call
        if (token === 'invalid') {
          throw new Error('Invalid or expired token');
        }
        
        setVerificationStatus('success');
      } catch (err) {
        setVerificationStatus('error');
        setError(err.message || 'Verification failed. Please try again.');
      }
    };

    verifyEmail();
  }, [token]);

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
            Email Verification
          </Typography>

          <Box sx={{ mt: 3, width: '100%', textAlign: 'center' }}>
            {verificationStatus === 'verifying' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress 
                  size={48} 
                  sx={{ 
                    color: 'primary.main',
                    mb: 3
                  }} 
                />
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Verifying your email address...
                </Typography>
              </Box>
            )}

            {verificationStatus === 'success' && (
              <Box sx={{ textAlign: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    mx: 'auto',
                    bgcolor: 'primary.light',
                    color: 'primary.dark',
                    mb: 2
                  }}
                >
                  <CheckIcon fontSize="large" />
                </Avatar>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'primary.dark',
                    mb: 2
                  }}
                >
                  Email Verified Successfully
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                  Your email has been verified. You can now log in to your account.
                </Typography>
                <Link href="/login" passHref legacyBehavior>
                  <Button
                    component="a"
                    variant="contained"
                    sx={{
                      mt: 2,
                      py: 1.5,
                      px: 4,
                      background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
                      color: '#FFFFFF',
                      fontWeight: 'bold',
                      '&:hover': {
                        background: 'linear-gradient(to right, #1E3A8A, #4B92FF)',
                        transform: 'scale(1.02)',
                        transition: 'transform 0.2s'
                      }
                    }}
                  >
                    Go to Login
                  </Button>
                </Link>
              </Box>
            )}

            {verificationStatus === 'error' && (
              <Box sx={{ textAlign: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    mx: 'auto',
                    bgcolor: '#FEE2E2',
                    color: '#991B1B',
                    mb: 2
                  }}
                >
                  <CloseIcon fontSize="large" />
                </Avatar>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#991B1B',
                    mb: 2
                  }}
                >
                  Verification Failed
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                  {error}
                </Typography>
                
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Link href="/login" passHref legacyBehavior>
                    <Button
                      component="a"
                      variant="contained"
                      fullWidth
                      sx={{
                        py: 1.5,
                        background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                        '&:hover': {
                          background: 'linear-gradient(to right, #1E3A8A, #4B92FF)',
                          transform: 'scale(1.02)',
                          transition: 'transform 0.2s'
                        }
                      }}
                    >
                      Go to Login
                    </Button>
                  </Link>
                  <Link href="/resend-verification" passHref legacyBehavior>
                    <Button
                      component="a"
                      variant="outlined"
                      fullWidth
                      sx={{
                        py: 1.5,
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        fontWeight: 'bold',
                        '&:hover': {
                          borderColor: 'primary.dark',
                          backgroundColor: 'primary.light',
                          opacity: 0.1,
                          color: 'primary.dark',
                          transform: 'scale(1.02)',
                          transition: 'transform 0.2s'
                        }
                      }}
                    >
                      Resend Verification Email
                    </Button>
                  </Link>
                </Stack>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
