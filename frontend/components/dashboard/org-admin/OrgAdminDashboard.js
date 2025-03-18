import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, Box, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, TextField, 
  MenuItem, Select, FormControl, InputLabel,
  Card, CardContent, Tabs, Tab, IconButton,
  Chip, CircularProgress, Alert, Switch, FormControlLabel
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Refresh as RefreshIcon,
  Key as KeyIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const OrgAdminDashboard = () => {
  // State for dashboard tabs
  const [currentTab, setCurrentTab] = useState(0);
  
  // State for organization users
  const [orgUsers, setOrgUsers] = useState([]);
  const [filteredOrgUsers, setFilteredOrgUsers] = useState([]);
  const [userFilter, setUserFilter] = useState('all');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  
  // State for encryption keys
  const [keys, setKeys] = useState([]);
  const [filteredKeys, setFilteredKeys] = useState([]);
  const [keyFilter, setKeyFilter] = useState('all');
  const [keySearchTerm, setKeySearchTerm] = useState('');
  const [keyLoading, setKeyLoading] = useState(true);
  const [keyError, setKeyError] = useState(null);
  
  // State for encryption settings
  const [encryptionSettings, setEncryptionSettings] = useState({
    timerEnabled: false,
    timerInterval: 30,
    storageType: 'AWS_S3',
    hsmEnabled: false,
    selfDestructEnabled: true,
    fieldEncryptionEnabled: true
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState(null);
  const [settingsSaved, setSettingsSaved] = useState(false);
  
  // State for organization info
  const [orgInfo, setOrgInfo] = useState({
    id: '',
    name: '',
    industry: '',
    userCount: 0,
    status: 'ACTIVE'
  });
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgError, setOrgError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchOrgInfo();
    fetchOrgUsers();
    fetchKeys();
    fetchEncryptionSettings();
  }, []);

  // Fetch organization info
  const fetchOrgInfo = async () => {
    try {
      setOrgLoading(true);
      const response = await fetch('/api/org/info');
      if (!response.ok) {
        throw new Error('Failed to fetch organization info');
      }
      const data = await response.json();
      setOrgInfo(data);
      setOrgLoading(false);
    } catch (error) {
      setOrgError(error.message);
      setOrgLoading(false);
    }
  };

  // Fetch organization users
  const fetchOrgUsers = async () => {
    try {
      setUserLoading(true);
      const response = await fetch(`/api/org/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch organization users');
      }
      const data = await response.json();
      setOrgUsers(data);
      setFilteredOrgUsers(data);
      setUserLoading(false);
    } catch (error) {
      setUserError(error.message);
      setUserLoading(false);
    }
  };

  // Fetch encryption keys
  const fetchKeys = async () => {
    try {
      setKeyLoading(true);
      const response = await fetch('/api/keys');
      if (!response.ok) {
        throw new Error('Failed to fetch keys');
      }
      const data = await response.json();
      setKeys(data);
      setFilteredKeys(data);
      setKeyLoading(false);
    } catch (error) {
      setKeyError(error.message);
      setKeyLoading(false);
    }
  };

  // Fetch encryption settings
  const fetchEncryptionSettings = async () => {
    try {
      setSettingsLoading(true);
      const response = await fetch('/api/encryption/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch encryption settings');
      }
      const data = await response.json();
      setEncryptionSettings(data);
      setSettingsLoading(false);
    } catch (error) {
      setSettingsError(error.message);
      setSettingsLoading(false);
    }
  };

  // Filter organization users based on search term and filter
  useEffect(() => {
    let result = orgUsers;
    
    if (userFilter !== 'all') {
      result = result.filter(user => user.status === userFilter);
    }
    
    if (userSearchTerm) {
      const searchLower = userSearchTerm.toLowerCase();
      result = result.filter(user => 
        user.username?.toLowerCase().includes(searchLower) || 
        user.email?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredOrgUsers(result);
  }, [orgUsers, userFilter, userSearchTerm]);

  // Filter keys based on search term and filter
  useEffect(() => {
    let result = keys;
    
    if (keyFilter !== 'all') {
      result = result.filter(key => key.status === keyFilter);
    }
    
    if (keySearchTerm) {
      const searchLower = keySearchTerm.toLowerCase();
      result = result.filter(key => 
        key.name?.toLowerCase().includes(searchLower) || 
        key.created_by?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredKeys(result);
  }, [keys, keyFilter, keySearchTerm]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Handle user actions (activate, deactivate, delete)
  const handleUserAction = async (action, userId) => {
    try {
      const response = await fetch(`/api/org/users/${userId}/${action}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} user`);
      }
      
      // Refresh users list
      fetchOrgUsers();
    } catch (error) {
      setUserError(error.message);
    }
  };

  // Handle key actions (revoke, delete)
  const handleKeyAction = async (action, keyId) => {
    try {
      const response = await fetch(`/api/keys/${keyId}/${action}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} key`);
      }
      
      // Refresh keys list
      fetchKeys();
    } catch (error) {
      setKeyError(error.message);
    }
  };

  // Handle encryption settings change
  const handleSettingsChange = (setting, value) => {
    setEncryptionSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    setSettingsSaved(false);
  };

  // Save encryption settings
  const saveEncryptionSettings = async () => {
    try {
      const response = await fetch('/api/encryption/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(encryptionSettings),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save encryption settings');
      }
      
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (error) {
      setSettingsError(error.message);
    }
  };

  // Generate a new key
  const generateKey = async () => {
    try {
      setKeyLoading(true);
      const response = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Key-${new Date().toISOString().slice(0, 10)}`,
          expiresIn: encryptionSettings.timerEnabled ? encryptionSettings.timerInterval : 0,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate key');
      }
      
      // Refresh keys list
      fetchKeys();
    } catch (error) {
      setKeyError(error.message);
      setKeyLoading(false);
    }
  };

  // Chart data for key usage
  const keyUsageChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Key Usage',
        data: [65, 59, 80, 81, 56, 55],
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      },
    ],
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            color: 'primary.dark',
            fontWeight: 600,
            background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Organization Admin Dashboard
        </Typography>
        
        {!orgLoading && (
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h6" 
              component="h2" 
              gutterBottom
              sx={{ 
                color: 'text.primary',
                fontWeight: 500
              }}
            >
              {orgInfo.name} - {orgInfo.industry}
            </Typography>
            <Chip 
              label={orgInfo.status} 
              sx={{ 
                mr: 1,
                backgroundColor: orgInfo.status === 'ACTIVE' ? 'success.light' : 'error.light',
                color: orgInfo.status === 'ACTIVE' ? 'success.dark' : 'error.dark',
                fontWeight: 500
              }}
            />
            <Chip 
              label={`${orgInfo.userCount} Users`} 
              sx={{
                backgroundColor: 'primary.light',
                color: 'primary.dark',
                fontWeight: 500
              }}
            />
          </Box>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="org admin dashboard tabs">
            <Tab label="User Management" />
            <Tab label="Key Management" />
            <Tab label="Encryption Settings" />
          </Tabs>
        </Box>
        
        {/* User Management Tab */}
        {currentTab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Organization Users</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  label="Search Users"
                  variant="outlined"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Filter</InputLabel>
                  <Select
                    value={userFilter}
                    label="Filter"
                    onChange={(e) => setUserFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Users</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                  </Select>
                </FormControl>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => window.location.href = '/dashboard/users/new'}
                >
                  Add User
                </Button>
              </Box>
            </Box>
            
            {userError && <Alert severity="error" sx={{ mb: 2 }}>{userError}</Alert>}
            
            {userLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer 
                component={Paper}
                sx={{ 
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', 
                  border: '1px solid',
                  borderColor: 'primary.light',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        bgcolor: 'primary.dark', 
                        color: 'common.white',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}>Username</TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'primary.dark', 
                        color: 'common.white',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}>Email</TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'primary.dark', 
                        color: 'common.white',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}>Role</TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'primary.dark', 
                        color: 'common.white',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}>Status</TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'primary.dark', 
                        color: 'common.white',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}>Last Login</TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'primary.dark', 
                        color: 'common.white',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrgUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.role} 
                            color={user.role === 'ORG_ADMIN' ? 'warning' : 'primary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={user.status} 
                            color={
                              user.status === 'ACTIVE' ? 'success' : 
                              user.status === 'PENDING' ? 'warning' : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{user.last_login || 'Never'}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => window.location.href = `/dashboard/users/edit/${user.id}`}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            {user.status === 'ACTIVE' ? (
                              <IconButton 
                                size="small" 
                                color="warning"
                                onClick={() => handleUserAction('deactivate', user.id)}
                              >
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            ) : (
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleUserAction('activate', user.id)}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            )}
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleUserAction('delete', user.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
        
        {/* Key Management Tab */}
        {currentTab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Encryption Keys</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  label="Search Keys"
                  variant="outlined"
                  value={keySearchTerm}
                  onChange={(e) => setKeySearchTerm(e.target.value)}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Filter</InputLabel>
                  <Select
                    value={keyFilter}
                    label="Filter"
                    onChange={(e) => setKeyFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Keys</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="EXPIRED">Expired</MenuItem>
                    <MenuItem value="REVOKED">Revoked</MenuItem>
                  </Select>
                </FormControl>
                <Button 
                  variant="contained" 
                  startIcon={<KeyIcon />}
                  onClick={generateKey}
                >
                  Generate Key
                </Button>
              </Box>
            </Box>
            
            {keyError && <Alert severity="error" sx={{ mb: 2 }}>{keyError}</Alert>}
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                {keyLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Key ID</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Created By</TableCell>
                          <TableCell>Created At</TableCell>
                          <TableCell>Expires At</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredKeys.map((key) => (
                          <TableRow key={key.id}>
                            <TableCell>{key.id.substring(0, 8)}...</TableCell>
                            <TableCell>{key.name}</TableCell>
                            <TableCell>{key.created_by}</TableCell>
                            <TableCell>{new Date(key.created_at).toLocaleString()}</TableCell>
                            <TableCell>{key.expires_at ? new Date(key.expires_at).toLocaleString() : 'Never'}</TableCell>
                            <TableCell>
                              <Chip 
                                label={key.status} 
                                color={
                                  key.status === 'ACTIVE' ? 'success' : 
                                  key.status === 'EXPIRED' ? 'warning' : 'error'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                {key.status === 'ACTIVE' && (
                                  <IconButton 
                                    size="small" 
                                    color="warning"
                                    onClick={() => handleKeyAction('revoke', key.id)}
                                  >
                                    <BlockIcon fontSize="small" />
                                  </IconButton>
                                )}
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleKeyAction('delete', key.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Key Usage</Typography>
                  <Box sx={{ height: 300 }}>
                    <Line 
                      data={keyUsageChartData} 
                      options={{ 
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Usage Count'
                            }
                          }
                        }
                      }} 
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Encryption Settings Tab */}
        {currentTab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Encryption Settings</Typography>
              <Button 
                variant="contained" 
                startIcon={<SettingsIcon />}
                onClick={saveEncryptionSettings}
              >
                Save Settings
              </Button>
            </Box>
            
            {settingsError && <Alert severity="error" sx={{ mb: 2 }}>{settingsError}</Alert>}
            {settingsSaved && <Alert severity="success" sx={{ mb: 2 }}>Settings saved successfully</Alert>}
            
            {settingsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Key Management</Typography>
                    <Box sx={{ mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={encryptionSettings.timerEnabled}
                            onChange={(e) => handleSettingsChange('timerEnabled', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Enable Timer-based Key Rotation"
                      />
                    </Box>
                    {encryptionSettings.timerEnabled && (
                      <Box sx={{ mb: 2 }}>
                        <FormControl fullWidth>
                          <InputLabel>Timer Interval (days)</InputLabel>
                          <Select
                            value={encryptionSettings.timerInterval}
                            label="Timer Interval (days)"
                            onChange={(e) => handleSettingsChange('timerInterval', e.target.value)}
                          >
                            <MenuItem value={7}>7 days</MenuItem>
                            <MenuItem value={30}>30 days</MenuItem>
                            <MenuItem value={90}>90 days</MenuItem>
                            <MenuItem value={180}>180 days</MenuItem>
                            <MenuItem value={365}>365 days</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    )}
                    <Box sx={{ mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={encryptionSettings.hsmEnabled}
                            onChange={(e) => handleSettingsChange('hsmEnabled', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Enable Hardware Security Module (HSM)"
                      />
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Storage Configuration</Typography>
                    <Box sx={{ mb: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel>Storage Type</InputLabel>
                        <Select
                          value={encryptionSettings.storageType}
                          label="Storage Type"
                          onChange={(e) => handleSettingsChange('storageType', e.target.value)}
                        >
                          <MenuItem value="AWS_S3">AWS S3</MenuItem>
                          <MenuItem value="AZURE_BLOB">Azure Blob Storage</MenuItem>
                          <MenuItem value="GOOGLE_CLOUD">Google Cloud Storage</MenuItem>
                          <MenuItem value="ON_PREMISES">On-Premises</MenuItem>
                          <MenuItem value="SQL_DATABASE">SQL Database</MenuItem>
                          <MenuItem value="NOSQL_DATABASE">NoSQL Database</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Security Features</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 2 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={encryptionSettings.selfDestructEnabled}
                                onChange={(e) => handleSettingsChange('selfDestructEnabled', e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Enable Self-Destruct on Breach"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 2 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={encryptionSettings.fieldEncryptionEnabled}
                                onChange={(e) => handleSettingsChange('fieldEncryptionEnabled', e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Enable Selective Field Encryption"
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default OrgAdminDashboard;
