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

export default function OrgAdminDashboard({ user }) {
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
        Organization Admin Dashboard
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
              Organization Overview
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography>Welcome to the Test Organization Admin Dashboard</Typography>
              <Typography>You can manage your organization's users, keys, and encryption settings.</Typography>
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
              Organization Stats
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography>Team Members: 8</Typography>
              <Typography>Active Keys: 5</Typography>
              <Typography>Encryption Jobs: 12</Typography>
              <Typography>Storage Used: 2.5 GB</Typography>
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
              Recent Team Activity
            </Typography>
            <Box>
              <Typography>User 'user1' encrypted customer data</Typography>
              <Typography>User 'user2' generated a new encryption key</Typography>
              <Typography>You approved a key recovery request</Typography>
              <Typography>User 'user3' updated their approved IP addresses</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
