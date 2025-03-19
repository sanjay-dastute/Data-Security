import { withIronSessionApiRoute } from 'iron-session';

export default withIronSessionApiRoute(
  async function loginRoute(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
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
    console.error('Login error:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Internal server error';
    return res.status(status).json({ message, success: false });
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
