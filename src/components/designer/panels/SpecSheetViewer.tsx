'use client';

import React, { useState } from 'react';
import { X, Download, ExternalLink, FileText, Info, Zap, Droplets, Thermometer } from 'lucide-react';

interface SpecSheetViewerProps {
  isOpen: boolean;
  onClose: () => void;
  product: any; // Product data
  type: 'fan' | 'dehumidifier' | 'co2' | 'hvac' | 'electrical' | 'controller' | 'irrigation' | 'bench';
}

export function SpecSheetViewer({ isOpen, onClose, product, type }: SpecSheetViewerProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !product) return null;

  const getProductIcon = () => {
    switch (type) {
      case 'fan': return <Zap className="w-6 h-6" />;
      case 'dehumidifier': return <Droplets className="w-6 h-6" />;
      case 'co2': return <Wind className="w-6 h-6" />;
      case 'hvac': return <Thermometer className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  const renderSpecifications = () => {
    switch (type) {
      case 'fan':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-300 mb-2">Performance</h4>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">CFM Rating</dt>
                  <dd className="text-white">{product.cfm || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Power</dt>
                  <dd className="text-white">{product.watts || 'N/A'} W</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Efficiency</dt>
                  <dd className="text-white">{product.efficiency || 'N/A'} CFM/W</dd>
                </div>
              </dl>
            </div>
            <div>
              <h4 className="font-medium text-gray-300 mb-2">Physical</h4>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Diameter</dt>
                  <dd className="text-white">{product.diameter || 'N/A'}"</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Weight</dt>
                  <dd className="text-white">{product.weight || 'N/A'} lbs</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Noise Level</dt>
                  <dd className="text-white">{product.noise || 'N/A'} dB</dd>
                </div>
              </dl>
            </div>
          </div>
        );
      
      case 'dehumidifier':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-300 mb-2">Performance</h4>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Capacity</dt>
                  <dd className="text-white">{product.capacity || 'N/A'} pints/day</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Coverage</dt>
                  <dd className="text-white">{product.coverage || 'N/A'} sq ft</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Power</dt>
                  <dd className="text-white">{product.watts || 'N/A'} W</dd>
                </div>
              </dl>
            </div>
            <div>
              <h4 className="font-medium text-gray-300 mb-2">Features</h4>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Humidity Range</dt>
                  <dd className="text-white">{product.humidityRange || '30-80'}%</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Tank Size</dt>
                  <dd className="text-white">{product.tankSize || 'N/A'} gal</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Drain Option</dt>
                  <dd className="text-white">{product.continuousDrain ? 'Yes' : 'No'}</dd>
                </div>
              </dl>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-300 mb-2">General Specifications</h4>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Model</dt>
                  <dd className="text-white">{product.model || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Manufacturer</dt>
                  <dd className="text-white">{product.manufacturer || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Warranty</dt>
                  <dd className="text-white">{product.warranty || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Price</dt>
                  <dd className="text-white">${product.price || 'Contact'}</dd>
                </div>
              </dl>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getProductIcon()}
            <div>
              <h2 className="text-xl font-semibold text-white">{product.name}</h2>
              <p className="text-sm text-gray-400">{product.manufacturer}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-gray-800 flex gap-6">
          {['overview', 'specifications', 'documentation'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Product Image */}
              {product.image && (
                <div className="bg-gray-800 rounded-lg p-4 flex justify-center">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="max-h-48 object-contain"
                  />
                </div>
              )}

              {/* Key Features */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {(product.features || [
                    'High efficiency operation',
                    'Quiet performance',
                    'Easy installation',
                    'Remote control capable'
                  ]).map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5"></div>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Description</h3>
                <p className="text-gray-300 leading-relaxed">
                  {product.description || 
                    'Professional-grade equipment designed for commercial cultivation facilities. ' +
                    'Built to withstand demanding environments while providing reliable performance ' +
                    'and energy efficiency.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="space-y-6">
              {renderSpecifications()}
              
              {/* Electrical Requirements */}
              <div>
                <h4 className="font-medium text-gray-300 mb-2">Electrical Requirements</h4>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">Voltage</dt>
                    <dd className="text-white">{product.voltage || '120V'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Amperage</dt>
                    <dd className="text-white">{product.amps || 'N/A'} A</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Plug Type</dt>
                    <dd className="text-white">{product.plugType || 'NEMA 5-15'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Cord Length</dt>
                    <dd className="text-white">{product.cordLength || '6'} ft</dd>
                  </div>
                </dl>
              </div>

              {/* Certifications */}
              <div>
                <h4 className="font-medium text-gray-300 mb-2">Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {(product.certifications || ['UL Listed', 'ETL', 'Energy Star']).map((cert: string) => (
                    <span key={cert} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documentation' && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">Installation Manual</p>
                      <p className="text-sm text-gray-400">PDF • 2.4 MB</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">Technical Specifications</p>
                      <p className="text-sm text-gray-400">PDF • 856 KB</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">Warranty Information</p>
                      <p className="text-sm text-gray-400">PDF • 124 KB</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-300">
                      Need additional documentation or CAD files? Contact our support team at{' '}
                      <a href="mailto:support@vibelux.com" className="underline">
                        support@vibelux.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-700 hover:border-gray-600 text-gray-300 rounded-lg transition-colors">
              Add to Project
            </button>
            <button className="px-4 py-2 border border-gray-700 hover:border-gray-600 text-gray-300 rounded-lg transition-colors">
              Compare
            </button>
          </div>
          <a
            href={product.manufacturerUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span>View on manufacturer site</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

// Add this import where Wind is used
import { Wind } from 'lucide-react';