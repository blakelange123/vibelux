/**
 * Cannabis Track & Trace Integration Service
 * Supports METRC and BioTrackTHC APIs for automated harvest data import
 */

interface TrackTraceConfig {
  provider: 'METRC' | 'BIOTRACK';
  apiKey: string;
  licenseNumber: string;
  baseUrl?: string;
}

interface HarvestData {
  batchId: string;
  strain: string;
  harvestDate: Date;
  wetWeight: number; // grams
  dryWeight: number; // grams
  roomName?: string;
  testResults?: {
    thc: number;
    cbd: number;
    terpenes?: number;
  };
  soldTo?: string;
  salePrice?: number;
}

export class CannabisTrackTraceService {
  private config: TrackTraceConfig;

  constructor(config: TrackTraceConfig) {
    this.config = config;
  }

  /**
   * Fetch harvest data from track & trace system
   */
  async fetchHarvestData(startDate: Date, endDate?: Date): Promise<HarvestData[]> {
    switch (this.config.provider) {
      case 'METRC':
        return this.fetchMetrcHarvests(startDate, endDate);
      case 'BIOTRACK':
        return this.fetchBioTrackHarvests(startDate, endDate);
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  /**
   * METRC API Integration
   */
  private async fetchMetrcHarvests(startDate: Date, endDate?: Date): Promise<HarvestData[]> {
    const baseUrl = this.config.baseUrl || 'https://api-ca.metrc.com';
    const headers = {
      'Authorization': `Basic ${Buffer.from(`${this.config.apiKey}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    };

    try {
      // Fetch harvest data from METRC
      const harvestsResponse = await fetch(
        `${baseUrl}/harvests/v1/active?licenseNumber=${this.config.licenseNumber}&lastModifiedStart=${startDate.toISOString()}&lastModifiedEnd=${endDate?.toISOString() || new Date().toISOString()}`,
        { headers }
      );

      if (!harvestsResponse.ok) {
        throw new Error(`METRC API error: ${harvestsResponse.statusText}`);
      }

      const metrcHarvests = await harvestsResponse.json();

      // Transform METRC data to our format
      const harvests: HarvestData[] = [];

      for (const harvest of metrcHarvests) {
        // Get package data for this harvest to find sales
        const packagesResponse = await fetch(
          `${baseUrl}/packages/v1/active?licenseNumber=${this.config.licenseNumber}&harvestId=${harvest.Id}`,
          { headers }
        );

        let saleData = null;
        if (packagesResponse.ok) {
          const packages = await packagesResponse.json();
          // Look for sold packages
          const soldPackages = packages.filter((pkg: any) => pkg.PackageState === 'Sold');
          if (soldPackages.length > 0) {
            saleData = {
              soldTo: soldPackages[0].ReceiverFacilityName,
              // METRC doesn't provide sale price directly, would need to query sales receipts
            };
          }
        }

        harvests.push({
          batchId: harvest.Name,
          strain: harvest.StrainName || 'Unknown',
          harvestDate: new Date(harvest.HarvestStartDate),
          wetWeight: harvest.WetWeight * 453.592, // Convert lbs to grams
          dryWeight: harvest.DryWeight * 453.592, // Convert lbs to grams
          roomName: harvest.DryingRoomName,
          testResults: harvest.LabTestingState === 'TestPassed' ? {
            thc: harvest.THCPercent || 0,
            cbd: harvest.CBDPercent || 0,
          } : undefined,
          soldTo: saleData?.soldTo,
        });
      }

      return harvests;
    } catch (error) {
      console.error('METRC API error:', error);
      throw new Error(`Failed to fetch METRC data: ${error.message}`);
    }
  }

  /**
   * BioTrackTHC API Integration
   */
  private async fetchBioTrackHarvests(startDate: Date, endDate?: Date): Promise<HarvestData[]> {
    const baseUrl = this.config.baseUrl || 'https://api.biotrack.com';
    
    try {
      // BioTrack uses session-based auth
      const loginResponse = await fetch(`${baseUrl}/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.config.apiKey,
          password: this.config.licenseNumber,
        }),
      });

      if (!loginResponse.ok) {
        throw new Error('BioTrack login failed');
      }

      const { sessionid } = await loginResponse.json();

      // Fetch harvest data
      const harvestsResponse = await fetch(`${baseUrl}/v1/sync/plant_harvest`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': `sessionid=${sessionid}`,
        },
        body: JSON.stringify({
          start_time: Math.floor(startDate.getTime() / 1000),
          end_time: endDate ? Math.floor(endDate.getTime() / 1000) : Math.floor(Date.now() / 1000),
        }),
      });

      if (!harvestsResponse.ok) {
        throw new Error(`BioTrack API error: ${harvestsResponse.statusText}`);
      }

      const bioTrackHarvests = await harvestsResponse.json();

      // Transform BioTrack data to our format
      return bioTrackHarvests.data.map((harvest: any) => ({
        batchId: harvest.id.toString(),
        strain: harvest.strain || 'Unknown',
        harvestDate: new Date(harvest.sessiontime * 1000),
        wetWeight: parseFloat(harvest.wet_weight) * 1000, // Convert kg to grams
        dryWeight: parseFloat(harvest.dry_weight) * 1000, // Convert kg to grams
        roomName: harvest.room,
        testResults: harvest.thc_percent ? {
          thc: parseFloat(harvest.thc_percent),
          cbd: parseFloat(harvest.cbd_percent || '0'),
        } : undefined,
      }));
    } catch (error) {
      console.error('BioTrack API error:', error);
      throw new Error(`Failed to fetch BioTrack data: ${error.message}`);
    }
  }

  /**
   * Transform track & trace data to match our database schema
   */
  transformToHarvestBatch(data: HarvestData, facilityId: string, zoneId?: string) {
    return {
      facilityId,
      batchNumber: data.batchId,
      strain: data.strain,
      harvestDate: data.harvestDate,
      actualYield: data.dryWeight / 1000, // Convert to kg
      wetWeight: data.wetWeight / 1000, // Convert to kg
      zoneId,
      qualityGrade: this.determineQualityGrade(data.testResults),
      status: 'COMPLETED',
      metadata: {
        source: this.config.provider,
        importedAt: new Date(),
        testResults: data.testResults,
        roomName: data.roomName,
      },
      sales: data.soldTo ? {
        create: {
          customer: data.soldTo,
          quantity: data.dryWeight / 1000,
          pricePerUnit: data.salePrice || 0,
          totalPrice: (data.salePrice || 0) * (data.dryWeight / 1000),
          saleDate: data.harvestDate,
        }
      } : undefined,
    };
  }

  /**
   * Determine quality grade based on test results
   */
  private determineQualityGrade(testResults?: HarvestData['testResults']): string {
    if (!testResults) return 'B';
    
    const totalCannabinoids = (testResults.thc || 0) + (testResults.cbd || 0);
    
    if (totalCannabinoids >= 25) return 'A+';
    if (totalCannabinoids >= 20) return 'A';
    if (totalCannabinoids >= 15) return 'B';
    return 'C';
  }
}

/**
 * State-specific track & trace configurations
 */
export const TRACK_TRACE_CONFIGS = {
  // California - METRC
  CA: {
    provider: 'METRC' as const,
    baseUrl: 'https://api-ca.metrc.com',
    requiredLicense: true,
  },
  // Colorado - METRC
  CO: {
    provider: 'METRC' as const,
    baseUrl: 'https://api-co.metrc.com',
    requiredLicense: true,
  },
  // Oregon - METRC
  OR: {
    provider: 'METRC' as const,
    baseUrl: 'https://api-or.metrc.com',
    requiredLicense: true,
  },
  // Washington - BioTrackTHC
  WA: {
    provider: 'BIOTRACK' as const,
    baseUrl: 'https://wa.biotrackthc.net/api',
    requiredLicense: true,
  },
  // Illinois - BioTrackTHC
  IL: {
    provider: 'BIOTRACK' as const,
    baseUrl: 'https://il.biotrackthc.net/api',
    requiredLicense: true,
  },
  // Michigan - METRC
  MI: {
    provider: 'METRC' as const,
    baseUrl: 'https://api-mi.metrc.com',
    requiredLicense: true,
  },
  // Massachusetts - METRC
  MA: {
    provider: 'METRC' as const,
    baseUrl: 'https://api-ma.metrc.com',
    requiredLicense: true,
  },
  // Nevada - METRC
  NV: {
    provider: 'METRC' as const,
    baseUrl: 'https://api-nv.metrc.com',
    requiredLicense: true,
  },
  // Alaska - METRC
  AK: {
    provider: 'METRC' as const,
    baseUrl: 'https://api-ak.metrc.com',
    requiredLicense: true,
  },
  // Arizona - METRC
  AZ: {
    provider: 'METRC' as const,
    baseUrl: 'https://api-az.metrc.com',
    requiredLicense: true,
  },
};

/**
 * Factory function to create track & trace service based on state
 */
export function createTrackTraceService(
  state: keyof typeof TRACK_TRACE_CONFIGS,
  apiKey: string,
  licenseNumber: string
): CannabisTrackTraceService {
  const config = TRACK_TRACE_CONFIGS[state];
  
  if (!config) {
    throw new Error(`Track & trace not configured for state: ${state}`);
  }

  return new CannabisTrackTraceService({
    provider: config.provider,
    apiKey,
    licenseNumber,
    baseUrl: config.baseUrl,
  });
}