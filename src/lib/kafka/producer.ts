// Apache Kafka producer for real-time event streaming
import { Kafka, Producer, Message } from 'kafkajs';

interface KafkaConfig {
  brokers: string[];
  clientId: string;
  username?: string;
  password?: string;
  ssl?: boolean;
}

interface EventMessage {
  topic: string;
  key?: string;
  value: any;
  headers?: Record<string, string>;
  partition?: number;
  timestamp?: string;
}

export class EventProducer {
  private kafka: Kafka;
  private producer: Producer;
  private isConnected: boolean = false;

  constructor(config: KafkaConfig) {
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
      ssl: config.ssl,
      sasl: config.username && config.password ? {
        mechanism: 'plain',
        username: config.username,
        password: config.password
      } : undefined
    });

    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.producer.connect();
      this.isConnected = true;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.producer.disconnect();
      this.isConnected = false;
    }
  }

  private async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  // Location tracking events
  async publishLocationUpdate(data: {
    userId: string;
    facilityId: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    battery: number;
    timestamp: Date;
  }): Promise<void> {
    await this.ensureConnected();

    const message: EventMessage = {
      topic: 'location-updates',
      key: data.userId,
      value: {
        ...data,
        eventType: 'location_update',
        timestamp: data.timestamp.toISOString()
      }
    };

    await this.sendMessage(message);
  }

  // Photo report events
  async publishPhotoReport(data: {
    reportId: string;
    userId: string;
    facilityId: string;
    type: string;
    severity: string;
    location: string;
    status: string;
    timestamp: Date;
  }): Promise<void> {
    await this.ensureConnected();

    const message: EventMessage = {
      topic: 'photo-reports',
      key: data.reportId,
      value: {
        ...data,
        eventType: 'photo_report_created',
        timestamp: data.timestamp.toISOString()
      }
    };

    await this.sendMessage(message);
  }

  async publishReportStatusChange(data: {
    reportId: string;
    oldStatus: string;
    newStatus: string;
    reviewedBy?: string;
    timestamp: Date;
  }): Promise<void> {
    await this.ensureConnected();

    const message: EventMessage = {
      topic: 'photo-reports',
      key: data.reportId,
      value: {
        ...data,
        eventType: 'report_status_changed',
        timestamp: data.timestamp.toISOString()
      }
    };

    await this.sendMessage(message);
  }

  // Environmental sensor events
  async publishEnvironmentalData(data: {
    facilityId: string;
    zoneId: string;
    sensorId: string;
    temperature: number;
    humidity: number;
    co2: number;
    vpd: number;
    lightLevel: number;
    timestamp: Date;
  }): Promise<void> {
    await this.ensureConnected();

    const message: EventMessage = {
      topic: 'environmental-data',
      key: `${data.facilityId}-${data.zoneId}-${data.sensorId}`,
      value: {
        ...data,
        eventType: 'sensor_reading',
        timestamp: data.timestamp.toISOString()
      }
    };

    await this.sendMessage(message);
  }

  // Harvest events
  async publishHarvestEvent(data: {
    batchId: string;
    facilityId: string;
    eventType: 'harvest_started' | 'harvest_completed' | 'batch_graded';
    strain: string;
    actualYield?: number;
    estimatedYield?: number;
    grade?: string;
    timestamp: Date;
  }): Promise<void> {
    await this.ensureConnected();

    const message: EventMessage = {
      topic: 'harvest-events',
      key: data.batchId,
      value: {
        ...data,
        timestamp: data.timestamp.toISOString()
      }
    };

    await this.sendMessage(message);
  }

  // IPM scouting events
  async publishIPMEvent(data: {
    routeId: string;
    sessionId: string;
    facilityId: string;
    userId: string;
    eventType: 'route_started' | 'stop_completed' | 'pest_detected' | 'route_completed';
    zoneId?: string;
    pestType?: string;
    severity?: string;
    timestamp: Date;
  }): Promise<void> {
    await this.ensureConnected();

    const message: EventMessage = {
      topic: 'ipm-events',
      key: data.sessionId,
      value: {
        ...data,
        timestamp: data.timestamp.toISOString()
      }
    };

    await this.sendMessage(message);
  }

  // Spray application events
  async publishSprayEvent(data: {
    applicationId: string;
    facilityId: string;
    userId: string;
    eventType: 'application_started' | 'application_completed' | 'reentry_restriction_set';
    productName: string;
    zones: string[];
    reEntryInterval?: number;
    timestamp: Date;
  }): Promise<void> {
    await this.ensureConnected();

    const message: EventMessage = {
      topic: 'spray-events',
      key: data.applicationId,
      value: {
        ...data,
        timestamp: data.timestamp.toISOString()
      }
    };

    await this.sendMessage(message);
  }

  // Equipment events
  async publishEquipmentEvent(data: {
    equipmentId: string;
    facilityId: string;
    eventType: 'equipment_online' | 'equipment_offline' | 'maintenance_required' | 'maintenance_completed';
    status: string;
    details?: any;
    timestamp: Date;
  }): Promise<void> {
    await this.ensureConnected();

    const message: EventMessage = {
      topic: 'equipment-events',
      key: data.equipmentId,
      value: {
        ...data,
        timestamp: data.timestamp.toISOString()
      }
    };

    await this.sendMessage(message);
  }

  // Training events
  async publishTrainingEvent(data: {
    userId: string;
    moduleId: string;
    eventType: 'module_started' | 'lesson_completed' | 'quiz_passed' | 'certification_earned';
    score?: number;
    attempts?: number;
    timestamp: Date;
  }): Promise<void> {
    await this.ensureConnected();

    const message: EventMessage = {
      topic: 'training-events',
      key: `${data.userId}-${data.moduleId}`,
      value: {
        ...data,
        timestamp: data.timestamp.toISOString()
      }
    };

    await this.sendMessage(message);
  }

  // System events
  async publishSystemEvent(data: {
    facilityId?: string;
    eventType: 'user_login' | 'user_logout' | 'system_error' | 'data_sync_completed';
    userId?: string;
    details?: any;
    severity: 'info' | 'warning' | 'error' | 'critical';
    timestamp: Date;
  }): Promise<void> {
    await this.ensureConnected();

    const message: EventMessage = {
      topic: 'system-events',
      key: data.facilityId || 'system',
      value: {
        ...data,
        timestamp: data.timestamp.toISOString()
      }
    };

    await this.sendMessage(message);
  }

  // Alert events
  async publishAlert(data: {
    alertId: string;
    facilityId: string;
    type: 'environmental' | 'safety' | 'equipment' | 'pest' | 'compliance';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    source: string;
    targetUsers?: string[];
    timestamp: Date;
  }): Promise<void> {
    await this.ensureConnected();

    const message: EventMessage = {
      topic: 'alerts',
      key: data.alertId,
      value: {
        ...data,
        timestamp: data.timestamp.toISOString()
      }
    };

    await this.sendMessage(message);
  }

  // Batch message sending
  async sendBatch(messages: EventMessage[]): Promise<void> {
    await this.ensureConnected();

    // Group messages by topic
    const messagesByTopic: Record<string, Message[]> = {};

    for (const msg of messages) {
      if (!messagesByTopic[msg.topic]) {
        messagesByTopic[msg.topic] = [];
      }

      messagesByTopic[msg.topic].push({
        key: msg.key,
        value: JSON.stringify(msg.value),
        headers: msg.headers,
        partition: msg.partition,
        timestamp: msg.timestamp
      });
    }

    // Send messages for each topic
    const topicMessages = Object.entries(messagesByTopic).map(([topic, msgs]) => ({
      topic,
      messages: msgs
    }));

    await this.producer.sendBatch({
      topicMessages
    });
  }

  // Send single message
  private async sendMessage(message: EventMessage): Promise<void> {
    await this.producer.send({
      topic: message.topic,
      messages: [{
        key: message.key,
        value: JSON.stringify(message.value),
        headers: message.headers,
        partition: message.partition,
        timestamp: message.timestamp
      }]
    });
  }

  // Transaction support for critical operations
  async sendTransaction(messages: EventMessage[]): Promise<void> {
    await this.ensureConnected();

    const transaction = await this.producer.transaction();

    try {
      for (const message of messages) {
        await transaction.send({
          topic: message.topic,
          messages: [{
            key: message.key,
            value: JSON.stringify(message.value),
            headers: message.headers,
            partition: message.partition,
            timestamp: message.timestamp
          }]
        });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.abort();
      throw error;
    }
  }
}

// Singleton instance
export const eventProducer = new EventProducer({
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  clientId: process.env.KAFKA_CLIENT_ID || 'vibelux-producer',
  username: process.env.KAFKA_USERNAME,
  password: process.env.KAFKA_PASSWORD,
  ssl: process.env.KAFKA_SSL === 'true'
});

// Initialize connection
export async function initializeEventProducer(): Promise<void> {
  await eventProducer.connect();
}

// Graceful shutdown
export async function shutdownEventProducer(): Promise<void> {
  await eventProducer.disconnect();
}