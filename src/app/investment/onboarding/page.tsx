'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  ArrowLeft,
  Building2,
  DollarSign,
  Target,
  Shield,
  BarChart,
  MapPin,
  Briefcase,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface InvestorProfile {
  // Basic Information
  companyName: string;
  investorType: 'INDIVIDUAL' | 'FUND' | 'FAMILY_OFFICE' | 'CORPORATION';
  accreditedStatus: 'ACCREDITED' | 'QUALIFIED' | 'INSTITUTIONAL';
  
  // Investment Preferences
  minimumInvestment: number;
  maximumInvestment: number;
  targetIRR: number;
  preferredHoldPeriod: string;
  
  // Risk Profile
  riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  investmentFocus: string[];
  
  // Geographic Preferences
  geographicPreferences: string[];
  facilityTypes: string[];
  
  // Experience
  cannabisExperience: boolean;
  agTechExperience: boolean;
  previousInvestments: string;
}

const steps = [
  { id: 1, title: 'Basic Information', icon: Briefcase },
  { id: 2, title: 'Investment Criteria', icon: DollarSign },
  { id: 3, title: 'Risk Profile', icon: Shield },
  { id: 4, title: 'Preferences', icon: Target },
  { id: 5, title: 'Review & Submit', icon: CheckCircle }
];

