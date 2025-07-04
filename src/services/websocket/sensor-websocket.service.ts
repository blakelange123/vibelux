// sensor-websocket service

export class SensorWebsocketService {
  private static instance: SensorWebsocketService;

  private constructor() {}

  static getInstance(): SensorWebsocketService {
    if (!SensorWebsocketService.instance) {
      SensorWebsocketService.instance = new SensorWebsocketService();
    }
    return SensorWebsocketService.instance;
  }

  async initialize(): Promise<void> {
    // Initialize service
  }

  async execute(params: any): Promise<any> {
    // Execute service logic
    return { success: true, data: params };
  }
}

// Export both named and default exports
export const sensorWebSocket = SensorWebsocketService.getInstance();
export default sensorWebSocket;
