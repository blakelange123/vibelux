'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, FileText, AlertCircle, CheckCircle, X, Eye,
  Brain, BarChart3, Shield, Download, RefreshCw
} from 'lucide-react';

interface UploadedDocument {
  id?: string;
  file: File;
  documentType: string;
  analysis?: any;
  uploading?: boolean;
  error?: string;
}

interface DocumentUploadWizardProps {
  facilityId: string;
  onComplete?: (documents: any[]) => void;
}

export function DocumentUploadWizard({ facilityId, onComplete }: DocumentUploadWizardProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyze' | 'review'>('upload');
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const documentTypes = [
    { value: 'profit_loss', label: 'Profit & Loss Statement', required: true },
    { value: 'balance_sheet', label: 'Balance Sheet', required: true },
    { value: 'cash_flow', label: 'Cash Flow Statement', required: false },
    { value: 'bank_statement', label: 'Bank Statement', required: false },
    { value: 'tax_return', label: 'Tax Return', required: false },
    { value: 'invoice', label: 'Invoices/Revenue Records', required: false }
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newDocuments = acceptedFiles.map(file => ({
      file,
      documentType: 'unknown' // Will be set by user
    }));
    setDocuments(prev => [...prev, ...newDocuments]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const updateDocumentType = (index: number, type: string) => {
    setDocuments(prev => prev.map((doc, i) => 
      i === index ? { ...doc, documentType: type } : doc
    ));
  };

  const uploadAndAnalyze = async () => {
    if (documents.length === 0) return;

    setUploading(true);
    setCurrentStep('analyze');

    try {
      const formData = new FormData();
      formData.append('facilityId', facilityId);
      
      documents.forEach(doc => {
        formData.append('documents', doc.file);
        formData.append('documentTypes', doc.documentType);
      });

      const response = await fetch('/api/investment/document-upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setAnalysisResults(result);
      setCurrentStep('review');
      
      if (onComplete) {
        onComplete(result.results);
      }
    } catch (error) {
      console.error('Upload error:', error);
      // Handle error
    } finally {
      setUploading(false);
    }
  };

  const generateDueDiligence = async () => {
    try {
      const response = await fetch('/api/investment/due-diligence-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilityId })
      });

      if (!response.ok) {
        throw new Error('Due diligence generation failed');
      }

      const dueDiligence = await response.json();
      
      // Redirect to due diligence dashboard
      window.open(`/investment/due-diligence?facilityId=${facilityId}&source=manual`, '_blank');
    } catch (error) {
      console.error('Due diligence error:', error);
    }
  };

  if (currentStep === 'analyze') {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="flex items-center justify-center gap-3 text-purple-400 mb-6">
              <Brain className="w-8 h-8 animate-pulse" />
              <span className="text-xl font-semibold">Claude AI Analyzing Documents...</span>
            </div>
            <div className="text-gray-400 mb-8">
              Processing {documents.length} financial document{documents.length !== 1 ? 's' : ''} 
              using advanced AI analysis
            </div>
            <div className="w-64 h-2 bg-gray-800 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-pulse" 
                   style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'review' && analysisResults) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Document Analysis Complete</h1>
            <p className="text-gray-400">
              Processed {analysisResults.uploadedDocuments} documents with {analysisResults.successfulAnalyses} successful analyses
            </p>
          </div>

          {/* Analysis Summary */}
          <div className="bg-gray-900/50 rounded-xl p-6 mb-8 border border-white/10">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analysis Summary
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">
                  {analysisResults.successfulAnalyses}
                </div>
                <div className="text-sm text-gray-400">Documents Analyzed</div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round(analysisResults.results
                    .filter((r: any) => r.success)
                    .reduce((sum: number, r: any) => sum + r.confidence, 0) / 
                    analysisResults.successfulAnalyses) || 0}%
                </div>
                <div className="text-sm text-gray-400">Avg Confidence</div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">
                  {analysisResults.nextSteps.canGenerateDueDiligence ? 'Ready' : 'Incomplete'}
                </div>
                <div className="text-sm text-gray-400">Due Diligence Status</div>
              </div>
            </div>
          </div>

          {/* Document Results */}
          <div className="bg-gray-900/50 rounded-xl p-6 mb-8 border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Document Analysis Results</h2>
            
            <div className="space-y-4">
              {analysisResults.results.map((result: any, index: number) => (
                <div key={index} 
                     className={`p-4 rounded-lg border ${
                       result.success 
                         ? 'bg-green-900/20 border-green-500/50' 
                         : 'bg-red-900/20 border-red-500/50'
                     }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {result.success ? 
                        <CheckCircle className="w-5 h-5 text-green-400" /> :
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      }
                      <span className="font-medium">{result.filename}</span>
                      {result.documentType && (
                        <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                          {result.documentType.replace('_', ' ').toUpperCase()}
                        </span>
                      )}
                    </div>
                    {result.success && (
                      <div className="text-sm text-gray-400">
                        {result.confidence}% confidence
                      </div>
                    )}
                  </div>
                  
                  {result.errors && result.errors.length > 0 && (
                    <div className="text-red-400 text-sm mt-2">
                      Errors: {result.errors.join(', ')}
                    </div>
                  )}
                  
                  {result.warnings && result.warnings.length > 0 && (
                    <div className="text-yellow-400 text-sm mt-2">
                      Warnings: {result.warnings.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {analysisResults.nextSteps.canGenerateDueDiligence ? (
              <button
                onClick={generateDueDiligence}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200 flex items-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                Generate Due Diligence Report
              </button>
            ) : (
              <div className="px-6 py-3 bg-gray-700 text-gray-400 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Upload more documents to generate report
              </div>
            )}
            
            <button
              onClick={() => setCurrentStep('upload')}
              className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload More Documents
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Financial Documents</h1>
          <p className="text-gray-400">
            Upload your financial statements for AI-powered due diligence analysis. 
            Claude AI will extract key metrics and generate investment reports.
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-gray-900/50 rounded-xl p-6 mb-8 border border-white/10">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              isDragActive 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop financial documents'}
            </h3>
            <p className="text-gray-400 mb-4">
              or click to browse files (PDF, Images, CSV, Excel)
            </p>
            <p className="text-sm text-gray-500">
              Maximum file size: 10MB per file
            </p>
          </div>
        </div>

        {/* Uploaded Documents */}
        {documents.length > 0 && (
          <div className="bg-gray-900/50 rounded-xl p-6 mb-8 border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Uploaded Documents ({documents.length})</h2>
            
            <div className="space-y-4">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                  <FileText className="w-8 h-8 text-blue-400" />
                  
                  <div className="flex-1">
                    <div className="font-medium">{doc.file.name}</div>
                    <div className="text-sm text-gray-400">
                      {(doc.file.size / 1024 / 1024).toFixed(1)}MB
                    </div>
                  </div>
                  
                  <select
                    value={doc.documentType}
                    onChange={(e) => updateDocumentType(index, e.target.value)}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="unknown">Select document type...</option>
                    {documentTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} {type.required ? '(Required)' : ''}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => removeDocument(index)}
                    className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            <span className="text-purple-400">Required:</span> Profit & Loss, Balance Sheet<br/>
            <span className="text-blue-400">Optional:</span> Cash Flow, Bank Statements, Tax Returns
          </div>
          
          <button
            onClick={uploadAndAnalyze}
            disabled={documents.length === 0 || uploading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Analyze with AI ({documents.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}