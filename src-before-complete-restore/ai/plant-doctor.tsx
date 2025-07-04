'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Stethoscope, 
  Camera, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  Clock,
  DollarSign,
  TrendingUp,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

interface PlantDoctorProps {
  facilityId: string;
}

interface DiagnosisResult {
  diagnosis: string;
  likelihood: number;
  causes: string[];
  solutions: Array<{
    solution: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeframe: string;
    cost: string;
    effectiveness: number;
  }>;
  prevention: string[];
}

export function PlantDoctor({ facilityId }: PlantDoctorProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptoms, setCustomSymptoms] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const symptomCategories = {
    'Leaves': [
      'Yellowing leaves',
      'Brown spots on leaves',
      'Curling leaves',
      'Drooping leaves',
      'Purple/red leaves',
      'White spots/powder',
      'Holes in leaves',
      'Dry/crispy edges',
      'Dark patches',
      'Stunted leaf growth'
    ],
    'Growth': [
      'Slow growth',
      'Stunted plants',
      'Stretching/elongation',
      'Weak stems',
      'Poor root development',
      'Uneven growth',
      'Wilting',
      'Drooping branches'
    ],
    'Flowers/Buds': [
      'Poor bud development',
      'Airy/loose buds',
      'Brown pistils',
      'Mold on buds',
      'Small flower size',
      'Premature flowering',
      'Hermaphroditism'
    ],
    'Environmental': [
      'Spider mites visible',
      'Aphids present',
      'Fungus gnats',
      'White flies',
      'Thrips damage',
      'Caterpillars',
      'Other pest activity',
      'Mold/mildew smell',
      'Unusual odors'
    ]
  };

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 5)); // Max 5 images
  };

  const handleDiagnose = async () => {
    if (selectedSymptoms.length === 0 && !customSymptoms.trim()) {
      toast.error('Please select symptoms or describe the issue');
      return;
    }

    setLoading(true);
    
    try {
      const allSymptoms = [
        ...selectedSymptoms,
        ...(customSymptoms.trim() ? [customSymptoms] : [])
      ];

      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: allSymptoms,
          facilityId,
          images: images.map(img => img.name), // In real app, upload images first
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setDiagnosis(result);
        setStep(3);
        toast.success('Diagnosis complete!');
      } else {
        throw new Error('Failed to get diagnosis');
      }
    } catch (error) {
      toast.error('Failed to diagnose issue');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetDiagnosis = () => {
    setSelectedSymptoms([]);
    setCustomSymptoms('');
    setImages([]);
    setDiagnosis(null);
    setStep(1);
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-blue-600" />
            VibeLux Plant Doctor
          </CardTitle>
          <CardDescription>
            AI-powered plant health diagnosis and treatment recommendations
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className="text-sm">Symptoms</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className="text-sm">Photos</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <span className="text-sm">Diagnosis</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Describe Symptoms</CardTitle>
            <CardDescription>
              Select all symptoms you're observing in your plants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(symptomCategories).map(([category, symptoms]) => (
              <div key={category}>
                <h4 className="font-semibold mb-3">{category}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {symptoms.map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox
                        id={symptom}
                        checked={selectedSymptoms.includes(symptom)}
                        onCheckedChange={() => handleSymptomToggle(symptom)}
                      />
                      <Label 
                        htmlFor={symptom} 
                        className="text-sm cursor-pointer"
                      >
                        {symptom}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <Label htmlFor="custom-symptoms">Additional Details</Label>
              <Textarea
                id="custom-symptoms"
                value={customSymptoms}
                onChange={(e) => setCustomSymptoms(e.target.value)}
                placeholder="Describe any other symptoms, environmental conditions, or details that might be relevant..."
                className="mt-2"
                rows={4}
              />
            </div>

            <div className="flex justify-between">
              <div className="text-sm text-gray-600">
                Selected symptoms: {selectedSymptoms.length}
              </div>
              <Button 
                onClick={() => setStep(2)}
                disabled={selectedSymptoms.length === 0 && !customSymptoms.trim()}
              >
                Next: Add Photos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Upload Photos (Optional)</CardTitle>
            <CardDescription>
              Photos help improve diagnosis accuracy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Upload photos of affected plants (up to 5 images)
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Button asChild variant="outline">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Photos
                </label>
              </Button>
            </div>

            {images.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Uploaded Images ({images.length}/5)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Plant ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleDiagnose} disabled={loading}>
                {loading ? 'Analyzing...' : 'Get Diagnosis'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && diagnosis && (
        <div className="space-y-6">
          {/* Diagnosis Result */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Diagnosis Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Primary Diagnosis</h3>
                <p className="text-blue-800">{diagnosis.diagnosis}</p>
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-blue-700">Confidence Level</span>
                    <span className="text-sm font-medium text-blue-900">
                      {(diagnosis.likelihood * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={diagnosis.likelihood * 100} className="h-2" />
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Likely Causes</h4>
                <ul className="space-y-1">
                  {diagnosis.causes.map((cause, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Treatment Solutions */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Treatments</CardTitle>
              <CardDescription>
                Solutions ranked by effectiveness and ease of implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {diagnosis.solutions.map((solution, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold">{solution.solution}</h4>
                      <div className="flex space-x-2">
                        <Badge className={difficultyColors[solution.difficulty]}>
                          {solution.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          {(solution.effectiveness * 100).toFixed(0)}% effective
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{solution.timeframe}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span>{solution.cost}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <span>{(solution.effectiveness * 100).toFixed(0)}% success rate</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prevention Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Prevention Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {diagnosis.prevention.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button onClick={resetDiagnosis} variant="outline">
              New Diagnosis
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}