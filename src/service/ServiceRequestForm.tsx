'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Upload,
  X,
  Info,
} from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  model: string;
}

interface Facility {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
}

interface ServiceRequestData {
  facilityId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  urgency: string;
  equipmentId?: string;
  location?: string;
  accessInstructions?: string;
  preferredDate?: string;
  flexibleTiming: boolean;
  emergencyService: boolean;
  budgetRange?: string;
  maxBudget?: number;
  biddingEnabled: boolean;
  biddingDays: number;
  photos: string[];
  documents: string[];
}

export default function ServiceRequestForm({ 
  facilityId, 
  onSubmit, 
  onCancel 
}: { 
  facilityId?: string;
  onSubmit: (data: ServiceRequestData) => void;
  onCancel: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [formData, setFormData] = useState<ServiceRequestData>({
    facilityId: facilityId || '',
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM',
    urgency: 'STANDARD',
    equipmentId: '',
    location: '',
    accessInstructions: '',
    preferredDate: '',
    flexibleTiming: true,
    emergencyService: false,
    budgetRange: '',
    maxBudget: undefined,
    biddingEnabled: true,
    biddingDays: 3,
    photos: [],
    documents: [],
  });

  useEffect(() => {
    fetchFacilities();
  }, []);

  useEffect(() => {
    if (formData.facilityId) {
      fetchEquipment(formData.facilityId);
    }
  }, [formData.facilityId]);

  const fetchFacilities = async () => {
    try {
      const response = await fetch('/api/facilities');
      const data = await response.json();
      setFacilities(data);
      
      if (facilityId && data.length > 0) {
        setFormData(prev => ({ ...prev, facilityId: facilityId }));
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const fetchEquipment = async (facilityId: string) => {
    try {
      const response = await fetch(`/api/equipment?facilityId=${facilityId}`);
      const data = await response.json();
      setEquipment(data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const validateStep = (step: number): boolean => {
    const stepErrors: { [key: string]: string } = {};

    switch (step) {
      case 1:
        if (!formData.facilityId) stepErrors.facilityId = 'Facility is required';
        if (!formData.title?.trim()) stepErrors.title = 'Title is required';
        if (formData.title && (formData.title.length < 5 || formData.title.length > 100)) {
          stepErrors.title = 'Title must be between 5-100 characters';
        }
        if (!formData.description?.trim()) stepErrors.description = 'Description is required';
        if (formData.description && (formData.description.length < 20 || formData.description.length > 1000)) {
          stepErrors.description = 'Description must be between 20-1000 characters';
        }
        if (!formData.category) stepErrors.category = 'Service category is required';
        break;
      case 2:
        // Equipment selection validation
        if (formData.equipmentIds.length === 0) {
          stepErrors.equipment = 'Please select at least one piece of equipment';
        }
        break;
      case 3:
        if (formData.emergencyService && (!formData.maxBudget || formData.maxBudget <= 0)) {
          stepErrors.maxBudget = 'Maximum budget is required for emergency services';
        }
        if (formData.maxBudget && (formData.maxBudget < 50 || formData.maxBudget > 100000)) {
          stepErrors.maxBudget = 'Budget must be between $50 - $100,000';
        }
        if (formData.preferredStartDate && new Date(formData.preferredStartDate) < new Date()) {
          stepErrors.preferredStartDate = 'Start date cannot be in the past';
        }
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting service request:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof ServiceRequestData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getBudgetRangeLabel = (range: string) => {
    const ranges: { [key: string]: string } = {
      'under-500': 'Under $500',
      '500-1000': '$500 - $1,000',
      '1000-2500': '$1,000 - $2,500',
      '2500-5000': '$2,500 - $5,000',
      '5000-10000': '$5,000 - $10,000',
      'over-10000': 'Over $10,000',
    };
    return ranges[range] || range;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'secondary';
      default: return 'secondary';
    }
  };

  const stepTitles = [
    'Service Details',
    'Location & Equipment',
    'Budget & Timing'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Request Service</CardTitle>
              <p className="text-gray-600">Get professional maintenance and repair services</p>
            </div>
            <Badge variant="outline">
              Step {currentStep} of 3
            </Badge>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              {stepTitles.map((title, index) => (
                <div
                  key={index}
                  className={`text-sm ${
                    index + 1 <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  {title}
                </div>
              ))}
            </div>
            <Progress value={(currentStep / 3) * 100} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Service Details</h3>
              
              {/* Facility Selection */}
              <div className="space-y-2">
                <Label htmlFor="facility">Facility *</Label>
                <Select
                  value={formData.facilityId}
                  onValueChange={(value) => updateFormData('facilityId', value)}
                  disabled={!!facilityId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.name} - {facility.city}, {facility.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.facilityId && (
                  <p className="text-sm text-red-600">{errors.facilityId}</p>
                )}
              </div>

              {/* Service Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the service needed"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the issue or service needed..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Service Category */}
              <div className="space-y-2">
                <Label>Service Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateFormData('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LIGHTING_SYSTEMS">Lighting Systems</SelectItem>
                    <SelectItem value="HVAC_CLIMATE_CONTROL">HVAC & Climate Control</SelectItem>
                    <SelectItem value="IRRIGATION_FERTIGATION">Irrigation & Fertigation</SelectItem>
                    <SelectItem value="ELECTRICAL_SYSTEMS">Electrical Systems</SelectItem>
                    <SelectItem value="AUTOMATION_CONTROLS">Automation & Controls</SelectItem>
                    <SelectItem value="PEST_MANAGEMENT">Pest Management</SelectItem>
                    <SelectItem value="EQUIPMENT_INSTALLATION">Equipment Installation</SelectItem>
                    <SelectItem value="EQUIPMENT_REPAIR">Equipment Repair</SelectItem>
                    <SelectItem value="PREVENTIVE_MAINTENANCE">Preventive Maintenance</SelectItem>
                    <SelectItem value="EMERGENCY_SERVICES">Emergency Services</SelectItem>
                    <SelectItem value="CONSULTATION">Consultation</SelectItem>
                    <SelectItem value="TRAINING">Training</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              {/* Priority and Urgency */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => updateFormData('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Urgency</Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value) => updateFormData('urgency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STANDARD">Standard</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                      <SelectItem value="EMERGENCY">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Location & Equipment</h3>

              {/* Equipment Selection */}
              <div className="space-y-2">
                <Label>Related Equipment (Optional)</Label>
                <Select
                  value={formData.equipmentId}
                  onValueChange={(value) => updateFormData('equipmentId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment if applicable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific equipment</SelectItem>
                    {equipment.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.manufacturer} {item.model})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Specific Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Specific Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Greenhouse 2, Zone A, Room 101"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                />
              </div>

              {/* Access Instructions */}
              <div className="space-y-2">
                <Label htmlFor="accessInstructions">Access Instructions</Label>
                <Textarea
                  id="accessInstructions"
                  placeholder="Provide instructions for accessing the location (codes, keys, safety requirements, etc.)"
                  rows={3}
                  value={formData.accessInstructions}
                  onChange={(e) => updateFormData('accessInstructions', e.target.value)}
                />
              </div>

              {/* Photo Upload Placeholder */}
              <div className="space-y-2">
                <Label>Photos (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Upload photos to help service providers understand the issue
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Choose Files
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Budget & Timing</h3>

              {/* Emergency Service */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <Label htmlFor="emergency">Emergency Service</Label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Requires immediate attention (within 2-4 hours)
                  </p>
                </div>
                <Switch
                  id="emergency"
                  checked={formData.emergencyService}
                  onCheckedChange={(checked) => updateFormData('emergencyService', checked)}
                />
              </div>

              {formData.emergencyService && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Emergency services typically cost 50-100% more than standard rates due to immediate response requirements.
                  </AlertDescription>
                </Alert>
              )}

              {/* Budget Range */}
              <div className="space-y-2">
                <Label>Budget Range</Label>
                <Select
                  value={formData.budgetRange}
                  onValueChange={(value) => updateFormData('budgetRange', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No preference</SelectItem>
                    <SelectItem value="under-500">Under $500</SelectItem>
                    <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                    <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                    <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                    <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                    <SelectItem value="over-10000">Over $10,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Maximum Budget */}
              <div className="space-y-2">
                <Label htmlFor="maxBudget">Maximum Budget</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="maxBudget"
                    type="number"
                    placeholder="Enter maximum budget"
                    value={formData.maxBudget || ''}
                    onChange={(e) => updateFormData('maxBudget', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="pl-10"
                  />
                </div>
                {errors.maxBudget && (
                  <p className="text-sm text-red-600">{errors.maxBudget}</p>
                )}
              </div>

              {/* Preferred Date */}
              <div className="space-y-2">
                <Label htmlFor="preferredDate">Preferred Date</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => updateFormData('preferredDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Flexible Timing */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="flexible">Flexible Timing</Label>
                  <p className="text-sm text-gray-600">
                    Allow service provider to suggest alternative dates
                  </p>
                </div>
                <Switch
                  id="flexible"
                  checked={formData.flexibleTiming}
                  onCheckedChange={(checked) => updateFormData('flexibleTiming', checked)}
                />
              </div>

              {/* Bidding Settings */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="bidding">Enable Competitive Bidding</Label>
                    <p className="text-sm text-gray-600">
                      Allow multiple providers to submit bids
                    </p>
                  </div>
                  <Switch
                    id="bidding"
                    checked={formData.biddingEnabled}
                    onCheckedChange={(checked) => updateFormData('biddingEnabled', checked)}
                  />
                </div>

                {formData.biddingEnabled && (
                  <div className="space-y-2">
                    <Label>Bidding Period</Label>
                    <Select
                      value={formData.biddingDays.toString()}
                      onValueChange={(value) => updateFormData('biddingDays', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="2">2 days</SelectItem>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="5">5 days</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
              )}
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              {currentStep < 3 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}