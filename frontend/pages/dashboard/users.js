import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Users() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        // In a real implementation, this would call the backend API
        // For now, we'll simulate a successful API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Simulate user data
        const userData = {
          user_id: '123',
          username: 'johndoe',
          email: 'john@example.com',
          role: 'admin', // Must be admin to access this page
          organization_id: 'org123',
          permissions: {
            view_users: true,
            edit_users: true,
            view_organizations: true,
            edit_organizations: true,
          },
        };
        
        // Redirect if not admin
        if (userData.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
        
        setUser(userData);
        
        // Fetch users
        fetchUsers(1, roleFilter, showPendingOnly);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setLoading(false);
        // Redirect to login if authentication fails
        router.push('/login');
      }
    };

    fetchUserData();
  }, [router, roleFilter, showPendingOnly]);

  const fetchUsers = async (page, role = '', pendingOnly = false) => {
    setLoading(true);
    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate a successful API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Simulate users data
      const mockUsers = [
        {
          user_id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          organization_id: null,
          approvalStatus: 'approved',
          isActivated: true,
          created_at: '2023-01-01T00:00:00Z',
        },
        {
          user_id: '2',
          username: 'orgadmin1',
          email: 'orgadmin1@example.com',
          role: 'org_admin',
          organization_id: 'org1',
          approvalStatus: 'approved',
          isActivated: true,
          created_at: '2023-01-02T00:00:00Z',
        },
        {
          user_id: '3',
          username: 'user1',
          email: 'user1@example.com',
          role: 'org_user',
          organization_id: 'org1',
          approvalStatus: 'approved',
          isActivated: true,
          created_at: '2023-01-03T00:00:00Z',
        },
        {
          user_id: '4',
          username: 'user2',
          email: 'user2@example.com',
          role: 'org_user',
          organization_id: 'org2',
          approvalStatus: 'pending',
          isActivated: false,
          created_at: '2023-01-04T00:00:00Z',
        },
        {
          user_id: '5',
          username: 'user3',
          email: 'user3@example.com',
          role: 'org_user',
          organization_id: 'org2',
          approvalStatus: 'rejected',
          isActivated: false,
          created_at: '2023-01-05T00:00:00Z',
        },
      ];
      
      // Apply filters
      let filteredUsers = [...mockUsers];
      
      if (role) {
        filteredUsers = filteredUsers.filter(u => u.role === role);
      }
      
      if (pendingOnly) {
        filteredUsers = filteredUsers.filter(u => u.approvalStatus === 'pending');
      }
      
      // Count pending approvals
      const pendingCount = mockUsers.filter(u => u.approvalStatus === 'pending').length;
      setPendingApprovalCount(pendingCount);
      
      // Pagination
      const totalItems = filteredUsers.length;
      const itemsPerPage = 10;
      const totalPgs = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(totalPgs);
      
      // Get current page items
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      
      setUsers(paginatedUsers);
      setCurrentPage(page);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchUsers(page, roleFilter, showPendingOnly);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleTogglePendingOnly = () => {
    setShowPendingOnly(!showPendingOnly);
  };

  const handleApproveUser = async (userId) => {
    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate a successful API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Update user in the list
      const updatedUsers = users.map(user => {
        if (user.user_id === userId) {
          return { ...user, approvalStatus: 'approved', isActivated: true };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setPendingApprovalCount(prev => prev - 1);
      setSuccess(`User approved successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to approve user. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate a successful API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Update user in the list
      const updatedUsers = users.map(user => {
        if (user.user_id === userId) {
          return { ...user, approvalStatus: 'rejected', isActivated: false };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setPendingApprovalCount(prev => prev - 1);
      setSuccess(`User rejected successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to reject user. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate a successful API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Update user in the list
      const updatedUsers = users.map(user => {
        if (user.user_id === userId) {
          return { ...user, isActivated: true };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setSuccess(`User activated successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to activate user. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeactivateUser = async (userId) => {
    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate a successful API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Update user in the list
      const updatedUsers = users.map(user => {
        if (user.user_id === userId) {
          return { ...user, isActivated: false };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setSuccess(`User deactivated successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to deactivate user. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading && !user) {
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
                <Link href="/dashboard/keys" className="border-transparent text-gray-100 hover:border-gray-100 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Keys
                </Link>
                <Link href="/dashboard/users" className="border-white text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Users
                </Link>
                <Link href="/dashboard/organizations" className="border-transparent text-gray-100 hover:border-gray-100 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Organizations
                </Link>
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
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-900 to-blue-500 bg-clip-text text-transparent">Users</h1>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Link href="/dashboard/users/create" className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-900 to-blue-500 hover:from-indigo-800 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Add User
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 border-l-4 border-red-500 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 border-l-4 border-green-500 rounded">
                  {success}
                </div>
              )}

              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <label htmlFor="role-filter" className="sr-only">Filter by Role</label>
                        <select
                          id="role-filter"
                          name="role-filter"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          value={roleFilter}
                          onChange={handleRoleFilterChange}
                        >
                          <option value="">All Roles</option>
                          <option value="admin">Admin</option>
                          <option value="org_admin">Organization Admin</option>
                          <option value="org_user">Organization User</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="pending-only"
                          name="pending-only"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={showPendingOnly}
                          onChange={handleTogglePendingOnly}
                        />
                        <label htmlFor="pending-only" className="ml-2 block text-sm text-gray-900">
                          Pending Approval Only
                          {pendingApprovalCount > 0 && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {pendingApprovalCount}
                            </span>
                          )}
                        </label>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <span className="text-sm text-gray-500">
                        Showing {users.length} of {totalPages * 10} users
                      </span>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-12 h-12 border-4 border-t-indigo-500 border-gray-200 rounded-full animate-spin"></div>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No users found matching the current filters.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-indigo-900 to-blue-500">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Username
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Role
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr key={user.user_id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {user.username}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.role === 'admin' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : user.role === 'org_admin' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {user.role === 'admin' 
                                    ? 'Admin' 
                                    : user.role === 'org_admin' 
                                    ? 'Org Admin' 
                                    : 'Org User'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {user.approvalStatus === 'pending' ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                      Pending Approval
                                    </span>
                                  ) : user.approvalStatus === 'rejected' ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                      Rejected
                                    </span>
                                  ) : user.isActivated ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      Active
                                    </span>
                                  ) : (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                      Inactive
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <Link href={`/dashboard/users/${user.user_id}`} className="text-indigo-600 hover:text-indigo-900">
                                    View
                                  </Link>
                                  <Link href={`/dashboard/users/${user.user_id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                                    Edit
                                  </Link>
                                  {user.approvalStatus === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleApproveUser(user.user_id)}
                                        className="text-green-600 hover:text-green-900"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleRejectUser(user.user_id)}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {user.approvalStatus === 'approved' && (
                                    user.isActivated ? (
                                      <button
                                        onClick={() => handleDeactivateUser(user.user_id)}
                                        className="text-gray-600 hover:text-gray-900"
                                      >
                                        Deactivate
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleActivateUser(user.user_id)}
                                        className="text-green-600 hover:text-green-900"
                                      >
                                        Activate
                                      </button>
                                    )
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                            currentPage === totalPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                            <span className="font-medium">
                              {Math.min(currentPage * 10, totalPages * 10)}
                            </span>{' '}
                            of <span className="font-medium">{totalPages * 10}</span> results
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                currentPage === 1
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              <span className="sr-only">Previous</span>
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                              <button
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === i + 1
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {i + 1}
                              </button>
                            ))}
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                currentPage === totalPages
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              <span className="sr-only">Next</span>
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
