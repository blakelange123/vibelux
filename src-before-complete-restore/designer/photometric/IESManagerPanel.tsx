'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Eye,
  Download,
  Settings,
  Zap,
  BarChart3,
  Info,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Trash2
} from 'lucide-react';
import { IESParser, type IESData } from './IESParser';

interface IESFile {
  id: string;
  name: string;
  size: number;
  uploadDate: Date;
  manufacturer?: string;
  catalogNumber?: string;
  lumens?: number;
  watts?: number;
  efficacy?: number;
  data?: IESData;
  status: 'processing' | 'ready' | 'error';
  error?: string;
}

export function IESManagerPanel() {
  const [iesFiles, setIESFiles] = useState<IESFile[]>([
    {
      id: '1',
      name: 'QB288_Professional.ies',
      size: 45620,
      uploadDate: new Date('2024-01-15'),
      manufacturer: 'HorticulturalLightingGroup',
      catalogNumber: 'QB288',
      lumens: 32400,
      watts: 135,
      efficacy: 240,
      status: 'ready'
    },
    {
      id: '2', 
      name: 'SF2000_SpiderFarmer.ies',
      size: 52100,
      uploadDate: new Date('2024-01-14'),
      manufacturer: 'Spider Farmer',
      catalogNumber: 'SF-2000',
      lumens: 52400,
      watts: 200,
      efficacy: 262,
      status: 'ready'
    }
  ]);
  
  const [selectedFile, setSelectedFile] = useState<IESFile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterManufacturer, setFilterManufacturer] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (!file.name.toLowerCase().endsWith('.ies')) {
        alert('Please upload IES files only');
        continue;
      }

      const newFile: IESFile = {
        id: Date.now().toString() + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        uploadDate: new Date(),
        status: 'processing'
      };

      setIESFiles(prev => [...prev, newFile]);

      try {
        const fileContent = await file.text();
        const iesData = IESParser.parseIES(fileContent);
        
        setIESFiles(prev => prev.map(f => 
          f.id === newFile.id 
            ? {
                ...f,
                data: iesData,
                manufacturer: iesData.header.manufacturer,
                catalogNumber: iesData.header.catalogNumber,
                lumens: iesData.photometry.totalLumens,
                watts: iesData.photometry.inputWatts,
                efficacy: iesData.photometry.efficacy,
                status: 'ready'
              }
            : f
        ));
      } catch (error) {
        setIESFiles(prev => prev.map(f => 
          f.id === newFile.id 
            ? {
                ...f,
                status: 'error',
                error: error instanceof Error ? error.message : 'Failed to parse IES file'
              }
            : f
        ));
      }
    }
  };

  const deleteFile = (fileId: string) => {
    setIESFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  const exportIESData = (file: IESFile) => {
    if (!file.data) return;
    
    const exportData = {
      filename: file.name,
      header: file.data.header,
      photometry: file.data.photometry,
      calculations: file.data.coefficients,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace('.ies', '')}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredFiles = iesFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.catalogNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesManufacturer = filterManufacturer === 'All' || file.manufacturer === filterManufacturer;
    return matchesSearch && matchesManufacturer;
  });

  const manufacturers = Array.from(new Set(iesFiles.map(f => f.manufacturer).filter(Boolean)));

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              IES Photometric Manager
            </h2>
            <p className="text-gray-400 mt-1">Import and manage professional photometric data</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload IES Files
            </button>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="mt-4 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files, manufacturers, catalog numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          <select
            value={filterManufacturer}
            onChange={(e) => setFilterManufacturer(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="All">All Manufacturers</option>
            {manufacturers.map(manufacturer => (
              <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* File List */}
        <div className="w-96 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">IES Files ({filteredFiles.length})</h3>
              <div className="flex gap-1">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded ${viewMode === 'list' ? 'bg-purple-600' : 'hover:bg-gray-700'}`}
                >
                  <Filter className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredFiles.map(file => (
              <div 
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedFile?.id === file.id 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="font-medium text-white text-sm truncate">{file.name}</span>
                    </div>
                    
                    {file.manufacturer && (
                      <div className="text-xs text-gray-400 mt-1">{file.manufacturer}</div>
                    )}
                    
                    {file.catalogNumber && (
                      <div className="text-xs text-gray-500">{file.catalogNumber}</div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{file.uploadDate.toLocaleDateString()}</span>
                    </div>
                    
                    {file.lumens && file.watts && (
                      <div className="flex gap-3 text-xs text-gray-400 mt-2">
                        <span>{file.lumens.toLocaleString()} lm</span>
                        <span>{file.watts}W</span>
                        <span>{file.efficacy?.toFixed(1)} lm/W</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    {file.status === 'ready' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {file.status === 'processing' && <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />}
                    {file.status === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFile(file.id);
                      }}
                      className="p-1 hover:bg-red-600/20 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
                
                {file.status === 'error' && file.error && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                    {file.error}
                  </div>
                )}
              </div>
            ))}
            
            {filteredFiles.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No IES files found</p>
                <p className="text-gray-500 text-xs mt-1">Upload IES files to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* File Details */}
        <div className="flex-1 flex flex-col">
          {selectedFile ? (
            <>
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">{selectedFile.name}</h3>
                    <p className="text-sm text-gray-400">
                      {selectedFile.manufacturer} • {selectedFile.catalogNumber}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button 
                      onClick={() => exportIESData(selectedFile)}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {selectedFile.data ? (
                  <>
                    {/* Basic Information */}
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-white mb-3">Basic Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-400">Total Lumens</div>
                          <div className="text-xl font-semibold text-white">
                            {selectedFile.data.photometry.totalLumens.toLocaleString()} lm
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Input Watts</div>
                          <div className="text-xl font-semibold text-white">
                            {selectedFile.data.photometry.inputWatts} W
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Efficacy</div>
                          <div className="text-xl font-semibold text-white">
                            {selectedFile.data.photometry.efficacy.toFixed(1)} lm/W
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Max Candela</div>
                          <div className="text-xl font-semibold text-white">
                            {selectedFile.data.photometry.maxCandela.toLocaleString()} cd
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Distribution Characteristics */}
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-white mb-3">Distribution Characteristics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-400">Beam Angle (50%)</div>
                          <div className="text-lg font-semibold text-white">
                            {selectedFile.data.photometry.beamAngle.toFixed(1)}°
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Field Angle (10%)</div>
                          <div className="text-lg font-semibold text-white">
                            {selectedFile.data.photometry.fieldAngle.toFixed(1)}°
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Downward Light</div>
                          <div className="text-lg font-semibold text-white">
                            {(selectedFile.data.photometry.downwardLightRatio * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Upward Light</div>
                          <div className="text-lg font-semibold text-white">
                            {(selectedFile.data.photometry.upwardLightRatio * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Luminaire Dimensions */}
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-white mb-3">Luminaire Dimensions</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-400">Width</div>
                          <div className="text-lg font-semibold text-white">
                            {selectedFile.data.photometry.luminaireWidth} {selectedFile.data.photometry.unitsType === 1 ? 'ft' : 'm'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Length</div>
                          <div className="text-lg font-semibold text-white">
                            {selectedFile.data.photometry.luminaireLength} {selectedFile.data.photometry.unitsType === 1 ? 'ft' : 'm'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Height</div>
                          <div className="text-lg font-semibold text-white">
                            {selectedFile.data.photometry.luminaireHeight} {selectedFile.data.photometry.unitsType === 1 ? 'ft' : 'm'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Angular Data Summary */}
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-white mb-3">Photometric Data</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400">Vertical Angles</div>
                          <div className="text-white">
                            {selectedFile.data.photometry.numberVerticalAngles} points 
                            ({selectedFile.data.photometry.verticalAngles[0]}° to {selectedFile.data.photometry.verticalAngles[selectedFile.data.photometry.verticalAngles.length - 1]}°)
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">Horizontal Angles</div>
                          <div className="text-white">
                            {selectedFile.data.photometry.numberHorizontalAngles} points
                            ({selectedFile.data.photometry.horizontalAngles[0]}° to {selectedFile.data.photometry.horizontalAngles[selectedFile.data.photometry.horizontalAngles.length - 1]}°)
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">Photometric Type</div>
                          <div className="text-white">
                            Type {selectedFile.data.photometry.photometricType === 1 ? 'C' : selectedFile.data.photometry.photometricType === 2 ? 'B' : 'A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">Ballast Factor</div>
                          <div className="text-white">
                            {selectedFile.data.photometry.ballastFactor.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      {selectedFile.status === 'processing' && (
                        <>
                          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                          <p className="text-white">Processing IES file...</p>
                        </>
                      )}
                      {selectedFile.status === 'error' && (
                        <>
                          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                          <p className="text-white mb-2">Failed to parse IES file</p>
                          <p className="text-gray-400 text-sm">{selectedFile.error}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Zap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No IES File Selected</h3>
                <p className="text-gray-400">Select an IES file from the list to view detailed photometric data</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".ies"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}