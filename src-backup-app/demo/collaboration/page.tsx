'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CollaborationPanel } from '@/components/collaboration/CollaborationPanel';
import { CollaborationCursors, useCollaborationMouse } from '@/components/collaboration/CollaborationCursors';
import { useCollaboration } from '@/hooks/useCollaboration';
import { MousePointer, Square, Circle, Users, MessageSquare } from 'lucide-react';

// Import mock WebSocket for demo
import '@/lib/collaboration/websocket-server-mock';

interface DemoObject {
  id: string;
  type: 'fixture' | 'zone' | 'sensor';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  name: string;
}

export default function CollaborationDemo() {
  const [objects, setObjects] = useState<DemoObject[]>([
    {
      id: 'fixture-1',
      type: 'fixture',
      x: 100,
      y: 100,
      width: 80,
      height: 40,
      color: '#4ECDC4',
      name: 'LED Panel 1'
    },
    {
      id: 'fixture-2',
      type: 'fixture',
      x: 250,
      y: 150,
      width: 80,
      height: 40,
      color: '#4ECDC4',
      name: 'LED Panel 2'
    },
    {
      id: 'zone-1',
      type: 'zone',
      x: 150,
      y: 250,
      width: 120,
      height: 80,
      color: '#45B7D1',
      name: 'Growing Zone A'
    },
    {
      id: 'sensor-1',
      type: 'sensor',
      x: 350,
      y: 120,
      width: 30,
      height: 30,
      color: '#F7DC6F',
      name: 'Temp Sensor'
    }
  ]);

  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  
  // Generate random user info for demo
  const userId = 'user-' + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9);
  const userName = 'Demo User ' + Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100);
  const roomId = 'demo-room';

  const containerRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    users,
    cursors,
    selections,
    messages,
    sendCursor,
    sendSelection,
    sendObjectAdd,
    sendObjectUpdate,
    sendObjectDelete,
    sendMessage
  } = useCollaboration({
    roomId,
    userId,
    userName,
    wsUrl: 'ws://mock-server', // Will use mock WebSocket
    onObjectAdded: ({ object }) => {
      setObjects(prev => [...prev, object]);
    },
    onObjectUpdated: ({ objectId, updates }) => {
      setObjects(prev => 
        prev.map(obj => obj.id === objectId ? { ...obj, ...updates } : obj)
      );
    },
    onObjectDeleted: ({ objectId }) => {
      setObjects(prev => prev.filter(obj => obj.id !== objectId));
    }
  });

  // Enable mouse tracking for collaboration
  useCollaborationMouse(sendCursor, isConnected);

  const handleObjectClick = (objectId: string, type: 'fixture' | 'zone' | 'sensor') => {
    setSelectedObject(objectId);
    sendSelection(objectId, type);
  };

  const handleObjectDoubleClick = (objectId: string) => {
    // Delete object on double click (for demo)
    setObjects(prev => prev.filter(obj => obj.id !== objectId));
    sendObjectDelete(objectId);
    setSelectedObject(null);
  };

  const handleMouseDown = (e: React.MouseEvent, objectId: string) => {
    e.preventDefault();
    const object = objects.find(obj => obj.id === objectId);
    if (!object) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragOffset || !selectedObject) return;

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;

    const updatedObjects = objects.map(obj =>
      obj.id === selectedObject ? { ...obj, x: newX, y: newY } : obj
    );
    
    setObjects(updatedObjects);
    
    // Send update to other users
    sendObjectUpdate(selectedObject, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDragOffset(null);
  };

  const addNewObject = () => {
    const newObject: DemoObject = {
      id: `object-${Date.now()}`,
      type: 'fixture',
      x: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 400 + 50,
      y: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 300 + 50,
      width: 80,
      height: 40,
      color: '#4ECDC4',
      name: `New Object ${objects.length + 1}`
    };

    setObjects(prev => [...prev, newObject]);
    sendObjectAdd(newObject);
  };

  const getObjectIcon = (type: string) => {
    switch (type) {
      case 'fixture': return '💡';
      case 'zone': return '🌱';
      case 'sensor': return '🌡️';
      default: return '📦';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Real-time Collaboration Demo</h1>
            <p className="text-gray-400 mt-1">
              Try opening this page in multiple tabs to see collaboration in action
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <button
              onClick={addNewObject}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Add Object
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Canvas Area */}
        <div className="flex-1 relative">
          <div
            ref={containerRef}
            className="w-full h-full bg-gray-900 relative overflow-hidden cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={() => {
              setSelectedObject(null);
              sendSelection(null);
            }}
          >
            {/* Grid Background */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />

            {/* Objects */}
            {objects.map(object => (
              <div
                key={object.id}
                data-object-id={object.id}
                className={`absolute cursor-pointer select-none transition-all duration-150 ${
                  selectedObject === object.id ? 'ring-2 ring-purple-400' : ''
                }`}
                style={{
                  left: object.x,
                  top: object.y,
                  width: object.width,
                  height: object.height,
                  backgroundColor: object.color,
                  borderRadius: object.type === 'sensor' ? '50%' : '8px'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleObjectClick(object.id, object.type);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleObjectDoubleClick(object.id);
                }}
                onMouseDown={(e) => handleMouseDown(e, object.id)}
              >
                <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                  <span className="text-lg">{getObjectIcon(object.type)}</span>
                </div>
                
                {/* Object label */}
                <div className="absolute -bottom-6 left-0 text-xs text-gray-400 whitespace-nowrap">
                  {object.name}
                </div>
              </div>
            ))}

            {/* Instructions */}
            <div className="absolute top-4 left-4 bg-gray-800/90 backdrop-blur rounded-lg p-4 max-w-md">
              <h3 className="font-semibold mb-2">How to test collaboration:</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Open this page in multiple browser tabs</li>
                <li>• Click objects to select them</li>
                <li>• Drag objects to move them</li>
                <li>• Double-click objects to delete them</li>
                <li>• Add new objects with the button</li>
                <li>• See other users' cursors and selections</li>
                <li>• Chat with other users in the panel</li>
              </ul>
            </div>

            {/* User Info */}
            <div className="absolute bottom-4 left-4 bg-gray-800/90 backdrop-blur rounded-lg p-3">
              <div className="text-sm">
                <div className="font-medium">Your Info:</div>
                <div className="text-gray-400">ID: {userId}</div>
                <div className="text-gray-400">Name: {userName}</div>
                <div className="text-gray-400">Connected Users: {users.length}</div>
              </div>
            </div>
          </div>

          {/* Collaboration Cursors */}
          <CollaborationCursors
            cursors={cursors}
            selections={selections}
            currentUserId={userId}
            containerRef={containerRef}
          />
        </div>

        {/* Collaboration Panel */}
        <CollaborationPanel
          roomId={roomId}
          userId={userId}
          userName={userName}
          wsUrl="ws://mock-server"
          onObjectAdded={({ object }) => {
            setObjects(prev => [...prev, object]);
          }}
          onObjectUpdated={({ objectId, updates }) => {
            setObjects(prev => 
              prev.map(obj => obj.id === objectId ? { ...obj, ...updates } : obj)
            );
          }}
          onObjectDeleted={({ objectId }) => {
            setObjects(prev => prev.filter(obj => obj.id !== objectId));
          }}
        />
      </div>
    </div>
  );
}