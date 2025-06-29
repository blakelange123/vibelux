// VibeLux Integrated File Server & Document Management System
// Secure document storage with encryption, versioning, and access controls

export interface DocumentMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  lastModified: Date;
  version: number;
  category: DocumentCategory;
  tags: string[];
  description?: string;
  
  // Access control
  isPublic: boolean;
  accessLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  allowedUsers: string[];
  allowedRoles: string[];
  
  // File properties
  checksum: string;
  isEncrypted: boolean;
  compressionLevel?: number;
  
  // Business context
  relatedEntityType?: 'user' | 'project' | 'form' | 'report' | 'contract' | 'license';
  relatedEntityId?: string;
  expirationDate?: Date;
  retentionPolicy?: number; // days
  
  // Compliance
  isCompliance: boolean;
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: 'upload' | 'download' | 'view' | 'edit' | 'delete' | 'share' | 'move' | 'copy';
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

export type DocumentCategory = 
  | 'forms' | 'contracts' | 'licenses' | 'reports' | 'invoices' | 'receipts'
  | 'hr' | 'legal' | 'compliance' | 'safety' | 'training' | 'insurance'
  | 'technical' | 'marketing' | 'operations' | 'personal' | 'temp' | 'archive';

export interface FileServerConfig {
  baseUrl: string;
  maxFileSize: number; // bytes
  allowedMimeTypes: string[];
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
  virusScanEnabled: boolean;
  backupEnabled: boolean;
  retentionDays: number;
  storageQuotaPerUser: number; // bytes
  storageQuotaPerOrganization: number; // bytes
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  sizeByCategory: { [category: string]: number };
  sizeByUser: { [userId: string]: number };
  quotaUsed: number;
  quotaRemaining: number;
}

export interface ShareLink {
  id: string;
  documentId: string;
  token: string;
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
  maxDownloads?: number;
  downloadCount: number;
  password?: string;
  allowPreview: boolean;
  allowDownload: boolean;
  isActive: boolean;
}

export class VibeLuxFileServer {
  private documents: Map<string, DocumentMetadata> = new Map();
  private shareLinks: Map<string, ShareLink> = new Map();
  private config: FileServerConfig;
  
  constructor(config: Partial<FileServerConfig> = {}) {
    this.config = {
      baseUrl: '/api/documents',
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedMimeTypes: [
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        
        // Images
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        
        // Archives
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        
        // Other
        'application/json',
        'application/xml',
        'text/xml'
      ],
      encryptionEnabled: true,
      compressionEnabled: true,
      virusScanEnabled: true,
      backupEnabled: true,
      retentionDays: 2555, // 7 years default
      storageQuotaPerUser: 10 * 1024 * 1024 * 1024, // 10GB
      storageQuotaPerOrganization: 1000 * 1024 * 1024 * 1024, // 1TB
      ...config
    };
  }

  // Upload document
  public async uploadDocument(
    file: File,
    metadata: Partial<DocumentMetadata>,
    userId: string
  ): Promise<DocumentMetadata> {
    // Validate file
    this.validateFile(file);
    
    // Check quota
    await this.checkStorageQuota(userId, file.size);
    
    // Generate document metadata
    const documentId = this.generateDocumentId();
    const filename = this.generateSecureFilename(file.name);
    const checksum = await this.calculateChecksum(file);
    
    const docMetadata: DocumentMetadata = {
      id: documentId,
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      uploadedBy: userId,
      uploadedAt: new Date(),
      lastModified: new Date(),
      version: 1,
      category: metadata.category || 'temp',
      tags: metadata.tags || [],
      description: metadata.description,
      isPublic: metadata.isPublic || false,
      accessLevel: metadata.accessLevel || 'internal',
      allowedUsers: metadata.allowedUsers || [userId],
      allowedRoles: metadata.allowedRoles || [],
      checksum,
      isEncrypted: this.config.encryptionEnabled,
      relatedEntityType: metadata.relatedEntityType,
      relatedEntityId: metadata.relatedEntityId,
      expirationDate: metadata.expirationDate,
      retentionPolicy: metadata.retentionPolicy,
      isCompliance: metadata.isCompliance || false,
      auditTrail: [{
        id: this.generateId(),
        timestamp: new Date(),
        userId,
        action: 'upload',
        details: `Uploaded file: ${file.name}`
      }]
    };
    
    // Process and store file
    await this.processAndStoreFile(file, docMetadata);
    
    // Store metadata
    this.documents.set(documentId, docMetadata);
    
    // Schedule virus scan if enabled
    if (this.config.virusScanEnabled) {
      this.scheduleVirusScan(documentId);
    }
    
    return docMetadata;
  }

