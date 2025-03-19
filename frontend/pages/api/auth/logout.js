import { withIronSessionApiRoute } from 'iron-session';

export default withIronSessionApiRoute(
  function logoutRoute(req, res) {
    req.session.destroy();
    res.status(200).json({ message: 'Logged out successfully' });
  },
  {
    cookieName: 'quantumtrust_session',
    password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    },
  },
);
