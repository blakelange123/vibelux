export interface DLCFixture {
  id?: string;
  price?: number;
  beamAngle?: number;
  spectrum?: {
    red?: number;
    blue?: number;
    green?: number;
    farRed?: number;
    white?: number;
  };
  dimensions?: {
  };
}