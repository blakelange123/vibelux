'use client';

import React, { Suspense, lazy, useEffect, useState } from 'react';

// Temporary stub component
const LazyCanvas3D = ({ showPPFD, showGrid, showFalseColorMap }: any) => (
  <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg border border-gray-800">
    <div className="text-center">
      <div className="text-white mb-2">3D View Temporarily Disabled</div>
      <div className="text-gray-400 text-sm">
        {showPPFD && <div>PPFD Display: ON</div>}
        {showGrid && <div>Grid: ON</div>}
        {showFalseColorMap && <div>False Color Map: ON</div>}
      </div>
    </div>
  </div>
);

interface Safe3DWrapperProps {
  objects: any[];
  roomDimensions: { width: number; length: number; height: number };
  onObjectSelect: (id: string | null) => void;
  selectedObject: string | null;
  showPPFD: boolean;
  showGrid: boolean;
  showFalseColorMap: boolean;
}

export function Safe3DWrapper(props: Safe3DWrapperProps) {
  const [hasError, setHasError] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-white">Initializing 3D view...</div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-center">
          <p className="text-white text-lg mb-2">3D View Error</p>
          <p className="text-gray-400 text-sm mb-4">Falling back to 2.5D isometric view</p>
          <p className="text-gray-500 text-xs mb-4">You can still rotate and zoom the view</p>
          <button
            onClick={() => {
              setHasError(false);
              window.location.reload();
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary onError={() => setHasError(true)}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="text-white">Loading 3D scene...</div>
          </div>
        }
      >
        <LazyCanvas3D {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Component error:', error, errorInfo);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}