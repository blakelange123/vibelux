// VibeLux Time-Lapse Photography System
// Automated grow cycle documentation with video compilation

import { v4 as uuidv4 } from 'uuid';

export interface TimeLapseProject {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'paused' | 'completed' | 'failed';
  
  // Project settings
  cropType: string;
  variety: string;
  expectedDuration: number; // days
  
  // Location info
  facilityId: string;
  zoneId: string;
  cameraPosition: {
    x: number;
    y: number;
    z: number;
    angle: number;
    zoom: number;
  };
  
  // Capture settings
  captureInterval: number; // minutes
  captureResolution: '1080p' | '4K' | '8K';
  captureQuality: 'standard' | 'high' | 'ultra';
  
  // Lighting data integration
  trackLightingData: boolean;
  trackEnvironmentalData: boolean;
  trackGrowthMetrics: boolean;
  
  // Output settings
  outputFPS: number;
  outputResolution: string;
  includeDataOverlays: boolean;
  
  // Project data
  totalFrames: number;
  capturedFrames: number;
  missedFrames: number;
  lastCaptureTime?: Date;
  estimatedCompletion?: Date;
  
  // Media files
  frames: TimeLapseFrame[];
  compiledVideos: CompiledVideo[];
  
  // Growth tracking
  growthMetrics: GrowthMetric[];
  milestones: GrowthMilestone[];
}

export interface TimeLapseFrame {
  id: string;
  timestamp: Date;
  frameNumber: number;
  filePath: string;
  fileSize: number;
  
  // Image metadata
  resolution: { width: number; height: number };
  quality: number;
  compressionLevel: number;
  
  // Environmental data (captured at time of photo)
  lightingData?: {
    ppfd: number;
    dli: number;
    spectrum: { [wavelength: string]: number };
    photoperiod: number;
  };
  
  environmentalData?: {
    temperature: number;
    humidity: number;
    co2: number;
    vpd: number;
  };
  
  // Growth measurements (if available)
  growthData?: {
    plantHeight: number;
    leafCount: number;
    canopySpread: number;
    floweringStage: 'vegetative' | 'pre-flower' | 'flower' | 'late-flower' | 'harvest';
  };
  
  // Analysis results
  analysisResults?: {
    plantHealthScore: number;
    growthRate: number;
    colorAnalysis: { [color: string]: number };
    detectedIssues: string[];
  };
}

export interface CompiledVideo {
  id: string;
  projectId: string;
  name: string;
  createdAt: Date;
  
  // Video properties
  duration: number; // seconds
  fps: number;
  resolution: string;
  fileSize: number;
  filePath: string;
  
  // Compilation settings
  speedMultiplier: number; // e.g., 1440x for 1 day = 1 minute
  frameRange: { start: number; end: number };
  includesOverlays: boolean;
  
  // Content metadata
  realTimeSpan: number; // days
  compressionFormat: 'mp4' | 'webm' | 'mov';
  quality: 'draft' | 'standard' | 'high' | 'export';
  
  // Social media formats
  formats: {
    fullScreen?: string; // 16:9 for presentations
    square?: string; // 1:1 for Instagram
    vertical?: string; // 9:16 for TikTok/Stories
  };
}

export interface GrowthMetric {
  timestamp: Date;
  dayNumber: number;
  
  // Physical measurements
  plantHeight: number; // cm
  stemDiameter: number; // mm
  leafCount: number;
  nodeCount: number;
  canopySpread: number; // cm
  
  // Health indicators
  leafColor: string; // hex color average
  healthScore: number; // 0-100
  stressIndicators: string[];
  
  // Development stage
  stage: 'seedling' | 'vegetative' | 'pre-flower' | 'flower' | 'late-flower' | 'harvest';
  stageProgress: number; // percentage through current stage
  
  // Environmental correlation
  avgDLI: number;
  avgTemperature: number;
  avgHumidity: number;
  
  // Calculated metrics
  growthRate: number; // cm/day
  biomassEstimate: number; // grams
  yieldPrediction: number; // grams estimated final yield
}

