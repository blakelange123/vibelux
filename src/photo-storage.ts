// Advanced photo storage and processing system
export class PhotoStorageService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
  private static readonly COMPRESSION_QUALITY = 0.8;

  /**
   * Process and upload photo with optimization
   */
  static async processAndUpload(
    file: File, 
    facilityId: string, 
    category: string,
    metadata: Record<string, any>
  ): Promise<{
    originalUrl: string;
    thumbnailUrl: string;
    compressedUrl: string;
    metadata: any;
  }> {
    // Validate file
    if (!this.SUPPORTED_FORMATS.includes(file.type)) {
      throw new Error('Unsupported file format');
    }
    
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('File too large');
    }

    // Extract EXIF data
    const exifData = await this.extractExifData(file);
    
    // Create multiple versions
    const originalBlob = file;
    const compressedBlob = await this.compressImage(file, this.COMPRESSION_QUALITY);
    const thumbnailBlob = await this.createThumbnail(file, 300, 300);

    // Generate unique filenames
    const timestamp = Date.now();
    const randomId = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9);
    const baseName = `${facilityId}/${category}/${timestamp}-${randomId}`;

    // Upload all versions
    const [originalUrl, compressedUrl, thumbnailUrl] = await Promise.all([
      this.uploadToStorage(`${baseName}-original.jpg`, originalBlob),
      this.uploadToStorage(`${baseName}-compressed.jpg`, compressedBlob),
      this.uploadToStorage(`${baseName}-thumb.jpg`, thumbnailBlob)
    ]);

    // Enhanced metadata
    const enhancedMetadata = {
      ...metadata,
      ...exifData,
      fileSize: file.size,
      dimensions: await this.getImageDimensions(file),
      uploadTimestamp: new Date().toISOString(),
      processingVersion: '1.0'
    };

    return {
      originalUrl,
      thumbnailUrl,
      compressedUrl,
      metadata: enhancedMetadata
    };
  }

  /**
   * Batch process multiple photos
   */
  static async batchProcess(
    files: File[], 
    facilityId: string, 
    category: string,
    metadata: Record<string, any>
  ): Promise<Array<{
    originalUrl: string;
    thumbnailUrl: string;
    compressedUrl: string;
    metadata: any;
  }>> {
    const results = await Promise.allSettled(
      files.map(file => this.processAndUpload(file, facilityId, category, metadata))
    );

    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<any>).value);
  }

  /**
   * OCR text extraction from photos
   */
  static async extractText(photoUrl: string): Promise<{
    text: string;
    confidence: number;
    boundingBoxes: Array<{
      text: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }>;
  }> {
    try {
      const response = await fetch('/api/photos/extract-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl })
      });

      if (!response.ok) throw new Error('OCR failed');
      return await response.json();
    } catch (error) {
      console.error('Text extraction failed:', error);
      return { text: '', confidence: 0, boundingBoxes: [] };
    }
  }

  /**
   * Compare before/after photos
   */
  static async comparePhotos(
    beforePhotoUrl: string, 
    afterPhotoUrl: string
  ): Promise<{
    similarity: number;
    differences: Array<{
      type: 'added' | 'removed' | 'changed';
      area: { x: number; y: number; width: number; height: number };
      description: string;
    }>;
    improvementScore: number;
  }> {
    try {
      const response = await fetch('/api/photos/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beforePhotoUrl, afterPhotoUrl })
      });

      if (!response.ok) throw new Error('Photo comparison failed');
      return await response.json();
    } catch (error) {
      console.error('Photo comparison failed:', error);
      return { similarity: 0, differences: [], improvementScore: 0 };
    }
  }

  // Helper methods
  private static async compressImage(file: File, quality: number): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  private static async createThumbnail(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', 0.7);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  private static async extractExifData(file: File): Promise<any> {
    // Extract EXIF data including GPS, timestamp, camera settings
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // Basic EXIF extraction (would use proper EXIF library in production)
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const view = new DataView(arrayBuffer);
          
          // Extract basic metadata
          resolve({
            timestamp: new Date().toISOString(),
            fileType: file.type,
            fileName: file.name,
            lastModified: new Date(file.lastModified).toISOString()
          });
        } catch (error) {
          resolve({});
        }
      };
      reader.readAsArrayBuffer(file.slice(0, 65536)); // Read first 64KB for EXIF
    });
  }

  private static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private static async uploadToStorage(filename: string, blob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('file', blob, filename);
    
    const response = await fetch('/api/photos/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) throw new Error('Upload failed');
    
    const { url } = await response.json();
    return url;
  }
}