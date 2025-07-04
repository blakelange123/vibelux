'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { 
  Package, ArrowLeft, Info, Calendar, DollarSign, Percent,
  Building, MapPin, FileText, Upload, AlertCircle, CheckCircle,
  Zap, TrendingUp, Shield, Clock
} from 'lucide-react';
import Link from 'next/link';

interface Facility {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
}

export default function CreateEquipmentRequestPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [formData, setFormData] = useState({
    facilityId: '',
    equipmentType: '',
    brand: '',
    specifications: {
      power: '',
      coverage: '',
      features: [],
      requirements: []
    },
    quantity: 1,
    estimatedValue: 0,
    proposedRevShare: 10,
    termMonths: 36,
    minPerformance: {
      uptime: 95,
      efficiency: 90
    },
    title: '',
    description: '',
    useCase: '',
    expectedROI: 25,
    currentSituation: '',
    deliveryLocation: '',
    neededBy: '',
    installationReady: false
  });

  useEffect(() => {
    fetchUserFacilities();
  }, []);

  const fetchUserFacilities = async () => {
    // In a real implementation, fetch user's facilities
    setFacilities([
      { id: '1', name: 'Green Valley Farms', type: 'GREENHOUSE', city: 'Sacramento', state: 'CA' },
      { id: '2', name: 'Urban Grow Co', type: 'VERTICAL_FARM', city: 'Chicago', state: 'IL' }
    ]);
  };

  const calculatePlatformFee = () => {
    return formData.estimatedValue * 0.15;
  };

  const calculateMonthlyRevShare = () => {
    // Simple calculation for demonstration
    const monthlyRevenue = formData.estimatedValue * 0.1; // Assume 10% monthly return
    return (monthlyRevenue * formData.proposedRevShare) / 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/equipment-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/equipment-board/${data.id}`);
      } else {
        console.error('Failed to create request');
      }
    } catch (error) {
      console.error('Error creating request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link
            href="/equipment-board"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Equipment Board
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Create Equipment Request</h1>
          <p className="text-gray-400">Request equipment investment from our network of investors</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Building className="w-6 h-6 text-purple-400" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Facility
                </label>
                <select
                  value={formData.facilityId}
                  onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  required
                >
                  <option value="">Select a facility</option>
                  {facilities.map(facility => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name} - {facility.city}, {facility.state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Request Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., 500 LED Grow Lights for Expansion"
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide a detailed description of your equipment needs..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Equipment Details */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-purple-400" />
              Equipment Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Equipment Type
                </label>
                <select
                  value={formData.equipmentType}
                  onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  required
                >
                  <option value="">Select equipment type</option>
                  <option value="LED Grow Lights">LED Grow Lights</option>
                  <option value="HVAC Systems">HVAC Systems</option>
                  <option value="Irrigation Systems">Irrigation Systems</option>
                  <option value="Environmental Sensors">Environmental Sensors</option>
                  <option value="Automation Systems">Automation Systems</option>
                  <option value="Racking Systems">Racking Systems</option>
                  <option value="Processing Equipment">Processing Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Brand (Optional)
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g., Fluence, Gavita"
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  min="1"
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estimated Total Value
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) })}
                    min="1000"
                    step="1000"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Use Case
              </label>
              <textarea
                value={formData.useCase}
                onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                placeholder="Explain how this equipment will be used and why it's needed..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Investment Terms */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              Investment Terms
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Proposed Revenue Share
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.proposedRevShare}
                    onChange={(e) => setFormData({ ...formData, proposedRevShare: parseFloat(e.target.value) })}
                    min="1"
                    max="50"
                    step="0.5"
                    className="w-full pr-10 px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    required
                  />
                  <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Term Length (Months)
                </label>
                <input
                  type="number"
                  value={formData.termMonths}
                  onChange={(e) => setFormData({ ...formData, termMonths: parseInt(e.target.value) })}
                  min="12"
                  max="120"
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expected ROI %
                </label>
                <input
                  type="number"
                  value={formData.expectedROI}
                  onChange={(e) => setFormData({ ...formData, expectedROI: parseFloat(e.target.value) })}
                  min="0"
                  step="1"
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Financial Summary */}
            <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Platform Fee (15%)</div>
                  <div className="text-xl font-semibold text-purple-400">
                    ${calculatePlatformFee().toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Est. Monthly Rev Share</div>
                  <div className="text-xl font-semibold text-green-400">
                    ${calculateMonthlyRevShare().toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Total Investment Needed</div>
                  <div className="text-xl font-semibold text-white">
                    ${(formData.estimatedValue + calculatePlatformFee()).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline & Delivery */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-purple-400" />
              Timeline & Delivery
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Equipment Needed By
                </label>
                <input
                  type="date"
                  value={formData.neededBy}
                  onChange={(e) => setFormData({ ...formData, neededBy: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Delivery Location
                </label>
                <input
                  type="text"
                  value={formData.deliveryLocation}
                  onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                  placeholder="Full delivery address"
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.installationReady}
                  onChange={(e) => setFormData({ ...formData, installationReady: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-300">
                  Installation site is ready (power, space, permits obtained)
                </span>
              </label>
            </div>
          </div>

          {/* Platform Fee Notice */}
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">15% Platform Fee</h3>
                <p className="text-gray-300 mb-3">
                  VibeLux charges a 15% platform fee on the equipment value for successful matches. This fee covers:
                </p>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Smart escrow protection during equipment transfer
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Equipment verification and quality assurance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Automated revenue sharing for the agreement term
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Dispute resolution and ongoing support
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <Link
              href="/equipment-board"
              className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Request...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Post Equipment Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}