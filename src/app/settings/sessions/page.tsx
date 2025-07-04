'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  AlertTriangle,
  LogOut,
  Shield,
  Activity,
  X
} from 'lucide-react';

interface Session {
  sessionId: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent?: boolean;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/settings/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    setTerminatingSession(sessionId);
    try {
      const response = await fetch(`/api/settings/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSessions(sessions.filter(s => s.sessionId !== sessionId));
      }
    } catch (error) {
      console.error('Failed to terminate session:', error);
    } finally {
      setTerminatingSession(null);
    }
  };

  const terminateAllOtherSessions = async () => {
    try {
      const response = await fetch('/api/settings/sessions/terminate-others', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        fetchSessions(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to terminate sessions:', error);
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="w-5 h-5" />;
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  const getDeviceInfo = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    let device = 'Unknown Device';
    let browser = 'Unknown Browser';

    // Detect device
    if (ua.includes('iphone')) device = 'iPhone';
    else if (ua.includes('ipad')) device = 'iPad';
    else if (ua.includes('android')) device = 'Android';
    else if (ua.includes('windows')) device = 'Windows PC';
    else if (ua.includes('mac')) device = 'Mac';
    else if (ua.includes('linux')) device = 'Linux';

    // Detect browser
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';

    return `${device} • ${browser}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Active Sessions</h1>
        <p className="text-gray-600 mt-2">Manage your active login sessions across all devices</p>
      </div>

      {/* Security Alert */}
      {sessions.length > 3 && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            You have {sessions.length} active sessions. For security, consider terminating unused sessions.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Security Actions</CardTitle>
          <CardDescription>Manage all your sessions at once</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              variant="destructive"
              onClick={terminateAllOtherSessions}
              disabled={sessions.length <= 1}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out Everywhere Else
            </Button>
            <Button variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Enable Two-Factor Authentication
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <Card 
            key={session.sessionId}
            className={session.isCurrent ? 'border-green-500' : ''}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    {getDeviceIcon(session.userAgent)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{getDeviceInfo(session.userAgent)}</h3>
                      {session.isCurrent && (
                        <Badge className="bg-green-100 text-green-800">Current Session</Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{session.location || session.ipAddress}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Last active: {formatDate(session.lastActiveAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        <span>First login: {formatDate(session.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => terminateSession(session.sessionId)}
                    disabled={terminatingSession === session.sessionId}
                  >
                    {terminatingSession === session.sessionId ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Session Limits Info */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>Session Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Your subscription tier determines how many concurrent sessions you can have:
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Free:</span> 1 session
            </div>
            <div>
              <span className="font-medium">Hobbyist:</span> 2 sessions
            </div>
            <div>
              <span className="font-medium">Grower:</span> 3 sessions
            </div>
            <div>
              <span className="font-medium">Professional:</span> 5 sessions
            </div>
            <div>
              <span className="font-medium">Enterprise:</span> 10 sessions
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}