export interface GrowthMilestone {
  id: string;
  name: string;
  description: string;
  targetDay: number;
  actualDay?: number;
  completed: boolean;
  
  // Milestone criteria
  criteria: {
    minHeight?: number;
    minLeafCount?: number;
    stage?: string;
    customMetric?: { name: string; value: number };
  };
  
  // Media
  celebrationFrame?: string; // frame ID that captured this milestone
  notes?: string;
}

export class TimeLapseEngine {
  private projects: Map<string, TimeLapseProject> = new Map();
  private activeCaptures: Map<string, NodeJS.Timeout> = new Map();
  
  // Create new time-lapse project
  public createProject(
    config: {
      name: string;
      description: string;
      cropType: string;
      variety: string;
      expectedDuration: number;
      facilityId: string;
      zoneId: string;
      captureInterval: number;
      cameraPosition: TimeLapseProject['cameraPosition'];
    }
  ): TimeLapseProject {
    const project: TimeLapseProject = {
      id: `timelapse_${uuidv4()}`,
      name: config.name,
      description: config.description,
      startDate: new Date(),
      status: 'active',
      
      cropType: config.cropType,
      variety: config.variety,
      expectedDuration: config.expectedDuration,
      
      facilityId: config.facilityId,
      zoneId: config.zoneId,
      cameraPosition: config.cameraPosition,
      
      captureInterval: config.captureInterval,
      captureResolution: '4K',
      captureQuality: 'high',
      
      trackLightingData: true,
      trackEnvironmentalData: true,
      trackGrowthMetrics: true,
      
      outputFPS: 30,
      outputResolution: '1080p',
      includeDataOverlays: true,
      
      totalFrames: Math.floor((config.expectedDuration * 24 * 60) / config.captureInterval),
      capturedFrames: 0,
      missedFrames: 0,
      
      frames: [],
      compiledVideos: [],
      growthMetrics: [],
      milestones: this.generateStandardMilestones(config.cropType, config.expectedDuration)
    };
    
    this.projects.set(project.id, project);
    this.startCapture(project.id);
    
    return project;
  }
  
  // Start automated capture for a project
  public startCapture(projectId: string): void {
    const project = this.projects.get(projectId);
    if (!project || project.status !== 'active') return;
    
    // Clear any existing capture interval
    this.stopCapture(projectId);
    
    const captureInterval = setInterval(async () => {
      await this.captureFrame(projectId);
    }, project.captureInterval * 60 * 1000); // Convert minutes to milliseconds
    
    this.activeCaptures.set(projectId, captureInterval);
    
    console.log(`Started time-lapse capture for project: ${project.name}`);
  }
  
  // Stop capture for a project
  public stopCapture(projectId: string): void {
    const interval = this.activeCaptures.get(projectId);
    if (interval) {
      clearInterval(interval);
      this.activeCaptures.delete(projectId);
    }
  }
  
  // Capture single frame
  private async captureFrame(projectId: string): Promise<TimeLapseFrame | null> {
    const project = this.projects.get(projectId);
    if (!project) return null;
    
    try {
      // Simulate camera capture (in real implementation, this would control actual cameras)
      const frameData = await this.takePicture(project.cameraPosition);
      
      // Gather environmental data
      const environmentalData = await this.gatherEnvironmentalData(project.facilityId, project.zoneId);
      const lightingData = await this.gatherLightingData(project.facilityId, project.zoneId);
      
      // Analyze growth if enabled
      const growthData = project.trackGrowthMetrics 
        ? await this.analyzeGrowth(frameData)
        : undefined;
      
      const frame: TimeLapseFrame = {
        id: `frame_${uuidv4()}`,
        timestamp: new Date(),
        frameNumber: project.capturedFrames + 1,
        filePath: frameData.filePath,
        fileSize: frameData.fileSize,
        resolution: frameData.resolution,
        quality: frameData.quality,
        compressionLevel: frameData.compressionLevel,
        environmentalData,
        lightingData,
        growthData
      };
      
      // Add frame to project
      project.frames.push(frame);
      project.capturedFrames++;
      project.lastCaptureTime = new Date();
      
      // Update growth metrics
      if (growthData) {
        this.updateGrowthMetrics(projectId, frame);
      }
      
      // Check for milestones
      this.checkMilestones(projectId, frame);
      
      // Save project
      this.projects.set(projectId, project);
      
      return frame;
      
    } catch (error) {
      console.error(`Failed to capture frame for project ${projectId}:`, error);
      project.missedFrames++;
      this.projects.set(projectId, project);
      return null;
    }
  }
  
