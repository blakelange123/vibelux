/**
 * Green Building XML (gbXML) Export Handler
 * Supports lighting and daylight analysis data export
 */

import type { 
  Fixture, Plant, Window, RoomObject 
} from '../components/designer/context/types';
import type { SpectralPowerDistribution } from '@/lib/spectrum-analysis';

// Local interface for daylight contribution
interface DaylightContribution {
  dli: number;
  peakPPFD: number;
  solarNoon: Date;
  hourlyPPFD: number[];
  windowContributions: { id: string; percentage: number }[];
}

export interface GbXMLSpace {
  id: string;
  name: string;
  area: number;
  volume: number;
  lightingPowerDensity: number;
  lightingSchedule?: string;
  surfaces: GbXMLSurface[];
}

export interface GbXMLSurface {
  id: string;
  type: 'Floor' | 'Ceiling' | 'Wall' | 'Window' | 'Door';
  area: number;
  azimuth?: number;
  tilt?: number;
  transmittance?: number;
  reflectance?: number;
  vertices: { x: number; y: number; z: number }[];
}

export interface GbXMLLuminaire {
  id: string;
  name: string;
  manufacturer?: string;
  catalog?: string;
  power: number;
  lightLossFactor: number;
  photometricData?: {
    lumens: number;
    efficacy: number;
    distribution: string;
    iesFile?: string;
  };
  position: { x: number; y: number; z: number };
  orientation: { x: number; y: number; z: number };
}

export interface GbXMLDaylightData {
  location: {
    latitude: number;
    longitude: number;
    elevation: number;
    timeZone: number;
  };
  weather?: {
    stationId: string;
    dataSource: string;
  };
  daylightSavings: boolean;
  northAxis: number;
}

export class GbXMLHandler {
  /**
   * Export to gbXML format
   */
  exportToGbXML(
    objects: RoomObject[],
    roomDimensions: { width: number; length: number; height: number },
    projectInfo?: {
      name?: string;
      author?: string;
      date?: Date;
      description?: string;
    },
    daylightData?: {
      location: { latitude: number; longitude: number };
      daylightContribution?: DaylightContribution;
    }
  ): string {
    const timestamp = (projectInfo?.date || new Date()).toISOString();
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<gbXML xmlns="http://www.gbxml.org/schema" ';
    xml += 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ';
    xml += 'xsi:schemaLocation="http://www.gbxml.org/schema http://www.gbxml.org/schema/6-01/GreenBuildingXML_Ver6.01.xsd" ';
    xml += 'version="6.01" ';
    xml += 'temperatureUnit="C" ';
    xml += 'lengthUnit="Meters" ';
    xml += 'areaUnit="SquareMeters" ';
    xml += 'volumeUnit="CubicMeters" ';
    xml += 'useSIUnitsForResults="true">\n';
    
    // Campus (site)
    xml += '  <Campus id="Campus1">\n';
    xml += `    <Name>${projectInfo?.name || 'Vibelux Project'}</Name>\n`;
    
    if (daylightData?.location) {
      xml += '    <Location>\n';
      xml += `      <Latitude>${daylightData.location.latitude}</Latitude>\n`;
      xml += `      <Longitude>${daylightData.location.longitude}</Longitude>\n`;
      xml += '      <Elevation>0</Elevation>\n';
      xml += '    </Location>\n';
    }
    
    // Building
    xml += '    <Building id="Building1" buildingType="Office">\n';
    xml += '      <Name>Growing Facility</Name>\n';
    xml += `      <Area>${roomDimensions.width * roomDimensions.length}</Area>\n`;
    
    // Space
    const spaceId = 'Space1';
    xml += this.exportSpace(spaceId, roomDimensions, objects);
    
    // Surfaces
    xml += this.exportSurfaces(roomDimensions, objects);
    
    xml += '    </Building>\n';
    xml += '  </Campus>\n';
    
    // Lighting Systems
    xml += '  <LightingSystem id="LightingSystem1">\n';
    xml += '    <Name>Horticultural Lighting System</Name>\n';
    
    // Export luminaires
    const fixtures = objects.filter(obj => obj.type === 'fixture') as Fixture[];
    fixtures.forEach((fixture, index) => {
      xml += this.exportLuminaire(fixture, index + 1);
    });
    
    xml += '  </LightingSystem>\n';
    
    // Photometric Data
    if (fixtures.some(f => f.model.ppf)) {
      xml += '  <PhotometricData>\n';
      fixtures.forEach((fixture, index) => {
        if (fixture.model.ppf) {
          xml += this.exportPhotometricData(fixture, index + 1);
        }
      });
      xml += '  </PhotometricData>\n';
    }
    
    // Daylight data
    if (daylightData?.daylightContribution) {
      xml += this.exportDaylightAnalysis(daylightData.daylightContribution);
    }
    
    // Document History
    xml += '  <DocumentHistory>\n';
    xml += '    <ProgramInfo>\n';
    xml += '      <CompanyName>Vibelux</CompanyName>\n';
    xml += '      <ProductName>Vibelux Lighting Designer</ProductName>\n';
    xml += '      <Version>1.0</Version>\n';
    xml += '    </ProgramInfo>\n';
    xml += `    <CreatedBy>${projectInfo?.author || 'Vibelux User'}</CreatedBy>\n`;
    xml += `    <CreatedDateTime>${timestamp}</CreatedDateTime>\n`;
    xml += '  </DocumentHistory>\n';
    
    xml += '</gbXML>\n';
    
    return xml;
  }

