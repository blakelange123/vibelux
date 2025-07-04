'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  CreditCard,
  Building,
  FileText,
  Shield,
  CheckCircle,
  AlertCircle,
  Download,
  ExternalLink,
  Lock,
  ArrowRight,
  Info,
  DollarSign
} from 'lucide-react';
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from '@/components/ui/animated-card';

interface CheckoutStep {
  id: string;
  title: string;
  description: string;
  icon: any;
}

const steps: CheckoutStep[] = [
  {
    id: 'review',
    title: 'Review Investment',
    description: 'Confirm investment details',
    icon: FileText
  },
  {
    id: 'verification',
    title: 'Accreditation',
    description: 'Verify investor status',
    icon: Shield
  },
  {
    id: 'agreement',
    title: 'Sign Agreement',
    description: 'Review and sign documents',
    icon: FileText
  },
  {
    id: 'payment',
    title: 'Fund Investment',
    description: 'Complete payment',
    icon: CreditCard
  }
];

export default function InvestmentCheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  
  // Form states
  const [accreditationType, setAccreditationType] = useState('');
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('ach');
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    routingNumber: '',
    accountNumber: ''
  });
  
  const investmentAmount = Number(searchParams.get('amount')) || 50000;
  const facilityId = params.id;

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps([...completedSteps, steps[currentStep].id]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteInvestment = async () => {
    setLoading(true);
    
    // Simulate API call to process investment
    setTimeout(() => {
      router.push(`/investment/confirmation/${facilityId}?amount=${investmentAmount}`);
    }, 2000);
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'review':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Summary</CardTitle>
                <CardDescription>Review your investment details before proceeding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold mb-3">AeroGreen Technologies</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Investment Type</p>
                      <p className="font-medium">Growing as a Service (GaaS)</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">Columbus, OH</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Target IRR</p>
                      <p className="font-medium text-green-600">22%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payback Period</p>
                      <p className="font-medium">4.5 years</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Investment Amount</span>
                    <span className="font-semibold">${investmentAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Platform Fee (1%)</span>
                    <span>${(investmentAmount * 0.01).toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${(investmentAmount * 1.01).toLocaleString()}</span>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    The platform fee covers technology services, document processing, and ongoing investor portal access.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Link href={`/investment/opportunities/${facilityId}`}>
                <Button variant="outline">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Opportunity
                </Button>
              </Link>
              <Button onClick={handleNextStep}>
                Continue to Verification
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'verification':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Accredited Investor Verification</CardTitle>
                <CardDescription>
                  Federal regulations require all investors to be accredited for this type of investment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your information is encrypted and will only be used for verification purposes.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <Label>How do you qualify as an accredited investor?</Label>
                  <RadioGroup value={accreditationType} onValueChange={setAccreditationType}>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="income" id="income" />
                      <div className="grid gap-1">
                        <Label htmlFor="income" className="font-normal cursor-pointer">
                          Income over $200k (individual) or $300k (joint) for past 2 years
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          I have had income exceeding these levels and expect the same this year
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="networth" id="networth" />
                      <div className="grid gap-1">
                        <Label htmlFor="networth" className="font-normal cursor-pointer">
                          Net worth over $1 million (excluding primary residence)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          My net worth or joint net worth with spouse exceeds $1 million
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="entity" id="entity" />
                      <div className="grid gap-1">
                        <Label htmlFor="entity" className="font-normal cursor-pointer">
                          Qualified entity with $5M+ in assets
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          I represent an entity with assets exceeding $5 million
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="professional" id="professional" />
                      <div className="grid gap-1">
                        <Label htmlFor="professional" className="font-normal cursor-pointer">
                          Licensed financial professional
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          I hold Series 7, 65, or 82 licenses in good standing
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Third-Party Verification
                      </p>
                      <p className="text-blue-800 dark:text-blue-200">
                        We partner with VerifyInvestor to securely verify your accreditation status. 
                        You'll receive an email to complete this process after submission.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePreviousStep}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleNextStep}
                disabled={!accreditationType}
              >
                Continue to Agreement
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'agreement':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Agreement</CardTitle>
                <CardDescription>
                  Review and accept the investment terms and agreements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Investment Agreement</p>
                        <p className="text-sm text-muted-foreground">Revenue Share Agreement • 15 pages</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Private Placement Memorandum</p>
                        <p className="text-sm text-muted-foreground">Investment details and risks • 42 pages</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Subscription Agreement</p>
                        <p className="text-sm text-muted-foreground">Investor representations • 8 pages</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    These documents will be sent to your email for DocuSign signature after you proceed.
                  </AlertDescription>
                </Alert>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Key Terms Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Investment Amount</span>
                      <span className="font-medium">${investmentAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue Share</span>
                      <span className="font-medium">Based on facility performance</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distribution Frequency</span>
                      <span className="font-medium">Monthly after ramp period</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exit Rights</span>
                      <span className="font-medium">Buy-back option after 5 years</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="agreement" 
                    checked={agreementAccepted}
                    onCheckedChange={(checked) => setAgreementAccepted(checked as boolean)}
                  />
                  <div className="grid gap-1">
                    <Label htmlFor="agreement" className="text-sm font-normal cursor-pointer">
                      I have read, understood, and agree to the terms of all investment documents
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      By checking this box, you acknowledge that you have reviewed all documents and agree to proceed with the investment
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePreviousStep}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleNextStep}
                disabled={!agreementAccepted}
              >
                Continue to Payment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fund Your Investment</CardTitle>
                <CardDescription>
                  Choose your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="ach" id="ach" />
                    <div className="grid gap-1 flex-1">
                      <Label htmlFor="ach" className="font-normal cursor-pointer">
                        ACH Bank Transfer
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Direct transfer from your bank account • 3-5 business days
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="wire" id="wire" />
                    <div className="grid gap-1 flex-1">
                      <Label htmlFor="wire" className="font-normal cursor-pointer">
                        Wire Transfer
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Fast transfer for larger amounts • Same day processing
                      </p>
                    </div>
                  </div>
                </RadioGroup>

                {paymentMethod === 'ach' && (
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="accountName">Account Holder Name</Label>
                      <Input
                        id="accountName"
                        value={bankDetails.accountName}
                        onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                        placeholder="John Doe"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="routingNumber">Routing Number</Label>
                      <Input
                        id="routingNumber"
                        value={bankDetails.routingNumber}
                        onChange={(e) => setBankDetails({...bankDetails, routingNumber: e.target.value})}
                        placeholder="123456789"
                        maxLength={9}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        type="password"
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                        placeholder="••••••••••"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'wire' && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Wire instructions will be sent to your email after completing this step.
                    </AlertDescription>
                  </Alert>
                )}

                <Separator />

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2">Payment Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Investment Amount</span>
                      <span className="font-medium">${investmentAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee (1%)</span>
                      <span className="font-medium">${(investmentAmount * 0.01).toLocaleString()}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total Amount</span>
                      <span>${(investmentAmount * 1.01).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    Your payment information is encrypted and processed securely through Stripe.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePreviousStep}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleCompleteInvestment}
                disabled={loading || (paymentMethod === 'ach' && (!bankDetails.accountName || !bankDetails.routingNumber || !bankDetails.accountNumber))}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Complete Investment
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = completedSteps.includes(step.id);
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${isActive ? 'bg-primary text-primary-foreground' : 
                      isCompleted ? 'bg-green-500 text-white' : 
                      'bg-gray-200 text-gray-500'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      {renderStepContent()}
    </div>
  );
}