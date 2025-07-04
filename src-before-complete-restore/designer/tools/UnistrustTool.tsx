'use client';

import React, { useState, useMemo } from 'react';
import { X, Plus, Settings, Calculator, FileText, AlertTriangle } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  calculateUnistrut, 
  generateInstallationNotes,
  unistrustSizes,
  hangerTypes,
  type UnistrustRun,
  type UnistrustHanger
} from '@/lib/unistrut-systems';

interface UnistrustToolProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function UnistrustTool({ isOpen = true, onClose }: UnistrustToolProps) {
  const { state, addObject } = useDesigner();
  const { showNotification } = useNotifications();
  const [targetHeight, setTargetHeight] = useState(10);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showInstallNotes, setShowInstallNotes] = useState(false);

  // Get all fixtures from the current design
  const fixtures = useMemo(() => {
    return state.objects
      .filter(obj => obj.type === 'fixture')
      .map(fixture => ({
        x: fixture.x,
        y: fixture.y,
        weight: fixture.model?.weight || 50, // Default 50 lbs
        id: fixture.id
      }));
  }, [state.objects]);

  // Calculate unistrut system
  const unistrut = useMemo(() => {
    if (!state.room || fixtures.length === 0) {
      return { runs: [], hangers: [], totalLength: 0, estimatedCost: 0 };
    }
    
    return calculateUnistrut(
      fixtures,
      state.room.width,
      state.room.length,
      targetHeight
    );
  }, [fixtures, state.room, targetHeight]);

  const installationNotes = useMemo(() => {
    return generateInstallationNotes(unistrut.runs, unistrut.hangers);
  }, [unistrut.runs, unistrut.hangers]);

  const handleAddUnistrut = () => {
    
    if (!state.room) {
      showNotification('error', 'Please create a room first');
      return;
    }

    if (fixtures.length === 0) {
      showNotification('error', 'Add fixtures before generating unistrut system');
      return;
    }

    // Add unistrut runs as objects
    unistrut.runs.forEach(run => {
      const runObject = {
        type: 'unistrut' as const,
        subType: 'run',
        x: (run.startX + run.endX) / 2,
        y: (run.startY + run.endY) / 2,
        z: run.height,
        width: Math.sqrt((run.endX - run.startX) ** 2 + (run.endY - run.startY) ** 2),
        length: unistrustSizes[run.size].height / 12, // Height of the beam profile
        height: 0.135, // Thickness of the beam
        rotation: Math.atan2(run.endY - run.startY, run.endX - run.startX) * 180 / Math.PI,
        unistrut: {
          size: run.size,
          maxLoad: run.maxLoad,
          runData: run
        }
      };
      addObject(runObject);
    });

    // Add hangers as objects
    unistrut.hangers.forEach(hanger => {
      const run = unistrut.runs.find(r => r.id === hanger.runId);
      if (!run) return;

      const hangerX = run.startX + (run.endX - run.startX) * hanger.position;
      const hangerY = run.startY + (run.endY - run.startY) * hanger.position;

      const hangerObject = {
        type: 'unistrut' as const,
        subType: 'hanger',
        x: hangerX,
        y: hangerY,
        z: run.height,
        width: 0.25,
        length: 0.25,
        height: hanger.dropHeight,
        rotation: 0,
        unistrut: {
          hangerType: hanger.hangerType,
          fixtureId: hanger.fixtureId,
          hangerData: hanger
        }
      };
      addObject(hangerObject);
    });

    showNotification('success', `Added ${unistrut.runs.length} unistrut runs and ${unistrut.hangers.length} hangers`);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <h2 className="text-lg font-semibold text-white">Unistrut System</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <p className="text-sm text-gray-400">
          Generate hanging system for your fixtures
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Configuration */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-white font-medium mb-3">Configuration</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Mounting Height (ft)
              </label>
              <input
                type="number"
                value={targetHeight}
                onChange={(e) => setTargetHeight(Number(e.target.value))}
                min={8}
                max={20}
                step={0.5}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
          </div>
        </div>

        {/* System Summary */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-white font-medium mb-3">System Summary</h3>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Fixtures:</span>
              <span className="text-white ml-2">{fixtures.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Runs:</span>
              <span className="text-white ml-2">{unistrut.runs.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Length:</span>
              <span className="text-white ml-2">{unistrut.totalLength.toFixed(1)} ft</span>
            </div>
            <div>
              <span className="text-gray-400">Est. Cost:</span>
              <span className="text-white ml-2">${unistrut.estimatedCost.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Run Details */}
        {unistrut.runs.length > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Unistrut Runs</h3>
            
            <div className="space-y-2">
              {unistrut.runs.map((run, index) => {
                const runLength = Math.sqrt((run.endX - run.startX) ** 2 + (run.endY - run.startY) ** 2);
                return (
                  <div key={run.id} className="bg-gray-700/50 rounded p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white font-medium">Run {index + 1}</span>
                      <span className="text-xs text-gray-400">{run.size}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                      <div>Length: {runLength.toFixed(1)} ft</div>
                      <div>Height: {run.height} ft</div>
                      <div>Fixtures: {run.fixtures.length}</div>
                      <div>Load: {run.maxLoad} lbs</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Warnings */}
        {fixtures.length === 0 && (
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-yellow-300 font-medium">No fixtures found</p>
                <p className="text-yellow-400/80 text-sm mt-1">
                  Add fixtures to your design before generating unistrut system
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Installation Notes */}
        {showInstallNotes && installationNotes.length > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Installation Notes</h3>
            <div className="space-y-1 text-xs text-gray-300 font-mono">
              {installationNotes.map((note, index) => (
                <div key={index} className={note === '' ? 'h-2' : ''}>
                  {note}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <button
          onClick={() => setShowInstallNotes(!showInstallNotes)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
        >
          <FileText className="w-4 h-4" />
          {showInstallNotes ? 'Hide' : 'Show'} Installation Notes
        </button>
        
        <button
          onClick={handleAddUnistrut}
          disabled={fixtures.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Unistrut System
        </button>
      </div>
    </div>
  );
}