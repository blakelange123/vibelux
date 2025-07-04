'use client';

import React, { useState, useEffect } from 'react';
import { 
  Grid3x3, 
  Move, 
  RotateCw, 
  Trash2, 
  Plus, 
  Minus,
  Save,
  X,
  Maximize2,
  Minimize2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import type { RoomObject } from '../context/types';

interface ArrayAdjustmentToolProps {
  arrayGroup: string;
  fixtures: RoomObject[];
  onClose: () => void;
  onUpdate: (fixtures: RoomObject[]) => void;
}

export function ArrayAdjustmentTool({ arrayGroup, fixtures, onClose, onUpdate }: ArrayAdjustmentToolProps) {
  const { updateObject, deleteObject } = useDesigner();
  const { showNotification } = useNotifications();
  
  // Calculate array dimensions
  const getArrayDimensions = () => {
    const xPositions = [...new Set(fixtures.map(f => Math.round(f.x)))];
    const yPositions = [...new Set(fixtures.map(f => Math.round(f.y)))];
    return {
      rows: yPositions.length,
      columns: xPositions.length,
      spacing: {
        x: xPositions.length > 1 ? xPositions[1] - xPositions[0] : 4,
        y: yPositions.length > 1 ? yPositions[1] - yPositions[0] : 4
      }
    };
  };

  const [dimensions, setDimensions] = useState(getArrayDimensions());

  // Expand array by adding fixtures
  const expandArray = (direction: 'top' | 'bottom' | 'left' | 'right') => {
    const newFixtures = [...fixtures];
    const bounds = {
      minX: Math.min(...fixtures.map(f => f.x)),
      maxX: Math.max(...fixtures.map(f => f.x)),
      minY: Math.min(...fixtures.map(f => f.y)),
      maxY: Math.max(...fixtures.map(f => f.y))
    };

    if (direction === 'right') {
      // Add column to the right
      const rightmostFixtures = fixtures.filter(f => f.x === bounds.maxX);
      rightmostFixtures.forEach(fixture => {
        const newFixture = {
          ...fixture,
          id: `${fixture.id}-expand-${Date.now()}`,
          x: fixture.x + dimensions.spacing.x,
          group: arrayGroup
        };
        newFixtures.push(newFixture);
      });
    } else if (direction === 'left') {
      // Add column to the left
      const leftmostFixtures = fixtures.filter(f => f.x === bounds.minX);
      leftmostFixtures.forEach(fixture => {
        const newFixture = {
          ...fixture,
          id: `${fixture.id}-expand-${Date.now()}`,
          x: fixture.x - dimensions.spacing.x,
          group: arrayGroup
        };
        newFixtures.push(newFixture);
      });
    } else if (direction === 'bottom') {
      // Add row to the bottom
      const bottomFixtures = fixtures.filter(f => f.y === bounds.maxY);
      bottomFixtures.forEach(fixture => {
        const newFixture = {
          ...fixture,
          id: `${fixture.id}-expand-${Date.now()}`,
          y: fixture.y + dimensions.spacing.y,
          group: arrayGroup
        };
        newFixtures.push(newFixture);
      });
    } else if (direction === 'top') {
      // Add row to the top
      const topFixtures = fixtures.filter(f => f.y === bounds.minY);
      topFixtures.forEach(fixture => {
        const newFixture = {
          ...fixture,
          id: `${fixture.id}-expand-${Date.now()}`,
          y: fixture.y - dimensions.spacing.y,
          group: arrayGroup
        };
        newFixtures.push(newFixture);
      });
    }

    onUpdate(newFixtures);
    showNotification('success', `Expanded array ${direction}`);
  };

  // Contract array by removing fixtures
  const contractArray = (direction: 'top' | 'bottom' | 'left' | 'right') => {
    const bounds = {
      minX: Math.min(...fixtures.map(f => f.x)),
      maxX: Math.max(...fixtures.map(f => f.x)),
      minY: Math.min(...fixtures.map(f => f.y)),
      maxY: Math.max(...fixtures.map(f => f.y))
    };

    let fixturesToRemove: RoomObject[] = [];

    if (direction === 'right') {
      fixturesToRemove = fixtures.filter(f => f.x === bounds.maxX);
    } else if (direction === 'left') {
      fixturesToRemove = fixtures.filter(f => f.x === bounds.minX);
    } else if (direction === 'bottom') {
      fixturesToRemove = fixtures.filter(f => f.y === bounds.maxY);
    } else if (direction === 'top') {
      fixturesToRemove = fixtures.filter(f => f.y === bounds.minY);
    }

    if (fixturesToRemove.length === fixtures.length) {
      showNotification('warning', 'Cannot remove all fixtures from array');
      return;
    }

    fixturesToRemove.forEach(fixture => {
      deleteObject(fixture.id);
    });

    const remainingFixtures = fixtures.filter(f => !fixturesToRemove.includes(f));
    onUpdate(remainingFixtures);
    showNotification('success', `Contracted array ${direction}`);
  };

  // Update spacing
  const updateSpacing = (axis: 'x' | 'y', delta: number) => {
    const newSpacing = {
      ...dimensions.spacing,
      [axis]: Math.max(1, dimensions.spacing[axis] + delta)
    };

    // Recalculate positions with new spacing
    const sortedByX = [...fixtures].sort((a, b) => a.x - b.x);
    const sortedByY = [...fixtures].sort((a, b) => a.y - b.y);
    
    const baseX = sortedByX[0].x;
    const baseY = sortedByY[0].y;

    fixtures.forEach(fixture => {
      const colIndex = sortedByX.findIndex(f => f.id === fixture.id) % dimensions.columns;
      const rowIndex = Math.floor(sortedByY.findIndex(f => f.id === fixture.id) / dimensions.columns);

      updateObject(fixture.id, {
        x: baseX + colIndex * newSpacing.x,
        y: baseY + rowIndex * newSpacing.y
      });
    });

    setDimensions({
      ...dimensions,
      spacing: newSpacing
    });
    showNotification('success', 'Updated array spacing');
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-4 z-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Grid3x3 className="w-5 h-5 text-purple-500" />
          <h3 className="text-sm font-semibold text-white">Adjust Array</h3>
          <span className="text-xs text-gray-400">
            {dimensions.rows}x{dimensions.columns} ({fixtures.length} fixtures)
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Expand/Contract Controls */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-400">Expand Array</h4>
          <div className="grid grid-cols-3 gap-1">
            <div></div>
            <button
              onClick={() => expandArray('top')}
              className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded transition-colors"
              title="Add row above"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <div></div>
            
            <button
              onClick={() => expandArray('left')}
              className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded transition-colors"
              title="Add column left"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="p-2 bg-gray-800 rounded flex items-center justify-center">
              <Plus className="w-4 h-4 text-gray-500" />
            </div>
            <button
              onClick={() => expandArray('right')}
              className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded transition-colors"
              title="Add column right"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <div></div>
            <button
              onClick={() => expandArray('bottom')}
              className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded transition-colors"
              title="Add row below"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <div></div>
          </div>
        </div>

        {/* Contract Controls */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-400">Contract Array</h4>
          <div className="grid grid-cols-3 gap-1">
            <div></div>
            <button
              onClick={() => contractArray('top')}
              className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
              title="Remove top row"
              disabled={dimensions.rows <= 1}
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <div></div>
            
            <button
              onClick={() => contractArray('left')}
              className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
              title="Remove left column"
              disabled={dimensions.columns <= 1}
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="p-2 bg-gray-800 rounded flex items-center justify-center">
              <Minus className="w-4 h-4 text-gray-500" />
            </div>
            <button
              onClick={() => contractArray('right')}
              className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
              title="Remove right column"
              disabled={dimensions.columns <= 1}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            <div></div>
            <button
              onClick={() => contractArray('bottom')}
              className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
              title="Remove bottom row"
              disabled={dimensions.rows <= 1}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <div></div>
          </div>
        </div>

        {/* Spacing Controls */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-400">Spacing</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-12">X:</span>
              <button
                onClick={() => updateSpacing('x', -0.5)}
                className="p-1 bg-gray-800 hover:bg-gray-700 rounded"
              >
                <Minus className="w-3 h-3 text-gray-400" />
              </button>
              <span className="text-sm text-white w-12 text-center">
                {dimensions.spacing.x.toFixed(1)}ft
              </span>
              <button
                onClick={() => updateSpacing('x', 0.5)}
                className="p-1 bg-gray-800 hover:bg-gray-700 rounded"
              >
                <Plus className="w-3 h-3 text-gray-400" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-12">Y:</span>
              <button
                onClick={() => updateSpacing('y', -0.5)}
                className="p-1 bg-gray-800 hover:bg-gray-700 rounded"
              >
                <Minus className="w-3 h-3 text-gray-400" />
              </button>
              <span className="text-sm text-white w-12 text-center">
                {dimensions.spacing.y.toFixed(1)}ft
              </span>
              <button
                onClick={() => updateSpacing('y', 0.5)}
                className="p-1 bg-gray-800 hover:bg-gray-700 rounded"
              >
                <Plus className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}