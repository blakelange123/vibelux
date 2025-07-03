'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallbackUrl?: string;
}

export default function AdminGuard({ 
  children, 
  requiredRole = 'admin',
  fallbackUrl = '/dashboard'
}: AdminGuardProps) {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!isLoaded) return;
      
      if (!isSignedIn || !userId) {
        router.push('/sign-in');
        return;
      }

      try {
        // Check admin status via API
        const response = await fetch('/api/auth/check-admin');
        const data = await response.json();
        
        if (data.isAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          // Redirect non-admins
          router.push(fallbackUrl);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        router.push(fallbackUrl);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [userId, isLoaded, isSignedIn, router, fallbackUrl]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-300">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-4">Please sign in to access this page</p>
          <button
            onClick={() => router.push('/sign-in')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-gray-300 mb-4">You need administrator privileges to access this page</p>
          <button
            onClick={() => router.push(fallbackUrl)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}