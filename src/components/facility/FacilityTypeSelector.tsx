'use client';

import { useState } from 'react';
import { 
  Cannabis, 
  Apple, 
  Flower, 
  FlaskConical,
  Check,
  ArrowRight,
  Building,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FacilityType, FACILITY_TYPE_CONFIGS } from '@/lib/facility-types';

interface FacilityTypeSelectorProps {
  currentType?: FacilityType;
  onTypeSelect: (type: FacilityType) => void;
  showDescription?: boolean;
}

export function FacilityTypeSelector({ 
  currentType, 
  onTypeSelect,
  showDescription = true 
}: FacilityTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<FacilityType | null>(currentType || null);

  const getIcon = (type: FacilityType) => {
    switch (type) {
      case FacilityType.CANNABIS:
        return <Cannabis className="w-8 h-8" />;
      case FacilityType.PRODUCE:
        return <Apple className="w-8 h-8" />;
      case FacilityType.ORNAMENTAL:
        return <Flower className="w-8 h-8" />;
      case FacilityType.RESEARCH:
        return <FlaskConical className="w-8 h-8" />;
    }
  };

  const getIconColor = (type: FacilityType) => {
    switch (type) {
      case FacilityType.CANNABIS:
        return 'text-green-600';
      case FacilityType.PRODUCE:
        return 'text-red-600';
      case FacilityType.ORNAMENTAL:
        return 'text-pink-600';
      case FacilityType.RESEARCH:
        return 'text-purple-600';
    }
  };

  const handleConfirm = () => {
    if (selectedType) {
      onTypeSelect(selectedType);
    }
  };

  return (
    <div className="space-y-6">
      {showDescription && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Select Your Facility Type</h2>
          <p className="text-gray-400">
            Choose the type that best describes your operation. This will customize VibeLux 
            with industry-specific features, metrics, and compliance tools.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(FacilityType).map((type) => {
          const config = FACILITY_TYPE_CONFIGS[type];
          const isSelected = selectedType === type;
          const isCurrent = currentType === type;

          return (
            <Card 
              key={type}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'border-purple-600 bg-purple-900/20' 
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }`}
              onClick={() => setSelectedType(type)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={getIconColor(type)}>
                      {getIcon(type)}
                    </div>
                    <span className="text-white">{config.displayName}</span>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-purple-500" />}
                  {isCurrent && !isSelected && (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                      Current
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {config.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Key Features */}
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">Key Features:</p>
                    <div className="flex flex-wrap gap-2">
                      {config.features.trackTrace && (
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                          Track & Trace
                        </span>
                      )}
                      {config.features.organicCertification && (
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                          Organic Cert
                        </span>
                      )}
                      {config.features.gapCertification && (
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                          GAP Certified
                        </span>
                      )}
                      {config.features.fsmaCompliance && (
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                          FSMA Compliant
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sample Metrics */}
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">Tracks metrics like:</p>
                    <p className="text-xs text-gray-400">
                      {config.metrics.slice(0, 3).join(', ')}...
                    </p>
                  </div>

                  {/* Integrations */}
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">Integrations:</p>
                    <p className="text-xs text-gray-400">
                      {config.integrations.slice(0, 3).join(', ')}...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedType && selectedType !== currentType && (
        <Alert className="bg-blue-900/20 border-blue-600/50">
          <Info className="w-4 h-4 text-blue-400" />
          <AlertDescription className="text-blue-300">
            <strong>Important:</strong> Changing your facility type will:
            <ul className="list-disc list-inside mt-2 text-sm">
              <li>Update available features and integrations</li>
              <li>Change which metrics are tracked and displayed</li>
              <li>Modify compliance and reporting options</li>
              <li>Your existing data will be preserved</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-3">
        {currentType && (
          <Button 
            variant="outline"
            onClick={() => setSelectedType(currentType)}
          >
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleConfirm}
          disabled={!selectedType || selectedType === currentType}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {currentType ? 'Update Facility Type' : 'Continue'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}