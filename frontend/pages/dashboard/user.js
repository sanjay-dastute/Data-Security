import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Container, Paper, Grid, Card, CardContent, CardHeader } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export default function UserDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Check if user is authenticated as regular user
    if (!loading && (!user || user.role !== 'ORG_USER')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{
          fontWeight: 'bold',
          background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2
        }}
      >
        User Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={9}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
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
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: '#1E3A8A' }}>
              Welcome Back
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography>Welcome to your QuantumTrust Data Security Dashboard</Typography>
              <Typography>You can encrypt data, manage your keys, and view your activity.</Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
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
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: '#1E3A8A' }}>
              Your Stats
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography>Active Keys: 3</Typography>
              <Typography>Files Encrypted: 15</Typography>
              <Typography>Storage Used: 0.8 GB</Typography>
              <Typography>Last Activity: Today</Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 2,
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
          }}>
            <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#1E3A8A' }}>
              Recent Activity
            </Typography>
            <Box>
              <Typography>You encrypted customer_data.json</Typography>
              <Typography>You generated a new encryption key</Typography>
              <Typography>You updated your profile information</Typography>
              <Typography>You accessed the file manager</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
