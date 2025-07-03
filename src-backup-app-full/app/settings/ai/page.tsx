'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Brain,
  DollarSign,
  Zap,
  Database,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
  Info,
  Save
} from 'lucide-react';

export default function AISettingsPage() {
  const [settings, setSettings] = useState({
    enabled: true,
    monthlyLimit: 1000,
    useCache: true,
    cacheHours: 1,
    fallbackMode: true,
    complexQueriesOnly: true,
    preferLocalKnowledge: true,
    model: 'haiku', // 'haiku' or 'opus'
    maxResponseLength: 500
  });

  const [usage, setUsage] = useState({
    requestsThisMonth: 47,
    monthlyLimit: 1000,
    remainingRequests: 953,
    cacheHitRate: '68%',
    estimatedMonthlyCost: '$0.94',
    savedByCaching: '$2.12'
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save settings
    localStorage.setItem('ai-settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const estimateMonthlyCost = () => {
    const baseRate = settings.model === 'opus' ? 0.06 : 0.002; // per request
    const cacheReduction = settings.useCache ? 0.6 : 1; // 60% reduction with cache
    const complexOnly = settings.complexQueriesOnly ? 0.3 : 1; // 70% reduction
    
    const estimatedRequests = settings.monthlyLimit * 0.5; // Assume 50% usage
    const cost = estimatedRequests * baseRate * cacheReduction * complexOnly;
    
    return `$${cost.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Settings</h1>
          <p className="text-gray-400">Configure Claude AI integration and monitor usage</p>
        </div>

        {/* Usage Overview */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Current Month Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-400">Requests Used</p>
                <p className="text-2xl font-bold">{usage.requestsThisMonth}</p>
                <p className="text-xs text-gray-500">of {usage.monthlyLimit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Remaining</p>
                <p className="text-2xl font-bold text-green-400">{usage.remainingRequests}</p>
                <p className="text-xs text-gray-500">this month</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-blue-400">{usage.cacheHitRate}</p>
                <p className="text-xs text-gray-500">saved: {usage.savedByCaching}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Est. Cost</p>
                <p className="text-2xl font-bold text-yellow-400">{usage.estimatedMonthlyCost}</p>
                <p className="text-xs text-gray-500">this month</p>
              </div>
            </div>

            {/* Usage bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Monthly Usage</span>
                <span>{Math.round((usage.requestsThisMonth / usage.monthlyLimit) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                  style={{ width: `${(usage.requestsThisMonth / usage.monthlyLimit) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Optimization Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Cost Optimization
            </CardTitle>
            <CardDescription>Configure settings to minimize AI costs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable AI */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium">Enable AI Features</label>
                <p className="text-xs text-gray-400">Turn off to disable all AI functionality</p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings({...settings, enabled: checked})}
              />
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Model</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSettings({...settings, model: 'haiku'})}
                  className={`p-4 rounded-lg border transition-all ${
                    settings.model === 'haiku'
                      ? 'bg-purple-900/20 border-purple-600'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <h4 className="font-medium mb-1">Claude Haiku</h4>
                  <p className="text-xs text-gray-400">Fast & affordable</p>
                  <p className="text-sm text-green-400 mt-2">~$0.002/request</p>
                </button>
                <button
                  onClick={() => setSettings({...settings, model: 'opus'})}
                  className={`p-4 rounded-lg border transition-all ${
                    settings.model === 'opus'
                      ? 'bg-purple-900/20 border-purple-600'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <h4 className="font-medium mb-1">Claude Opus</h4>
                  <p className="text-xs text-gray-400">Most capable</p>
                  <p className="text-sm text-yellow-400 mt-2">~$0.06/request</p>
                </button>
              </div>
            </div>

            {/* Monthly Limit */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Monthly Request Limit</label>
                <span className="text-sm text-gray-400">{settings.monthlyLimit} requests</span>
              </div>
              <Slider
                value={[settings.monthlyLimit]}
                onValueChange={([value]) => setSettings({...settings, monthlyLimit: value})}
                min={100}
                max={5000}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>100</span>
                <span>Conservative</span>
                <span>Liberal</span>
                <span>5000</span>
              </div>
            </div>

            {/* Cache Settings */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium">Enable Response Caching</label>
                <p className="text-xs text-gray-400">Cache similar queries to reduce API calls</p>
              </div>
              <Switch
                checked={settings.useCache}
                onCheckedChange={(checked) => setSettings({...settings, useCache: checked})}
              />
            </div>

            {/* Local Knowledge */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium">Prefer Local Knowledge Base</label>
                <p className="text-xs text-gray-400">Use built-in cultivation data when possible</p>
              </div>
              <Switch
                checked={settings.preferLocalKnowledge}
                onCheckedChange={(checked) => setSettings({...settings, preferLocalKnowledge: checked})}
              />
            </div>

            {/* Complex Queries Only */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium">AI for Complex Queries Only</label>
                <p className="text-xs text-gray-400">Simple questions use local knowledge</p>
              </div>
              <Switch
                checked={settings.complexQueriesOnly}
                onCheckedChange={(checked) => setSettings({...settings, complexQueriesOnly: checked})}
              />
            </div>

            {/* Estimated Cost */}
            <Alert className="bg-green-900/20 border-green-700">
              <DollarSign className="w-4 h-4" />
              <AlertTitle>Estimated Monthly Cost</AlertTitle>
              <AlertDescription>
                Based on your settings: <span className="font-bold text-lg">{estimateMonthlyCost()}</span>
                <br />
                <span className="text-xs">Assuming 50% of limit usage with current configuration</span>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-400" />
              Cost-Saving Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium">Use Haiku for general queries</p>
                  <p className="text-sm text-gray-400">30x cheaper than Opus, perfect for routine questions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium">Enable caching for repeated questions</p>
                  <p className="text-sm text-gray-400">Saves 60-80% on similar queries</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium">Use local knowledge base</p>
                  <p className="text-sm text-gray-400">Free for common cultivation parameters</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium">Batch similar questions</p>
                  <p className="text-sm text-gray-400">Ask multiple things in one query</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Changes are applied immediately to new AI requests
          </p>
          <Button 
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>

        {saved && (
          <Alert className="bg-green-900/20 border-green-700">
            <CheckCircle className="w-4 h-4" />
            <AlertTitle>Settings Saved</AlertTitle>
            <AlertDescription>Your AI configuration has been updated.</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}