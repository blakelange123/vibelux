import { RoomObject } from '../context/types';

export interface ObjectGroup {
  id: string;
  name: string;
  objectIds: string[];
  locked: boolean;
  visible: boolean;
  createdAt: Date;
}

export function createGroup(objects: RoomObject[], name?: string): ObjectGroup {
  const groupId = `group_${Date.now()}`;
  return {
    id: groupId,
    name: name || `Group ${groupId.substring(6, 10)}`,
    objectIds: objects.map(obj => obj.id),
    locked: false,
    visible: true,
    createdAt: new Date()
  };
}

export function addToGroup(group: ObjectGroup, objects: RoomObject[]): ObjectGroup {
  const newObjectIds = objects.map(obj => obj.id);
  return {
    ...group,
    objectIds: [...new Set([...group.objectIds, ...newObjectIds])]
  };
}

export function removeFromGroup(group: ObjectGroup, objectIds: string[]): ObjectGroup {
  return {
    ...group,
    objectIds: group.objectIds.filter(id => !objectIds.includes(id))
  };
}

export function getGroupBounds(objects: RoomObject[], groupObjectIds: string[]) {
  const groupObjects = objects.filter(obj => groupObjectIds.includes(obj.id));
  
  if (groupObjects.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  groupObjects.forEach(obj => {
    minX = Math.min(minX, obj.x - obj.width / 2);
    minY = Math.min(minY, obj.y - obj.length / 2);
    maxX = Math.max(maxX, obj.x + obj.width / 2);
    maxY = Math.max(maxY, obj.y + obj.length / 2);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2
  };
}

export function moveGroup(objects: RoomObject[], groupObjectIds: string[], deltaX: number, deltaY: number): RoomObject[] {
  return objects.map(obj => {
    if (groupObjectIds.includes(obj.id)) {
      return {
        ...obj,
        x: obj.x + deltaX,
        y: obj.y + deltaY
      };
    }
    return obj;
  });
}

export function rotateGroup(objects: RoomObject[], groupObjectIds: string[], angle: number, centerX: number, centerY: number): RoomObject[] {
  const radians = (angle * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return objects.map(obj => {
    if (groupObjectIds.includes(obj.id)) {
      // Translate to origin
      const x = obj.x - centerX;
      const y = obj.y - centerY;
      
      // Rotate
      const newX = x * cos - y * sin;
      const newY = x * sin + y * cos;
      
      // Translate back
      return {
        ...obj,
        x: newX + centerX,
        y: newY + centerY,
        rotation: (obj.rotation + angle) % 360
      };
    }
    return obj;
  });
}

export function scaleGroup(objects: RoomObject[], groupObjectIds: string[], scaleFactor: number, centerX: number, centerY: number): RoomObject[] {
  return objects.map(obj => {
    if (groupObjectIds.includes(obj.id)) {
      // Scale position relative to center
      const deltaX = (obj.x - centerX) * (scaleFactor - 1);
      const deltaY = (obj.y - centerY) * (scaleFactor - 1);
      
      return {
        ...obj,
        x: obj.x + deltaX,
        y: obj.y + deltaY,
        width: obj.width * scaleFactor,
        length: obj.length * scaleFactor
      };
    }
    return obj;
  });
}