import type { RoomObject, Position } from '../context/types';

// Minimum distance between fixtures (in feet)
const MIN_FIXTURE_SPACING = 1.0;
const MIN_WALL_DISTANCE = 0.5;

export interface CollisionResult {
  isValid: boolean;
  reason?: string;
  suggestedPosition?: Position;
}

/**
 * Check if a new object placement is valid
 */
export function checkPlacementValidity(
  newObject: { position: Position; type: string },
  existingObjects: RoomObject[],
  roomDimensions: { width: number; length: number; height: number }
): CollisionResult {
  const { position } = newObject;
  
  // Check if position is within room boundaries
  if (position.x < MIN_WALL_DISTANCE || position.x > roomDimensions.width - MIN_WALL_DISTANCE) {
    return {
      isValid: false,
      reason: 'Too close to wall. Minimum wall distance is ' + MIN_WALL_DISTANCE + ' ft',
      suggestedPosition: {
        x: Math.max(MIN_WALL_DISTANCE, Math.min(roomDimensions.width - MIN_WALL_DISTANCE, position.x)),
        y: position.y,
        z: position.z
      }
    };
  }
  
  if (position.y < MIN_WALL_DISTANCE || position.y > roomDimensions.length - MIN_WALL_DISTANCE) {
    return {
      isValid: false,
      reason: 'Too close to wall. Minimum wall distance is ' + MIN_WALL_DISTANCE + ' ft',
      suggestedPosition: {
        x: position.x,
        y: Math.max(MIN_WALL_DISTANCE, Math.min(roomDimensions.length - MIN_WALL_DISTANCE, position.y)),
        z: position.z
      }
    };
  }
  
  // Check for collisions with existing fixtures
  if (newObject.type === 'fixture') {
    for (const obj of existingObjects) {
      if (obj.type === 'fixture') {
        const distance = calculateDistance(position, { x: obj.x, y: obj.y, z: obj.z });
        if (distance < MIN_FIXTURE_SPACING) {
          // Find a suggested position that doesn't collide
          const suggestedPosition = findNearestValidPosition(
            position,
            existingObjects,
            roomDimensions,
            MIN_FIXTURE_SPACING
          );
          
          return {
            isValid: false,
            reason: `Too close to another fixture. Minimum spacing is ${MIN_FIXTURE_SPACING} ft`,
            suggestedPosition
          };
        }
      }
    }
  }
  
  return { isValid: true };
}

/**
 * Calculate distance between two positions
 */
function calculateDistance(pos1: Position, pos2: Position): number {
  return Math.sqrt(
    Math.pow(pos1.x - pos2.x, 2) +
    Math.pow(pos1.y - pos2.y, 2)
  );
}

/**
 * Find the nearest valid position for an object
 */
function findNearestValidPosition(
  desiredPosition: Position,
  existingObjects: RoomObject[],
  roomDimensions: { width: number; length: number; height: number },
  minSpacing: number
): Position {
  // Try positions in a spiral pattern around the desired position
  const stepSize = 0.5;
  const maxSteps = 20;
  
  for (let step = 1; step <= maxSteps; step++) {
    const angles = 8; // Check 8 directions
    for (let i = 0; i < angles; i++) {
      const angle = (i / angles) * 2 * Math.PI;
      const testPosition: Position = {
        x: desiredPosition.x + Math.cos(angle) * step * stepSize,
        y: desiredPosition.y + Math.sin(angle) * step * stepSize,
        z: desiredPosition.z
      };
      
      // Check if this position is valid
      const isValid = checkPositionValidity(testPosition, existingObjects, roomDimensions, minSpacing);
      if (isValid) {
        return testPosition;
      }
    }
  }
  
  // If no valid position found, return the original
  return desiredPosition;
}

/**
 * Check if a specific position is valid
 */
function checkPositionValidity(
  position: Position,
  existingObjects: RoomObject[],
  roomDimensions: { width: number; length: number; height: number },
  minSpacing: number
): boolean {
  // Check room boundaries
  if (
    position.x < MIN_WALL_DISTANCE ||
    position.x > roomDimensions.width - MIN_WALL_DISTANCE ||
    position.y < MIN_WALL_DISTANCE ||
    position.y > roomDimensions.length - MIN_WALL_DISTANCE
  ) {
    return false;
  }
  
  // Check collisions with existing objects
  for (const obj of existingObjects) {
    if (obj.type === 'fixture') {
      const distance = calculateDistance(position, { x: obj.x, y: obj.y, z: obj.z });
      if (distance < minSpacing) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Auto-arrange fixtures in a grid pattern
 */
export function autoArrangeFixtures(
  fixtureCount: number,
  roomDimensions: { width: number; length: number },
  minSpacing: number = MIN_FIXTURE_SPACING
): Position[] {
  const positions: Position[] = [];
  
  // Calculate optimal grid dimensions
  const aspectRatio = roomDimensions.width / roomDimensions.length;
  let cols = Math.ceil(Math.sqrt(fixtureCount * aspectRatio));
  let rows = Math.ceil(fixtureCount / cols);
  
  // Adjust if needed
  while (cols * rows < fixtureCount) {
    if (roomDimensions.width > roomDimensions.length) {
      cols++;
    } else {
      rows++;
    }
  }
  
  // Calculate spacing
  const xSpacing = (roomDimensions.width - 2 * MIN_WALL_DISTANCE) / (cols + 1);
  const ySpacing = (roomDimensions.length - 2 * MIN_WALL_DISTANCE) / (rows + 1);
  
  // Generate positions
  let fixtureIndex = 0;
  for (let row = 0; row < rows && fixtureIndex < fixtureCount; row++) {
    for (let col = 0; col < cols && fixtureIndex < fixtureCount; col++) {
      positions.push({
        x: MIN_WALL_DISTANCE + (col + 1) * xSpacing,
        y: MIN_WALL_DISTANCE + (row + 1) * ySpacing,
        z: roomDimensions.length - 2 // Default mounting height
      });
      fixtureIndex++;
    }
  }
  
  return positions;
}