'use client';

import React from 'react';
import { OpenAccessResearchLibrary } from '@/components/OpenAccessResearchLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Globe, Download, Zap, Shield, Users } from 'lucide-react';

export default function ResearchLibraryPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Open Access Research Library</h1>
        <p className="text-muted-foreground">
          Access thousands of open-access research papers on controlled environment agriculture, 
          plant biology, and horticultural lighting.
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold">Multiple Repositories</h3>
                <p className="text-sm text-muted-foreground">
                  Search across ArXiv, bioRxiv, DOAJ, PMC, CORE, and Semantic Scholar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Download className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold">Direct PDF Access</h3>
                <p className="text-sm text-muted-foreground">
                  Download full-text PDFs when available under open access licenses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-yellow-500" />
              <div>
                <h3 className="font-semibold">AI-Powered Relevance</h3>
                <p className="text-sm text-muted-foreground">
                  Papers ranked by relevance to your lighting design context
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Repository Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Research Repositories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">📄 ArXiv</Badge>
                <Badge className="bg-green-500">Green OA</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Physics and engineering preprints, including agricultural engineering
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">🧬 bioRxiv</Badge>
                <Badge className="bg-green-500">Green OA</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Life sciences preprints, plant biology, and ecology research
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">📚 DOAJ</Badge>
                <Badge className="bg-yellow-500">Gold OA</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Directory of Open Access Journals with peer-reviewed articles
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">🏥 PMC</Badge>
                <Badge className="bg-yellow-500">Gold OA</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                PubMed Central open-access biomedical research
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">🔬 CORE</Badge>
                <Badge className="bg-green-500">Green OA</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Global network of research repositories and journals
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">🎓 Semantic Scholar</Badge>
                <Badge className="bg-blue-500">Mixed</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered academic search with citation analysis
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">🔬 ResearchGate</Badge>
                <Badge className="bg-green-500">Green OA</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Academic social network with researcher-shared papers and data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Open Access Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Open Access Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge className="bg-yellow-500">Gold OA</Badge>
              <span className="text-sm">Published in fully open access journals</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-500">Green OA</Badge>
              <span className="text-sm">Author self-archived versions in repositories</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-500">Hybrid</Badge>
              <span className="text-sm">Open access articles in subscription journals</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-orange-500">Bronze</Badge>
              <span className="text-sm">Free to read but with limited reuse rights</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usage Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Attribution Required</h4>
            <p className="text-sm">
              Always cite papers properly when using research findings in your projects or publications.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold mb-2">Commercial Use</h4>
            <p className="text-sm">
              Check individual paper licenses. Most open access papers allow commercial use with attribution.
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold mb-2">Quality Assessment</h4>
            <p className="text-sm">
              Preprints may not be peer-reviewed. Look for published journal versions when available.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Research Library Component */}
      <OpenAccessResearchLibrary />
    </div>
  );
}