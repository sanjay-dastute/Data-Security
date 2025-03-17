import { useRouter } from 'next/router';
import Link from 'next/link';

export default function VerificationPending() {
  const router = useRouter();
  const { email } = router.query;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">QuantumTrust Data Security</h1>
          <p className="mt-2 text-gray-600">Verification Pending</p>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Check Your Email</h2>
          <p className="mt-2 text-gray-600">
            We've sent a verification email to <strong>{email}</strong>. Please check your inbox and follow the instructions to verify your account.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            After verifying your email, your account will need to be approved by an administrator before you can log in.
          </p>
          <div className="mt-6 space-y-4">
            <Link href="/login" className="block text-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Go to Login
            </Link>
            <Link href="/resend-verification" className="block text-center px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Resend Verification Email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
