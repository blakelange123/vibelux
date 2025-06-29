'use client';

import React, { useState } from 'react';
import { DesignerProvider, useDesigner } from './context/DesignerContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { SimpleCanvas2D } from './canvas/SimpleCanvas2D';
import { ToolPalette } from './tools/ToolPalette';
import { SimpleFixtureList } from './panels/SimpleFixtureList';
import { CompactCalculationsPanel } from './panels/CompactCalculationsPanel';
import { Layers, Calculator, Lightbulb, Settings, X } from 'lucide-react';

function SimpleDesignerContent() {
  const { state, dispatch, setRoom } = useDesigner();
  const { room, ui } = state;
  const { showNotification } = useNotifications();
  const [activePanel, setActivePanel] = useState<string | null>('fixtures');
  
  // Debug logging
  const [placementMessage, setPlacementMessage] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<string>('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomDimensions, setRoomDimensions] = useState({
    width: 20,
    length: 40,
    height: 10
  });

  // Listen for panel close events
  React.useEffect(() => {
    const handleClosePanels = () => {
      setActivePanel(null);
    };
    
    const handleShowPlacement = (event: CustomEvent) => {
      setPlacementMessage(event.detail.message);
      // Clear message after 5 seconds
      setTimeout(() => setPlacementMessage(null), 5000);
    };
    
    window.addEventListener('closePanels', handleClosePanels);
    window.addEventListener('showPlacementMode', handleShowPlacement as EventListener);
    
    return () => {
      window.removeEventListener('closePanels', handleClosePanels);
      window.removeEventListener('showPlacementMode', handleShowPlacement as EventListener);
    };
  }, []);
  
  // Handle ESC key to cancel placement
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && ui.selectedTool === 'place') {
        dispatch({ type: 'SET_TOOL', payload: 'select' });
        setPlacementMessage(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ui.selectedTool, dispatch]);

  return (
    <div className="h-screen bg-gray-900 text-white flex dark:bg-gray-900 dark:text-white">
      {/* Left Sidebar - Tools */}
      <div className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-2">
          <h3 className="text-xs text-gray-400 text-center mb-2">Tools</h3>
          <ToolPalette />
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4">
          <h1 className="text-lg font-semibold">Room Designer</h1>
          {room && (
            <span className="ml-4 text-sm text-gray-400">
              {room.width} × {room.length} × {room.height} ft
            </span>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          {!room ? (
            <>
              {!showCreateRoom ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Welcome to Room Designer</h2>
                    <p className="text-gray-400 mb-6">Create a room to start designing</p>
                    <button
                      onClick={() => setShowCreateRoom(true)}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
                    >
                      Create Room
                    </button>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-md w-full">
                    <h3 className="text-lg font-semibold mb-4">Room Dimensions</h3>
                    
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium mb-1">Width (ft)</label>
                        <input
                          type="number"
                          value={roomDimensions.width}
                          onChange={(e) => setRoomDimensions(prev => ({ ...prev, width: Number(e.target.value) }))}
                          className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-700 border border-gray-600 dark:border-gray-600 rounded text-white dark:text-white"
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
                          className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-700 border border-gray-600 dark:border-gray-600 rounded text-white dark:text-white"
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
                          className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-700 border border-gray-600 dark:border-gray-600 rounded text-white dark:text-white"
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
                          setShowCreateRoom(false);
                          showNotification('success', `Created ${newRoom.width}×${newRoom.length}×${newRoom.height}ft room`);
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium"
                      >
                        Create Room
                      </button>
                      <button
                        onClick={() => setShowCreateRoom(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <SimpleCanvas2D />
          )}
          
          {/* Placement Instructions */}
          {placementMessage && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg">
              <p className="text-sm font-medium">{placementMessage}</p>
              <p className="text-xs opacity-80 mt-1">Press ESC to cancel</p>
            </div>
          )}
          
          {/* Show placement mode indicator */}
          {ui.selectedTool === 'place' && !placementMessage && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg">
              <p className="text-sm">Click to place fixture • Press ESC to cancel</p>
            </div>
          )}
          
          {/* Test Message Display */}
          {testMessage && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg">
              <p className="text-sm font-medium">{testMessage}</p>
            </div>
          )}
          
          {/* Quick Test Button - Always visible */}
          <button
            onClick={() => {
              alert('Button works! Check console.');
              
              if (!room) {
                return;
              }
              
              const testFixture = {
                type: 'fixture' as const,
                x: 5,
                y: 5,
                z: 7,
                rotation: 0,
                width: 2,
                length: 4,
                height: 0.5,
                enabled: true,
                model: {
                  brand: 'Test',
                  model: 'LED-600W',
                  wattage: 600,
                  ppf: 1620,
                  efficacy: 2.7
                },
                dimmingLevel: 100
              };
              
              dispatch({ type: 'ADD_OBJECT', payload: testFixture });
              
              // Show visible feedback
              setTestMessage(`Added fixture! Objects before: ${state.objects.length}`);
              setTimeout(() => {
                setTestMessage(`Objects after: ${state.objects.length}`);
              }, 100);
              setTimeout(() => setTestMessage(''), 3000);
            }}
            className="absolute bottom-4 left-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg text-sm z-50"
          >
            Test Add Fixture
          </button>
        </div>
      </div>

      {/* Right Sidebar - Panels */}
      {room && activePanel && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Panel Header with Close Button */}
          <div className="flex items-center justify-between border-b border-gray-700 p-2">
            <div className="flex">
              <button
                onClick={() => setActivePanel('fixtures')}
                className={`px-3 py-1 text-sm flex items-center gap-2 rounded ${
                  activePanel === 'fixtures' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Lightbulb size={16} />
                Fixtures
              </button>
              <button
                onClick={() => setActivePanel('calculations')}
                className={`px-3 py-1 text-sm flex items-center gap-2 rounded ${
                  activePanel === 'calculations' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Calculator size={16} />
                Calc
              </button>
            </div>
            <button
              onClick={() => setActivePanel(null)}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Close panel"
            >
              <X size={16} />
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-auto">
            {activePanel === 'fixtures' && <SimpleFixtureList />}
            {activePanel === 'calculations' && <CompactCalculationsPanel />}
          </div>
        </div>
      )}
      
      {/* Floating Panel Toggle (when closed) */}
      {room && !activePanel && (
        <div className="absolute right-4 top-16 flex flex-col gap-2">
          <button
            onClick={() => setActivePanel('fixtures')}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg shadow-lg"
            title="Open fixtures"
          >
            <Lightbulb size={20} />
          </button>
          <button
            onClick={() => setActivePanel('calculations')}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg shadow-lg"
            title="Open calculations"
          >
            <Calculator size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

export function SimpleDesigner() {
  return (
    <NotificationProvider>
      <DesignerProvider>
        <SimpleDesignerContent />
      </DesignerProvider>
    </NotificationProvider>
  );
}