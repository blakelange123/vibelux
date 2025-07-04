'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Package, DollarSign, TrendingUp, Calendar,
  Shield, Info, AlertCircle, CheckCircle, Loader2, 
  Upload, FileText, X, Calculator, Zap, Settings,
  Building, MapPin, Eye, Plus, Minus
} from 'lucide-react';

interface Equipment {
  id: string;
  brand: string;
  model: string;
  quantity: number;
  unitPrice: number;
  warranty: string;
  delivery: string;
}

export default function SubmitOfferPage() {
  const params = useParams();
  const router = useRouter();
  const { requestId } = params;
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Mock request data - would be fetched based on requestId
  const request = {
    id: requestId as string,
    title: '500 LED Grow Lights for Expansion',
    equipmentType: 'LED Grow Lights',
    quantity: 500,
    estimatedValue: 425000,
    proposedRevShare: 12,
    termMonths: 48,
    facility: {
      name: 'Green Valley Farms',
      city: 'Sacramento',
      state: 'CA'
    },
    requester: 'John Smith',
    neededBy: '2024-04-15'
  };

  const [formData, setFormData] = useState({
    // Step 1: Equipment Details
    equipment: [{
      id: '1',
      brand: '',
      model: '',
      quantity: request.quantity,
      unitPrice: 0,
      warranty: '5 years',
      delivery: '30 days'
    }] as Equipment[],
    
    // Step 2: Financial Terms
    totalValue: 0,
    proposedRevShare: request.proposedRevShare,
    termMonths: request.termMonths,
    includeInstallation: true,
    includeMaintenance: true,
    maintenanceMonths: 24,
    
    // Step 3: Additional Details
    message: '',
    whyBestOffer: '',
    previousExperience: '',
    certifications: [],
    acceptTerms: false
  });

  const platformFee = formData.totalValue * 0.15;
  const monthlyRevShare = (formData.totalValue * 0.1 * formData.proposedRevShare) / 100;
  const totalRevenue = monthlyRevShare * formData.termMonths;
  const netRevenue = totalRevenue - platformFee;
  const roi = formData.totalValue > 0 ? ((netRevenue / formData.totalValue) * 100).toFixed(1) : '0';

  const updateEquipmentTotal = () => {
    const total = formData.equipment.reduce((sum, eq) => sum + (eq.quantity * eq.unitPrice), 0);
    setFormData(prev => ({ ...prev, totalValue: total }));
  };

  const addEquipmentItem = () => {
    setFormData(prev => ({
      ...prev,
      equipment: [...prev.equipment, {
        id: Date.now().toString(),
        brand: '',
        model: '',
        quantity: 1,
        unitPrice: 0,
        warranty: '5 years',
        delivery: '30 days'
      }]
    }));
  };

  const removeEquipmentItem = (id: string) => {
    if (formData.equipment.length === 1) return;
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter(eq => eq.id !== id)
    }));
    setTimeout(updateEquipmentTotal, 0);
  };

  const updateEquipmentItem = (id: string, field: keyof Equipment, value: any) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.map(eq => 
        eq.id === id ? { ...eq, [field]: value } : eq
      )
    }));
    if (field === 'quantity' || field === 'unitPrice') {
      setTimeout(updateEquipmentTotal, 0);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Submit offer
      await fetch(`/api/equipment-requests/${requestId}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      // Redirect to offers page
      router.push('/equipment-board/offers');
    } catch (error) {
      console.error('Error submitting offer:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <Link
          href={`/equipment-board/${requestId}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Request
        </Link>

        {/* Request Summary */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">{request.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {request.facility.name}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {request.facility.city}, {request.facility.state}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Needed by {new Date(request.neededBy).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Estimated Value</div>
              <div className="text-2xl font-bold text-white">${request.estimatedValue.toLocaleString()}</div>
            </div>
          </div>
        </div>

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
            <span className="text-sm text-gray-400">Equipment Details</span>
            <span className="text-sm text-gray-400">Financial Terms</span>
            <span className="text-sm text-gray-400">Review & Submit</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Submit Equipment Offer</h1>
            <p className="text-gray-400">
              {step === 1 && "Specify the equipment you're offering"}
              {step === 2 && "Define your financial terms"}
              {step === 3 && "Review and submit your offer"}
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium text-blue-400 mb-1">Equipment Guidelines</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Specify exact models and specifications</li>
                      <li>• Include warranty terms and delivery timeline</li>
                      <li>• You can offer alternative brands if they meet requirements</li>
                    </ul>
                  </div>
                </div>
              </div>

              {formData.equipment.map((eq, index) => (
                <div key={eq.id} className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">
                      Equipment Item {index + 1}
                    </h3>
                    {formData.equipment.length > 1 && (
                      <button
                        onClick={() => removeEquipmentItem(eq.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Brand/Manufacturer
                      </label>
                      <input
                        type="text"
                        value={eq.brand}
                        onChange={(e) => updateEquipmentItem(eq.id, 'brand', e.target.value)}
                        placeholder="e.g., Fluence"
                        className="w-full px-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Model/Product Name
                      </label>
                      <input
                        type="text"
                        value={eq.model}
                        onChange={(e) => updateEquipmentItem(eq.id, 'model', e.target.value)}
                        placeholder="e.g., SPYDR 2x"
                        className="w-full px-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Quantity
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateEquipmentItem(eq.id, 'quantity', Math.max(1, eq.quantity - 1))}
                          className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={eq.quantity}
                          onChange={(e) => updateEquipmentItem(eq.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="flex-1 px-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white text-center"
                        />
                        <button
                          onClick={() => updateEquipmentItem(eq.id, 'quantity', eq.quantity + 1)}
                          className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Unit Price ($)
                      </label>
                      <input
                        type="number"
                        value={eq.unitPrice}
                        onChange={(e) => updateEquipmentItem(eq.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Warranty Period
                      </label>
                      <input
                        type="text"
                        value={eq.warranty}
                        onChange={(e) => updateEquipmentItem(eq.id, 'warranty', e.target.value)}
                        placeholder="e.g., 5 years"
                        className="w-full px-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Delivery Timeline
                      </label>
                      <input
                        type="text"
                        value={eq.delivery}
                        onChange={(e) => updateEquipmentItem(eq.id, 'delivery', e.target.value)}
                        placeholder="e.g., 30 days"
                        className="w-full px-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {eq.quantity > 0 && eq.unitPrice > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-sm text-gray-400">Subtotal</span>
                      <span className="text-lg font-semibold text-white">
                        ${(eq.quantity * eq.unitPrice).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={addEquipmentItem}
                className="w-full py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Another Equipment Item
              </button>

              {formData.totalValue > 0 && (
                <div className="bg-purple-900/20 rounded-xl p-6 border border-purple-500/20">
                  <div className="flex items-center justify-between text-xl">
                    <span className="font-medium text-white">Total Equipment Value</span>
                    <span className="font-bold text-white">${formData.totalValue.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Proposed Revenue Share (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.proposedRevShare}
                      onChange={(e) => setFormData({ ...formData, proposedRevShare: parseFloat(e.target.value) || 0 })}
                      min="0"
                      max="100"
                      step="0.5"
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      %
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Grower requested: {request.proposedRevShare}%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Term Length (months)
                  </label>
                  <input
                    type="number"
                    value={formData.termMonths}
                    onChange={(e) => setFormData({ ...formData, termMonths: parseInt(e.target.value) || 0 })}
                    min="12"
                    max="120"
                    className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Grower requested: {request.termMonths} months
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeInstallation}
                    onChange={(e) => setFormData({ ...formData, includeInstallation: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-white font-medium">Include Installation</span>
                    <p className="text-sm text-gray-400">Professional installation and setup included</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeMaintenance}
                    onChange={(e) => setFormData({ ...formData, includeMaintenance: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-white font-medium">Include Maintenance</span>
                    <p className="text-sm text-gray-400">Regular maintenance and support</p>
                  </div>
                </label>

                {formData.includeMaintenance && (
                  <div className="ml-8">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maintenance Period (months)
                    </label>
                    <input
                      type="number"
                      value={formData.maintenanceMonths}
                      onChange={(e) => setFormData({ ...formData, maintenanceMonths: parseInt(e.target.value) || 0 })}
                      min="12"
                      max="60"
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Financial Summary */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Financial Projection</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Equipment Value</span>
                    <span className="text-white">${formData.totalValue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Platform Fee (15%)</span>
                    <span className="text-purple-400">-${platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Monthly Revenue Share</span>
                    <span className="text-white">${monthlyRevShare.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Revenue ({formData.termMonths} months)</span>
                    <span className="text-white">${totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-gray-300 font-medium">Net Revenue</span>
                    <span className="text-xl font-bold text-green-400">${netRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium">Projected ROI</span>
                    <span className="text-xl font-bold text-green-400">{roi}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {/* Offer Summary */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Offer Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Equipment</h4>
                    {formData.equipment.map((eq, index) => (
                      <div key={eq.id} className="mb-2">
                        <div className="text-white">{eq.quantity}x {eq.brand} {eq.model}</div>
                        <div className="text-sm text-gray-400">${(eq.quantity * eq.unitPrice).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Terms</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Revenue Share</span>
                        <span className="text-white">{formData.proposedRevShare}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Term Length</span>
                        <span className="text-white">{formData.termMonths} months</span>
                      </div>
                      {formData.includeInstallation && (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Installation Included</span>
                        </div>
                      )}
                      {formData.includeMaintenance && (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">{formData.maintenanceMonths} months maintenance</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message to Grower
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Introduce yourself and explain why your offer is the best choice..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Why is your equipment the best choice?
                </label>
                <textarea
                  value={formData.whyBestOffer}
                  onChange={(e) => setFormData({ ...formData, whyBestOffer: e.target.value })}
                  placeholder="Explain the advantages of your equipment, energy efficiency, yield improvements, etc..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Previous Experience (Optional)
                </label>
                <textarea
                  value={formData.previousExperience}
                  onChange={(e) => setFormData({ ...formData, previousExperience: e.target.value })}
                  placeholder="Share any relevant experience with similar facilities or equipment..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div className="bg-yellow-900/20 rounded-xl p-4 border border-yellow-500/20">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 mt-0.5"
                  />
                  <div className="text-sm text-gray-300">
                    <p className="mb-1">
                      I understand and accept the platform's terms including:
                    </p>
                    <ul className="space-y-1 text-xs text-gray-400">
                      <li>• 15% platform fee on successful matches</li>
                      <li>• Smart escrow protection for both parties</li>
                      <li>• Binding revenue share agreement upon acceptance</li>
                      <li>• Platform-managed dispute resolution process</li>
                    </ul>
                  </div>
                </label>
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
                  (step === 1 && formData.totalValue === 0) ||
                  (step === 2 && formData.proposedRevShare === 0)
                }
                className={`${step === 1 ? 'w-full' : 'ml-auto'} px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.acceptTerms || !formData.message}
                className="ml-auto flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Offer
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Platform Fee Notice */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Escrow Protection</h3>
              <p className="text-gray-300 mb-3">
                Your offer is protected by our smart escrow system. The 15% platform fee covers:
              </p>
              <ul className="space-y-1 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Secure fund handling and automated release
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Equipment verification and quality assurance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Revenue share management and distribution
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Dispute resolution and platform support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}