  /**
   * Export space definition
   */
  private exportSpace(
    spaceId: string,
    dimensions: { width: number; length: number; height: number },
    objects: RoomObject[]
  ): string {
    const area = dimensions.width * dimensions.length;
    const volume = area * dimensions.height;
    
    // Calculate lighting power density
    const fixtures = objects.filter(obj => obj.type === 'fixture' && obj.enabled) as Fixture[];
    const totalPower = fixtures.reduce((sum, f) => sum + f.model.wattage, 0);
    const lpd = area > 0 ? totalPower / area : 0;
    
    let xml = `      <Space id="${spaceId}" `;
    xml += 'spaceType="Office" ';
    xml += 'conditionType="HeatedAndCooled">\n';
    xml += '        <Name>Growing Area</Name>\n';
    xml += `        <Area>${area.toFixed(2)}</Area>\n`;
    xml += `        <Volume>${volume.toFixed(2)}</Volume>\n`;
    xml += `        <LightPowerPerArea unit="WattsPerSquareMeter">${lpd.toFixed(2)}</LightPowerPerArea>\n`;
    
    // Add space boundaries (surfaces)
    xml += '        <SpaceBoundary surfaceIdRef="Surface_Floor1">\n';
    xml += '          <PlanarGeometry>\n';
    xml += '            <PolyLoop>\n';
    xml += `              <CartesianPoint><Coordinate>0</Coordinate><Coordinate>0</Coordinate><Coordinate>0</Coordinate></CartesianPoint>\n`;
    xml += `              <CartesianPoint><Coordinate>${dimensions.width}</Coordinate><Coordinate>0</Coordinate><Coordinate>0</Coordinate></CartesianPoint>\n`;
    xml += `              <CartesianPoint><Coordinate>${dimensions.width}</Coordinate><Coordinate>${dimensions.length}</Coordinate><Coordinate>0</Coordinate></CartesianPoint>\n`;
    xml += `              <CartesianPoint><Coordinate>0</Coordinate><Coordinate>${dimensions.length}</Coordinate><Coordinate>0</Coordinate></CartesianPoint>\n`;
    xml += '            </PolyLoop>\n';
    xml += '          </PlanarGeometry>\n';
    xml += '        </SpaceBoundary>\n';
    
    xml += '      </Space>\n';
    
    return xml;
  }

  /**
   * Export surfaces
   */
  private exportSurfaces(
    dimensions: { width: number; length: number; height: number },
    objects: RoomObject[]
  ): string {
    let xml = '';
    
    // Floor
    xml += '      <Surface id="Surface_Floor1" surfaceType="SlabOnGrade">\n';
    xml += '        <Name>Floor</Name>\n';
    xml += '        <AdjacentSpaceId spaceIdRef="Space1"/>\n';
    xml += '        <RectangularGeometry>\n';
    xml += `          <Azimuth>0</Azimuth>\n`;
    xml += `          <Tilt>180</Tilt>\n`;
    xml += `          <Width>${dimensions.width}</Width>\n`;
    xml += `          <Height>${dimensions.length}</Height>\n`;
    xml += '          <CartesianPoint><Coordinate>0</Coordinate><Coordinate>0</Coordinate><Coordinate>0</Coordinate></CartesianPoint>\n';
    xml += '        </RectangularGeometry>\n';
    xml += '      </Surface>\n';
    
    // Ceiling
    xml += '      <Surface id="Surface_Ceiling1" surfaceType="Ceiling">\n';
    xml += '        <Name>Ceiling</Name>\n';
    xml += '        <AdjacentSpaceId spaceIdRef="Space1"/>\n';
    xml += '        <RectangularGeometry>\n';
    xml += `          <Azimuth>0</Azimuth>\n`;
    xml += `          <Tilt>0</Tilt>\n`;
    xml += `          <Width>${dimensions.width}</Width>\n`;
    xml += `          <Height>${dimensions.length}</Height>\n`;
    xml += `          <CartesianPoint><Coordinate>0</Coordinate><Coordinate>0</Coordinate><Coordinate>${dimensions.height}</Coordinate></CartesianPoint>\n`;
    xml += '        </RectangularGeometry>\n';
    xml += '      </Surface>\n';
    
    // Windows
    const windows = objects.filter(obj => obj.type === 'window');
    windows.forEach((window, index) => {
      xml += this.exportWindowObject(window, index + 1);
    });
    
    return xml;
  }

