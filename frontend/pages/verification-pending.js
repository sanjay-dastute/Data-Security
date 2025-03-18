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
  Divider
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';

export default function VerificationPending() {
  const router = useRouter();
  const { email } = router.query;

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
            Verification Pending
          </Typography>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
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
              <EmailIcon fontSize="large" />
            </Avatar>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600, 
                color: 'primary.dark',
                mb: 2
              }}
            >
              Check Your Email
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              We've sent a verification email to <strong>{email}</strong>. Please check your inbox and follow the instructions to verify your account.
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                mb: 4
              }}
            >
              After verifying your email, your account will need to be approved by an administrator before you can log in.
            </Typography>
            
            <Stack spacing={2} sx={{ mt: 4 }}>
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
        </Paper>
      </Container>
    </Box>
  );
}
