import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Key as KeyIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Lock as LockIcon
} from '@mui/icons-material';

const KeyRecovery = () => {
  // State for key recovery
  const [activeStep, setActiveStep] = useState(0);
  const [selectedKey, setSelectedKey] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [shards, setShards] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [recoveryResult, setRecoveryResult] = useState(null);
  
  // State for loading and error handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // State for keys
  const [keys, setKeys] = useState([]);
  const [keysLoading, setKeysLoading] = useState(false);
  
  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedShard, setSelectedShard] = useState(null);
  const [requestReason, setRequestReason] = useState('');
  
  // Fetch keys on component mount
  useEffect(() => {
    fetchKeys();
  }, []);
  
  // Fetch keys
  const fetchKeys = async () => {
    try {
      setKeysLoading(true);
      
      const response = await fetch('/api/keys');
      
      if (!response.ok) {
        throw new Error('Failed to fetch keys');
      }
      
      const data = await response.json();
      setKeys(data.filter(key => key.status === 'INACTIVE' || key.status === 'RECOVERY_PENDING'));
      setKeysLoading(false);
    } catch (error) {
      setError(error.message);
      setKeysLoading(false);
    }
  };
  
  // Handle key selection
  const handleKeySelection = (key) => {
    setSelectedKey(key);
    setActiveStep(1);
  };
  
  // Verify MFA
  const verifyMFA = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/verify-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: mfaCode,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify MFA code');
      }
      
      // Fetch key shards
      await fetchKeyShards();
      
      setActiveStep(2);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  
  // Fetch key shards
  const fetchKeyShards = async () => {
    try {
      const response = await fetch(`/api/key-recovery/shards/${selectedKey.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch key shards');
      }
      
      const data = await response.json();
      setShards(data.shards);
      
      // Fetch shard approvals
      await fetchShardApprovals();
    } catch (error) {
      setError(error.message);
    }
  };
  
  // Fetch shard approvals
  const fetchShardApprovals = async () => {
    try {
      const response = await fetch(`/api/key-recovery/approvals/${selectedKey.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch shard approvals');
      }
      
      const data = await response.json();
      setApprovals(data.approvals);
    } catch (error) {
      setError(error.message);
    }
  };
  
  // Open request dialog
  const openRequestDialog = (shard) => {
    setSelectedShard(shard);
    setDialogOpen(true);
  };
  
  // Close request dialog
  const closeRequestDialog = () => {
    setDialogOpen(false);
    setSelectedShard(null);
    setRequestReason('');
  };
  
  // Request shard approval
  const requestShardApproval = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/key-recovery/request/${selectedKey.id}/${selectedShard.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestReason,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to request shard approval');
      }
      
      const data = await response.json();
      setSuccess(`Approval request sent to ${selectedShard.holder_name}`);
      
      // Close dialog
      closeRequestDialog();
      
      // Refresh shard approvals
      await fetchShardApprovals();
      
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  
  // Recover key
  const recoverKey = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/key-recovery/recover/${selectedKey.id}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to recover key');
      }
      
      const data = await response.json();
      setRecoveryResult(data);
      setActiveStep(3);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  
  // Check if enough shards are approved
  const hasEnoughApprovals = () => {
    if (!approvals || !shards) return false;
    
    const approvedCount = approvals.filter(approval => approval.approved).length;
    const threshold = selectedKey?.threshold || Math.ceil(shards.length / 2);
    
    return approvedCount >= threshold;
  };
  
  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Key to Recover
            </Typography>
            
            {keysLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : keys.length === 0 ? (
              <Alert severity="info">No keys available for recovery.</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Key Name</TableCell>
                      <TableCell>Created By</TableCell>
                      <TableCell>Created At</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {keys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell>{key.name}</TableCell>
                        <TableCell>{key.created_by}</TableCell>
                        <TableCell>{new Date(key.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={key.status}
                            color={key.status === 'ACTIVE' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleKeySelection(key)}
                          >
                            Recover
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Verify Identity
            </Typography>
            
            <Typography variant="body1" paragraph>
              Please enter your MFA code to verify your identity before proceeding with key recovery.
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="MFA Code"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  margin="normal"
                  placeholder="Enter 6-digit code"
                  inputProps={{ maxLength: 6 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={verifyMFA}
                  disabled={loading || mfaCode.length !== 6}
                >
                  {loading ? <CircularProgress size={24} /> : 'Verify'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Request Shard Approvals
            </Typography>
            
            <Typography variant="body1" paragraph>
              The key has been split into multiple shards. You need approvals from at least {selectedKey?.threshold || Math.ceil(shards.length / 2)} shard holders to recover the key.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Shard Holders
              </Typography>
              
              <Button
                startIcon={<RefreshIcon />}
                onClick={fetchShardApprovals}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
            
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Holder Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shards.map((shard, index) => {
                    const approval = approvals.find(a => a.id === shard.id);
                    
                    return (
                      <TableRow key={shard.id}>
                        <TableCell>{shard.holder_name}</TableCell>
                        <TableCell>{shard.holder_email}</TableCell>
                        <TableCell>
                          {approval ? (
                            <Chip
                              label={approval.approved ? 'Approved' : 'Requested'}
                              color={approval.approved ? 'success' : 'warning'}
                              size="small"
                            />
                          ) : (
                            <Chip
                              label="Not Requested"
                              color="default"
                              size="small"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => openRequestDialog(shard)}
                            disabled={approval?.approved}
                            startIcon={<EmailIcon />}
                          >
                            {approval ? 'Re-request' : 'Request'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">
                {approvals.filter(a => a.approved).length} of {selectedKey?.threshold || Math.ceil(shards.length / 2)} required approvals received.
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                onClick={recoverKey}
                disabled={loading || !hasEnoughApprovals()}
                startIcon={<LockIcon />}
              >
                {loading ? <CircularProgress size={24} /> : 'Recover Key'}
              </Button>
            </Box>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Recovery Complete
            </Typography>
            
            {recoveryResult ? (
              <>
                <Alert severity="success" sx={{ mb: 3 }}>
                  {recoveryResult.message}
                </Alert>
                
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Key Details
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Key ID:</strong> {recoveryResult.id}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Name:</strong> {recoveryResult.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Created By:</strong> {recoveryResult.created_by}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Created At:</strong> {new Date(recoveryResult.created_at).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Status:</strong>{' '}
                        <Chip
                          label={recoveryResult.status}
                          color={recoveryResult.status === 'ACTIVE' ? 'success' : 'warning'}
                          size="small"
                        />
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </>
            ) : (
              <Alert severity="info">No recovery result available.</Alert>
            )}
          </Box>
        );
      default:
        return 'Unknown step';
    }
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
        Key Recovery
      </Typography>
      <Typography 
        variant="body1" 
        paragraph
        sx={{ 
          color: 'text.secondary',
          mb: 2
        }}
      >
        Recover encryption keys using Shamir's Secret Sharing with distributed key shards.
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
            <Stepper 
              activeStep={activeStep} 
              sx={{ 
                mb: 3,
                '& .MuiStepLabel-root .Mui-active': {
                  color: 'primary.main',
                },
                '& .MuiStepLabel-root .Mui-completed': {
                  color: 'primary.dark',
                }
              }}
            >
              <Step>
                <StepLabel>Select Key</StepLabel>
              </Step>
              <Step>
                <StepLabel>Verify Identity</StepLabel>
              </Step>
              <Step>
                <StepLabel>Request Approvals</StepLabel>
              </Step>
              <Step>
                <StepLabel>Complete Recovery</StepLabel>
              </Step>
            </Stepper>
            
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                disabled={activeStep === 0 || activeStep === 3}
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
                Back
              </Button>
              
              {activeStep === 3 && (
                <Button
                  variant="contained"
                  onClick={() => {
                    setActiveStep(0);
                    setSelectedKey(null);
                    setMfaCode('');
                    setShards([]);
                    setApprovals([]);
                    setRecoveryResult(null);
                    fetchKeys();
                  }}
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
                  Start New Recovery
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
                Key Recovery Process
              </Typography>
              
              <Typography 
                variant="body2" 
                paragraph
                sx={{ color: 'text.secondary', mb: 2 }}
              >
                Shamir's Secret Sharing is used to split encryption keys into multiple shards, requiring a threshold of approvals to recover.
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
                    <KeyIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Select an inactive key to recover" 
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
                    primary="Verify your identity with MFA" 
                    primaryTypographyProps={{ 
                      sx: { color: 'text.primary' } 
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PeopleIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Request approvals from shard holders" 
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
                    primary="Combine shards to recover the key" 
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
                Security Features:
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Multi-factor authentication" 
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
                    primary="Distributed trust model" 
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
                    primary="Threshold cryptography" 
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
                    primary="Blockchain-based audit logging" 
                    primaryTypographyProps={{ 
                      sx: { color: 'text.primary' } 
                    }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            mt: 2,
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
                Threshold Cryptography
              </Typography>
              
              <Typography 
                variant="body2" 
                paragraph
                sx={{ color: 'text.secondary', mb: 2 }}
              >
                The key recovery process uses a mathematical threshold scheme where:
              </Typography>
              
              <Box sx={{ pl: 2, mb: 2, borderLeft: '2px solid', borderColor: 'primary.light' }}>
                <Typography 
                  variant="body2" 
                  paragraph
                  sx={{ mb: 1 }}
                >
                  • A key is split into <strong>n</strong> shards
                </Typography>
                <Typography 
                  variant="body2" 
                  paragraph
                  sx={{ mb: 1 }}
                >
                  • At least <strong>t</strong> shards are needed to recover the key
                </Typography>
                <Typography 
                  variant="body2" 
                  paragraph
                  sx={{ mb: 0 }}
                >
                  • Fewer than <strong>t</strong> shards reveal no information about the key
                </Typography>
              </Box>
              
              <Typography 
                variant="body2"
                sx={{ color: 'text.secondary' }}
              >
                This ensures that no single person can compromise the key, while still allowing recovery if some shard holders are unavailable.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Dialog open={dialogOpen} onClose={closeRequestDialog}>
        <DialogTitle>Request Shard Approval</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            You are requesting approval from <strong>{selectedShard?.holder_name}</strong> ({selectedShard?.holder_email}).
          </Typography>
          
          <TextField
            fullWidth
            label="Request Reason"
            value={requestReason}
            onChange={(e) => setRequestReason(e.target.value)}
            margin="normal"
            multiline
            rows={4}
            placeholder="Explain why you need to recover this key..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRequestDialog}>Cancel</Button>
          <Button
            onClick={requestShardApproval}
            color="primary"
            disabled={loading || !requestReason}
          >
            {loading ? <CircularProgress size={24} /> : 'Send Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KeyRecovery;
