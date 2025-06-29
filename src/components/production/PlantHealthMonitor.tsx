'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Leaf, 
  Droplets, 
  Sun, 
  Thermometer,
  Save,
  History,
  TrendingUp,
  Phone,
  Mail
} from 'lucide-react';

// Types based on our database schema
interface PlantHealthReading {
  id: string;
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  stressLevel: number;
  fvFm?: number;
  leafColor: 'green' | 'yellow-green' | 'yellow' | 'brown';
  leafWilting: 'none' | 'slight' | 'moderate' | 'severe';
  growthRate: 'excellent' | 'good' | 'slow' | 'stunted';
  temperature?: number;
  humidity?: number;
  lightLevel: 'low' | 'adequate' | 'high' | 'excessive';
  soilMoisture: 'dry' | 'moist' | 'wet' | 'waterlogged';
  pestsDetected: boolean;
  diseaseSymptoms: boolean;
  nutrientDeficiency: boolean;
  waterStress: boolean;
  lightStress: boolean;
  actionRequired: 'immediate' | 'within_24h' | 'within_week' | 'routine_monitoring';
  recommendations: string[];
  photoUrl?: string;
  notes?: string;
  timestamp: string;
}

interface FormData {
  facilityId: string;
  cropId: string;
  growingZoneId?: string;
  leafColor: string;
  leafWilting: string;
  growthRate: string;
  temperature: string;
  humidity: string;
  lightLevel: string;
  soilMoisture: string;
  pestsDetected: boolean;
  diseaseSymptoms: boolean;
  nutrientDeficiency: boolean;
  waterStress: boolean;
  lightStress: boolean;
  notes: string;
  photoFile?: File;
}

interface ValidationErrors {
  [key: string]: string;
}

// Health status configurations
const healthConfig = {
  excellent: {
    color: '#22c55e',
    bgColor: '#dcfce7',
    icon: CheckCircle,
    description: 'Plants are thriving with optimal growth conditions'
  },
  good: {
    color: '#84cc16',
    bgColor: '#ecfccb',
    icon: CheckCircle,
    description: 'Plants are healthy with minor optimization opportunities'
  },
  fair: {
    color: '#eab308',
    bgColor: '#fefce8',
    icon: AlertTriangle,
    description: 'Plants showing stress signs requiring attention'
  },
  poor: {
    color: '#f97316',
    bgColor: '#fff7ed',
    icon: AlertTriangle,
    description: 'Plants under significant stress needing immediate action'
  },
  critical: {
    color: '#ef4444',
    bgColor: '#fef2f2',
    icon: XCircle,
    description: 'Critical plant health issues requiring emergency response'
  }
};

const actionPriorityConfig = {
  immediate: { color: '#ef4444', text: 'IMMEDIATE ACTION REQUIRED' },
  within_24h: { color: '#f97316', text: 'Action needed within 24 hours' },
  within_week: { color: '#eab308', text: 'Address within this week' },
  routine_monitoring: { color: '#22c55e', text: 'Continue routine monitoring' }
};