  /**
   * Export window object
   */
  private exportWindowObject(window: RoomObject, index: number): string {
    let xml = `      <Surface id="Surface_Window${index}" surfaceType="ExteriorWindow">\n`;
    xml += `        <Name>Window ${index}</Name>\n`;
    xml += '        <AdjacentSpaceId spaceIdRef="Space1"/>\n';
    
    // Window construction with transmittance
    xml += '        <Construction>\n';
    xml += `          <U-value unit="WPerSquareMeterK">2.5</U-value>\n`;
    xml += `          <Transmittance unit="Fraction">\n`;
    xml += `            <Visible>0.85</Visible>\n`;
    xml += `            <Solar>0.72</Solar>\n`;
    xml += `          </Transmittance>\n`;
    xml += '        </Construction>\n';
    
    // Window geometry
    const azimuth = 0; // Default to north
    xml += '        <RectangularGeometry>\n';
    xml += `          <Azimuth>${azimuth}</Azimuth>\n`;
    xml += `          <Tilt>90</Tilt>\n`;
    xml += `          <Width>${window.width}</Width>\n`;
    xml += `          <Height>${window.height}</Height>\n`;
    xml += `          <CartesianPoint><Coordinate>${window.x}</Coordinate><Coordinate>${window.y}</Coordinate><Coordinate>${window.z}</Coordinate></CartesianPoint>\n`;
    xml += '        </RectangularGeometry>\n';
    xml += '      </Surface>\n';
    
    return xml;
  }

  /**
   * Export luminaire
   */
  private exportLuminaire(fixture: Fixture, index: number): string {
    let xml = `    <Luminaire id="Luminaire${index}">\n`;
    xml += `      <Name>${fixture.customName || fixture.model.name}</Name>\n`;
    
    if (fixture.model.manufacturer) {
      xml += `      <Manufacturer>${fixture.model.manufacturer}</Manufacturer>\n`;
    }
    
    xml += `      <Power unit="Watts">${fixture.model.wattage}</Power>\n`;
    xml += `      <LightLossFactor>${fixture.dimmingLevel ? fixture.dimmingLevel / 100 : 1.0}</LightLossFactor>\n`;
    
    // Position
    xml += '      <Position>\n';
    xml += `        <CartesianPoint><Coordinate>${fixture.x}</Coordinate><Coordinate>${fixture.y}</Coordinate><Coordinate>${fixture.z}</Coordinate></CartesianPoint>\n`;
    xml += '      </Position>\n';
    
    // Orientation (pointing down by default)
    xml += '      <Orientation>\n';
    xml += '        <CartesianPoint><Coordinate>0</Coordinate><Coordinate>0</Coordinate><Coordinate>-1</Coordinate></CartesianPoint>\n';
    xml += '      </Orientation>\n';
    
    // Photometric reference if available
    if (fixture.model.ppf) {
      xml += `      <PhotometricRef photometricIdRef="Photometric${index}"/>\n`;
    }
    
    xml += '    </Luminaire>\n';
    
    return xml;
  }

