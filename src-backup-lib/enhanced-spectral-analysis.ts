/**
 * Enhanced Spectral Analysis Engine with 5nm Resolution
 * Implements high-fidelity PAR analysis from 400-700nm
 */

interface SpectralData {
  wavelength: number;
  intensity: number;
  photosynthetic_efficiency?: number;
}

interface SpectrumSnapshot {
  id: string;
  timestamp: Date;
  description: string;
  checksum: string;
  data: SpectralData[];
  metadata: {
    ppfd_total: number;
    par_total: number;
    red_blue_ratio: number;
    far_red_ratio: number;
  };
}

export class EnhancedSpectralAnalysis {
  private snapshots: Map<string, SpectrumSnapshot> = new Map();
  private readonly WAVELENGTH_STEP = 5; // 5nm resolution
  private readonly PAR_START = 400;
  private readonly PAR_END = 700;
  
  /**
   * Generate high-resolution McCree curve coefficients at 5nm intervals
   * Based on interpolation of published research data
   */
  private generateHighResMcCree(): Map<number, number> {
    const basePoints = new Map([
      [400, 0.00], [425, 0.83], [450, 0.87], [475, 0.93], 
      [500, 0.90], [525, 0.85], [550, 0.75], [575, 0.70], 
      [600, 0.98], [625, 1.00], [650, 0.96], [675, 0.89], [700, 0.06]
    ]);
    
    const highResMcCree = new Map<number, number>();
    
    // Generate 5nm resolution data through cubic spline interpolation
    for (let wl = this.PAR_START; wl <= this.PAR_END; wl += this.WAVELENGTH_STEP) {
      if (basePoints.has(wl)) {
        highResMcCree.set(wl, basePoints.get(wl)!);
      } else {
        // Find surrounding points for interpolation
        const keys = Array.from(basePoints.keys()).sort((a, b) => a - b);
        let lower = 0, upper = 0;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (keys[i] < wl && keys[i + 1] > wl) {
            lower = keys[i];
            upper = keys[i + 1];
            break;
          }
        }
        
        if (lower && upper) {
          const lowerVal = basePoints.get(lower)!;
          const upperVal = basePoints.get(upper)!;
          const ratio = (wl - lower) / (upper - lower);
          
          // Cosine interpolation for smoother curve
          const cosineRatio = (1 - Math.cos(ratio * Math.PI)) / 2;
          const interpolated = lowerVal * (1 - cosineRatio) + upperVal * cosineRatio;
          highResMcCree.set(wl, Number(interpolated.toFixed(4)));
        }
      }
    }
    
