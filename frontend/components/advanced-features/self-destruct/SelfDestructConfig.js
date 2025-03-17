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
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Security as SecurityIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const SelfDestructConfig = () => {
  // State for configuration
  const [activeTab, setActiveTab] = useState(0);
  const [config, setConfig] = useState({
    enabled: true,
    platform: 'windows',
    triggerCondition: 'NOT DEFINED("%APPROVED_SYSTEM%")',
    filePattern: '"%FILE_PATH%"',
    logEndpoint: '/api/self-destruct/log-breach',
    embedInMetadata: true,
    notifyAdmin: true
  });
  
  // State for script preview
  const [scriptPreview, setScriptPreview] = useState('');
  
  // State for loading and error handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // State for breach logs
  const [breachLogs, setBreachLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  
  // Fetch script preview when config changes
  useEffect(() => {
    generateScriptPreview();
  }, [config]);
  
  // Fetch breach logs on component mount
  useEffect(() => {
    fetchBreachLogs();
  }, []);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle config change
  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Generate script preview
  const generateScriptPreview = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/self-destruct/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: config.platform,
          triggerCondition: config.triggerCondition,
          filePattern: config.filePattern,
          logEndpoint: config.logEndpoint,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate script preview');
      }
      
      const data = await response.json();
      setScriptPreview(data.script);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  
  // Save configuration
  const saveConfiguration = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/self-destruct/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }
      
      setSuccess('Self-destruct configuration saved successfully');
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
  
  // Fetch breach logs
  const fetchBreachLogs = async () => {
    try {
      setLogsLoading(true);
      
      const response = await fetch('/api/self-destruct/logs');
      
      if (!response.ok) {
        throw new Error('Failed to fetch breach logs');
      }
      
      const data = await response.json();
      setBreachLogs(data.logs);
      setLogsLoading(false);
    } catch (error) {
      setError(error.message);
      setLogsLoading(false);
    }
  };
  
  // Test self-destruct script
  const testSelfDestruct = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/self-destruct/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: config.platform,
          triggerCondition: config.triggerCondition,
          filePattern: config.filePattern,
          logEndpoint: config.logEndpoint,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to test self-destruct script');
      }
      
      const data = await response.json();
      setSuccess('Self-destruct test completed successfully. Check logs for details.');
      setLoading(false);
      
      // Refresh breach logs
      fetchBreachLogs();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Self-Destruct Configuration
      </Typography>
      <Typography variant="body1" paragraph>
        Configure self-destruct scripts that will be embedded in encrypted files to delete data on unauthorized systems.
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Configuration" icon={<SettingsIcon />} iconPosition="start" />
        <Tab label="Script Preview" icon={<CodeIcon />} iconPosition="start" />
        <Tab label="Breach Logs" icon={<WarningIcon />} iconPosition="start" />
      </Tabs>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {activeTab === 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Self-Destruct Settings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.enabled}
                        onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Enable Self-Destruct Scripts"
                  />
                </Grid>
                
                {config.enabled && (
                  <>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Target Platform</InputLabel>
                        <Select
                          value={config.platform}
                          onChange={(e) => handleConfigChange('platform', e.target.value)}
                          label="Target Platform"
                        >
                          <MenuItem value="windows">Windows</MenuItem>
                          <MenuItem value="linux">Linux</MenuItem>
                          <MenuItem value="macos">macOS</MenuItem>
                          <MenuItem value="javascript">JavaScript (Cross-Platform)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Trigger Condition"
                        value={config.triggerCondition}
                        onChange={(e) => handleConfigChange('triggerCondition', e.target.value)}
                        margin="normal"
                        helperText={
                          <>
                            Condition that triggers self-destruct. Use %APPROVED_SYSTEM% for environment variable check.
                            <Tooltip title="Examples: NOT DEFINED('%APPROVED_SYSTEM%'), %IP% NOT IN ('192.168.1.1', '10.0.0.1')">
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        }
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="File Pattern"
                        value={config.filePattern}
                        onChange={(e) => handleConfigChange('filePattern', e.target.value)}
                        margin="normal"
                        helperText={
                          <>
                            Pattern of files to delete. Use %FILE_PATH% for the current file.
                            <Tooltip title="Examples: '%FILE_PATH%', '*.encrypted', '/path/to/data/*.csv'">
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        }
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Log Endpoint"
                        value={config.logEndpoint}
                        onChange={(e) => handleConfigChange('logEndpoint', e.target.value)}
                        margin="normal"
                        helperText="Endpoint to log breach attempts. Leave empty to disable logging."
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={config.embedInMetadata}
                            onChange={(e) => handleConfigChange('embedInMetadata', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Embed in File Metadata"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={config.notifyAdmin}
                            onChange={(e) => handleConfigChange('notifyAdmin', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Notify Admins on Breach"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={saveConfiguration}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Configuration'}
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={testSelfDestruct}
                  disabled={loading || !config.enabled}
                >
                  Test Self-Destruct
                </Button>
              </Box>
            </Paper>
          )}
          
          {activeTab === 1 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Script Preview
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Platform: {config.platform}
                  </Typography>
                  
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      backgroundColor: 'grey.900',
                      color: 'grey.100',
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      overflow: 'auto',
                      maxHeight: 400,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {scriptPreview || 'No script preview available. Please configure and save settings first.'}
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      This script will be embedded in encrypted files and will execute when the file is accessed on unauthorized systems.
                    </Typography>
                  </Box>
                </>
              )}
            </Paper>
          )}
          
          {activeTab === 2 && (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Breach Logs
                </Typography>
                
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={fetchBreachLogs}
                  disabled={logsLoading}
                >
                  Refresh
                </Button>
              </Box>
              
              {logsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : breachLogs.length === 0 ? (
                <Alert severity="info">No breach logs found.</Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>IP Address</TableCell>
                        <TableCell>MAC Address</TableCell>
                        <TableCell>Platform</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {breachLogs.map((log, index) => (
                        <TableRow key={index}>
                          <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                          <TableCell>{log.ip}</TableCell>
                          <TableCell>{log.mac}</TableCell>
                          <TableCell>{log.platform}</TableCell>
                          <TableCell>
                            <Chip
                              label={log.status}
                              color={log.status === 'deleted' ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          )}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Self-Destruct Feature
              </Typography>
              
              <Typography variant="body2" paragraph>
                The self-destruct feature embeds a script in encrypted files that deletes the data on unauthorized systems while preserving it on the server.
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                How It Works:
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Script is embedded in encrypted files" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Checks for authorized environment on access" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Deletes file locally if unauthorized" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Logs breach attempt with IP and MAC" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Server-side data remains intact" />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Supported Platforms:
              </Typography>
              
              <Grid container spacing={1}>
                <Grid item>
                  <Chip label="Windows" />
                </Grid>
                <Grid item>
                  <Chip label="Linux" />
                </Grid>
                <Grid item>
                  <Chip label="macOS" />
                </Grid>
                <Grid item>
                  <Chip label="JavaScript" />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Security Considerations:
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Only deletes data on unauthorized systems" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Unobtrusive for authorized users" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Compatible with common file types" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Logs breach attempts for auditing" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SelfDestructConfig;