  // Download document
  public async downloadDocument(
    documentId: string,
    userId: string,
    ipAddress?: string
  ): Promise<{ url: string; metadata: DocumentMetadata }> {
    const metadata = this.documents.get(documentId);
    if (!metadata) {
      throw new Error('Document not found');
    }
    
    // Check access permissions
    this.checkAccess(metadata, userId, 'download');
    
    // Log access
    this.logAccess(metadata, userId, 'download', ipAddress);
    
    // Generate secure download URL
    const downloadUrl = await this.generateDownloadUrl(metadata);
    
    return { url: downloadUrl, metadata };
  }

  // Create shareable link
  public createShareLink(
    documentId: string,
    userId: string,
    options: {
      expiresIn?: number; // hours
      maxDownloads?: number;
      password?: string;
      allowPreview?: boolean;
      allowDownload?: boolean;
    } = {}
  ): ShareLink {
    const metadata = this.documents.get(documentId);
    if (!metadata) {
      throw new Error('Document not found');
    }
    
    this.checkAccess(metadata, userId, 'share');
    
    const shareLink: ShareLink = {
      id: this.generateId(),
      documentId,
      token: this.generateSecureToken(),
      createdBy: userId,
      createdAt: new Date(),
      expiresAt: options.expiresIn 
        ? new Date(Date.now() + options.expiresIn * 60 * 60 * 1000)
        : undefined,
      maxDownloads: options.maxDownloads,
      downloadCount: 0,
      password: options.password,
      allowPreview: options.allowPreview ?? true,
      allowDownload: options.allowDownload ?? true,
      isActive: true
    };
    
    this.shareLinks.set(shareLink.id, shareLink);
    
    // Log share action
    this.logAccess(metadata, userId, 'share');
    
    return shareLink;
  }

  // Get documents by category
  public getDocumentsByCategory(
    category: DocumentCategory,
    userId: string
  ): DocumentMetadata[] {
    return Array.from(this.documents.values())
      .filter(doc => doc.category === category)
      .filter(doc => this.hasAccess(doc, userId))
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  // Search documents
  public searchDocuments(
    query: string,
    userId: string,
    filters: {
      category?: DocumentCategory;
      tags?: string[];
      dateRange?: { start: Date; end: Date };
      fileType?: string;
    } = {}
  ): DocumentMetadata[] {
    const lowerQuery = query.toLowerCase();
    
    return Array.from(this.documents.values())
      .filter(doc => this.hasAccess(doc, userId))
      .filter(doc => {
        // Text search
        const matchesQuery = !query || 
          doc.originalName.toLowerCase().includes(lowerQuery) ||
          doc.description?.toLowerCase().includes(lowerQuery) ||
          doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
        
        // Category filter
        const matchesCategory = !filters.category || doc.category === filters.category;
        
        // Tags filter
        const matchesTags = !filters.tags || 
          filters.tags.every(tag => doc.tags.includes(tag));
        
        // Date range filter
        const matchesDateRange = !filters.dateRange ||
          (doc.uploadedAt >= filters.dateRange.start && doc.uploadedAt <= filters.dateRange.end);
        
        // File type filter
        const matchesFileType = !filters.fileType || doc.mimeType.includes(filters.fileType);
        
        return matchesQuery && matchesCategory && matchesTags && matchesDateRange && matchesFileType;
      })
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  // Get storage statistics
  public getStorageStats(userId?: string): StorageStats {
    const userDocs = userId 
      ? Array.from(this.documents.values()).filter(doc => doc.uploadedBy === userId)
      : Array.from(this.documents.values());
    
    const totalSize = userDocs.reduce((sum, doc) => sum + doc.size, 0);
    
    const sizeByCategory = userDocs.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + doc.size;
      return acc;
    }, {} as { [category: string]: number });
    
    const sizeByUser = userDocs.reduce((acc, doc) => {
      acc[doc.uploadedBy] = (acc[doc.uploadedBy] || 0) + doc.size;
      return acc;
    }, {} as { [userId: string]: number });
    
    const quota = userId ? this.config.storageQuotaPerUser : this.config.storageQuotaPerOrganization;
    
    return {
      totalFiles: userDocs.length,
      totalSize,
      sizeByCategory,
      sizeByUser,
      quotaUsed: totalSize,
      quotaRemaining: quota - totalSize
    };
  }

