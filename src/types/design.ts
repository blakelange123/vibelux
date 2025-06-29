export interface DesignIntent {
  benchCount?: number;
  rackInfo?: {
    totalLayers?: number;
    totalHeight?: number;
  };
  rackCount?: number;
  roomSize?: {
  };
  cropType?: string;
  wantsFans?: boolean;
  fanType?: {
  };
  fixturePreferences?: {
    wantsPhilips?: boolean;
    wantsUsed?: boolean;
    wantsEfficient?: boolean;
    wantsFluence?: boolean;
  };
  layoutPreferences?: {
    wantsRows?: boolean;
    wantsStaggered?: boolean;
    wantsPerimeter?: boolean;
    wantsUniform?: boolean;
  };
  priorities?: string[];
  budget?: number;
}