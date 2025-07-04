'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Shield,
  Printer,
  Mail,
  Database,
  Filter,
  ChevronRight,
  Info,
  FileCheck,
  AlertCircle,
  BarChart3,
  Loader2
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateComplianceReport } from '@/lib/compliance-report-generator';

interface ComplianceItem {
  id: string;
  category: string;
  requirement: string;
  status: 'compliant' | 'pending' | 'non-compliant' | 'due-soon';
  lastChecked: Date;
  nextDue: Date;
  assignedTo?: string;
  notes?: string;
  evidence?: string[];
}

interface Report {
  id: string;
  name: string;
  type: 'regulatory' | 'operational' | 'financial' | 'quality';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  lastGenerated?: Date;
  nextDue: Date;
  status: 'ready' | 'pending' | 'overdue';
}

export function ComplianceReporting() {
  const [activeTab, setActiveTab] = useState<'compliance' | 'reports' | 'analytics'>('compliance');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  
  // Simple notification function
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Sample compliance items
  const complianceItems: ComplianceItem[] = [
    {
      id: 'comp-1',
      category: 'Testing',
      requirement: 'Microbial Testing - Monthly',
      status: 'compliant',
      lastChecked: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      nextDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      assignedTo: 'Quality Team',
      evidence: ['test-results-march.pdf']
    },
    {
      id: 'comp-2',
      category: 'Safety',
      requirement: 'Pesticide Application Logs',
      status: 'due-soon',
      lastChecked: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      nextDue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      assignedTo: 'IPM Manager',
      notes: 'Monthly log submission required'
    },
    {
      id: 'comp-3',
      category: 'Environmental',
      requirement: 'Waste Disposal Records',
      status: 'compliant',
      lastChecked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      nextDue: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
      evidence: ['waste-manifest-q1.pdf']
    },
    {
      id: 'comp-4',
      category: 'Licensing',
      requirement: 'Cultivation License Renewal',
      status: 'pending',
      lastChecked: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
      nextDue: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000),
      assignedTo: 'Compliance Officer',
      notes: 'Renewal application in progress'
    },
    {
      id: 'comp-5',
      category: 'Security',
      requirement: 'Camera System Audit',
      status: 'non-compliant',
      lastChecked: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      nextDue: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      assignedTo: 'Security Team',
      notes: 'Overdue - needs immediate attention'
    }
  ];

  // Sample reports
  const reports: Report[] = [
    {
      id: 'rep-1',
      name: 'Monthly Compliance Summary',
      type: 'regulatory',
      frequency: 'monthly',
      lastGenerated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      nextDue: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      status: 'ready'
    },
    {
      id: 'rep-2',
      name: 'Cultivation Metrics Report',
      type: 'operational',
      frequency: 'weekly',
      lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      nextDue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'ready'
    },
    {
      id: 'rep-3',
      name: 'Quality Assurance Report',
      type: 'quality',
      frequency: 'monthly',
      nextDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'pending'
    },
    {
      id: 'rep-4',
      name: 'Annual Regulatory Filing',
      type: 'regulatory',
      frequency: 'annual',
      nextDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: 'pending'
    }
  ];

  const categories = ['all', 'Testing', 'Safety', 'Environmental', 'Licensing', 'Security'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'ready':
        return 'text-green-400 bg-green-900/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'due-soon':
        return 'text-orange-400 bg-orange-900/20';
      case 'non-compliant':
      case 'overdue':
        return 'text-red-400 bg-red-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'ready':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'due-soon':
        return <AlertTriangle className="w-4 h-4" />;
      case 'non-compliant':
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? complianceItems 
    : complianceItems.filter(item => item.category === selectedCategory);

  const complianceScore = Math.round(
    (complianceItems.filter(item => item.status === 'compliant').length / complianceItems.length) * 100
  );

  // Mock data for compliance trends
  const complianceTrend = [
    { month: 'Jan', score: 92 },
    { month: 'Feb', score: 94 },
    { month: 'Mar', score: 91 },
    { month: 'Apr', score: 95 },
    { month: 'May', score: 93 },
    { month: 'Jun', score: 96 }
  ];

  // Report generation function
  const handleGenerateReport = async () => {
    if (!selectedReport) return;
    
    setIsGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the report's last generated date
      selectedReport.lastGenerated = new Date();
      selectedReport.status = 'ready';
      
      showNotification('success', `${selectedReport.name} generated successfully!`);
    } catch (error) {
      showNotification('error', 'Failed to generate report');
      console.error('Report generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download report function
  const handleDownloadReport = async () => {
    if (!selectedReport) return;
    
    setIsDownloading(true);
    try {
      // Create report data
      const reportData = {
        title: selectedReport.name,
        generatedDate: new Date(),
        complianceScore,
        complianceItems,
        trends: complianceTrend,
        type: selectedReport.type,
        frequency: selectedReport.frequency
      };
      
      // Generate PDF (using a simple implementation for now)
      const pdfContent = generateSimpleReportPDF(reportData);
      
      // Create blob and download
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReport.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('success', 'Report downloaded successfully!');
    } catch (error) {
      showNotification('error', 'Failed to download report');
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Email report function
  const handleEmailReport = async () => {
    if (!selectedReport) return;
    
    setIsEmailing(true);
    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showNotification('success', 'Report sent to registered email address!');
    } catch (error) {
      showNotification('error', 'Failed to send report');
      console.error('Email error:', error);
    } finally {
      setIsEmailing(false);
    }
  };

  // Export dashboard function
  const handleExportDashboard = async () => {
    try {
      // Create dashboard data
      const dashboardData = {
        title: 'Compliance Dashboard Export',
        exportDate: new Date(),
        complianceScore,
        totalItems: complianceItems.length,
        compliantItems: complianceItems.filter(item => item.status === 'compliant').length,
        pendingItems: complianceItems.filter(item => item.status === 'pending').length,
        dueSoonItems: complianceItems.filter(item => item.status === 'due-soon').length,
        nonCompliantItems: complianceItems.filter(item => item.status === 'non-compliant').length,
        complianceItems,
        reports,
        trends: complianceTrend
      };
      
      // Generate CSV
      const csv = generateDashboardCSV(dashboardData);
      
      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance_dashboard_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('success', 'Dashboard exported successfully!');
    } catch (error) {
      showNotification('error', 'Failed to export dashboard');
      console.error('Export error:', error);
    }
  };

  // Generate CSV from dashboard data
  const generateDashboardCSV = (data: any) => {
    let csv = 'Compliance Dashboard Export\n';
    csv += `Export Date: ${data.exportDate.toLocaleDateString()}\n\n`;
    
    csv += 'Summary\n';
    csv += `Compliance Score: ${data.complianceScore}%\n`;
    csv += `Total Items: ${data.totalItems}\n`;
    csv += `Compliant: ${data.compliantItems}\n`;
    csv += `Pending: ${data.pendingItems}\n`;
    csv += `Due Soon: ${data.dueSoonItems}\n`;
    csv += `Non-Compliant: ${data.nonCompliantItems}\n\n`;
    
    csv += 'Compliance Items\n';
    csv += 'Category,Requirement,Status,Last Checked,Next Due,Assigned To,Notes\n';
    
    data.complianceItems.forEach((item: ComplianceItem) => {
      csv += `${item.category},"${item.requirement}",${item.status},${item.lastChecked.toLocaleDateString()},${item.nextDue.toLocaleDateString()},"${item.assignedTo || ''}","${item.notes || ''}"\n`;
    });
    
    csv += '\nReports\n';
    csv += 'Name,Type,Frequency,Status,Next Due,Last Generated\n';
    
    data.reports.forEach((report: Report) => {
      csv += `"${report.name}",${report.type},${report.frequency},${report.status},${report.nextDue.toLocaleDateString()},${report.lastGenerated ? report.lastGenerated.toLocaleDateString() : 'Never'}\n`;
    });
    
    return csv;
  };

  // Simple PDF generation function (placeholder)
  const generateSimpleReportPDF = (data: any) => {
    // This is a placeholder - in a real app, you'd use a library like jsPDF or pdfmake
    const content = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj
4 0 obj
<<
/Length 500
>>
stream
BT
/F1 24 Tf
50 700 Td
(${data.title}) Tj
0 -30 Td
/F1 12 Tf
(Generated: ${data.generatedDate.toLocaleDateString()}) Tj
0 -30 Td
(Compliance Score: ${data.complianceScore}%) Tj
0 -30 Td
(Report Type: ${data.type}) Tj
0 -30 Td
(Frequency: ${data.frequency}) Tj
ET
endstream
endobj
5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
0000000764 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
843
%%EOF
    `;
    return content;
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Compliance & Reporting</h2>
          <p className="text-gray-400">Regulatory compliance tracking and report generation</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Dashboard
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['compliance', 'reports', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'compliance' && (
        <>
          {/* Compliance Overview */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Compliance Score</span>
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">{complianceScore}%</p>
              <p className="text-sm text-gray-500 mt-1">Overall compliance</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Items Due</span>
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {complianceItems.filter(i => i.status === 'due-soon').length}
              </p>
              <p className="text-sm text-gray-500 mt-1">Within 7 days</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Non-Compliant</span>
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {complianceItems.filter(i => i.status === 'non-compliant').length}
              </p>
              <p className="text-sm text-gray-500 mt-1">Needs attention</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Last Audit</span>
                <FileCheck className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-lg font-bold text-white">Mar 15</p>
              <p className="text-sm text-gray-500 mt-1">15 days ago</p>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Compliance Items List */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Compliance Requirements</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{item.requirement}</h4>
                          <p className="text-sm text-gray-400 mt-1">{item.category}</p>
                          {item.notes && (
                            <p className="text-sm text-gray-500 mt-2">{item.notes}</p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="text-gray-500">
                              Last: {item.lastChecked.toLocaleDateString()}
                            </span>
                            <span className="text-gray-500">
                              Next: {item.nextDue.toLocaleDateString()}
                            </span>
                            {item.assignedTo && (
                              <span className="text-purple-400">{item.assignedTo}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'reports' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Reports List */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Available Reports</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedReport?.id === report.id
                      ? 'bg-purple-900/20 border-l-2 border-purple-600'
                      : 'hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-white">{report.name}</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        {report.type} • {report.frequency}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          Due: {report.nextDue.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Actions */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            {selectedReport ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">{selectedReport.name}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-300">Report Type</span>
                    <span className="text-white capitalize">{selectedReport.type}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-300">Frequency</span>
                    <span className="text-white capitalize">{selectedReport.frequency}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-300">Next Due</span>
                    <span className="text-white">{selectedReport.nextDue.toLocaleDateString()}</span>
                  </div>
                  {selectedReport.lastGenerated && (
                    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <span className="text-gray-300">Last Generated</span>
                      <span className="text-white">{selectedReport.lastGenerated.toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 space-y-3">
                  <button 
                    onClick={handleGenerateReport}
                    disabled={isGenerating || selectedReport.status !== 'pending'}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Generate Report
                      </>
                    )}
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handleDownloadReport}
                      disabled={isDownloading || selectedReport.status !== 'ready'}
                      className="flex items-center justify-center gap-2 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-300 rounded-lg transition-colors"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Download
                    </button>
                    <button 
                      onClick={handleEmailReport}
                      disabled={isEmailing || selectedReport.status !== 'ready'}
                      className="flex items-center justify-center gap-2 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-300 rounded-lg transition-colors"
                    >
                      {isEmailing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                      Email
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-700" />
                <p>Select a report to view options</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <>
          {/* Compliance Trend Chart */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Compliance Score Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={complianceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis domain={[80, 100]} stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    formatter={(value: any) => `${value}%`}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: '#10B981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Compliance by Category</h3>
              <div className="space-y-3">
                {['Testing', 'Safety', 'Environmental', 'Licensing', 'Security'].map((cat) => {
                  const catItems = complianceItems.filter(i => i.category === cat);
                  const compliant = catItems.filter(i => i.status === 'compliant').length;
                  const percentage = catItems.length > 0 ? (compliant / catItems.length) * 100 : 0;
                  
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-300">{cat}</span>
                        <span className="text-white font-medium">{percentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            percentage === 100 ? 'bg-green-500' :
                            percentage >= 80 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-gray-400 text-sm">Average Resolution Time</p>
                    <p className="text-xl font-bold text-white">3.2 days</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-gray-400 text-sm">Total Audits YTD</p>
                    <p className="text-xl font-bold text-white">24</p>
                  </div>
                  <FileCheck className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-gray-400 text-sm">Report Submission Rate</p>
                    <p className="text-xl font-bold text-white">98.5%</p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Notification Display */}
      {notification && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transition-all transform ${
          notification.type === 'success' ? 'bg-green-600' :
          notification.type === 'error' ? 'bg-red-600' :
          'bg-blue-600'
        } text-white flex items-center gap-2`}>
          {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {notification.type === 'info' && <Info className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
}