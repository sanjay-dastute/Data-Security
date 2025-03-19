import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function KeysDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState([]);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        // For testing purposes, we'll use the stored user data
        const userData = JSON.parse(storedUser);
        
        // Add some mock details for display
        if (!userData.details) {
          userData.details = {
            name: userData.username,
            phone: '123-456-7890',
            address: '123 Main St',
            department: 'Security'
          };
        }
        
        // Mock key data for display
        const mockKeys = [
          { id: '1', name: 'Customer Data Key', algorithm: 'AES-256-GCM', created: '2025-03-15', expires: '2025-06-15', status: 'active' },
          { id: '2', name: 'Financial Reports Key', algorithm: 'ChaCha20-Poly1305', created: '2025-03-10', expires: '2025-06-10', status: 'active' },
          { id: '3', name: 'Employee Records Key', algorithm: 'AES-256-GCM', created: '2025-02-28', expires: '2025-05-28', status: 'active' }
        ];
        
        setUser(userData);
        setKeys(mockKeys);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setLoading(false);
        // Redirect to login if authentication fails
        router.push('/login');
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-t-indigo-500 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gradient-to-r from-indigo-900 to-blue-500 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-white">QuantumTrust</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/dashboard" className="border-transparent text-gray-100 hover:border-gray-100 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/dashboard/files" className="border-transparent text-gray-100 hover:border-gray-100 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Files
                </Link>
                <Link href="/dashboard/keys" className="border-white text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Keys
                </Link>
                {user.role === 'ADMIN' && (
                  <>
                    <Link href="/dashboard/users" className="border-transparent text-gray-100 hover:border-gray-100 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Users
                    </Link>
                    <Link href="/dashboard/organizations" className="border-transparent text-gray-100 hover:border-gray-100 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Organizations
                    </Link>
                  </>
                )}
                {user.role === 'ORG_ADMIN' && (
                  <Link href={`/dashboard/org/${user.organization_id}/users`} className="border-transparent text-gray-100 hover:border-gray-100 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Organization Users
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard/profile" className="text-gray-100 hover:text-white">
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      router.push('/login');
                    }}
                    className="text-gray-100 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-900 to-blue-500 bg-clip-text text-transparent">Key Management</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg leading-6 font-medium text-gray-900">Encryption Keys</h2>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your quantum-resistant encryption keys.</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-900 to-blue-500 hover:from-indigo-800 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Generate New Key
                  </button>
                </div>
                <div className="border-t border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Algorithm
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expires
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {keys.length > 0 ? (
                        keys.map((key) => (
                          <tr key={key.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{key.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{key.algorithm}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {key.created}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {key.expires}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {key.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <a href="#" className="text-indigo-600 hover:text-indigo-900 mr-4">Rotate</a>
                              <a href="#" className="text-red-600 hover:text-red-900">Revoke</a>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                            No keys found. Generate a key to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
