'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const pathname = usePathname();
  
  // Don't show breadcrumbs on home, sign in, or sign up pages
  if (pathname === '/' || pathname === '/sign-in' || pathname === '/sign-up') {
    return null;
  }
  
  // Parse the pathname into segments
  const segments = pathname.split('/').filter(Boolean);
  
  // Create breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`;
    const isLast = index === segments.length - 1;
    
    // Convert segment to readable label
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return {
      label,
      path,
      isLast
    };
  });
  
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm">
        {/* Home link */}
        <li>
          <Link 
            href="/dashboard" 
            className="text-gray-500 hover:text-purple-600 transition-colors flex items-center"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>
        
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
            {crumb.isLast ? (
              <span className="text-gray-800 font-medium">{crumb.label}</span>
            ) : (
              <Link 
                href={crumb.path}
                className="text-gray-500 hover:text-purple-600 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}