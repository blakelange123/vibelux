'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  ArrowRight,
  DollarSign,
  FileText,
  Building2,
  Target,
  Users,
  Calendar,
  Upload,
  Info,
  Save,
  Send
} from 'lucide-react';
import Link from 'next/link';

interface InvestmentFormData {
  // Basic Information
  title: string;
  type: 'GAAS' | 'YEP' | 'HYBRID';
  description: string;
  executiveSummary: string;
  
  // Financial Details
  targetAmount: string;
  minimumInvestment: string;
  targetIRR: string;
  paybackPeriod: string;
  useOfFunds: string;
  
  // For GaaS
  monthlyServiceFee?: string;
  contractLength?: string;
  equipmentType?: string;
  
  // For YEP
  revenueSharePercentage?: string;
  baselineYield?: string;
  projectedYieldIncrease?: string;
  
  // Timeline
  fundingDeadline: string;
  projectStartDate: string;
  expectedROIDate: string;
  
  // Risk & Mitigation
  riskFactors: string[];
  mitigationStrategies: string;
  
  // Documents
  documents: File[];
}

const riskOptions = [
  'Market price fluctuation',
  'Crop disease or pest',
  'Equipment failure',
  'Energy cost increases',
  'Labor shortage',
  'Regulatory changes',
  'Weather-related (greenhouse)',
  'Supply chain disruption',
];

