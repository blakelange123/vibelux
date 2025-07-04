import { useState, useEffect, useCallback } from 'react';

export interface PAMReading {
  timestamp: Date;
  fvFm: number; // Maximum quantum yield (0-1)
  fvFmPrime: number; // Effective quantum yield
  etr: number; // Electron transport rate
  nfq: number; // Non-photochemical quenching
  qp: number; // Photochemical quenching
  temperature: number;
}

export interface PAMDevice {
  id: string;
  name: string;
  model: string;
  status: 'connected' | 'disconnected' | 'error';
  lastReading?: PAMReading;
}

export function usePAMFluorometer() {
  const [devices, setDevices] = useState<PAMDevice[]>([]);
  const [currentDevice, setCurrentDevice] = useState<PAMDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [readings, setReadings] = useState<PAMReading[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate device discovery
  useEffect(() => {
    const mockDevices: PAMDevice[] = [
      {
        id: 'pam-001',
        name: 'PAM-2500',
        model: 'Walz PAM-2500',
        status: 'disconnected'
      }
    ];
    setDevices(mockDevices);
  }, []);

  const connectDevice = useCallback(async (deviceId: string) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const device = devices.find(d => d.id === deviceId);
      if (device) {
        const connectedDevice = { ...device, status: 'connected' as const };
        setCurrentDevice(connectedDevice);
        setDevices(devices.map(d => d.id === deviceId ? connectedDevice : d));
      }
    } catch (err) {
      setError('Failed to connect to PAM fluorometer');
    } finally {
      setIsConnecting(false);
    }
  }, [devices]);

  const disconnectDevice = useCallback(() => {
    if (currentDevice) {
      const disconnectedDevice = { ...currentDevice, status: 'disconnected' as const };
      setDevices(devices.map(d => d.id === currentDevice.id ? disconnectedDevice : d));
      setCurrentDevice(null);
      setIsRecording(false);
    }
  }, [currentDevice, devices]);

  const startRecording = useCallback(() => {
    if (currentDevice && currentDevice.status === 'connected') {
      setIsRecording(true);
      setError(null);
    }
  }, [currentDevice]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  const takeReading = useCallback(async () => {
    if (!currentDevice || currentDevice.status !== 'connected') {
      setError('No device connected');
      return null;
    }

    try {
      // Simulate PAM measurement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const reading: PAMReading = {
        timestamp: new Date(),
        fvFm: 0.75 + Math.random() * 0.1, // Healthy range: 0.75-0.85
        fvFmPrime: 0.5 + Math.random() * 0.2,
        etr: 100 + Math.random() * 50,
        nfq: 0.2 + Math.random() * 0.3,
        qp: 0.6 + Math.random() * 0.2,
        temperature: 23 + Math.random() * 2
      };

      setReadings(prev => [...prev, reading]);
      
      // Update device with last reading
      const updatedDevice = { ...currentDevice, lastReading: reading };
      setCurrentDevice(updatedDevice);
      setDevices(devices.map(d => d.id === currentDevice.id ? updatedDevice : d));
      
      return reading;
    } catch (err) {
      setError('Failed to take reading');
      return null;
    }
  }, [currentDevice, devices]);

  const clearReadings = useCallback(() => {
    setReadings([]);
  }, []);

  // Simulate continuous recording
  useEffect(() => {
    if (isRecording && currentDevice) {
      const interval = setInterval(() => {
        takeReading();
      }, 2000); // Take reading every 2 seconds

      return () => clearInterval(interval);
    }
  }, [isRecording, currentDevice, takeReading]);

  return {
    devices,
    currentDevice,
    isConnecting,
    readings,
    isRecording,
    error,
    connectDevice,
    disconnectDevice,
    startRecording,
    stopRecording,
    takeReading,
    clearReadings
  };
}