  // Compile video from frames
  public async compileVideo(
    projectId: string,
    options: {
      name: string;
      fps?: number;
      resolution?: string;
      speedMultiplier?: number;
      frameRange?: { start: number; end: number };
      includeOverlays?: boolean;
      formats?: ('fullScreen' | 'square' | 'vertical')[];
    }
  ): Promise<CompiledVideo> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');
    
    const settings = {
      fps: options.fps || 30,
      resolution: options.resolution || '1080p',
      speedMultiplier: options.speedMultiplier || 1440, // 24 hours = 1 minute
      frameRange: options.frameRange || { start: 0, end: project.frames.length },
      includeOverlays: options.includeOverlays ?? true,
      formats: options.formats || ['fullScreen']
    };
    
    const video: CompiledVideo = {
      id: `video_${uuidv4()}`,
      projectId,
      name: options.name,
      createdAt: new Date(),
      duration: this.calculateVideoDuration(project, settings),
      fps: settings.fps,
      resolution: settings.resolution,
      fileSize: 0, // Will be set after compilation
      filePath: '', // Will be set after compilation
      speedMultiplier: settings.speedMultiplier,
      frameRange: settings.frameRange,
      includesOverlays: settings.includeOverlays,
      realTimeSpan: project.frames.length * (project.captureInterval / (24 * 60)), // days
      compressionFormat: 'mp4',
      quality: 'high',
      formats: {}
    };
    
    // Compile video (simulate processing)
    await this.processVideoCompilation(project, video, settings);
    
    // Add to project
    project.compiledVideos.push(video);
    this.projects.set(projectId, project);
    
