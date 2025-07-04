'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  ArrowRight,
  Check,
  Shield,
  FileCheck,
  AlertTriangle,
  ClipboardCheck,
  Package,
  Truck,
  Users,
  Calendar,
  Download,
  Camera,
  Thermometer,
  BookOpen,
  Award,
  Clock,
  Database,
  Activity,
  Zap,
  X,
  Upload,
  Plus,
  Settings,
  Building,
  ChevronRight,
  Info
} from 'lucide-react';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'pending' | 'current' | 'completed';
  required: boolean;
}

const setupSteps: SetupStep[] = [
  {
    id: 'facility-info',
    title: 'Facility Information',
    description: 'Basic facility details and contact information',
    icon: Building,
    status: 'current',
    required: true
  },
  {
    id: 'gfsi-certification',
    title: 'GFSI Certification',
    description: 'Upload and manage food safety certifications',
    icon: Award,
    status: 'pending',
    required: true
  },
  {
    id: 'food-safety-plan',
    title: 'Food Safety Plan',
    description: 'HACCP/FSMA preventive controls documentation',
    icon: Shield,
    status: 'pending',
    required: true
  },
  {
    id: 'traceability',
    title: 'Traceability System',
    description: 'Configure lot tracking and recall procedures',
    icon: Package,
    status: 'pending',
    required: true
  },
  {
    id: 'temperature-monitoring',
    title: 'Temperature Monitoring',
    description: 'Setup continuous temperature logging',
    icon: Thermometer,
    status: 'pending',
    required: true
  },
  {
    id: 'allergen-management',
    title: 'Allergen Management',
    description: 'Allergen control and cross-contact prevention',
    icon: AlertTriangle,
    status: 'pending',
    required: true
  },
  {
    id: 'documentation',
    title: 'Required Documentation',
    description: 'Upload specifications, SOPs, and procedures',
    icon: FileCheck,
    status: 'pending',
    required: true
  },
  {
    id: 'training-records',
    title: 'Training Records',
    description: 'Employee training and competency verification',
    icon: Users,
    status: 'pending',
    required: true
  },
  {
    id: 'final-review',
    title: 'Final Review',
    description: 'Review and submit US Foods application',
    icon: ClipboardCheck,
    status: 'pending',
    required: true
  }
];

