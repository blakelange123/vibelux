import React from 'react';

interface ResponsiveLayoutWrapperProps {
  children: React.ReactNode;
}

const ResponsiveLayoutWrapper: React.FC<ResponsiveLayoutWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {children}
    </div>
  );
};

export default ResponsiveLayoutWrapper;