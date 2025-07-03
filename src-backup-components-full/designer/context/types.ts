// Designer type definitions

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Room {
  width: number;
  length: number;
  height: number;
  ceilingHeight: number;
  workingHeight: number;
  reflectances: {
    ceiling: number;
    walls: number;
    floor: number;
  };
  roomType: string;
  windows: Window[];
  structureType?: 'single-span' | 'gutter-connect' | 'venlo' | 'indoor';
  gutterHeight?: number;
  glazingType?: 'polycarbonate' | 'glass' | 'poly-film';
  lightTransmission?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  supplementalLighting?: 'photoperiodic' | 'supplemental';
  targetDLI?: number;
  shading?: boolean;
  shadingPercentage?: number;
}

export interface Window {
  id: string;
  wall: 'north' | 'south' | 'east' | 'west';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Wall extends RoomObject {
  type: 'wall';
  wallType: 'exterior' | 'interior';
  material?: string;
  thickness?: number;
}

export interface RoomObject {
  id: string;
  type: 'fixture' | 'plant' | 'bench' | 'rack' | 'underCanopy' | 'window' | 'greenhouse' | 'emergencyFixture' | 'exitDoor' | 'egressPath' | 'obstacle' | 'wall' | 'hvacFan' | 'equipment' | 'rectangle' | 'circle' | 'line' | 'unistrut' | 'calculation_surface';
  x: number;
  y: number;
  z: number;
  rotation: number;
  width: number;
  length: number;
  height: number;
  enabled: boolean;
  group?: string;
  customName?: string;
  locked?: boolean;
  [key: string]: any; // Allow additional properties for specialized objects
}

export interface Fixture extends RoomObject {
  type: 'fixture';
  model: {
    id?: string;
    name: string;
    wattage: number;
    ppf: number;
    ppfd?: number;
    beamAngle: number;
    manufacturer?: string;
    efficacy?: number;
    spectrum?: string;
    isDLC?: boolean;
  };
  dimmingLevel?: number;
  style?: string;
}

export interface Plant extends RoomObject {
  type: 'plant';
  variety: string;
  growthStage: string;
  targetDLI: number;
}

export interface HVACFan extends RoomObject {
  type: 'hvacFan';
  fanType: 'VAF' | 'HAF' | 'Exhaust' | 'Intake';
  airflow: number; // CFM
  power: number; // Watts
  diameter: number; // inches
  mountType: 'ceiling' | 'wall' | 'floor' | 'inline';
}

export interface Rectangle extends RoomObject {
  type: 'rectangle';
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface Circle extends RoomObject {
  type: 'circle';
  radius?: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface Unistrut extends RoomObject {
  type: 'unistrut';
  subType: 'run' | 'hanger';
  unistrut?: {
    size?: string;
    maxLoad?: number;
    runData?: any;
    hangerType?: string;
    fixtureId?: string;
    hangerData?: any;
  };
}

export interface Line extends RoomObject {
  type: 'line';
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface UIState {
  selectedTool: string;
  selectedObjectId: string | null;
  selectedObjectIds: string[];
  selectedObjectType: string | null;
  selectedFixtureModel?: any;
  panels: {
    leftSidebar: boolean;
    rightSidebar: boolean;
    spectrumAnalysis: boolean;
    emergencyLighting: boolean;
    circuitPlanning: boolean;
    bimProperties: boolean;
    falseColor: boolean;
    greenhouse: boolean;
    aiAssistant: boolean;
    advanced3DVisualization: boolean;
    advancedPPFDMapping: boolean;
    ledThermalManagement: boolean;
    plantBiologyIntegration: boolean;
    multiZoneControlSystem: boolean;
    environmentalIntegration: boolean;
    researchPropagationTools: boolean;
    advancedFixtureLibrary: boolean;
    cadTools: boolean;
    photometricEngine: boolean;
    advancedVisualization: boolean;
    projectManager: boolean;
  };
  viewMode: '2d' | '3d';
  grid: {
    enabled: boolean;
    snap: boolean;
    size: number;
  };
  measurement: {
    unit: 'metric' | 'imperial';
  };
}

export interface CalculationState {
  ppfdGrid: number[][];
  uniformity: number; // Backward compatibility - min/avg ratio
  uniformityMetrics?: {
    minAvgRatio: number;
    avgMaxRatio: number;
    minMaxRatio: number;
    cv: number;
  };
  averagePPFD: number;
  minPPFD: number;
  maxPPFD: number;
  dli: number;
  lastCalculated: Date | null;
  isCalculating: boolean;
}

export interface DesignerState {
  room: Room | null; // Allow null for when no room exists yet
  objects: RoomObject[];
  ui: UIState;
  calculations: CalculationState;
  history: {
    past: DesignerState[];
    future: DesignerState[];
  };
}

export type DesignerAction =
  | { type: 'ADD_OBJECT'; payload: Omit<RoomObject, 'id'> | Omit<Fixture, 'id'> }
  | { type: 'UPDATE_OBJECT'; payload: { id: string; updates: Partial<RoomObject> } }
  | { type: 'UPDATE_OBJECTS_TEMP'; payload: RoomObject[] }
  | { type: 'DELETE_OBJECT'; payload: string }
  | { type: 'SELECT_OBJECT'; payload: string | null }
  | { type: 'SELECT_OBJECTS'; payload: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'UPDATE_ROOM'; payload: Partial<Room> }
  | { type: 'TOGGLE_PANEL'; payload: string }
  | { type: 'SET_TOOL'; payload: string }
  | { type: 'SET_OBJECT_TYPE'; payload: string }
  | { type: 'SET_VIEW_MODE'; payload: '2d' | '3d' }
  | { type: 'SET_SELECTED_FIXTURE'; payload: any }
  | { type: 'UPDATE_CALCULATIONS'; payload: Partial<CalculationState> }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET' }
  | { type: 'LOAD_PROJECT'; payload: DesignerState }
  | { type: 'CLEAR_OBJECTS' }
  | { type: 'SET_ROOM'; payload: Partial<Room> }
  | { type: 'UPDATE_UI'; payload: Partial<UIState> };