  // Organize documents by form submissions
  public organizeFormDocuments(
    formId: string,
    submissionId: string,
    documents: string[]
  ): void {
    documents.forEach(docId => {
      const doc = this.documents.get(docId);
      if (doc) {
        doc.relatedEntityType = 'form';
        doc.relatedEntityId = `${formId}:${submissionId}`;
        doc.category = 'forms';
        this.documents.set(docId, doc);
      }
    });
  }

  // Cleanup expired documents
  public cleanupExpiredDocuments(): number {
    const now = new Date();
    let deletedCount = 0;
    
    for (const [id, doc] of this.documents.entries()) {
      const shouldDelete = 
        (doc.expirationDate && doc.expirationDate < now) ||
        (doc.retentionPolicy && 
         doc.uploadedAt.getTime() + (doc.retentionPolicy * 24 * 60 * 60 * 1000) < now.getTime());
      
      if (shouldDelete) {
        this.deleteDocument(id, 'system');
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  // Archive old documents
  public archiveOldDocuments(daysOld: number = 365): number {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    let archivedCount = 0;
    
    for (const [id, doc] of this.documents.entries()) {
      if (doc.uploadedAt < cutoffDate && doc.category !== 'archive') {
        doc.category = 'archive';
        this.documents.set(id, doc);
        archivedCount++;
      }
    }
    
    return archivedCount;
  }

  // Private helper methods
  private validateFile(file: File): void {
    if (file.size > this.config.maxFileSize) {
      throw new Error(`File too large. Maximum size is ${this.formatFileSize(this.config.maxFileSize)}`);
    }
    
    if (!this.config.allowedMimeTypes.includes(file.type)) {
      throw new Error(`File type not allowed: ${file.type}`);
    }
  }

  private async checkStorageQuota(userId: string, fileSize: number): Promise<void> {
    const userStats = this.getStorageStats(userId);
    if (userStats.quotaUsed + fileSize > this.config.storageQuotaPerUser) {
      throw new Error('Storage quota exceeded');
    }
  }

  private checkAccess(doc: DocumentMetadata, userId: string, action: string): void {
    if (doc.isPublic) return;
    
    if (!this.hasAccess(doc, userId)) {
      throw new Error(`Access denied for ${action} action`);
    }
  }

  private hasAccess(doc: DocumentMetadata, userId: string): boolean {
    if (doc.isPublic) return true;
    if (doc.uploadedBy === userId) return true;
    if (doc.allowedUsers.includes(userId)) return true;
    
    // Role-based access would be checked here with user's roles
    return false;
  }

  private logAccess(doc: DocumentMetadata, userId: string, action: AuditEntry['action'], ipAddress?: string): void {
    const auditEntry: AuditEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      userId,
      action,
      ipAddress,
      details: `${action} action on document: ${doc.originalName}`
    };
    
    doc.auditTrail.push(auditEntry);
    this.documents.set(doc.id, doc);
  }

  private async processAndStoreFile(file: File, metadata: DocumentMetadata): Promise<void> {
    // In a real implementation, this would:
    // 1. Encrypt the file if encryption is enabled
    // 2. Compress if compression is enabled
    // 3. Store to filesystem or cloud storage
    // 4. Generate thumbnails for images/PDFs
    console.log(`Processing file: ${file.name} (${metadata.id})`);
  }

  private async generateDownloadUrl(metadata: DocumentMetadata): Promise<string> {
    // Generate secure, time-limited download URL
    const token = this.generateSecureToken();
    return `${this.config.baseUrl}/download/${metadata.id}?token=${token}`;
  }

  private async calculateChecksum(file: File): Promise<string> {
    // Calculate SHA-256 checksum
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private generateSecureFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `${timestamp}_${randomStr}.${extension}`;
  }

  private generateSecureToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private deleteDocument(id: string, userId: string): void {
    const doc = this.documents.get(id);
    if (doc) {
      this.logAccess(doc, userId, 'delete');
      this.documents.delete(id);
      // In real implementation, also delete the physical file
    }
  }

  private scheduleVirusScan(documentId: string): void {
    // Schedule virus scan - would integrate with antivirus service
    console.log(`Scheduling virus scan for document: ${documentId}`);
  }

  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}