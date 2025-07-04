import { useEffect, useState, useRef } from 'react';
import { DashboardWidget } from '@/components/dashboard/DashboardBuilder';

interface DataBindingResult {
  data: any;
  loading: boolean;
  error: Error | null;
}

// Mock data sources for demonstration
const mockDataSources = {
  modbus: {
    'holding:1:100': () => ({ value: 72.5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5 }),
    'holding:1:101': () => ({ value: 65 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 }),
    'coil:1:0': () => ({ value: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.5 })
  },
  sensor: {
    'zone1/temperature': () => ({ value: 72 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3 }),
    'zone1/humidity': () => ({ value: 65 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5 }),
    'zone1/ppfd': () => ({ value: 600 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100 }),
    'rack3/ppfd': () => ({ value: 550 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50 })
  },
  database: {
    'sensors.latest.temperature': () => ({ value: 73.2, previousValue: 72.8 }),
    'sensors.latest.humidity': () => ({ value: 68.5, previousValue: 67.2 })
  },
  calculation: {
    'avg(zone1/temp, zone2/temp)': () => ({ value: 72.5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2 })
  },
  websocket: {
    'realtime/sensor/123': () => ({ value: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100 })
  }
};

// Generate time series data
const generateTimeSeries = (hours: number, valueGen: () => number) => {
  const now = Date.now();
  const interval = (hours * 60 * 60 * 1000) / 100; // 100 points
  return Array.from({ length: 100 }, (_, i) => ({
    timestamp: now - (99 - i) * interval,
    value: valueGen()
  }));
};

// Generate heatmap data
const generateHeatmap = (rows: number, cols: number) => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 500 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 300)
  );
};

export function useDataBinding(
  widget: DashboardWidget,
  isLive: boolean = true
): DataBindingResult {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRefs = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Clear existing intervals
    intervalRefs.current.forEach(clearInterval);
    intervalRefs.current = [];

    if (!isLive || !widget.dataBindings || widget.dataBindings.length === 0) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        let result: any = {};

        // Handle different widget types based on type first, then bindings
        switch (widget.type) {
          case 'trend':
            // Generate time series data
            const timeRange = widget.config?.timeRange || '24h';
            const hours = timeRange === '1h' ? 1 : timeRange === '7d' ? 168 : timeRange === '30d' ? 720 : 24;
            result.series = generateTimeSeries(hours, () => 70 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10);
            break;

          case 'heatmap':
            // Generate heatmap data
            const rows = widget.config?.rows || 10;
            const cols = widget.config?.cols || 10;
            result.values = generateHeatmap(rows, cols);
            break;

          case 'alarm':
            // Generate alarm data
            result.alarms = [
              {
                id: '1',
                severity: 'critical',
                message: 'Zone 3 temperature exceeds threshold',
                timestamp: new Date(Date.now() - 1000 * 60 * 5),
                acknowledged: false
              },
              {
                id: '2',
                severity: 'warning',
                message: 'Humidity sensor offline in Rack A',
                timestamp: new Date(Date.now() - 1000 * 60 * 15),
                acknowledged: false
              },
              {
                id: '3',
                severity: 'info',
                message: 'Maintenance scheduled for pump 2',
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
                acknowledged: true
              }
            ];
            break;

          default:
            // For other widgets, fetch data from bindings or provide default data
            if (widget.dataBindings && widget.dataBindings.length > 0) {
              for (const binding of widget.dataBindings) {
                const mockSource = mockDataSources[binding.source as keyof typeof mockDataSources];
                const mockPath = mockSource?.[binding.path as keyof typeof mockSource];
                
                if (mockPath) {
                  const rawData = mockPath();
                  let value = rawData.value;

                  // Apply transform if specified
                  if (binding.transform) {
                    try {
                      // Create a safe evaluation context
                      const func = new Function('value', `return ${binding.transform}`);
                      value = func(value);
                    } catch (e) {
                      console.error('Transform error:', e);
                    }
                  }

                  result = { ...result, ...rawData, value };
                }
              }
            } else {
              // Provide default demo data based on widget type
              switch (widget.type) {
                case 'gauge':
                case 'numeric':
                  result = { 
                    value: 72.5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5, 
                    previousValue: 71.2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3 
                  };
                  break;
                case 'toggle':
                  result = { value: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.5 };
                  break;
                case 'slider':
                  result = { value: 50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30 };
                  break;
                case 'status':
                  result = { value: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3) };
                  break;
                default:
                  result = { value: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100 };
              }
            }
        }

        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up intervals for each binding
    if (isLive) {
      widget.dataBindings.forEach((binding) => {
        const interval = setInterval(fetchData, binding.refreshRate || 1000);
        intervalRefs.current.push(interval);
      });
    }

    return () => {
      intervalRefs.current.forEach(clearInterval);
      intervalRefs.current = [];
    };
  }, [widget, isLive]);

  return { data, loading, error };
}