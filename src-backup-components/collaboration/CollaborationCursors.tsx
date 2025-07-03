'use client';

import React, { useEffect, useState } from 'react';
import { MousePointer, Circle } from 'lucide-react';

interface CollaborationUser {
  id: string;
  name: string;
  color: string;
}

interface Cursor {
  userId: string;
  x: number;
  y: number;
  user?: CollaborationUser;
}

interface Selection {
  userId: string;
  objectId: string;
  type: 'fixture' | 'zone' | 'sensor';
  user?: CollaborationUser;
}

interface CollaborationCursorsProps {
  cursors: Cursor[];
  selections: Selection[];
  currentUserId: string;
  showCursors?: boolean;
  showSelections?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
}

export function CollaborationCursors({
  cursors,
  selections,
  currentUserId,
  showCursors = true,
  showSelections = true,
  containerRef
}: CollaborationCursorsProps) {
  const [visibleCursors, setVisibleCursors] = useState<Cursor[]>([]);

  // Filter out current user's cursor and update positions
  useEffect(() => {
    const filtered = cursors.filter(cursor => 
      cursor.userId !== currentUserId && 
      cursor.user &&
      showCursors
    );
    
    setVisibleCursors(filtered);
  }, [cursors, currentUserId, showCursors]);

  // Helper to check if coordinates are within viewport
  const isInViewport = (x: number, y: number) => {
    if (!containerRef?.current) return true;
    
    const rect = containerRef.current.getBoundingClientRect();
    return (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    );
  };

  return (
    <>
      {/* Render cursors */}
      {visibleCursors.map(cursor => {
        const { user } = cursor;
        if (!user) return null;

        return (
          <div
            key={cursor.userId}
            className="fixed pointer-events-none z-[100] transition-all duration-75 ease-out"
            style={{
              left: cursor.x,
              top: cursor.y,
              transform: 'translate(-2px, -2px)'
            }}
          >
            {/* Cursor pointer */}
            <div className="relative">
              <MousePointer
                className="w-5 h-5 drop-shadow-lg"
                style={{ 
                  color: user.color,
                  filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.3))`
                }}
              />
              
              {/* User name label */}
              <div
                className="absolute top-6 left-2 px-2 py-1 rounded text-xs text-white 
                  whitespace-nowrap shadow-lg max-w-[120px] truncate z-10"
                style={{ backgroundColor: user.color }}
              >
                {user.name}
              </div>
            </div>
          </div>
        );
      })}

      {/* Render selection indicators */}
      {showSelections && selections.map(selection => {
        const { user } = selection;
        if (!user || selection.userId === currentUserId) return null;

        // Find the selected element in the DOM
        const selectedElement = document.querySelector(`[data-object-id="${selection.objectId}"]`);
        if (!selectedElement) return null;

        const rect = selectedElement.getBoundingClientRect();
        const isVisible = isInViewport(rect.left, rect.top);
        
        if (!isVisible) return null;

        return (
          <div
            key={`${selection.userId}-${selection.objectId}`}
            className="fixed pointer-events-none z-[90]"
            style={{
              left: rect.left - 4,
              top: rect.top - 4,
              width: rect.width + 8,
              height: rect.height + 8
            }}
          >
            {/* Selection outline */}
            <div
              className="w-full h-full rounded border-2 border-dashed animate-pulse"
              style={{ borderColor: user.color }}
            />
            
            {/* Selection label */}
            <div
              className="absolute -top-8 left-0 px-2 py-1 rounded text-xs text-white
                whitespace-nowrap shadow-lg flex items-center gap-1"
              style={{ backgroundColor: user.color }}
            >
              <Circle className="w-3 h-3" />
              <span>{user.name}</span>
              <span className="opacity-75">• {selection.type}</span>
            </div>
          </div>
        );
      })}
    </>
  );
}

// Helper component for integrating with canvas-based components
interface CanvasCollaborationOverlayProps extends CollaborationCursorsProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  scale?: number;
  offset?: { x: number; y: number };
}

export function CanvasCollaborationOverlay({
  cursors,
  selections,
  currentUserId,
  showCursors = true,
  showSelections = true,
  canvasRef,
  scale = 1,
  offset = { x: 0, y: 0 }
}: CanvasCollaborationOverlayProps) {
  // Transform canvas coordinates to screen coordinates
  const transformedCursors = cursors.map(cursor => {
    if (!canvasRef.current) return cursor;
    
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      ...cursor,
      x: rect.left + (cursor.x + offset.x) * scale,
      y: rect.top + (cursor.y + offset.y) * scale
    };
  });

  return (
    <CollaborationCursors
      cursors={transformedCursors}
      selections={selections}
      currentUserId={currentUserId}
      showCursors={showCursors}
      showSelections={showSelections}
    />
  );
}

// Hook for tracking mouse position and sending to collaboration
export function useCollaborationMouse(
  sendCursor: (x: number, y: number) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    let lastSent = 0;
    const throttleMs = 50; // Send cursor updates at most every 50ms

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSent < throttleMs) return;

      sendCursor(e.clientX, e.clientY);
      lastSent = now;
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [sendCursor, enabled]);
}