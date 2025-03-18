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
  Divider,
  useTheme
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';

export default function VerificationPending() {
  const router = useRouter();
  const theme = useTheme();
  const { email } = router.query;

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
            Verification Pending
          </Typography>

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
              <EmailIcon fontSize="large" />
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
              We've sent a verification email to <strong>{email}</strong>. Please check your inbox and follow the instructions to verify your account.
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary,
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
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    fontWeight: 'bold',
                    '&:hover': {
                      borderColor: theme.palette.secondary.main,
                      backgroundColor: `${theme.palette.primary.light}1A`, // 10% opacity
                      color: theme.palette.secondary.main,
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
