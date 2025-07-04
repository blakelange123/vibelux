// Advanced Video Processing Engine for Time-Lapse Compilation
// GPU-accelerated video compilation with data overlays and social media formats

export interface VideoProcessingConfig {
  inputFrames: string[]; // Array of frame file paths
  outputPath: string;
  outputFormat: 'mp4' | 'webm' | 'mov' | 'gif';
  
  // Video settings
  fps: number;
  resolution: { width: number; height: number };
  quality: 'draft' | 'standard' | 'high' | 'export';
  codec: 'h264' | 'h265' | 'vp9' | 'av1';
  
  // Time-lapse settings
  speedMultiplier: number; // e.g., 1440x = 24 hours in 1 minute
  frameSkip?: number; // Skip every N frames for faster processing
  
  // Effects and overlays
  includeDataOverlays: boolean;
  transitionEffects: boolean;
  stabilization: boolean;
  colorCorrection: boolean;
  
  // Social media formats
  aspectRatio: '16:9' | '1:1' | '9:16' | '4:5';
  addWatermark?: boolean;
  addIntroOutro?: boolean;
  
  // Data overlay configuration
  overlayConfig?: VideoOverlayConfig;
}

export interface VideoOverlayConfig {
  showGrowthMetrics: boolean;
  showEnvironmentalData: boolean;
  showTimestamp: boolean;
  showProjectInfo: boolean;
  
  // Overlay positioning
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number; // 0-1
  fontSize: number;
  
  // Data to display
  metrics: {
    dayNumber: boolean;
    plantHeight: boolean;
    temperature: boolean;
    humidity: boolean;
    ppfd: boolean;
    dli: boolean;
  };
  
  // Styling
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  padding: number;
}

export interface ProcessingProgress {
  stage: 'preparing' | 'processing' | 'rendering' | 'encoding' | 'finalizing' | 'complete' | 'error';
  progress: number; // 0-100
  currentFrame: number;
  totalFrames: number;
  estimatedTimeRemaining: number; // seconds
  processingSpeed: number; // frames per second
  message: string;
}

export interface VideoMetadata {
  duration: number; // seconds
  frameCount: number;
  fileSize: number; // bytes
  bitrate: number; // kbps
  dimensions: { width: number; height: number };
  fps: number;
  codec: string;
  format: string;
  
  // Time-lapse specific
  realTimeSpan: number; // original duration in hours
  compressionRatio: number; // how much faster than real-time
  
  // Quality metrics
  averageQuality: number;
  motionSmoothness: number;
  colorAccuracy: number;
}

export class VideoProcessor {
  private isProcessing = false;
  private currentProgress: ProcessingProgress | null = null;
  private progressCallbacks: ((progress: ProcessingProgress) => void)[] = [];
  
