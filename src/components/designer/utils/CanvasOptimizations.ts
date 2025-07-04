// Canvas performance optimization utilities
// Implements various techniques to improve rendering performance

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;
  private isDirty: boolean = true;
  private frameId: number | null = null;
  private lastRenderTime: number = 0;
  private targetFPS: number = 60;
  private cullingEnabled: boolean = true;
  private layerCache: Map<string, HTMLCanvasElement> = new Map();
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
      willReadFrequently: false
    })!;
    
    // Create offscreen canvas for double buffering
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = canvas.width;
    this.offscreenCanvas.height = canvas.height;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', {
      alpha: false,
      desynchronized: true
    })!;
    
    // Enable image smoothing for better performance
    this.ctx.imageSmoothingEnabled = false;
    this.offscreenCtx.imageSmoothingEnabled = false;
  }
  
  // Mark canvas as needing redraw
  invalidate() {
    this.isDirty = true;
  }
  
  // Request animation frame with FPS limiting
  requestRender(callback: (ctx: CanvasRenderingContext2D) => void) {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }
    
    const render = (timestamp: number) => {
      const deltaTime = timestamp - this.lastRenderTime;
      const frameTime = 1000 / this.targetFPS;
      
      if (deltaTime >= frameTime && this.isDirty) {
        this.lastRenderTime = timestamp;
        this.isDirty = false;
        
        // Clear offscreen canvas
        this.offscreenCtx.fillStyle = '#1a1a1a';
        this.offscreenCtx.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
        
        // Render to offscreen canvas
        callback(this.offscreenCtx);
        
        // Copy to main canvas
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);
      }
      
      this.frameId = requestAnimationFrame(render);
    };
    
    this.frameId = requestAnimationFrame(render);
  }
  
  // Viewport culling - only render objects in view
  isInViewport(
    x: number, 
    y: number, 
    width: number, 
    height: number,
    viewportX: number,
    viewportY: number,
    viewportWidth: number,
    viewportHeight: number
  ): boolean {
    if (!this.cullingEnabled) return true;
    
    return !(x + width < viewportX || 
             x > viewportX + viewportWidth ||
             y + height < viewportY || 
             y > viewportY + viewportHeight);
  }
  
  // Cache static layers
  cacheLayer(layerId: string, width: number, height: number, renderFn: (ctx: CanvasRenderingContext2D) => void) {
    let layerCanvas = this.layerCache.get(layerId);
    
    if (!layerCanvas) {
      layerCanvas = document.createElement('canvas');
      layerCanvas.width = width;
      layerCanvas.height = height;
      this.layerCache.set(layerId, layerCanvas);
    }
    
    const layerCtx = layerCanvas.getContext('2d')!;
    layerCtx.clearRect(0, 0, width, height);
    renderFn(layerCtx);
    
    return layerCanvas;
  }
  
  // Draw cached layer
  drawCachedLayer(layerId: string, x: number, y: number) {
    const layer = this.layerCache.get(layerId);
    if (layer) {
      this.offscreenCtx.drawImage(layer, x, y);
    }
  }
  
  // Clear layer cache
  clearLayerCache(layerId?: string) {
    if (layerId) {
      this.layerCache.delete(layerId);
    } else {
      this.layerCache.clear();
    }
  }
  
  // Batch draw operations
  batchDraw(operations: Array<(ctx: CanvasRenderingContext2D) => void>) {
    this.offscreenCtx.save();
    operations.forEach(op => op(this.offscreenCtx));
    this.offscreenCtx.restore();
  }
  
  // Update canvas size
  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;
    this.clearLayerCache();
    this.invalidate();
  }
  
  // Cleanup
  destroy() {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }
    this.layerCache.clear();
  }
}

// Object pooling for frequently created/destroyed objects
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;
  
  constructor(createFn: () => T, resetFn: (obj: T) => void, maxSize: number = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }
  
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }
  
  release(obj: T) {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }
  
  clear() {
    this.pool = [];
  }
}

// Spatial indexing for efficient collision detection
export class SpatialIndex {
  private cellSize: number;
  private grid: Map<string, Set<any>> = new Map();
  
  constructor(cellSize: number = 100) {
    this.cellSize = cellSize;
  }
  
  private getKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }
  
  insert(obj: any, x: number, y: number, width: number, height: number) {
    const startX = Math.floor(x / this.cellSize);
    const startY = Math.floor(y / this.cellSize);
    const endX = Math.floor((x + width) / this.cellSize);
    const endY = Math.floor((y + height) / this.cellSize);
    
    for (let cx = startX; cx <= endX; cx++) {
      for (let cy = startY; cy <= endY; cy++) {
        const key = `${cx},${cy}`;
        if (!this.grid.has(key)) {
          this.grid.set(key, new Set());
        }
        this.grid.get(key)!.add(obj);
      }
    }
  }
  
  query(x: number, y: number, width: number, height: number): Set<any> {
    const results = new Set<any>();
    const startX = Math.floor(x / this.cellSize);
    const startY = Math.floor(y / this.cellSize);
    const endX = Math.floor((x + width) / this.cellSize);
    const endY = Math.floor((y + height) / this.cellSize);
    
    for (let cx = startX; cx <= endX; cx++) {
      for (let cy = startY; cy <= endY; cy++) {
        const key = `${cx},${cy}`;
        const cell = this.grid.get(key);
        if (cell) {
          cell.forEach(obj => results.add(obj));
        }
      }
    }
    
    return results;
  }
  
  remove(obj: any) {
    this.grid.forEach(cell => cell.delete(obj));
  }
  
  clear() {
    this.grid.clear();
  }
}

// Debounce function for expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for rate limiting
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Performance monitoring
export class PerformanceMonitor {
  private samples: number[] = [];
  private maxSamples: number = 60;
  private lastTime: number = performance.now();
  
  startFrame() {
    this.lastTime = performance.now();
  }
  
  endFrame() {
    const frameTime = performance.now() - this.lastTime;
    this.samples.push(frameTime);
    
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }
  
  getAverageFPS(): number {
    if (this.samples.length === 0) return 0;
    
    const avgFrameTime = this.samples.reduce((a, b) => a + b) / this.samples.length;
    return 1000 / avgFrameTime;
  }
  
  getFrameTime(): number {
    return this.samples[this.samples.length - 1] || 0;
  }
  
  reset() {
    this.samples = [];
  }
}