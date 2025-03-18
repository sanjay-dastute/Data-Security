import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  FormControlLabel
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Visibility as VisibilityIcon,
  Lock as LockIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Check as CheckIcon
} from '@mui/icons-material';

const SelectiveEncryption = () => {
  // State for file upload and data
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [fields, setFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  
  // State for loading and error handling
  const [loading, setLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [encryptLoading, setEncryptLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // State for encrypted file
  const [encryptedFileUrl, setEncryptedFileUrl] = useState(null);
  
  // Handle file upload
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFileData(null);
      setFields([]);
      setSelectedFields([]);
      setEncryptedFileUrl(null);
      setError(null);
      setSuccess(null);
    }
  };
  
  // View file data
  const viewFileData = async () => {
    if (!file) {
      setError('Please upload a file first');
      return;
    }
    
    setViewLoading(true);
    setError(null);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload file to get temporary metadata
      const uploadResponse = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }
      
      const uploadData = await uploadResponse.json();
      
      // Get file data
      const viewResponse = await fetch(`/api/view-data/${uploadData.id}`);
      
      if (!viewResponse.ok) {
        throw new Error('Failed to view file data');
      }
      
      const viewData = await viewResponse.json();
      
      // Set file data and fields
      setFileData(viewData.data);
      
      // Extract fields from data
      const extractedFields = [];
      
      if (Array.isArray(viewData.data) && viewData.data.length > 0) {
        // For array data (e.g., CSV)
        const firstRow = viewData.data[0];
        Object.keys(firstRow).forEach(key => {
          extractedFields.push({
            name: key,
            type: typeof firstRow[key],
            example: firstRow[key],
          });
        });
      } else if (typeof viewData.data === 'object' && viewData.data !== null) {
        // For object data (e.g., JSON)
        const flattenObject = (obj, prefix = '') => {
          return Object.keys(obj).reduce((acc, key) => {
            const pre = prefix.length ? `${prefix}.` : '';
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
              Object.assign(acc, flattenObject(obj[key], `${pre}${key}`));
            } else {
              acc[`${pre}${key}`] = obj[key];
            }
            return acc;
          }, {});
        };
        
        const flattenedData = flattenObject(viewData.data);
        
        Object.keys(flattenedData).forEach(key => {
          extractedFields.push({
            name: key,
            type: typeof flattenedData[key],
            example: flattenedData[key],
          });
        });
      }
      
      setFields(extractedFields);
      setViewLoading(false);
    } catch (error) {
      setError(error.message);
      setViewLoading(false);
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
  
  // Encrypt selected fields
  const encryptSelectedFields = async () => {
    if (!file || !fileData) {
      setError('Please upload and view a file first');
      return;
    }
    
    if (selectedFields.length === 0) {
      setError('Please select at least one field to encrypt');
      return;
    }
    
    setEncryptLoading(true);
    setError(null);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fields', JSON.stringify(selectedFields));
      
      // Encrypt file
      const encryptResponse = await fetch('/api/encrypt', {
        method: 'POST',
        body: formData,
      });
      
      if (!encryptResponse.ok) {
        throw new Error('Failed to encrypt file');
      }
      
      const encryptData = await encryptResponse.json();
      
      setEncryptedFileUrl(encryptData.url);
      setSuccess('File encrypted successfully');
      setEncryptLoading(false);
    } catch (error) {
      setError(error.message);
      setEncryptLoading(false);
    }
  };
  
  // Render table for file data preview
  const renderDataTable = () => {
    if (!fileData) return null;
    
    if (Array.isArray(fileData)) {
      // Render table for array data (e.g., CSV)
      const headers = Object.keys(fileData[0] || {});
      
      return (
        <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {headers.map(header => (
                  <TableCell key={header}>
                    {header}
                    {selectedFields.includes(header) && (
                      <LockIcon fontSize="small" color="primary" sx={{ ml: 1, verticalAlign: 'middle' }} />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {fileData.slice(0, 10).map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {headers.map(header => (
                    <TableCell key={`${rowIndex}-${header}`}>
                      {selectedFields.includes(header) ? '********' : String(row[header])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {fileData.length > 10 && (
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Showing 10 of {fileData.length} rows
              </Typography>
            </Box>
          )}
        </TableContainer>
      );
    } else if (typeof fileData === 'object' && fileData !== null) {
      // Render table for object data (e.g., JSON)
      const flattenObject = (obj, prefix = '') => {
        return Object.keys(obj).reduce((acc, key) => {
          const pre = prefix.length ? `${prefix}.` : '';
          if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            Object.assign(acc, flattenObject(obj[key], `${pre}${key}`));
          } else {
            acc[`${pre}${key}`] = obj[key];
          }
          return acc;
        }, {});
      };
      
      const flattenedData = flattenObject(fileData);
      
      return (
        <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Field</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(flattenedData).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell>
                    {key}
                    {selectedFields.includes(key) && (
                      <LockIcon fontSize="small" color="primary" sx={{ ml: 1, verticalAlign: 'middle' }} />
                    )}
                  </TableCell>
                  <TableCell>{selectedFields.includes(key) ? '********' : String(value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
    
    return null;
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{
          fontWeight: 'bold',
          background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1
        }}
      >
        Selective Field Encryption
      </Typography>
      <Typography 
        variant="body1" 
        paragraph
        sx={{ 
          color: 'text.secondary',
          mb: 2
        }}
      >
        Upload a file, view its contents, select specific fields to encrypt, and download the encrypted file.
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2, borderLeft: '4px solid #EF4444' }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderLeft: '4px solid', borderColor: 'primary.main' }}>{success}</Alert>}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3, 
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
              File Upload
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                disabled={viewLoading || encryptLoading}
                sx={{
                  background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
                  color: '#FFFFFF',
                  fontWeight: 'bold',
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
                Upload File
                <input
                  type="file"
                  hidden
                  onChange={handleFileUpload}
                />
              </Button>
            </Box>
            
            {file && (
              <Box sx={{ 
                p: 2, 
                borderRadius: '8px', 
                bgcolor: 'rgba(191, 219, 254, 0.1)',
                border: '1px dashed',
                borderColor: 'primary.light'
              }}>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'primary.main',
                    mb: 1
                  }}
                >
                  Uploaded File
                </Typography>
                
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Name:</strong> {file.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                    <Typography variant="body2">
                      <strong>Type:</strong> {file.type || 'Unknown'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={viewFileData}
                      disabled={viewLoading || encryptLoading}
                      sx={{
                        borderColor: 'primary.main',
                        color: 'primary.main',
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
                      {viewLoading ? <CircularProgress size={24} sx={{ color: 'primary.main' }} /> : 'View Data'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
          
          {fileData && (
            <>
              <Paper 
                sx={{ 
                  p: 3, 
                  mb: 3, 
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
                  Data Preview
                </Typography>
                
                {renderDataTable()}
              </Paper>
              
              <Paper 
                sx={{ 
                  p: 3, 
                  mb: 3, 
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
                    mb: 1
                  }}
                >
                  Field Selection
                </Typography>
                
                <Typography 
                  variant="body2" 
                  paragraph
                  sx={{ 
                    color: 'text.secondary',
                    mb: 2
                  }}
                >
                  Select fields to encrypt:
                </Typography>
                
                <Grid container spacing={2}>
                  {fields.map((field, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        p: 1,
                        borderRadius: '6px',
                        '&:hover': {
                          bgcolor: 'rgba(191, 219, 254, 0.2)'
                        }
                      }}>
                        <Checkbox
                          checked={selectedFields.includes(field.name)}
                          onChange={() => handleFieldSelection(field.name)}
                          disabled={encryptLoading}
                          sx={{
                            color: 'primary.main',
                            '&.Mui-checked': {
                              color: 'primary.main',
                            },
                          }}
                        />
                        <Box>
                          <Typography 
                            variant="body2"
                            sx={{ 
                              fontWeight: selectedFields.includes(field.name) ? 'bold' : 'normal',
                              color: selectedFields.includes(field.name) ? 'primary.dark' : 'text.primary'
                            }}
                          >
                            {field.name}
                          </Typography>
                          <Chip
                            label={field.type}
                            size="small"
                            color={selectedFields.includes(field.name) ? 'primary' : 'default'}
                            sx={{
                              mt: 0.5,
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                        <Tooltip title={`Example: ${String(field.example).substring(0, 50)}${String(field.example).length > 50 ? '...' : ''}`}>
                          <IconButton size="small" sx={{ color: 'primary.main', ml: 'auto' }}>
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={() => setSelectedFields(fields.map(field => field.name))}
                    disabled={encryptLoading}
                    sx={{
                      borderColor: 'primary.main',
                      color: 'primary.main',
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
                    Select All
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setSelectedFields([])}
                    disabled={encryptLoading}
                    sx={{
                      borderColor: 'primary.main',
                      color: 'primary.main',
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
                    Clear Selection
                  </Button>
                </Box>
              </Paper>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<LockIcon />}
                  onClick={encryptSelectedFields}
                  disabled={encryptLoading || selectedFields.length === 0}
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
                  {encryptLoading ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> : 'Encrypt Selected Fields'}
                </Button>
              </Box>
              
              {encryptedFileUrl && (
                <Paper 
                  sx={{ 
                    p: 3, 
                    borderRadius: '10px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    border: '1px solid',
                    borderColor: 'primary.light',
                    bgcolor: 'rgba(191, 219, 254, 0.1)'
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
                    Encrypted File
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography 
                      variant="body1"
                      sx={{ 
                        color: 'text.primary',
                        fontWeight: 'medium'
                      }}
                    >
                      Your file has been encrypted successfully!
                    </Typography>
                    
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      href={encryptedFileUrl}
                      download
                      sx={{
                        background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                        '&:hover': {
                          background: 'linear-gradient(to right, #1E3A8A, #4B92FF)',
                          transform: 'scale(1.02)',
                          transition: 'transform 0.2s'
                        }
                      }}
                    >
                      Download Encrypted File
                    </Button>
                  </Box>
                </Paper>
              )}
            </>
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
                Selective Field Encryption
              </Typography>
              
              <Typography 
                variant="body2" 
                paragraph
                sx={{ 
                  color: 'text.secondary',
                  mb: 2
                }}
              >
                This feature allows you to encrypt only specific fields in your data, leaving other fields unencrypted for processing or analysis.
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
                    <CloudUploadIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Upload your file (CSV, JSON, etc.)" 
                    primaryTypographyProps={{ 
                      sx: { color: 'text.primary' } 
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <VisibilityIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="View and analyze your data" 
                    primaryTypographyProps={{ 
                      sx: { color: 'text.primary' } 
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <FilterListIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Select fields to encrypt" 
                    primaryTypographyProps={{ 
                      sx: { color: 'text.primary' } 
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LockIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Encrypt only the selected fields" 
                    primaryTypographyProps={{ 
                      sx: { color: 'text.primary' } 
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DownloadIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Download or store the encrypted file" 
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
                Benefits:
              </Typography>
              
              <List dense sx={{ mb: 1 }}>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Protect sensitive fields while keeping others accessible" 
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
                    primary="Maintain data utility for analysis" 
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
                    primary="Comply with data protection regulations" 
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
                    primary="Reduce encryption overhead" 
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
                Supported File Types:
              </Typography>
              
              <Grid container spacing={1}>
                <Grid item>
                  <Chip 
                    label="CSV" 
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
                    label="JSON" 
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
                    label="XML" 
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
                    label="Parquet" 
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
                    label="Avro" 
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SelectiveEncryption;
