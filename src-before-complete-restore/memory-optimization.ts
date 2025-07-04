/**
 * Memory Optimization for Large Dataset Handling
 * Implements precision downcasting and efficient data structures
 */

interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  savingsPercent: number;
  columnsOptimized: string[];
  warnings: string[];
}

interface DataTypeRange {
  min: number;
  max: number;
  recommendedType: string;
  bytesPerValue: number;
}

export class MemoryOptimizer {
  private readonly typeRanges: Map<string, DataTypeRange> = new Map([
    ['int8', { min: -128, max: 127, recommendedType: 'Int8Array', bytesPerValue: 1 }],
    ['uint8', { min: 0, max: 255, recommendedType: 'Uint8Array', bytesPerValue: 1 }],
    ['int16', { min: -32768, max: 32767, recommendedType: 'Int16Array', bytesPerValue: 2 }],
    ['uint16', { min: 0, max: 65535, recommendedType: 'Uint16Array', bytesPerValue: 2 }],
    ['int32', { min: -2147483648, max: 2147483647, recommendedType: 'Int32Array', bytesPerValue: 4 }],
    ['uint32', { min: 0, max: 4294967295, recommendedType: 'Uint32Array', bytesPerValue: 4 }],
    ['float32', { min: -3.4e38, max: 3.4e38, recommendedType: 'Float32Array', bytesPerValue: 4 }],
    ['float64', { min: -1.7e308, max: 1.7e308, recommendedType: 'Float64Array', bytesPerValue: 8 }]
  ]);
  
  /**
   * Optimize array memory usage by downcasting to appropriate type
   */
  optimizeArray(data: number[], name: string = 'data'): {
    optimized: ArrayBufferView;
    originalBytes: number;
    optimizedBytes: number;
    type: string;
  } {
    const originalBytes = data.length * 8; // Assuming Float64 originally
    
    // Analyze data range
    const min = Math.min(...data);
    const max = Math.max(...data);
    const hasDecimals = data.some(val => val % 1 !== 0);
    
    // Determine optimal type
    let optimalType = 'float64';
    let optimalBytes = 8;
    
    if (!hasDecimals) {
      // Integer optimization
      if (min >= 0) {
        // Unsigned integers
        if (max <= 255) {
          optimalType = 'uint8';
          optimalBytes = 1;
        } else if (max <= 65535) {
          optimalType = 'uint16';
          optimalBytes = 2;
        } else if (max <= 4294967295) {
          optimalType = 'uint32';
          optimalBytes = 4;
        }
      } else {
        // Signed integers
        if (min >= -128 && max <= 127) {
          optimalType = 'int8';
          optimalBytes = 1;
        } else if (min >= -32768 && max <= 32767) {
          optimalType = 'int16';
          optimalBytes = 2;
        } else if (min >= -2147483648 && max <= 2147483647) {
          optimalType = 'int32';
          optimalBytes = 4;
        }
      }
    } else {
      // Float optimization
      const precision = this.calculateRequiredPrecision(data);
      if (precision <= 7) {
        optimalType = 'float32';
        optimalBytes = 4;
      }
    }
    
    // Create optimized array
    const optimized = this.createTypedArray(data, optimalType);
    const optimizedBytes = data.length * optimalBytes;
    
    return {
      optimized,
      originalBytes,
      optimizedBytes,
      type: optimalType
    };
  }
  
