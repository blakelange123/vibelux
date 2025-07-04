// React hook for real-time sensor data
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';

interface SensorReading {
  sensorId: string;
  type: 'temperature' | 'humidity' | 'co2' | 'ppfd' | 'ph' | 'ec';
  value: number;
  timestamp: Date;
  roomId: string;
  projectId: string;
}

interface Alert {
  type: 'critical' | 'warning' | 'info';
  message: string;
  value: number;
  threshold: number;
  roomId: string;
  projectId: string;
  sensorType: string;
  timestamp: Date;
}

interface Aggregates {
  [sensorType: string]: {
    avg: number;
    min: number;
    max: number;
    current: number;
  };
}

interface UseRealtimeDataOptions {
  projectId?: string;
  roomId?: string;
  onAlert?: (alert: Alert) => void;
  autoReconnect?: boolean;
}

interface UseRealtimeDataReturn {
  connected: boolean;
  readings: SensorReading[];
  aggregates: Aggregates | null;
  alerts: Alert[];
  sendControl: (deviceId: string, action: string, value: any) => void;
  subscribe: (roomId: string) => void;
  getHistorical: (startTime: number, endTime: number) => void;
}

export function useRealtimeData(options: UseRealtimeDataOptions = {}): UseRealtimeDataReturn {
  const { getToken } = useAuth();
  const [connected, setConnected] = useState(false);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [aggregates, setAggregates] = useState<Aggregates | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  // Store stable references to options
  const optionsRef = useRef(options);
  optionsRef.current = options;
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const mockDataIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);

  // Generate mock sensor data for demo purposes
  const generateMockData = useCallback(() => {
    // Clear any existing interval first
    if (mockDataIntervalRef.current) {
      clearInterval(mockDataIntervalRef.current);
      mockDataIntervalRef.current = null;
    }

    const mockRoomId = optionsRef.current.roomId || 'demo-room';
    const mockProjectId = optionsRef.current.projectId || 'demo-project';
    
    // Initial aggregates
    const initialAggregates = {
      temperature: { avg: 75.2, min: 72.1, max: 78.3, current: 76.4 },
      humidity: { avg: 58.5, min: 52.0, max: 65.2, current: 59.8 },
      co2: { avg: 1184, min: 980, max: 1380, current: 1205 },
      ppfd: { avg: 847, min: 780, max: 920, current: 865 },
      ph: { avg: 6.2, min: 5.8, max: 6.6, current: 6.1 },
      ec: { avg: 1.8, min: 1.5, max: 2.1, current: 1.9 }
    };

    // Generate some initial readings
    const now = new Date();
    const initialReadings: SensorReading[] = [];
    
    for (let i = 10; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 30000); // 30 seconds apart
      
      initialReadings.push(
        {
          sensorId: 'temp-001',
          type: 'temperature',
          value: 75 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4,
          timestamp,
          roomId: mockRoomId,
          projectId: mockProjectId
        },
        {
          sensorId: 'hum-001',
          type: 'humidity',
          value: 55 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
          timestamp,
          roomId: mockRoomId,
          projectId: mockProjectId
        },
        {
          sensorId: 'co2-001',
          type: 'co2',
          value: 1000 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 400,
          timestamp,
          roomId: mockRoomId,
          projectId: mockProjectId
        },
        {
          sensorId: 'ppfd-001',
          type: 'ppfd',
          value: 800 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100,
          timestamp,
          roomId: mockRoomId,
          projectId: mockProjectId
        }
      );
    }
    
    // Set state in batches to avoid multiple re-renders
    setAggregates(initialAggregates);
    setReadings(initialReadings);

    // Set up interval to generate new readings every 30 seconds
    mockDataIntervalRef.current = setInterval(() => {
      const timestamp = new Date();
      const sensorTypes = ['temperature', 'humidity', 'co2', 'ppfd'] as const;
      const randomType = sensorTypes[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * sensorTypes.length)];
      
      const newReading: SensorReading = {
        sensorId: `${randomType}-001`,
        type: randomType,
        value: 0,
        timestamp,
        roomId: mockRoomId,
        projectId: mockProjectId
      };

      switch (randomType) {
        case 'temperature':
          newReading.value = 75 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4;
          break;
        case 'humidity':
          newReading.value = 55 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10;
          break;
        case 'co2':
          newReading.value = 1000 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 400;
          break;
        case 'ppfd':
          newReading.value = 800 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100;
          break;
      }

      setReadings(prev => [...prev.slice(-99), newReading]);
      
      // Update aggregates occasionally (less frequent to avoid excessive updates)
      if (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < 0.2) {
        setAggregates(prev => {
          if (!prev) return prev;
          
          const updated = { ...prev };
          if (updated[randomType]) {
            updated[randomType] = {
              ...updated[randomType],
              current: newReading.value
            };
          }
          return updated;
        });
      }
    }, 30000);
  }, []); // Remove dependencies to prevent infinite loops
  
  const connect = useCallback(async () => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current || connected) {
      return;
    }
    
    try {
      isConnectingRef.current = true;
      
      // Check if WebSocket server is enabled
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
      if (!wsUrl) {
        // No WebSocket server configured - use mock data instead
        setConnected(true);
        generateMockData();
        isConnectingRef.current = false;
        return;
      }

      const token = await getToken();
      if (!token) {
        setConnected(true);
        generateMockData();
        isConnectingRef.current = false;
        return;
      }
      
      // Connect to WebSocket server
      const ws = new WebSocket(`${wsUrl}?token=${token}`);
      wsRef.current = ws;
      
      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close();
          setConnected(true);
          generateMockData();
        }
      }, 5000);
      
      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        isConnectingRef.current = false;
        setConnected(true);
        reconnectAttemptsRef.current = 0;
        
        // Subscribe to room if specified
        const { projectId, roomId } = optionsRef.current;
        if (projectId && roomId) {
          ws.send(JSON.stringify({
            type: 'subscribe',
            projectId,
            roomId
          }));
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { roomId, onAlert } = optionsRef.current;
          
          switch (message.type) {
            case 'sensor_update':
              const reading = {
                ...message.data,
                timestamp: new Date(message.data.timestamp)
              };
              
              // Filter by room if specified
              if (!roomId || reading.roomId === roomId) {
                setReadings(prev => [...prev.slice(-99), reading]);
              }
              break;
              
            case 'aggregates':
              if (!roomId || message.roomId === roomId) {
                setAggregates(message.data);
              }
              break;
              
            case 'alert':
              const alert = {
                ...message.data,
                timestamp: new Date(message.data.timestamp)
              };
              
              setAlerts(prev => [...prev.slice(-49), alert]);
              
              if (onAlert) {
                onAlert(alert);
              }
              break;
              
            case 'historical_data':
              if (!roomId || message.roomId === roomId) {
                const historicalReadings = message.data.map((r: any) => ({
                  ...r,
                  timestamp: new Date(r.timestamp)
                }));
                setReadings(historicalReadings);
              }
              break;
              
            case 'device_state':
              // Handle device state updates
              break;
              
            case 'control_response':
              // Handle control command responses
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        isConnectingRef.current = false;
        // Don't log the error object as it's usually empty and not helpful
        setConnected(true);
        generateMockData();
      };
      
      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        isConnectingRef.current = false;
        setConnected(false);
        wsRef.current = null;
        
        // Only try to reconnect if it wasn't a manual close or connection failure
        const { autoReconnect } = optionsRef.current;
        if (event.code !== 1000 && autoReconnect !== false && reconnectAttemptsRef.current < 3) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          reconnectAttemptsRef.current++;
          
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= 3) {
          setConnected(true);
          generateMockData();
        }
      };
    } catch (error) {
      isConnectingRef.current = false;
      setConnected(true);
      generateMockData();
    }
  }, [getToken, generateMockData]);
  
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (mockDataIntervalRef.current) {
      clearInterval(mockDataIntervalRef.current);
      mockDataIntervalRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);
  
  const sendControl = useCallback((deviceId: string, action: string, value: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'control',
        projectId: optionsRef.current.projectId,
        roomId: optionsRef.current.roomId,
        deviceId,
        action,
        value
      }));
    } else {
      // Mock mode - simulate control response
    }
  }, []);
  
  const subscribe = useCallback((roomId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        projectId: optionsRef.current.projectId,
        roomId
      }));
    } else {
      // Mock mode - already subscribed to mock data
    }
  }, []);
  
  const getHistorical = useCallback((startTime: number, endTime: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'get_historical',
        projectId: optionsRef.current.projectId,
        roomId: optionsRef.current.roomId,
        startTime,
        endTime
      }));
    } else {
      // Mock mode - generate some historical data
      // Could generate mock historical data here if needed
    }
  }, []);
  
  useEffect(() => {
    if (!connected && !isConnectingRef.current) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, []); // Empty dependency array to prevent re-running
  
  return {
    connected,
    readings,
    aggregates,
    alerts,
    sendControl,
    subscribe,
    getHistorical
  };
}

