// Barcode Scanner Implementation

import { BarcodeScanner, ScanResult, BarcodeType, GPSLocation } from './mobile-types';

export class BarcodeScannerImpl implements BarcodeScanner {
  private camera: CameraAPI;
  private decoder: BarcodeDecoder;
  private validator: BarcodeValidator;
  private generator: BarcodeGenerator;

  constructor() {
    this.camera = new CameraAPI();
    this.decoder = new BarcodeDecoder();
    this.validator = new BarcodeValidator();
    this.generator = new BarcodeGenerator();
  }

  async scan(): Promise<ScanResult> {
    try {
      // Request camera permission if needed
      await this.camera.requestPermission();

      // Start camera preview
      const stream = await this.camera.startPreview();

      // Capture and decode
      const frame = await this.camera.captureFrame(stream);
      const result = await this.decoder.decode(frame);

      // Get location if available
      const location = await this.getLocation();

      // Stop camera
      await this.camera.stopPreview(stream);

      return {
        code: result.code,
        type: result.type,
        timestamp: new Date(),
        location,
        confidence: result.confidence
      };
    } catch (error) {
      throw new ScanError('Failed to scan barcode', error);
    }
  }

  async scanBatch(): Promise<ScanResult[]> {
    const results: ScanResult[] = [];
    let scanning = true;

    try {
      await this.camera.requestPermission();
      const stream = await this.camera.startPreview();

      // Show batch scanning UI
      const ui = new BatchScanUI();
      ui.onComplete = () => { scanning = false; };

      while (scanning) {
        try {
          const frame = await this.camera.captureFrame(stream);
          const result = await this.decoder.decode(frame);
          
          if (result && !results.find(r => r.code === result.code)) {
            const location = await this.getLocation();
            results.push({
              code: result.code,
              type: result.type,
              timestamp: new Date(),
              location,
              confidence: result.confidence
            });
            
            ui.addScannedItem(result);
            await this.playSuccessSound();
          }
        } catch (error) {
          // Continue scanning even if one frame fails
        }

        // Small delay between scans
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await this.camera.stopPreview(stream);
      return results;
    } catch (error) {
      throw new ScanError('Batch scan failed', error);
    }
  }

  generateBarcode(data: string, type: BarcodeType): string {
    return this.generator.generate(data, type);
  }

  validateBarcode(code: string, type: BarcodeType): boolean {
    return this.validator.validate(code, type);
  }

  private async getLocation(): Promise<GPSLocation | undefined> {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000
        });
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp)
      };
    } catch {
      return undefined;
    }
  }

  private async playSuccessSound(): Promise<void> {
    // Play success sound/vibration
  }
}

// Camera API Wrapper
class CameraAPI {
  async requestPermission(): Promise<boolean> {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return result.state === 'granted';
    } catch {
      return false;
    }
  }

  async startPreview(): Promise<MediaStream> {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });
  }

  async captureFrame(stream: MediaStream): Promise<ImageData> {
    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);
    
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  async stopPreview(stream: MediaStream): Promise<void> {
    stream.getTracks().forEach(track => track.stop());
  }
}

// Barcode Decoder
class BarcodeDecoder {
  private patterns: Map<BarcodeType, BarcodePattern>;

  constructor() {
    this.patterns = new Map([
      [BarcodeType.QRCode, new QRCodePattern()],
      [BarcodeType.Code128, new Code128Pattern()],
      [BarcodeType.Code39, new Code39Pattern()],
      [BarcodeType.EAN13, new EAN13Pattern()],
      [BarcodeType.DataMatrix, new DataMatrixPattern()],
      [BarcodeType.PlantTag, new PlantTagPattern()],
      [BarcodeType.InventoryTag, new InventoryTagPattern()]
    ]);
  }

  async decode(imageData: ImageData): Promise<DecodedBarcode> {
    // Try each pattern until one succeeds
    for (const [type, pattern] of this.patterns) {
      try {
        const result = await pattern.decode(imageData);
        if (result) {
          return {
            code: result.code,
            type,
            confidence: result.confidence
          };
        }
      } catch {
        // Try next pattern
      }
    }

    throw new Error('No barcode found');
  }
}

// Barcode Validator
class BarcodeValidator {
  validate(code: string, type: BarcodeType): boolean {
    switch (type) {
      case BarcodeType.PlantTag:
        return this.validatePlantTag(code);
      case BarcodeType.InventoryTag:
        return this.validateInventoryTag(code);
      case BarcodeType.EAN13:
        return this.validateEAN13(code);
      case BarcodeType.UPC:
        return this.validateUPC(code);
      default:
        return true;
    }
  }

  private validatePlantTag(code: string): boolean {
    // Format: PT-YYYYMMDD-XXXXX
    const pattern = /^PT-\d{8}-[A-Z0-9]{5}$/;
    return pattern.test(code);
  }

  private validateInventoryTag(code: string): boolean {
    // Format: INV-CAT-XXXXX
    const pattern = /^INV-[A-Z]{3}-[A-Z0-9]{5}$/;
    return pattern.test(code);
  }

  private validateEAN13(code: string): boolean {
    if (code.length !== 13) return false;
    
    // Check digit validation
    const digits = code.split('').map(Number);
    const checkDigit = digits.pop()!;
    
    const sum = digits.reduce((acc, digit, index) => {
      return acc + digit * (index % 2 === 0 ? 1 : 3);
    }, 0);
    
    const calculatedCheck = (10 - (sum % 10)) % 10;
    return calculatedCheck === checkDigit;
  }