  /**
   * Export photometric data
   */
  private exportPhotometricData(fixture: Fixture, index: number): string {
    let xml = `    <Photometric id="Photometric${index}">\n`;
    xml += `      <Name>${fixture.model.name} Photometric Data</Name>\n`;
    
    // Basic photometric properties
    xml += '      <LuminousFlux unit="Lumens">';
    // Convert PPF to approximate lumens (rough conversion for visualization)
    xml += `${(fixture.model.ppf * 4.6).toFixed(0)}`;
    xml += '</LuminousFlux>\n';
    
    if (fixture.model.efficacy) {
      xml += `      <LuminousEfficacy unit="LumensPerWatt">${(fixture.model.efficacy * 4.6).toFixed(1)}</LuminousEfficacy>\n`;
    }
    
    // Beam angle
    xml += `      <BeamAngle unit="Degrees">${fixture.model.beamAngle}</BeamAngle>\n`;
    
    // Color temperature (approximate from spectrum type)
    const colorTemp = this.getColorTempFromSpectrum(fixture.model.spectrum);
    if (colorTemp) {
      xml += `      <ColorTemperature unit="Kelvin">${colorTemp}</ColorTemperature>\n`;
    }
    
    // CRI (approximate)
    xml += '      <ColorRenderingIndex>85</ColorRenderingIndex>\n';
    
    // Distribution type
    xml += `      <DistributionType>${this.getDistributionType(fixture.model.beamAngle)}</DistributionType>\n`;
    
    // Custom properties for horticultural metrics
    xml += '      <CustomProperties>\n';
    xml += `        <Property name="PPF" unit="umol/s">${fixture.model.ppf}</Property>\n`;
    
    if (fixture.model.ppfd) {
      xml += `        <Property name="PPFD" unit="umol/m2/s">${fixture.model.ppfd}</Property>\n`;
    }
    
    if (fixture.model.spectrum) {
      xml += `        <Property name="Spectrum">${fixture.model.spectrum}</Property>\n`;
    }
    
    if (fixture.model.isDLC) {
      xml += '        <Property name="DLC_Listed">true</Property>\n';
    }
    
    xml += '      </CustomProperties>\n';
    
    xml += '    </Photometric>\n';
    
    return xml;
  }

  /**
   * Export daylight analysis results
   */
  private exportDaylightAnalysis(daylightContribution: DaylightContribution): string {
    let xml = '  <DaylightAnalysis>\n';
    xml += '    <AnalysisType>Annual</AnalysisType>\n';
    xml += `    <DaylightFactor>${(daylightContribution.dli / 50 * 100).toFixed(1)}</DaylightFactor>\n`;
    xml += `    <DLI unit="mol/m2/day">${daylightContribution.dli.toFixed(1)}</DLI>\n`;
    
    // Peak values
    xml += '    <PeakValues>\n';
    xml += `      <MaxPPFD unit="umol/m2/s">${daylightContribution.peakPPFD.toFixed(0)}</MaxPPFD>\n`;
    xml += `      <OccursAt>${daylightContribution.solarNoon.toISOString()}</OccursAt>\n`;
    xml += '    </PeakValues>\n';
    
    // Distribution over time
    xml += '    <HourlyDistribution>\n';
    daylightContribution.hourlyPPFD.forEach((ppfd, hour) => {
      xml += `      <Hour time="${hour}:00">${ppfd.toFixed(0)}</Hour>\n`;
    });
    xml += '    </HourlyDistribution>\n';
    
    xml += '  </DaylightAnalysis>\n';
    
    return xml;
  }

  /**
   * Get azimuth angle from orientation
   */
  private getAzimuthFromOrientation(orientation: string): number {
    const orientationMap: Record<string, number> = {
      'north': 0,
      'northeast': 45,
      'east': 90,
      'southeast': 135,
      'south': 180,
      'southwest': 225,
      'west': 270,
      'northwest': 315
    };
    
    return orientationMap[orientation.toLowerCase()] || 0;
  }

  /**
   * Get approximate color temperature from spectrum type
   */
  private getColorTempFromSpectrum(spectrum?: string): number | null {
    if (!spectrum) return null;
    
    const spectrumMap: Record<string, number> = {
      'full spectrum': 5000,
      'warm white': 3000,
      'cool white': 6500,
      'red/blue': 4500,
      'enhanced red': 3500,
      'vegetative': 6000,
      'flowering': 3000
    };
    
    return spectrumMap[spectrum.toLowerCase()] || null;
  }

  /**
   * Get distribution type from beam angle
   */
  private getDistributionType(beamAngle: number): string {
    if (beamAngle < 30) return 'Narrow';
    if (beamAngle < 60) return 'Medium';
    if (beamAngle < 90) return 'Wide';
    return 'VeryWide';
  }

  /**
   * Parse gbXML file (basic implementation)
   */
  async parseGbXML(xmlContent: string): Promise<{
    spaces: GbXMLSpace[];
    luminaires: GbXMLLuminaire[];
    daylightData?: GbXMLDaylightData;
  }> {
    // This would require a proper XML parser
    // For now, return a basic structure
    console.warn('gbXML import not fully implemented');
    
    return {
      spaces: [],
      luminaires: []
    };
  }
}

// Export singleton instance
export const gbXMLHandler = new GbXMLHandler();