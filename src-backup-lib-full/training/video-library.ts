// Video Library Management
import { VideoContent, VideoQuality, Caption, VideoChapter } from './training-types';

export interface VideoLibrary {
  videos: VideoAsset[];
  categories: VideoCategory[];
  playlists: Playlist[];
  analytics: VideoAnalytics;
}

export interface VideoAsset {
  id: string;
  title: string;
  description: string;
  duration: number; // seconds
  fileSize: number; // bytes
  format: VideoFormat;
  resolution: VideoQuality;
  uploadedAt: Date;
  uploadedBy: string;
  thumbnailUrl: string;
  videoUrl: string;
  streamingUrls?: StreamingUrl[];
  tags: string[];
  category: string;
  transcriptUrl?: string;
  captions?: Caption[];
  chapters?: VideoChapter[];
  metadata: VideoMetadata;
  analytics: VideoMetrics;
  status: VideoStatus;
}

export interface StreamingUrl {
  quality: VideoQuality;
  url: string;
  bitrate: number;
  format: string;
}

export enum VideoFormat {
  MP4 = 'mp4',
  WEBM = 'webm',
  MOV = 'mov',
  AVI = 'avi',
  MKV = 'mkv',
  HLS = 'hls',
  DASH = 'dash'
}

export interface VideoMetadata {
  width: number;
  height: number;
  frameRate: number;
  bitrate: number;
  codec: string;
  audioCodec: string;
  audioBitrate: number;
  audioChannels: number;
  hasAudio: boolean;
  hasSubtitles: boolean;
}

export interface VideoCategory {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  icon?: string;
  color?: string;
  order: number;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  videos: PlaylistVideo[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
  thumbnailUrl?: string;
}

export interface PlaylistVideo {
  videoId: string;
  order: number;
  addedAt: Date;
  addedBy: string;
}

export enum VideoStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  ERROR = 'error',
  ARCHIVED = 'archived'
}

export interface VideoUploadRequest {
  file: File;
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  courseId?: string;
  moduleId?: string;
  chunkSize?: number;
  processOptions?: VideoProcessingOptions;
}

export interface VideoProcessingOptions {
  generateThumbnail: boolean;
  generateTranscript: boolean;
  generateCaptions: boolean;
  targetQualities: VideoQuality[];
  optimizeForStreaming: boolean;
  watermark?: WatermarkOptions;
}

export interface WatermarkOptions {
  imageUrl: string;
  position: WatermarkPosition;
  opacity: number;
  size: number;
}

export enum WatermarkPosition {
  TOP_LEFT = 'top_left',
  TOP_RIGHT = 'top_right',
  BOTTOM_LEFT = 'bottom_left',
  BOTTOM_RIGHT = 'bottom_right',
  CENTER = 'center'
}

export interface VideoAnalytics {
  totalViews: number;
  uniqueViewers: number;
  averageWatchTime: number;
  completionRate: number;
  engagement: EngagementMetrics;
  demographics: ViewerDemographics;
  performance: PerformanceMetrics;
}

export interface VideoMetrics {
  views: number;
  uniqueViewers: number;
  totalWatchTime: number; // seconds
  averageWatchTime: number;
  completions: number;
  likes: number;
  bookmarks: number;
  shares: number;
  comments: number;
  lastViewedAt?: Date;
}

export interface EngagementMetrics {
  plays: number;
  pauses: number;
  rewinds: number;
  fastForwards: number;
  seekEvents: HeatmapData[];
  dropOffPoints: DropOffPoint[];
  interactionRate: number;
}

export interface HeatmapData {
  timestamp: number;
  seekCount: number;
  viewerCount: number;
}

export interface DropOffPoint {
  timestamp: number;
  percentage: number;
  viewersLost: number;
}

export interface ViewerDemographics {
  byRole: Record<string, number>;
  byDepartment: Record<string, number>;
  byLocation: Record<string, number>;
  byDevice: Record<string, number>;
}

export interface PerformanceMetrics {
  bufferingEvents: number;
  averageBufferTime: number;
  startupTime: number;
  bitrateChanges: number;
  errors: VideoError[];
}

export interface VideoError {
  timestamp: Date;
  errorCode: string;
  errorMessage: string;
  userId?: string;
  device?: string;
}

export interface VideoPlayer {
  id: string;
  videoId: string;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  quality: VideoQuality;
  isPlaying: boolean;
  isBuffering: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  captions?: {
    enabled: boolean;
    language: string;
  };
}

export interface PlaybackSession {
  id: string;
  userId: string;
  videoId: string;
  startTime: Date;
  endTime?: Date;
  watchedSegments: WatchedSegment[];
  interactions: PlaybackInteraction[];
  device: DeviceInfo;
  bandwidth: BandwidthInfo[];
}

export interface WatchedSegment {
  startTime: number;
  endTime: number;
  watchedAt: Date;
}

export interface PlaybackInteraction {
  type: InteractionType;
  timestamp: number;
  data?: any;
  time: Date;
}

export enum InteractionType {
  PLAY = 'play',
  PAUSE = 'pause',
  SEEK = 'seek',
  SPEED_CHANGE = 'speed_change',
  QUALITY_CHANGE = 'quality_change',
  CAPTION_TOGGLE = 'caption_toggle',
  FULLSCREEN_TOGGLE = 'fullscreen_toggle',
  CHAPTER_SKIP = 'chapter_skip',
  NOTE_ADDED = 'note_added',
  BOOKMARK_ADDED = 'bookmark_added'
}

export interface DeviceInfo {
  type: DeviceType;
  os: string;
  browser: string;
  screenResolution: string;
  connectionType: string;
}