  private validateUPC(code: string): boolean {
    if (code.length !== 12) return false;
    
    // Similar to EAN13 validation
    const digits = code.split('').map(Number);
    const checkDigit = digits.pop()!;
    
    const sum = digits.reduce((acc, digit, index) => {
      return acc + digit * (index % 2 === 0 ? 3 : 1);
    }, 0);
    
    const calculatedCheck = (10 - (sum % 10)) % 10;
    return calculatedCheck === checkDigit;
  }
}

// Barcode Generator
class BarcodeGenerator {
  generate(data: string, type: BarcodeType): string {
    switch (type) {
      case BarcodeType.QRCode:
        return this.generateQRCode(data);
      case BarcodeType.Code128:
        return this.generateCode128(data);
      case BarcodeType.PlantTag:
        return this.generatePlantTag(data);
      case BarcodeType.InventoryTag:
        return this.generateInventoryTag(data);
      default:
        throw new Error(`Unsupported barcode type: ${type}`);
    }
  }

  private generateQRCode(data: string): string {
    // Use QR code library
    return `data:image/svg+xml;base64,${btoa(this.createQRSVG(data))}`;
  }

  private generateCode128(data: string): string {
    // Use Code128 library
    return `data:image/svg+xml;base64,${btoa(this.createCode128SVG(data))}`;
  }

  private generatePlantTag(plantId: string): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const code = `PT-${date}-${plantId.toUpperCase().padStart(5, '0')}`;
    return this.generateCode128(code);
  }

  private generateInventoryTag(item: { category: string; id: string }): string {
    const code = `INV-${item.category.toUpperCase().slice(0, 3)}-${item.id.toUpperCase().padStart(5, '0')}`;
    return this.generateCode128(code);
  }

  private createQRSVG(data: string): string {
    // Simplified QR code SVG generation
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="white"/>
      <text x="100" y="100" text-anchor="middle" font-size="12">${data}</text>
    </svg>`;
  }

  private createCode128SVG(data: string): string {
    // Simplified Code128 SVG generation
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100">
      <rect width="300" height="100" fill="white"/>
      <text x="150" y="80" text-anchor="middle" font-size="14">${data}</text>
    </svg>`;
  }
}

// Batch Scanning UI
class BatchScanUI {
  onComplete?: () => void;
  private items: ScanResult[] = [];

  addScannedItem(result: DecodedBarcode): void {
    // Update UI with scanned item
  }

  complete(): void {
    this.onComplete?.();
  }
}

// Pattern Implementations
abstract class BarcodePattern {
  abstract decode(imageData: ImageData): Promise<PatternResult | null>;
}

class QRCodePattern extends BarcodePattern {
  async decode(imageData: ImageData): Promise<PatternResult | null> {
    // QR code detection logic
    return null;
  }
}

class Code128Pattern extends BarcodePattern {
  async decode(imageData: ImageData): Promise<PatternResult | null> {
    // Code 128 detection logic
    return null;
  }
}

class Code39Pattern extends BarcodePattern {
  async decode(imageData: ImageData): Promise<PatternResult | null> {
    // Code 39 detection logic
    return null;
  }
}

class EAN13Pattern extends BarcodePattern {
  async decode(imageData: ImageData): Promise<PatternResult | null> {
    // EAN13 detection logic
    return null;
  }
}

class DataMatrixPattern extends BarcodePattern {
  async decode(imageData: ImageData): Promise<PatternResult | null> {
    // Data Matrix detection logic
    return null;
  }
}

class PlantTagPattern extends BarcodePattern {
  async decode(imageData: ImageData): Promise<PatternResult | null> {
    // Plant tag specific detection
    return null;
  }
}

class InventoryTagPattern extends BarcodePattern {
  async decode(imageData: ImageData): Promise<PatternResult | null> {
    // Inventory tag specific detection
    return null;
  }
}

// Types
interface DecodedBarcode {
  code: string;
  type: BarcodeType;
  confidence: number;
}

interface PatternResult {
  code: string;
  confidence: number;
}

class ScanError extends Error {
  constructor(message: string, public cause?: any) {
    super(message);
    this.name = 'ScanError';
  }
}

// Barcode Utilities
export class BarcodeUtils {
  static parseVibeLuxBarcode(code: string): ParsedBarcode | null {
    if (code.startsWith('PT-')) {
      return this.parsePlantTag(code);
    } else if (code.startsWith('INV-')) {
      return this.parseInventoryTag(code);
    } else if (code.startsWith('LOT-')) {
      return this.parseLotCode(code);
    } else if (code.startsWith('PKG-')) {
      return this.parsePackageCode(code);
    }
    return null;
  }

  private static parsePlantTag(code: string): ParsedBarcode {
    const parts = code.split('-');
    return {
      type: 'plant',
      date: parts[1],
      id: parts[2],
      raw: code
    };
  }

  private static parseInventoryTag(code: string): ParsedBarcode {
    const parts = code.split('-');
    return {
      type: 'inventory',
      category: parts[1],
      id: parts[2],
      raw: code
    };
  }

  private static parseLotCode(code: string): ParsedBarcode {
    const parts = code.split('-');
    return {
      type: 'lot',
      batchId: parts[1],
      sequence: parts[2],
      raw: code
    };
  }

  private static parsePackageCode(code: string): ParsedBarcode {
    const parts = code.split('-');
    return {
      type: 'package',
      date: parts[1],
      id: parts[2],
      raw: code
    };
  }
}

interface ParsedBarcode {
  type: string;
  raw: string;
  [key: string]: any;
}