import { RoomObject } from '../context/types';

// Layer ordering utilities for z-index management
export interface LayerInfo {
  objectId: string;
  zIndex: number;
  type: string;
  name?: string;
}

// Get the current z-index for all objects
export function getLayerOrder(objects: RoomObject[]): LayerInfo[] {
  return objects
    .map((obj, index) => ({
      objectId: obj.id,
      zIndex: (obj as any).zIndex || index,
      type: obj.type,
      name: obj.customName || `${obj.type}_${obj.id.substring(0, 6)}`
    }))
    .sort((a, b) => a.zIndex - b.zIndex);
}

// Bring object to front (highest z-index)
export function bringToFront(objects: RoomObject[], objectId: string): RoomObject[] {
  const maxZIndex = Math.max(...objects.map((obj, idx) => (obj as any).zIndex || idx));
  
  return objects.map(obj => {
    if (obj.id === objectId) {
      return { ...obj, zIndex: maxZIndex + 1 };
    }
    return obj;
  });
}

// Send object to back (lowest z-index)
export function sendToBack(objects: RoomObject[], objectId: string): RoomObject[] {
  const minZIndex = Math.min(...objects.map((obj, idx) => (obj as any).zIndex || idx));
  
  return objects.map(obj => {
    if (obj.id === objectId) {
      return { ...obj, zIndex: minZIndex - 1 };
    }
    return obj;
  });
}

// Bring object forward one level
export function bringForward(objects: RoomObject[], objectId: string): RoomObject[] {
  const sortedObjects = [...objects].sort((a, b) => 
    ((a as any).zIndex || 0) - ((b as any).zIndex || 0)
  );
  
  const currentIndex = sortedObjects.findIndex(obj => obj.id === objectId);
  
  if (currentIndex < 0 || currentIndex >= sortedObjects.length - 1) {
    return objects; // Can't move forward
  }
  
  const currentZIndex = (sortedObjects[currentIndex] as any).zIndex || currentIndex;
  const nextZIndex = (sortedObjects[currentIndex + 1] as any).zIndex || (currentIndex + 1);
  
  return objects.map(obj => {
    if (obj.id === objectId) {
      return { ...obj, zIndex: nextZIndex + 0.5 };
    }
    return obj;
  });
}

// Send object backward one level
export function sendBackward(objects: RoomObject[], objectId: string): RoomObject[] {
  const sortedObjects = [...objects].sort((a, b) => 
    ((a as any).zIndex || 0) - ((b as any).zIndex || 0)
  );
  
  const currentIndex = sortedObjects.findIndex(obj => obj.id === objectId);
  
  if (currentIndex <= 0) {
    return objects; // Can't move backward
  }
  
  const currentZIndex = (sortedObjects[currentIndex] as any).zIndex || currentIndex;
  const prevZIndex = (sortedObjects[currentIndex - 1] as any).zIndex || (currentIndex - 1);
  
  return objects.map(obj => {
    if (obj.id === objectId) {
      return { ...obj, zIndex: prevZIndex - 0.5 };
    }
    return obj;
  });
}

// Reorder objects by dragging in layers panel
export function reorderLayers(objects: RoomObject[], fromIndex: number, toIndex: number): RoomObject[] {
  const sortedObjects = [...objects].sort((a, b) => 
    ((a as any).zIndex || 0) - ((b as any).zIndex || 0)
  );
  
  const [movedObject] = sortedObjects.splice(fromIndex, 1);
  sortedObjects.splice(toIndex, 0, movedObject);
  
  // Reassign z-indices based on new order
  return objects.map(obj => {
    const newIndex = sortedObjects.findIndex(o => o.id === obj.id);
    return { ...obj, zIndex: newIndex };
  });
}

// Group objects on same layer
export function groupOnLayer(objects: RoomObject[], objectIds: string[]): RoomObject[] {
  if (objectIds.length === 0) return objects;
  
  // Find the highest z-index among selected objects
  const selectedObjects = objects.filter(obj => objectIds.includes(obj.id));
  const maxZIndex = Math.max(...selectedObjects.map((obj, idx) => (obj as any).zIndex || idx));
  
  // Set all selected objects to the same z-index
  return objects.map(obj => {
    if (objectIds.includes(obj.id)) {
      return { ...obj, zIndex: maxZIndex };
    }
    return obj;
  });
}

// Auto-arrange layers by type
export function autoArrangeLayers(objects: RoomObject[]): RoomObject[] {
  // Define layer order by type
  const typeOrder = {
    'wall': 0,
    'bench': 100,
    'rack': 200,
    'plant': 300,
    'equipment': 400,
    'hvacFan': 500,
    'fixture': 600,
    'underCanopy': 700,
    'emergencyFixture': 800,
    'rectangle': 900,
    'circle': 950,
    'line': 1000,
    'unistrut': 1100
  };
  
  return objects.map((obj, index) => {
    const baseZIndex = typeOrder[obj.type] || 500;
    return { ...obj, zIndex: baseZIndex + index * 0.1 };
  });
}