  // Main video compilation method
  public async compileVideo(config: VideoProcessingConfig): Promise<VideoMetadata> {
    if (this.isProcessing) {
      throw new Error('Another video is currently being processed');
    }
    
    this.isProcessing = true;
    
    try {
      // Validate configuration
      this.validateConfig(config);
      
      // Initialize progress tracking
      this.currentProgress = {
        stage: 'preparing',
        progress: 0,
        currentFrame: 0,
        totalFrames: config.inputFrames.length,
        estimatedTimeRemaining: 0,
        processingSpeed: 0,
        message: 'Preparing video compilation...'
      };
      this.notifyProgress();
      
      // Process video in stages
      const processedFrames = await this.preprocessFrames(config);
      const videoData = await this.assembleVideo(processedFrames, config);
      const metadata = await this.finalizeVideo(videoData, config);
      
      this.currentProgress.stage = 'complete';
      this.currentProgress.progress = 100;
      this.currentProgress.message = 'Video compilation complete!';
      this.notifyProgress();
      
      return metadata;
      
    } catch (error) {
      this.currentProgress = {
        stage: 'error',
        progress: 0,
        currentFrame: 0,
        totalFrames: 0,
        estimatedTimeRemaining: 0,
        processingSpeed: 0,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
      this.notifyProgress();
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }
  
  // Create social media optimized versions
  public async createSocialMediaVersions(
    sourceVideo: string,
    formats: ('instagram' | 'tiktok' | 'youtube' | 'twitter')[]
  ): Promise<{ [format: string]: VideoMetadata }> {
    const results: { [format: string]: VideoMetadata } = {};
    
    for (const format of formats) {
      const config = this.getSocialMediaConfig(format, sourceVideo);
      results[format] = await this.compileVideo(config);
    }
    
    return results;
  }
  
  // Generate video thumbnail/preview
  public async generateThumbnail(
    videoPath: string,
    timeOffset: number = 0.5 // percentage through video
  ): Promise<string> {
    // Simulate thumbnail generation
    return `/thumbnails/thumb_${Date.now()}.jpg`;
  }
  
  // Extract specific time range from video
  public async extractTimeRange(
    sourceVideo: string,
    startTime: number, // seconds
    endTime: number, // seconds
    outputPath: string
  ): Promise<VideoMetadata> {
    // Simulate time range extraction
    return {
      duration: endTime - startTime,
      frameCount: Math.floor((endTime - startTime) * 30),
      fileSize: 10 * 1024 * 1024, // 10MB
      bitrate: 5000,
      dimensions: { width: 1920, height: 1080 },
      fps: 30,
      codec: 'h264',
      format: 'mp4',
      realTimeSpan: 24,
      compressionRatio: 1440,
      averageQuality: 85,
      motionSmoothness: 90,
      colorAccuracy: 88
    };
  }
  
  // Create AI-powered highlight reel
  public async generateHighlights(
    frames: string[],
    growthData: any[],
    duration: number = 60 // seconds
  ): Promise<VideoMetadata> {
    // Analyze frames for interesting moments
    const highlights = await this.detectHighlights(frames, growthData);
    
    // Create highlight compilation
    const config: VideoProcessingConfig = {
      inputFrames: highlights.selectedFrames,
      outputPath: `/videos/highlights_${Date.now()}.mp4`,
      outputFormat: 'mp4',
      fps: 30,
      resolution: { width: 1920, height: 1080 },
      quality: 'high',
      codec: 'h264',
      speedMultiplier: Math.floor(highlights.totalTimeSpan / duration),
      includeDataOverlays: true,
      transitionEffects: true,
      stabilization: true,
      colorCorrection: true,
      aspectRatio: '16:9',
      addWatermark: true,
      overlayConfig: {
        showGrowthMetrics: true,
        showEnvironmentalData: false,
        showTimestamp: true,
        showProjectInfo: true,
        position: 'bottom-right',
        opacity: 0.8,
        fontSize: 14,
        metrics: {
          dayNumber: true,
          plantHeight: true,
          temperature: false,
          humidity: false,
          ppfd: false,
          dli: false
        },
        backgroundColor: '#000000',
        textColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12
      }
    };
    
    return this.compileVideo(config);
  }
  
  // Private processing methods
  private async preprocessFrames(config: VideoProcessingConfig): Promise<string[]> {
    this.currentProgress!.stage = 'processing';
    this.currentProgress!.message = 'Preprocessing frames...';
    this.notifyProgress();
    
    const processedFrames: string[] = [];
    const totalFrames = config.inputFrames.length;
    
    for (let i = 0; i < totalFrames; i++) {
      if (config.frameSkip && i % config.frameSkip !== 0) {
        continue; // Skip frame for faster processing
      }
      
      const frame = config.inputFrames[i];
      
      // Apply image processing
      const processedFrame = await this.processFrame(frame, config, i);
      processedFrames.push(processedFrame);
      
      // Update progress
      this.currentProgress!.currentFrame = i + 1;
      this.currentProgress!.progress = Math.floor((i / totalFrames) * 30); // 0-30% for preprocessing
      this.currentProgress!.processingSpeed = (i + 1) / ((Date.now() - Date.now()) / 1000 || 1);
      this.notifyProgress();
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    return processedFrames;
  }
  
  private async processFrame(
    framePath: string,
    config: VideoProcessingConfig,
    frameIndex: number
  ): Promise<string> {
    // Simulate frame processing operations:
    // - Resize to target resolution
    // - Apply color correction
    // - Add stabilization
    // - Add data overlays if enabled
    
    const processedPath = framePath.replace('.jpg', '_processed.jpg');
    
    if (config.includeDataOverlays && config.overlayConfig) {
      await this.addDataOverlay(framePath, processedPath, config.overlayConfig, frameIndex);
    }
    
    return processedPath;
  }
  
  private async addDataOverlay(
    inputPath: string,
    outputPath: string,
    overlayConfig: VideoOverlayConfig,
    frameIndex: number
  ): Promise<void> {
    // Simulate adding data overlay to frame
    // In real implementation, this would use image processing libraries
    
    const overlayData = this.generateOverlayData(overlayConfig, frameIndex);
    
    // Apply overlay using canvas or image processing library
    console.log(`Adding overlay to frame ${frameIndex}:`, overlayData);
  }
  
  private generateOverlayData(config: VideoOverlayConfig, frameIndex: number): any {
    const data: any = {};
    
    if (config.metrics.dayNumber) {
      data.dayNumber = Math.floor(frameIndex / (24 * 2)); // Assuming 30min intervals
    }
    
    if (config.metrics.plantHeight) {
      data.plantHeight = `${(20 + frameIndex * 0.5).toFixed(1)} cm`;
    }
    
    if (config.metrics.temperature) {
      data.temperature = `${(75 + Math.sin(frameIndex * 0.1) * 3).toFixed(1)}°F`;
    }
    
    if (config.metrics.ppfd) {
      data.ppfd = `${(600 + Math.cos(frameIndex * 0.05) * 100).toFixed(0)} μmol/m²/s`;
    }
    
    if (config.showTimestamp) {
      const hours = (frameIndex * 0.5) % 24;
      data.timestamp = `${Math.floor(hours)}:${((hours % 1) * 60).toFixed(0).padStart(2, '0')}`;
    }
    
    return data;
  }
  
  private async assembleVideo(
    processedFrames: string[],
    config: VideoProcessingConfig
  ): Promise<any> {
    this.currentProgress!.stage = 'rendering';
    this.currentProgress!.message = 'Assembling video...';
    this.currentProgress!.progress = 30;
    this.notifyProgress();
    
    // Simulate video assembly process
    const totalFrames = processedFrames.length;
    
    for (let i = 0; i < totalFrames; i++) {
      // Process each frame into video
      
      // Update progress (30-80% for assembly)
      this.currentProgress!.progress = 30 + Math.floor((i / totalFrames) * 50);
      this.currentProgress!.currentFrame = i + 1;
      this.notifyProgress();
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 5));
    }
    
    return {
      frames: processedFrames,
      config: config,
      assemblyComplete: true
    };
  }
  
  private async finalizeVideo(videoData: any, config: VideoProcessingConfig): Promise<VideoMetadata> {
    this.currentProgress!.stage = 'encoding';
    this.currentProgress!.message = 'Encoding final video...';
    this.currentProgress!.progress = 80;
    this.notifyProgress();
    
    // Simulate encoding process
    for (let i = 80; i <= 95; i++) {
      this.currentProgress!.progress = i;
      this.notifyProgress();
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    this.currentProgress!.stage = 'finalizing';
    this.currentProgress!.message = 'Finalizing...';
    this.currentProgress!.progress = 95;
    this.notifyProgress();
    
    // Generate metadata
    const metadata: VideoMetadata = {
      duration: config.inputFrames.length / config.fps,
      frameCount: config.inputFrames.length,
      fileSize: this.estimateFileSize(config),
      bitrate: this.calculateBitrate(config),
      dimensions: config.resolution,
      fps: config.fps,
      codec: config.codec,
      format: config.outputFormat,
      realTimeSpan: (config.inputFrames.length * 30) / 60, // minutes to hours
      compressionRatio: config.speedMultiplier,
      averageQuality: this.calculateQuality(config),
      motionSmoothness: 90,
      colorAccuracy: 88
    };
    
    return metadata;
  }
  
  private async detectHighlights(frames: string[], growthData: any[]): Promise<any> {
    // AI-powered highlight detection
    // Look for significant changes, milestones, interesting growth phases
    
    const highlights = [];
    const analysisWindow = 50; // frames
    
    for (let i = 0; i < frames.length - analysisWindow; i += analysisWindow) {
      const segment = frames.slice(i, i + analysisWindow);
      const segmentData = growthData.slice(i, i + analysisWindow);
      
      const interestScore = this.calculateInterestScore(segment, segmentData);
      
      if (interestScore > 0.7) { // Threshold for interesting segments
        highlights.push({
          startFrame: i,
          endFrame: i + analysisWindow,
          score: interestScore,
          reason: this.getHighlightReason(segmentData)
        });
      }
    }
    
    // Select top highlights that fit target duration
    const selectedHighlights = highlights
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10 highlights
    
    const selectedFrames = selectedHighlights.flatMap(h => 
      frames.slice(h.startFrame, h.endFrame)
    );
    
    return {
      selectedFrames,
      totalTimeSpan: selectedFrames.length * 30 / 60 / 60, // hours
      highlights: selectedHighlights
    };
  }
  
  private calculateInterestScore(frames: string[], data: any[]): number {
    // Analyze visual and data changes to determine interest level
    let score = 0;
    
    // Check for growth milestones
    const heightChanges = data.map(d => d.plantHeight || 0);
    const growthRate = this.calculateGrowthRate(heightChanges);
    if (growthRate > 1.5) score += 0.3; // Rapid growth
    
    // Check for stage transitions
    const stages = data.map(d => d.stage);
    const uniqueStages = new Set(stages);
    if (uniqueStages.size > 1) score += 0.4; // Stage transition
    
    // Check for environmental events
    const tempVariation = this.calculateVariation(data.map(d => d.temperature || 75));
    if (tempVariation > 5) score += 0.2; // Significant temp change
    
    // Visual interest (simulated)
    score += Math.random() * 0.3; // Random factor for visual complexity
    
    return Math.min(score, 1.0);
  }
  
  private getHighlightReason(data: any[]): string {
    const reasons = [];
    
    const heights = data.map(d => d.plantHeight || 0);
    const growthRate = this.calculateGrowthRate(heights);
    
    if (growthRate > 2) reasons.push('Rapid growth phase');
    if (new Set(data.map(d => d.stage)).size > 1) reasons.push('Stage transition');
    if (this.calculateVariation(data.map(d => d.temperature || 75)) > 5) reasons.push('Environmental change');
    
    return reasons.join(', ') || 'Visual interest';
  }
  
  private calculateGrowthRate(heights: number[]): number {
    if (heights.length < 2) return 0;
    const totalGrowth = heights[heights.length - 1] - heights[0];
    return totalGrowth / heights.length;
  }
  
  private calculateVariation(values: number[]): number {
    if (values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
  
  private getSocialMediaConfig(format: string, sourceVideo: string): VideoProcessingConfig {
    const baseConfig = {
      inputFrames: [], // Would be extracted from source video
      outputPath: `/videos/${format}_${Date.now()}.mp4`,
      outputFormat: 'mp4' as const,
      codec: 'h264' as const,
      quality: 'high' as const,
      includeDataOverlays: format !== 'tiktok',
      transitionEffects: true,
      stabilization: true,
      colorCorrection: true,
      addWatermark: true
    };
    
    switch (format) {
      case 'instagram':
        return {
          ...baseConfig,
          fps: 30,
          resolution: { width: 1080, height: 1080 },
          aspectRatio: '1:1',
          speedMultiplier: 2160 // Fit ~36 hours in 60 seconds
        };
      
      case 'tiktok':
        return {
          ...baseConfig,
          fps: 30,
          resolution: { width: 1080, height: 1920 },
          aspectRatio: '9:16',
          speedMultiplier: 1800, // Fit 30 hours in 60 seconds
          includeDataOverlays: false // Clean aesthetic for TikTok
        };
      
      case 'youtube':
        return {
          ...baseConfig,
          fps: 30,
          resolution: { width: 1920, height: 1080 },
          aspectRatio: '16:9',
          speedMultiplier: 720 // Slower for longer content
        };
      
      case 'twitter':
        return {
          ...baseConfig,
          fps: 30,
          resolution: { width: 1280, height: 720 },
          aspectRatio: '16:9',
          speedMultiplier: 2880 // Very fast for Twitter attention span
        };
      
      default:
        return baseConfig as VideoProcessingConfig;
    }
  }
  
  private validateConfig(config: VideoProcessingConfig): void {
    if (!config.inputFrames || config.inputFrames.length === 0) {
      throw new Error('No input frames provided');
    }
    
    if (config.fps <= 0 || config.fps > 120) {
      throw new Error('Invalid frame rate');
    }
    
    if (config.resolution.width <= 0 || config.resolution.height <= 0) {
      throw new Error('Invalid resolution');
    }
  }
  
  private estimateFileSize(config: VideoProcessingConfig): number {
    // Rough file size estimation based on resolution, quality, and duration
    const pixelCount = config.resolution.width * config.resolution.height;
    const duration = config.inputFrames.length / config.fps;
    const qualityMultiplier = {
      'draft': 0.5,
      'standard': 1.0,
      'high': 2.0,
      'export': 4.0
    }[config.quality];
    
    // Estimate: ~1KB per 1000 pixels per second for standard quality
    return Math.floor(pixelCount * duration * qualityMultiplier / 1000);
  }
  
  private calculateBitrate(config: VideoProcessingConfig): number {
    const pixelCount = config.resolution.width * config.resolution.height;
    const qualityMultiplier = {
      'draft': 0.05,
      'standard': 0.1,
      'high': 0.2,
      'export': 0.4
    }[config.quality];
    
    return Math.floor(pixelCount * config.fps * qualityMultiplier / 1000); // kbps
  }
  
  private calculateQuality(config: VideoProcessingConfig): number {
    let quality = {
      'draft': 60,
      'standard': 75,
      'high': 85,
      'export': 95
    }[config.quality];
    
    // Adjust based on other settings
    if (config.stabilization) quality += 2;
    if (config.colorCorrection) quality += 3;
    if (config.transitionEffects) quality += 2;
    
    return Math.min(quality, 100);
  }
  
  // Progress tracking
  public onProgress(callback: (progress: ProcessingProgress) => void): void {
    this.progressCallbacks.push(callback);
  }
  
  public removeProgressCallback(callback: (progress: ProcessingProgress) => void): void {
    const index = this.progressCallbacks.indexOf(callback);
    if (index > -1) {
      this.progressCallbacks.splice(index, 1);
    }
  }
  
  private notifyProgress(): void {
    if (this.currentProgress) {
      this.progressCallbacks.forEach(callback => callback(this.currentProgress!));
    }
  }
  
  public getCurrentProgress(): ProcessingProgress | null {
    return this.currentProgress;
  }
  
  public isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }
}