'use client';

import { useState, useEffect } from 'react';
import { ClaudeChatAssistant } from '@/components/ai/claude-chat-assistant';
import { PlantDoctor } from '@/components/ai/plant-doctor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bot, 
  Stethoscope, 
  BarChart3, 
  FileText, 
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Brain,
  MessageSquare,
  Zap
} from 'lucide-react';

export default function AIAssistantPage() {
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [facilities, setFacilities] = useState<any[]>([]);
  const [aiStats, setAiStats] = useState({
    questionsAnswered: 0,
    issuesDiagnosed: 0,
    reportsGenerated: 0,
    optimizationsSuggested: 0,
  });

  useEffect(() => {
    fetchFacilities();
    fetchAIStats();
  }, []);

  const fetchFacilities = async () => {
    try {
      const response = await fetch('/api/facilities');
      if (response.ok) {
        const data = await response.json();
        setFacilities(data);
        if (data.length > 0 && !selectedFacility) {
          setSelectedFacility(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const fetchAIStats = async () => {
    // In real app, fetch actual stats
    setAiStats({
      questionsAnswered: 247,
      issuesDiagnosed: 18,
      reportsGenerated: 52,
      optimizationsSuggested: 31,
    });
  };

  const aiFeatures = [
    {
      title: 'Natural Language Queries',
      description: 'Ask questions about your data in plain English',
      icon: <MessageSquare className="h-6 w-6" />,
      examples: [
        'How is my facility performing today?',
        'What caused the temperature spike in Zone 2?',
        'Show me energy usage trends',
      ],
    },
    {
      title: 'Plant Health Diagnosis',
      description: 'AI-powered problem identification and solutions',
      icon: <Stethoscope className="h-6 w-6" />,
      examples: [
        'Identify pest and disease issues',
        'Environmental stress diagnosis',
        'Growth optimization recommendations',
      ],
    },
    {
      title: 'Intelligent Reporting',
      description: 'Auto-generated insights and narratives',
      icon: <FileText className="h-6 w-6" />,
      examples: [
        'Executive summary generation',
        'Performance trend analysis',
        'Compliance report writing',
      ],
    },
    {
      title: 'Optimization Advisor',
      description: 'Data-driven improvement suggestions',
      icon: <Lightbulb className="h-6 w-6" />,
      examples: [
        'Energy efficiency recommendations',
        'Layout optimization ideas',
        'Equipment upgrade suggestions',
      ],
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            VibeLux AI Assistant
          </h1>
          <p className="text-gray-600 mt-2">
            Powered by Claude AI - Your intelligent cultivation companion
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Powered by Claude
          </Badge>
          
          <Select value={selectedFacility} onValueChange={setSelectedFacility}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select facility" />
            </SelectTrigger>
            <SelectContent>
              {facilities.map((facility) => (
                <SelectItem key={facility.id} value={facility.id}>
                  {facility.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{aiStats.questionsAnswered}</p>
                <p className="text-sm text-gray-600">Questions Answered</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{aiStats.issuesDiagnosed}</p>
                <p className="text-sm text-gray-600">Issues Diagnosed</p>
              </div>
              <Stethoscope className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">{aiStats.reportsGenerated}</p>
                <p className="text-sm text-gray-600">Reports Generated</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{aiStats.optimizationsSuggested}</p>
                <p className="text-sm text-gray-600">Optimizations Suggested</p>
              </div>
              <Lightbulb className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Capabilities Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {aiFeatures.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  {feature.icon}
                </div>
                {feature.title}
              </CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Examples:</p>
                <ul className="space-y-1">
                  {feature.examples.map((example, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start space-x-2">
                      <span className="text-purple-600">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main AI Interface */}
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="diagnosis" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Plant Doctor
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Smart Insights
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            AI Training
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          {selectedFacility ? (
            <ClaudeChatAssistant facilityId={selectedFacility} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a facility to start chatting with AI</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="diagnosis" className="mt-6">
          {selectedFacility ? (
            <PlantDoctor facilityId={selectedFacility} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a facility to access plant diagnosis</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>
                Automatic analysis and recommendations based on your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">Performance Improvement Detected</h4>
                      <p className="text-sm text-green-800 mt-1">
                        Your facility's energy efficiency has improved by 12% over the last 30 days, 
                        likely due to the LED upgrades in Zone 2.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900">Optimization Opportunity</h4>
                      <p className="text-sm text-yellow-800 mt-1">
                        Temperature variance in Zone 1 is 15% higher than optimal. 
                        Consider adding circulation fans to improve uniformity.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Market Trend Alert</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        Premium indoor flower prices have increased 8% this month. 
                        Your current quality levels position you well for premium pricing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button className="w-full">
                  Generate New Insights
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Training</CardTitle>
              <CardDescription>
                Personalized learning content based on your facility data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">Recommended for You</h4>
                    <div className="space-y-3">
                      <div className="p-3 border rounded">
                        <h5 className="font-medium">VPD Optimization</h5>
                        <p className="text-sm text-gray-600">
                          Based on your humidity data, learn advanced VPD control
                        </p>
                        <Badge variant="outline" className="mt-2">20 min</Badge>
                      </div>
                      <div className="p-3 border rounded">
                        <h5 className="font-medium">LED Spectrum Tuning</h5>
                        <p className="text-sm text-gray-600">
                          Optimize your lighting setup for better yields
                        </p>
                        <Badge variant="outline" className="mt-2">35 min</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">Coming Soon</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Interactive problem-solving scenarios</li>
                      <li>• Facility-specific optimization courses</li>
                      <li>• Real-time coaching during operations</li>
                      <li>• Peer learning from similar facilities</li>
                      <li>• Certification programs</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}