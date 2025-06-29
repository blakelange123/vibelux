'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  StopCircle, 
  RefreshCw,
  Shield,
  Activity,
  CheckCircle
} from 'lucide-react';

interface EmergencyStatus {
  active: boolean;
  lastHeartbeat: string;
  heartbeatAge: number;
  watchdogTimeout: number;
}

export default function EmergencyStopButton() {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<EmergencyStatus | null>(null);

  // Poll emergency status
  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/emergency-stop/status');
        const data = await response.json();
        setStatus(data);
        setIsEmergencyActive(data.active);
      } catch (error) {
        console.error('Failed to check emergency status:', error);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const triggerEmergencyStop = async () => {
    if (!confirm('⚠️ EMERGENCY STOP will immediately restore ALL lighting to 100%. This action cannot be undone. Continue?')) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/emergency-stop/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Manual trigger from dashboard'
        })
      });

      if (response.ok) {
        setIsEmergencyActive(true);
        alert('✅ Emergency stop activated - all lighting restored to 100%');
      } else {
        throw new Error('Failed to trigger emergency stop');
      }
    } catch (error) {
      console.error('Emergency stop failed:', error);
      alert('❌ Failed to trigger emergency stop. Check system logs.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetEmergencyStop = async () => {
    if (!resetCode.match(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/)) {
      alert('Invalid reset code format. Use: XXXX-XXXX-XXXX');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/emergency-stop/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetCode,
          reason: 'Manual reset from dashboard'
        })
      });

      if (response.ok) {
        setIsEmergencyActive(false);
        setShowResetDialog(false);
        setResetCode('');
        alert('✅ Emergency stop reset - optimizations will resume in 5 minutes');
      } else {
        throw new Error('Failed to reset emergency stop');
      }
    } catch (error) {
      console.error('Reset failed:', error);
      alert('❌ Failed to reset emergency stop. Check reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const heartbeatHealthy = status && status.heartbeatAge < 10000; // Less than 10 seconds

  return (
    <>
      {/* Main Emergency Button */}
      <Card className={`${isEmergencyActive ? 'border-red-500 animate-pulse' : 'border-gray-700'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className={`w-5 h-5 ${isEmergencyActive ? 'text-red-400' : 'text-green-400'}`} />
              Emergency Stop System
            </CardTitle>
            <div className="flex items-center gap-2">
              <Activity 
                className={`w-4 h-4 ${heartbeatHealthy ? 'text-green-400' : 'text-red-400'} ${heartbeatHealthy ? 'animate-pulse' : ''}`} 
              />
              <span className="text-xs text-gray-500">
                {heartbeatHealthy ? 'Active' : 'Check System'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEmergencyActive ? (
            <div className="space-y-4">
              <Alert className="border-red-500 bg-red-900/20">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <AlertDescription>
                  <strong>EMERGENCY STOP ACTIVE</strong><br />
                  All lighting has been restored to 100% intensity.
                  Energy optimization is disabled.
                </AlertDescription>
              </Alert>
              
              <Button
                variant="outline"
                className="w-full border-orange-600 text-orange-400 hover:bg-orange-900/20"
                onClick={() => setShowResetDialog(true)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Emergency Stop
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-400">
                System operating normally. Press the button below in case of emergency
                to immediately restore all lighting to 100%.
              </div>
              
              <Button
                variant="destructive"
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={triggerEmergencyStop}
                disabled={isLoading}
              >
                <StopCircle className="w-5 h-5 mr-2" />
                {isLoading ? 'Triggering...' : 'EMERGENCY STOP'}
              </Button>
              
              {status && (
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Last heartbeat: {new Date(status.lastHeartbeat).toLocaleTimeString()}</div>
                  <div>Watchdog timeout: {status.watchdogTimeout / 1000}s</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reset Dialog */}
      {showResetDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Reset Emergency Stop</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Resetting the emergency stop will allow the optimization system to resume
                  after a 5-minute safety delay. Ensure all issues have been resolved.
                </AlertDescription>
              </Alert>
              
              <div>
                <label className="text-sm font-medium">Reset Code</label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX-XXXX"
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Contact system administrator for reset code
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowResetDialog(false);
                    setResetCode('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  onClick={resetEmergencyStop}
                  disabled={isLoading || !resetCode}
                >
                  {isLoading ? 'Resetting...' : 'Reset System'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}