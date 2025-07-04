'use client';

import { getCurrentUserPermissions } from '@/lib/user-permissions';
import { Shield, Lock } from 'lucide-react';

interface PermissionWrapperProps {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
}

export function PermissionWrapper({ children, permission, fallback }: PermissionWrapperProps) {
  const permissions = getCurrentUserPermissions();
  
  if (!(permissions as any)[permission]) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 bg-red-900/30 border border-red-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">Access Restricted</h1>
          
          <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-red-400" />
              <span className="text-red-300 font-medium">Patent Protection Notice</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              This feature has been restricted due to potential patent conflicts with existing 
              agricultural technology patents. Access is limited to authorized administrators only.
            </p>
          </div>
          
          <p className="text-gray-400 text-sm">
            Contact your administrator if you need access to this feature.
          </p>
          
          <div className="mt-6">
            <button 
              onClick={() => window.history.back()} 
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

// Higher-order component for page-level protection
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: keyof ReturnType<typeof getCurrentUserPermissions>
) {
  return function PermissionProtectedComponent(props: P) {
    return (
      <PermissionWrapper permission={permission}>
        <Component {...props} />
      </PermissionWrapper>
    );
  };
}