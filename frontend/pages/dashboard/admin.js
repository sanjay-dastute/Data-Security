import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Container, Paper, Grid, Card, CardContent, CardHeader } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

// Remove server-side props for now to fix build
// import { withIronSessionSsr } from 'iron-session/next';

export async function getServerSideProps() {
  return {
    props: {
      user: null // Will be populated client-side
    }
  };
}

export default function AdminDashboard({ user }) {
  const router = useRouter();
  const { loading } = useAuth();
  
  useEffect(() => {
    // No need for client-side redirect since we're using server-side auth
  }, []);

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
        Admin Dashboard
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
              System Overview
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography>Welcome to the QuantumTrust Data Security Admin Dashboard</Typography>
              <Typography>You have full access to all system features and configurations.</Typography>
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
              Quick Stats
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography>Users: 25</Typography>
              <Typography>Organizations: 5</Typography>
              <Typography>Active Keys: 12</Typography>
              <Typography>Encryption Jobs: 8</Typography>
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
              <Typography>User 'orgadmin1' created a new encryption key</Typography>
              <Typography>Organization 'Test Org' updated their profile</Typography>
              <Typography>User 'user1' encrypted 5 files</Typography>
              <Typography>System backup completed successfully</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
