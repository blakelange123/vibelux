'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useDesigner } from '../context/DesignerContext';
import { useCanvas2D } from '../hooks/useCanvas2D';
import { useNotifications } from '../context/NotificationContext';

export function Canvas2D() {
  // ALL HOOKS MUST BE DECLARED AT THE TOP LEVEL BEFORE ANY CONDITIONAL RETURNS
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { state, setRoom, addObject, dispatch } = useDesigner();
  const { room, objects, ui } = state;
  const { showNotification } = useNotifications();
  
  // Room creation state
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  
  // Log when room state changes
  useEffect(() => {
    if (room) {
    }
  }, [room]);
  const [roomDimensions, setRoomDimensions] = useState({
    width: 12,
    length: 12,
    height: 10
  });
  
  // All other state
  const [isMounted, setIsMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  // Use custom hook for canvas operations
  const { redraw } = useCanvas2D(canvasRef, containerRef);
  
  // Note: Redraw is now handled inside useCanvas2D hook
  
  // Mount effect
  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Handle canvas click for placing fixtures - MUST BE BEFORE CONDITIONAL RETURNS
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    
    if (!room || !canvasRef.current) return;
    
    // Only handle clicks when in place mode
    if (ui.selectedTool !== 'place') {
      return;
    }
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = room.width / rect.width;
    const scaleY = room.length / rect.height;
    
    // Convert click coordinates to room coordinates
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    // Get the selected fixture from UI state
    const selectedFixture = ui.selectedFixtureModel;
    if (!selectedFixture) {
      showNotification('error', 'Please select a fixture first');
      return;
    }
    
    // Create fixture object with proper DLC dimensions
    let fixtureWidth = 2;   // default width in feet
    let fixtureLength = 4;  // default length in feet  
    let fixtureHeight = 0.5; // default height in feet
    
    // Use DLC database dimensions if available (convert inches to feet)
    if (selectedFixture.dlcData) {
      const dlcWidth = selectedFixture.dlcData.width;
      const dlcLength = selectedFixture.dlcData.length;
      const dlcHeight = selectedFixture.dlcData.height;
      
      fixtureWidth = dlcWidth ? dlcWidth / 12 : 2;
      fixtureLength = dlcLength ? dlcLength / 12 : 4;
      fixtureHeight = dlcHeight ? dlcHeight / 12 : 0.5;
    } else {
      // Default fixture dimensions
      fixtureWidth = 2;
      fixtureLength = 4;
      fixtureHeight = 0.5;
    }
    
    const fixture = {
      type: 'fixture' as const,
      x: x,
      y: y,
      z: room.height - 3, // 3 ft below ceiling
      rotation: 0,
      width: fixtureWidth,
      length: fixtureLength,
      height: fixtureHeight,
      enabled: true,
      model: {
        ...selectedFixture,
        // Store DLC dimensions for 3D rendering
        dimensions: {
          width: fixtureWidth,
          length: fixtureLength,
          height: fixtureHeight
        }
      },
      dimmingLevel: 100
    };
    
    
    // Add the fixture
    addObject(fixture);
    
    // Show success notification
    showNotification('success', `Placed ${selectedFixture.brand} ${selectedFixture.model}`);
    
    // Return to select mode after placing
    dispatch({ type: 'SET_TOOL', payload: 'select' });
  }, [room, ui.selectedTool, ui.selectedFixtureModel, addObject, showNotification, dispatch]);

  // Canvas resize effect
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      
      if (canvas && container) {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        setTimeout(() => redraw(), 0);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redraw]);
  
  // NOW CONDITIONAL RETURN IS SAFE
  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Create Your Room</h2>
            <p className="text-gray-400">Start by defining the dimensions of your growing space</p>
            <button 
              onClick={() => alert('Test button works!')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Test Button
            </button>
          </div>
          
          {!showCreateRoom ? (
            <button
              onClick={() => setShowCreateRoom(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
            >
              + Create Room
            </button>
          ) : (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Room Dimensions</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Width (ft)</label>
                  <input
                    type="number"
                    value={roomDimensions.width}
                    onChange={(e) => setRoomDimensions(prev => ({ ...prev, width: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    min="1"
                    max="200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Length (ft)</label>
                  <input
                    type="number"
                    value={roomDimensions.length}
                    onChange={(e) => setRoomDimensions(prev => ({ ...prev, length: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    min="1"
                    max="200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Height (ft)</label>
                  <input
                    type="number"
                    value={roomDimensions.height}
                    onChange={(e) => setRoomDimensions(prev => ({ ...prev, height: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    min="6"
                    max="50"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const newRoom = {
                      width: roomDimensions.width,
                      length: roomDimensions.length,
                      height: roomDimensions.height,
                      ceilingHeight: roomDimensions.height,
                      workingHeight: 3,
                      reflectances: {
                        ceiling: 0.8,
                        walls: 0.5,
                        floor: 0.2
                      },
                      roomType: 'cultivation',
                      windows: []
                    };
                    
                    setRoom(newRoom);
                    showNotification('success', `Created ${newRoom.width} × ${newRoom.length} × ${newRoom.height} ft room`);
                    setShowCreateRoom(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium transition-colors"
                  type="button"
                >
                  Create Room
                </button>
                <button
                  onClick={() => setShowCreateRoom(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main canvas when room exists
  return (
    <div className="relative flex-1 overflow-hidden" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        onClick={handleCanvasClick}
        style={{
          cursor: ui.selectedTool === 'place' ? 'crosshair' : 'default',
          backgroundColor: '#374151',
          border: ui.selectedTool === 'place' ? '2px solid purple' : 'none'
        }}
      />
      
      {/* Room Dimensions */}
      {room && (
        <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur px-3 py-1 rounded-lg text-xs text-gray-400">
          {room.width} × {room.length} ft
        </div>
      )}
      
      {/* Debug Info */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur p-2 rounded-lg text-xs text-gray-300 font-mono">
        <div>Tool: {ui.selectedTool}</div>
        <div>Fixture: {ui.selectedFixtureModel ? `${ui.selectedFixtureModel.brand} ${ui.selectedFixtureModel.model}` : 'None'}</div>
        <div>Objects: {objects.length}</div>
      </div>
    </div>
  );
}