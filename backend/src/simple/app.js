const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'quantum_trust_secret_key_for_jwt_tokens';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory database for testing
const users = [
  {
    id: '1',
    username: 'admin1',
    email: 'admin@quantumtrust.com',
    password: '$2b$10$X7o4.KI9oC9dXrS.07xFZuLwPbJp/txP/QsUS1QsZ/OsWRKIwwWQe', // Admin@123
    role: 'ADMIN',
    approved_addresses: [{ ip: '127.0.0.1', mac: '00:00:00:00:00:00' }],
    is_activated: true
  },
  {
    id: '2',
    username: 'orgadmin1',
    email: 'orgadmin@quantumtrust.com',
    password: '$2b$10$X7o4.KI9oC9dXrS.07xFZuLwPbJp/txP/QsUS1QsZ/OsWRKIwwWQe', // Org@123
    role: 'ORG_ADMIN',
    organization_id: '1',
    approved_addresses: [{ ip: '127.0.0.1', mac: '00:00:00:00:00:00' }],
    is_activated: true
  },
  {
    id: '3',
    username: 'user1',
    email: 'user@quantumtrust.com',
    password: '$2b$10$X7o4.KI9oC9dXrS.07xFZuLwPbJp/txP/QsUS1QsZ/OsWRKIwwWQe', // User@123
    role: 'ORG_USER',
    organization_id: '1',
    approved_addresses: [{ ip: '127.0.0.1', mac: '00:00:00:00:00:00' }],
    is_activated: true
  }
];

const organizations = [
  {
    id: '1',
    name: 'Test Organization',
    email: 'test@org.com',
    phone: '1234567890'
  }
];

// Authentication routes
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { 
        sub: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        organizationId: user.organization_id
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User routes
app.get('/users/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.sub);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Simple backend server running on http://localhost:${PORT}`);
});
