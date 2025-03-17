import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import DeploymentManager from '../../components/deployment/DeploymentManager';
import AdminDashboard from '../../components/dashboard/admin/AdminDashboard';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/user';

const DeploymentPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect if not admin
  React.useEffect(() => {
    if (!loading && (!user || user.role !== UserRole.ADMIN)) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!user || user.role !== UserRole.ADMIN) {
    return null; // Will redirect in useEffect
  }

  return (
    <AdminDashboard>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Deployment Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Configure and manage deployments across multiple cloud providers and on-premises environments.
        </Typography>
        <DeploymentManager />
      </Container>
    </AdminDashboard>
  );
};

export default DeploymentPage;
