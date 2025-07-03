'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedPaperCard } from '@/components/EnhancedPaperCard';
import { OpenAccessResearchClient } from '@/lib/open-access-research';
import { Zap, Database, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResearchDemoPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [enhancementStatus, setEnhancementStatus] = useState<'idle' | 'loading' | 'complete' | 'error'>('idle');

  const client = new OpenAccessResearchClient();

  const searchAndEnhance = async () => {
    setIsLoading(true);
    setEnhancementStatus('loading');
    
    try {
      // Search for LED horticulture papers
      const results = await client.searchPapers('LED horticulture plant growth spectrum');
      
      if (results.length > 0) {
        setPapers(results.slice(0, 5)); // Show first 5 results
        setEnhancementStatus('complete');
      } else {
        setEnhancementStatus('error');
      }
    } catch (error) {
      console.error('Search error:', error);
      setEnhancementStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getEnhancementStatusIcon = () => {
    switch (enhancementStatus) {
      case 'loading': return <Database className="h-4 w-4 animate-spin" />;
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Research Enhancement Demo</h1>
        <p className="text-muted-foreground">
          See how VibeLux enhances research papers with real CrossRef citation data
        </p>
      </div>

      {/* Enhancement Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            CrossRef Enhancement Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {getEnhancementStatusIcon()}
              <span className="font-medium">
                {enhancementStatus === 'idle' && 'Ready to enhance research papers'}
                {enhancementStatus === 'loading' && 'Searching repositories and enhancing with citations...'}
                {enhancementStatus === 'complete' && 'Enhancement complete! Papers now include real citation data.'}
                {enhancementStatus === 'error' && 'Enhancement failed. Check your internet connection.'}
              </span>
            </div>

            {enhancementStatus === 'complete' && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Enhancement Features Active:</h4>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>✓ Real citation counts from CrossRef database</li>
                  <li>✓ DOI verification and linking</li>
                  <li>✓ Enhanced author information with ORCID IDs</li>
                  <li>✓ Research impact classification</li>
                  <li>✓ Citation-based quality indicators</li>
                </ul>
              </div>
            )}

            <Button 
              onClick={searchAndEnhance} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Searching & Enhancing...' : 'Search LED Horticulture Papers'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {papers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Enhanced Research Results</h2>
          <p className="text-muted-foreground">
            Papers below have been enhanced with real citation data from CrossRef API
          </p>
          
          {papers.map((paper, index) => (
            <EnhancedPaperCard
              key={paper.id || index}
              paper={paper}
              showEnhancements={true}
            />
          ))}
        </div>
      )}

      {/* Information Panel */}
      <Card>
        <CardHeader>
          <CardTitle>About CrossRef Enhancement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">What CrossRef Provides:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Citation counts for 130+ million papers</li>
                <li>• DOI verification and resolution</li>
                <li>• Publisher and journal metadata</li>
                <li>• Author ORCID identification</li>
                <li>• Open access license information</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">VibeLux Enhancement Features:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Research impact classification</li>
                <li>• Citation-based quality scoring</li>
                <li>• Validation badges for well-cited papers</li>
                <li>• Enhanced author information display</li>
                <li>• Direct DOI linking for verification</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Why This Matters:</h4>
            <p className="text-sm text-blue-700">
              Citation data helps you identify the most impactful and reliable research in agricultural lighting. 
              Well-cited papers have been validated by the scientific community, making them more trustworthy 
              sources for your lighting design decisions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}