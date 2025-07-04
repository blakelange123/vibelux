import QRCode from 'qrcode';

export interface QRCodeData {
  id: string;
  type: 'container' | 'inventory' | 'asset' | 'location';
  facilityId: string;
  metadata: {
    name: string;
    description?: string;
    category?: string;
    locationId?: string;
    parentId?: string;
    customFields?: Record<string, any>;
  };
  tracking: {
    createdAt: Date;
    lastScanned?: Date;
    scanCount: number;
    currentLocation?: string;
    status: 'active' | 'inactive' | 'maintenance' | 'retired';
  };
}

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  color?: {
    dark?: string;
    light?: string;
  };
  logo?: {
    url: string;
    width?: number;
    height?: number;
  };
}

export class QRCodeGenerator {
  private defaultOptions: QRCodeOptions = {
    size: 300,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  };

  constructor(private baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || '') {}

  /**
   * Generate a QR code for a container
   */
  async generateContainerQR(
    containerId: string,
    facilityId: string,
    metadata: Partial<QRCodeData['metadata']>,
    options?: QRCodeOptions
  ): Promise<{ qrCode: string; data: QRCodeData }> {
    const data: QRCodeData = {
      id: containerId,
      type: 'container',
      facilityId,
      metadata: {
        name: metadata.name || `Container ${containerId}`,
        ...metadata
      },
      tracking: {
        createdAt: new Date(),
        scanCount: 0,
        status: 'active'
      }
    };

    const qrCode = await this.generateQRCode(data, options);
    return { qrCode, data };
  }

  /**
   * Generate a QR code for inventory items
   */
  async generateInventoryQR(
    itemId: string,
    facilityId: string,
    metadata: Partial<QRCodeData['metadata']>,
    options?: QRCodeOptions
  ): Promise<{ qrCode: string; data: QRCodeData }> {
    const data: QRCodeData = {
      id: itemId,
      type: 'inventory',
      facilityId,
      metadata: {
        name: metadata.name || `Item ${itemId}`,
        ...metadata
      },
      tracking: {
        createdAt: new Date(),
        scanCount: 0,
        status: 'active'
      }
    };

    const qrCode = await this.generateQRCode(data, options);
    return { qrCode, data };
  }

  /**
   * Generate a QR code for general assets
   */
  async generateAssetQR(
    assetId: string,
    facilityId: string,
    metadata: Partial<QRCodeData['metadata']>,
    options?: QRCodeOptions
  ): Promise<{ qrCode: string; data: QRCodeData }> {
    const data: QRCodeData = {
      id: assetId,
      type: 'asset',
      facilityId,
      metadata: {
        name: metadata.name || `Asset ${assetId}`,
        ...metadata
      },
      tracking: {
        createdAt: new Date(),
        scanCount: 0,
        status: 'active'
      }
    };

    const qrCode = await this.generateQRCode(data, options);
    return { qrCode, data };
  }

  /**
   * Generate a QR code for location markers
   */
  async generateLocationQR(
    locationId: string,
    facilityId: string,
    metadata: Partial<QRCodeData['metadata']>,
    options?: QRCodeOptions
  ): Promise<{ qrCode: string; data: QRCodeData }> {
    const data: QRCodeData = {
      id: locationId,
      type: 'location',
      facilityId,
      metadata: {
        name: metadata.name || `Location ${locationId}`,
        ...metadata
      },
      tracking: {
        createdAt: new Date(),
        scanCount: 0,
        status: 'active'
      }
    };

    const qrCode = await this.generateQRCode(data, options);
    return { qrCode, data };
  }

  /**
   * Generate batch QR codes
   */
  async generateBatchQR(
    count: number,
    type: QRCodeData['type'],
    facilityId: string,
    baseMetadata: Partial<QRCodeData['metadata']>,
    options?: QRCodeOptions
  ): Promise<Array<{ qrCode: string; data: QRCodeData }>> {
    const batch = [];

    for (let i = 0; i < count; i++) {
      const id = generateUniqueId();
      const metadata = {
        ...baseMetadata,
        name: `${baseMetadata.name || type} ${i + 1}`
      };

      let result;
      switch (type) {
        case 'container':
          result = await this.generateContainerQR(id, facilityId, metadata, options);
          break;
        case 'inventory':
          result = await this.generateInventoryQR(id, facilityId, metadata, options);
          break;
        case 'asset':
          result = await this.generateAssetQR(id, facilityId, metadata, options);
          break;
        case 'location':
          result = await this.generateLocationQR(id, facilityId, metadata, options);
          break;
      }

      batch.push(result);
    }

    return batch;
  }

  /**
   * Core QR code generation function
   */
  private async generateQRCode(data: QRCodeData, options?: QRCodeOptions): Promise<string> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    // Create the tracking URL
    const trackingUrl = `${this.baseUrl}/track/${data.type}/${data.id}`;
    
    // Generate QR code with the tracking URL
    const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, {
      width: mergedOptions.size,
      margin: mergedOptions.margin,
      errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
      color: mergedOptions.color
    });

    return qrCodeDataUrl;
  }

  /**
   * Generate a printable PDF with multiple QR codes
   */
  async generatePrintablePDF(
    qrCodes: Array<{ qrCode: string; data: QRCodeData }>,
    layout: 'single' | '2x2' | '3x3' | '4x4' = '2x2'
  ): Promise<Blob> {
    // This would integrate with jsPDF to create a printable sheet
    // Implementation would depend on the PDF library choice
    throw new Error('PDF generation not implemented yet');
  }

  /**
   * Generate QR code with custom branding
   */
  async generateBrandedQR(
    data: QRCodeData,
    branding: {
      logo?: string;
      colors?: {
        primary: string;
        secondary: string;
      };
      style?: 'square' | 'rounded' | 'dots';
    }
  ): Promise<string> {
    // Enhanced QR code with branding
    // This would require a more advanced QR code library or custom implementation
    const options: QRCodeOptions = {
      color: {
        dark: branding.colors?.primary || '#000000',
        light: branding.colors?.secondary || '#FFFFFF'
      }
    };

    return this.generateQRCode(data, options);
  }

  /**
   * Parse QR code data from a scanned URL
   */
  parseQRCodeUrl(url: string): { type: string; id: string } | null {
    const pattern = new RegExp(`${this.baseUrl}/track/([^/]+)/([^/]+)`);
    const match = url.match(pattern);

    if (match) {
      return {
        type: match[1],
        id: match[2]
      };
    }

    return null;
  }
}

// Helper functions for QR code management
export function generateUniqueId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const randomStr = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substring(2, 9);
  const id = `${timestamp}-${randomStr}`;
  return prefix ? `${prefix}-${id}` : id;
}

export function createQRCodeFilename(data: QRCodeData): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `qr-${data.type}-${data.id}-${timestamp}.png`;
}

export function validateQRCodeData(data: Partial<QRCodeData>): boolean {
  return !!(data.id && data.type && data.facilityId && data.metadata?.name);
}