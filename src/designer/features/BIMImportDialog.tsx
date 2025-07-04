'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { bimImporter, BIMImportResult } from '../utils/bimImporter';

interface BIMImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BIMImportDialog({ isOpen, onClose }: BIMImportDialogProps) {
  const { setRoom, addObject, clearObjects } = useDesigner();
  const { showNotification } = useNotifications();
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<BIMImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleFile = useCallback(async (file: File) => {
    setIsImporting(true);
    setError(null);
    
    try {
      const result = await bimImporter.importFromFile(file);
      setImportResult(result);
      showNotification('success', `Successfully parsed ${file.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import file');
      showNotification('error', 'Failed to import BIM file');
    } finally {
      setIsImporting(false);
    }
  }, [showNotification]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const applyImport = useCallback(() => {
    if (!importResult) return;

    // Clear existing objects
    clearObjects();

    // Apply room dimensions
    if (importResult.room) {
      setRoom(importResult.room);
    }

    // Add walls
    importResult.walls.forEach(wall => {
      addObject(wall);
    });

    // Add fixtures
    importResult.fixtures.forEach(fixture => {
      addObject(fixture);
    });

    showNotification('success', 'BIM data imported successfully');
    onClose();
  }, [importResult, clearObjects, setRoom, addObject, showNotification, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        // Close if clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Import BIM/IFC File</h2>
              <p className="text-gray-400 mt-1">Import room geometry and fixtures from BIM files</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!importResult && !error && (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {isImporting ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                  <p className="text-white font-medium">Importing file...</p>
                  <p className="text-gray-400 text-sm mt-1">This may take a moment</p>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-white font-medium mb-2">
                    Drop your BIM file here or click to browse
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    Supports IFC, gbXML, and JSON formats
                  </p>
                  <input
                    type="file"
                    accept=".ifc,.xml,.json"
                    onChange={handleFileInput}
                    className="hidden"
                    id="bim-file-input"
                  />
                  <label
                    htmlFor="bim-file-input"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium cursor-pointer transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Choose File
                  </label>
                </>
              )}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 font-medium">Import Failed</p>
                  <p className="text-red-400 text-sm mt-1">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      setImportResult(null);
                    }}
                    className="mt-3 text-sm text-red-400 hover:text-red-300 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success state */}
          {importResult && (
            <div className="space-y-4">
              <div className="bg-green-900/20 border border-green-500/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-300 font-medium">Import Successful</p>
                    <p className="text-green-400 text-sm mt-1">
                      File parsed successfully. Review the imported data below.
                    </p>
                  </div>
                </div>
              </div>

              {/* Import summary */}
              <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                <h3 className="text-white font-medium mb-3">Import Summary</h3>
                
                {importResult.metadata.projectName && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Project Name</span>
                    <span className="text-white">{importResult.metadata.projectName}</span>
                  </div>
                )}

                {importResult.room && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Room Dimensions</span>
                    <span className="text-white">
                      {importResult.room.width?.toFixed(1)} × {importResult.room.length?.toFixed(1)} × {importResult.room.height?.toFixed(1)} ft
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-400">Walls</span>
                  <span className="text-white">{importResult.walls.length}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-400">Fixtures</span>
                  <span className="text-white">{importResult.fixtures.length}</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Total Objects</span>
                  <span className="text-white font-medium">{importResult.objects.length}</span>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-yellow-300 font-medium">Important</p>
                    <p className="text-yellow-400 mt-1">
                      This will replace your current design. Make sure to save your work before proceeding.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            {importResult && (
              <button
                onClick={applyImport}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
              >
                Apply Import
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}