export default function USFoodsSetupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [facilityData, setFacilityData] = useState({
    companyName: '',
    facilityName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    emergencyContact: '',
    emergencyPhone: '',
    cropTypes: [] as string[],
    facilityType: '',
    annualVolume: '',
    glnNumber: ''
  });

  const handleNextStep = () => {
    if (currentStep < setupSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStepContent = () => {
    const step = setupSteps[currentStep];
    
    switch (step.id) {
      case 'facility-info':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={facilityData.companyName}
                  onChange={(e) => setFacilityData({...facilityData, companyName: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Your Company Name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Facility Name *
                </label>
                <input
                  type="text"
                  value={facilityData.facilityName}
                  onChange={(e) => setFacilityData({...facilityData, facilityName: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Production Facility Name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Facility Address *
              </label>
              <input
                type="text"
                value={facilityData.address}
                onChange={(e) => setFacilityData({...facilityData, address: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="Street Address"
              />
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={facilityData.city}
                  onChange={(e) => setFacilityData({...facilityData, city: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  State *
                </label>
                <select
                  value={facilityData.state}
                  onChange={(e) => setFacilityData({...facilityData, state: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select State</option>
                  <option value="CA">California</option>
                  <option value="TX">Texas</option>
                  <option value="FL">Florida</option>
                  <option value="NY">New York</option>
                  <option value="OH">Ohio</option>
                  {/* Add more states as needed */}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={facilityData.zipCode}
                  onChange={(e) => setFacilityData({...facilityData, zipCode: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primary Contact Name *
                </label>
                <input
                  type="text"
                  value={facilityData.contactName}
                  onChange={(e) => setFacilityData({...facilityData, contactName: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Email *
                </label>
                <input
                  type="email"
                  value={facilityData.contactEmail}
                  onChange={(e) => setFacilityData({...facilityData, contactEmail: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  value={facilityData.contactPhone}
                  onChange={(e) => setFacilityData({...facilityData, contactPhone: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  24/7 Emergency Contact *
                </label>
                <input
                  type="tel"
                  value={facilityData.emergencyPhone}
                  onChange={(e) => setFacilityData({...facilityData, emergencyPhone: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Facility Type *
              </label>
              <select
                value={facilityData.facilityType}
                onChange={(e) => setFacilityData({...facilityData, facilityType: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Facility Type</option>
                <option value="greenhouse">Greenhouse</option>
                <option value="vertical-farm">Vertical Farm</option>
                <option value="container-farm">Container Farm</option>
                <option value="indoor-farm">Indoor Growing Facility</option>
                <option value="hydroponic">Hydroponic Facility</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Crop Types (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Leafy Greens', 'Herbs', 'Microgreens', 'Tomatoes', 'Berries', 'Cucumbers', 'Peppers', 'Other'].map((crop) => (
                  <label key={crop} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={facilityData.cropTypes.includes(crop)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFacilityData({
                            ...facilityData,
                            cropTypes: [...facilityData.cropTypes, crop]
                          });
                        } else {
                          setFacilityData({
                            ...facilityData,
                            cropTypes: facilityData.cropTypes.filter(c => c !== crop)
                          });
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded"
                    />
                    <span className="text-sm text-gray-300">{crop}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'gfsi-certification':
        return (
          <div className="space-y-6">
            <div className="bg-blue-900/20 rounded-lg p-6 border border-blue-600/30">
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-blue-400">GFSI Certification Required</h3>
              </div>
              <p className="text-gray-300 mb-4">
                US Foods requires valid GFSI certification (BRC, SQF, FSSC 22000, or IFS). Upload your current certificate and audit reports.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Current Certificate
                </h4>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Upload Certificate</p>
                  <p className="text-sm text-gray-500">PDF format, max 10MB</p>
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Choose File
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-green-400" />
                  Audit Report
                </h4>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Upload Audit Report</p>
                  <p className="text-sm text-gray-500">PDF format, max 10MB</p>
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Choose File
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Certification Type *
                </label>
                <select className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                  <option value="">Select Type</option>
                  <option value="BRC">BRC Food Safety</option>
                  <option value="SQF">SQF Food Safety</option>
                  <option value="FSSC22000">FSSC 22000</option>
                  <option value="IFS">IFS Food</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Issue Date *
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expiration Date *
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Certification Body
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="e.g., SGS, Bureau Veritas, NSF"
              />
            </div>
          </div>
        );

      case 'food-safety-plan':
        return (
          <div className="space-y-6">
            <div className="bg-red-900/20 rounded-lg p-6 border border-red-600/30">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-semibold text-red-400">FSMA Food Safety Plan Required</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Upload your HACCP plan or FSMA Preventive Controls plan including hazard analysis, preventive controls, monitoring procedures, and corrective actions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-blue-400" />
                  Food Safety Plan
                </h4>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Upload Food Safety Plan</p>
                  <p className="text-sm text-gray-500">PDF format, max 25MB</p>
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Choose File
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-green-400" />
                  Validation Studies
                </h4>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Upload Validation Studies</p>
                  <p className="text-sm text-gray-500">PDF format, max 25MB</p>
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Choose File
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Plan Type</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg cursor-pointer">
                  <input type="radio" name="planType" value="haccp" className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-medium">HACCP Plan</p>
                    <p className="text-sm text-gray-400">Traditional HACCP with 7 principles</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg cursor-pointer">
                  <input type="radio" name="planType" value="preventive" className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-medium">FSMA Preventive Controls</p>
                    <p className="text-sm text-gray-400">Modern risk-based approach</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="font-semibold mb-4">Required Components Checklist</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Hazard Analysis (Biological, Chemical, Physical)',
                  'Preventive Controls Identification',
                  'Monitoring Procedures and Frequency',
                  'Corrective Action Procedures',
                  'Verification Activities',
                  'Validation Documentation',
                  'Record-Keeping Procedures',
                  'Qualified Individual Designation'
                ].map((item) => (
                  <label key={item} className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded" />
                    <span className="text-sm text-gray-300">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'traceability':
        return (
          <div className="space-y-6">
            <div className="bg-orange-900/20 rounded-lg p-6 border border-orange-600/30">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-6 h-6 text-orange-400" />
                <h3 className="text-lg font-semibold text-orange-400">Traceability Requirements</h3>
              </div>
              <p className="text-gray-300 mb-4">
                US Foods requires one-step forward, one-step back traceability within 4 hours. Configure your lot tracking system and mock recall procedures.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Lot Code Configuration</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Lot Code Format
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., YYYYMMDD-###"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">Use YYYY=Year, MM=Month, DD=Day, ###=Batch</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Starting Number
                    </label>
                    <input
                      type="number"
                      placeholder="001"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="autoIncrement" className="w-4 h-4 text-blue-600" />
                    <label htmlFor="autoIncrement" className="text-sm text-gray-300">
                      Auto-increment batch numbers
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Mock Recall Schedule</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Frequency
                    </label>
                    <select className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                      <option value="twice-yearly">Twice Yearly (Required)</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Next Mock Recall Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="bg-blue-900/20 p-3 rounded border border-blue-600/30">
                    <p className="text-sm text-blue-400 mb-1">Mock Recall Target</p>
                    <p className="text-xs text-gray-400">Complete within 4 hours per US Foods requirement</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="font-semibold mb-4">Tracking Points Configuration</h4>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { point: 'Seed/Transplant Receipt', icon: '🌱', required: true },
                  { point: 'Growing/Production', icon: '🌿', required: true },
                  { point: 'Harvest', icon: '✂️', required: true },
                  { point: 'Post-Harvest Processing', icon: '🔄', required: true },
                  { point: 'Packaging', icon: '📦', required: true },
                  { point: 'Cold Storage', icon: '❄️', required: true },
                  { point: 'Distribution/Shipping', icon: '🚛', required: true },
                  { point: 'Customer Delivery', icon: '📍', required: true }
                ].map((item) => (
                  <div key={item.point} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.point}</p>
                        {item.required && <p className="text-xs text-red-400">Required</p>}
                      </div>
                      <input type="checkbox" defaultChecked={item.required} className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'temperature-monitoring':
        return (
          <div className="space-y-6">
            <div className="bg-blue-900/20 rounded-lg p-6 border border-blue-600/30">
              <div className="flex items-center gap-3 mb-4">
                <Thermometer className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-blue-400">Temperature Monitoring Setup</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Configure continuous temperature monitoring for growing areas, storage, and transportation. US Foods requires TTR (Time Temperature Recorder) compliance.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Growing Environment
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Target Temp (°F)
                      </label>
                      <input
                        type="number"
                        placeholder="70"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tolerance (±°F)
                      </label>
                      <input
                        type="number"
                        placeholder="5"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Monitoring Interval
                    </label>
                    <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none">
                      <option value="1">Every 1 minute</option>
                      <option value="5">Every 5 minutes</option>
                      <option value="15">Every 15 minutes</option>
                      <option value="30">Every 30 minutes</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="growingAlerts" className="w-4 h-4 text-blue-600" />
                    <label htmlFor="growingAlerts" className="text-sm text-gray-300">
                      Enable temperature deviation alerts
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-400" />
                  Post-Harvest Storage
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Storage Temp (°F)
                      </label>
                      <input
                        type="number"
                        placeholder="35"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tolerance (±°F)
                      </label>
                      <input
                        type="number"
                        placeholder="2"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Critical Control Point
                    </label>
                    <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none">
                      <option value="yes">Yes - CCP Required</option>
                      <option value="no">No - Monitoring Only</option>
                    </select>
                  </div>

                  <div className="bg-yellow-900/20 p-3 rounded border border-yellow-600/30">
                    <p className="text-sm text-yellow-400 mb-1">Leafy Greens Special Requirement</p>
                    <p className="text-xs text-gray-400">Must cool to 35°F within 3 hours of harvest</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-400" />
                Transportation Requirements
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Shipping Temperature (°F)
                  </label>
                  <input
                    type="number"
                    placeholder="35"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    TTR Device Type
                  </label>
                  <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none">
                    <option value="digital">Digital Data Logger</option>
                    <option value="bluetooth">Bluetooth Sensor</option>
                    <option value="wifi">WiFi Enabled</option>
                    <option value="cellular">Cellular Connected</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recording Interval
                  </label>
                  <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none">
                    <option value="1">Every 1 minute</option>
                    <option value="5">Every 5 minutes</option>
                    <option value="15">Every 15 minutes</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="ttrRequired" className="w-4 h-4 text-blue-600" defaultChecked />
                  <label htmlFor="ttrRequired" className="text-sm text-gray-300">
                    TTR device required for all shipments
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="tempDeviationAlert" className="w-4 h-4 text-blue-600" />
                  <label htmlFor="tempDeviationAlert" className="text-sm text-gray-300">
                    Real-time temperature deviation alerts
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'allergen-management':
        return (
          <div className="space-y-6">
            <div className="bg-red-900/20 rounded-lg p-6 border border-red-600/30">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-semibold text-red-400">Allergen Control Program</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Configure allergen management and cross-contact prevention procedures. US Foods requires comprehensive allergen controls even for produce operations.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Facility Allergen Assessment</h4>
                <div className="space-y-3">
                  <p className="text-sm text-gray-400 mb-3">Check all allergens present in your facility:</p>
                  {[
                    'Milk/Dairy', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts', 
                    'Peanuts', 'Wheat/Gluten', 'Soybeans', 'Sesame'
                  ].map((allergen) => (
                    <label key={allergen} className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded" />
                      <span className="text-sm text-gray-300">{allergen}</span>
                    </label>
                  ))}
                  
                  <div className="mt-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded" />
                      <span className="text-sm text-green-400">Allergen-free facility</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Cross-Contact Prevention</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sanitation Frequency
                    </label>
                    <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none">
                      <option value="batch">Between each batch</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="na">N/A - Single product</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Verification Method
                    </label>
                    <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none">
                      <option value="visual">Visual inspection</option>
                      <option value="atp">ATP testing</option>
                      <option value="protein">Protein testing</option>
                      <option value="combo">Combined methods</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="allergenTraining" className="w-4 h-4 text-blue-600" />
                    <label htmlFor="allergenTraining" className="text-sm text-gray-300">
                      Annual allergen training required
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="font-semibold mb-4">Required Documentation</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-300">Procedures & SOPs</h5>
                  {[
                    'Allergen Risk Assessment',
                    'Sanitation Procedures',
                    'Label Verification Process',
                    'Supplier Guarantee Letters'
                  ].map((item) => (
                    <div key={item} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                      <span className="text-sm text-gray-300">{item}</span>
                      <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                        Upload
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-300">Training & Records</h5>
                  {[
                    'Employee Training Records',
                    'Sanitation Verification Logs',
                    'Changeover Procedures',
                    'Incident Report Forms'
                  ].map((item) => (
                    <div key={item} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                      <span className="text-sm text-gray-300">{item}</span>
                      <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                        Upload
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'documentation':
        return (
          <div className="space-y-6">
            <div className="bg-purple-900/20 rounded-lg p-6 border border-purple-600/30">
              <div className="flex items-center gap-3 mb-4">
                <FileCheck className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-purple-400">Required Documentation Upload</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Upload all required US Foods documentation including specifications, SOPs, process flows, and compliance certificates.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  category: 'Specifications & Product Info',
                  documents: [
                    'Product Specifications',
                    'Nutritional Information',
                    'Shelf Life Studies',
                    'Product Images/Photos'
                  ]
                },
                {
                  category: 'Process Documentation',
                  documents: [
                    'Process Flow Diagrams',
                    'Good Manufacturing Practices (GMP)',
                    'Sanitation SOPs',
                    'Pest Control Procedures'
                  ]
                },
                {
                  category: 'Quality & Testing',
                  documents: [
                    'Quality Control Procedures',
                    'Testing Protocols',
                    'Calibration Records',
                    'Lab Testing Results'
                  ]
                },
                {
                  category: 'Compliance & Certifications',
                  documents: [
                    'Organic Certificates (if applicable)',
                    'Non-GMO Verification',
                    'Water Testing Reports',
                    'Environmental Monitoring Plan'
                  ]
                }
              ].map((section) => (
                <div key={section.category} className="bg-gray-800 rounded-lg p-6">
                  <h4 className="font-semibold mb-4 text-purple-400">{section.category}</h4>
                  <div className="space-y-3">
                    {section.documents.map((doc) => (
                      <div key={doc} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileCheck className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-300">{doc}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Not uploaded</span>
                          <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                            Upload
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                Document Requirements
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-300 mb-3">File Requirements</h5>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• PDF format preferred</li>
                    <li>• Maximum file size: 25MB</li>
                    <li>• Documents must be current (within 1 year)</li>
                    <li>• English language or certified translation</li>
                    <li>• Clear, legible copies required</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-300 mb-3">Version Control</h5>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• All documents will be version tracked</li>
                    <li>• Automatic expiration reminders</li>
                    <li>• Secure document sharing with US Foods</li>
                    <li>• Audit trail maintained</li>
                    <li>• Previous versions archived</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'training-records':
        return (
          <div className="space-y-6">
            <div className="bg-green-900/20 rounded-lg p-6 border border-green-600/30">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold text-green-400">Employee Training Management</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Configure employee training programs and maintain records for US Foods compliance. All employees must receive appropriate food safety training.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Required Training Programs</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Food Safety Fundamentals', frequency: 'Annual', required: true },
                    { name: 'Personal Hygiene', frequency: 'Annual', required: true },
                    { name: 'Allergen Awareness', frequency: 'Annual', required: true },
                    { name: 'Sanitation Procedures', frequency: 'Annual', required: true },
                    { name: 'HACCP Principles', frequency: 'Annual', required: false },
                    { name: 'Traceability Procedures', frequency: 'Annual', required: true },
                    { name: 'Equipment Operation', frequency: 'As needed', required: false },
                    { name: 'Emergency Procedures', frequency: 'Annual', required: true }
                  ].map((training) => (
                    <div key={training.name} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          defaultChecked={training.required}
                          className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded" 
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-200">{training.name}</p>
                          <p className="text-xs text-gray-400">{training.frequency}</p>
                        </div>
                      </div>
                      {training.required && (
                        <span className="px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded border border-red-600/30">
                          REQUIRED
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Training Schedule</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Employee Training Period
                    </label>
                    <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none">
                      <option value="30">Within 30 days</option>
                      <option value="60">Within 60 days</option>
                      <option value="90">Within 90 days</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Annual Refresher Training Month
                    </label>
                    <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none">
                      <option value="1">January</option>
                      <option value="2">February</option>
                      <option value="3">March</option>
                      <option value="4">April</option>
                      <option value="5">May</option>
                      <option value="6">June</option>
                      <option value="7">July</option>
                      <option value="8">August</option>
                      <option value="9">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="autoReminders" className="w-4 h-4 text-blue-600" />
                    <label htmlFor="autoReminders" className="text-sm text-gray-300">
                      Enable automatic training reminders
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="competencyTest" className="w-4 h-4 text-blue-600" />
                    <label htmlFor="competencyTest" className="text-sm text-gray-300">
                      Require competency testing
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="font-semibold mb-4">Employee Training Records Upload</h4>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  'Current Training Certificates',
                  'Training Attendance Records',
                  'Competency Test Results'
                ].map((docType) => (
                  <div key={docType} className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 mb-2">{docType}</p>
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      Upload Files
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-blue-900/20 rounded border border-blue-600/30">
                <p className="text-sm text-blue-400 mb-2">Training Record Requirements</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Maintain records for minimum 3 years</li>
                  <li>• Include employee name, training topic, date, trainer signature</li>
                  <li>• Digital signatures acceptable</li>
                  <li>• Training must be documented before employee works with food</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'final-review':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg p-6 border border-green-600/30">
              <div className="flex items-center gap-3 mb-4">
                <ClipboardCheck className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold text-green-400">Final Review & Submission</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Review all completed setup steps and submit your US Foods supplier application. Our system will generate the required documentation package.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="font-semibold mb-4">Setup Completion Status</h4>
              <div className="space-y-3">
                {setupSteps.slice(0, -1).map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index < currentStep;
                  return (
                    <div key={step.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-600' : 'bg-gray-600'
                        }`}>
                          {isCompleted ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : (
                            <Icon className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-200">{step.title}</p>
                          <p className="text-sm text-gray-400">{step.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <span className="px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded border border-green-600/30">
                            Complete
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 text-sm rounded border border-yellow-600/30">
                            Pending
                          </span>
                        )}
                        <button className="text-blue-400 hover:text-blue-300 text-sm">
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Generated Documents</h4>
                <div className="space-y-3">
                  {[
                    'US Foods Supplier Application',
                    'GFSI Compliance Summary',
                    'Food Safety Plan Overview',
                    'Traceability Documentation',
                    'Temperature Monitoring Plan',
                    'Training Records Summary'
                  ].map((doc) => (
                    <div key={doc} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                      <span className="text-sm text-gray-300">{doc}</span>
                      <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                        Preview
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Submission Checklist</h4>
                <div className="space-y-3">
                  {[
                    { item: 'All required fields completed', status: 'complete' },
                    { item: 'GFSI certificate uploaded', status: 'complete' },
                    { item: 'Food safety plan uploaded', status: 'pending' },
                    { item: 'Traceability system configured', status: 'pending' },
                    { item: 'Temperature monitoring setup', status: 'pending' },
                    { item: 'Training records uploaded', status: 'pending' }
                  ].map((check) => (
                    <div key={check.item} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${
                        check.status === 'complete' ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        {check.status === 'complete' && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm ${
                        check.status === 'complete' ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {check.item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-6 text-center">
              <h4 className="text-xl font-semibold mb-4">Ready to Submit Application</h4>
              <p className="text-gray-200 mb-6">
                Your US Foods supplier application package is ready for submission. 
                Our team will review and submit directly to US Foods procurement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                  Submit Application
                </button>
                <button className="px-8 py-3 bg-transparent border border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Setup Step: {step.title}</h3>
            <p className="text-gray-400 mb-6">{step.description}</p>
            <p className="text-sm text-gray-500">This step configuration is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/compliance/us-foods"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to US Foods Compliance
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">US Foods Compliance Setup</h1>
              <p className="text-gray-400">Step-by-step setup for US Foods supplier approval</p>
            </div>
            
            <div className="text-sm text-gray-400">
              Step {currentStep + 1} of {setupSteps.length}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl p-6 sticky top-6">
              <h3 className="font-semibold mb-4">Setup Progress</h3>
              
              <div className="space-y-3">
                {setupSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-blue-600/20 border border-blue-600/50' 
                          : isCompleted 
                          ? 'bg-green-600/20 border border-green-600/50'
                          : 'bg-gray-800 border border-gray-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive 
                          ? 'bg-blue-600' 
                          : isCompleted 
                          ? 'bg-green-600'
                          : 'bg-gray-700'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <Icon className="w-4 h-4 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          isActive ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          {step.title}
                        </p>
                        {step.required && (
                          <p className="text-xs text-red-400">Required</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900 rounded-xl p-8">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  {React.createElement(setupSteps[currentStep].icon, {
                    className: "w-8 h-8 text-blue-400"
                  })}
                  <h2 className="text-2xl font-bold">{setupSteps[currentStep].title}</h2>
                  {setupSteps[currentStep].required && (
                    <span className="px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded border border-red-600/30">
                      REQUIRED
                    </span>
                  )}
                </div>
                <p className="text-gray-400">{setupSteps[currentStep].description}</p>
              </div>

              {/* Step Content */}
              {renderCurrentStepContent()}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-800">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentStep === 0
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Previous
                </button>

                <div className="text-sm text-gray-400">
                  {currentStep + 1} of {setupSteps.length} steps
                </div>

                <button
                  onClick={handleNextStep}
                  disabled={currentStep === setupSteps.length - 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentStep === setupSteps.length - 1
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {currentStep === setupSteps.length - 1 ? 'Complete Setup' : 'Next Step'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}