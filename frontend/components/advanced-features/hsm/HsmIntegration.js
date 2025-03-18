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
  Chip
} from '@mui/material';
import { Save as SaveIcon, Check as CheckIcon, Warning as WarningIcon } from '@mui/icons-material';

const HsmIntegration = () => {
  // State for HSM configuration
  const [hsmConfig, setHsmConfig] = useState({
    enabled: false,
    provider: 'THALES',
    ip: '',
    port: '',
    slot: '',
    pin: '',
    label: '',
    libraryPath: '',
    useForKeyGeneration: true,
    useForEncryption: true,
    useForDecryption: true
  });

  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Fetch HSM configuration on component mount
  useEffect(() => {
    fetchHsmConfig();
  }, []);

  // Fetch HSM configuration from API
  const fetchHsmConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hsm/config');
      
      if (!response.ok) {
        throw new Error('Failed to fetch HSM configuration');
      }
      
      const data = await response.json();
      setHsmConfig(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setHsmConfig(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear messages when form is changed
    setSuccess(null);
    setError(null);
    setTestResult(null);
  };

  // Save HSM configuration
  const saveHsmConfig = async () => {
    try {
      setSaveLoading(true);
      const response = await fetch('/api/hsm/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hsmConfig),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save HSM configuration');
      }
      
      setSuccess('HSM configuration saved successfully');
      setSaveLoading(false);
      
      // Log to blockchain
      await fetch('/api/blockchain/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'HSM_CONFIG_UPDATED',
          metadata: {
            provider: hsmConfig.provider,
            enabled: hsmConfig.enabled
          }
        }),
      });
    } catch (error) {
      setError(error.message);
      setSaveLoading(false);
    }
  };

  // Test HSM connection
  const testHsmConnection = async () => {
    try {
      setTestLoading(true);
      setTestResult(null);
      
      const response = await fetch('/api/hsm/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hsmConfig),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to test HSM connection');
      }
      
      setTestResult({
        success: true,
        message: 'HSM connection successful',
        details: data
      });
      setTestLoading(false);
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message,
        details: null
      });
      setTestLoading(false);
    }
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
        Hardware Security Module (HSM) Integration
      </Typography>
      <Typography 
        variant="body1" 
        paragraph
        sx={{ 
          color: 'text.secondary',
          mb: 3
        }}
      >
        Configure HSM integration for enhanced security in key management and cryptographic operations.
        HSM provides hardware-based, FIPS 140-2 compliant key storage and operations.
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress sx={{ color: 'primary.main' }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper 
              sx={{ 
                p: 3,
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                border: '1px solid',
                borderColor: 'primary.light'
              }}
            >
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={hsmConfig.enabled}
                      onChange={(e) => handleInputChange('enabled', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.light'
                          }
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: 'primary.main'
                        }
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>
                      Enable HSM Integration
                    </Typography>
                  }
                />
              </Box>
              
              {hsmConfig.enabled && (
                <>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="HSM Provider"
                        select
                        SelectProps={{ native: true }}
                        value={hsmConfig.provider}
                        onChange={(e) => handleInputChange('provider', e.target.value)}
                        margin="normal"
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
                      >
                        <option value="THALES">Thales Luna</option>
                        <option value="YUBIHSM">YubiHSM</option>
                        <option value="AWS_CLOUDHSM">AWS CloudHSM</option>
                        <option value="AZURE_KEY_VAULT">Azure Key Vault</option>
                        <option value="GOOGLE_CLOUD_HSM">Google Cloud HSM</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="HSM IP Address"
                        value={hsmConfig.ip}
                        onChange={(e) => handleInputChange('ip', e.target.value)}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="HSM Port"
                        value={hsmConfig.port}
                        onChange={(e) => handleInputChange('port', e.target.value)}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="HSM Slot/Partition"
                        value={hsmConfig.slot}
                        onChange={(e) => handleInputChange('slot', e.target.value)}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="HSM PIN/Password"
                        type="password"
                        value={hsmConfig.pin}
                        onChange={(e) => handleInputChange('pin', e.target.value)}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="HSM Label"
                        value={hsmConfig.label}
                        onChange={(e) => handleInputChange('label', e.target.value)}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="PKCS#11 Library Path"
                        value={hsmConfig.libraryPath}
                        onChange={(e) => handleInputChange('libraryPath', e.target.value)}
                        margin="normal"
                        helperText="Path to the PKCS#11 library provided by your HSM vendor"
                      />
                    </Grid>
                  </Grid>
                  
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
                    HSM Usage Configuration
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={hsmConfig.useForKeyGeneration}
                            onChange={(e) => handleInputChange('useForKeyGeneration', e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'primary.light'
                                }
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: 'primary.main'
                              }
                            }}
                          />
                        }
                        label={
                          <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>
                            Use for Key Generation
                          </Typography>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={hsmConfig.useForEncryption}
                            onChange={(e) => handleInputChange('useForEncryption', e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'primary.light'
                                }
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: 'primary.main'
                              }
                            }}
                          />
                        }
                        label={
                          <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>
                            Use for Encryption
                          </Typography>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={hsmConfig.useForDecryption}
                            onChange={(e) => handleInputChange('useForDecryption', e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'primary.light'
                                }
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: 'primary.main'
                              }
                            }}
                          />
                        }
                        label={
                          <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>
                            Use for Decryption
                          </Typography>
                        }
                      />
                    </Grid>
                  </Grid>
                </>
              )}
              
              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={saveHsmConfig}
                  disabled={saveLoading}
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
                  {saveLoading ? 'Saving...' : 'Save Configuration'}
                </Button>
                
                {hsmConfig.enabled && (
                  <Button
                    variant="outlined"
                    onClick={testHsmConnection}
                    disabled={testLoading}
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
                    {testLoading ? 'Testing...' : 'Test Connection'}
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              border: '1px solid',
              borderColor: 'primary.light'
            }}>
              <CardContent>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{
                    color: 'primary.dark',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  HSM Status
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Chip
                    label={hsmConfig.enabled ? 'Enabled' : 'Disabled'}
                    color={hsmConfig.enabled ? 'success' : 'default'}
                    icon={hsmConfig.enabled ? <CheckIcon /> : <WarningIcon />}
                    sx={{
                      '&.MuiChip-colorSuccess': {
                        backgroundColor: 'rgba(191, 219, 254, 0.8)',
                        color: 'primary.dark',
                        fontWeight: 500
                      }
                    }}
                  />
                </Box>
                
                {hsmConfig.enabled && (
                  <>
                    <Typography variant="body2" gutterBottom>
                      <strong>Provider:</strong> {hsmConfig.provider}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Connection:</strong> {hsmConfig.ip}:{hsmConfig.port}
                    </Typography>
                  </>
                )}
                
                {testResult && (
                  <Box sx={{ mt: 2 }}>
                    <Alert 
                      severity={testResult.success ? 'success' : 'error'}
                      sx={{
                        '&.MuiAlert-standardSuccess': {
                          backgroundColor: 'rgba(191, 219, 254, 0.2)',
                          color: 'primary.dark'
                        },
                        '&.MuiAlert-standardError': {
                          backgroundColor: 'rgba(254, 202, 202, 0.2)',
                          color: '#991B1B'
                        }
                      }}
                    >
                      {testResult.message}
                    </Alert>
                    
                    {testResult.success && testResult.details && (
                      <Box sx={{ mt: 3 }}>
                        <Typography 
                          variant="body2" 
                          gutterBottom
                          sx={{ color: 'text.primary', mb: 1 }}
                        >
                          <strong>Firmware Version:</strong> {testResult.details.firmwareVersion || 'N/A'}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          gutterBottom
                          sx={{ color: 'text.primary', mb: 1 }}
                        >
                          <strong>Serial Number:</strong> {testResult.details.serialNumber || 'N/A'}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          gutterBottom
                          sx={{ color: 'text.primary', mb: 1 }}
                        >
                          <strong>Available Slots:</strong> {testResult.details.availableSlots || 'N/A'}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
            
            <Card sx={{ 
              mt: 3,
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              border: '1px solid',
              borderColor: 'primary.light'
            }}>
              <CardContent>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{
                    color: 'primary.dark',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  HSM Information
                </Typography>
                
                <Typography 
                  variant="body2" 
                  paragraph
                  sx={{ color: 'text.secondary', mb: 2 }}
                >
                  Hardware Security Modules (HSMs) provide secure key storage and cryptographic operations in a tamper-resistant hardware device.
                </Typography>
                
                <Typography 
                  variant="body2" 
                  paragraph
                  sx={{ 
                    color: 'text.primary', 
                    fontWeight: 500,
                    mb: 1
                  }}
                >
                  <strong>Benefits:</strong>
                </Typography>
                <ul style={{ color: 'rgba(55, 65, 81, 0.9)', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                  <li>FIPS 140-2 Level 3 compliance</li>
                  <li>Hardware-based random number generation</li>
                  <li>Physical protection of cryptographic keys</li>
                  <li>Acceleration of cryptographic operations</li>
                  <li>Audit logging of all key operations</li>
                </ul>
                
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: 'text.secondary',
                    backgroundColor: 'rgba(191, 219, 254, 0.1)',
                    p: 1.5,
                    borderRadius: '6px',
                    borderLeft: '4px solid',
                    borderColor: 'primary.main'
                  }}
                >
                  <strong>Note:</strong> When HSM is enabled, all cryptographic operations will be routed through the HSM. If the HSM is unavailable, operations will fall back to software-based cryptography using libsodium.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default HsmIntegration;
