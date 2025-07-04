'use client';

import React, { createContext, useContext, useReducer, ReactNode, useCallback, useMemo } from 'react';
import { designerReducer, initialState } from './designerReducer';
import type { DesignerState, DesignerAction, RoomObject, Room, Fixture } from './types';

interface DesignerContextValue {
  state: DesignerState;
  dispatch: React.Dispatch<DesignerAction>;
  // Helper methods
  addObject: (object: Omit<RoomObject, 'id'> | Omit<Fixture, 'id'>) => void;
  updateObject: (id: string, updates: Partial<RoomObject> | Partial<Fixture>) => void;
  deleteObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  selectObjects: (ids: string[]) => void;
  clearSelection: () => void;
  updateRoom: (updates: Partial<Room>) => void;
  togglePanel: (panel: string) => void;
  setTool: (tool: string) => void;
  clearObjects: () => void;
  setRoom: (room: Partial<Room>) => void;
  showNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const DesignerContext = createContext<DesignerContextValue | undefined>(undefined);

export function DesignerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(designerReducer, initialState);

  // Helper methods with proper memoization
  const addObject = useCallback((object: Omit<RoomObject, 'id'> | Omit<Fixture, 'id'>) => {
    dispatch({ type: 'ADD_OBJECT', payload: object });
  }, []);

  const updateObject = useCallback((id: string, updates: Partial<RoomObject> | Partial<Fixture>) => {
    dispatch({ type: 'UPDATE_OBJECT', payload: { id, updates } });
  }, []);

  const deleteObject = useCallback((id: string) => {
    dispatch({ type: 'DELETE_OBJECT', payload: id });
  }, []);

  const selectObject = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_OBJECT', payload: id });
  }, []);

  const selectObjects = useCallback((ids: string[]) => {
    dispatch({ type: 'SELECT_OBJECTS', payload: ids });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const updateRoom = useCallback((updates: Partial<Room>) => {
    dispatch({ type: 'UPDATE_ROOM', payload: updates });
  }, []);

  const togglePanel = useCallback((panel: string) => {
    dispatch({ type: 'TOGGLE_PANEL', payload: panel });
  }, []);

  const setTool = useCallback((tool: string) => {
    dispatch({ type: 'SET_TOOL', payload: tool });
  }, []);

  const clearObjects = useCallback(() => {
    dispatch({ type: 'CLEAR_OBJECTS' });
  }, []);

  const setRoom = useCallback((room: Partial<Room>) => {
    dispatch({ type: 'SET_ROOM', payload: room });
  }, []);

  const showNotification = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    // This will be provided by NotificationContext in the actual implementation
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const canUndo = state.history.past.length > 0;
  const canRedo = state.history.future.length > 0;

  return (
    <DesignerContext.Provider value={{
      state,
      dispatch,
      addObject,
      updateObject,
      deleteObject,
      selectObject,
      selectObjects,
      clearSelection,
      updateRoom,
      togglePanel,
      setTool,
      clearObjects,
      setRoom,
      showNotification,
      undo,
      redo,
      canUndo,
      canRedo
    }}>
      {children}
    </DesignerContext.Provider>
  );
}

export function useDesigner() {
  const context = useContext(DesignerContext);
  if (!context) {
    throw new Error('useDesigner must be used within a DesignerProvider');
  }
  return context;
}

// Specific hooks for common use cases
export function useDesignerObjects() {
  const { state } = useDesigner();
  return state.objects;
}

export function useDesignerRoom() {
  const { state } = useDesigner();
  return state.room;
}

export function useDesignerUI() {
  const { state } = useDesigner();
  return state.ui;
}

export function useSelectedObject() {
  const { state } = useDesigner();
  const { objects, ui } = state;
  return useMemo(() => 
    objects.find(obj => obj.id === ui.selectedObjectId),
    [objects, ui.selectedObjectId]
  );
}