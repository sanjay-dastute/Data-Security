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
      <Typography variant="h5" gutterBottom>
        Hardware Security Module (HSM) Integration
      </Typography>
      <Typography variant="body1" paragraph>
        Configure HSM integration for enhanced security in key management and cryptographic operations.
        HSM provides hardware-based, FIPS 140-2 compliant key storage and operations.
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={hsmConfig.enabled}
                      onChange={(e) => handleInputChange('enabled', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Enable HSM Integration"
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
                  
                  <Typography variant="h6" gutterBottom>
                    HSM Usage Configuration
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={hsmConfig.useForKeyGeneration}
                            onChange={(e) => handleInputChange('useForKeyGeneration', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Use for Key Generation"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={hsmConfig.useForEncryption}
                            onChange={(e) => handleInputChange('useForEncryption', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Use for Encryption"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={hsmConfig.useForDecryption}
                            onChange={(e) => handleInputChange('useForDecryption', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Use for Decryption"
                      />
                    </Grid>
                  </Grid>
                </>
              )}
              
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={saveHsmConfig}
                  disabled={saveLoading}
                >
                  {saveLoading ? 'Saving...' : 'Save Configuration'}
                </Button>
                
                {hsmConfig.enabled && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={testHsmConnection}
                    disabled={testLoading}
                  >
                    {testLoading ? 'Testing...' : 'Test Connection'}
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  HSM Status
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={hsmConfig.enabled ? 'Enabled' : 'Disabled'}
                    color={hsmConfig.enabled ? 'success' : 'default'}
                    icon={hsmConfig.enabled ? <CheckIcon /> : <WarningIcon />}
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
                    <Alert severity={testResult.success ? 'success' : 'error'}>
                      {testResult.message}
                    </Alert>
                    
                    {testResult.success && testResult.details && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          <strong>Firmware Version:</strong> {testResult.details.firmwareVersion || 'N/A'}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Serial Number:</strong> {testResult.details.serialNumber || 'N/A'}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Available Slots:</strong> {testResult.details.availableSlots || 'N/A'}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
            
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  HSM Information
                </Typography>
                
                <Typography variant="body2" paragraph>
                  Hardware Security Modules (HSMs) provide secure key storage and cryptographic operations in a tamper-resistant hardware device.
                </Typography>
                
                <Typography variant="body2" paragraph>
                  <strong>Benefits:</strong>
                </Typography>
                <ul>
                  <li>FIPS 140-2 Level 3 compliance</li>
                  <li>Hardware-based random number generation</li>
                  <li>Physical protection of cryptographic keys</li>
                  <li>Acceleration of cryptographic operations</li>
                  <li>Audit logging of all key operations</li>
                </ul>
                
                <Typography variant="body2">
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