    return video;
  }
  
  // Generate quick preview video (last 7 days)
  public async generateQuickPreview(projectId: string): Promise<CompiledVideo> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');
    
    // Get frames from last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentFrames = project.frames.filter(frame => frame.timestamp >= sevenDaysAgo);
    
    if (recentFrames.length === 0) {
      throw new Error('No recent frames available for preview');
    }
    
    const startIndex = project.frames.indexOf(recentFrames[0]);
    const endIndex = project.frames.indexOf(recentFrames[recentFrames.length - 1]);
    
    return this.compileVideo(projectId, {
      name: `${project.name} - 7 Day Preview`,
      fps: 15,
      resolution: '720p',
      speedMultiplier: 720, // 12 hours = 1 minute
      frameRange: { start: startIndex, end: endIndex },
      includeOverlays: true,
      formats: ['fullScreen', 'square']
    });
  }
  
  // Create social media clips
  public async createSocialMediaClip(
    projectId: string,
    type: 'instagram' | 'tiktok' | 'youtube',
    duration: number = 30 // seconds
  ): Promise<CompiledVideo> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');
    
    const frameCount = Math.floor(duration * 15); // 15 fps for social media
    const totalFrames = project.frames.length;
    const step = Math.floor(totalFrames / frameCount);
    
    const selectedFrames = [];
    for (let i = 0; i < totalFrames; i += step) {
      if (selectedFrames.length >= frameCount) break;
      selectedFrames.push(i);
    }
    
    const formats = {
      'instagram': ['square', 'vertical'],
      'tiktok': ['vertical'],
      'youtube': ['fullScreen']
    };
    
    return this.compileVideo(projectId, {
      name: `${project.name} - ${type.charAt(0).toUpperCase() + type.slice(1)} Clip`,
      fps: 15,
      resolution: type === 'tiktok' ? '720p' : '1080p',
      speedMultiplier: Math.floor(project.expectedDuration * 24 * 60 / duration), // Fit entire grow into duration
      frameRange: { start: 0, end: project.frames.length },
      includeOverlays: type !== 'tiktok', // TikTok prefers clean videos
      formats: formats[type] as any
    });
  }
  
  // Private helper methods
  private async takePicture(cameraPosition: TimeLapseProject['cameraPosition']): Promise<any> {
    // Simulate camera capture
    return {
      filePath: `/captures/frame_${Date.now()}.jpg`,
      fileSize: 5 * 1024 * 1024, // 5MB
      resolution: { width: 3840, height: 2160 }, // 4K
      quality: 95,
      compressionLevel: 85
    };
  }
  
  private async gatherEnvironmentalData(facilityId: string, zoneId: string): Promise<any> {
    // Simulate environmental sensor data
    return {
      temperature: 75 + Math.random() * 5, // 75-80°F
      humidity: 60 + Math.random() * 10, // 60-70%
      co2: 800 + Math.random() * 400, // 800-1200 ppm
      vpd: 0.8 + Math.random() * 0.4 // 0.8-1.2 kPa
    };
  }
  
  private async gatherLightingData(facilityId: string, zoneId: string): Promise<any> {
    // Simulate lighting sensor data
    return {
      ppfd: 600 + Math.random() * 200, // 600-800 μmol/m²/s
      dli: 35 + Math.random() * 10, // 35-45 mol/m²/day
      spectrum: {
        '400-500': 20, // Blue
        '500-600': 15, // Green
        '600-700': 40, // Red
        '700-800': 25  // Far-red
      },
      photoperiod: 18 // hours
    };
  }
  
  private async analyzeGrowth(frameData: any): Promise<any> {
    // Simulate AI-powered growth analysis
    return {
      plantHeight: 30 + Math.random() * 50, // 30-80 cm
      leafCount: Math.floor(15 + Math.random() * 25), // 15-40 leaves
      canopySpread: 25 + Math.random() * 30, // 25-55 cm
      floweringStage: ['vegetative', 'pre-flower', 'flower'][Math.floor(Math.random() * 3)]
    };
  }
  
  private updateGrowthMetrics(projectId: string, frame: TimeLapseFrame): void {
    const project = this.projects.get(projectId);
    if (!project || !frame.growthData) return;
    
    const dayNumber = Math.floor((frame.timestamp.getTime() - project.startDate.getTime()) / (24 * 60 * 60 * 1000));
    
    const metric: GrowthMetric = {
      timestamp: frame.timestamp,
      dayNumber,
      plantHeight: frame.growthData.plantHeight,
      stemDiameter: 5 + Math.random() * 5, // mm
      leafCount: frame.growthData.leafCount,
      nodeCount: Math.floor(frame.growthData.leafCount / 2),
      canopySpread: frame.growthData.canopySpread,
      leafColor: '#4CAF50', // Green
      healthScore: 85 + Math.random() * 15, // 85-100
      stressIndicators: [],
      stage: frame.growthData.floweringStage as any,
      stageProgress: Math.random() * 100,
      avgDLI: frame.lightingData?.dli || 0,
      avgTemperature: frame.environmentalData?.temperature || 0,
      avgHumidity: frame.environmentalData?.humidity || 0,
      growthRate: Math.random() * 2, // cm/day
      biomassEstimate: Math.pow(frame.growthData.plantHeight / 10, 2) * 50, // rough estimate
      yieldPrediction: Math.pow(frame.growthData.plantHeight / 10, 2) * 100 // rough estimate
    };
    
    project.growthMetrics.push(metric);
  }
  
  private checkMilestones(projectId: string, frame: TimeLapseFrame): void {
    const project = this.projects.get(projectId);
    if (!project || !frame.growthData) return;
    
    const dayNumber = Math.floor((frame.timestamp.getTime() - project.startDate.getTime()) / (24 * 60 * 60 * 1000));
    
    project.milestones.forEach(milestone => {
      if (!milestone.completed && dayNumber >= milestone.targetDay) {
        const criteria = milestone.criteria;
        let criteriasMet = true;
        
        if (criteria.minHeight && frame.growthData!.plantHeight < criteria.minHeight) {
          criteriasMet = false;
        }
        if (criteria.minLeafCount && frame.growthData!.leafCount < criteria.minLeafCount) {
          criteriasMet = false;
        }
        if (criteria.stage && frame.growthData!.floweringStage !== criteria.stage) {
          criteriasMet = false;
        }
        
        if (criteriasMet) {
          milestone.completed = true;
          milestone.actualDay = dayNumber;
          milestone.celebrationFrame = frame.id;
          console.log(`Milestone achieved: ${milestone.name} on day ${dayNumber}`);
        }
      }
    });
  }
  
  private generateStandardMilestones(cropType: string, duration: number): GrowthMilestone[] {
    const milestones: GrowthMilestone[] = [
      {
        id: uuidv4(),
        name: 'Germination',
        description: 'Seeds have sprouted and first leaves are visible',
        targetDay: 3,
        completed: false,
        criteria: { minHeight: 2, minLeafCount: 2 }
      },
      {
        id: uuidv4(),
        name: 'Vegetative Growth',
        description: 'Strong vegetative growth with multiple node sets',
        targetDay: 14,
        completed: false,
        criteria: { minHeight: 15, minLeafCount: 8 }
      },
      {
        id: uuidv4(),
        name: 'Pre-Flower',
        description: 'Plants showing pre-flower characteristics',
        targetDay: Math.floor(duration * 0.4),
        completed: false,
        criteria: { stage: 'pre-flower' }
      },
      {
        id: uuidv4(),
        name: 'Full Flower',
        description: 'Plants in full flowering stage',
        targetDay: Math.floor(duration * 0.6),
        completed: false,
        criteria: { stage: 'flower' }
      },
      {
        id: uuidv4(),
        name: 'Late Flower',
        description: 'Plants approaching harvest maturity',
        targetDay: Math.floor(duration * 0.9),
        completed: false,
        criteria: { stage: 'late-flower' }
      }
    ];
    
    return milestones;
  }
  
  private calculateVideoDuration(project: TimeLapseProject, settings: any): number {
    const totalFrames = settings.frameRange.end - settings.frameRange.start;
    return totalFrames / settings.fps;
  }
  
  private async processVideoCompilation(project: TimeLapseProject, video: CompiledVideo, settings: any): Promise<void> {
    // Simulate video processing
    console.log(`Compiling video: ${video.name}`);
    console.log(`Processing ${settings.frameRange.end - settings.frameRange.start} frames...`);
    
    // Set file properties (would be actual after processing)
    video.filePath = `/videos/${video.id}.mp4`;
    video.fileSize = 50 * 1024 * 1024; // 50MB estimate
    
    // Generate different format versions
    if (settings.formats.includes('fullScreen')) {
      video.formats.fullScreen = `/videos/${video.id}_16x9.mp4`;
    }
    if (settings.formats.includes('square')) {
      video.formats.square = `/videos/${video.id}_1x1.mp4`;
    }
    if (settings.formats.includes('vertical')) {
      video.formats.vertical = `/videos/${video.id}_9x16.mp4`;
    }
  }
  
  // Public API methods
  public getProject(projectId: string): TimeLapseProject | undefined {
    return this.projects.get(projectId);
  }
  
  public getAllProjects(): TimeLapseProject[] {
    return Array.from(this.projects.values());
  }
  
  public getActiveProjects(): TimeLapseProject[] {
    return Array.from(this.projects.values()).filter(p => p.status === 'active');
  }
  
  public pauseProject(projectId: string): void {
    const project = this.projects.get(projectId);
    if (project) {
      project.status = 'paused';
      this.stopCapture(projectId);
      this.projects.set(projectId, project);
    }
  }
  
  public resumeProject(projectId: string): void {
    const project = this.projects.get(projectId);
    if (project) {
      project.status = 'active';
      this.startCapture(projectId);
      this.projects.set(projectId, project);
    }
  }
  
  public completeProject(projectId: string): void {
    const project = this.projects.get(projectId);
    if (project) {
      project.status = 'completed';
      project.endDate = new Date();
      this.stopCapture(projectId);
      this.projects.set(projectId, project);
    }
  }
}