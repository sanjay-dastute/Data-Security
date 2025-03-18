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
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{ 
          fontWeight: 'bold',
          color: 'primary.dark',
          mb: 1,
          position: 'relative',
          display: 'inline-block',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -4,
            left: 0,
            width: '60px',
            height: '4px',
            background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
            borderRadius: '2px'
          }
        }}
      >
        Self-Destruct Configuration
      </Typography>
      <Typography 
        variant="body1" 
        paragraph
        sx={{ 
          color: 'text.secondary',
          mb: 3,
          mt: 2,
          maxWidth: '800px'
        }}
      >
        Configure self-destruct scripts that will be embedded in encrypted files to delete data on unauthorized systems.
      </Typography>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            borderLeft: '4px solid #EF4444',
            '& .MuiAlert-icon': {
              color: '#991B1B'
            }
          }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 2,
            borderLeft: '4px solid #3B82F6',
            '& .MuiAlert-icon': {
              color: '#1E3A8A'
            }
          }}
        >
          {success}
        </Alert>
      )}
      
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        sx={{ 
          mb: 3,
          '& .MuiTabs-indicator': {
            backgroundColor: 'primary.main',
            height: 3
          },
          '& .MuiTab-root': {
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main',
              fontWeight: 'bold'
            },
            '&:hover': {
              color: 'primary.light',
              opacity: 1
            }
          }
        }}
      >
        <Tab label="Configuration" icon={<SettingsIcon />} iconPosition="start" />
        <Tab label="Script Preview" icon={<CodeIcon />} iconPosition="start" />
        <Tab label="Breach Logs" icon={<WarningIcon />} iconPosition="start" />
      </Tabs>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {activeTab === 0 && (
            <Paper 
              sx={{ 
                p: 3,
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                border: '1px solid',
                borderColor: 'primary.light'
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.dark',
                  mb: 2
                }}
              >
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
                  onClick={saveConfiguration}
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                    px: 3,
                    py: 1.2,
                    '&:hover': {
                      background: 'linear-gradient(to right, #1E3A8A, #4B92FF)',
                      transform: 'scale(1.02)',
                      transition: 'transform 0.2s'
                    },
                    '&.Mui-disabled': {
                      opacity: 0.7
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> : 'Save Configuration'}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={testSelfDestruct}
                  disabled={loading || !config.enabled}
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    fontWeight: 'medium',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      borderColor: 'primary.dark',
                      color: 'primary.dark'
                    },
                    '&.Mui-disabled': {
                      opacity: 0.5
                    }
                  }}
                >
                  Test Self-Destruct
                </Button>
              </Box>
            </Paper>
          )}
          
          {activeTab === 1 && (
            <Paper 
              sx={{ 
                p: 3,
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                border: '1px solid',
                borderColor: 'primary.light'
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.dark',
                  mb: 2
                }}
              >
                Script Preview
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress sx={{ color: 'primary.main' }} />
                </Box>
              ) : (
                <>
                  <Typography 
                    variant="subtitle2" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 'medium',
                      color: 'primary.main',
                      mb: 1
                    }}
                  >
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
                      border: '1px solid',
                      borderColor: 'primary.light',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {scriptPreview || 'No script preview available. Please configure and save settings first.'}
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        fontStyle: 'italic'
                      }}
                    >
                      This script will be embedded in encrypted files and will execute when the file is accessed on unauthorized systems.
                    </Typography>
                  </Box>
                </>
              )}
            </Paper>
          )}
          
          {activeTab === 2 && (
            <Paper 
              sx={{ 
                p: 3,
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                border: '1px solid',
                borderColor: 'primary.light'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography 
                  variant="h6"
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'primary.dark'
                  }}
                >
                  Breach Logs
                </Typography>
                
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={fetchBreachLogs}
                  disabled={logsLoading}
                  sx={{
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'rgba(191, 219, 254, 0.2)'
                    },
                    '&.Mui-disabled': {
                      opacity: 0.5
                    }
                  }}
                >
                  Refresh
                </Button>
              </Box>
              
              {logsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress sx={{ color: 'primary.main' }} />
                </Box>
              ) : breachLogs.length === 0 ? (
                <Alert 
                  severity="info"
                  sx={{
                    borderLeft: '4px solid #3B82F6',
                    backgroundColor: 'rgba(191, 219, 254, 0.1)'
                  }}
                >
                  No breach logs found.
                </Alert>
              ) : (
                <TableContainer sx={{ borderRadius: '8px', overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'primary.dark' }}>
                        <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Timestamp</TableCell>
                        <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>IP Address</TableCell>
                        <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>MAC Address</TableCell>
                        <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Platform</TableCell>
                        <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {breachLogs.map((log, index) => (
                        <TableRow 
                          key={index}
                          sx={{
                            '&:nth-of-type(odd)': {
                              backgroundColor: '#F9FAFB',
                            },
                            '&:hover': {
                              backgroundColor: 'rgba(191, 219, 254, 0.2)',
                            }
                          }}
                        >
                          <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                          <TableCell>{log.ip}</TableCell>
                          <TableCell>{log.mac}</TableCell>
                          <TableCell>{log.platform}</TableCell>
                          <TableCell>
                            <Chip
                              label={log.status}
                              color={log.status === 'deleted' ? 'success' : 'error'}
                              size="small"
                              sx={{
                                fontWeight: 'medium',
                                ...(log.status === 'deleted' && {
                                  backgroundColor: 'rgba(191, 219, 254, 0.3)',
                                  color: 'primary.dark'
                                })
                              }}
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
          <Card sx={{ 
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            border: '1px solid',
            borderColor: 'primary.light',
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
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.dark',
                  mb: 1
                }}
              >
                Self-Destruct Feature
              </Typography>
              
              <Typography 
                variant="body2" 
                paragraph
                sx={{ 
                  color: 'text.secondary',
                  mb: 2
                }}
              >
                The self-destruct feature embeds a script in encrypted files that deletes the data on unauthorized systems while preserving it on the server.
              </Typography>
              
              <Typography 
                variant="subtitle1" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main',
                  mb: 1
                }}
              >
                How It Works:
              </Typography>
              
              <List dense sx={{ mb: 1 }}>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Script is embedded in encrypted files" 
                    primaryTypographyProps={{ 
                      sx: { color: 'text.primary' } 
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Checks for authorized environment on access" 
                    primaryTypographyProps={{ 
                      sx: { color: 'text.primary' } 
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Deletes file locally if unauthorized" 
                    primaryTypographyProps={{ 
                      sx: { color: 'text.primary' } 
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Logs breach attempt with IP and MAC" 
                    primaryTypographyProps={{ 
                      sx: { color: 'text.primary' } 
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Server-side data remains intact" 
                    primaryTypographyProps={{ 
                      sx: { color: 'text.primary' } 
                    }}
                  />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2, borderColor: 'primary.light' }} />
              
              <Typography 
                variant="subtitle1" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main',
                  mb: 1
                }}
              >
                Supported Platforms:
              </Typography>
              
              <Grid container spacing={1}>
                <Grid item>
                  <Chip 
                    label="Windows" 
                    sx={{ 
                      bgcolor: 'rgba(191, 219, 254, 0.3)',
                      color: 'primary.dark',
                      fontWeight: 'medium',
                      '&:hover': {
                        bgcolor: 'rgba(191, 219, 254, 0.5)'
                      }
                    }}
                  />
                </Grid>
                <Grid item>
                  <Chip 
                    label="Linux" 
                    sx={{ 
                      bgcolor: 'rgba(191, 219, 254, 0.3)',
                      color: 'primary.dark',
                      fontWeight: 'medium',
                      '&:hover': {
                        bgcolor: 'rgba(191, 219, 254, 0.5)'
                      }
                    }}
                  />
                </Grid>
                <Grid item>
                  <Chip 
                    label="macOS" 
                    sx={{ 
                      bgcolor: 'rgba(191, 219, 254, 0.3)',
                      color: 'primary.dark',
                      fontWeight: 'medium',
                      '&:hover': {
                        bgcolor: 'rgba(191, 219, 254, 0.5)'
                      }
                    }}
                  />
                </Grid>
                <Grid item>
                  <Chip 
                    label="JavaScript" 
                    sx={{ 
                      bgcolor: 'rgba(191, 219, 254, 0.3)',
                      color: 'primary.dark',
                      fontWeight: 'medium',
                      '&:hover': {
                        bgcolor: 'rgba(191, 219, 254, 0.5)'
                      }
                    }}
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2, borderColor: 'primary.light' }} />
              
              <Typography 
                variant="subtitle1" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main',
                  mb: 1
                }}
              >
                Security Considerations:
              </Typography>
              
              <List dense sx={{ mb: 0 }}>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Only deletes data on unauthorized systems" 
                    primaryTypographyProps={{ 
                      sx: { color: 'text.primary' } 
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Unobtrusive for authorized users" 
                    primaryTypographyProps={{ 
                      sx: { color: 'text.primary' } 
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Compatible with common file types" 
                    primaryTypographyProps={{ 
                      sx: { color: 'text.primary' } 
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Logs breach attempts for auditing" 
                    primaryTypographyProps={{ 
                      sx: { color: 'text.primary' } 
                    }}
                  />
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
