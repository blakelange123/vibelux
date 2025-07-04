'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, LogOut, Shield } from 'lucide-react';

export function ImpersonationBanner() {
  const [impersonation, setImpersonation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkImpersonation();
  }, []);

  async function checkImpersonation() {
    try {
      const response = await fetch('/api/admin/impersonation/status');
      
      // Only try to parse JSON if the response is OK
      if (response.ok) {
        const data = await response.json();
        
        if (data.isImpersonating) {
          setImpersonation(data);
        }
      }
      // If not OK (404, 403, etc), just ignore silently
    } catch (error) {
      // Silently ignore errors - this is an admin feature that regular users don't need
      // console.error('Error checking impersonation:', error);
    } finally {
      setLoading(false);
    }
  }

  async function endImpersonation() {
    if (!confirm('End impersonation session?')) return;
    
    try {
      const response = await fetch('/api/admin/impersonation/end', {
        method: 'POST'
      });
      
      if (response.ok) {
        window.location.href = '/admin';
      }
    } catch (error) {
      console.error('Error ending impersonation:', error);
    }
  }

  if (loading || !impersonation) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">ADMIN MODE</span>
            </div>
            <AlertTriangle className="w-5 h-5" />
            <div>
              <div className="font-medium">Impersonating: {impersonation.targetEmail}</div>
              <div className="text-xs opacity-80">
                All actions are being logged for security purposes
              </div>
            </div>
          </div>
          
          <button
            onClick={endImpersonation}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}