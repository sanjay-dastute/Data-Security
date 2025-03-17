import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, Box, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, TextField, 
  MenuItem, Select, FormControl, InputLabel,
  Card, CardContent, Tabs, Tab, IconButton,
  Chip, CircularProgress, Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const AdminDashboard = () => {
  // State for dashboard tabs
  const [currentTab, setCurrentTab] = useState(0);
  
  // State for users, organizations, system health, and security alerts
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    cpu: 0, memory: 0, disk: 0, uptime: 0, activeUsers: 0
  });
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  
  // Loading and error states
  const [loading, setLoading] = useState({
    users: true, orgs: true, health: true, alerts: true
  });
  const [errors, setErrors] = useState({
    users: null, orgs: null, health: null, alerts: null
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    userFilter: 'all',
    userSearchTerm: '',
    orgFilter: 'all',
    orgSearchTerm: '',
    alertFilter: 'all',
    alertSearchTerm: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchUsers();
    fetchOrganizations();
    fetchSystemHealth();
    fetchSecurityAlerts();
    
    // Set up interval to refresh system health data every 30 seconds
    const intervalId = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Data fetching functions
  const fetchUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
      setLoading(prev => ({ ...prev, users: false }));
      setErrors(prev => ({ ...prev, users: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, users: error.message }));
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const fetchOrganizations = async () => {
    try {
      setLoading(prev => ({ ...prev, orgs: true }));
      const response = await fetch('/api/admin/organizations');
      if (!response.ok) throw new Error('Failed to fetch organizations');
      const data = await response.json();
      setOrganizations(data);
      setFilteredOrgs(data);
      setLoading(prev => ({ ...prev, orgs: false }));
      setErrors(prev => ({ ...prev, orgs: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, orgs: error.message }));
      setLoading(prev => ({ ...prev, orgs: false }));
    }
  };

  const fetchSystemHealth = async () => {
    try {
      setLoading(prev => ({ ...prev, health: true }));
      const response = await fetch('/api/admin/system-health');
      if (!response.ok) throw new Error('Failed to fetch system health');
      const data = await response.json();
      setSystemHealth(data);
      setLoading(prev => ({ ...prev, health: false }));
      setErrors(prev => ({ ...prev, health: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, health: error.message }));
      setLoading(prev => ({ ...prev, health: false }));
    }
  };

  const fetchSecurityAlerts = async () => {
    try {
      setLoading(prev => ({ ...prev, alerts: true }));
      const response = await fetch('/api/admin/security-alerts');
      if (!response.ok) throw new Error('Failed to fetch security alerts');
      const data = await response.json();
      setSecurityAlerts(data);
      setFilteredAlerts(data);
      setLoading(prev => ({ ...prev, alerts: false }));
      setErrors(prev => ({ ...prev, alerts: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, alerts: error.message }));
      setLoading(prev => ({ ...prev, alerts: false }));
    }
  };

  // Filter effects
  useEffect(() => {
    let result = users;
    if (filters.userFilter !== 'all') {
      result = result.filter(user => user.role === filters.userFilter);
    }
    if (filters.userSearchTerm) {
      const searchLower = filters.userSearchTerm.toLowerCase();
      result = result.filter(user => 
        user.username?.toLowerCase().includes(searchLower) || 
        user.email?.toLowerCase().includes(searchLower)
      );
    }
    setFilteredUsers(result);
  }, [users, filters.userFilter, filters.userSearchTerm]);

  useEffect(() => {
    let result = organizations;
    if (filters.orgFilter !== 'all') {
      result = result.filter(org => org.status === filters.orgFilter);
    }
    if (filters.orgSearchTerm) {
      const searchLower = filters.orgSearchTerm.toLowerCase();
      result = result.filter(org => 
        org.name?.toLowerCase().includes(searchLower) || 
        org.industry?.toLowerCase().includes(searchLower)
      );
    }
    setFilteredOrgs(result);
  }, [organizations, filters.orgFilter, filters.orgSearchTerm]);

  useEffect(() => {
    let result = securityAlerts;
    if (filters.alertFilter !== 'all') {
      result = result.filter(alert => alert.severity === filters.alertFilter);
    }
    if (filters.alertSearchTerm) {
      const searchLower = filters.alertSearchTerm.toLowerCase();
      result = result.filter(alert => 
        alert.type?.toLowerCase().includes(searchLower) || 
        alert.ip?.toLowerCase().includes(searchLower)
      );
    }
    setFilteredAlerts(result);
  }, [securityAlerts, filters.alertFilter, filters.alertSearchTerm]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Handle user actions (activate, deactivate, delete)
  const handleUserAction = async (action, userId) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error(`Failed to ${action} user`);
      fetchUsers();
    } catch (error) {
      setErrors(prev => ({ ...prev, users: error.message }));
    }
  };

  // Handle organization actions
  const handleOrgAction = async (action, orgId) => {
    try {
      const response = await fetch(`/api/admin/organizations/${orgId}/${action}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error(`Failed to ${action} organization`);
      fetchOrganizations();
    } catch (error) {
      setErrors(prev => ({ ...prev, orgs: error.message }));
    }
  };

  // Handle alert actions
  const handleAlertAction = async (action, alertId) => {
    try {
      const response = await fetch(`/api/admin/security-alerts/${alertId}/${action}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error(`Failed to ${action} alert`);
      fetchSecurityAlerts();
    } catch (error) {
      setErrors(prev => ({ ...prev, alerts: error.message }));
    }
  };

  // Chart data
  const systemHealthChartData = {
    labels: ['CPU', 'Memory', 'Disk'],
    datasets: [{
      label: 'Usage (%)',
      data: [systemHealth.cpu, systemHealth.memory, systemHealth.disk],
      backgroundColor: [
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 99, 132, 0.5)',
        'rgba(255, 206, 86, 0.5)',
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
      ],
      borderWidth: 1,
    }],
  };

  const alertTypesChartData = {
    labels: ['Breach Attempts', 'Unauthorized Access', 'Invalid IP/MAC', 'Self-Destruct'],
    datasets: [{
      label: 'Count',
      data: [
        filteredAlerts.filter(a => a.type === 'BREACH_ATTEMPT').length,
        filteredAlerts.filter(a => a.type === 'UNAUTHORIZED_ACCESS').length,
        filteredAlerts.filter(a => a.type === 'INVALID_IP_MAC').length,
        filteredAlerts.filter(a => a.type === 'SELF_DESTRUCT').length,
      ],
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
      ],
      borderWidth: 1,
    }],
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="admin dashboard tabs">
            <Tab label="User Management" />
            <Tab label="Organization Management" />
            <Tab label="System Health" />
            <Tab label="Security Alerts" />
          </Tabs>
        </Box>
        
        {/* User Management Tab */}
        {currentTab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">User Management</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  label="Search Users"
                  variant="outlined"
                  value={filters.userSearchTerm}
                  onChange={(e) => handleFilterChange('userSearchTerm', e.target.value)}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Filter</InputLabel>
                  <Select
                    value={filters.userFilter}
                    label="Filter"
                    onChange={(e) => handleFilterChange('userFilter', e.target.value)}
                  >
                    <MenuItem value="all">All Users</MenuItem>
                    <MenuItem value="ADMIN">Admins</MenuItem>
                    <MenuItem value="ORG_ADMIN">Org Admins</MenuItem>
                    <MenuItem value="ORG_USER">Org Users</MenuItem>
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
            
            {errors.users && <Alert severity="error" sx={{ mb: 2 }}>{errors.users}</Alert>}
            
            {loading.users ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Username</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Organization</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.role} 
                            color={
                              user.role === 'ADMIN' ? 'error' : 
                              user.role === 'ORG_ADMIN' ? 'warning' : 'primary'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{user.organization || 'N/A'}</TableCell>
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
        
        {/* Organization Management Tab */}
        {currentTab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Organization Management</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  label="Search Organizations"
                  variant="outlined"
                  value={filters.orgSearchTerm}
                  onChange={(e) => handleFilterChange('orgSearchTerm', e.target.value)}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Filter</InputLabel>
                  <Select
                    value={filters.orgFilter}
                    label="Filter"
                    onChange={(e) => handleFilterChange('orgFilter', e.target.value)}
                  >
                    <MenuItem value="all">All Organizations</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="SUSPENDED">Suspended</MenuItem>
                  </Select>
                </FormControl>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => window.location.href = '/dashboard/organizations/new'}
                >
                  Add Organization
                </Button>
              </Box>
            </Box>
            
            {errors.orgs && <Alert severity="error" sx={{ mb: 2 }}>{errors.orgs}</Alert>}
            
            {loading.orgs ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Industry</TableCell>
                      <TableCell>Users</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrgs.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell>{org.name}</TableCell>
                        <TableCell>{org.industry}</TableCell>
                        <TableCell>{org.user_count}</TableCell>
                        <TableCell>
                          <Chip 
                            label={org.status} 
                            color={
                              org.status === 'ACTIVE' ? 'success' : 
                              org.status === 'PENDING' ? 'warning' : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(org.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => window.location.href = `/dashboard/organizations/edit/${org.id}`}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            {org.status === 'ACTIVE' ? (
                              <IconButton 
                                size="small" 
                                color="warning"
                                onClick={() => handleOrgAction('suspend', org.id)}
                              >
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            ) : (
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleOrgAction('activate', org.id)}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            )}
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleOrgAction('delete', org.id)}
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
        
        {/* System Health Tab */}
        {currentTab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">System Health</Typography>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={fetchSystemHealth}
              >
                Refresh
              </Button>
            </Box>
            
            {errors.health && <Alert severity="error" sx={{ mb: 2 }}>{errors.health}</Alert>}
            
            {loading.health ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Resource Usage</Typography>
                    <Box sx={{ height: 300 }}>
                      <Bar 
                        data={systemHealthChartData} 
                        options={{ 
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 100,
                              title: {
                                display: true,
                                text: 'Percentage (%)'
                              }
                            }
                          }
                        }} 
                      />
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>System Statistics</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>System Uptime</Typography>
                            <Typography variant="h4">{Math.floor(systemHealth.uptime / 86400)} days</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {Math.floor((systemHealth.uptime % 86400) / 3600)} hours
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>Active Users</Typography>
                            <Typography variant="h4">{systemHealth.activeUsers}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Currently logged in
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
        
        {/* Security Alerts Tab */}
        {currentTab === 3 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Security Alerts</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  label="Search Alerts"
                  variant="outlined"
                  value={filters.alertSearchTerm}
                  onChange={(e) => handleFilterChange('alertSearchTerm', e.target.value)}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Filter</InputLabel>
                  <Select
                    value={filters.alertFilter}
                    label="Filter"
                    onChange={(e) => handleFilterChange('alertFilter', e.target.value)}
                  >
                    <MenuItem value="all">All Alerts</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="LOW">Low</MenuItem>
                  </Select>
                </FormControl>
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />}
                  onClick={fetchSecurityAlerts}
                >
                  Refresh
                </Button>
              </Box>
            </Box>
            
            {errors.alerts && <Alert severity="error" sx={{ mb: 2 }}>{errors.alerts}</Alert>}
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Alert Types</Typography>
                  <Box sx={{ height: 300 }}>
                    <Pie 
                      data={alertTypesChartData} 
                      options={{ 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          }
                        }
                      }} 
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Alert Summary</Typography>
                  <Box sx={{ height: 300, overflowY: 'auto' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Card sx={{ bgcolor: 'error.light' }}>
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>High Severity</Typography>
                            <Typography variant="h4">
                              {filteredAlerts.filter(a => a.severity === 'HIGH').length}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card sx={{ bgcolor: 'warning.light' }}>
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>Medium Severity</Typography>
                            <Typography variant="h4">
                              {filteredAlerts.filter(a => a.severity === 'MEDIUM').length}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                {loading.alerts ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell>IP Address</TableCell>
                          <TableCell>MAC Address</TableCell>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>Severity</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredAlerts.map((alert) => (
                          <TableRow key={alert.id}>
                            <TableCell>{alert.type}</TableCell>
                            <TableCell>{alert.ip}</TableCell>
                            <TableCell>{alert.mac}</TableCell>
                            <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
                            <TableCell>
                              <Chip 
                                label={alert.severity} 
                                color={
                                  alert.severity === 'HIGH' ? 'error' : 
                                  alert.severity === 'MEDIUM' ? 'warning' : 'info'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => handleAlertAction('resolve', alert.id)}
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleAlertAction('delete', alert.id)}
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
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default AdminDashboard;
