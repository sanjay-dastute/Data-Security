import { withIronSessionApiRoute } from 'iron-session';

export default withIronSessionApiRoute(
  async function verifyMfaRoute(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, code } = req.body;
    
    if (!userId || !code) {
      return res.status(400).json({ 
        message: 'User ID and MFA code are required', 
        success: false 
      });
    }
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/auth/verify-mfa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, code }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Set session data
    req.session.user = data.user;
    await req.session.save();

    return res.status(200).json(data);
  } catch (error) {
    console.error('MFA verification error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      success: false 
    });
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
