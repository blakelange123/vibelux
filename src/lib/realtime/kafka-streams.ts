import { Kafka, KafkaConfig, Producer, Consumer, Admin, EachMessagePayload } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { TimeSeriesData } from '../../services/data-architecture-service';

export interface KafkaStreamsConfig {
  brokers: string[];
  schemaRegistry: string;
  clientId: string;
  ssl?: boolean;
  sasl?: {
    mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512';
    username: string;
    password: string;
  };
}

export interface ConnectorConfig {
  name: string;
  config: Record<string, any>;
}

export interface StreamProcessor {
  inputTopic: string;
  outputTopic: string;
  processor: (message: any) => Promise<any>;
}

export interface SchemaDefinition {
  subject: string;
  schema: any;
  schemaType?: 'AVRO' | 'JSON' | 'PROTOBUF';
}

export class KafkaStreams {
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<string, Consumer> = new Map();
  private admin: Admin;
  private schemaRegistry: SchemaRegistry;
  private config: KafkaStreamsConfig;
  private streamProcessors: Map<string, StreamProcessor> = new Map();

  constructor(config: KafkaStreamsConfig) {
    this.config = config;
    
    const kafkaConfig: KafkaConfig = {
      clientId: config.clientId,
      brokers: config.brokers,
      ssl: config.ssl,
      sasl: config.sasl,
    };

    this.kafka = new Kafka(kafkaConfig);
    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000,
    });
    
    this.admin = this.kafka.admin();
    
    this.schemaRegistry = new SchemaRegistry({
      host: config.schemaRegistry,
    });
  }

  async connect(): Promise<void> {
    try {
      await Promise.all([
        this.producer.connect(),
        this.admin.connect(),
      ]);
      
    } catch (error) {
      console.error('Failed to connect to Kafka:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    const disconnectPromises = [
      this.producer.disconnect(),
      this.admin.disconnect(),
    ];

    // Disconnect all consumers
    for (const consumer of this.consumers.values()) {
      disconnectPromises.push(consumer.disconnect());
    }

    await Promise.all(disconnectPromises);
  }

  // Schema Registry operations
  async registerSchemas(): Promise<void> {
    const schemas: SchemaDefinition[] = [
      {
        subject: 'time-series-events-value',
        schemaType: 'AVRO',
        schema: {
          type: 'record',
          name: 'TimeSeriesEvent',
          fields: [
            { name: 'measurement', type: 'string' },
            { name: 'timestamp', type: { type: 'long', logicalType: 'timestamp-millis' } },
            { name: 'tags', type: { type: 'map', values: 'string' } },
            { name: 'fields', type: { type: 'map', values: 'double' } },
          ],
        },
      },
      {
        subject: 'log-events-value',
        schemaType: 'AVRO',
        schema: {
          type: 'record',
          name: 'LogEvent',
          fields: [
            { name: 'id', type: 'string' },
            { name: 'timestamp', type: { type: 'long', logicalType: 'timestamp-millis' } },
            { name: 'level', type: { type: 'enum', name: 'LogLevel', symbols: ['info', 'warn', 'error'] } },
            { name: 'message', type: 'string' },
            { name: 'metadata', type: { type: 'map', values: 'string' } },
          ],
        },
      },
      {
        subject: 'analytics-events-value',
        schemaType: 'JSON',
        schema: {
          type: 'object',
          properties: {
            eventId: { type: 'string' },
            userId: { type: 'string' },
            eventType: { type: 'string' },
            timestamp: { type: 'integer' },
            properties: { type: 'object' },
          },
          required: ['eventId', 'eventType', 'timestamp'],
        },
      },
    ];

    for (const schema of schemas) {
      try {
        await this.schemaRegistry.register(schema);
      } catch (error) {
        console.error(`Failed to register schema ${schema.subject}:`, error);
      }
    }
  }

  // Create topics with optimal configurations
  async createTopics(topics: Array<{
    topic: string;
    numPartitions?: number;
    replicationFactor?: number;
    configEntries?: Array<{ name: string; value: string }>;
  }>): Promise<void> {
    try {
      await this.admin.createTopics({
        topics: topics.map(t => ({
          topic: t.topic,
          numPartitions: t.numPartitions || 6,
          replicationFactor: t.replicationFactor || 3,
          configEntries: [
            { name: 'compression.type', value: 'lz4' },
            { name: 'retention.ms', value: '604800000' }, // 7 days
            { name: 'segment.ms', value: '86400000' }, // 1 day
            { name: 'cleanup.policy', value: 'delete' },
            ...(t.configEntries || []),
          ],
        })),
      });
      
    } catch (error) {
      console.error('Failed to create topics:', error);
      throw error;
    }
  }

  // Publish time-series events with schema validation
  async publishTimeSeriesEvents(data: TimeSeriesData[]): Promise<void> {
    try {
      const schemaId = await this.schemaRegistry.getLatestSchemaId('time-series-events-value');
      
      const messages = await Promise.all(
        data.map(async (event) => {
          const encodedValue = await this.schemaRegistry.encode(schemaId, {
            measurement: event.measurement,
            timestamp: event.timestamp.getTime(),
            tags: event.tags,
            fields: event.fields,
          });

          return {
            key: `${event.measurement}-${Object.values(event.tags).join('-')}`,
            value: encodedValue,
            timestamp: event.timestamp.getTime().toString(),
          };
        })
      );

      await this.producer.send({
        topic: 'time-series-events',
        messages,
      });
    } catch (error) {
      console.error('Failed to publish time-series events:', error);
      throw error;
    }
  }

  // Publish log events
  async publishLogEvents(logs: Array<{
    id: string;
    timestamp: Date;
    level: 'info' | 'warn' | 'error';
    message: string;
    metadata: Record<string, any>;
  }>): Promise<void> {
    try {
      const schemaId = await this.schemaRegistry.getLatestSchemaId('log-events-value');
      
      const messages = await Promise.all(
        logs.map(async (log) => {
          const encodedValue = await this.schemaRegistry.encode(schemaId, {
            id: log.id,
            timestamp: log.timestamp.getTime(),
            level: log.level,
            message: log.message,
            metadata: Object.fromEntries(
              Object.entries(log.metadata).map(([k, v]) => [k, JSON.stringify(v)])
            ),
          });

          return {
            key: log.id,
            value: encodedValue,
            partition: this.getPartitionForLog(log.level),
          };
        })
      );

      await this.producer.send({
        topic: 'log-events',
        messages,
      });
    } catch (error) {
      console.error('Failed to publish log events:', error);
      throw error;
    }
  }

  private getPartitionForLog(level: string): number {
    // Route critical logs to specific partitions for priority processing
    switch (level) {
      case 'error': return 0;
      case 'warn': return 1;
      default: return 2;
    }
  }

  // Stream processing with Kafka Streams DSL-like API
  async createStreamProcessor(processor: StreamProcessor): Promise<void> {
    const consumer = this.kafka.consumer({
      groupId: `${processor.inputTopic}-processor`,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });

    await consumer.connect();
    await consumer.subscribe({ topic: processor.inputTopic });

    this.consumers.set(processor.inputTopic, consumer);
    this.streamProcessors.set(processor.inputTopic, processor);

    await consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        try {
          // Decode message using schema registry
          const decodedValue = await this.schemaRegistry.decode(payload.message.value!);
          
          // Process the message
          const result = await processor.processor(decodedValue);
          
          if (result && processor.outputTopic) {
            // Publish processed result to output topic
            await this.publishProcessedMessage(processor.outputTopic, result, payload.message.key);
          }

          // Commit offset after successful processing
          await consumer.commitOffsets([{
            topic: payload.topic,
            partition: payload.partition,
            offset: (parseInt(payload.message.offset) + 1).toString(),
          }]);
        } catch (error) {
          console.error('Stream processing error:', error);
          // Implement dead letter queue or retry logic here
        }
      },
    });
  }

  private async publishProcessedMessage(
    topic: string,
    data: any,
    key?: Buffer | string | null
  ): Promise<void> {
    // Get appropriate schema for the output topic
    const schemaId = await this.schemaRegistry.getLatestSchemaId(`${topic}-value`);
    const encodedValue = await this.schemaRegistry.encode(schemaId, data);

    await this.producer.send({
      topic,
      messages: [{
        key: key?.toString(),
        value: encodedValue,
      }],
    });
  }

  // Kafka Connect integration
  async setupConnectors(connectors: ConnectorConfig[]): Promise<void> {
    // This would typically interact with Kafka Connect REST API
    // For demonstration, we'll show the connector configurations
    
    for (const connector of connectors) {
      try {
        await this.registerConnector(connector);
      } catch (error) {
        console.error(`Failed to register connector ${connector.name}:`, error);
      }
    }
  }

  private async registerConnector(connector: ConnectorConfig): Promise<void> {
    // In a real implementation, this would make HTTP calls to Kafka Connect REST API
    const connectUrl = process.env.KAFKA_CONNECT_URL || 'http://localhost:8083';
    
    const response = await fetch(`${connectUrl}/connectors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: connector.name,
        config: {
          'connector.class': connector.config['connector.class'],
          'tasks.max': '1',
          ...connector.config,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to register connector: ${response.statusText}`);
    }
  }

  // Advanced streaming patterns
  async createAggregationStream(
    inputTopic: string,
    outputTopic: string,
    windowSizeMs: number = 60000,
    aggregationFn: (messages: any[]) => any
  ): Promise<void> {
    const windowStore: Map<string, any[]> = new Map();
    
    await this.createStreamProcessor({
      inputTopic,
      outputTopic,
      processor: async (message: any) => {
        const windowKey = this.getWindowKey(message.timestamp, windowSizeMs);
        
        if (!windowStore.has(windowKey)) {
          windowStore.set(windowKey, []);
        }
        
        windowStore.get(windowKey)!.push(message);
        
        // Clean up old windows
        this.cleanupOldWindows(windowStore, windowSizeMs);
        
        // Check if window is complete
        if (this.isWindowComplete(windowKey, windowSizeMs)) {
          const windowData = windowStore.get(windowKey)!;
          const aggregatedResult = aggregationFn(windowData);
          
          windowStore.delete(windowKey);
          return aggregatedResult;
        }
        
        return null; // Don't emit anything yet
      },
    });
  }

  private getWindowKey(timestamp: number, windowSizeMs: number): string {
    const windowStart = Math.floor(timestamp / windowSizeMs) * windowSizeMs;
    return windowStart.toString();
  }

  private cleanupOldWindows(windowStore: Map<string, any[]>, windowSizeMs: number): void {
    const cutoffTime = Date.now() - (windowSizeMs * 2); // Keep 2 windows worth of data
    
    for (const [key] of windowStore) {
      if (parseInt(key) < cutoffTime) {
        windowStore.delete(key);
      }
    }
  }

  private isWindowComplete(windowKey: string, windowSizeMs: number): boolean {
    const windowStart = parseInt(windowKey);
    const windowEnd = windowStart + windowSizeMs;
    return Date.now() >= windowEnd;
  }

  // Stream joins
  async createStreamJoin(
    leftTopic: string,
    rightTopic: string,
    outputTopic: string,
    joinKeyExtractor: (message: any) => string,
    joinWindowMs: number = 30000
  ): Promise<void> {
    const leftStore: Map<string, { data: any; timestamp: number }> = new Map();
    const rightStore: Map<string, { data: any; timestamp: number }> = new Map();
    
    // Process left stream
    await this.createStreamProcessor({
      inputTopic: leftTopic,
      outputTopic: '',
      processor: async (leftMessage: any) => {
        const joinKey = joinKeyExtractor(leftMessage);
        leftStore.set(joinKey, { data: leftMessage, timestamp: Date.now() });
        
        // Look for matching right message
        const rightMatch = rightStore.get(joinKey);
        if (rightMatch && this.isWithinJoinWindow(rightMatch.timestamp, joinWindowMs)) {
          const joinedResult = {
            left: leftMessage,
            right: rightMatch.data,
            joinedAt: new Date(),
          };
          
          // Publish joined result
          await this.publishProcessedMessage(outputTopic, joinedResult, joinKey);
          
          // Clean up matched records
          leftStore.delete(joinKey);
          rightStore.delete(joinKey);
        }
        
        return null;
      },
    });
    
    // Process right stream
    await this.createStreamProcessor({
      inputTopic: rightTopic,
      outputTopic: '',
      processor: async (rightMessage: any) => {
        const joinKey = joinKeyExtractor(rightMessage);
        rightStore.set(joinKey, { data: rightMessage, timestamp: Date.now() });
        
        // Look for matching left message
        const leftMatch = leftStore.get(joinKey);
        if (leftMatch && this.isWithinJoinWindow(leftMatch.timestamp, joinWindowMs)) {
          const joinedResult = {
            left: leftMatch.data,
            right: rightMessage,
            joinedAt: new Date(),
          };
          
          // Publish joined result
          await this.publishProcessedMessage(outputTopic, joinedResult, joinKey);
          
          // Clean up matched records
          leftStore.delete(joinKey);
          rightStore.delete(joinKey);
        }
        
        return null;
      },
    });
  }

  private isWithinJoinWindow(timestamp: number, windowMs: number): boolean {
    return (Date.now() - timestamp) <= windowMs;
  }

  // Dead letter queue handling
  async setupDeadLetterQueue(originalTopic: string): Promise<void> {
    const dlqTopic = `${originalTopic}-dlq`;
    
    await this.createTopics([{
      topic: dlqTopic,
      numPartitions: 1,
      configEntries: [
        { name: 'retention.ms', value: '2592000000' }, // 30 days
      ],
    }]);
  }

  async publishToDeadLetterQueue(
    originalTopic: string,
    failedMessage: any,
    error: Error
  ): Promise<void> {
    const dlqTopic = `${originalTopic}-dlq`;
    
    await this.producer.send({
      topic: dlqTopic,
      messages: [{
        key: failedMessage.key,
        value: JSON.stringify({
          originalMessage: failedMessage,
          error: error.message,
          failedAt: new Date(),
        }),
      }],
    });
  }

  // Monitoring and metrics
  async getTopicMetrics(topic: string): Promise<any> {
    try {
      const metadata = await this.admin.fetchTopicMetadata({ topics: [topic] });
      const offsets = await this.admin.fetchTopicOffsets(topic);
      
      return {
        topic,
        partitions: metadata.topics[0].partitions.length,
        totalMessages: offsets.reduce((sum, partition) => 
          sum + parseInt(partition.high) - parseInt(partition.low), 0
        ),
        partitionDetails: offsets,
      };
    } catch (error) {
      console.error(`Failed to get metrics for topic ${topic}:`, error);
      throw error;
    }
  }

  // Consumer lag monitoring
  async getConsumerLag(groupId: string): Promise<any> {
    try {
      const groupDescription = await this.admin.describeGroups([groupId]);
      const group = groupDescription.groups[0];
      
      if (group.state !== 'Stable') {
        return { groupId, state: group.state, lag: null };
      }
      
      // This would require additional logic to calculate actual lag
      // In production, you'd use tools like Kafka Manager or Burrow
      return {
        groupId,
        state: group.state,
        members: group.members.length,
        // lag calculation would go here
      };
    } catch (error) {
      console.error(`Failed to get consumer lag for group ${groupId}:`, error);
      throw error;
    }
  }
}

