import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;
  
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        // In a real implementation, this would call the backend API
        // For now, we'll simulate a successful verification
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Simulate API call
        if (token === 'invalid') {
          throw new Error('Invalid or expired token');
        }
        
        setVerificationStatus('success');
      } catch (err) {
        setVerificationStatus('error');
        setError(err.message || 'Verification failed. Please try again.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">QuantumTrust Data Security</h1>
          <p className="mt-2 text-gray-600">Email Verification</p>
        </div>

        <div className="mt-8">
          {verificationStatus === 'verifying' && (
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-t-indigo-500 border-gray-200 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Verifying your email address...</p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">Email Verified Successfully</h2>
              <p className="mt-2 text-gray-600">Your email has been verified. You can now log in to your account.</p>
              <div className="mt-6">
                <Link href="/login" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Go to Login
                </Link>
              </div>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">Verification Failed</h2>
              <p className="mt-2 text-gray-600">{error}</p>
              <div className="mt-6 space-y-4">
                <Link href="/login" className="block text-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Go to Login
                </Link>
                <Link href="/resend-verification" className="block text-center px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Resend Verification Email
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
