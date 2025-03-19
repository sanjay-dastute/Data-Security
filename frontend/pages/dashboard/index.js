import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
        // In production, this would call the backend API
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
        
        setUser(userData);
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
                <Link href="/dashboard" className="border-white text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/dashboard/files" className="border-transparent text-gray-100 hover:border-gray-100 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Files
                </Link>
                <Link href="/dashboard/keys" className="border-transparent text-gray-100 hover:border-gray-100 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Keys
                </Link>
                {user.role === 'admin' && (
                  <>
                    <Link href="/dashboard/users" className="border-transparent text-gray-100 hover:border-gray-100 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Users
                    </Link>
                    <Link href="/dashboard/organizations" className="border-transparent text-gray-100 hover:border-gray-100 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Organizations
                    </Link>
                  </>
                )}
                {user.role === 'org_admin' && (
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-900 to-blue-500 bg-clip-text text-transparent">Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="bg-white overflow-hidden shadow rounded-lg relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-900 to-blue-500"></div>
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-gradient-to-r from-indigo-900 to-blue-500 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Welcome
                            </dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">
                                {user.details.name || user.username}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <Link href="/dashboard/profile" className="font-medium text-blue-600 hover:text-blue-500">
                          View profile
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-900 to-blue-500"></div>
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-gradient-to-r from-indigo-900 to-blue-500 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Files
                            </dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">
                                0
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <Link href="/dashboard/files" className="font-medium text-blue-600 hover:text-blue-500">
                          Manage files
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-900 to-blue-500"></div>
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-gradient-to-r from-indigo-900 to-blue-500 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Keys
                            </dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">
                                0
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <Link href="/dashboard/keys" className="font-medium text-blue-600 hover:text-blue-500">
                          Manage keys
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