export default function InvestorOnboarding() {
  const router = useRouter();
  const { userId } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<InvestorProfile>({
    companyName: '',
    investorType: 'INDIVIDUAL',
    accreditedStatus: 'ACCREDITED',
    minimumInvestment: 50000,
    maximumInvestment: 500000,
    targetIRR: 18,
    preferredHoldPeriod: '3-5',
    riskTolerance: 'MODERATE',
    investmentFocus: [],
    geographicPreferences: [],
    facilityTypes: [],
    cannabisExperience: false,
    agTechExperience: false,
    previousInvestments: '0-5'
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
    // Validate required fields
    const validationErrors = [];
    
    if (!profile.companyName?.trim()) {
      validationErrors.push('Company/Individual name is required');
    }
    
    if (profile.minimumInvestment <= 0 || profile.minimumInvestment > profile.maximumInvestment) {
      validationErrors.push('Invalid investment range');
    }
    
    if (profile.maximumInvestment > 10000000) {
      validationErrors.push('Maximum investment amount is unrealistic');
    }
    
    if (profile.targetIRR < 0 || profile.targetIRR > 100) {
      validationErrors.push('Target IRR must be between 0-100%');
    }
    
    if (profile.investmentFocus.length === 0) {
      validationErrors.push('Please select at least one investment focus area');
    }
    
    if (profile.geographicPreferences.length === 0) {
      validationErrors.push('Please select at least one geographic preference');
    }
    
    if (validationErrors.length > 0) {
      alert('Validation errors:\n' + validationErrors.join('\n'));
      return;
    }
    
    try {
      // Submit profile to backend
      const response = await fetch('/api/investment/onboarding', {
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
      
      // Redirect to matchmaking results
      router.push(`/investment/matches?profile=${result.id}`);
    } catch (error) {
      alert('Failed to submit investor profile. Please try again.');
    }
  };

  const updateProfile = (field: keyof InvestorProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Investor Onboarding</h1>
        <p className="text-gray-400">Tell us about your investment preferences to get matched with the right opportunities</p>
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
                  isActive ? 'bg-blue-600 text-white' : 
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
                <Label htmlFor="companyName">Company/Individual Name</Label>
                <Input
                  id="companyName"
                  value={profile.companyName}
                  onChange={(e) => updateProfile('companyName', e.target.value)}
                  placeholder="Enter your company or individual name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Investor Type</Label>
                <RadioGroup
                  value={profile.investorType}
                  onValueChange={(value) => updateProfile('investorType', value)}
                  className="mt-2 space-y-3"
                >
                  <div className="flex items-center space-x-2 p-3 border border-gray-600 rounded-lg">
                    <RadioGroupItem value="INDIVIDUAL" id="individual" />
                    <label htmlFor="individual" className="flex-1 cursor-pointer">
                      <div className="font-medium">Individual Investor</div>
                      <p className="text-sm text-gray-400">Personal investment account</p>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-gray-600 rounded-lg">
                    <RadioGroupItem value="FUND" id="fund" />
                    <label htmlFor="fund" className="flex-1 cursor-pointer">
                      <div className="font-medium">Investment Fund</div>
                      <p className="text-sm text-gray-400">VC, PE, or hedge fund</p>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-gray-600 rounded-lg">
                    <RadioGroupItem value="FAMILY_OFFICE" id="family" />
                    <label htmlFor="family" className="flex-1 cursor-pointer">
                      <div className="font-medium">Family Office</div>
                      <p className="text-sm text-gray-400">Private wealth management</p>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-gray-600 rounded-lg">
                    <RadioGroupItem value="CORPORATION" id="corp" />
                    <label htmlFor="corp" className="flex-1 cursor-pointer">
                      <div className="font-medium">Corporation</div>
                      <p className="text-sm text-gray-400">Corporate investment arm</p>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Accreditation Status</Label>
                <RadioGroup
                  value={profile.accreditedStatus}
                  onValueChange={(value) => updateProfile('accreditedStatus', value)}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ACCREDITED" id="accredited" />
                    <label htmlFor="accredited">Accredited Investor</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="QUALIFIED" id="qualified" />
                    <label htmlFor="qualified">Qualified Purchaser</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="INSTITUTIONAL" id="institutional" />
                    <label htmlFor="institutional">Institutional Investor</label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 2: Investment Criteria */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minInvestment">Minimum Investment ($)</Label>
                  <Input
                    id="minInvestment"
                    type="number"
                    value={profile.minimumInvestment}
                    onChange={(e) => updateProfile('minimumInvestment', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="maxInvestment">Maximum Investment ($)</Label>
                  <Input
                    id="maxInvestment"
                    type="number"
                    value={profile.maximumInvestment}
                    onChange={(e) => updateProfile('maximumInvestment', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="targetIRR">Target IRR (%)</Label>
                <Input
                  id="targetIRR"
                  type="number"
                  value={profile.targetIRR}
                  onChange={(e) => updateProfile('targetIRR', parseInt(e.target.value))}
                  className="mt-1"
                />
                <p className="text-sm text-gray-400 mt-1">Industry average: 18-25%</p>
              </div>

              <div>
                <Label>Preferred Hold Period</Label>
                <RadioGroup
                  value={profile.preferredHoldPeriod}
                  onValueChange={(value) => updateProfile('preferredHoldPeriod', value)}
                  className="mt-2 grid grid-cols-2 gap-3"
                >
                  <div className="flex items-center space-x-2 p-3 border border-gray-600 rounded-lg">
                    <RadioGroupItem value="1-3" id="short" />
                    <label htmlFor="short">1-3 years</label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-gray-600 rounded-lg">
                    <RadioGroupItem value="3-5" id="medium" />
                    <label htmlFor="medium">3-5 years</label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-gray-600 rounded-lg">
                    <RadioGroupItem value="5-7" id="long" />
                    <label htmlFor="long">5-7 years</label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-gray-600 rounded-lg">
                    <RadioGroupItem value="7+" id="verylong" />
                    <label htmlFor="verylong">7+ years</label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 3: Risk Profile */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label>Risk Tolerance</Label>
                <RadioGroup
                  value={profile.riskTolerance}
                  onValueChange={(value) => updateProfile('riskTolerance', value)}
                  className="mt-2 space-y-3"
                >
                  <div className="flex items-center space-x-2 p-4 border border-gray-600 rounded-lg">
                    <RadioGroupItem value="CONSERVATIVE" id="conservative" />
                    <label htmlFor="conservative" className="flex-1 cursor-pointer">
                      <div className="font-medium">Conservative</div>
                      <p className="text-sm text-gray-400">Established facilities, proven track records, lower returns</p>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border border-gray-600 rounded-lg">
                    <RadioGroupItem value="MODERATE" id="moderate" />
                    <label htmlFor="moderate" className="flex-1 cursor-pointer">
                      <div className="font-medium">Moderate</div>
                      <p className="text-sm text-gray-400">Mix of established and growth facilities, balanced returns</p>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border border-gray-600 rounded-lg">
                    <RadioGroupItem value="AGGRESSIVE" id="aggressive" />
                    <label htmlFor="aggressive" className="flex-1 cursor-pointer">
                      <div className="font-medium">Aggressive</div>
                      <p className="text-sm text-gray-400">New facilities, expansion projects, higher potential returns</p>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Investment Focus (Select all that apply)</Label>
                <div className="mt-2 space-y-2">
                  {['Equipment Financing', 'Yield Improvement', 'Energy Efficiency', 'Expansion Projects', 'New Facilities', 'Technology Upgrades'].map((focus) => (
                    <div key={focus} className="flex items-center space-x-2">
                      <Checkbox
                        id={focus}
                        checked={profile.investmentFocus.includes(focus)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateProfile('investmentFocus', [...profile.investmentFocus, focus]);
                          } else {
                            updateProfile('investmentFocus', profile.investmentFocus.filter(f => f !== focus));
                          }
                        }}
                      />
                      <label htmlFor={focus} className="cursor-pointer">{focus}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cannabis"
                    checked={profile.cannabisExperience}
                    onCheckedChange={(checked) => updateProfile('cannabisExperience', checked)}
                  />
                  <label htmlFor="cannabis">Prior cannabis industry experience</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agtech"
                    checked={profile.agTechExperience}
                    onCheckedChange={(checked) => updateProfile('agTechExperience', checked)}
                  />
                  <label htmlFor="agtech">Prior AgTech experience</label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preferences */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <Label>Geographic Preferences (Select all that apply)</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West Coast', 'No Preference'].map((region) => (
                    <div key={region} className="flex items-center space-x-2">
                      <Checkbox
                        id={region}
                        checked={profile.geographicPreferences.includes(region)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateProfile('geographicPreferences', [...profile.geographicPreferences, region]);
                          } else {
                            updateProfile('geographicPreferences', profile.geographicPreferences.filter(r => r !== region));
                          }
                        }}
                      />
                      <label htmlFor={region} className="cursor-pointer">{region}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Facility Types (Select all that apply)</Label>
                <div className="mt-2 space-y-2">
                  {[
                    { id: 'greenhouse', label: 'Greenhouse', desc: 'Natural light supplemented' },
                    { id: 'indoor', label: 'Indoor Farm', desc: 'Fully controlled environment' },
                    { id: 'vertical', label: 'Vertical Farm', desc: 'Multi-tier systems' },
                    { id: 'hybrid', label: 'Hybrid Facilities', desc: 'Mixed cultivation methods' }
                  ].map((type) => (
                    <div key={type.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={type.id}
                        checked={profile.facilityTypes.includes(type.label)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateProfile('facilityTypes', [...profile.facilityTypes, type.label]);
                          } else {
                            updateProfile('facilityTypes', profile.facilityTypes.filter(t => t !== type.label));
                          }
                        }}
                        className="mt-1"
                      />
                      <label htmlFor={type.id} className="cursor-pointer">
                        <div className="font-medium">{type.label}</div>
                        <p className="text-sm text-gray-400">{type.desc}</p>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Previous Alternative Investments</Label>
                <RadioGroup
                  value={profile.previousInvestments}
                  onValueChange={(value) => updateProfile('previousInvestments', value)}
                  className="mt-2 grid grid-cols-3 gap-3"
                >
                  <div className="flex items-center space-x-2 p-3 border border-gray-600 rounded-lg">
                    <RadioGroupItem value="0-5" id="few" />
                    <label htmlFor="few">0-5</label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-gray-600 rounded-lg">
                    <RadioGroupItem value="6-20" id="some" />
                    <label htmlFor="some">6-20</label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-gray-600 rounded-lg">
                    <RadioGroupItem value="20+" id="many" />
                    <label htmlFor="many">20+</label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-300">Review Your Profile</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Please review your information before submitting. You can update these preferences anytime from your dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Company Name</p>
                    <p className="font-medium">{profile.companyName || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Investor Type</p>
                    <p className="font-medium">{profile.investorType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Investment Range</p>
                    <p className="font-medium">
                      ${profile.minimumInvestment.toLocaleString()} - ${profile.maximumInvestment.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Target IRR</p>
                    <p className="font-medium">{profile.targetIRR}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Risk Tolerance</p>
                    <p className="font-medium">{profile.riskTolerance}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Hold Period</p>
                    <p className="font-medium">{profile.preferredHoldPeriod} years</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2">Investment Focus Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.investmentFocus.map((focus) => (
                      <span key={focus} className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                        {focus}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2">Geographic Preferences</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.geographicPreferences.map((region) => (
                      <span key={region} className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="font-medium text-green-300">Ready to Find Matches</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Based on your preferences, we'll show you compatible investment opportunities.
                    </p>
                  </div>
                </div>
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
                className="bg-blue-600 hover:bg-blue-700"
              >
                View Matches
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}