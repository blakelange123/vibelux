'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2,
  Upload,
  DollarSign,
  BarChart,
  Target,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Zap,
  Droplets,
  Thermometer,
  Users,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface FacilityProfile {
  // Basic Information
  facilityName: string;
  facilityType: 'INDOOR_FARM' | 'GREENHOUSE' | 'VERTICAL_FARM' | 'HYBRID';
  location: string;
  yearEstablished: string;
  ownershipStructure: string;
  
  // Facility Details
  totalSquareFeet: number;
  cultivationSquareFeet: number;
  numberOfGrowRooms: number;
  currentProductionCapacity: number;
  
  // Operations
  primaryCrops: string[];
  growingMethod: string;
  currentStaffCount: number;
  operatingHoursPerDay: number;
  
  // Financial Metrics
  currentMonthlyRevenue: number;
  currentMonthlyExpenses: number;
  currentYieldPerSqFt: number;
  energyCostPerMonth: number;
  
  // Equipment & Technology
  currentLightingType: string;
  hvacSystem: string;
  automationLevel: number; // 1-10
  hasEnvironmentalControls: boolean;
  
  // Funding Needs
  fundingAmount: number;
  fundingPurpose: string[];
  expectedROI: number;
  paybackPeriod: number;
  
  // Documents
  hasFinancialStatements: boolean;
  hasBusinessPlan: boolean;
  hasOperatingLicenses: boolean;
}

const steps = [
  { id: 1, title: 'Basic Information', icon: Building2 },
  { id: 2, title: 'Facility Details', icon: BarChart },
  { id: 3, title: 'Operations', icon: Thermometer },
  { id: 4, title: 'Financial Metrics', icon: DollarSign },
  { id: 5, title: 'Funding Needs', icon: Target },
  { id: 6, title: 'Documentation', icon: FileText }
];