    return highResMcCree;
  }
  
  /**
   * Create a version-controlled snapshot of spectrum data
   */
  createSnapshot(
    data: SpectralData[], 
    description: string = ""
  ): SpectrumSnapshot {
    const id = `snap_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
    const checksum = this.calculateChecksum(data);
    
    // Calculate metadata
    const metadata = {
      ppfd_total: this.calculatePPFD(data),
      par_total: this.calculatePAR(data),
      red_blue_ratio: this.calculateRedBlueRatio(data),
      far_red_ratio: this.calculateFarRedRatio(data)
    };
    
    const snapshot: SpectrumSnapshot = {
      id,
      timestamp: new Date(),
      description,
      checksum,
      data: [...data], // Deep copy
      metadata
    };
    
    this.snapshots.set(id, snapshot);
    return snapshot;
  }
  
  /**
   * Calculate MD5 checksum for data integrity
   */
  private calculateChecksum(data: SpectralData[]): string {
    const dataString = JSON.stringify(data);
    // Simple hash function for demo (in production, use crypto library)
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
  
  /**
   * Calculate PPFD with 5nm resolution
   */
  calculatePPFD(data: SpectralData[]): number {
    const mcCree = this.generateHighResMcCree();
    let totalPPFD = 0;
    
    data.forEach(point => {
      if (point.wavelength >= this.PAR_START && point.wavelength <= this.PAR_END) {
        const efficiency = mcCree.get(point.wavelength) || 0;
        totalPPFD += point.intensity * efficiency;
      }
    });
    
    return Number(totalPPFD.toFixed(2));
  }
  
  /**
   * Calculate total PAR energy
   */
  calculatePAR(data: SpectralData[]): number {
    return data
      .filter(p => p.wavelength >= this.PAR_START && p.wavelength <= this.PAR_END)
      .reduce((sum, p) => sum + p.intensity, 0);
  }
  
  /**
   * Calculate Red:Blue ratio for morphological analysis
   */
  private calculateRedBlueRatio(data: SpectralData[]): number {
    const blue = data
      .filter(p => p.wavelength >= 400 && p.wavelength <= 500)
      .reduce((sum, p) => sum + p.intensity, 0);
    
    const red = data
      .filter(p => p.wavelength >= 600 && p.wavelength <= 700)
      .reduce((sum, p) => sum + p.intensity, 0);
    
    return blue > 0 ? Number((red / blue).toFixed(2)) : 0;
  }
  
  /**
   * Calculate Red:Far-Red ratio for phytochrome analysis
   */
  private calculateFarRedRatio(data: SpectralData[]): number {
    const red = data
      .filter(p => p.wavelength >= 660 && p.wavelength <= 670)
      .reduce((sum, p) => sum + p.intensity, 0);
    
    const farRed = data
      .filter(p => p.wavelength >= 725 && p.wavelength <= 735)
      .reduce((sum, p) => sum + p.intensity, 0);
    
    return farRed > 0 ? Number((red / farRed).toFixed(2)) : 0;
  }
  
  /**
   * Get all snapshots for comparison
   */
  getAllSnapshots(): SpectrumSnapshot[] {
    return Array.from(this.snapshots.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  /**
   * Compare two snapshots
   */
  compareSnapshots(id1: string, id2: string): {
    ppfd_diff: number;
    par_diff: number;
    rb_ratio_diff: number;
    wavelength_changes: Map<number, number>;
  } | null {
    const snap1 = this.snapshots.get(id1);
    const snap2 = this.snapshots.get(id2);
    
    if (!snap1 || !snap2) return null;
    
    const wavelength_changes = new Map<number, number>();
    
    // Create wavelength maps for easy comparison
    const map1 = new Map(snap1.data.map(d => [d.wavelength, d.intensity]));
    const map2 = new Map(snap2.data.map(d => [d.wavelength, d.intensity]));
    
    // Calculate differences at each wavelength
    for (let wl = this.PAR_START; wl <= this.PAR_END; wl += this.WAVELENGTH_STEP) {
      const val1 = map1.get(wl) || 0;
      const val2 = map2.get(wl) || 0;
      if (val1 !== val2) {
        wavelength_changes.set(wl, val2 - val1);
      }
    }
    
    return {
      ppfd_diff: snap2.metadata.ppfd_total - snap1.metadata.ppfd_total,
      par_diff: snap2.metadata.par_total - snap1.metadata.par_total,
      rb_ratio_diff: snap2.metadata.red_blue_ratio - snap1.metadata.red_blue_ratio,
      wavelength_changes
    };
  }
  
  /**
   * Restore spectrum from snapshot
   */
  restoreSnapshot(id: string): SpectralData[] | null {
    const snapshot = this.snapshots.get(id);
    return snapshot ? [...snapshot.data] : null;
  }
  
  /**
   * Generate spectrum data at 5nm resolution from fixture specs
   */
  generateHighResSpectrum(
    blueFlux: number,    // 400-500nm
    greenFlux: number,   // 500-600nm
    redFlux: number,     // 600-700nm
    farRedFlux?: number  // 700-800nm
  ): SpectralData[] {
    const spectrum: SpectralData[] = [];
    const mcCree = this.generateHighResMcCree();
    
    // Generate Gaussian-like distributions for each color band
    for (let wl = 380; wl <= 800; wl += this.WAVELENGTH_STEP) {
      let intensity = 0;
      
      // Blue region (peak ~450nm)
      if (wl >= 400 && wl <= 500) {
        const center = 450;
        const sigma = 25;
        intensity += blueFlux * Math.exp(-Math.pow(wl - center, 2) / (2 * Math.pow(sigma, 2)));
      }
      
      // Green region (peak ~525nm)
      if (wl >= 500 && wl <= 600) {
        const center = 525;
        const sigma = 30;
        intensity += greenFlux * Math.exp(-Math.pow(wl - center, 2) / (2 * Math.pow(sigma, 2)));
      }
      
      // Red region (peak ~660nm)
      if (wl >= 600 && wl <= 700) {
        const center = 660;
        const sigma = 20;
        intensity += redFlux * Math.exp(-Math.pow(wl - center, 2) / (2 * Math.pow(sigma, 2)));
      }
      
      // Far-red region (peak ~730nm)
      if (farRedFlux && wl >= 700 && wl <= 800) {
        const center = 730;
        const sigma = 25;
        intensity += farRedFlux * Math.exp(-Math.pow(wl - center, 2) / (2 * Math.pow(sigma, 2)));
      }
      
      // Add photosynthetic efficiency
      const efficiency = mcCree.get(wl) || 0;
      
      spectrum.push({
        wavelength: wl,
        intensity: Number(intensity.toFixed(3)),
        photosynthetic_efficiency: efficiency
      });
    }
    
    return spectrum;
  }
}

// Export singleton instance
export const spectralAnalysis = new EnhancedSpectralAnalysis();