export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  TV = 'tv'
}

export interface BandwidthInfo {
  timestamp: Date;
  bandwidth: number; // kbps
  latency: number; // ms
  packetLoss: number; // percentage
}

export interface VideoSearchFilters {
  query?: string;
  categories?: string[];
  tags?: string[];
  duration?: {
    min?: number;
    max?: number;
  };
  uploadedDate?: {
    from?: Date;
    to?: Date;
  };
  quality?: VideoQuality[];
  status?: VideoStatus[];
  hasTranscript?: boolean;
  hasCaptions?: boolean;
  sortBy?: VideoSortOption;
  sortOrder?: 'asc' | 'desc';
}

export enum VideoSortOption {
  RELEVANCE = 'relevance',
  TITLE = 'title',
  DURATION = 'duration',
  UPLOAD_DATE = 'upload_date',
  VIEWS = 'views',
  RATING = 'rating',
  WATCH_TIME = 'watch_time'
}

export interface VideoNote {
  id: string;
  userId: string;
  videoId: string;
  timestamp: number;
  note: string;
  createdAt: Date;
  updatedAt: Date;
  isPrivate: boolean;
  tags?: string[];
}

export interface VideoBookmark {
  id: string;
  userId: string;
  videoId: string;
  timestamp: number;
  title: string;
  description?: string;
  createdAt: Date;
}

// Video Library Service Functions
export class VideoLibraryService {
  private apiUrl: string;
  private streamingService: StreamingService;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
    this.streamingService = new StreamingService();
  }

  async uploadVideo(request: VideoUploadRequest): Promise<VideoAsset> {
    // Implement chunked upload for large files
    const chunks = this.createChunks(request.file, request.chunkSize || 5 * 1024 * 1024);
    const uploadId = await this.initiateUpload(request);
    
    for (let i = 0; i < chunks.length; i++) {
      await this.uploadChunk(uploadId, chunks[i], i);
    }
    
    return await this.completeUpload(uploadId, request);
  }

  async searchVideos(filters: VideoSearchFilters): Promise<VideoAsset[]> {
    // Implement video search with filters
    const queryParams = this.buildSearchQuery(filters);
    const response = await fetch(`${this.apiUrl}/videos/search?${queryParams}`);
    return response.json();
  }

  async getVideoAnalytics(videoId: string, period: string): Promise<VideoAnalytics> {
    // Fetch video analytics
    const response = await fetch(`${this.apiUrl}/videos/${videoId}/analytics?period=${period}`);
    return response.json();
  }

  async generateTranscript(videoId: string): Promise<string> {
    // Use AI service to generate transcript
    const response = await fetch(`${this.apiUrl}/videos/${videoId}/transcript`, {
      method: 'POST'
    });
    return response.text();
  }

  async trackPlayback(session: PlaybackSession): Promise<void> {
    // Track playback session for analytics
    await fetch(`${this.apiUrl}/videos/playback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    });
  }

  private createChunks(file: File, chunkSize: number): Blob[] {
    const chunks: Blob[] = [];
    let start = 0;
    
    while (start < file.size) {
      const end = Math.min(start + chunkSize, file.size);
      chunks.push(file.slice(start, end));
      start = end;
    }
    
    return chunks;
  }

  private async initiateUpload(request: VideoUploadRequest): Promise<string> {
    const response = await fetch(`${this.apiUrl}/videos/upload/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: request.file.name,
        fileSize: request.file.size,
        ...request
      })
    });
    
    const data = await response.json();
    return data.uploadId;
  }

  private async uploadChunk(uploadId: string, chunk: Blob, index: number): Promise<void> {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('index', index.toString());
    
    await fetch(`${this.apiUrl}/videos/upload/${uploadId}/chunk`, {
      method: 'POST',
      body: formData
    });
  }

  private async completeUpload(uploadId: string, request: VideoUploadRequest): Promise<VideoAsset> {
    const response = await fetch(`${this.apiUrl}/videos/upload/${uploadId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.processOptions)
    });
    
    return response.json();
  }

  private buildSearchQuery(filters: VideoSearchFilters): string {
    const params = new URLSearchParams();
    
    if (filters.query) params.append('q', filters.query);
    if (filters.categories?.length) params.append('categories', filters.categories.join(','));
    if (filters.tags?.length) params.append('tags', filters.tags.join(','));
    if (filters.duration?.min) params.append('minDuration', filters.duration.min.toString());
    if (filters.duration?.max) params.append('maxDuration', filters.duration.max.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    return params.toString();
  }
}

// Streaming Service for adaptive bitrate streaming
export class StreamingService {
  async getStreamingUrl(videoId: string, quality: VideoQuality): Promise<string> {
    // Return HLS or DASH streaming URL based on device capabilities
    const capability = this.detectStreamingCapability();
    
    if (capability === 'hls') {
      return `/api/videos/${videoId}/stream.m3u8`;
    } else if (capability === 'dash') {
      return `/api/videos/${videoId}/stream.mpd`;
    } else {
      return `/api/videos/${videoId}/stream.mp4?quality=${quality}`;
    }
  }

  private detectStreamingCapability(): 'hls' | 'dash' | 'progressive' {
    // Detect browser/device streaming capabilities
    if (this.supportsHLS()) return 'hls';
    if (this.supportsDASH()) return 'dash';
    return 'progressive';
  }

  private supportsHLS(): boolean {
    const video = document.createElement('video');
    return Boolean(
      video.canPlayType('application/vnd.apple.mpegurl') ||
      video.canPlayType('audio/mpegurl')
    );
  }

  private supportsDASH(): boolean {
    return 'MediaSource' in window;
  }
}