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
  LinearProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Storage as StorageIcon,
  FilterList as FilterListIcon,
  Lock as LockIcon,
  Check as CheckIcon,
  DataObject as DataObjectIcon
} from '@mui/icons-material';

const BatchProcessing = () => {
  // State for batch processing
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileFields, setFileFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [processingStatus, setProcessingStatus] = useState({
    isProcessing: false,
    progress: 0,
    estimatedTime: 0,
    processedFiles: 0,
    totalFiles: 0
  });
  
  // State for storage configuration
  const [storageConfig, setStorageConfig] = useState({
    type: 'AWS_S3',
    bucketName: '',
    region: '',
    path: ''
  });
  
  // State for loading and error handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Handle file upload
  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setFiles([...files, ...uploadedFiles]);
  };
  
  // Handle file selection
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setLoading(true);
    
    // Simulate API call to extract fields
    setTimeout(() => {
      // Mock field extraction based on file type
      let extractedFields = [];
      
      if (file.name.endsWith('.csv')) {
        extractedFields = [
          { name: 'id', type: 'number' },
          { name: 'name', type: 'string' },
          { name: 'email', type: 'string' },
          { name: 'phone', type: 'string' },
          { name: 'ssn', type: 'string' },
          { name: 'address', type: 'string' },
          { name: 'city', type: 'string' },
          { name: 'state', type: 'string' },
          { name: 'zip', type: 'string' }
        ];
      } else if (file.name.endsWith('.json')) {
        extractedFields = [
          { name: 'user.id', type: 'number' },
          { name: 'user.name', type: 'string' },
          { name: 'user.email', type: 'string' },
          { name: 'user.contact.phone', type: 'string' },
          { name: 'user.ssn', type: 'string' },
          { name: 'user.address.street', type: 'string' },
          { name: 'user.address.city', type: 'string' },
          { name: 'user.address.state', type: 'string' },
          { name: 'user.address.zip', type: 'string' }
        ];
      } else if (file.name.endsWith('.parquet') || file.name.endsWith('.avro')) {
        extractedFields = [
          { name: 'customer_id', type: 'number' },
          { name: 'customer_name', type: 'string' },
          { name: 'customer_email', type: 'string' },
          { name: 'customer_phone', type: 'string' },
          { name: 'customer_ssn', type: 'string' },
          { name: 'customer_address', type: 'string' },
          { name: 'customer_city', type: 'string' },
          { name: 'customer_state', type: 'string' },
          { name: 'customer_zip', type: 'string' }
        ];
      } else {
        extractedFields = [
          { name: 'field1', type: 'string' },
          { name: 'field2', type: 'string' },
          { name: 'field3', type: 'string' },
          { name: 'field4', type: 'string' },
          { name: 'field5', type: 'string' }
        ];
      }
      
      setFileFields(extractedFields);
      setSelectedFields([]);
      setLoading(false);
    }, 1500);
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
  
  // Handle storage configuration change
  const handleStorageConfigChange = (field, value) => {
    setStorageConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Start batch processing
  const startBatchProcessing = () => {
    if (files.length === 0) {
      setError('Please upload at least one file');
      return;
    }
    
    if (selectedFields.length === 0) {
      setError('Please select at least one field to encrypt');
      return;
    }
    
    setProcessingStatus({
      isProcessing: true,
      progress: 0,
      estimatedTime: files.length * 2, // 2 seconds per file
      processedFiles: 0,
      totalFiles: files.length
    });
    
    // Simulate batch processing
    const processFiles = async () => {
      for (let i = 0; i < files.length; i++) {
        // Simulate API call to process file
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setProcessingStatus(prev => ({
          ...prev,
          progress: Math.round(((i + 1) / files.length) * 100),
          estimatedTime: (files.length - (i + 1)) * 2,
          processedFiles: i + 1
        }));
      }
      
      setProcessingStatus(prev => ({
        ...prev,
        isProcessing: false
      }));
      
      setSuccess('Batch processing completed successfully');
    };
    
    processFiles();
  };
  
  // Cancel batch processing
  const cancelBatchProcessing = () => {
    setProcessingStatus({
      isProcessing: false,
      progress: 0,
      estimatedTime: 0,
      processedFiles: 0,
      totalFiles: 0
    });
  };
  
  // Remove file
  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    if (selectedFile === files[index]) {
      setSelectedFile(null);
      setFileFields([]);
      setSelectedFields([]);
    }
  };
  
  // Format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{ 
          color: 'primary.dark',
          fontWeight: 'bold',
          background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2
        }}
      >
        Batch Processing
      </Typography>
      <Typography 
        variant="body1" 
        paragraph
        sx={{ 
          color: 'text.secondary',
          mb: 3
        }}
      >
        Process multiple files in batch for encryption. Select fields to encrypt and configure storage options.
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      
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
                color: 'primary.dark',
                fontWeight: 600,
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
                disabled={processingStatus.isProcessing}
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
                Upload Files
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileUpload}
                />
              </Button>
            </Box>
            
            {files.length > 0 && (
              <Box>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom
                  sx={{
                    color: 'primary.dark',
                    fontWeight: 500,
                    mb: 2
                  }}
                >
                  Uploaded Files ({files.length})
                </Typography>
                
                <List sx={{ 
                  '& .MuiListItem-root': {
                    borderRadius: '6px',
                    mb: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(191, 219, 254, 0.2)'
                    }
                  }
                }}>
                  {files.map((file, index) => (
                    <ListItem
                      key={index}
                      divider={index < files.length - 1}
                      secondaryAction={
                        <Button
                          size="small"
                          onClick={() => removeFile(index)}
                          disabled={processingStatus.isProcessing}
                          sx={{
                            color: '#EF4444',
                            '&:hover': {
                              backgroundColor: 'rgba(239, 68, 68, 0.1)'
                            },
                            '&.Mui-disabled': {
                              color: '#9CA3AF'
                            }
                          }}
                        >
                          Remove
                        </Button>
                      }
                    >
                      <ListItemIcon>
                        <DataObjectIcon sx={{ color: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>
                            {file.name}
                          </Typography>
                        }
                        secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                        onClick={() => handleFileSelect(file)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Paper>
          
          {selectedFile && (
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
                  color: 'primary.dark',
                  fontWeight: 600,
                  mb: 2
                }}
              >
                Field Selection
              </Typography>
              
              <Typography 
                variant="subtitle1" 
                gutterBottom
                sx={{
                  color: 'primary.main',
                  fontWeight: 500,
                  mb: 2
                }}
              >
                {selectedFile.name}
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress sx={{ color: 'primary.main' }} />
                </Box>
              ) : (
                <>
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
                    {fileFields.map((field, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedFields.includes(field.name)}
                              onChange={() => handleFieldSelection(field.name)}
                              disabled={processingStatus.isProcessing}
                              sx={{
                                color: 'primary.light',
                                '&.Mui-checked': {
                                  color: 'primary.main',
                                },
                                '&:hover': {
                                  backgroundColor: 'rgba(191, 219, 254, 0.2)'
                                }
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography sx={{ color: 'text.primary', display: 'inline' }}>
                                {field.name}
                              </Typography>
                              <Chip
                                label={field.type}
                                size="small"
                                sx={{ 
                                  ml: 1,
                                  backgroundColor: 'rgba(191, 219, 254, 0.5)',
                                  color: 'primary.dark',
                                  fontWeight: 500
                                }}
                              />
                            </Box>
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={<FilterListIcon />}
                      onClick={() => setSelectedFields(fileFields.map(field => field.name))}
                      disabled={processingStatus.isProcessing}
                      sx={{ 
                        mr: 1,
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          borderColor: 'primary.dark',
                          color: 'primary.dark',
                        },
                        '&.Mui-disabled': {
                          borderColor: '#E5E7EB',
                          color: '#9CA3AF'
                        }
                      }}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setSelectedFields([])}
                      disabled={processingStatus.isProcessing}
                      sx={{ 
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          borderColor: 'primary.dark',
                          color: 'primary.dark',
                        },
                        '&.Mui-disabled': {
                          borderColor: '#E5E7EB',
                          color: '#9CA3AF'
                        }
                      }}
                    >
                      Clear Selection
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          )}
          
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
                color: 'primary.dark',
                fontWeight: 600,
                mb: 2
              }}
            >
              Storage Configuration
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel sx={{ color: 'text.secondary' }}>Storage Type</InputLabel>
                  <Select
                    value={storageConfig.type}
                    onChange={(e) => handleStorageConfigChange('type', e.target.value)}
                    label="Storage Type"
                    disabled={processingStatus.isProcessing}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.light'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      },
                      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E5E7EB'
                      }
                    }}
                  >
                    <MenuItem value="AWS_S3">AWS S3</MenuItem>
                    <MenuItem value="AZURE_BLOB">Azure Blob Storage</MenuItem>
                    <MenuItem value="GOOGLE_CLOUD">Google Cloud Storage</MenuItem>
                    <MenuItem value="SQL_DATABASE">SQL Database</MenuItem>
                    <MenuItem value="NOSQL_DATABASE">NoSQL Database</MenuItem>
                    <MenuItem value="ON_PREMISES">On-Premises</MenuItem>
                    <MenuItem value="CUSTOM">Custom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {storageConfig.type === 'AWS_S3' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Bucket Name"
                      value={storageConfig.bucketName}
                      onChange={(e) => handleStorageConfigChange('bucketName', e.target.value)}
                      disabled={processingStatus.isProcessing}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: 2,
                          },
                          '&.Mui-disabled fieldset': {
                            borderColor: '#E5E7EB'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'primary.dark',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Region"
                      value={storageConfig.region}
                      onChange={(e) => handleStorageConfigChange('region', e.target.value)}
                      disabled={processingStatus.isProcessing}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: 2,
                          },
                          '&.Mui-disabled fieldset': {
                            borderColor: '#E5E7EB'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'primary.dark',
                        },
                      }}
                    />
                  </Grid>
                </>
              )}
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Path"
                  value={storageConfig.path}
                  onChange={(e) => handleStorageConfigChange('path', e.target.value)}
                  disabled={processingStatus.isProcessing}
                  helperText="Path where encrypted files will be stored"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                        borderWidth: 2,
                      },
                      '&.Mui-disabled fieldset': {
                        borderColor: '#E5E7EB'
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'primary.dark',
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'text.secondary',
                      marginTop: 1
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
          
          {processingStatus.isProcessing && (
            <Paper 
              sx={{ 
                p: 3, 
                mt: 3,
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
                  color: 'primary.dark',
                  fontWeight: 600,
                  mb: 2
                }}
              >
                Processing Status
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={processingStatus.progress} 
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(191, 219, 254, 0.3)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: 'linear-gradient(to right, #1E3A8A, #3B82F6)'
                    }
                  }}
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography 
                    variant="body2"
                    sx={{ 
                      color: 'text.primary',
                      fontWeight: 500
                    }}
                  >
                    Progress: {processingStatus.progress}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography 
                    variant="body2" 
                    align="right"
                    sx={{ 
                      color: 'text.primary',
                      fontWeight: 500
                    }}
                  >
                    Estimated time remaining: {formatTime(processingStatus.estimatedTime)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography 
                    variant="body2"
                    sx={{ 
                      color: 'text.primary',
                      fontWeight: 500
                    }}
                  >
                    Processed files: {processingStatus.processedFiles} / {processingStatus.totalFiles}
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={cancelBatchProcessing}
                  sx={{
                    borderColor: '#EF4444',
                    color: '#EF4444',
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      borderColor: '#DC2626'
                    }
                  }}
                >
                  Cancel Processing
                </Button>
              </Box>
            </Paper>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<LockIcon />}
              onClick={startBatchProcessing}
              disabled={
                processingStatus.isProcessing ||
                files.length === 0 ||
                selectedFields.length === 0
              }
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
              Start Batch Processing
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Batch Processing Information
              </Typography>
              
              <Typography variant="body2" paragraph>
                Batch processing allows you to encrypt multiple files at once using Apache Spark for distributed processing.
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Features:
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Process multiple files simultaneously" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Select specific fields to encrypt" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Support for various file formats (CSV, JSON, Parquet, Avro)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Configure storage options for encrypted files" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Real-time progress tracking" />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Supported File Formats:
              </Typography>
              
              <Grid container spacing={1}>
                <Grid item>
                  <Chip label="CSV" />
                </Grid>
                <Grid item>
                  <Chip label="JSON" />
                </Grid>
                <Grid item>
                  <Chip label="Parquet" />
                </Grid>
                <Grid item>
                  <Chip label="Avro" />
                </Grid>
                <Grid item>
                  <Chip label="XML" />
                </Grid>
                <Grid item>
                  <Chip label="Text" />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Storage Options:
              </Typography>
              
              <Grid container spacing={1}>
                <Grid item>
                  <Chip label="AWS S3" icon={<StorageIcon />} />
                </Grid>
                <Grid item>
                  <Chip label="Azure Blob" icon={<StorageIcon />} />
                </Grid>
                <Grid item>
                  <Chip label="Google Cloud" icon={<StorageIcon />} />
                </Grid>
                <Grid item>
                  <Chip label="SQL Database" icon={<StorageIcon />} />
                </Grid>
                <Grid item>
                  <Chip label="NoSQL Database" icon={<StorageIcon />} />
                </Grid>
                <Grid item>
                  <Chip label="On-Premises" icon={<StorageIcon />} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BatchProcessing;