export default function FacilityOnboarding() {
  const router = useRouter();
  const { userId } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<FacilityProfile>({
    facilityName: '',
    facilityType: 'INDOOR_FARM',
    location: '',
    yearEstablished: '',
    ownershipStructure: '',
    totalSquareFeet: 0,
    cultivationSquareFeet: 0,
    numberOfGrowRooms: 0,
    currentProductionCapacity: 0,
    primaryCrops: [],
    growingMethod: '',
    currentStaffCount: 0,
    operatingHoursPerDay: 0,
    currentMonthlyRevenue: 0,
    currentMonthlyExpenses: 0,
    currentYieldPerSqFt: 0,
    energyCostPerMonth: 0,
    currentLightingType: '',
    hvacSystem: '',
    automationLevel: 5,
    hasEnvironmentalControls: false,
    fundingAmount: 0,
    fundingPurpose: [],
    expectedROI: 0,
    paybackPeriod: 0,
    hasFinancialStatements: false,
    hasBusinessPlan: false,
    hasOperatingLicenses: false
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Comprehensive validation before submission
    const validationErrors = [];
    
    // Basic information validation
    if (!profile.name?.trim()) {
      validationErrors.push('Facility name is required');
    }
    
    if (!profile.type) {
      validationErrors.push('Facility type is required');
    }
    
    if (!profile.location?.address?.trim() || !profile.location?.city?.trim() || !profile.location?.state) {
      validationErrors.push('Complete address is required');
    }
    
    if (!profile.size || profile.size <= 0) {
      validationErrors.push('Valid facility size is required');
    }
    
    // Financial validation
    if (profile.financials) {
      if (profile.financials.monthlyRevenue < 0 || profile.financials.monthlyRevenue > 10000000) {
        validationErrors.push('Monthly revenue must be between $0 - $10M');
      }
      
      if (profile.financials.monthlyExpenses < 0 || profile.financials.monthlyExpenses > profile.financials.monthlyRevenue * 2) {
        validationErrors.push('Monthly expenses appear unrealistic');
      }
      
      if (profile.financials.energyCosts < 0 || profile.financials.energyCosts > profile.financials.monthlyExpenses) {
        validationErrors.push('Energy costs cannot exceed total expenses');
      }
    }
    
    // Investment validation
    if (profile.investment) {
      if (profile.investment.targetAmount <= 0 || profile.investment.targetAmount > 50000000) {
        validationErrors.push('Target investment amount must be between $1 - $50M');
      }
      
      if (profile.investment.equityOffered < 0 || profile.investment.equityOffered > 100) {
        validationErrors.push('Equity offered must be between 0-100%');
      }
      
      if (!profile.investment.useOfFunds?.trim()) {
        validationErrors.push('Use of funds description is required');
      }
    }
    
    // Operations validation
    if (profile.operations?.employees < 0 || profile.operations?.employees > 1000) {
      validationErrors.push('Number of employees must be realistic');
    }
    
    if (validationErrors.length > 0) {
      alert('Validation errors:\n' + validationErrors.join('\n'));
      return;
    }
    
    try {
      // Submit profile to backend
      const response = await fetch('/api/facility/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Redirect to investment creation with facility ID
      router.push(`/facility/investment/create?facility=${result.id}`);
    } catch (error) {
      alert('Failed to submit facility profile. Please try again.');
    }
  };

  const updateProfile = (field: keyof FacilityProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Facility Onboarding</h1>
        <p className="text-gray-400">Complete your facility profile to access funding opportunities</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  isActive ? 'bg-green-600 text-white' : 
                  isCompleted ? 'bg-green-600 text-white' : 
                  'bg-gray-700 text-gray-400'
                }`}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full h-0.5 mx-2 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        <Progress value={(currentStep / steps.length) * 100} className="h-2" />
      </div>

      {/* Form Content */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>Step {currentStep} of {steps.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="facilityName">Facility Name</Label>
                <Input
                  id="facilityName"
                  value={profile.facilityName}
                  onChange={(e) => updateProfile('facilityName', e.target.value)}
                  placeholder="Enter your facility name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Facility Type</Label>
                <RadioGroup
                  value={profile.facilityType}
                  onValueChange={(value) => updateProfile('facilityType', value)}
                  className="mt-2 grid grid-cols-2 gap-3"
                >
                  <div className="flex items-center space-x-2 p-3 border border-gray-600 rounded-lg">
                    <RadioGroupItem value="INDOOR_FARM" id="indoor" />
                    <label htmlFor="indoor" className="cursor-pointer">
                      <div className="font-medium">Indoor Farm</div>
                      <p className="text-sm text-gray-400">Fully controlled environment</p>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-gray-600 rounded-lg">
                    <RadioGroupItem value="GREENHOUSE" id="greenhouse" />
                    <label htmlFor="greenhouse" className="cursor-pointer">
                      <div className="font-medium">Greenhouse</div>
                      <p className="text-sm text-gray-400">Natural light supplemented</p>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-gray-600 rounded-lg">
                    <RadioGroupItem value="VERTICAL_FARM" id="vertical" />
                    <label htmlFor="vertical" className="cursor-pointer">
                      <div className="font-medium">Vertical Farm</div>
                      <p className="text-sm text-gray-400">Multi-tier systems</p>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-gray-600 rounded-lg">
                    <RadioGroupItem value="HYBRID" id="hybrid" />
                    <label htmlFor="hybrid" className="cursor-pointer">
                      <div className="font-medium">Hybrid</div>
                      <p className="text-sm text-gray-400">Mixed cultivation</p>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location (City, State)</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => updateProfile('location', e.target.value)}
                    placeholder="e.g., Columbus, OH"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="yearEstablished">Year Established</Label>
                  <Input
                    id="yearEstablished"
                    value={profile.yearEstablished}
                    onChange={(e) => updateProfile('yearEstablished', e.target.value)}
                    placeholder="e.g., 2020"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ownershipStructure">Ownership Structure</Label>
                <Input
                  id="ownershipStructure"
                  value={profile.ownershipStructure}
                  onChange={(e) => updateProfile('ownershipStructure', e.target.value)}
                  placeholder="e.g., LLC, Corporation, Partnership"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Step 2: Facility Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalSquareFeet">Total Square Feet</Label>
                  <Input
                    id="totalSquareFeet"
                    type="number"
                    value={profile.totalSquareFeet || ''}
                    onChange={(e) => updateProfile('totalSquareFeet', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cultivationSquareFeet">Cultivation Square Feet</Label>
                  <Input
                    id="cultivationSquareFeet"
                    type="number"
                    value={profile.cultivationSquareFeet || ''}
                    onChange={(e) => updateProfile('cultivationSquareFeet', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numberOfGrowRooms">Number of Grow Rooms</Label>
                  <Input
                    id="numberOfGrowRooms"
                    type="number"
                    value={profile.numberOfGrowRooms || ''}
                    onChange={(e) => updateProfile('numberOfGrowRooms', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="currentProductionCapacity">Current Production (lbs/year)</Label>
                  <Input
                    id="currentProductionCapacity"
                    type="number"
                    value={profile.currentProductionCapacity || ''}
                    onChange={(e) => updateProfile('currentProductionCapacity', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Accurate facility details help investors understand your operation's scale and potential.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step 3: Operations */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label>Primary Crops (Select all that apply)</Label>
                <div className="mt-2 space-y-2">
                  {['Cannabis Flower', 'Cannabis Pre-rolls', 'Cannabis Concentrates', 'Hemp', 'Leafy Greens', 'Herbs', 'Microgreens', 'Other'].map((crop) => (
                    <div key={crop} className="flex items-center space-x-2">
                      <Checkbox
                        id={crop}
                        checked={profile.primaryCrops.includes(crop)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateProfile('primaryCrops', [...profile.primaryCrops, crop]);
                          } else {
                            updateProfile('primaryCrops', profile.primaryCrops.filter(c => c !== crop));
                          }
                        }}
                      />
                      <label htmlFor={crop} className="cursor-pointer">{crop}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="growingMethod">Growing Method</Label>
                <Input
                  id="growingMethod"
                  value={profile.growingMethod}
                  onChange={(e) => updateProfile('growingMethod', e.target.value)}
                  placeholder="e.g., Hydroponic, Aeroponic, Soil-based"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentStaffCount">Current Staff Count</Label>
                  <Input
                    id="currentStaffCount"
                    type="number"
                    value={profile.currentStaffCount || ''}
                    onChange={(e) => updateProfile('currentStaffCount', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="operatingHoursPerDay">Operating Hours/Day</Label>
                  <Input
                    id="operatingHoursPerDay"
                    type="number"
                    value={profile.operatingHoursPerDay || ''}
                    onChange={(e) => updateProfile('operatingHoursPerDay', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasEnvironmentalControls"
                  checked={profile.hasEnvironmentalControls}
                  onCheckedChange={(checked) => updateProfile('hasEnvironmentalControls', checked)}
                />
                <label htmlFor="hasEnvironmentalControls">
                  We have automated environmental controls (temperature, humidity, CO2)
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Financial Metrics */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <Alert className="bg-blue-900/20 border-blue-600/50">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  Financial information is kept confidential and only shared with matched investors after mutual agreement.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentMonthlyRevenue">Current Monthly Revenue ($)</Label>
                  <Input
                    id="currentMonthlyRevenue"
                    type="number"
                    value={profile.currentMonthlyRevenue || ''}
                    onChange={(e) => updateProfile('currentMonthlyRevenue', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="currentMonthlyExpenses">Current Monthly Expenses ($)</Label>
                  <Input
                    id="currentMonthlyExpenses"
                    type="number"
                    value={profile.currentMonthlyExpenses || ''}
                    onChange={(e) => updateProfile('currentMonthlyExpenses', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentYieldPerSqFt">Current Yield (g/sq ft/year)</Label>
                  <Input
                    id="currentYieldPerSqFt"
                    type="number"
                    value={profile.currentYieldPerSqFt || ''}
                    onChange={(e) => updateProfile('currentYieldPerSqFt', parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-400 mt-1">Industry avg: 40-60 g/sq ft</p>
                </div>
                <div>
                  <Label htmlFor="energyCostPerMonth">Energy Cost per Month ($)</Label>
                  <Input
                    id="energyCostPerMonth"
                    type="number"
                    value={profile.energyCostPerMonth || ''}
                    onChange={(e) => updateProfile('energyCostPerMonth', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-white mb-2">Current Metrics Summary</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Monthly Profit Margin</p>
                    <p className="font-medium text-white">
                      {profile.currentMonthlyRevenue && profile.currentMonthlyExpenses
                        ? Math.round(((profile.currentMonthlyRevenue - profile.currentMonthlyExpenses) / profile.currentMonthlyRevenue) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Energy % of Expenses</p>
                    <p className="font-medium text-white">
                      {profile.energyCostPerMonth && profile.currentMonthlyExpenses
                        ? Math.round((profile.energyCostPerMonth / profile.currentMonthlyExpenses) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Funding Needs */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="fundingAmount">Total Funding Needed ($)</Label>
                <Input
                  id="fundingAmount"
                  type="number"
                  value={profile.fundingAmount || ''}
                  onChange={(e) => updateProfile('fundingAmount', parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Funding Purpose (Select all that apply)</Label>
                <div className="mt-2 space-y-2">
                  {[
                    'LED Lighting Upgrade',
                    'HVAC System Upgrade',
                    'Automation Systems',
                    'Expansion - New Rooms',
                    'Environmental Controls',
                    'Water/Nutrient Systems',
                    'Energy Efficiency',
                    'Working Capital'
                  ].map((purpose) => (
                    <div key={purpose} className="flex items-center space-x-2">
                      <Checkbox
                        id={purpose}
                        checked={profile.fundingPurpose.includes(purpose)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateProfile('fundingPurpose', [...profile.fundingPurpose, purpose]);
                          } else {
                            updateProfile('fundingPurpose', profile.fundingPurpose.filter(p => p !== purpose));
                          }
                        }}
                      />
                      <label htmlFor={purpose} className="cursor-pointer">{purpose}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expectedROI">Expected Yield Increase (%)</Label>
                  <Input
                    id="expectedROI"
                    type="number"
                    value={profile.expectedROI || ''}
                    onChange={(e) => updateProfile('expectedROI', parseInt(e.target.value))}
                    placeholder="e.g., 25"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="paybackPeriod">Expected Payback Period (years)</Label>
                  <Input
                    id="paybackPeriod"
                    type="number"
                    step="0.1"
                    value={profile.paybackPeriod || ''}
                    onChange={(e) => updateProfile('paybackPeriod', parseFloat(e.target.value))}
                    placeholder="e.g., 3.5"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Equipment Information</Label>
                <div className="space-y-3 mt-2">
                  <div>
                    <Label htmlFor="currentLightingType">Current Lighting Type</Label>
                    <Input
                      id="currentLightingType"
                      value={profile.currentLightingType}
                      onChange={(e) => updateProfile('currentLightingType', e.target.value)}
                      placeholder="e.g., HPS 1000W, LED 650W"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hvacSystem">HVAC System</Label>
                    <Input
                      id="hvacSystem"
                      value={profile.hvacSystem}
                      onChange={(e) => updateProfile('hvacSystem', e.target.value)}
                      placeholder="e.g., Split AC, Chilled Water"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Documentation */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Documents can be uploaded after profile creation. Having these ready speeds up the funding process.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="hasFinancialStatements"
                      checked={profile.hasFinancialStatements}
                      onCheckedChange={(checked) => updateProfile('hasFinancialStatements', checked)}
                    />
                    <label htmlFor="hasFinancialStatements" className="cursor-pointer">
                      <div className="font-medium">Financial Statements</div>
                      <p className="text-sm text-gray-400">P&L, Balance Sheet, Cash Flow (last 2 years)</p>
                    </label>
                  </div>
                  {profile.hasFinancialStatements && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="hasBusinessPlan"
                      checked={profile.hasBusinessPlan}
                      onCheckedChange={(checked) => updateProfile('hasBusinessPlan', checked)}
                    />
                    <label htmlFor="hasBusinessPlan" className="cursor-pointer">
                      <div className="font-medium">Business Plan</div>
                      <p className="text-sm text-gray-400">Growth projections and strategy</p>
                    </label>
                  </div>
                  {profile.hasBusinessPlan && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="hasOperatingLicenses"
                      checked={profile.hasOperatingLicenses}
                      onCheckedChange={(checked) => updateProfile('hasOperatingLicenses', checked)}
                    />
                    <label htmlFor="hasOperatingLicenses" className="cursor-pointer">
                      <div className="font-medium">Operating Licenses</div>
                      <p className="text-sm text-gray-400">All required cultivation licenses</p>
                    </label>
                  </div>
                  {profile.hasOperatingLicenses && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                </div>
              </div>

              <div className="p-4 bg-green-900/20 border border-green-600/50 rounded-lg">
                <h3 className="font-medium text-green-300 mb-2">Ready to Connect with Investors!</h3>
                <p className="text-sm text-gray-300">
                  Your profile is complete. After submission, you'll be able to create investment opportunities 
                  and get matched with compatible investors based on your needs.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < steps.length ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700"
              >
                Complete Profile
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}