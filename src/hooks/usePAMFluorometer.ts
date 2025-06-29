import { useState, useEffect, useCallback, useRef } from 'react';
import { pamFluorometer, PAMReading, PAMProtocol } from '@/services/sensors/pam-fluorometer.service';
import { sensorWebSocket } from '@/services/websocket/sensor-websocket.service';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

interface UsePAMFluorometerOptions {
  autoConnect?: boolean;
  enableWebSocket?: boolean;
  plantId?: string;
  projectId?: string;
  experimentId?: string;
}

interface PAMFluorometerState {
  isConnected: boolean;
  isRecording: boolean;
  currentReading: PAMReading | null;
  historicalData: PAMReading[];
  lightCurveData: Array<{
    ppfd: number;
    phi2: number;
    etr: number;
    qP: number;
    npq: number;
  }>;
  deviceStatus: {
    connected: boolean;
    device: string | null;
    protocol: PAMProtocol | null;
    measuring: boolean;
  };
  error: string | null;
}

export function usePAMFluorometer(options: UsePAMFluorometerOptions = {}) {
  const { userId } = useAuth();
  const [state, setState] = useState<PAMFluorometerState>({
    isConnected: false,
    isRecording: false,
    currentReading: null,
    historicalData: [],
    lightCurveData: [],
    deviceStatus: pamFluorometer.getStatus(),
    error: null
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  // Connect to device
  const connect = useCallback(async (deviceType?: string) => {
    try {
      const connected = await fetch('/api/v1/sensors/fluorescence', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect',
          params: { deviceType }
        })
      }).then(res => res.json());

      if (connected.success) {
        setState(prev => ({
          ...prev,
          isConnected: true,
          deviceStatus: connected.status,
          error: null
        }));
        toast.success('PAM fluorometer connected');
      } else {
        throw new Error('Failed to connect');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to connect to PAM device',
        isConnected: false
      }));
      toast.error('Failed to connect to PAM device');
    }
  }, []);

  // Disconnect from device
  const disconnect = useCallback(async () => {
    try {
      await fetch('/api/v1/sensors/fluorescence', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' })
      });

      setState(prev => ({
        ...prev,
        isConnected: false,
        isRecording: false,
        deviceStatus: pamFluorometer.getStatus()
      }));
      toast.success('PAM fluorometer disconnected');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }, []);

  // Start measurement
  const startMeasurement = useCallback(async (protocol: PAMProtocol) => {
    if (!state.isConnected) {
      toast.error('Please connect PAM device first');
      return;
    }

    try {
      const response = await fetch('/api/v1/sensors/fluorescence', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'startMeasurement',
          params: {
            protocol,
            metadata: {
              plantId: options.plantId,
              projectId: options.projectId,
              experimentId: options.experimentId
            }
          }
        })
      }).then(res => res.json());

      if (response.success) {
        setState(prev => ({
          ...prev,
          isRecording: true,
          deviceStatus: response.status
        }));
        toast.success('Measurement started');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to start measurement'
      }));
      toast.error('Failed to start measurement');
    }
  }, [state.isConnected, options]);

  // Stop measurement
  const stopMeasurement = useCallback(async () => {
    try {
      await fetch('/api/v1/sensors/fluorescence', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stopMeasurement' })
      });

      setState(prev => ({
        ...prev,
        isRecording: false,
        deviceStatus: pamFluorometer.getStatus()
      }));
      toast.success('Measurement stopped');
    } catch (error) {
      console.error('Stop measurement error:', error);
    }
  }, []);

  // Take single measurement
  const takeSingleMeasurement = useCallback(async (lightIntensity?: number) => {
    if (!state.isConnected) {
      toast.error('Please connect PAM device first');
      return null;
    }

    try {
      const reading = await pamFluorometer.takeMeasurement(lightIntensity, {
        plantId: options.plantId,
        leafPosition: 'young-fully-expanded'
      });

      // Save to database
      await fetch('/api/v1/sensors/fluorescence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reading,
          plantId: options.plantId || 'unknown',
          projectId: options.projectId,
          experimentId: options.experimentId,
          lightIntensity
        })
      });

      setState(prev => ({
        ...prev,
        currentReading: reading,
        historicalData: [...prev.historicalData, reading]
      }));

      return reading;
    } catch (error) {
      console.error('Single measurement error:', error);
      toast.error('Failed to take measurement');
      return null;
    }
  }, [state.isConnected, options]);

  // Generate light curve
  const generateLightCurve = useCallback(async (lightLevels?: number[]) => {
    if (!state.isConnected) {
      toast.error('Please connect PAM device first');
      return;
    }

    try {
      toast.info('Generating light curve...');
      
      const response = await fetch('/api/v1/sensors/fluorescence', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateLightCurve',
          params: {
            lightLevels,
            metadata: {
              plantId: options.plantId,
              projectId: options.projectId,
              experimentId: options.experimentId
            }
          }
        })
      }).then(res => res.json());

      if (response.success) {
        const curveData = response.curveData.map((reading: PAMReading) => ({
          ppfd: reading.metadata?.lightIntensity || 0,
          phi2: reading.phi2,
          etr: reading.etr,
          qP: reading.qP,
          npq: reading.npq
        }));

        setState(prev => ({
          ...prev,
          lightCurveData: curveData,
          historicalData: [...prev.historicalData, ...response.curveData]
        }));

        toast.success('Light curve generated successfully');
      }
    } catch (error) {
      console.error('Light curve error:', error);
      toast.error('Failed to generate light curve');
    }
  }, [state.isConnected, options]);

  // Load historical data
  const loadHistoricalData = useCallback(async (query?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) => {
    try {
      const params = new URLSearchParams({
        plantId: options.plantId || '',
        projectId: options.projectId || '',
        limit: String(query?.limit || 100)
      });

      if (query?.startDate) {
        params.set('startDate', query.startDate.toISOString());
      }
      if (query?.endDate) {
        params.set('endDate', query.endDate.toISOString());
      }

      const response = await fetch(`/api/v1/sensors/fluorescence?${params}`)
        .then(res => res.json());

      if (response.success) {
        const readings = response.data.map((record: any) => ({
          ...record.parameters,
          timestamp: new Date(record.timestamp)
        }));

        setState(prev => ({
          ...prev,
          historicalData: readings
        }));
      }
    } catch (error) {
      console.error('Load historical data error:', error);
      toast.error('Failed to load historical data');
    }
  }, [options]);

  // Get statistics
  const getStatistics = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        stats: 'true',
        plantId: options.plantId || ''
      });

      const response = await fetch(`/api/v1/sensors/fluorescence?${params}`)
        .then(res => res.json());

      return response.success ? response.stats : null;
    } catch (error) {
      console.error('Get statistics error:', error);
      return null;
    }
  }, [options]);

  // Export data
  const exportData = useCallback(async (format: 'json' | 'csv' = 'json') => {
    try {
      const params = new URLSearchParams({
        export: 'true',
        format,
        plantId: options.plantId || ''
      });

      const response = await fetch(`/api/v1/sensors/fluorescence?${params}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fluorescence-data-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  }, [options]);

  // Calibrate device
  const calibrate = useCallback(async () => {
    if (!state.isConnected) {
      toast.error('Please connect PAM device first');
      return;
    }

    try {
      toast.info('Calibrating device...');
      
      const response = await fetch('/api/v1/sensors/fluorescence', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'calibrate' })
      }).then(res => res.json());

      if (response.success) {
        toast.success('Calibration complete');
      } else {
        toast.error('Calibration failed');
      }
    } catch (error) {
      console.error('Calibration error:', error);
      toast.error('Calibration failed');
    }
  }, [state.isConnected]);

  // WebSocket integration
  useEffect(() => {
    if (!options.enableWebSocket || !options.plantId) return;

    // Connect to WebSocket
    sensorWebSocket.connect();

    // Subscribe to fluorescence data for this plant
    unsubscribeRef.current = sensorWebSocket.subscribe(
      `pam_${options.plantId}`,
      (data) => {
        if (!isMountedRef.current) return;
        
        if (data.type === 'fluorescence' && data.metadata) {
          const reading: PAMReading = {
            ...data.metadata,
            timestamp: new Date(data.timestamp)
          };

          setState(prev => ({
            ...prev,
            currentReading: reading,
            historicalData: [...prev.historicalData.slice(-99), reading]
          }));
        }
      }
    );

    // WebSocket event listeners
    const handleConnected = () => {
      sensorWebSocket.subscribeToSensor(`pam_${options.plantId}`);
    };

    const handleError = (error: any) => {
      console.error('WebSocket error:', error);
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          error: 'WebSocket connection error'
        }));
      }
    };

    sensorWebSocket.on('connected', handleConnected);
    sensorWebSocket.on('error', handleError);

    return () => {
      isMountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      sensorWebSocket.off('connected', handleConnected);
      sensorWebSocket.off('error', handleError);
    };
  }, [options.enableWebSocket, options.plantId]);

  // Auto-connect on mount if requested
  useEffect(() => {
    if (options.autoConnect) {
      connect();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [options.autoConnect, connect]);

  return {
    // State
    ...state,
    
    // Actions
    connect,
    disconnect,
    startMeasurement,
    stopMeasurement,
    takeSingleMeasurement,
    generateLightCurve,
    loadHistoricalData,
    getStatistics,
    exportData,
    calibrate,
    
    // Utilities
    getHealthStatus: (reading: PAMReading) => {
      if (reading.fvFm >= 0.75) return 'healthy';
      if (reading.fvFm >= 0.60) return 'stressed';
      return 'critical';
    }
  };
}