'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  Download,
  Calendar,
  DollarSign,
  FileText,
  Mail,
  ArrowRight,
  Home,
  BarChart3,
  Clock,
  Users,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from '@/components/ui/animated-card';

export default function InvestmentConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const investmentAmount = Number(searchParams.get('amount')) || 50000;
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti animation
    if (!showConfetti) {
      setShowConfetti(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6']
      });
    }
  }, [showConfetti]);

  // Mock investment details
  const investmentDetails = {
    confirmationNumber: `INV-${Date.now().toString().slice(-8)}`,
    facilityName: 'AeroGreen Technologies',
    location: 'Columbus, OH',
    investmentType: 'GaaS',
    amount: investmentAmount,
    platformFee: investmentAmount * 0.01,
    totalAmount: investmentAmount * 1.01,
    estimatedFirstDistribution: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    projectedAnnualReturn: investmentAmount * 0.22,
    investmentDate: new Date()
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Investment Successful!</h1>
        <p className="text-muted-foreground">
          Confirmation #: <span className="font-mono font-semibold">{investmentDetails.confirmationNumber}</span>
        </p>
      </div>

      {/* Main Confirmation Card */}
      <AnimatedCard className="mb-6">
        <AnimatedCardHeader>
          <AnimatedCardTitle>Investment Details</AnimatedCardTitle>
          <CardDescription>
            Your investment in {investmentDetails.facilityName} has been successfully processed
          </CardDescription>
        </AnimatedCardHeader>
        <AnimatedCardContent className="space-y-6">
          {/* Investment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Facility Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Facility Name</span>
                  <span className="font-medium">{investmentDetails.facilityName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{investmentDetails.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investment Type</span>
                  <span className="font-medium">{investmentDetails.investmentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investment Date</span>
                  <span className="font-medium">{investmentDetails.investmentDate.toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Financial Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investment Amount</span>
                  <span className="font-medium">${investmentDetails.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="font-medium">${investmentDetails.platformFee.toLocaleString()}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span>${investmentDetails.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Projected Returns */}
          <div>
            <h4 className="font-semibold mb-3">Projected Returns</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">${(investmentDetails.projectedAnnualReturn / 12).toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Est. Monthly Distribution</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <BarChart3 className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">22%</p>
                <p className="text-xs text-muted-foreground">Target Annual IRR</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold">
                  {investmentDetails.estimatedFirstDistribution.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-muted-foreground">First Distribution</p>
              </div>
            </div>
          </div>

          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <strong>Welcome to the Vibelux investor community!</strong> You'll receive monthly updates on facility performance and your returns.
            </AlertDescription>
          </Alert>
        </AnimatedCardContent>
      </AnimatedCard>

      {/* Next Steps */}
      <AnimatedCard className="mb-6">
        <AnimatedCardHeader>
          <AnimatedCardTitle>What Happens Next?</AnimatedCardTitle>
        </AnimatedCardHeader>
        <AnimatedCardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Check Your Email</h4>
                <p className="text-sm text-muted-foreground">
                  You'll receive investment confirmation and next steps for document signing
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold">Complete Documentation</h4>
                <p className="text-sm text-muted-foreground">
                  Sign investment agreements via DocuSign within 48 hours
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold">Fund Transfer</h4>
                <p className="text-sm text-muted-foreground">
                  Complete ACH or wire transfer within 5 business days
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold">Join Investor Community</h4>
                <p className="text-sm text-muted-foreground">
                  Access exclusive updates, webinars, and facility tours
                </p>
              </div>
            </div>
          </div>
        </AnimatedCardContent>
      </AnimatedCard>

      {/* Important Documents */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Important Documents</CardTitle>
          <CardDescription>Download copies for your records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-between">
              <span>Investment Confirmation</span>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              <span>Investment Summary</span>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              <span>Tax Information Guide</span>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/investment" className="flex-1">
          <Button variant="outline" className="w-full">
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <Link href="/investment/opportunities" className="flex-1">
          <Button className="w-full">
            View More Opportunities
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Contact Support */}
      <div className="text-center mt-8 text-sm text-muted-foreground">
        <p>Questions about your investment?</p>
        <p>
          Contact our investor relations team at{' '}
          <a href="mailto:investors@vibelux.com" className="text-primary hover:underline">
            investors@vibelux.com
          </a>
        </p>
      </div>
    </div>
  );
}