export default function PlantHealthMonitor() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentReading, setCurrentReading] = useState<PlantHealthReading | null>(null);
  const [historicalData, setHistoricalData] = useState<PlantHealthReading[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    facilityId: '',
    cropId: '',
    growingZoneId: '',
    leafColor: 'green',
    leafWilting: 'none',
    growthRate: 'good',
    temperature: '',
    humidity: '',
    lightLevel: 'adequate',
    soilMoisture: 'moist',
    pestsDetected: false,
    diseaseSymptoms: false,
    nutrientDeficiency: false,
    waterStress: false,
    lightStress: false,
    notes: ''
  });

  // Mock data for demo - In production, this would come from your database
  const [facilities] = useState([
    { id: '1', name: 'Greenhouse A' },
    { id: '2', name: 'Greenhouse B' },
    { id: '3', name: 'Indoor Facility 1' }
  ]);

  const [crops] = useState([
    { id: '1', name: 'Tomatoes - Cherry', facilityId: '1' },
    { id: '2', name: 'Lettuce - Butterhead', facilityId: '1' },
    { id: '3', name: 'Cannabis - Strain A', facilityId: '2' }
  ]);

  // Input validation
  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!formData.facilityId) {
      errors.facilityId = 'Please select a facility';
    }

    if (!formData.cropId) {
      errors.cropId = 'Please select a crop';
    }

    if (formData.temperature && (parseFloat(formData.temperature) < 0 || parseFloat(formData.temperature) > 50)) {
      errors.temperature = 'Temperature must be between 0-50°C';
    }

    if (formData.humidity && (parseFloat(formData.humidity) < 0 || parseFloat(formData.humidity) > 100)) {
      errors.humidity = 'Humidity must be between 0-100%';
    }

    return errors;
  };

  // Calculate plant health based on input parameters
  const calculatePlantHealth = (data: FormData): PlantHealthReading => {
    let stressPoints = 0;
    let healthIssues: string[] = [];
    let recommendations: string[] = [];

    // Analyze visual symptoms
    if (data.leafColor !== 'green') {
      stressPoints += data.leafColor === 'yellow' ? 25 : data.leafColor === 'brown' ? 40 : 15;
      healthIssues.push('Leaf discoloration detected');
      
      if (data.leafColor === 'yellow') {
        recommendations.push('Check nitrogen levels and pH balance');
      } else if (data.leafColor === 'brown') {
        recommendations.push('Immediate attention needed - possible disease or severe nutrient deficiency');
      }
    }

    if (data.leafWilting !== 'none') {
      stressPoints += data.leafWilting === 'severe' ? 35 : data.leafWilting === 'moderate' ? 20 : 10;
      healthIssues.push('Leaf wilting observed');
      recommendations.push('Check soil moisture and root health');
    }

    if (data.growthRate === 'slow') {
      stressPoints += 15;
    } else if (data.growthRate === 'stunted') {
      stressPoints += 30;
      recommendations.push('Evaluate lighting, nutrition, and environmental conditions');
    }

    // Environmental stress factors
    if (data.lightLevel === 'low') {
      stressPoints += 20;
      recommendations.push('Increase light intensity or duration');
    } else if (data.lightLevel === 'excessive') {
      stressPoints += 15;
      recommendations.push('Reduce light intensity to prevent photo-bleaching');
    }

    if (data.soilMoisture === 'dry') {
      stressPoints += 25;
      recommendations.push('Increase irrigation frequency');
    } else if (data.soilMoisture === 'waterlogged') {
      stressPoints += 30;
      recommendations.push('Improve drainage and reduce watering');
    }

    // Direct stress indicators
    if (data.pestsDetected) {
      stressPoints += 25;
      recommendations.push('Implement integrated pest management strategies');
    }

    if (data.diseaseSymptoms) {
      stressPoints += 35;
      recommendations.push('Consult plant pathologist for disease identification and treatment');
    }

    if (data.nutrientDeficiency) {
      stressPoints += 20;
      recommendations.push('Adjust fertilizer program based on tissue analysis');
    }

    if (data.waterStress) {
      stressPoints += 20;
      recommendations.push('Optimize irrigation schedule and check for root issues');
    }

    if (data.lightStress) {
      stressPoints += 15;
      recommendations.push('Adjust light levels and check for heat stress');
    }

    // Determine overall health
    let overallHealth: PlantHealthReading['overallHealth'] = 'excellent';
    let actionRequired: PlantHealthReading['actionRequired'] = 'routine_monitoring';

    if (stressPoints >= 80) {
      overallHealth = 'critical';
      actionRequired = 'immediate';
    } else if (stressPoints >= 60) {
      overallHealth = 'poor';
      actionRequired = 'within_24h';
    } else if (stressPoints >= 40) {
      overallHealth = 'fair';
      actionRequired = 'within_week';
    } else if (stressPoints >= 20) {
      overallHealth = 'good';
      actionRequired = 'routine_monitoring';
    }

    // Add general recommendations based on health status
    if (overallHealth === 'excellent') {
      recommendations.unshift('Continue current management practices');
    } else if (overallHealth === 'critical') {
      recommendations.unshift('Emergency consultation recommended - contact your agronomist');
    }

    return {
      id: Date.now().toString(),
      overallHealth,
      stressLevel: Math.min(100, stressPoints),
      leafColor: data.leafColor as PlantHealthReading['leafColor'],
      leafWilting: data.leafWilting as PlantHealthReading['leafWilting'],
      growthRate: data.growthRate as PlantHealthReading['growthRate'],
      temperature: data.temperature ? parseFloat(data.temperature) : undefined,
      humidity: data.humidity ? parseFloat(data.humidity) : undefined,
      lightLevel: data.lightLevel as PlantHealthReading['lightLevel'],
      soilMoisture: data.soilMoisture as PlantHealthReading['soilMoisture'],
      pestsDetected: data.pestsDetected,
      diseaseSymptoms: data.diseaseSymptoms,
      nutrientDeficiency: data.nutrientDeficiency,
      waterStress: data.waterStress,
      lightStress: data.lightStress,
      actionRequired,
      recommendations: recommendations.length > 0 ? recommendations : ['Plants appear healthy - maintain current conditions'],
      notes: data.notes,
      timestamp: new Date().toISOString()
    };
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please upload an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrorMessage('Image file must be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, photoFile: file }));
      setErrorMessage('');
    }
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSaving(true);

    try {
      // Calculate plant health
      const reading = calculatePlantHealth(formData);
      
      // In production, this would save to your database
      // await saveToDatabase(reading);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentReading(reading);
      setHistoricalData(prev => [reading, ...prev.slice(0, 9)]); // Keep last 10 readings
      setSuccessMessage('Plant health assessment completed successfully');
      
      // Reset form for next reading
      setFormData(prev => ({
        ...prev,
        notes: '',
        photoFile: undefined,
        pestsDetected: false,
        diseaseSymptoms: false,
        nutrientDeficiency: false,
        waterStress: false,
        lightStress: false
      }));
      
    } catch (error) {
      setErrorMessage('Failed to save plant health reading. Please try again.');
      console.error('Error saving plant health reading:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCrops = crops.filter(crop => crop.facilityId === formData.facilityId);

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Plant Health Monitor</h1>
        <p className="text-gray-600">Quick and easy plant health assessment for your crops</p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="border-red-500 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assessment Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Leaf className="w-5 h-5 mr-2 text-green-600" />
              Plant Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facility">Facility *</Label>
                <Select 
                  value={formData.facilityId} 
                  onValueChange={(value) => handleInputChange('facilityId', value)}
                >
                  <SelectTrigger className={validationErrors.facilityId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map(facility => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.facilityId && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.facilityId}</p>
                )}
              </div>

              <div>
                <Label htmlFor="crop">Crop *</Label>
                <Select 
                  value={formData.cropId} 
                  onValueChange={(value) => handleInputChange('cropId', value)}
                  disabled={!formData.facilityId}
                >
                  <SelectTrigger className={validationErrors.cropId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCrops.map(crop => (
                      <SelectItem key={crop.id} value={crop.id}>
                        {crop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.cropId && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.cropId}</p>
                )}
              </div>
            </div>

            {/* Visual Assessment */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Leaf className="w-5 h-5 mr-2" />
                Visual Assessment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Leaf Color</Label>
                  <Select 
                    value={formData.leafColor} 
                    onValueChange={(value) => handleInputChange('leafColor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="green">Healthy Green</SelectItem>
                      <SelectItem value="yellow-green">Yellow-Green</SelectItem>
                      <SelectItem value="yellow">Yellow</SelectItem>
                      <SelectItem value="brown">Brown/Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Leaf Wilting</Label>
                  <Select 
                    value={formData.leafWilting} 
                    onValueChange={(value) => handleInputChange('leafWilting', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Wilting</SelectItem>
                      <SelectItem value="slight">Slight Wilting</SelectItem>
                      <SelectItem value="moderate">Moderate Wilting</SelectItem>
                      <SelectItem value="severe">Severe Wilting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Growth Rate</Label>
                  <Select 
                    value={formData.growthRate} 
                    onValueChange={(value) => handleInputChange('growthRate', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="stunted">Stunted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Environmental Conditions */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Thermometer className="w-5 h-5 mr-2" />
                Environmental Conditions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Temperature (°C)</Label>
                  <Input 
                    type="number" 
                    placeholder="22"
                    value={formData.temperature}
                    onChange={(e) => handleInputChange('temperature', e.target.value)}
                    className={validationErrors.temperature ? 'border-red-500' : ''}
                  />
                  {validationErrors.temperature && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.temperature}</p>
                  )}
                </div>

                <div>
                  <Label>Humidity (%)</Label>
                  <Input 
                    type="number" 
                    placeholder="65"
                    value={formData.humidity}
                    onChange={(e) => handleInputChange('humidity', e.target.value)}
                    className={validationErrors.humidity ? 'border-red-500' : ''}
                  />
                  {validationErrors.humidity && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.humidity}</p>
                  )}
                </div>

                <div>
                  <Label>Light Level</Label>
                  <Select 
                    value={formData.lightLevel} 
                    onValueChange={(value) => handleInputChange('lightLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="adequate">Adequate</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="excessive">Excessive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Soil Moisture</Label>
                  <Select 
                    value={formData.soilMoisture} 
                    onValueChange={(value) => handleInputChange('soilMoisture', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dry">Dry</SelectItem>
                      <SelectItem value="moist">Moist</SelectItem>
                      <SelectItem value="wet">Wet</SelectItem>
                      <SelectItem value="waterlogged">Waterlogged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Stress Indicators */}
            <div>
              <h3 className="text-lg font-medium mb-4">Stress Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'pestsDetected', label: 'Pests Detected', icon: '🐛' },
                  { key: 'diseaseSymptoms', label: 'Disease Symptoms', icon: '🦠' },
                  { key: 'nutrientDeficiency', label: 'Nutrient Deficiency', icon: '🧪' },
                  { key: 'waterStress', label: 'Water Stress', icon: '💧' },
                  { key: 'lightStress', label: 'Light Stress', icon: '☀️' }
                ].map(item => (
                  <label key={item.key} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[item.key as keyof FormData] as boolean}
                      onChange={(e) => handleInputChange(item.key as keyof FormData, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <Label>Plant Photo (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {formData.photoFile ? formData.photoFile.name : 'Click to upload plant photo'}
                  </p>
                  <p className="text-xs text-gray-500">Max 5MB, JPG/PNG</p>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>Additional Notes</Label>
              <Textarea
                placeholder="Any additional observations or comments..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Complete Health Assessment
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Current Health Status */}
          {currentReading && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Health Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="text-center p-6 rounded-lg mb-4"
                  style={{ backgroundColor: healthConfig[currentReading.overallHealth].bgColor }}
                >
                  <div className="flex items-center justify-center mb-2">
                    {React.createElement(healthConfig[currentReading.overallHealth].icon, {
                      className: "w-8 h-8",
                      style: { color: healthConfig[currentReading.overallHealth].color }
                    })}
                  </div>
                  <h3 
                    className="text-2xl font-bold capitalize mb-2"
                    style={{ color: healthConfig[currentReading.overallHealth].color }}
                  >
                    {currentReading.overallHealth}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {healthConfig[currentReading.overallHealth].description}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Stress Level</Label>
                    <Progress value={currentReading.stressLevel} className="mt-1" />
                    <p className="text-sm text-gray-600 mt-1">{currentReading.stressLevel}% stress detected</p>
                  </div>

                  <div 
                    className="p-3 rounded-lg"
                    style={{ 
                      backgroundColor: actionPriorityConfig[currentReading.actionRequired].color + '20',
                      borderLeft: `4px solid ${actionPriorityConfig[currentReading.actionRequired].color}`
                    }}
                  >
                    <p 
                      className="font-medium text-sm"
                      style={{ color: actionPriorityConfig[currentReading.actionRequired].color }}
                    >
                      {actionPriorityConfig[currentReading.actionRequired].text}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {currentReading && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentReading.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>

                {currentReading.actionRequired === 'immediate' && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800 mb-2">Emergency Contact</p>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-red-700">
                        <Phone className="w-4 h-4 mr-2" />
                        Agronomist: (555) 123-4567
                      </div>
                      <div className="flex items-center text-sm text-red-700">
                        <Mail className="w-4 h-4 mr-2" />
                        emergency@vibelux.com
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* History Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  History
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  {showHistory ? 'Hide' : 'Show'} History
                </Button>
              </CardTitle>
            </CardHeader>
            {showHistory && (
              <CardContent>
                {historicalData.length > 0 ? (
                  <div className="space-y-3">
                    {historicalData.slice(0, 5).map((reading, index) => (
                      <div key={reading.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium capitalize">{reading.overallHealth}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(reading.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant="outline"
                          style={{ color: healthConfig[reading.overallHealth].color }}
                        >
                          {reading.stressLevel}% stress
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No previous readings
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}