export default function CreateInvestmentOpportunity() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<InvestmentFormData>({
    title: '',
    type: 'GAAS',
    description: '',
    executiveSummary: '',
    targetAmount: '',
    minimumInvestment: '',
    targetIRR: '',
    paybackPeriod: '',
    useOfFunds: '',
    fundingDeadline: '',
    projectStartDate: '',
    expectedROIDate: '',
    riskFactors: [],
    mitigationStrategies: '',
    documents: [],
  });

  const totalSteps = 5;

  const handleInputChange = (field: keyof InvestmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const response = await fetch('/api/facility/investment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'draft'
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        // Optionally redirect to edit page with ID
        router.push(`/facility/investment/edit/${result.id}`);
      } else {
        throw new Error('Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/facility/investment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'pending_review'
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        router.push('/facility/investment');
      } else {
        throw new Error('Failed to submit investment');
      }
    } catch (error) {
      console.error('Error submitting investment:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/facility/investment">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Create Investment Opportunity</h1>
            <p className="text-gray-300">Step {currentStep} of {totalSteps}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Form Steps */}
      <Card className="bg-gray-800 border-gray-700 shadow-sm">
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-white">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Opportunity Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., LED Lighting Upgrade - Phase 2"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Investment Type</Label>
                    <RadioGroup
                      value={formData.type}
                      onValueChange={(value) => handleInputChange('type', value)}
                      className="mt-2"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-4 border border-gray-600 rounded-lg bg-gray-800/30">
                          <RadioGroupItem value="GAAS" id="gaas" className="mt-1" />
                          <label htmlFor="gaas" className="flex-1 cursor-pointer">
                            <div className="font-medium text-white">Growing as a Service (GaaS)</div>
                            <p className="text-sm text-gray-300 mt-1">
                              Equipment financing with monthly service fees. Ideal for technology upgrades.
                            </p>
                          </label>
                        </div>
                        <div className="flex items-start space-x-3 p-4 border border-gray-600 rounded-lg bg-gray-800/30">
                          <RadioGroupItem value="YEP" id="yep" className="mt-1" />
                          <label htmlFor="yep" className="flex-1 cursor-pointer">
                            <div className="font-medium text-white">Yield Enhancement Program (YEP)</div>
                            <p className="text-sm text-gray-300 mt-1">
                              Revenue sharing based on yield improvements. Best for operational enhancements.
                            </p>
                          </label>
                        </div>
                        <div className="flex items-start space-x-3 p-4 border border-gray-600 rounded-lg bg-gray-800/30">
                          <RadioGroupItem value="HYBRID" id="hybrid" className="mt-1" />
                          <label htmlFor="hybrid" className="flex-1 cursor-pointer">
                            <div className="font-medium text-white">Hybrid Model</div>
                            <p className="text-sm text-gray-300 mt-1">
                              Combination of GaaS and YEP. Suitable for comprehensive facility upgrades.
                            </p>
                          </label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="description">Brief Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Provide a brief overview of your investment opportunity..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="executiveSummary">Executive Summary</Label>
                    <Textarea
                      id="executiveSummary"
                      value={formData.executiveSummary}
                      onChange={(e) => handleInputChange('executiveSummary', e.target.value)}
                      placeholder="Detailed summary including business model, competitive advantages, and growth strategy..."
                      rows={6}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-white">Financial Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="targetAmount">Target Raise Amount ($)</Label>
                      <Input
                        id="targetAmount"
                        type="number"
                        value={formData.targetAmount}
                        onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                        placeholder="1000000"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="minimumInvestment">Minimum Investment ($)</Label>
                      <Input
                        id="minimumInvestment"
                        type="number"
                        value={formData.minimumInvestment}
                        onChange={(e) => handleInputChange('minimumInvestment', e.target.value)}
                        placeholder="25000"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="targetIRR">Target IRR (%)</Label>
                      <Input
                        id="targetIRR"
                        type="number"
                        value={formData.targetIRR}
                        onChange={(e) => handleInputChange('targetIRR', e.target.value)}
                        placeholder="18"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paybackPeriod">Payback Period (years)</Label>
                      <Input
                        id="paybackPeriod"
                        type="number"
                        step="0.1"
                        value={formData.paybackPeriod}
                        onChange={(e) => handleInputChange('paybackPeriod', e.target.value)}
                        placeholder="4.5"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {formData.type === 'GAAS' && (
                    <div className="space-y-4 p-4 bg-blue-900/20 border border-blue-600/50 rounded-lg">
                      <h3 className="font-medium text-blue-300">GaaS Specific Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="monthlyServiceFee">Monthly Service Fee ($)</Label>
                          <Input
                            id="monthlyServiceFee"
                            type="number"
                            value={formData.monthlyServiceFee || ''}
                            onChange={(e) => handleInputChange('monthlyServiceFee', e.target.value)}
                            placeholder="5000"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contractLength">Contract Length (months)</Label>
                          <Input
                            id="contractLength"
                            type="number"
                            value={formData.contractLength || ''}
                            onChange={(e) => handleInputChange('contractLength', e.target.value)}
                            placeholder="60"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.type === 'YEP' && (
                    <div className="space-y-4 p-4 bg-green-900/20 border border-green-600/50 rounded-lg">
                      <h3 className="font-medium text-green-300">YEP Specific Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="revenueSharePercentage">Revenue Share (%)</Label>
                          <Input
                            id="revenueSharePercentage"
                            type="number"
                            value={formData.revenueSharePercentage || ''}
                            onChange={(e) => handleInputChange('revenueSharePercentage', e.target.value)}
                            placeholder="15"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="projectedYieldIncrease">Projected Yield Increase (%)</Label>
                          <Input
                            id="projectedYieldIncrease"
                            type="number"
                            value={formData.projectedYieldIncrease || ''}
                            onChange={(e) => handleInputChange('projectedYieldIncrease', e.target.value)}
                            placeholder="25"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="useOfFunds">Use of Funds</Label>
                    <Textarea
                      id="useOfFunds"
                      value={formData.useOfFunds}
                      onChange={(e) => handleInputChange('useOfFunds', e.target.value)}
                      placeholder="Describe how the investment will be used (e.g., 60% equipment purchase, 20% installation, 20% working capital)..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-white">Timeline</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fundingDeadline">Funding Deadline</Label>
                    <Input
                      id="fundingDeadline"
                      type="date"
                      value={formData.fundingDeadline}
                      onChange={(e) => handleInputChange('fundingDeadline', e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-300 mt-1">When do you need the funding completed?</p>
                  </div>

                  <div>
                    <Label htmlFor="projectStartDate">Project Start Date</Label>
                    <Input
                      id="projectStartDate"
                      type="date"
                      value={formData.projectStartDate}
                      onChange={(e) => handleInputChange('projectStartDate', e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-300 mt-1">When will implementation begin?</p>
                  </div>

                  <div>
                    <Label htmlFor="expectedROIDate">Expected ROI Date</Label>
                    <Input
                      id="expectedROIDate"
                      type="date"
                      value={formData.expectedROIDate}
                      onChange={(e) => handleInputChange('expectedROIDate', e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-300 mt-1">When do you expect investors to see returns?</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-white">Risk Assessment</h2>
                <div className="space-y-4">
                  <div>
                    <Label>Risk Factors</Label>
                    <p className="text-sm text-gray-300 mb-3">Select all that apply to your project</p>
                    <div className="space-y-2">
                      {riskOptions.map((risk) => (
                        <div key={risk} className="flex items-center space-x-2">
                          <Checkbox
                            id={risk}
                            checked={formData.riskFactors.includes(risk)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleInputChange('riskFactors', [...formData.riskFactors, risk]);
                              } else {
                                handleInputChange('riskFactors', formData.riskFactors.filter(r => r !== risk));
                              }
                            }}
                          />
                          <label htmlFor={risk} className="text-sm cursor-pointer text-white">{risk}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mitigationStrategies">Risk Mitigation Strategies</Label>
                    <Textarea
                      id="mitigationStrategies"
                      value={formData.mitigationStrategies}
                      onChange={(e) => handleInputChange('mitigationStrategies', e.target.value)}
                      placeholder="Describe how you plan to mitigate the identified risks..."
                      rows={6}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-white">Documents & Review</h2>
                
                {/* Document Upload */}
                <div className="mb-6">
                  <Label>Supporting Documents</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-600 rounded-lg p-6 text-center bg-gray-800/30">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-300 mb-2">
                      Drag and drop files here, or click to browse
                    </p>
                    <Button variant="outline" size="sm">
                      Select Files
                    </Button>
                    <p className="text-xs text-gray-400 mt-2">
                      Accepted: PDF, DOC, XLS (max 10MB each)
                    </p>
                  </div>
                </div>

                {/* Summary Review */}
                <div className="space-y-4">
                  <h3 className="font-medium text-white">Opportunity Summary</h3>
                  <div className="bg-gray-800/50 rounded-lg p-4 space-y-3 border border-gray-600">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Title</p>
                        <p className="font-medium text-white">{formData.title || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Type</p>
                        <p className="font-medium text-white">{formData.type}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Target Amount</p>
                        <p className="font-medium text-white">
                          ${formData.targetAmount ? Number(formData.targetAmount).toLocaleString() : '0'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Target IRR</p>
                        <p className="font-medium text-white">{formData.targetIRR || '0'}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Funding Deadline</p>
                        <p className="font-medium text-white">
                          {formData.fundingDeadline ? new Date(formData.fundingDeadline).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Risk Factors</p>
                        <p className="font-medium text-white">{formData.riskFactors.length} identified</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <Info className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800 mb-1">Before Submission</p>
                      <ul className="text-yellow-700 space-y-1">
                        <li>• Your opportunity will be reviewed by our team within 2-3 business days</li>
                        <li>• Ensure all financial projections are accurate and verifiable</li>
                        <li>• You may be contacted for additional information or clarification</li>
                      </ul>
                    </div>
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
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit for Review
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}