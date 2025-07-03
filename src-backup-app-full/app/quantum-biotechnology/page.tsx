"use client";

import React from 'react';
import { BiotechnologyOptimizationPanel } from '@/components/biotechnology/BiotechnologyOptimizationPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Atom, Dna, Zap, Brain } from 'lucide-react';

export default function QuantumBiotechnologyPage() {
  const handleOptimizationComplete = (result: any) => {
    console.log('Optimization completed:', result);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Atom className="h-8 w-8 text-purple-600" />
          <h1 className="text-4xl font-bold">Quantum Biotechnology</h1>
          <Dna className="h-8 w-8 text-green-600" />
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Revolutionary quantum-enhanced gene expression prediction and metabolomics optimization 
          for precision agriculture and advanced crop development.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Quantum Enhanced
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            AI-Powered
          </Badge>
          <Badge variant="secondary">
            Patent Pending
          </Badge>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Atom className="h-4 w-4 text-purple-600" />
              Quantum Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              QAOA algorithm with 20-qubit support for complex spectrum optimization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Dna className="h-4 w-4 text-green-600" />
              Gene Expression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Predict photoreceptor gene responses to lighting conditions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4 text-blue-600" />
              Metabolomics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Optimize secondary metabolite production for health benefits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-orange-600" />
              Microbiome
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Enhance beneficial plant-microbe interactions through light
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Biotechnology Panel */}
      <BiotechnologyOptimizationPanel onOptimizationComplete={handleOptimizationComplete} />

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Innovation</CardTitle>
          <CardDescription>
            Cutting-edge integration of quantum computing with plant biology
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Atom className="h-4 w-4" />
                Quantum Computing Features
              </h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Quantum Approximate Optimization Algorithm (QAOA)</li>
                <li>• Up to 20-qubit quantum circuit simulation</li>
                <li>• Entanglement utilization tracking</li>
                <li>• Quantum fidelity measurements</li>
                <li>• Adaptive parameter optimization</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Dna className="h-4 w-4" />
                Biotechnology Features
              </h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Photoreceptor gene modeling (CRY1/2, PHYA-E, UVR8)</li>
                <li>• Light-responsive element activation</li>
                <li>• Metabolic pathway prediction</li>
                <li>• Microbiome optimization</li>
                <li>• Temporal expression patterns</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Unique Value Proposition</h3>
            <p className="text-sm text-muted-foreground">
              This represents the world's first commercial integration of quantum computing algorithms 
              with plant gene expression prediction for agricultural lighting optimization. The system 
              enables precision control of plant biochemistry through quantum-optimized light spectra, 
              opening new possibilities for functional food production and pharmaceutical compound 
              synthesis in controlled environments.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}