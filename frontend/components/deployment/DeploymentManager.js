import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Settings as SettingsIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';

const DeploymentManager = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deployments, setDeployments] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    provider: '',
    replicas: 3,
    cpuLimit: 1,
    memoryLimit: 2,
    isDefault: false,
  });
  const [awsCredentials, setAwsCredentials] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    region: '',
    eksClusterName: '',
    ecrRepositoryUri: '',
  });
  const [azureCredentials, setAzureCredentials] = useState({
    subscriptionId: '',
    tenantId: '',
    clientId: '',
    clientSecret: '',
    resourceGroup: '',
    aksClusterName: '',
    acrName: '',
  });
  const [gcpCredentials, setGcpCredentials] = useState({
    projectId: '',
    serviceAccountKey: '',
    region: '',
    zone: '',
    gkeClusterName: '',
  });
  const [onPremisesCredentials, setOnPremisesCredentials] = useState({
    apiServerUrl: '',
    apiToken: '',
    namespace: 'quantumtrust',
    registryUrl: '',
    registryUsername: '',
    registryPassword: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [deploymentLogs, setDeploymentLogs] = useState('');

  useEffect(() => {
    fetchDeployments();
  }, []);

  const fetchDeployments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/deployment/config');
      setDeployments(response.data);
    } catch (error) {
      console.error('Failed to fetch deployments:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch deployment configurations',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    if (name === 'provider') {
      setSelectedProvider(value);
    }
  };

  const handleCredentialsChange = (provider, e) => {
    const { name, value } = e.target;
    
    switch (provider) {
      case 'aws':
        setAwsCredentials({
          ...awsCredentials,
          [name]: value,
        });
        break;
      case 'azure':
        setAzureCredentials({
          ...azureCredentials,
          [name]: value,
        });
        break;
      case 'gcp':
        setGcpCredentials({
          ...gcpCredentials,
          [name]: value,
        });
        break;
      case 'on-premises':
        setOnPremisesCredentials({
          ...onPremisesCredentials,
          [name]: value,
        });
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
      };

      // Add provider-specific credentials
      switch (formData.provider) {
        case 'aws':
          payload.awsCredentials = awsCredentials;
          break;
        case 'azure':
          payload.azureCredentials = azureCredentials;
          break;
        case 'gcp':
          payload.gcpCredentials = gcpCredentials;
          break;
        case 'on-premises':
          payload.onPremisesCredentials = onPremisesCredentials;
          break;
        default:
          break;
      }

      const response = await axios.post('/api/deployment/config', payload);
      
      setSnackbar({
        open: true,
        message: 'Deployment configuration saved successfully',
        severity: 'success',
      });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        provider: '',
        replicas: 3,
        cpuLimit: 1,
        memoryLimit: 2,
        isDefault: false,
      });
      setAwsCredentials({
        accessKeyId: '',
        secretAccessKey: '',
        region: '',
        eksClusterName: '',
        ecrRepositoryUri: '',
      });
      setAzureCredentials({
        subscriptionId: '',
        tenantId: '',
        clientId: '',
        clientSecret: '',
        resourceGroup: '',
        aksClusterName: '',
        acrName: '',
      });
      setGcpCredentials({
        projectId: '',
        serviceAccountKey: '',
        region: '',
        zone: '',
        gkeClusterName: '',
      });
      setOnPremisesCredentials({
        apiServerUrl: '',
        apiToken: '',
        namespace: 'quantumtrust',
        registryUrl: '',
        registryUsername: '',
        registryPassword: '',
      });
      
      // Refresh deployments list
      fetchDeployments();
    } catch (error) {
      console.error('Failed to save deployment configuration:', error);
      setSnackbar({
        open: true,
        message: `Failed to save deployment configuration: ${error.response?.data?.message || error.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (id) => {
    setLoading(true);
    try {
      const response = await axios.post(`/api/deployment/config/${id}/test`);
      
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: response.data.success ? 'success' : 'error',
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      setSnackbar({
        open: true,
        message: `Connection test failed: ${error.response?.data?.message || error.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async (id) => {
    setLoading(true);
    try {
      const response = await axios.post(`/api/deployment/config/${id}/deploy`);
      
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: response.data.success ? 'success' : 'error',
      });
      
      if (response.data.success && response.data.jobId) {
        // Poll deployment status
        pollDeploymentStatus(response.data.jobId);
      }
    } catch (error) {
      console.error('Deployment failed:', error);
      setSnackbar({
        open: true,
        message: `Deployment failed: ${error.response?.data?.message || error.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const pollDeploymentStatus = async (jobId) => {
    try {
      const response = await axios.get(`/api/deployment/status/${jobId}`);
      setDeploymentStatus(response.data);
      
      // If deployment is still in progress, poll again after 5 seconds
      if (response.data.status === 'pending' || response.data.status === 'in_progress') {
        setTimeout(() => pollDeploymentStatus(jobId), 5000);
      } else {
        // Fetch deployment logs
        fetchDeploymentLogs(jobId);
      }
    } catch (error) {
      console.error('Failed to fetch deployment status:', error);
    }
  };

  const fetchDeploymentLogs = async (jobId) => {
    try {
      const response = await axios.get(`/api/deployment/status/${jobId}/logs`);
      setDeploymentLogs(response.data.logs);
    } catch (error) {
      console.error('Failed to fetch deployment logs:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const renderCredentialsForm = () => {
    switch (selectedProvider) {
      case 'aws':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">AWS Credentials</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Access Key ID"
                  name="accessKeyId"
                  value={awsCredentials.accessKeyId}
                  onChange={(e) => handleCredentialsChange('aws', e)}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Secret Access Key"
                  name="secretAccessKey"
                  value={awsCredentials.secretAccessKey}
                  onChange={(e) => handleCredentialsChange('aws', e)}
                  margin="normal"
                  type="password"
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Region"
                  name="region"
                  value={awsCredentials.region}
                  onChange={(e) => handleCredentialsChange('aws', e)}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="EKS Cluster Name"
                  name="eksClusterName"
                  value={awsCredentials.eksClusterName}
                  onChange={(e) => handleCredentialsChange('aws', e)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="ECR Repository URI"
                  name="ecrRepositoryUri"
                  value={awsCredentials.ecrRepositoryUri}
                  onChange={(e) => handleCredentialsChange('aws', e)}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 'azure':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Azure Credentials</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Subscription ID"
                  name="subscriptionId"
                  value={azureCredentials.subscriptionId}
                  onChange={(e) => handleCredentialsChange('azure', e)}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tenant ID"
                  name="tenantId"
                  value={azureCredentials.tenantId}
                  onChange={(e) => handleCredentialsChange('azure', e)}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Client ID"
                  name="clientId"
                  value={azureCredentials.clientId}
                  onChange={(e) => handleCredentialsChange('azure', e)}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Client Secret"
                  name="clientSecret"
                  value={azureCredentials.clientSecret}
                  onChange={(e) => handleCredentialsChange('azure', e)}
                  margin="normal"
                  type="password"
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Resource Group"
                  name="resourceGroup"
                  value={azureCredentials.resourceGroup}
                  onChange={(e) => handleCredentialsChange('azure', e)}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="AKS Cluster Name"
                  name="aksClusterName"
                  value={azureCredentials.aksClusterName}
                  onChange={(e) => handleCredentialsChange('azure', e)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="ACR Name"
                  name="acrName"
                  value={azureCredentials.acrName}
                  onChange={(e) => handleCredentialsChange('azure', e)}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 'gcp':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">GCP Credentials</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Project ID"
                  name="projectId"
                  value={gcpCredentials.projectId}
                  onChange={(e) => handleCredentialsChange('gcp', e)}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Service Account Key (JSON)"
                  name="serviceAccountKey"
                  value={gcpCredentials.serviceAccountKey}
                  onChange={(e) => handleCredentialsChange('gcp', e)}
                  margin="normal"
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Region"
                  name="region"
                  value={gcpCredentials.region}
                  onChange={(e) => handleCredentialsChange('gcp', e)}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Zone"
                  name="zone"
                  value={gcpCredentials.zone}
                  onChange={(e) => handleCredentialsChange('gcp', e)}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="GKE Cluster Name"
                  name="gkeClusterName"
                  value={gcpCredentials.gkeClusterName}
                  onChange={(e) => handleCredentialsChange('gcp', e)}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 'on-premises':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">On-Premises Credentials</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Kubernetes API Server URL"
                  name="apiServerUrl"
                  value={onPremisesCredentials.apiServerUrl}
                  onChange={(e) => handleCredentialsChange('on-premises', e)}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Kubernetes API Token"
                  name="apiToken"
                  value={onPremisesCredentials.apiToken}
                  onChange={(e) => handleCredentialsChange('on-premises', e)}
                  margin="normal"
                  type="password"
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Namespace"
                  name="namespace"
                  value={onPremisesCredentials.namespace}
                  onChange={(e) => handleCredentialsChange('on-premises', e)}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Container Registry URL"
                  name="registryUrl"
                  value={onPremisesCredentials.registryUrl}
                  onChange={(e) => handleCredentialsChange('on-premises', e)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Registry Username"
                  name="registryUsername"
                  value={onPremisesCredentials.registryUsername}
                  onChange={(e) => handleCredentialsChange('on-premises', e)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Registry Password"
                  name="registryPassword"
                  value={onPremisesCredentials.registryPassword}
                  onChange={(e) => handleCredentialsChange('on-premises', e)}
                  margin="normal"
                  type="password"
                />
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  const renderDeploymentStatus = () => {
    if (!deploymentStatus) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">Deployment Status</Typography>
        <Paper sx={{ p: 2, mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Job ID: {deploymentStatus.jobId}</Typography>
              <Typography variant="subtitle1">
                Status: {deploymentStatus.status.toUpperCase()}
              </Typography>
              <Typography variant="subtitle1">
                Start Time: {new Date(deploymentStatus.startTime).toLocaleString()}
              </Typography>
              {deploymentStatus.endTime && (
                <Typography variant="subtitle1">
                  End Time: {new Date(deploymentStatus.endTime).toLocaleString()}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Message: {deploymentStatus.message}</Typography>
              {deploymentStatus.success !== undefined && (
                <Typography variant="subtitle1">
                  Success: {deploymentStatus.success ? 'Yes' : 'No'}
                </Typography>
              )}
            </Grid>
          </Grid>
          {deploymentLogs && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Deployment Logs:</Typography>
              <Paper
                sx={{
                  p: 2,
                  mt: 1,
                  maxHeight: '200px',
                  overflow: 'auto',
                  backgroundColor: '#f5f5f5',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {deploymentLogs}
              </Paper>
            </Box>
          )}
        </Paper>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Deployment Manager
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Configurations" />
        <Tab label="New Configuration" />
        <Tab label="Deployment Status" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Deployment Configurations
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : deployments.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                No deployment configurations found. Create a new one to get started.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setActiveTab(1)}
                sx={{ mt: 2 }}
              >
                Create Configuration
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {deployments.map((deployment) => (
                <Grid item xs={12} md={6} key={deployment.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {deployment.name}
                        {deployment.is_default && (
                          <Box
                            component="span"
                            sx={{
                              ml: 1,
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              backgroundColor: 'primary.main',
                              color: 'white',
                              fontSize: '0.75rem',
                            }}
                          >
                            Default
                          </Box>
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {deployment.description || 'No description'}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Provider:</strong> {deployment.provider}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Replicas:</strong> {deployment.replicas}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>CPU Limit:</strong> {deployment.cpu_limit} cores
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Memory Limit:</strong> {deployment.memory_limit} GB
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2">
                            <strong>Last Deployed:</strong>{' '}
                            {deployment.last_deployed_at
                              ? new Date(deployment.last_deployed_at).toLocaleString()
                              : 'Never'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2">
                            <strong>Status:</strong>{' '}
                            {deployment.last_deployment_status || 'Not deployed'}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleTestConnection(deployment.id)}
                          startIcon={<RefreshIcon />}
                        >
                          Test Connection
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleDeploy(deployment.id)}
                          startIcon={<CloudUploadIcon />}
                        >
                          Deploy
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h5" gutterBottom>
            New Deployment Configuration
          </Typography>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Configuration Name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Cloud Provider</InputLabel>
                  <Select
                    name="provider"
                    value={formData.provider}
                    onChange={handleFormChange}
                    label="Cloud Provider"
                  >
                    <MenuItem value="aws">AWS</MenuItem>
                    <MenuItem value="azure">Azure</MenuItem>
                    <MenuItem value="gcp">Google Cloud Platform</MenuItem>
                    <MenuItem value="on-premises">On-Premises</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Replicas"
                  name="replicas"
                  type="number"
                  value={formData.replicas}
                  onChange={handleFormChange}
                  margin="normal"
                  inputProps={{ min: 1, max: 10 }}
                />
                <FormHelperText>Number of pod replicas (1-10)</FormHelperText>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="CPU Limit"
                  name="cpuLimit"
                  type="number"
                  value={formData.cpuLimit}
                  onChange={handleFormChange}
                  margin="normal"
                  inputProps={{ min: 0.1, max: 4, step: 0.1 }}
                />
                <FormHelperText>CPU cores per pod (0.1-4)</FormHelperText>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Memory Limit"
                  name="memoryLimit"
                  type="number"
                  value={formData.memoryLimit}
                  onChange={handleFormChange}
                  margin="normal"
                  inputProps={{ min: 0.5, max: 8, step: 0.5 }}
                />
                <FormHelperText>Memory in GB per pod (0.5-8)</FormHelperText>
              </Grid>
            </Grid>

            {renderCredentialsForm()}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SettingsIcon />}
              >
                Save Configuration
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Deployment Status
          </Typography>
          {renderDeploymentStatus()}
          {!deploymentStatus && (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                No active deployment. Start a deployment from the Configurations tab.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setActiveTab(0)}
                sx={{ mt: 2 }}
              >
                View Configurations
              </Button>
            </Paper>
          )}
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DeploymentManager;
