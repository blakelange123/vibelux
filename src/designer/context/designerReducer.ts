import type { DesignerState, DesignerAction, RoomObject } from './types';
import { 
  emitObjectAdded, 
  emitObjectRemoved, 
  emitObjectUpdated, 
  emitRoomCreated, 
  emitRoomUpdated,
  emitCalculationCompleted 
} from '../events/DesignerEventSystem';

export const initialState: DesignerState = {
  room: null, // Start with no room - user must create one
  objects: [],
  ui: {
    selectedTool: 'select',
    selectedObjectId: null,
    selectedObjectIds: [],
    selectedObjectType: 'fixture',
    panels: {
      leftSidebar: true,
      rightSidebar: false,
      spectrumAnalysis: false,
      emergencyLighting: false,
      circuitPlanning: false,
      bimProperties: false,
      falseColor: false,
      greenhouse: false,
      aiAssistant: false,
      advanced3DVisualization: false,
      advancedPPFDMapping: false,
      ledThermalManagement: false,
      plantBiologyIntegration: false,
      multiZoneControlSystem: false,
      environmentalIntegration: false,
      researchPropagationTools: false,
      advancedFixtureLibrary: false,
      cadTools: false,
      photometricEngine: false,
      advancedVisualization: false,
      projectManager: false
    },
    viewMode: '2d',
    grid: {
      enabled: true,
      snap: true,
      size: 1
    },
    measurement: {
      unit: 'imperial'
    }
  },
  calculations: {
    ppfdGrid: [],
    uniformity: 0,
    averagePPFD: 0,
    minPPFD: 0,
    maxPPFD: 0,
    dli: 0,
    lastCalculated: null,
    isCalculating: false
  },
  history: {
    past: [],
    future: []
  }
};

// Helper function to create a state snapshot for history
function createSnapshot(state: DesignerState): DesignerState {
  return {
    ...state,
    objects: [...state.objects],
    room: state.room ? { ...state.room } : null,
    history: { past: [], future: [] } // Don't include history in snapshots
  };
}

export function designerReducer(state: DesignerState, action: DesignerAction): DesignerState {
  
  // For actions that modify state, save to history (exclude temporary updates during dragging)
  const shouldSaveHistory = ['ADD_OBJECT', 'UPDATE_OBJECT', 'DELETE_OBJECT', 'UPDATE_ROOM'].includes(action.type);
  
  if (shouldSaveHistory) {
    const newHistory = {
      past: [...state.history.past, createSnapshot(state)].slice(-50), // Keep last 50 states
      future: []
    };
    state = { ...state, history: newHistory };
  }

  switch (action.type) {
    case 'ADD_OBJECT': {
      const newObject: RoomObject = {
        ...action.payload,
        id: `obj-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
        enabled: true
      } as RoomObject;
      
      
      const newState = {
        ...state,
        objects: [...state.objects, newObject],
        ui: {
          ...state.ui,
          selectedObjectId: newObject.id
        }
      };
      
      
      // Emit event
      emitObjectAdded(newObject, 'user');
      
      return newState;
    }

    case 'UPDATE_OBJECT': {
      if (process.env.NODE_ENV === 'development') {
      }
      const updatedObjects = state.objects.map(obj =>
        obj.id === action.payload.id
          ? { ...obj, ...action.payload.updates }
          : obj
      );
      if (process.env.NODE_ENV === 'development') {
      }
      
      // Emit event
      emitObjectUpdated(action.payload.id, action.payload.updates, 'user');
      
      return {
        ...state,
        objects: updatedObjects
      };
    }

    case 'DELETE_OBJECT': {
      // Emit event before deleting
      emitObjectRemoved(action.payload, 'user');
      
      return {
        ...state,
        objects: state.objects.filter(obj => obj.id !== action.payload),
        ui: {
          ...state.ui,
          selectedObjectId: state.ui.selectedObjectId === action.payload ? null : state.ui.selectedObjectId
        }
      };
    }

    case 'SELECT_OBJECT': {
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedObjectId: action.payload,
          selectedObjectIds: action.payload ? [action.payload] : []
        }
      };
    }

    case 'SELECT_OBJECTS': {
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedObjectId: action.payload.length > 0 ? action.payload[0] : null,
          selectedObjectIds: action.payload
        }
      };
    }

    case 'CLEAR_SELECTION': {
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedObjectId: null,
          selectedObjectIds: []
        }
      };
    }

    case 'UPDATE_ROOM': {
      // Emit event
      if (state.room) {
        emitRoomUpdated(action.payload, 'user');
      }
      
      return {
        ...state,
        room: state.room ? {
          ...state.room,
          ...action.payload
        } : null
      };
    }

    case 'TOGGLE_PANEL': {
      const panelKey = action.payload as keyof typeof state.ui.panels;
      return {
        ...state,
        ui: {
          ...state.ui,
          panels: {
            ...state.ui.panels,
            [panelKey]: !state.ui.panels[panelKey]
          }
        }
      };
    }

    case 'SET_TOOL': {
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedTool: action.payload
        }
      };
    }

    case 'SET_OBJECT_TYPE': {
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedObjectType: action.payload
        }
      };
    }

    case 'SET_VIEW_MODE': {
      return {
        ...state,
        ui: {
          ...state.ui,
          viewMode: action.payload
        }
      };
    }

    case 'SET_SELECTED_FIXTURE': {
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedFixtureModel: action.payload
        }
      };
    }

    case 'UPDATE_CALCULATIONS': {
      return {
        ...state,
        calculations: {
          ...state.calculations,
          ...action.payload,
          lastCalculated: new Date()
        }
      };
    }

    case 'UNDO': {
      if (state.history.past.length === 0) return state;
      
      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);
      
      return {
        ...previous,
        history: {
          past: newPast,
          future: [createSnapshot(state), ...state.history.future].slice(0, 50)
        }
      };
    }

    case 'REDO': {
      if (state.history.future.length === 0) return state;
      
      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);
      
      return {
        ...next,
        history: {
          past: [...state.history.past, createSnapshot(state)].slice(-50),
          future: newFuture
        }
      };
    }

    case 'RESET': {
      return initialState;
    }

    case 'LOAD_PROJECT': {
      return {
        ...action.payload,
        history: {
          past: [],
          future: []
        }
      };
    }

    case 'CLEAR_OBJECTS': {
      return {
        ...state,
        objects: [],
        ui: {
          ...state.ui,
          selectedObjectId: null
        }
      };
    }

    case 'SET_ROOM': {
      const newRoom = {
        ...(state.room || {}),
        ...action.payload
      };
      
      // Emit event
      emitRoomCreated(newRoom, 'user');
      
      return {
        ...state,
        room: newRoom
      };
    }

    case 'UPDATE_UI': {
      return {
        ...state,
        ui: {
          ...state.ui,
          ...action.payload
        }
      };
    }

    case 'UPDATE_OBJECTS_TEMP': {
      // Temporary object update that doesn't create history (used during dragging)
      return {
        ...state,
        objects: action.payload
      };
    }

    default:
      return state;
  }
}