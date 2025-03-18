// Mock API route for login
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  // Call the mock backend server
  return fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.message === 'Invalid credentials') {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      return res.status(200).json(data);
    })
    .catch(error => {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    });
}
