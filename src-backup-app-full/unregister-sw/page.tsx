'use client';

import { useEffect, useState } from 'react';

export default function UnregisterSW() {
  const [status, setStatus] = useState('Checking...');
  
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        setStatus(`Found ${registrations.length} service worker(s)`);
        for(const registration of registrations) {
          registration.unregister().then(function(success) {
            if (success) {
              setStatus(prev => prev + '\nUnregistered successfully!');
            }
          });
        }
        if (registrations.length === 0) {
          setStatus('No service workers found');
        }
      });
    } else {
      setStatus('Service workers not supported');
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Service Worker Manager</h1>
      <pre className="bg-gray-800 p-4 rounded">{status}</pre>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-blue-600 rounded"
      >
        Reload Page
      </button>
    </div>
  );
}