import { useState, useEffect, useCallback } from 'react';

interface Fixture {
  id: string;
  x: number;
  y: number;
  z: number;
  model: string;
  power: number;
}

interface Design {
  id: string;
  name: string;
  fixtures: Fixture[];
  roomDimensions: {
    width: number;
    length: number;
    height: number;
  };
}

export function useDesignSync() {
  const [currentDesign, setCurrentDesign] = useState<Design | null>({
    id: '1',
    name: 'Default Design',
    fixtures: [],
    roomDimensions: {
      width: 10,
      length: 10,
      height: 3
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const getFixturesForSensor = useCallback((sensorId: string) => {
    // Return fixtures near the sensor
    return currentDesign?.fixtures || [];
  }, [currentDesign]);

  const syncDesign = useCallback(async (designData: Design) => {
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      // Simulate sync operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentDesign(designData);
      setLastSyncTime(new Date());
      return { success: true };
    } catch (error) {
      setSyncError('Failed to sync design');
      return { success: false, error };
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return {
    currentDesign,
    getFixturesForSensor,
    roomDimensions: currentDesign?.roomDimensions || { width: 10, length: 10, height: 3 },
    syncDesign,
    isSyncing,
    lastSyncTime,
    syncError
  };
}