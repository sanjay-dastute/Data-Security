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
        'rgba(59, 130, 246, 0.5)', // primary.main with opacity
        'rgba(30, 58, 138, 0.5)',  // primary.dark with opacity
        'rgba(191, 219, 254, 0.5)', // primary.light with opacity
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)', // primary.main
        'rgba(30, 58, 138, 1)',  // primary.dark
        'rgba(191, 219, 254, 1)', // primary.light
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
        'rgba(30, 58, 138, 0.5)',  // primary.dark with opacity
        'rgba(59, 130, 246, 0.5)', // primary.main with opacity
        'rgba(191, 219, 254, 0.5)', // primary.light with opacity
        'rgba(255, 255, 255, 0.5)', // white with opacity
      ],
      borderColor: [
        'rgba(30, 58, 138, 1)',  // primary.dark
        'rgba(59, 130, 246, 1)', // primary.main
        'rgba(191, 219, 254, 1)', // primary.light
        'rgba(255, 255, 255, 1)', // white
      ],
      borderWidth: 1,
    }],
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ 
        my: 4,
        bgcolor: 'background.default',
        borderRadius: 2,
        p: 3,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            color: 'primary.dark',
            fontWeight: 600,
            mb: 3
          }}
        >
          Admin Dashboard
        </Typography>
        
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'primary.light', 
          mb: 3,
          bgcolor: 'background.paper',
          borderRadius: '10px 10px 0 0',
          p: 1
        }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange} 
            aria-label="admin dashboard tabs"
            sx={{ 
              '& .MuiTabs-indicator': { 
                backgroundColor: 'primary.main',
                height: 3
              },
              '& .MuiTab-root': { 
                color: 'text.secondary',
                fontWeight: 500,
                '&.Mui-selected': { 
                  color: 'primary.main',
                  fontWeight: 600
                },
                '&:hover': {
                  color: 'primary.light'
                }
              }
            }}
          >
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                        borderWidth: 2,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'primary.dark',
                    },
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel sx={{ '&.Mui-focused': { color: 'primary.dark' } }}>Filter</InputLabel>
                  <Select
                    value={filters.userFilter}
                    label="Filter"
                    onChange={(e) => handleFilterChange('userFilter', e.target.value)}
                    sx={{
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                        borderWidth: 2,
                      },
                    }}
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
                  sx={{ 
                    background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
                    '&:hover': {
                      background: 'linear-gradient(to right, #1E3A8A, #4B92FF)',
                      transform: 'scale(1.05)',
                    },
                  }}
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
                      }}>Organization</TableCell>
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
                      }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow 
                        key={user.id}
                        sx={{
                          '&:nth-of-type(odd)': {
                            backgroundColor: 'background.default',
                          },
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            transition: 'background-color 0.2s ease',
                          },
                        }}
                      >
                        <TableCell sx={{ color: 'text.primary' }}>{user.username}</TableCell>
                        <TableCell sx={{ color: 'text.primary' }}>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.role} 
                            sx={{
                              backgroundColor: user.role === 'ADMIN' ? 'error.light' : 
                                            user.role === 'ORG_ADMIN' ? 'warning.light' : 'primary.light',
                              color: user.role === 'ADMIN' ? 'error.dark' : 
                                    user.role === 'ORG_ADMIN' ? 'warning.dark' : 'primary.dark',
                              fontWeight: 500,
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'text.primary' }}>{user.organization || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.status} 
                            sx={{
                              backgroundColor: user.status === 'ACTIVE' ? 'success.light' : 
                                            user.status === 'PENDING' ? 'warning.light' : 'error.light',
                              color: user.status === 'ACTIVE' ? 'success.dark' : 
                                    user.status === 'PENDING' ? 'warning.dark' : 'error.dark',
                              fontWeight: 500,
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                              size="small"
                              sx={{ 
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'primary.light',
                                  transform: 'scale(1.1)'
                                }
                              }}
                              onClick={() => window.location.href = `/dashboard/users/edit/${user.id}`}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            {user.status === 'ACTIVE' ? (
                              <IconButton 
                                size="small"
                                sx={{ 
                                  color: 'warning.main',
                                  '&:hover': {
                                    backgroundColor: 'warning.light',
                                    transform: 'scale(1.1)'
                                  }
                                }}
                                onClick={() => handleUserAction('deactivate', user.id)}
                              >
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            ) : (
                              <IconButton 
                                size="small"
                                sx={{ 
                                  color: 'success.main',
                                  '&:hover': {
                                    backgroundColor: 'success.light',
                                    transform: 'scale(1.1)'
                                  }
                                }}
                                onClick={() => handleUserAction('activate', user.id)}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            )}
                            <IconButton 
                              size="small"
                              sx={{ 
                                color: 'error.main',
                                '&:hover': {
                                  backgroundColor: 'error.light',
                                  transform: 'scale(1.1)'
                                }
                              }}
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
                      }}>Name</TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'primary.dark', 
                        color: 'common.white',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}>Industry</TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'primary.dark', 
                        color: 'common.white',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}>Users</TableCell>
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
                      }}>Created</TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'primary.dark', 
                        color: 'common.white',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrgs.map((org) => (
                      <TableRow 
                        key={org.id}
                        sx={{
                          '&:nth-of-type(odd)': {
                            backgroundColor: 'background.default',
                          },
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            transition: 'background-color 0.2s ease',
                          },
                        }}
                      >
                        <TableCell sx={{ color: 'text.primary' }}>{org.name}</TableCell>
                        <TableCell sx={{ color: 'text.primary' }}>{org.industry}</TableCell>
                        <TableCell sx={{ color: 'text.primary' }}>{org.user_count}</TableCell>
                        <TableCell>
                          <Chip 
                            label={org.status} 
                            sx={{
                              backgroundColor: org.status === 'ACTIVE' ? 'success.light' : 
                                            org.status === 'PENDING' ? 'warning.light' : 'error.light',
                              color: org.status === 'ACTIVE' ? 'success.dark' : 
                                    org.status === 'PENDING' ? 'warning.dark' : 'error.dark',
                              fontWeight: 500,
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'text.primary' }}>{new Date(org.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                              size="small"
                              sx={{ 
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'primary.light',
                                  transform: 'scale(1.1)'
                                }
                              }}
                              onClick={() => window.location.href = `/dashboard/organizations/edit/${org.id}`}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            {org.status === 'ACTIVE' ? (
                              <IconButton 
                                size="small"
                                sx={{ 
                                  color: 'warning.main',
                                  '&:hover': {
                                    backgroundColor: 'warning.light',
                                    transform: 'scale(1.1)'
                                  }
                                }}
                                onClick={() => handleOrgAction('suspend', org.id)}
                              >
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            ) : (
                              <IconButton 
                                size="small"
                                sx={{ 
                                  color: 'success.main',
                                  '&:hover': {
                                    backgroundColor: 'success.light',
                                    transform: 'scale(1.1)'
                                  }
                                }}
                                onClick={() => handleOrgAction('activate', org.id)}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            )}
                            <IconButton 
                              size="small"
                              sx={{ 
                                color: 'error.main',
                                '&:hover': {
                                  backgroundColor: 'error.light',
                                  transform: 'scale(1.1)'
                                }
                              }}
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
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'primary.light',
                    transform: 'scale(1.05)',
                  }
                }}
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
                  <Paper 
                    sx={{ 
                      p: 3,
                      borderRadius: 2,
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                      border: '1px solid',
                      borderColor: 'primary.light',
                      background: 'linear-gradient(to bottom right, rgba(191, 219, 254, 0.1), rgba(255, 255, 255, 1))'
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ 
                        color: 'primary.dark',
                        fontWeight: 600,
                        mb: 2
                      }}
                    >
                      Resource Usage
                    </Typography>
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
                                text: 'Percentage (%)',
                                color: 'text.primary',
                                font: {
                                  weight: 500
                                }
                              },
                              ticks: {
                                color: 'text.primary'
                              },
                              grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                              }
                            },
                            x: {
                              ticks: {
                                color: 'text.primary'
                              },
                              grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                              }
                            }
                          },
                          plugins: {
                            legend: {
                              labels: {
                                color: 'text.primary',
                                font: {
                                  weight: 500
                                }
                              }
                            }
                          }
                        }} 
                      />
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper 
                    sx={{ 
                      p: 3,
                      borderRadius: 2,
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                      border: '1px solid',
                      borderColor: 'primary.light',
                      background: 'linear-gradient(to bottom right, rgba(191, 219, 254, 0.1), rgba(255, 255, 255, 1))'
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ 
                        color: 'primary.dark',
                        fontWeight: 600,
                        mb: 2
                      }}
                    >
                      System Statistics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Card sx={{ 
                          bgcolor: 'background.paper',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                          border: '1px solid',
                          borderColor: 'primary.light',
                          borderRadius: 2
                        }}>
                          <CardContent>
                            <Typography 
                              variant="subtitle1" 
                              gutterBottom
                              sx={{ 
                                color: 'primary.main',
                                fontWeight: 500
                              }}
                            >
                              System Uptime
                            </Typography>
                            <Typography 
                              variant="h4"
                              sx={{ 
                                color: 'text.primary',
                                fontWeight: 600
                              }}
                            >
                              {Math.floor(systemHealth.uptime / 86400)} days
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {Math.floor((systemHealth.uptime % 86400) / 3600)} hours
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card sx={{ 
                          bgcolor: 'background.paper',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                          border: '1px solid',
                          borderColor: 'primary.light',
                          borderRadius: 2
                        }}>
                          <CardContent>
                            <Typography 
                              variant="subtitle1" 
                              gutterBottom
                              sx={{ 
                                color: 'primary.main',
                                fontWeight: 500
                              }}
                            >
                              Active Users
                            </Typography>
                            <Typography 
                              variant="h4"
                              sx={{ 
                                color: 'text.primary',
                                fontWeight: 600
                              }}
                            >
                              {systemHealth.activeUsers}
                            </Typography>
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
                        <Card 
                          sx={{ 
                            bgcolor: 'error.light',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                            border: '1px solid',
                            borderColor: 'error.main',
                            borderRadius: 2,
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        >
                          <CardContent>
                            <Typography 
                              variant="subtitle1" 
                              gutterBottom
                              sx={{ 
                                color: 'error.dark',
                                fontWeight: 500
                              }}
                            >
                              High Severity
                            </Typography>
                            <Typography 
                              variant="h4"
                              sx={{ 
                                color: 'error.dark',
                                fontWeight: 600
                              }}
                            >
                              {filteredAlerts.filter(a => a.severity === 'HIGH').length}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card 
                          sx={{ 
                            bgcolor: 'warning.light',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                            border: '1px solid',
                            borderColor: 'warning.main',
                            borderRadius: 2,
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        >
                          <CardContent>
                            <Typography 
                              variant="subtitle1" 
                              gutterBottom
                              sx={{ 
                                color: 'warning.dark',
                                fontWeight: 500
                              }}
                            >
                              Medium Severity
                            </Typography>
                            <Typography 
                              variant="h4"
                              sx={{ 
                                color: 'warning.dark',
                                fontWeight: 600
                              }}
                            >
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
                          }}>Type</TableCell>
                          <TableCell sx={{ 
                            bgcolor: 'primary.dark', 
                            color: 'common.white',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}>IP Address</TableCell>
                          <TableCell sx={{ 
                            bgcolor: 'primary.dark', 
                            color: 'common.white',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}>MAC Address</TableCell>
                          <TableCell sx={{ 
                            bgcolor: 'primary.dark', 
                            color: 'common.white',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}>Timestamp</TableCell>
                          <TableCell sx={{ 
                            bgcolor: 'primary.dark', 
                            color: 'common.white',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}>Severity</TableCell>
                          <TableCell sx={{ 
                            bgcolor: 'primary.dark', 
                            color: 'common.white',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredAlerts.map((alert) => (
                          <TableRow 
                            key={alert.id}
                            sx={{
                              '&:nth-of-type(odd)': {
                                backgroundColor: 'background.default',
                              },
                              '&:hover': {
                                backgroundColor: 'primary.light',
                                transition: 'background-color 0.2s ease',
                              },
                            }}
                          >
                            <TableCell sx={{ color: 'text.primary' }}>{alert.type}</TableCell>
                            <TableCell sx={{ color: 'text.primary' }}>{alert.ip}</TableCell>
                            <TableCell sx={{ color: 'text.primary' }}>{alert.mac}</TableCell>
                            <TableCell sx={{ color: 'text.primary' }}>{new Date(alert.timestamp).toLocaleString()}</TableCell>
                            <TableCell>
                              <Chip 
                                label={alert.severity} 
                                sx={{
                                  backgroundColor: alert.severity === 'HIGH' ? 'error.light' : 
                                                alert.severity === 'MEDIUM' ? 'warning.light' : 'info.light',
                                  color: alert.severity === 'HIGH' ? 'error.dark' : 
                                        alert.severity === 'MEDIUM' ? 'warning.dark' : 'info.dark',
                                  fontWeight: 500,
                                }}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton 
                                  size="small"
                                  sx={{ 
                                    color: 'success.main',
                                    '&:hover': {
                                      backgroundColor: 'success.light',
                                      transform: 'scale(1.1)'
                                    }
                                  }}
                                  onClick={() => handleAlertAction('resolve', alert.id)}
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small"
                                  sx={{ 
                                    color: 'error.main',
                                    '&:hover': {
                                      backgroundColor: 'error.light',
                                      transform: 'scale(1.1)'
                                    }
                                  }}
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
