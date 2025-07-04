"use client";

import React from 'react';
import { ProfessionalReportBuilder } from '@/components/ProfessionalReportBuilder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, BarChart3, DollarSign, Award, TrendingUp, Calculator } from 'lucide-react';

export default function ProfessionalReportingPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold">Professional Reporting</h1>
          <BarChart3 className="h-8 w-8 text-green-600" />
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Generate comprehensive reports with energy analytics, ROI calculations, compliance documentation, 
          and environmental impact assessments for professional presentations and regulatory submissions.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Calculator className="h-3 w-3" />
            Advanced Analytics
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            Compliance Ready
          </Badge>
          <Badge variant="secondary">
            Professional Grade
          </Badge>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-600" />
              ROI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Comprehensive financial analysis with NPV, IRR, and payback calculations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              Energy Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Detailed energy consumption, efficiency ratings, and cost analysis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Award className="h-4 w-4 text-purple-600" />
              Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              ASHRAE, IECC, Title 24 compliance verification and documentation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              PPFD, uniformity, spectral quality, and maintenance analytics
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Report Builder */}
      <ProfessionalReportBuilder />

      {/* Report Types & Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Types</CardTitle>
            <CardDescription>
              Choose from multiple professional report formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm">Comprehensive Analysis</h3>
                <p className="text-xs text-muted-foreground">
                  Complete report including financial, performance, compliance, and environmental analysis
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm">ROI & Financial</h3>
                <p className="text-xs text-muted-foreground">
                  Focused on return on investment, payback analysis, and financial projections
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Performance Analysis</h3>
                <p className="text-xs text-muted-foreground">
                  Technical performance metrics, efficiency ratings, and optimization recommendations
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Compliance Report</h3>
                <p className="text-xs text-muted-foreground">
                  Energy code compliance verification with supporting documentation
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Design Summary</h3>
                <p className="text-xs text-muted-foreground">
                  Concise overview of design specifications and expected outcomes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Benefits</CardTitle>
            <CardDescription>
              Why choose VibeLux professional reporting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Award className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">Industry Standards</h3>
                  <p className="text-xs text-muted-foreground">
                    Meets professional consulting and engineering standards
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calculator className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">Accurate Calculations</h3>
                  <p className="text-xs text-muted-foreground">
                    Validated financial models and energy calculations
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">Export Formats</h3>
                  <p className="text-xs text-muted-foreground">
                    PDF and Excel export for presentations and analysis
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <BarChart3 className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">Visual Analytics</h3>
                  <p className="text-xs text-muted-foreground">
                    Charts, graphs, and tables for clear data presentation
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">Recommendations</h3>
                  <p className="text-xs text-muted-foreground">
                    AI-generated insights and optimization suggestions
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sample Report Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Report Metrics</CardTitle>
          <CardDescription>
            Example of key metrics included in professional reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">156%</div>
              <div className="text-sm text-muted-foreground">ROI (10 years)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">3.2 years</div>
              <div className="text-sm text-muted-foreground">Payback Period</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">A+</div>
              <div className="text-sm text-muted-foreground">Energy Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">28%</div>
              <div className="text-sm text-muted-foreground">Below Code</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}