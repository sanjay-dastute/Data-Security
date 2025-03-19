import { withIronSessionApiRoute } from 'iron-session';

export default withIronSessionApiRoute(
  async function profileRoute(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${req.session.user.token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
},
{
  cookieName: 'quantumtrust_session',
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  },
});
