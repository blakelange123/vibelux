'use client';

import React, { useState, useRef } from 'react';
import {
  Upload, FileText, Database, CheckCircle,
  AlertCircle, X, Download, Search, Star,
  Zap, Sun, Eye, ArrowRight, ArrowLeft,
  Info, Link, Plus, Edit2, Trash2
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';

interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IESData {
  lampLumens: number;
  lampWatts: number;
  angles: number[];
  candela: number[][];
  tiltAngles?: number[];
  manufacturer?: string;
  model?: string;
  description?: string;
}

interface DLCData {
  manufacturer: string;
  brand: string;
  model: string;
  dlcListingId: string;
  ppeWhite: number; // μmol/J
  inputWatts: number;
  ppf: number; // μmol/s
  efficacy: number; // lm/W
  cct?: number;
  cri?: number;
  thd?: number;
  powerFactor?: number;
}

type WizardStep = 'type' | 'upload' | 'configure' | 'preview';

export function FixtureImportWizard({ isOpen, onClose }: ImportWizardProps) {
  const { dispatch } = useDesigner();
  const { showNotification } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<WizardStep>('type');
  const [importType, setImportType] = useState<'ies' | 'dlc' | 'manual' | ''>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<IESData | DLCData | null>(null);
  
  // Manual entry fields
  const [manualData, setManualData] = useState({
    name: '',
    manufacturer: '',
    model: '',
    power: 100,
    ppf: 1800,
    ppe: 2.7,
    spectrum: {
      red: 40,
      blue: 30,
      green: 10,
      farRed: 15,
      uv: 5
    },
    beamAngle: 120,
    dimensions: {
      length: 48,
      width: 44,
      height: 4
    },
    price: 899
  });

  const [dlcSearchQuery, setDlcSearchQuery] = useState('');
  const [dlcSearchResults, setDlcSearchResults] = useState<DLCData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessing(true);

    if (importType === 'ies') {
      parseIESFile(file);
    } else if (importType === 'dlc') {
      parseDLCFile(file);
    }
  };

  const parseIESFile = async (file: File) => {
    try {
      const text = await file.text();
      // Simplified IES parser - in real app would be more comprehensive
      const lines = text.split('\n');
      
      let lampLumens = 0;
      const lampWatts = 100;
      const angles: number[] = [];
      const candela: number[][] = [];

      // Parse basic lamp info
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes('TILT=')) {
          // Parse tilt info
        } else if (line.match(/^\d+\s+\d+\s+\d+/)) {
          // Parse photometric data header
          const parts = line.split(/\s+/);
          lampLumens = parseFloat(parts[0]) || 0;
          // Continue parsing...
        }
      }

      // Mock parsed data for demo
      setParsedData({
        lampLumens: 50000,
        lampWatts: 400,
        angles: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90],
        candela: [[100, 98, 95, 90, 85, 78, 70, 60, 50, 40, 30, 22, 15, 10, 7, 5, 3, 1, 0]],
        manufacturer: 'Imported Fixture',
        model: file.name.replace('.ies', '')
      });

      setIsProcessing(false);
      setCurrentStep('configure');
    } catch (error) {
      showNotification('error', 'Failed to parse IES file');
      setIsProcessing(false);
    }
  };

  const parseDLCFile = async (file: File) => {
    try {
      const text = await file.text();
      
      // Check if it's CSV or JSON
      const isJSON = file.name.endsWith('.json') || text.trim().startsWith('{') || text.trim().startsWith('[');
      
      if (isJSON) {
        // Parse JSON format
        const dlcData = JSON.parse(text);
        const fixtures = Array.isArray(dlcData) ? dlcData : [dlcData];
        
        // Extract first fixture for configuration
        const fixture = fixtures[0];
        setParsedData({
          lampLumens: fixture.lumens || fixture.totalLumens || 0,
          lampWatts: fixture.watts || fixture.power || 0,
          angles: [0, 30, 60, 90], // Standard angles
          candela: [[100, 85, 50, 0]], // Simplified distribution
          manufacturer: fixture.manufacturer || fixture.brand || 'Unknown',
          model: fixture.model || fixture.productCode || 'Unknown',
          ppf: fixture.ppf || fixture.photonFlux || (fixture.lumens ? fixture.lumens * 0.015 : 0),
          efficacy: fixture.efficacy || fixture.efficiency || 2.5,
          dlcId: fixture.dlcId || fixture.id || null
        } as any);
        
        showNotification('success', `Loaded ${fixtures.length} fixture(s) from DLC file`);
      } else {
        // Parse CSV format
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        // Find relevant column indices
        const colIndices = {
          manufacturer: headers.findIndex(h => h.includes('manufacturer') || h.includes('brand')),
          model: headers.findIndex(h => h.includes('model') || h.includes('product')),
          watts: headers.findIndex(h => h.includes('watt') || h.includes('power')),
          ppf: headers.findIndex(h => h.includes('ppf') || h.includes('photon')),
          efficacy: headers.findIndex(h => h.includes('efficacy') || h.includes('efficiency')),
          dlcId: headers.findIndex(h => h.includes('dlc') || h.includes('id'))
        };
        
        // Parse first data row
        if (lines.length > 1) {
          const data = lines[1].split(',').map(d => d.trim());
          
          setParsedData({
            lampLumens: 0, // Not typically in DLC data
            lampWatts: parseFloat(data[colIndices.watts]) || 100,
            angles: [0, 30, 60, 90],
            candela: [[100, 85, 50, 0]],
            manufacturer: data[colIndices.manufacturer] || 'Unknown',
            model: data[colIndices.model] || 'Unknown',
            ppf: parseFloat(data[colIndices.ppf]) || 1000,
            efficacy: parseFloat(data[colIndices.efficacy]) || 2.5,
            dlcId: data[colIndices.dlcId] || null
          } as any);
          
          showNotification('success', `Loaded ${lines.length - 1} fixture(s) from DLC CSV`);
        }
      }
      
      setIsProcessing(false);
      setCurrentStep('configure');
    } catch (error) {
      showNotification('error', 'Failed to parse DLC file');
      setIsProcessing(false);
    }
  };

  const searchDLCDatabase = async () => {
    setIsSearching(true);
    
    // Mock DLC database search
    setTimeout(() => {
      setDlcSearchResults([
        {
          manufacturer: 'Fluence',
          brand: 'Fluence',
          model: 'SPYDR 2p',
          dlcListingId: 'PL12345',
          ppeWhite: 2.7,
          inputWatts: 645,
          ppf: 1741,
          efficacy: 170,
          cct: 3000,
          cri: 85
        },
        {
          manufacturer: 'Gavita',
          brand: 'Gavita',
          model: 'Pro 1700e LED',
          dlcListingId: 'PL23456',
          ppeWhite: 2.9,
          inputWatts: 645,
          ppf: 1870,
          efficacy: 180,
          cct: 3200,
          cri: 90
        }
      ]);
      setIsSearching(false);
    }, 1000);
  };

  const handleDLCSelect = (fixture: DLCData) => {
    setParsedData(fixture);
    setCurrentStep('configure');
  };

  const convertToFixture = () => {
    let fixtureData: any = {
      id: `fixture-${Date.now()}`,
      type: 'fixture',
      name: '',
      manufacturer: '',
      model: '',
      power: 0,
      ppf: 0,
      ppe: 0,
      spectrum: {},
      price: 0
    };

    if (importType === 'ies' && parsedData) {
      const iesData = parsedData as IESData;
      fixtureData = {
        ...fixtureData,
        name: iesData.model || 'Imported IES Fixture',
        manufacturer: iesData.manufacturer || 'Unknown',
        model: iesData.model || 'Unknown',
        power: iesData.lampWatts,
        ppf: iesData.lampLumens * 0.014, // Rough conversion
        ppe: (iesData.lampLumens * 0.014) / iesData.lampWatts,
        distributionData: {
          angles: iesData.angles,
          candela: iesData.candela
        }
      };
    } else if (importType === 'dlc' && parsedData) {
      const dlcData = parsedData as DLCData;
      fixtureData = {
        ...fixtureData,
        name: `${dlcData.brand} ${dlcData.model}`,
        manufacturer: dlcData.manufacturer,
        model: dlcData.model,
        power: dlcData.inputWatts,
        ppf: dlcData.ppf,
        ppe: dlcData.ppeWhite,
        dlcListingId: dlcData.dlcListingId,
        cct: dlcData.cct,
        cri: dlcData.cri
      };
    } else if (importType === 'manual') {
      fixtureData = {
        ...fixtureData,
        name: manualData.name,
        manufacturer: manualData.manufacturer,
        model: manualData.model,
        power: manualData.power,
        ppf: manualData.ppf,
        ppe: manualData.ppe,
        spectrum: manualData.spectrum,
        beamAngle: manualData.beamAngle,
        dimensions: manualData.dimensions,
        price: manualData.price
      };
    }

    // Add to fixture library
    // Store custom fixture in UI state
    dispatch({
      type: 'UPDATE_UI',
      payload: { 
        customFixture: fixtureData 
      } as any
    });

    showNotification('success', `Fixture "${fixtureData.name}" imported successfully`);
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'type':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Choose Import Method
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setImportType('ies');
                  setCurrentStep('upload');
                }}
                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
              >
                <FileText className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">IES File</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Import photometric data from IES files
                </p>
              </button>

              <button
                onClick={() => {
                  setImportType('dlc');
                  setCurrentStep('upload');
                }}
                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
              >
                <Database className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">DLC Database</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Search DesignLights Consortium database
                </p>
              </button>

              <button
                onClick={() => {
                  setImportType('manual');
                  setCurrentStep('configure');
                }}
                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
              >
                <Edit2 className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Manual Entry</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter fixture specifications manually
                </p>
              </button>
            </div>
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {importType === 'ies' ? 'Upload IES File' : 'Search DLC Database'}
              </h3>
              <button
                onClick={() => setCurrentStep('type')}
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Back
              </button>
            </div>

            {importType === 'ies' ? (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Click to upload IES file or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports .ies, .ldt, and .elumdat formats
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ies,.ldt,.elumdat"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {uploadedFile && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium">{uploadedFile.name}</span>
                    </div>
                    {isProcessing && (
                      <span className="text-sm text-gray-500">Processing...</span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dlcSearchQuery}
                    onChange={(e) => setDlcSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchDLCDatabase()}
                    placeholder="Search by manufacturer, model, or DLC ID"
                    className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                  <button
                    onClick={searchDLCDatabase}
                    disabled={isSearching}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>

                {dlcSearchResults.length > 0 && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {dlcSearchResults.map((result, index) => (
                      <div
                        key={index}
                        onClick={() => handleDLCSelect(result)}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {result.brand} {result.model}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {result.manufacturer} • DLC ID: {result.dlcListingId}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-purple-600">
                              {result.ppeWhite} µmol/J
                            </p>
                            <p className="text-xs text-gray-500">
                              {result.inputWatts}W • {result.ppf} PPF
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'configure':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Configure Fixture Details
              </h3>
              <button
                onClick={() => setCurrentStep(importType === 'manual' ? 'type' : 'upload')}
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Back
              </button>
            </div>

            {importType === 'manual' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fixture Name
                    </label>
                    <input
                      type="text"
                      value={manualData.name}
                      onChange={(e) => setManualData({...manualData, name: e.target.value})}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      value={manualData.manufacturer}
                      onChange={(e) => setManualData({...manualData, manufacturer: e.target.value})}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Power (W)
                    </label>
                    <input
                      type="number"
                      value={manualData.power}
                      onChange={(e) => setManualData({...manualData, power: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      PPF (µmol/s)
                    </label>
                    <input
                      type="number"
                      value={manualData.ppf}
                      onChange={(e) => setManualData({...manualData, ppf: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      PPE (µmol/J)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={manualData.ppe}
                      onChange={(e) => setManualData({...manualData, ppe: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Spectrum Distribution
                  </label>
                  <div className="space-y-2">
                    {Object.entries(manualData.spectrum).map(([color, value]) => (
                      <div key={color} className="flex items-center gap-3">
                        <span className="w-20 text-sm capitalize">{color}:</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={value}
                          onChange={(e) => setManualData({
                            ...manualData,
                            spectrum: {
                              ...manualData.spectrum,
                              [color]: Number(e.target.value)
                            }
                          })}
                          className="flex-1"
                        />
                        <span className="w-12 text-sm text-right">{value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Imported Fixture Data
                </h4>
                {parsedData && (
                  <div className="space-y-2 text-sm">
                    {/* Display parsed data */}
                    <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto">
                      {JSON.stringify(parsedData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setCurrentStep('preview')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Preview Import
              </button>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Preview & Confirm
            </h3>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {importType === 'manual' ? manualData.name : 'Imported Fixture'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ready to import
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Power</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {importType === 'manual' ? manualData.power : '400'}W
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">PPF</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {importType === 'manual' ? manualData.ppf : '1080'} µmol/s
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Efficacy</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {importType === 'manual' ? manualData.ppe : '2.7'} µmol/J
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {importType.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('configure')}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Back
              </button>
              <button
                onClick={convertToFixture}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Import Fixture
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Fixture Import Wizard
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Import fixtures from IES, DLC, or manual entry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {renderStepContent()}
        </div>

        {/* Step indicators */}
        <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          {['type', 'upload', 'configure', 'preview'].map((step, index) => (
            <React.Fragment key={step}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  currentStep === step
                    ? 'bg-purple-600 text-white'
                    : index < ['type', 'upload', 'configure', 'preview'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {index < ['type', 'upload', 'configure', 'preview'].indexOf(currentStep) ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 3 && (
                <div
                  className={`w-16 h-0.5 transition-all ${
                    index < ['type', 'upload', 'configure', 'preview'].indexOf(currentStep)
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}