  /**
   * Optimize 2D grid data structure
   */
  optimizeGrid(
    grid: number[][],
    options?: {
      precision?: number;
      sparse?: boolean;
    }
  ): {
    data: ArrayBufferView | Map<string, number>;
    metadata: {
      rows: number;
      cols: number;
      type: string;
      sparse: boolean;
      nonZeroCount?: number;
    };
    savings: number;
  } {
    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    const totalElements = rows * cols;
    const originalBytes = totalElements * 8;
    
    // Check if sparse optimization is beneficial
    let nonZeroCount = 0;
    const flatData: number[] = [];
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const value = grid[i]?.[j] || 0;
        flatData.push(value);
        if (value !== 0) nonZeroCount++;
      }
    }
    
    const sparsityRatio = nonZeroCount / totalElements;
    const useSparse = options?.sparse !== false && sparsityRatio < 0.1;
    
    if (useSparse) {
      // Sparse matrix representation
      const sparseMap = new Map<string, number>();
      
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const value = grid[i]?.[j] || 0;
          if (value !== 0) {
            sparseMap.set(`${i},${j}`, value);
          }
        }
      }
      
      // Estimate sparse storage size
      const sparseBytes = nonZeroCount * (4 + 4 + 8); // row + col + value
      
      return {
        data: sparseMap,
        metadata: {
          rows,
          cols,
          type: 'sparse',
          sparse: true,
          nonZeroCount
        },
        savings: ((originalBytes - sparseBytes) / originalBytes) * 100
      };
    } else {
      // Dense optimized array
      const { optimized, optimizedBytes, type } = this.optimizeArray(flatData);
      
      return {
        data: optimized,
        metadata: {
          rows,
          cols,
          type,
          sparse: false
        },
        savings: ((originalBytes - optimizedBytes) / originalBytes) * 100
      };
    }
  }
  
  /**
   * Optimize lighting fixture data
   */
  optimizeLightingData(fixtures: Array<{
    id: string;
    x: number;
    y: number;
    z: number;
    ppfd: number;
    watts: number;
    spectrum: Record<number, number>;
  }>): OptimizationResult {
    const result: OptimizationResult = {
      originalSize: 0,
      optimizedSize: 0,
      savingsPercent: 0,
      columnsOptimized: [],
      warnings: []
    };
    
    // Calculate original size
    const fixtureCount = fixtures.length;
    result.originalSize = fixtureCount * (
      8 + // id (assuming 8 chars average)
      8 * 3 + // x, y, z as float64
      8 + // ppfd as float64
      8 + // watts as float64
      8 * 10 // spectrum (assuming 10 wavelengths)
    );
    
    // Optimize numeric arrays
    const positions = {
      x: new Float32Array(fixtureCount),
      y: new Float32Array(fixtureCount),
      z: new Float32Array(fixtureCount)
    };
    
    const ppfdArray = new Uint16Array(fixtureCount); // 0-65535 range
    const wattsArray = new Uint16Array(fixtureCount); // 0-65535 range
    
    // Process fixtures
    fixtures.forEach((fixture, i) => {
      positions.x[i] = fixture.x;
      positions.y[i] = fixture.y;
      positions.z[i] = fixture.z;
      ppfdArray[i] = Math.round(fixture.ppfd);
      wattsArray[i] = Math.round(fixture.watts);
    });
    
    result.columnsOptimized = ['x', 'y', 'z', 'ppfd', 'watts'];
    
    // Optimize spectrum data
    const spectrumKeys = new Set<number>();
    fixtures.forEach(f => {
      Object.keys(f.spectrum).forEach(k => spectrumKeys.add(Number(k)));
    });
    
    const spectrumArrays = new Map<number, Uint8Array>();
    spectrumKeys.forEach(wavelength => {
      const values = fixtures.map(f => Math.round((f.spectrum[wavelength] || 0) * 255));
      spectrumArrays.set(wavelength, new Uint8Array(values));
    });
    
    // Calculate optimized size
    result.optimizedSize = 
      fixtureCount * 8 + // IDs
      fixtureCount * 4 * 3 + // positions as float32
      fixtureCount * 2 + // ppfd as uint16
      fixtureCount * 2 + // watts as uint16
      fixtureCount * spectrumKeys.size; // spectrum as uint8
    
    result.savingsPercent = ((result.originalSize - result.optimizedSize) / result.originalSize) * 100;
    
    // Add warnings if precision loss might be significant
    if (fixtures.some(f => f.ppfd > 65535)) {
      result.warnings.push('PPFD values exceed uint16 range, clamping to 65535');
    }
    
    return result;
  }
  
  /**
   * Stream processing for very large datasets
   */
  async* streamProcess<T>(
    data: T[],
    batchSize: number = 1000,
    processor: (batch: T[]) => Promise<any>
  ): AsyncGenerator<any> {
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      yield await processor(batch);
      
      // Allow event loop to process other tasks
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  /**
   * Compress time series data using delta encoding
   */
  compressTimeSeries(
    data: Array<{ timestamp: number; value: number }>,
    precision: number = 2
  ): {
    compressed: {
      firstTimestamp: number;
      firstValue: number;
      deltaTime: Int32Array;
      deltaValue: Int16Array;
    };
    originalSize: number;
    compressedSize: number;
  } {
    if (data.length === 0) {
      return {
        compressed: {
          firstTimestamp: 0,
          firstValue: 0,
          deltaTime: new Int32Array(0),
          deltaValue: new Int16Array(0)
        },
        originalSize: 0,
        compressedSize: 0
      };
    }
    
    const multiplier = Math.pow(10, precision);
    const deltaTime = new Int32Array(data.length - 1);
    const deltaValue = new Int16Array(data.length - 1);
    
    // Calculate deltas
    for (let i = 1; i < data.length; i++) {
      deltaTime[i - 1] = data[i].timestamp - data[i - 1].timestamp;
      deltaValue[i - 1] = Math.round((data[i].value - data[i - 1].value) * multiplier);
    }
    
    const originalSize = data.length * 16; // 8 bytes timestamp + 8 bytes value
    const compressedSize = 16 + (data.length - 1) * 6; // first values + deltas
    
    return {
      compressed: {
        firstTimestamp: data[0].timestamp,
        firstValue: data[0].value,
        deltaTime,
        deltaValue
      },
      originalSize,
      compressedSize
    };
  }
  
  /**
   * Decompress time series data
   */
  decompressTimeSeries(
    compressed: {
      firstTimestamp: number;
      firstValue: number;
      deltaTime: Int32Array;
      deltaValue: Int16Array;
    },
    precision: number = 2
  ): Array<{ timestamp: number; value: number }> {
    const multiplier = Math.pow(10, precision);
    const result: Array<{ timestamp: number; value: number }> = [];
    
    // First value
    result.push({
      timestamp: compressed.firstTimestamp,
      value: compressed.firstValue
    });
    
    // Reconstruct from deltas
    for (let i = 0; i < compressed.deltaTime.length; i++) {
      const prevPoint = result[i];
      result.push({
        timestamp: prevPoint.timestamp + compressed.deltaTime[i],
        value: prevPoint.value + (compressed.deltaValue[i] / multiplier)
      });
    }
    
    return result;
  }
  
  /**
   * Calculate required precision for float values
   */
  private calculateRequiredPrecision(data: number[]): number {
    let maxPrecision = 0;
    
    for (const value of data) {
      const str = value.toString();
      const decimalIndex = str.indexOf('.');
      if (decimalIndex !== -1) {
        const precision = str.length - decimalIndex - 1;
        maxPrecision = Math.max(maxPrecision, precision);
      }
    }
    
    return maxPrecision;
  }
  
  /**
   * Create typed array based on type string
   */
  private createTypedArray(data: number[], type: string): ArrayBufferView {
    switch (type) {
      case 'int8': return new Int8Array(data);
      case 'uint8': return new Uint8Array(data);
      case 'int16': return new Int16Array(data);
      case 'uint16': return new Uint16Array(data);
      case 'int32': return new Int32Array(data);
      case 'uint32': return new Uint32Array(data);
      case 'float32': return new Float32Array(data);
      case 'float64': return new Float64Array(data);
      default: return new Float64Array(data);
    }
  }
  
  /**
   * Adaptive memory allocation based on available system memory
   */
  getAdaptiveChunkSize(): number {
    // In browser environment, we estimate available memory
    // @ts-ignore - performance.memory is not standard but available in Chrome
    const memory = (performance as any).memory;
    
    if (memory && memory.jsHeapSizeLimit) {
      const available = memory.jsHeapSizeLimit - memory.usedJSHeapSize;
      // Use 10% of available memory for chunk size
      return Math.floor(available * 0.1 / 8); // Divide by 8 for Float64
    }
    
    // Default to 1M elements if memory info not available
    return 1000000;
  }
  
  /**
   * Memory-efficient matrix multiplication
   */
  multiplyMatricesEfficient(
    a: Float32Array,
    b: Float32Array,
    aRows: number,
    aCols: number,
    bCols: number
  ): Float32Array {
    const result = new Float32Array(aRows * bCols);
    
    // Block matrix multiplication for cache efficiency
    const blockSize = 64;
    
    for (let i0 = 0; i0 < aRows; i0 += blockSize) {
      for (let j0 = 0; j0 < bCols; j0 += blockSize) {
        for (let k0 = 0; k0 < aCols; k0 += blockSize) {
          // Process block
          const iMax = Math.min(i0 + blockSize, aRows);
          const jMax = Math.min(j0 + blockSize, bCols);
          const kMax = Math.min(k0 + blockSize, aCols);
          
          for (let i = i0; i < iMax; i++) {
            for (let j = j0; j < jMax; j++) {
              let sum = result[i * bCols + j];
              
              for (let k = k0; k < kMax; k++) {
                sum += a[i * aCols + k] * b[k * bCols + j];
              }
              
              result[i * bCols + j] = sum;
            }
          }
        }
      }
    }
    
    return result;
  }
}

// Export singleton instance
export const memoryOptimizer = new MemoryOptimizer();