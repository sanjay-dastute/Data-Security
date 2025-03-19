// Mock dashboard data for testing without backend
const mockDashboardData = {
  admin: {
    stats: {
      totalUsers: 42,
      activeUsers: 36,
      totalOrganizations: 5,
      activeKeys: 128,
      encryptedFiles: 1024,
      securityEvents: 3
    },
    recentActivity: [
      { id: 1, action: 'User Created', user: 'admin1', timestamp: new Date().toISOString(), details: 'Created user john.doe@abc.com' },
      { id: 2, action: 'Organization Approved', user: 'admin1', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'Approved organization XYZ Corp' },
      { id: 3, action: 'Security Alert', user: 'system', timestamp: new Date(Date.now() - 7200000).toISOString(), details: 'Unapproved access attempt from 192.168.1.100' }
    ]
  },
  orgAdmin: {
    stats: {
      totalTeamMembers: 18,
      activeTeamMembers: 15,
      activeKeys: 42,
      encryptedFiles: 256,
      pendingApprovals: 2,
      securityEvents: 1
    },
    recentActivity: [
      { id: 1, action: 'User Added', user: 'orgadmin1', timestamp: new Date().toISOString(), details: 'Added user jane.smith@abc.com to team' },
      { id: 2, action: 'Key Generated', user: 'orgadmin1', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'Generated new encryption key for GDPR data' },
      { id: 3, action: 'File Encrypted', user: 'user1', timestamp: new Date(Date.now() - 7200000).toISOString(), details: 'Encrypted customer_data.csv with selective field encryption' }
    ]
  },
  orgUser: {
    stats: {
      activeKeys: 12,
      encryptedFiles: 48,
      pendingApprovals: 1,
      lastLogin: new Date(Date.now() - 86400000).toISOString()
    },
    recentActivity: [
      { id: 1, action: 'File Encrypted', user: 'user1', timestamp: new Date().toISOString(), details: 'Encrypted financial_data.json with GDPR template' },
      { id: 2, action: 'Key Used', user: 'user1', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'Used key KID-123456 for batch encryption' },
      { id: 3, action: 'Profile Updated', user: 'user1', timestamp: new Date(Date.now() - 7200000).toISOString(), details: 'Updated security preferences' }
    ]
  }
};

export default function handler(req, res) {
  // Get token from request header
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // In a real implementation, we would verify the JWT token
  // For testing, we'll extract the user role from the token if possible
  let userRole = 'ADMIN'; // Default to admin for testing
  
  try {
    // Check if token contains role information (our mock tokens don't, but real ones would)
    if (token.includes('admin')) {
      userRole = 'ADMIN';
    } else if (token.includes('orgadmin')) {
      userRole = 'ORG_ADMIN';
    } else if (token.includes('user')) {
      userRole = 'ORG_USER';
    }
    
    // Return dashboard data based on user role
    let dashboardData;
    switch (userRole) {
      case 'ADMIN':
        dashboardData = mockDashboardData.admin;
        break;
      case 'ORG_ADMIN':
        dashboardData = mockDashboardData.orgAdmin;
        break;
      case 'ORG_USER':
        dashboardData = mockDashboardData.orgUser;
        break;
      default:
        return res.status(403).json({ message: 'Forbidden' });
    }
    
    return res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
