'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, AlertCircle, Check, Layers } from 'lucide-react';
import { bimIfcHandler } from '@/lib/bim-ifc-handler';
import type { RoomObject } from '@/components/designer/context/types';

interface BIMImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (objects: RoomObject[]) => void;
}

interface ImportPreview {
  objects: RoomObject[];
  projectInfo: {
    name: string;
    description: string;
    building?: string;
    storey?: string;
    space?: string;
  };
  units: {
    lengthUnit: 'METRE' | 'FOOT';
    areaUnit: 'SQUARE_METRE' | 'SQUARE_FOOT';
    volumeUnit: 'CUBIC_METRE' | 'CUBIC_FOOT';
    angleUnit: 'RADIAN' | 'DEGREE';
  };
}

export function BIMImportDialog({ isOpen, onClose, onImport }: BIMImportDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set());
  const [coordinateOffset, setCoordinateOffset] = useState({ x: 0, y: 0, z: 0 });
  const [importScale, setImportScale] = useState(1);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setPreview(null);

    try {
      const content = await file.text();
      
      if (!content.includes('IFC') && !content.includes('ISO-10303-21')) {
        throw new Error('Invalid IFC file format');
      }

      const result = await bimIfcHandler.parseIFC(content);
      
      if (result.objects.length === 0) {
        throw new Error('No compatible objects found in the IFC file');
      }

      // Pre-select all objects
      setSelectedObjects(new Set(result.objects.map(obj => obj.id)));
      
      // Auto-detect scale if units are different
      if (result.units.lengthUnit === 'FOOT') {
        setImportScale(0.3048); // Convert feet to meters
      }

      setPreview(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse IFC file');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleObjectSelection = (objectId: string) => {
    const newSelection = new Set(selectedObjects);
    if (newSelection.has(objectId)) {
      newSelection.delete(objectId);
    } else {
      newSelection.add(objectId);
    }
    setSelectedObjects(newSelection);
  };

  const handleImport = () => {
    if (!preview) return;

    const objectsToImport = preview.objects
      .filter(obj => selectedObjects.has(obj.id))
      .map(obj => ({
        ...obj,
        x: (obj.x + coordinateOffset.x) * importScale,
        y: (obj.y + coordinateOffset.y) * importScale,
        z: ((obj.z || 0) + coordinateOffset.z) * importScale,
        width: obj.width * importScale,
        length: obj.length * importScale,
        height: obj.height * importScale
      }));

    onImport(objectsToImport);
    onClose();
  };

  const getObjectTypeCounts = () => {
    if (!preview) return {};
    
    const counts: Record<string, number> = {};
    preview.objects.forEach(obj => {
      counts[obj.type] = (counts[obj.type] || 0) + 1;
    });
    return counts;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Import BIM/IFC File
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {!preview ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <label className="border-2 border-dashed border-gray-700 rounded-lg p-8 cursor-pointer hover:border-purple-600 transition-colors">
              <input
                type="file"
                accept=".ifc,.ifcxml"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isLoading}
              />
              <div className="flex flex-col items-center gap-4">
                <Upload className="w-12 h-12 text-gray-500" />
                <div className="text-center">
                  <p className="text-white font-medium">Drop IFC file here or click to browse</p>
                  <p className="text-gray-400 text-sm mt-1">Supports IFC2x3 and IFC4 formats</p>
                </div>
              </div>
            </label>

            {isLoading && (
              <div className="mt-4 text-gray-400">
                <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2">Parsing IFC file...</p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-900 bg-opacity-20 border border-red-600 rounded flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Project Info */}
            <div className="mb-4 p-4 bg-gray-800 rounded">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Project Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="text-white ml-2">{preview.projectInfo.name}</span>
                </div>
                {preview.projectInfo.building && (
                  <div>
                    <span className="text-gray-500">Building:</span>
                    <span className="text-white ml-2">{preview.projectInfo.building}</span>
                  </div>
                )}
                {preview.projectInfo.storey && (
                  <div>
                    <span className="text-gray-500">Storey:</span>
                    <span className="text-white ml-2">{preview.projectInfo.storey}</span>
                  </div>
                )}
                {preview.projectInfo.space && (
                  <div>
                    <span className="text-gray-500">Space:</span>
                    <span className="text-white ml-2">{preview.projectInfo.space}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Object Summary */}
            <div className="mb-4 p-4 bg-gray-800 rounded">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Objects Found</h3>
              <div className="flex gap-4 text-sm">
                {Object.entries(getObjectTypeCounts()).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2">
                    <span className="text-gray-500 capitalize">{type}s:</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Import Options */}
            <div className="mb-4 p-4 bg-gray-800 rounded">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Import Options</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Coordinate Offset</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={coordinateOffset.x}
                      onChange={(e) => setCoordinateOffset({...coordinateOffset, x: Number(e.target.value)})}
                      className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      placeholder="X"
                    />
                    <input
                      type="number"
                      value={coordinateOffset.y}
                      onChange={(e) => setCoordinateOffset({...coordinateOffset, y: Number(e.target.value)})}
                      className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      placeholder="Y"
                    />
                    <input
                      type="number"
                      value={coordinateOffset.z}
                      onChange={(e) => setCoordinateOffset({...coordinateOffset, z: Number(e.target.value)})}
                      className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      placeholder="Z"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Scale Factor</label>
                  <input
                    type="number"
                    value={importScale}
                    onChange={(e) => setImportScale(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    step="0.1"
                    min="0.1"
                  />
                  {preview.units.lengthUnit === 'FOOT' && (
                    <p className="text-xs text-yellow-500 mt-1">Auto-detected feet units, converting to meters</p>
                  )}
                </div>
              </div>
            </div>

            {/* Object List */}
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Select Objects to Import</h3>
              <div className="space-y-1">
                {preview.objects.map((obj) => {
                  const bimProps = bimIfcHandler.getBIMProperties(obj);
                  return (
                    <div
                      key={obj.id}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        selectedObjects.has(obj.id) 
                          ? 'bg-purple-900 bg-opacity-30 border border-purple-600' 
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                      onClick={() => toggleObjectSelection(obj.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border ${
                            selectedObjects.has(obj.id) 
                              ? 'bg-purple-600 border-purple-600' 
                              : 'border-gray-600'
                          } flex items-center justify-center`}>
                            {selectedObjects.has(obj.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-white text-sm">
                            {obj.type === 'fixture' ? (obj as any).model.name : obj.type}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          GUID: {bimProps.guid.substring(0, 8)}...
                        </div>
                      </div>
                      <div className="ml-10 mt-1 text-xs text-gray-400">
                        Position: ({obj.x.toFixed(1)}, {obj.y.toFixed(1)}, {(obj.z || 0).toFixed(1)})m
                        {bimProps.classification && (
                          <span className="ml-2">• {bimProps.classification.name}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                {selectedObjects.size} of {preview.objects.length} objects selected
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={selectedObjects.size === 0}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}