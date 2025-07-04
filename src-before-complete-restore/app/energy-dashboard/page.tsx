'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { EnergyOptimizationDashboard } from '@/components/EnergyOptimizationDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Settings, ArrowRight, Zap } from 'lucide-react';

export default function EnergyDashboardPage() {
  const { user, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for Clerk to load
    if (!isLoaded) return;
    
    // Check if user has completed energy setup
    const checkEnergySetup = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/energy/facilities');
        if (response.ok) {
          const data = await response.json();
          if (data.facilities && data.facilities.length > 0) {
            // Use the first facility for now
            setFacilityId(data.facilities[0].id);
          } else {
            // For demo purposes, set a default facility ID
            setFacilityId('demo-facility-1');
          }
        } else {
          // For demo purposes, set a default facility ID
          setFacilityId('demo-facility-1');
        }
      } catch (err) {
        // For demo purposes, set a default facility ID
        setFacilityId('demo-facility-1');
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn && user) {
      checkEnergySetup();
    } else {
      // User is not authenticated
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, user]);

  // Wait for Clerk to load
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-gray-400 mb-4">Please sign in to access the energy dashboard</p>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading energy dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !facilityId) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Energy Optimization Dashboard</h1>
            <p className="text-xl text-gray-400">AI-powered energy savings for your cultivation facility</p>
          </div>

          <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-200">
              <strong>Setup Required:</strong> Complete the energy optimization setup to start saving on electricity costs.
            </AlertDescription>
          </Alert>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Get Started with Energy Optimization</CardTitle>
              <CardDescription>
                Connect your control system and start saving up to 30% on energy costs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">How it works:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Connect to your existing control system (Argus, Priva, TrolMaster, etc.)</li>
                  <li>AI monitors real-time grid pricing and demand</li>
                  <li>Automatically adjusts lighting during peak hours</li>
                  <li>Never compromises plant health or photoperiod</li>
                  <li>You only pay 20% of verified savings</li>
                </ul>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={() => router.push('/energy-setup')}
                  className="w-full sm:w-auto"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Complete Energy Setup
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Energy Optimization Dashboard</h1>
                <p className="text-xl text-gray-400">Real-time monitoring and control of your energy savings</p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/energy-setup')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Main Dashboard */}
          <EnergyOptimizationDashboard facilityId={facilityId} />
        </div>
      </div>
    </div>
  );
}