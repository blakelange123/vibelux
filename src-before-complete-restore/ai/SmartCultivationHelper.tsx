'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  Sparkles,
  DollarSign,
  Database,
  Zap,
  Info,
  ChevronRight
} from 'lucide-react';

interface SmartCultivationHelperProps {
  currentEnvironment: {
    temperature: number;
    humidity: number;
    ppfd: number;
    co2?: number;
  };
  strain: string;
  growthStage: string;
}

export function SmartCultivationHelper({
  currentEnvironment,
  strain,
  growthStage
}: SmartCultivationHelperProps) {
  const [advice, setAdvice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showCostInfo, setShowCostInfo] = useState(false);

  const getSmartAdvice = async () => {
    setLoading(true);
    
    // Simulate API call to cost-optimized service
    setTimeout(() => {
      // This would actually call the optimized AI service
      setAdvice({
        recommendations: [
          "Temperature is 5°F above optimal for flowering - reduce to 72-75°F",
          "Humidity at 60% risks bud rot - decrease to 45-50% immediately",
          "Light intensity optimal at 800 PPFD for late flowering"
        ],
        source: 'local_knowledge_base', // or 'ai' if complex query
        confidence: 0.95,
        cost: 0, // $0 for local knowledge
        cached: false
      });
      setLoading(false);
    }, 500);
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Smart Cultivation Helper
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowCostInfo(!showCostInfo)}
          >
            <DollarSign className="w-4 h-4 mr-1" />
            Cost Info
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showCostInfo && (
          <Alert className="mb-4 bg-blue-900/20 border-blue-700">
            <Info className="w-4 h-4" />
            <AlertDescription>
              <strong>AI Cost Structure:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Simple queries: $0 (local knowledge base)</li>
                <li>• Complex diagnosis: ~$0.002 (Haiku model)</li>
                <li>• Advanced analysis: ~$0.06 (Opus model)</li>
                <li>• Cached responses: $0 (1 hour cache)</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Current Status */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="p-2 bg-gray-800 rounded">
              <p className="text-gray-400">Temp</p>
              <p className="font-bold">{currentEnvironment.temperature}°F</p>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <p className="text-gray-400">RH</p>
              <p className="font-bold">{currentEnvironment.humidity}%</p>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <p className="text-gray-400">PPFD</p>
              <p className="font-bold">{currentEnvironment.ppfd}</p>
            </div>
          </div>

          {/* Get Advice Button */}
          <Button
            onClick={getSmartAdvice}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? (
              <>Getting Smart Advice...</>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get Cultivation Advice
              </>
            )}
          </Button>

          {/* Advice Display */}
          {advice && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={advice.source === 'ai' ? 'default' : 'outline'}>
                  {advice.source === 'ai' ? (
                    <>
                      <Zap className="w-3 h-3 mr-1" />
                      AI Generated
                    </>
                  ) : (
                    <>
                      <Database className="w-3 h-3 mr-1" />
                      Local Knowledge
                    </>
                  )}
                </Badge>
                <span className="text-xs text-gray-400">
                  Cost: {advice.cost === 0 ? 'Free' : `$${advice.cost.toFixed(3)}`}
                  {advice.cached && ' (cached)'}
                </span>
              </div>

              <div className="space-y-2">
                {advice.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-gray-800 rounded-lg">
                    <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5" />
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <span className="text-xs text-gray-400">
                  Confidence: {Math.round(advice.confidence * 100)}%
                </span>
                <Button size="sm" variant="ghost">
                  Was this helpful?
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}