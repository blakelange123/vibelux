import { useEffect, useCallback } from 'react';
import { useDesigner } from '../context/DesignerContext';

export function useKeyboardShortcuts() {
  const { state, dispatch, deleteObject, selectObject } = useDesigner();
  const { ui, objects } = state;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't handle shortcuts when typing in inputs, textareas, or contenteditable elements
    const target = e.target as HTMLElement;
    if (
      target instanceof HTMLInputElement || 
      target instanceof HTMLTextAreaElement ||
      target.contentEditable === 'true' ||
      target.isContentEditable ||
      target.closest('[contenteditable="true"]') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('[role="textbox"]') ||
      target.closest('[data-disable-shortcuts="true"]') ||
      target.hasAttribute('data-disable-shortcuts')
    ) {
      return;
    }

    // Tool shortcuts
    switch (e.key.toLowerCase()) {
      case 'v':
        if (!e.metaKey && !e.ctrlKey) {
          dispatch({ type: 'SET_TOOL', payload: 'select' });
          e.preventDefault();
        }
        break;
      
      case 'f':
        if (!e.metaKey && !e.ctrlKey) {
          dispatch({ type: 'SET_TOOL', payload: 'fixture' });
          e.preventDefault();
        }
        break;
      
      case 'p':
        if (!e.metaKey && !e.ctrlKey) {
          dispatch({ type: 'SET_TOOL', payload: 'plant' });
          e.preventDefault();
        }
        break;
      
      case 'delete':
      case 'backspace':
        if (ui.selectedObjectId && !e.metaKey && !e.ctrlKey) {
          deleteObject(ui.selectedObjectId);
          e.preventDefault();
        }
        break;
      
      case 'escape':
        selectObject(null);
        dispatch({ type: 'SET_TOOL', payload: 'select' });
        e.preventDefault();
        break;
      
      case 'g':
        if (!e.metaKey && !e.ctrlKey) {
          dispatch({ type: 'TOGGLE_PANEL', payload: 'grid' });
          e.preventDefault();
        }
        break;
      
      case '2':
        if (!e.metaKey && !e.ctrlKey) {
          dispatch({ type: 'SET_VIEW_MODE', payload: '2d' });
          e.preventDefault();
        }
        break;
      
      case '3':
        if (!e.metaKey && !e.ctrlKey) {
          dispatch({ type: 'SET_VIEW_MODE', payload: '3d' });
          e.preventDefault();
        }
        break;
      
      case 'z':
        if (e.metaKey || e.ctrlKey) {
          if (e.shiftKey) {
            dispatch({ type: 'REDO' });
          } else {
            dispatch({ type: 'UNDO' });
          }
          e.preventDefault();
        }
        break;
      
      case 's':
        if (e.metaKey || e.ctrlKey) {
          // Trigger save
          // Save project handler called
          e.preventDefault();
        }
        break;
      
      case 'a':
        if (e.metaKey || e.ctrlKey) {
          // Select all
          objects.forEach(obj => {
            dispatch({ type: 'SELECT_OBJECT', payload: obj.id });
          });
          e.preventDefault();
        }
        break;
      
      case 'd':
        if (e.metaKey || e.ctrlKey) {
          // Duplicate selected object
          if (ui.selectedObjectId) {
            const obj = objects.find(o => o.id === ui.selectedObjectId);
            if (obj) {
              dispatch({
                type: 'ADD_OBJECT',
                payload: {
                  ...obj,
                  x: obj.x + 2,
                  y: obj.y + 2
                }
              });
            }
          }
          e.preventDefault();
        }
        break;
    }
  }, [dispatch, deleteObject, selectObject, ui.selectedObjectId, objects]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}