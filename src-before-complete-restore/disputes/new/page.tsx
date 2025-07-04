'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, AlertCircle, Upload, FileText, Camera,
  Plus, X, Info, CheckCircle, Loader2, Package,
  TrendingUp, AlertTriangle, Scale, HelpCircle
} from 'lucide-react';

interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
}

export default function NewDisputePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    agreementId: '',
    category: '',
    priority: 'medium',
    title: '',
    description: '',
    desiredResolution: '',
    evidenceDescription: '',
    files: [] as FileUpload[]
  });

  const agreements = [
    { id: 'AGR-123', equipment: 'LED Grow Lights', investor: 'Green Energy Partners' },
    { id: 'AGR-124', equipment: 'HVAC System', investor: 'Climate Control Ventures' },
    { id: 'AGR-125', equipment: 'Irrigation System', investor: 'AquaTech Investments' }
  ];

  const categories = [
    { value: 'performance', label: 'Performance Issues', icon: TrendingUp, description: 'Equipment not meeting targets' },
    { value: 'data', label: 'Data Accuracy', icon: AlertTriangle, description: 'Sensor readings incorrect' },
    { value: 'financial', label: 'Financial Dispute', icon: Scale, description: 'Payment or calculation issues' },
    { value: 'other', label: 'Other', icon: HelpCircle, description: 'Other issues' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: FileUpload[] = Array.from(files).map(file => ({
      id: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type
    }));

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
  };

  const removeFile = (fileId: string) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== fileId)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Submit dispute
      await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // Redirect to disputes page
      router.push('/disputes');
    } catch (error) {
      console.error('Error submitting dispute:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / 1048576) + ' MB';
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <Link
          href="/disputes"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Disputes
        </Link>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-purple-600' : 'bg-gray-800'} text-white font-medium`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-800'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-purple-600' : 'bg-gray-800'} text-white font-medium`}>
              2
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-purple-600' : 'bg-gray-800'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-purple-600' : 'bg-gray-800'} text-white font-medium`}>
              3
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-400">Select Agreement</span>
            <span className="text-sm text-gray-400">Describe Issue</span>
            <span className="text-sm text-gray-400">Add Evidence</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Submit a Dispute</h1>
            <p className="text-gray-400">
              {step === 1 && "Select the agreement you're having issues with"}
              {step === 2 && "Describe the issue you're experiencing"}
              {step === 3 && "Provide evidence to support your claim"}
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Select Revenue Share Agreement
                </label>
                <div className="space-y-3">
                  {agreements.map((agreement) => (
                    <button
                      key={agreement.id}
                      onClick={() => setFormData({ ...formData, agreementId: agreement.id })}
                      className={`w-full relative flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                        formData.agreementId === agreement.id
                          ? 'bg-purple-600/10 border-purple-500'
                          : 'bg-gray-800 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Package className="w-6 h-6 text-purple-400" />
                      <div className="flex-1">
                        <div className="font-medium text-white">{agreement.equipment}</div>
                        <div className="text-sm text-gray-400">
                          Agreement ID: {agreement.id} • Investor: {agreement.investor}
                        </div>
                      </div>
                      {formData.agreementId === agreement.id && (
                        <CheckCircle className="absolute top-4 right-4 w-5 h-5 text-purple-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Dispute Category
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setFormData({ ...formData, category: category.value })}
                      className={`relative flex items-start gap-3 p-4 rounded-xl border transition-all text-left ${
                        formData.category === category.value
                          ? 'bg-purple-600/10 border-purple-500'
                          : 'bg-gray-800 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <category.icon className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-white">{category.label}</div>
                        <div className="text-xs text-gray-400 mt-1">{category.description}</div>
                      </div>
                      {formData.category === category.value && (
                        <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-purple-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Dispute Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief summary of the issue"
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Detailed Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a detailed description of the issue, including when it started and how it's affecting your operations..."
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="resolution" className="block text-sm font-medium text-gray-300 mb-2">
                  Desired Resolution
                </label>
                <textarea
                  id="resolution"
                  value={formData.desiredResolution}
                  onChange={(e) => setFormData({ ...formData, desiredResolution: e.target.value })}
                  placeholder="What outcome are you seeking? (e.g., equipment repair, payout adjustment, contract modification)"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['low', 'medium', 'high'].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setFormData({ ...formData, priority })}
                      className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                        formData.priority === priority
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium text-blue-400 mb-1">Evidence Guidelines</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Include sensor data exports showing performance issues</li>
                      <li>• Screenshots of dashboard readings or error messages</li>
                      <li>• Photos of equipment if physical issues exist</li>
                      <li>• Communication logs with other party</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="evidence" className="block text-sm font-medium text-gray-300 mb-2">
                  Evidence Description
                </label>
                <textarea
                  id="evidence"
                  value={formData.evidenceDescription}
                  onChange={(e) => setFormData({ ...formData, evidenceDescription: e.target.value })}
                  placeholder="Describe the evidence you're providing and how it supports your claim..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Evidence
                </label>
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-gray-600 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.csv,.xlsx,.json"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-2">Drop files here or click to upload</p>
                    <p className="text-xs text-gray-500">
                      Supported: Images, PDF, CSV, Excel, JSON (Max 10MB per file)
                    </p>
                  </label>
                </div>

                {formData.files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-purple-400" />
                          <div>
                            <div className="text-sm text-white">{file.name}</div>
                            <div className="text-xs text-gray-400">{formatFileSize(file.size)}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && (!formData.agreementId || !formData.category)) ||
                  (step === 2 && (!formData.title || !formData.description || !formData.desiredResolution))
                }
                className={`${step === 1 ? 'w-full' : 'ml-auto'} px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="ml-auto flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Dispute
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}