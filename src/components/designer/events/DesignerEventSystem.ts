// Designer Event System - Allows AI and other components to interact with the designer

export interface DesignerEvent {
  type: string;
  payload: any;
  timestamp: Date;
  source: 'user' | 'ai' | 'system';
}

export type DesignerEventType = 
  | 'object.added'
  | 'object.removed'
  | 'object.updated'
  | 'object.selected'
  | 'room.created'
  | 'room.updated'
  | 'calculation.started'
  | 'calculation.completed'
  | 'tool.changed'
  | 'panel.opened'
  | 'panel.closed'
  | 'design.saved'
  | 'design.loaded'
  | 'canvas.cleared'
  | 'ai.action.executed'
  | 'ai.suggestion'
  | 'optimization.started'
  | 'optimization.completed';

export class DesignerEventSystem {
  private static instance: DesignerEventSystem;
  private listeners: Map<DesignerEventType, Set<(event: DesignerEvent) => void>> = new Map();
  private eventHistory: DesignerEvent[] = [];
  private maxHistorySize = 100;

  private constructor() {
    // Singleton pattern
  }

  static getInstance(): DesignerEventSystem {
    if (!DesignerEventSystem.instance) {
      DesignerEventSystem.instance = new DesignerEventSystem();
    }
    return DesignerEventSystem.instance;
  }

  // Subscribe to events
  on(eventType: DesignerEventType, callback: (event: DesignerEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  // Emit events
  emit(type: DesignerEventType, payload: any, source: 'user' | 'ai' | 'system' = 'system') {
    const event: DesignerEvent = {
      type,
      payload,
      timestamp: new Date(),
      source
    };

    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify listeners
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }

    // Also emit a wildcard event for monitoring
    const wildcardListeners = this.listeners.get('*' as any);
    if (wildcardListeners) {
      wildcardListeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in wildcard listener:', error);
        }
      });
    }
  }

  // Get event history
  getHistory(filter?: { type?: DesignerEventType; source?: string; limit?: number }): DesignerEvent[] {
    let history = [...this.eventHistory];

    if (filter?.type) {
      history = history.filter(e => e.type === filter.type);
    }

    if (filter?.source) {
      history = history.filter(e => e.source === filter.source);
    }

    if (filter?.limit) {
      history = history.slice(-filter.limit);
    }

    return history;
  }

  // Clear history
  clearHistory() {
    this.eventHistory = [];
  }

  // Get current state summary
  getStateSummary(): any {
    const recentEvents = this.getHistory({ limit: 20 });
    const eventCounts = recentEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents: this.eventHistory.length,
      recentEvents: recentEvents.map(e => ({
        type: e.type,
        source: e.source,
        timestamp: e.timestamp.toISOString()
      })),
      eventCounts,
      activeListeners: Array.from(this.listeners.keys()).map(type => ({
        type,
        count: this.listeners.get(type)?.size || 0
      }))
    };
  }
}

// Export singleton instance
export const designerEvents = DesignerEventSystem.getInstance();

// Helper functions for common operations
export const emitObjectAdded = (object: any, source: 'user' | 'ai' | 'system' = 'user') => {
  designerEvents.emit('object.added', object, source);
};

export const emitObjectRemoved = (objectId: string, source: 'user' | 'ai' | 'system' = 'user') => {
  designerEvents.emit('object.removed', { id: objectId }, source);
};

export const emitObjectUpdated = (objectId: string, updates: any, source: 'user' | 'ai' | 'system' = 'user') => {
  designerEvents.emit('object.updated', { id: objectId, updates }, source);
};

export const emitRoomCreated = (room: any, source: 'user' | 'ai' | 'system' = 'user') => {
  designerEvents.emit('room.created', room, source);
};

export const emitRoomUpdated = (updates: any, source: 'user' | 'ai' | 'system' = 'user') => {
  designerEvents.emit('room.updated', updates, source);
};

export const emitCalculationCompleted = (results: any) => {
  designerEvents.emit('calculation.completed', results, 'system');
};

export const emitAIActionExecuted = (action: any, result: any) => {
  designerEvents.emit('ai.action.executed', { action, result }, 'ai');
};

export const emitOptimizationCompleted = (results: any) => {
  designerEvents.emit('optimization.completed', results, 'system');
};