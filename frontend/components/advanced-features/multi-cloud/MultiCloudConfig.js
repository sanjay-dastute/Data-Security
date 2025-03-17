import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Cloud as CloudIcon,
  Settings as SettingsIcon,
  Storage as StorageIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const MultiCloudConfig = () => {
  // State for configuration
  const [activeTab, setActiveTab] = useState(0);
  const [config, setConfig] = useState({
    providers: [],
    syncKeys: true,
    autoFailover: true,
    primaryProvider: 'AWS'
  });
  
  // State for available providers
  const [availableProviders, setAvailableProviders] = useState([]);
  
  // State for cloud status
  const [cloudStatus, setCloudStatus] = useState({
    statuses: [],
    syncStatus: 'inactive',
    failoverStatus: 'disabled',
    primaryProvider: 'AWS'
  });
  
  // State for loading and error handling
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // State for test connection
  const [testProvider, setTestProvider] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  
  // State for deployment
  const [deployProvider, setDeployProvider] = useState(null);
  const [deployLoading, setDeployLoading] = useState(false);
  const [deployResult, setDeployResult] = useState(null);
  
  // Fetch configuration and available providers on component mount
  useEffect(() => {
    fetchCloudConfig();
    fetchAvailableProviders();
  }, []);
  
  // Fetch cloud status when active tab is 1
  useEffect(() => {
    if (activeTab === 1) {
      fetchCloudStatus();
    }
  }, [activeTab]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Fetch cloud configuration
  const fetchCloudConfig = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/multi-cloud/config');
      
      if (!response.ok) {
        throw new Error('Failed to fetch cloud configuration');
      }
      
      const data = await response.json();
      setConfig(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  
  // Fetch available providers
  const fetchAvailableProviders = async () => {
    try {
      const response = await fetch('/api/multi-cloud/providers');
      
      if (!response.ok) {
        throw new Error('Failed to fetch available providers');
      }
      
      const data = await response.json();
      setAvailableProviders(data.providers);
    } catch (error) {
      setError(error.message);
    }
  };
  
  // Fetch cloud status
  const fetchCloudStatus = async () => {
    try {
      setStatusLoading(true);
      
      const response = await fetch('/api/multi-cloud/status');
      
      if (!response.ok) {
        throw new Error('Failed to fetch cloud status');
      }
      
      const data = await response.json();
      setCloudStatus(data);
      setStatusLoading(false);
    } catch (error) {
      setError(error.message);
      setStatusLoading(false);
    }
  };
  
  // Handle provider change
  const handleProviderChange = (index, field, value) => {
    setConfig(prev => {
      const newProviders = [...prev.providers];
      newProviders[index] = {
        ...newProviders[index],
        [field]: value
      };
      return {
        ...prev,
        providers: newProviders
      };
    });
  };
  
  // Handle config change
  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Save configuration
  const saveConfiguration = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/multi-cloud/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save cloud configuration');
      }
      
      setSuccess('Cloud configuration saved successfully');
      setLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  
  // Test connection
  const testConnection = async (provider) => {
    try {
      setTestProvider(provider);
      setTestLoading(true);
      setTestResult(null);
      
      const providerConfig = config.providers.find(p => p.type === provider.type);
      
      const response = await fetch('/api/multi-cloud/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: provider.type,
          region: providerConfig.region,
          accessKey: providerConfig.accessKey,
          secretKey: providerConfig.secretKey,
          tenantId: providerConfig.tenantId,
          clientId: providerConfig.clientId,
          clientSecret: providerConfig.clientSecret,
          projectId: providerConfig.projectId,
          serviceAccountKey: providerConfig.serviceAccountKey,
          endpoint: providerConfig.endpoint,
          username: providerConfig.username,
          password: providerConfig.password,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to test connection');
      }
      
      const data = await response.json();
      setTestResult(data);
      setTestLoading(false);
    } catch (error) {
      setError(error.message);
      setTestLoading(false);
    }
  };
  
  // Deploy to cloud
  const deployToCloud = async (provider) => {
    try {
      setDeployProvider(provider);
      setDeployLoading(true);
      setDeployResult(null);
      
      const response = await fetch(`/api/multi-cloud/deploy/${provider.type}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to deploy to ${provider.name}`);
      }
      
      const data = await response.json();
      setDeployResult(data);
      setDeployLoading(false);
      
      // Refresh cloud status
      fetchCloudStatus();
    } catch (error) {
      setError(error.message);
      setDeployLoading(false);
    }
  };
  
  // Render provider configuration
  const renderProviderConfig = (provider, index) => {
    const availableProvider = availableProviders.find(p => p.type === provider.type);
    
    return (
      <Paper key={provider.type} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {provider.name}
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={provider.enabled}
                onChange={(e) => handleProviderChange(index, 'enabled', e.target.checked)}
                color="primary"
              />
            }
            label="Enabled"
          />
        </Box>
        
        {provider.enabled && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Region</InputLabel>
                <Select
                  value={provider.region}
                  onChange={(e) => handleProviderChange(index, 'region', e.target.value)}
                  label="Region"
                >
                  {availableProvider?.regions.map(region => (
                    <MenuItem key={region} value={region}>{region}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Resource Allocation (%)"
                type="number"
                value={provider.resourceAllocation}
                onChange={(e) => handleProviderChange(index, 'resourceAllocation', parseInt(e.target.value))}
                margin="normal"
                inputProps={{ min: 1, max: 100 }}
                helperText="Percentage of resources allocated to this provider"
              />
            </Grid>
            
            {provider.type === 'AWS' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Access Key"
                    value={provider.accessKey}
                    onChange={(e) => handleProviderChange(index, 'accessKey', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Secret Key"
                    type="password"
                    value={provider.secretKey}
                    onChange={(e) => handleProviderChange(index, 'secretKey', e.target.value)}
                    margin="normal"
                  />
                </Grid>
              </>
            )}
            
            {provider.type === 'AZURE' && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Tenant ID"
                    value={provider.tenantId}
                    onChange={(e) => handleProviderChange(index, 'tenantId', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Client ID"
                    value={provider.clientId}
                    onChange={(e) => handleProviderChange(index, 'clientId', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Client Secret"
                    type="password"
                    value={provider.clientSecret}
                    onChange={(e) => handleProviderChange(index, 'clientSecret', e.target.value)}
                    margin="normal"
                  />
                </Grid>
              </>
            )}
            
            {provider.type === 'GOOGLE_CLOUD' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Project ID"
                    value={provider.projectId}
                    onChange={(e) => handleProviderChange(index, 'projectId', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Service Account Key"
                    multiline
                    rows={4}
                    value={provider.serviceAccountKey}
                    onChange={(e) => handleProviderChange(index, 'serviceAccountKey', e.target.value)}
                    margin="normal"
                    helperText="JSON key file content"
                  />
                </Grid>
              </>
            )}
            
            {provider.type === 'ON_PREMISES' && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Endpoint"
                    value={provider.endpoint}
                    onChange={(e) => handleProviderChange(index, 'endpoint', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={provider.username}
                    onChange={(e) => handleProviderChange(index, 'username', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={provider.password}
                    onChange={(e) => handleProviderChange(index, 'password', e.target.value)}
                    margin="normal"
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => testConnection(provider)}
                  disabled={testLoading}
                >
                  Test Connection
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => deployToCloud(provider)}
                  disabled={deployLoading}
                  startIcon={<CloudUploadIcon />}
                >
                  Deploy
                </Button>
              </Box>
              
              {testProvider?.type === provider.type && testLoading && (
                <Box sx={{ mt: 2 }}>
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  <Typography variant="body2" component="span">
                    Testing connection...
                  </Typography>
                </Box>
              )}
              
              {testProvider?.type === provider.type && testResult && (
                <Alert severity={testResult.success ? 'success' : 'error'} sx={{ mt: 2 }}>
                  {testResult.message}
                </Alert>
              )}
              
              {deployProvider?.type === provider.type && deployLoading && (
                <Box sx={{ mt: 2 }}>
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  <Typography variant="body2" component="span">
                    Deploying to {provider.name}...
                  </Typography>
                </Box>
              )}
              
              {deployProvider?.type === provider.type && deployResult && (
                <Alert severity={deployResult.status === 'deployed' ? 'success' : 'error'} sx={{ mt: 2 }}>
                  {deployResult.status === 'deployed' ? (
                    <>
                      Successfully deployed to {provider.name}. URL: <a href={deployResult.url} target="_blank" rel="noopener noreferrer">{deployResult.url}</a>
                    </>
                  ) : (
                    `Failed to deploy to ${provider.name}: ${deployResult.errorMessage}`
                  )}
                </Alert>
              )}
            </Grid>
          </Grid>
        )}
      </Paper>
    );
  };
  
  // Render cloud status
  const renderCloudStatus = () => {
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Cloud Status
          </Typography>
          
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchCloudStatus}
            disabled={statusLoading}
          >
            Refresh
          </Button>
        </Box>
        
        {statusLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : cloudStatus.statuses.length === 0 ? (
          <Alert severity="info">No cloud providers are enabled.</Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Key Synchronization
                  </Typography>
                  <Chip
                    label={cloudStatus.syncStatus}
                    color={cloudStatus.syncStatus === 'active' ? 'success' : 'default'}
                  />
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Failover Status
                  </Typography>
                  <Chip
                    label={cloudStatus.failoverStatus}
                    color={cloudStatus.failoverStatus === 'ready' ? 'success' : 'default'}
                  />
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Primary Provider
                  </Typography>
                  <Chip
                    label={cloudStatus.primaryProvider}
                    color="primary"
                  />
                </Paper>
              </Grid>
            </Grid>
            
            <Typography variant="h6" gutterBottom>
              Provider Status
            </Typography>
            
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Provider</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>CPU</TableCell>
                    <TableCell>Memory</TableCell>
                    <TableCell>Storage</TableCell>
                    <TableCell>Network</TableCell>
                    <TableCell>Last Checked</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cloudStatus.statuses.map((status, index) => (
                    <TableRow key={index}>
                      <TableCell>{status.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={status.status}
                          color={status.status === 'healthy' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={status.metrics.cpu}
                              color={status.metrics.cpu > 80 ? 'error' : status.metrics.cpu > 60 ? 'warning' : 'success'}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">{status.metrics.cpu}%</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={status.metrics.memory}
                              color={status.metrics.memory > 80 ? 'error' : status.metrics.memory > 60 ? 'warning' : 'success'}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">{status.metrics.memory}%</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={status.metrics.storage}
                              color={status.metrics.storage > 80 ? 'error' : status.metrics.storage > 60 ? 'warning' : 'success'}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">{status.metrics.storage}%</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={status.metrics.network}
                              color={status.metrics.network > 80 ? 'error' : status.metrics.network > 60 ? 'warning' : 'success'}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">{status.metrics.network}%</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{new Date(status.lastChecked).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Typography variant="h6" gutterBottom>
              Service Status
            </Typography>
            
            <Grid container spacing={2}>
              {cloudStatus.statuses.map((status, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {status.name}
                    </Typography>
                    
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Service</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {status.services.map((service, serviceIndex) => (
                            <TableRow key={serviceIndex}>
                              <TableCell>{service.name}</TableCell>
                              <TableCell>
                                <Chip
                                  label={service.status}
                                  color={service.status === 'healthy' ? 'success' : 'warning'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </>
    );
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Multi-Cloud Configuration
      </Typography>
      <Typography variant="body1" paragraph>
        Configure and manage cloud providers for deployment and storage.
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Configuration" icon={<SettingsIcon />} iconPosition="start" />
        <Tab label="Status" icon={<CloudIcon />} iconPosition="start" />
      </Tabs>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {activeTab === 0 ? (
            <>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Global Settings
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={config.syncKeys}
                              onChange={(e) => handleConfigChange('syncKeys', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Synchronize Keys Across Providers"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={config.autoFailover}
                              onChange={(e) => handleConfigChange('autoFailover', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Enable Automatic Failover"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth margin="normal">
                          <InputLabel>Primary Provider</InputLabel>
                          <Select
                            value={config.primaryProvider}
                            onChange={(e) => handleConfigChange('primaryProvider', e.target.value)}
                            label="Primary Provider"
                          >
                            {config.providers.filter(p => p.enabled).map(provider => (
                              <MenuItem key={provider.type} value={provider.type}>{provider.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Paper>
                  
                  {config.providers.map((provider, index) => renderProviderConfig(provider, index))}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={saveConfiguration}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Save Configuration'}
                    </Button>
                  </Box>
                </>
              )}
            </>
          ) : (
            <Paper sx={{ p: 3 }}>
              {renderCloudStatus()}
            </Paper>
          )}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Multi-Cloud Deployment
              </Typography>
              
              <Typography variant="body2" paragraph>
                Configure and manage multiple cloud providers for deployment, storage, and failover.
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Features:
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Deploy to multiple cloud providers" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Synchronize encryption keys across providers" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Automatic failover for high availability" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Monitor cloud resources and services" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Kubernetes-based deployment" />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Supported Providers:
              </Typography>
              
              <Grid container spacing={1}>
                <Grid item>
                  <Chip label="AWS" icon={<CloudIcon />} />
                </Grid>
                <Grid item>
                  <Chip label="Azure" icon={<CloudIcon />} />
                </Grid>
                <Grid item>
                  <Chip label="Google Cloud" icon={<CloudIcon />} />
                </Grid>
                <Grid item>
                  <Chip label="On-Premises" icon={<StorageIcon />} />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Resource Allocation:
              </Typography>
              
              <Typography variant="body2" paragraph>
                Allocate resources across providers to optimize cost and performance. The total allocation should not exceed 100%.
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Deployment:
              </Typography>
              
              <Typography variant="body2">
                Deployment uses Kubernetes for container orchestration, ensuring consistent environments across all providers.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MultiCloudConfig;
