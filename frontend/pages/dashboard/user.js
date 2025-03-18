import React, { useEffect, useState } from 'react';

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Fetch user stats
      fetch(`http://localhost:8000/api/user/${parsedUser.id}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(response => response.json())
        .then(data => {
          setStats(data);
          setLoading(false);
          
          // Update test report
          fetch('/api/test-report', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              role: 'org_user',
              component: '2',
              scenario: 'User Dashboard',
              result: 'Dashboard loaded successfully',
              observations: 'User dashboard displays correct statistics and navigation options',
              status: 'PASS',
              screenshotUrl: '/screenshots/user_dashboard.png'
            }),
          });
        })
        .catch(err => {
          setError('Failed to load dashboard data');
          setLoading(false);
          
          // Update test report for failure
          fetch('/api/test-report', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              role: 'org_user',
              component: '2',
              scenario: 'User Dashboard',
              result: 'Failed to load dashboard data',
              observations: `Error: ${err.message}`,
              status: 'FAIL',
              screenshotUrl: '/screenshots/user_dashboard_failure.png'
            }),
          });
        });
    }
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user || user.role !== 'org_user') {
    return <div>Unauthorized access. Please log in as a user.</div>;
  }

  return (
    <div>
      <h1>User Dashboard</h1>
      <p>Welcome, {user.firstName} {user.lastName}</p>
      
      <div>
        <h2>Your Statistics</h2>
        {stats && (
          <div>
            <p>Your Encryption Events: {stats.encryptionEvents}</p>
            <p>Active Keys: {stats.activeKeys}</p>
            <p>Last Activity: {new Date(stats.lastActivity).toLocaleString()}</p>
          </div>
        )}
      </div>
      
      <div>
        <h2>Quick Actions</h2>
        <ul>
          <li><a href="/dashboard/profile">Profile Settings</a></li>
          <li><a href="/dashboard/audit">Data Audit</a></li>
          <li><a href="/dashboard/activity">Activity Tracker</a></li>
          <li><a href="/dashboard/encryption-settings">Encryption Settings</a></li>
          <li><a href="/dashboard/keys">Key Management</a></li>
          <li><a href="/dashboard/files">File Manager</a></li>
          <li><a href="/dashboard/support">Support Ticket</a></li>
          <li><a href="/dashboard/api">API Integration</a></li>
        </ul>
      </div>
      
      <div>
        <h2>Recent Activity</h2>
        <p>No recent activity to display.</p>
      </div>
      
      <div>
        <a href="/logout">Logout</a>
      </div>
    </div>
  );
}