// Utility classes for common stream processing patterns
export class StreamProcessingUtils {
  static createTimeSeriesAggregator(windowSizeMs: number = 60000) {
    return (messages: any[]) => {
      const aggregated = messages.reduce((acc, msg) => {
        const measurement = msg.measurement;
        if (!acc[measurement]) {
          acc[measurement] = { count: 0, sum: 0, min: Infinity, max: -Infinity };
        }
        
        Object.entries(msg.fields).forEach(([field, value]) => {
          const numValue = Number(value);
          acc[measurement].count++;
          acc[measurement].sum += numValue;
          acc[measurement].min = Math.min(acc[measurement].min, numValue);
          acc[measurement].max = Math.max(acc[measurement].max, numValue);
        });
        
        return acc;
      }, {} as any);
      
      // Calculate averages
      Object.keys(aggregated).forEach(measurement => {
        aggregated[measurement].avg = aggregated[measurement].sum / aggregated[measurement].count;
      });
      
      return {
        windowStart: new Date(Math.floor(Date.now() / windowSizeMs) * windowSizeMs),
        windowEnd: new Date(Math.floor(Date.now() / windowSizeMs) * windowSizeMs + windowSizeMs),
        aggregations: aggregated,
      };
    };
  }

  static createAnomalyDetector(threshold: number = 2.0) {
    return (message: any) => {
      // Simple statistical anomaly detection
      // In production, you'd use more sophisticated algorithms
      const values = Object.values(message.fields) as number[];
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      
      const anomalies = values.filter(val => Math.abs(val - mean) > threshold * stdDev);
      
      if (anomalies.length > 0) {
        return {
          ...message,
          anomalyDetected: true,
          anomalousValues: anomalies,
          threshold,
          detectedAt: new Date(),
        };
      }
      
      return null; // No anomaly detected
    };
  }
}