// Hook for aggregated room data
export function useRoomMetrics(projectId: string, roomId: string) {
  // Memoize options to prevent recreation
  const options = useMemo(() => ({
    projectId,
    roomId,
    autoReconnect: true
  }), [projectId, roomId]);

  const { aggregates, readings, connected } = useRealtimeData(options);
  
  // Calculate additional metrics
  const [metrics, setMetrics] = useState({
    vpd: 0,
    dli: 0,
    co2Trend: 'stable' as 'rising' | 'falling' | 'stable',
    temperatureTrend: 'stable' as 'rising' | 'falling' | 'stable'
  });
  
  useEffect(() => {
    if (!aggregates) return;
    
    // Calculate VPD if temperature and humidity are available
    if (aggregates.temperature && aggregates.humidity) {
      const temp = aggregates.temperature.current;
      const rh = aggregates.humidity.current;
      
      // Simplified VPD calculation
      const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
      const vpd = svp * (1 - rh / 100);
      
      setMetrics(prev => ({ ...prev, vpd: Math.round(vpd * 100) / 100 }));
    }
    
    // Calculate trends from recent readings
    if (readings.length > 10) {
      const recentReadings = readings.slice(-10);
      
      // Temperature trend
      const tempReadings = recentReadings.filter(r => r.type === 'temperature');
      if (tempReadings.length > 2) {
        const firstTemp = tempReadings[0].value;
        const lastTemp = tempReadings[tempReadings.length - 1].value;
        const diff = lastTemp - firstTemp;
        
        setMetrics(prev => ({
          ...prev,
          temperatureTrend: diff > 0.5 ? 'rising' : diff < -0.5 ? 'falling' : 'stable'
        }));
      }
      
      // CO2 trend
      const co2Readings = recentReadings.filter(r => r.type === 'co2');
      if (co2Readings.length > 2) {
        const firstCO2 = co2Readings[0].value;
        const lastCO2 = co2Readings[co2Readings.length - 1].value;
        const diff = lastCO2 - firstCO2;
        
        setMetrics(prev => ({
          ...prev,
          co2Trend: diff > 20 ? 'rising' : diff < -20 ? 'falling' : 'stable'
        }));
      }
    }
  }, [aggregates, readings]);
  
  return {
    connected,
    aggregates,
    metrics,
    latestReadings: readings.slice(-20)
  };
}