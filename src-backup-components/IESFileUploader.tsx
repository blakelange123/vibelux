'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Eye } from 'lucide-react';
import { IESParser, type IESPhotometricData } from '@/lib/ies-parser-advanced';

interface IESFileUploaderProps {
  onIESDataLoaded?: (data: IESPhotometricData, fileName: string) => void;
  onClose?: () => void;
  fixtureId?: string;
  fixtureName?: string;
}

export function IESFileUploader({ 
  onIESDataLoaded, 
  onClose,
  fixtureId,
  fixtureName
}: IESFileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [iesData, setIesData] = useState<IESPhotometricData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.ies')) {
      setErrorMessage('Please upload a valid IES file (.ies extension)');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('processing');
    setErrorMessage('');
    setFileName(file.name);

    try {
      const content = await file.text();
      const parsedData = IESParser.parse(content);
      
      setIesData(parsedData);
      setUploadStatus('success');
      
      // Auto-show preview on successful parse
      setShowPreview(true);
      
      // Notify parent component
      if (onIESDataLoaded) {
        onIESDataLoaded(parsedData, file.name);
      }
    } catch (error) {
      console.error('Error parsing IES file:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to parse IES file');
      setUploadStatus('error');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const renderPreview = () => {
    if (!iesData) return null;

    return (
      <div className="mt-4 bg-gray-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          IES File Preview
        </h4>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="text-gray-400 font-medium mb-2">File Information</h5>
            <div className="space-y-1">
              <div><span className="text-gray-500">Manufacturer:</span> <span className="text-gray-300">{iesData.header.manufacturer || 'Unknown'}</span></div>
              <div><span className="text-gray-500">Luminaire:</span> <span className="text-gray-300">{iesData.header.luminaire || 'Unknown'}</span></div>
              <div><span className="text-gray-500">Lamp:</span> <span className="text-gray-300">{iesData.header.lamp || 'Unknown'}</span></div>
              <div><span className="text-gray-500">Test Date:</span> <span className="text-gray-300">{iesData.header.issueDate || 'Unknown'}</span></div>
            </div>
          </div>
          
          <div>
            <h5 className="text-gray-400 font-medium mb-2">Photometric Data</h5>
            <div className="space-y-1">
              <div><span className="text-gray-500">Total Lumens:</span> <span className="text-gray-300">{iesData.calculated?.totalLumens.toFixed(0) || 'N/A'}</span></div>
              <div><span className="text-gray-500">Max Candela:</span> <span className="text-gray-300">{iesData.calculated?.maxCandela.toFixed(0) || 'N/A'} cd</span></div>
              <div><span className="text-gray-500">Beam Angle:</span> <span className="text-gray-300">{iesData.calculated?.beamAngle.toFixed(1) || 'N/A'}°</span></div>
              <div><span className="text-gray-500">Field Angle:</span> <span className="text-gray-300">{iesData.calculated?.fieldAngle.toFixed(1) || 'N/A'}°</span></div>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            <div>Vertical Angles: {iesData.photometry.numberOfVerticalAngles} points</div>
            <div>Horizontal Angles: {iesData.photometry.numberOfHorizontalAngles} points</div>
            <div>Total Measurements: {iesData.photometry.numberOfVerticalAngles * iesData.photometry.numberOfHorizontalAngles} points</div>
          </div>
        </div>
        
        {/* Simplified polar distribution preview */}
        <div className="mt-4">
          <h5 className="text-gray-400 font-medium mb-2">Distribution Pattern</h5>
          <div className="bg-gray-900 rounded-lg p-4 h-48 flex items-center justify-center">
            <canvas
              ref={(canvas) => {
                if (canvas && iesData) {
                  drawSimplePolarPreview(canvas, iesData);
                }
              }}
              width={180}
              height={180}
              className="border border-gray-700 rounded"
            />
          </div>
        </div>
      </div>
    );
  };

  const drawSimplePolarPreview = (canvas: HTMLCanvasElement, data: IESPhotometricData) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 10;

    // Clear canvas
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (maxRadius / 4) * i, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw distribution curve (simplified - just show 0° plane)
    const maxCandela = data.calculated?.maxCandela || 1;
    const centerColumn = Math.floor(data.photometry.numberOfHorizontalAngles / 2);
    
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < data.measurements.verticalAngles.length; i++) {
      const angle = data.measurements.verticalAngles[i];
      const candela = data.measurements.candelaValues[i]?.[centerColumn] || 0;
      const normalizedRadius = (candela / maxCandela) * maxRadius;
      
      const x = centerX + normalizedRadius * Math.cos((angle - 90) * Math.PI / 180);
      const y = centerY + normalizedRadius * Math.sin((angle - 90) * Math.PI / 180);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Upload IES File
          </h3>
          {fixtureName && (
            <p className="text-gray-400 text-sm mt-1">
              For: {fixtureName}
            </p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragging 
            ? 'border-purple-500 bg-purple-500/10' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
      >
        <input
          type="file"
          accept=".ies"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="pointer-events-none">
          {uploadStatus === 'idle' && (
            <>
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-300 mb-2">
                Drag and drop your IES file here
              </p>
              <p className="text-gray-500 text-sm">
                or click to browse
              </p>
            </>
          )}
          
          {uploadStatus === 'processing' && (
            <>
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
              <p className="text-gray-300">Processing IES file...</p>
            </>
          )}
          
          {uploadStatus === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p className="text-green-400 mb-2">Successfully parsed IES file!</p>
              <p className="text-gray-300 text-sm">{fileName}</p>
            </>
          )}
          
          {uploadStatus === 'error' && (
            <>
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <p className="text-red-400 mb-2">Error parsing IES file</p>
              <p className="text-gray-300 text-sm">{errorMessage}</p>
            </>
          )}
        </div>
      </div>

      {/* File Requirements */}
      <div className="mt-4 bg-gray-800/50 rounded-lg p-3">
        <h4 className="text-gray-300 text-sm font-medium mb-2">IES File Requirements:</h4>
        <ul className="text-gray-400 text-xs space-y-1">
          <li>• IESNA LM-63 format (.ies extension)</li>
          <li>• Type C photometry preferred for grow lights</li>
          <li>• File size under 10MB</li>
          <li>• Contains valid photometric measurements</li>
        </ul>
      </div>

      {/* Preview Section */}
      {iesData && uploadStatus === 'success' && (
        <>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          
          {showPreview && renderPreview()}
        </>
      )}

      {/* Action Buttons */}
      {uploadStatus === 'success' && iesData && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              if (onIESDataLoaded) {
                onIESDataLoaded(iesData, fileName);
              }
              if (onClose) {
                onClose();
              }
            }}
            className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Use This IES File
          </button>
          <button
            onClick={() => {
              setUploadStatus('idle');
              setIesData(null);
              setFileName('');
              setShowPreview(false);
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
          >
            Upload Different File
          </button>
        </div>
      )}
    </div>
  );
}