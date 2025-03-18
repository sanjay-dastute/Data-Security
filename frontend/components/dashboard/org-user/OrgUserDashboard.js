import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, Box, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, TextField, 
  MenuItem, Select, FormControl, InputLabel,
  Card, CardContent, Tabs, Tab, IconButton,
  Chip, CircularProgress, Alert, List, ListItem,
  ListItemText, ListItemIcon, Checkbox, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Refresh as RefreshIcon,
  Key as KeyIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Upload as UploadIcon,
  Lock as LockIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const OrgUserDashboard = () => {
  // State for dashboard tabs
  const [currentTab, setCurrentTab] = useState(0);
  
  // State for user profile
  const [profile, setProfile] = useState({
    id: '',
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    organization: '',
    role: 'ORG_USER'
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [profileSaved, setProfileSaved] = useState(false);
  
  // State for files
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [fileFilter, setFileFilter] = useState('all');
  const [fileSearchTerm, setFileSearchTerm] = useState('');
  const [fileLoading, setFileLoading] = useState(true);
  const [fileError, setFileError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileFields, setFileFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [fileViewOpen, setFileViewOpen] = useState(false);
  
  // State for keys
  const [keys, setKeys] = useState([]);
  const [filteredKeys, setFilteredKeys] = useState([]);
  const [keyFilter, setKeyFilter] = useState('all');
  const [keySearchTerm, setKeySearchTerm] = useState('');
  const [keyLoading, setKeyLoading] = useState(true);
  const [keyError, setKeyError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchProfile();
    fetchFiles();
    fetchKeys();
  }, []);

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data);
      setProfileLoading(false);
    } catch (error) {
      setProfileError(error.message);
      setProfileLoading(false);
    }
  };

  // Fetch files
  const fetchFiles = async () => {
    try {
      setFileLoading(true);
      const response = await fetch('/api/files');
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      const data = await response.json();
      setFiles(data);
      setFilteredFiles(data);
      setFileLoading(false);
    } catch (error) {
      setFileError(error.message);
      setFileLoading(false);
    }
  };

  // Fetch keys
  const fetchKeys = async () => {
    try {
      setKeyLoading(true);
      const response = await fetch('/api/keys/user');
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

  // Filter files based on search term and filter
  useEffect(() => {
    let result = files;
    
    if (fileFilter !== 'all') {
      result = result.filter(file => file.status === fileFilter);
    }
    
    if (fileSearchTerm) {
      const searchLower = fileSearchTerm.toLowerCase();
      result = result.filter(file => 
        file.name?.toLowerCase().includes(searchLower) || 
        file.type?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredFiles(result);
  }, [files, fileFilter, fileSearchTerm]);

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

  // Handle profile change
  const handleProfileChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    setProfileSaved(false);
  };

  // Save profile
  const saveProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
      
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error) {
      setProfileError(error.message);
    }
  };

  // Handle file actions (download, delete)
  const handleFileAction = async (action, fileId) => {
    try {
      if (action === 'download') {
        window.location.href = `/api/files/${fileId}/download`;
        return;
      }
      
      const response = await fetch(`/api/files/${fileId}/${action}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} file`);
      }
      
      // Refresh files list
      fetchFiles();
    } catch (error) {
      setFileError(error.message);
    }
  };

  // View file and extract fields
  const viewFile = async (fileId) => {
    try {
      setFileLoading(true);
      const response = await fetch(`/api/files/${fileId}/view`);
      if (!response.ok) {
        throw new Error('Failed to view file');
      }
      const data = await response.json();
      setSelectedFile(data);
      
      // Extract fields from file
      const fieldsResponse = await fetch(`/api/view-data?fileId=${fileId}`);
      if (!fieldsResponse.ok) {
        throw new Error('Failed to extract fields');
      }
      const fieldsData = await fieldsResponse.json();
      setFileFields(fieldsData.fields);
      setSelectedFields(fieldsData.fields.map(field => field.name));
      
      setFileViewOpen(true);
      setFileLoading(false);
    } catch (error) {
      setFileError(error.message);
      setFileLoading(false);
    }
  };

  // Handle field selection
  const handleFieldSelection = (fieldName) => {
    setSelectedFields(prev => {
      if (prev.includes(fieldName)) {
        return prev.filter(field => field !== fieldName);
      } else {
        return [...prev, fieldName];
      }
    });
  };

  // Encrypt file with selected fields
  const encryptFile = async () => {
    try {
      setFileLoading(true);
      const response = await fetch(`/api/encrypt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: selectedFile.id,
          fields: selectedFields,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to encrypt file');
      }
      
      setFileViewOpen(false);
      fetchFiles();
    } catch (error) {
      setFileError(error.message);
      setFileLoading(false);
    }
  };

  // Upload file
  const uploadFile = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      
      setFileLoading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      fetchFiles();
    } catch (error) {
      setFileError(error.message);
      setFileLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Dashboard
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="user dashboard tabs">
            <Tab label="Profile" />
            <Tab label="File Manager" />
            <Tab label="Keys" />
          </Tabs>
        </Box>
        
        {/* Profile Tab */}
        {currentTab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">User Profile</Typography>
              <Button 
                variant="contained" 
                startIcon={<PersonIcon />}
                onClick={saveProfile}
              >
                Save Profile
              </Button>
            </Box>
            
            {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}
            {profileSaved && <Alert severity="success" sx={{ mb: 2 }}>Profile saved successfully</Alert>}
            
            {profileLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Personal Information</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Username"
                          value={profile.username}
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          value={profile.email}
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          value={profile.firstName || ''}
                          onChange={(e) => handleProfileChange('firstName', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          value={profile.lastName || ''}
                          onChange={(e) => handleProfileChange('lastName', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Phone"
                          value={profile.phone || ''}
                          onChange={(e) => handleProfileChange('phone', e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Organization Information</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Organization"
                          value={profile.organization || ''}
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Role"
                          value={profile.role || ''}
                          disabled
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Security</Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => window.location.href = '/change-password'}
                    >
                      Change Password
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
        
        {/* File Manager Tab */}
        {currentTab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography 
                variant="h6"
                sx={{
                  color: 'primary.dark',
                  fontWeight: 600
                }}
              >
                File Manager
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  label="Search Files"
                  variant="outlined"
                  value={fileSearchTerm}
                  onChange={(e) => setFileSearchTerm(e.target.value)}
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
                  <InputLabel sx={{ color: 'text.secondary' }}>Filter</InputLabel>
                  <Select
                    value={fileFilter}
                    label="Filter"
                    onChange={(e) => setFileFilter(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.light'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <MenuItem value="all">All Files</MenuItem>
                    <MenuItem value="ENCRYPTED">Encrypted</MenuItem>
                    <MenuItem value="UNENCRYPTED">Unencrypted</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<UploadIcon />}
                  sx={{
                    background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
                    '&:hover': {
                      background: 'linear-gradient(to right, #1E3A8A, #4B92FF)',
                      transform: 'scale(1.02)',
                      transition: 'transform 0.2s'
                    }
                  }}
                >
                  Upload File
                  <input
                    type="file"
                    hidden
                    onChange={uploadFile}
                  />
                </Button>
              </Box>
            </Box>
            
            {fileError && <Alert severity="error" sx={{ mb: 3 }}>{fileError}</Alert>}
            
            {fileLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress sx={{ color: 'primary.main' }} />
              </Box>
            ) : (
              <TableContainer 
                component={Paper}
                sx={{ 
                  borderRadius: '10px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  border: '1px solid',
                  borderColor: 'primary.light',
                  overflow: 'hidden'
                }}
              >
                <Table>
                  <TableHead sx={{ backgroundColor: 'primary.dark' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Size</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Uploaded At</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>{file.type}</TableCell>
                        <TableCell>{(file.size / 1024).toFixed(2)} KB</TableCell>
                        <TableCell>
                          <Chip 
                            label={file.status} 
                            color={file.status === 'ENCRYPTED' ? 'success' : 'warning'}
                            size="small"
                            sx={{
                              '&.MuiChip-colorSuccess': {
                                backgroundColor: 'rgba(191, 219, 254, 0.8)',
                                color: 'primary.dark',
                                fontWeight: 500
                              },
                              '&.MuiChip-colorWarning': {
                                backgroundColor: 'rgba(254, 215, 170, 0.8)',
                                color: '#9A3412',
                                fontWeight: 500
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>{new Date(file.uploaded_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => viewFile(file.id)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleFileAction('download', file.id)}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleFileAction('delete', file.id)}
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
            
            {/* File View Dialog */}
            <Dialog 
              open={fileViewOpen} 
              onClose={() => setFileViewOpen(false)}
              maxWidth="md"
              fullWidth
              sx={{
                '& .MuiDialog-paper': {
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }
              }}
            >
              <DialogTitle sx={{ 
                background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
                color: 'white',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center'
              }}>
                {selectedFile?.name}
                <Chip 
                  label={selectedFile?.status} 
                  color={selectedFile?.status === 'ENCRYPTED' ? 'success' : 'warning'}
                  size="small"
                  sx={{ 
                    ml: 1,
                    '&.MuiChip-colorSuccess': {
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      color: 'primary.dark',
                      fontWeight: 500
                    },
                    '&.MuiChip-colorWarning': {
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      color: '#9A3412',
                      fontWeight: 500
                    }
                  }}
                />
              </DialogTitle>
              <DialogContent sx={{ mt: 2 }}>
                {selectedFile?.status === 'UNENCRYPTED' && (
                  <Box sx={{ mb: 3 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{
                        color: 'primary.dark',
                        fontWeight: 600,
                        mb: 2
                      }}
                    >
                      Select Fields to Encrypt
                    </Typography>
                    <List>
                      {fileFields.map((field) => (
                        <ListItem key={field.name}>
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={selectedFields.includes(field.name)}
                              onChange={() => handleFieldSelection(field.name)}
                            />
                          </ListItemIcon>
                          <ListItemText 
                            primary={field.name} 
                            secondary={`Type: ${field.type}`} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                <Divider sx={{ my: 3 }} />
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{
                    color: 'primary.dark',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  File Preview
                </Typography>
                <Paper 
                  sx={{ 
                    p: 3, 
                    maxHeight: 300, 
                    overflow: 'auto',
                    borderRadius: '10px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    border: '1px solid',
                    borderColor: 'primary.light'
                  }}
                >
                  <pre>{selectedFile?.content}</pre>
                </Paper>
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button 
                  onClick={() => setFileViewOpen(false)}
                  sx={{
                    color: 'primary.main',
                    borderColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      borderColor: 'primary.dark',
                      color: 'primary.dark',
                    }
                  }}
                >
                  Close
                </Button>
                {selectedFile?.status === 'UNENCRYPTED' && (
                  <Button 
                    variant="contained" 
                    startIcon={<LockIcon />}
                    onClick={encryptFile}
                    disabled={selectedFields.length === 0}
                    sx={{
                      background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
                      '&:hover': {
                        background: 'linear-gradient(to right, #1E3A8A, #4B92FF)',
                        transform: 'scale(1.02)',
                        transition: 'transform 0.2s'
                      },
                      '&.Mui-disabled': {
                        background: '#E5E7EB',
                        color: '#9CA3AF'
                      }
                    }}
                  >
                    Encrypt Selected Fields
                  </Button>
                )}
              </DialogActions>
            </Dialog>
          </Box>
        )}
        
        {/* Keys Tab */}
        {currentTab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography 
                variant="h6"
                sx={{
                  color: 'primary.dark',
                  fontWeight: 600
                }}
              >
                Encryption Keys
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  label="Search Keys"
                  variant="outlined"
                  value={keySearchTerm}
                  onChange={(e) => setKeySearchTerm(e.target.value)}
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
                  <InputLabel sx={{ color: 'text.secondary' }}>Filter</InputLabel>
                  <Select
                    value={keyFilter}
                    label="Filter"
                    onChange={(e) => setKeyFilter(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.light'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <MenuItem value="all">All Keys</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="EXPIRED">Expired</MenuItem>
                    <MenuItem value="REVOKED">Revoked</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            {keyError && <Alert severity="error" sx={{ mb: 3 }}>{keyError}</Alert>}
            
            {keyLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress sx={{ color: 'primary.main' }} />
              </Box>
            ) : (
              <TableContainer 
                component={Paper}
                sx={{ 
                  borderRadius: '10px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  border: '1px solid',
                  borderColor: 'primary.light',
                  overflow: 'hidden'
                }}
              >
                <Table>
                  <TableHead sx={{ backgroundColor: 'primary.dark' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Key ID</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created At</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Expires At</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Used For</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell>{key.id.substring(0, 8)}...</TableCell>
                        <TableCell>{key.name}</TableCell>
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
                            sx={{
                              '&.MuiChip-colorSuccess': {
                                backgroundColor: 'rgba(191, 219, 254, 0.8)',
                                color: 'primary.dark',
                                fontWeight: 500
                              },
                              '&.MuiChip-colorWarning': {
                                backgroundColor: 'rgba(254, 215, 170, 0.8)',
                                color: '#9A3412',
                                fontWeight: 500
                              },
                              '&.MuiChip-colorError': {
                                backgroundColor: 'rgba(254, 202, 202, 0.8)',
                                color: '#991B1B',
                                fontWeight: 500
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>{key.used_for || 'General Encryption'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default OrgUserDashboard;
