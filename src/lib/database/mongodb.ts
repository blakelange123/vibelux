// MongoDB integration for document storage (photos, AI analysis, configurations)
import { MongoClient, Db, Collection, GridFSBucket } from 'mongodb';

interface MongoConfig {
  uri: string;
  dbName: string;
}

export class DocumentDatabase {
  private client: MongoClient;
  private db: Db;
  private photoBucket: GridFSBucket;

  constructor(config: MongoConfig) {
    this.client = new MongoClient(config.uri);
    this.db = this.client.db(config.dbName);
    this.photoBucket = new GridFSBucket(this.db, { bucketName: 'photos' });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  // Photo storage and retrieval
  async storePhoto(photoData: Buffer, metadata: {
    reportId: string;
    facilityId: string;
    userId: string;
    filename: string;
    mimeType: string;
    quality?: any;
    annotations?: any;
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.photoBucket.openUploadStream(metadata.filename, {
        metadata: {
          ...metadata,
          uploadDate: new Date()
        }
      });

      uploadStream.on('error', reject);
      uploadStream.on('finish', () => resolve(uploadStream.id.toString()));
      uploadStream.end(photoData);
    });
  }

  async getPhoto(photoId: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const downloadStream = this.photoBucket.openDownloadStream(photoId);

      downloadStream.on('data', (chunk) => chunks.push(chunk));
      downloadStream.on('error', reject);
      downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async deletePhoto(photoId: string): Promise<void> {
    await this.photoBucket.delete(photoId);
  }

  // AI Analysis results storage
  async storeAIAnalysis(data: {
    reportId: string;
    facilityId: string;
    analysisType: 'pest_detection' | 'quality_assessment' | 'equipment_inspection';
    results: {
      confidence: number;
      detectedItems: any[];
      recommendations: string[];
      metadata: any;
    };
    modelVersion: string;
    processingTime: number;
  }): Promise<string> {
    const collection = this.db.collection('ai_analysis');
    const result = await collection.insertOne({
      ...data,
      timestamp: new Date(),
      _id: undefined
    });
    return result.insertedId.toString();
  }

  async getAIAnalysis(reportId: string): Promise<any[]> {
    const collection = this.db.collection('ai_analysis');
    return collection.find({ reportId }).toArray();
  }

  // Configuration management
  async storeFacilityConfig(facilityId: string, config: {
    environmentalThresholds: {
      temperature: { min: number; max: number; ideal: number };
      humidity: { min: number; max: number; ideal: number };
      co2: { min: number; max: number; ideal: number };
      vpd: { min: number; max: number; ideal: number };
    };
    alertSettings: {
      email: boolean;
      sms: boolean;
      pushNotifications: boolean;
      escalationRules: any[];
    };
    workflowSettings: {
      autoApprovalThresholds: any;
      requiredApprovals: any;
      trainingRequirements: any;
    };
  }): Promise<void> {
    const collection = this.db.collection('facility_configs');
    await collection.replaceOne(
      { facilityId },
      { facilityId, config, updatedAt: new Date() },
      { upsert: true }
    );
  }

  async getFacilityConfig(facilityId: string): Promise<any> {
    const collection = this.db.collection('facility_configs');
    return collection.findOne({ facilityId });
  }

  // Training content storage
  async storeTrainingContent(moduleId: string, content: {
    lessons: Array<{
      id: string;
      title: string;
      type: 'video' | 'interactive' | 'quiz' | 'document';
      content: any;
      duration: number;
    }>;
    resources: Array<{
      type: 'video' | 'document' | 'image';
      url: string;
      title: string;
      description?: string;
    }>;
    quizzes: Array<{
      id: string;
      questions: Array<{
        question: string;
        type: 'multiple_choice' | 'true_false' | 'essay';
        options?: string[];
        correctAnswer: any;
        explanation?: string;
      }>;
    }>;
  }): Promise<void> {
    const collection = this.db.collection('training_content');
    await collection.replaceOne(
      { moduleId },
      { moduleId, content, updatedAt: new Date() },
      { upsert: true }
    );
  }

  async getTrainingContent(moduleId: string): Promise<any> {
    const collection = this.db.collection('training_content');
    return collection.findOne({ moduleId });
  }

  // Session data storage (for offline sync recovery)
  async storeOfflineSession(sessionId: string, data: {
    userId: string;
    facilityId: string;
    sessionType: string;
    startTime: Date;
    endTime?: Date;
    data: any;
    photos: string[]; // photo IDs
    syncStatus: 'pending' | 'partial' | 'complete';
  }): Promise<void> {
    const collection = this.db.collection('offline_sessions');
    await collection.replaceOne(
      { sessionId },
      { sessionId, ...data, updatedAt: new Date() },
      { upsert: true }
    );
  }

  async getOfflineSession(sessionId: string): Promise<any> {
    const collection = this.db.collection('offline_sessions');
    return collection.findOne({ sessionId });
  }

  async updateOfflineSyncStatus(sessionId: string, status: 'pending' | 'partial' | 'complete'): Promise<void> {
    const collection = this.db.collection('offline_sessions');
    await collection.updateOne(
      { sessionId },
      { $set: { syncStatus: status, updatedAt: new Date() } }
    );
  }

  // Pest identification knowledge base
  async storePestKnowledgeBase(data: {
    pestId: string;
    commonName: string;
    scientificName: string;
    description: string;
    symptoms: string[];
    treatments: Array<{
      product: string;
      method: string;
      timing: string;
      notes?: string;
    }>;
    images: string[]; // photo IDs
    severity: 'low' | 'medium' | 'high' | 'critical';
    crops: string[];
  }): Promise<void> {
    const collection = this.db.collection('pest_knowledge');
    await collection.replaceOne(
      { pestId: data.pestId },
      { ...data, updatedAt: new Date() },
      { upsert: true }
    );
  }

  async searchPests(query: string, crops?: string[]): Promise<any[]> {
    const collection = this.db.collection('pest_knowledge');
    const searchQuery: any = {
      $or: [
        { commonName: { $regex: query, $options: 'i' } },
        { scientificName: { $regex: query, $options: 'i' } },
        { symptoms: { $elemMatch: { $regex: query, $options: 'i' } } }
      ]
    };

    if (crops && crops.length > 0) {
      searchQuery.crops = { $in: crops };
    }

    return collection.find(searchQuery).toArray();
  }

  // Equipment manuals and documentation
  async storeEquipmentDocumentation(equipmentId: string, docs: {
    manuals: Array<{
      type: 'installation' | 'operation' | 'maintenance' | 'troubleshooting';
      title: string;
      fileId: string; // GridFS file ID
      version: string;
    }>;
    specifications: any;
    maintenanceSchedule: Array<{
      task: string;
      frequency: string;
      instructions: string;
      requiredParts?: string[];
    }>;
    troubleshooting: Array<{
      issue: string;
      symptoms: string[];
      solutions: Array<{
        description: string;
        difficulty: 'easy' | 'medium' | 'hard';
        estimatedTime: number;
        requiredTools?: string[];
      }>;
    }>;
  }): Promise<void> {
    const collection = this.db.collection('equipment_docs');
    await collection.replaceOne(
      { equipmentId },
      { equipmentId, docs, updatedAt: new Date() },
      { upsert: true }
    );
  }

  async getEquipmentDocumentation(equipmentId: string): Promise<any> {
    const collection = this.db.collection('equipment_docs');
    return collection.findOne({ equipmentId });
  }

  // Analytics and reporting data
  async storeAnalyticsData(data: {
    facilityId: string;
    reportType: string;
    period: { start: Date; end: Date };
    metrics: any;
    charts: any;
    insights: string[];
    generatedAt: Date;
  }): Promise<string> {
    const collection = this.db.collection('analytics_reports');
    const result = await collection.insertOne(data);
    return result.insertedId.toString();
  }

  async getAnalyticsData(facilityId: string, reportType: string, days: number = 30): Promise<any[]> {
    const collection = this.db.collection('analytics_reports');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return collection.find({
      facilityId,
      reportType,
      'period.start': { $gte: cutoffDate }
    }).sort({ 'period.start': -1 }).toArray();
  }

  // Create indexes for performance
  async createIndexes(): Promise<void> {
    const collections = [
      { name: 'ai_analysis', indexes: [{ reportId: 1 }, { facilityId: 1, timestamp: -1 }] },
      { name: 'facility_configs', indexes: [{ facilityId: 1 }] },
      { name: 'training_content', indexes: [{ moduleId: 1 }] },
      { name: 'offline_sessions', indexes: [{ sessionId: 1 }, { userId: 1, syncStatus: 1 }] },
      { name: 'pest_knowledge', indexes: [{ pestId: 1 }, { commonName: 'text', scientificName: 'text', symptoms: 'text' }] },
      { name: 'equipment_docs', indexes: [{ equipmentId: 1 }] },
      { name: 'analytics_reports', indexes: [{ facilityId: 1, reportType: 1, 'period.start': -1 }] }
    ];

    for (const { name, indexes } of collections) {
      const collection = this.db.collection(name);
      for (const index of indexes) {
        await collection.createIndex(index);
      }
    }
  }
}

// Create a lazy-loaded singleton instance
let documentDBInstance: DocumentDatabase | null = null;

export function getDocumentDB(): DocumentDatabase {
  if (!documentDBInstance) {
    documentDBInstance = new DocumentDatabase({
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      dbName: process.env.MONGODB_DB_NAME || 'vibelux_docs'
    });
  }
  return documentDBInstance;
}

// For backward compatibility - lazy proxy
export const documentDB = new Proxy({} as DocumentDatabase, {
  get(target, prop) {
    const db = getDocumentDB();
    return (db as any)[prop];
  }
});

// Initialize connection and indexes
export async function initializeDocumentDB(): Promise<void> {
  const db = getDocumentDB();
  await db.connect();
  await db.createIndexes();
}