import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DemoDisclaimerProps {
  feature: string;
  variant?: 'inline' | 'banner' | 'dialog';
  severity?: 'info' | 'warning';
  showDetails?: boolean;
}

export function DemoDisclaimer({ 
  feature, 
  variant = 'inline', 
  severity = 'info',
  showDetails = true 
}: DemoDisclaimerProps) {
  const Icon = severity === 'warning' ? AlertTriangle : InfoIcon;
  
  const detailsContent = (
    <div className="space-y-3 text-sm">
      <p>
        This {feature} feature is currently showing simulated data for demonstration purposes.
      </p>
      <div className="space-y-2">
        <p className="font-semibold">In production, this feature will:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Connect to real hardware devices and sensors</li>
          <li>Process actual data from your facilities</li>
          <li>Provide real-time monitoring and control</li>
          <li>Generate reports based on actual measurements</li>
        </ul>
      </div>
      <p className="text-muted-foreground">
        Contact our sales team to learn more about deploying this feature in your facility.
      </p>
    </div>
  );

  if (variant === 'banner') {
    return (
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Demo Mode Active</p>
              <p className="text-sm text-blue-700">
                You're viewing simulated {feature} data. Real data will be available after hardware installation.
              </p>
            </div>
          </div>
          {showDetails && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Learn More</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>About Demo Mode</DialogTitle>
                  <DialogDescription>
                    Understanding simulated vs. production features
                  </DialogDescription>
                </DialogHeader>
                {detailsContent}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'dialog') {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1">
            <InfoIcon className="h-3 w-3" />
            Demo Mode
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demo Mode: {feature}</DialogTitle>
          </DialogHeader>
          {detailsContent}
        </DialogContent>
      </Dialog>
    );
  }

  // Default inline variant
  return (
    <Alert className={severity === 'warning' ? 'border-yellow-200 bg-yellow-50' : ''}>
      <Icon className="h-4 w-4" />
      <AlertTitle>Demo Mode</AlertTitle>
      <AlertDescription>
        {showDetails ? (
          detailsContent
        ) : (
          <p>
            This {feature} is showing simulated data. 
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="px-1 h-auto font-normal">
                  Learn more
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>About Demo Mode</DialogTitle>
                </DialogHeader>
                {detailsContent}
              </DialogContent>
            </Dialog>
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Specialized disclaimer for financial features
export function FinancialDemoDisclaimer() {
  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle>Important: Demo Financial Data</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          All financial figures, invoices, and payment information shown are simulated examples.
        </p>
        <p className="text-sm">
          In production, this system integrates with real payment processors (Stripe) and generates 
          actual invoices based on verified utility data and energy savings.
        </p>
      </AlertDescription>
    </Alert>
  );
}

// Specialized disclaimer for IoT/Hardware features
export function HardwareDemoDisclaimer() {
  return (
    <Alert>
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>Simulated Hardware Data</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          Device readings and sensor data shown are simulated for demonstration.
        </p>
        <p className="text-sm">
          Once VibeLux hardware is installed at your facility, you'll see real-time data from your 
          actual sensors, controllers, and IoT devices.
        </p>
      </AlertDescription>
    </Alert>
  );
}

// Hook to check if feature is in demo mode
export function useDemoMode() {
  // In production, this would check actual system state
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || true; // Default to true for now
  
  return {
    isDemoMode,
    showDemoDisclaimer: (feature: string) => isDemoMode,
  };
}