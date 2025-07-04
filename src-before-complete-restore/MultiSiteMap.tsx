'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, 
  Building, 
  Leaf, 
  AlertCircle, 
  Activity,
  TrendingUp,
  Zap,
  Droplets,
  Users,
  X,
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  BarChart3,
  Thermometer,
  Wind,
  Eye,
  EyeOff,
  Filter,
  GitCompare
} from 'lucide-react';
import { EnhancedWeatherAPI } from '@/lib/weather-api';
import { siteAnalytics } from '@/lib/multi-site/site-analytics';
import { geocodingService } from '@/lib/geocoding';

interface MapSite {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  type: 'greenhouse' | 'indoor' | 'vertical-farm' | 'hybrid';
  status: 'active' | 'maintenance' | 'offline';
  metrics: {
    totalFixtures: number;
    totalPower: number;
    avgPPFD: number;
    yield: number;
    energyUsage?: number;
    waterUsage?: number;
    temperature?: number;
    humidity?: number;
    co2Level?: number;
    healthScore?: number;
  };
  manager: string;
  size?: number;
  alerts?: any[];
}

interface HeatMapMetric {
  id: string;
  name: string;
  unit: string;
  min: number;
  max: number;
  colors: string[];
}

interface ComparisonSite {
  siteId: string;
  metrics: any;
}

interface MultiSiteMapProps {
  sites: any[];
  onSiteClick?: (siteId: string) => void;
  selectedSiteId?: string;
}

// Mock coordinates for demo (in production, use geocoding API)
const locationCoordinates: { [key: string]: { lat: number; lng: number } } = {
  'Denver, CO': { lat: 39.7392, lng: -104.9903 },
  'Portland, OR': { lat: 45.5152, lng: -122.6784 },
  'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
  'Austin, TX': { lat: 30.2672, lng: -97.7431 },
  'Sacramento, CA': { lat: 38.5816, lng: -121.4944 },
  'Phoenix, AZ': { lat: 33.4484, lng: -112.0740 },
  'Seattle, WA': { lat: 47.6062, lng: -122.3321 },
  'Boston, MA': { lat: 42.3601, lng: -71.0589 }
};

export function MultiSiteMap({ sites, onSiteClick, selectedSiteId }: MultiSiteMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredSite, setHoveredSite] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 39.8283, lng: -98.5795 }); // USA center
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [showSiteDetails, setShowSiteDetails] = useState<MapSite | null>(null);
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('healthScore');
  const [showClusters, setShowClusters] = useState(true);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonSites, setComparisonSites] = useState<string[]>([]);
  const [realTimeData, setRealTimeData] = useState<Map<string, any>>(new Map());
  const [geocodingCache, setGeocodingCache] = useState<Map<string, { lat: number; lng: number }>>(new Map());
  
  const weatherAPI = new EnhancedWeatherAPI();

  // Heat map metrics configuration
  const heatMapMetrics: HeatMapMetric[] = [
    {
      id: 'healthScore',
      name: 'Network Health',
      unit: '%',
      min: 0,
      max: 100,
      colors: ['#ef4444', '#f59e0b', '#10b981']
    },
    {
      id: 'avgPPFD',
      name: 'Light Intensity',
      unit: 'μmol/m²/s',
      min: 0,
      max: 1000,
      colors: ['#1e3a8a', '#3b82f6', '#fbbf24', '#f97316', '#dc2626']
    },
    {
      id: 'yield',
      name: 'Monthly Yield',
      unit: 'lbs',
      min: 0,
      max: 5000,
      colors: ['#fee2e2', '#fca5a5', '#f87171', '#ef4444', '#dc2626']
    },
    {
      id: 'energyEfficiency',
      name: 'Energy Efficiency',
      unit: 'kWh/lb',
      min: 0,
      max: 10,
      colors: ['#10b981', '#84cc16', '#fbbf24', '#f97316', '#ef4444']
    }
  ];

  // Convert sites to map sites with enhanced data
  const mapSites: MapSite[] = sites.map(site => {
    const enhancedSite = {
      ...site,
      coordinates: geocodingCache.get(site.location) || locationCoordinates[site.location] || { lat: 39.8283, lng: -98.5795 },
      metrics: {
        ...site.metrics,
        healthScore: site.metrics.healthScore || calculateHealthScore(site),
        energyUsage: site.metrics.energyUsage || site.metrics.totalPower * 720, // Monthly estimate
        waterUsage: site.metrics.waterUsage || site.metrics.yield * 1.5, // Estimate gallons per lb
        temperature: realTimeData.get(site.id)?.temperature || 72,
        humidity: realTimeData.get(site.id)?.humidity || 65,
        co2Level: realTimeData.get(site.id)?.co2Level || 800
      },
      size: site.size || 10000, // Default 10,000 sq ft
      alerts: site.alerts || []
    };
    return enhancedSite;
  });

  // Calculate health score for a site
  const calculateHealthScore = (site: any): number => {
    let score = 100;
    
    // Deduct points for various issues
    if (site.status === 'maintenance') score -= 20;
    if (site.status === 'offline') score -= 50;
    if (site.metrics.avgPPFD < 400) score -= 15;
    if (site.metrics.totalPower / site.metrics.yield > 5) score -= 10; // High energy usage
    if (site.alerts?.length > 0) score -= site.alerts.length * 5;
    
    return Math.max(0, Math.min(100, score));
  };

  // Calculate dynamic map bounds with padding
  const calculateBounds = useCallback(() => {
    if (mapSites.length === 0) {
      return {
        minLat: 25,
        maxLat: 50,
        minLng: -125,
        maxLng: -65
      };
    }
    
    const lats = mapSites.map(s => s.coordinates.lat);
    const lngs = mapSites.map(s => s.coordinates.lng);
    
    const padding = 5 / zoom; // Dynamic padding based on zoom
    
    return {
      minLat: Math.min(...lats) - padding,
      maxLat: Math.max(...lats) + padding,
      minLng: Math.min(...lngs) - padding,
      maxLng: Math.max(...lngs) + padding
    };
  }, [mapSites, zoom]);

  const bounds = calculateBounds();

  // Convert lat/lng to canvas coordinates with zoom and pan
  const latLngToCanvas = useCallback((lat: number, lng: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const width = canvas.width;
    const height = canvas.height;

    // Apply zoom and center transformation
    const centerLat = (bounds.maxLat + bounds.minLat) / 2;
    const centerLng = (bounds.maxLng + bounds.minLng) / 2;
    
    // Mercator projection with zoom
    const x = width / 2 + ((lng - centerLng) / (bounds.maxLng - bounds.minLng)) * width * zoom + mapOffset.x;
    const y = height / 2 - ((lat - centerLat) / (bounds.maxLat - bounds.minLat)) * height * zoom + mapOffset.y;

    return { x, y };
  }, [bounds, zoom, mapOffset]);

  // Cluster sites by proximity
  const clusterSites = useCallback(() => {
    const clusters: { center: { lat: number; lng: number }; sites: MapSite[] }[] = [];
    const clusterRadius = 50 / zoom; // Adaptive clustering based on zoom
    
    mapSites.forEach(site => {
      let addedToCluster = false;
      
      for (const cluster of clusters) {
        const distance = Math.sqrt(
          Math.pow(site.coordinates.lat - cluster.center.lat, 2) +
          Math.pow(site.coordinates.lng - cluster.center.lng, 2)
        );
        
        if (distance < clusterRadius) {
          cluster.sites.push(site);
          // Update cluster center
          cluster.center.lat = cluster.sites.reduce((sum, s) => sum + s.coordinates.lat, 0) / cluster.sites.length;
          cluster.center.lng = cluster.sites.reduce((sum, s) => sum + s.coordinates.lng, 0) / cluster.sites.length;
          addedToCluster = true;
          break;
        }
      }
      
      if (!addedToCluster) {
        clusters.push({
          center: { ...site.coordinates },
          sites: [site]
        });
      }
    });
    
    return clusters;
  }, [mapSites, zoom]);

  // Geocode locations that aren't in cache
  useEffect(() => {
    const geocodeLocations = async () => {
      const locationsToGeocode = sites
        .filter(site => !geocodingCache.has(site.location) && !locationCoordinates[site.location])
        .map(site => site.location);
      
      if (locationsToGeocode.length > 0) {
        const results = await geocodingService.geocodeBatch(locationsToGeocode);
        
        const newCache = new Map(geocodingCache);
        results.forEach((result, location) => {
          if (result) {
            newCache.set(location, { lat: result.lat, lng: result.lng });
          }
        });
        
        setGeocodingCache(newCache);
      }
    };
    
    geocodeLocations();
  }, [sites]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = new Map();
      mapSites.forEach(site => {
        newData.set(site.id, {
          temperature: 68 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 8,
          humidity: 60 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
          co2Level: 700 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 300,
          ppfd: site.metrics.avgPPFD * (0.95 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1)
        });
      });
      setRealTimeData(newData);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [mapSites]);

  // Draw heat map overlay
  const drawHeatMap = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (!showHeatMap) return;
    
    const metric = heatMapMetrics.find(m => m.id === selectedMetric);
    if (!metric) return;
    
    // Create heat map gradient
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 100);
    metric.colors.forEach((color, i) => {
      gradient.addColorStop(i / (metric.colors.length - 1), color);
    });
    
    ctx.globalAlpha = 0.4;
    
    mapSites.forEach(site => {
      const value = site.metrics[selectedMetric as keyof typeof site.metrics] as number || 0;
      const normalizedValue = (value - metric.min) / (metric.max - metric.min);
      const pos = latLngToCanvas(site.coordinates.lat, site.coordinates.lng);
      const radius = 100 * zoom;
      
      const siteGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
      const colorIndex = Math.floor(normalizedValue * (metric.colors.length - 1));
      const color = metric.colors[Math.min(colorIndex, metric.colors.length - 1)];
      
      siteGradient.addColorStop(0, color);
      siteGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = siteGradient;
      ctx.fillRect(pos.x - radius, pos.y - radius, radius * 2, radius * 2);
    });
    
    ctx.globalAlpha = 1;
  }, [showHeatMap, selectedMetric, mapSites, zoom, latLngToCanvas, heatMapMetrics]);

  // Draw the map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid with zoom-aware spacing
    ctx.strokeStyle = '#1e293b'; // slate-800
    ctx.lineWidth = 0.5;
    ctx.setLineDash([5, 5]);
    
    const gridSpacing = 50 * zoom;
    const offsetX = mapOffset.x % gridSpacing;
    const offsetY = mapOffset.y % gridSpacing;
    
    // Vertical lines
    for (let x = offsetX; x <= canvas.width / window.devicePixelRatio; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height / window.devicePixelRatio);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = offsetY; y <= canvas.height / window.devicePixelRatio; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width / window.devicePixelRatio, y);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);

    // Draw heat map
    drawHeatMap(ctx, canvas);

    // Draw network connections with performance indicators
    if (!showClusters || zoom > 2) {
      ctx.globalAlpha = 0.3;
      
      // Draw connections between comparison sites
      if (comparisonMode && comparisonSites.length >= 2) {
        ctx.strokeStyle = '#fbbf24'; // amber-400
        ctx.lineWidth = 3;
        
        comparisonSites.forEach((siteId, i) => {
          if (i < comparisonSites.length - 1) {
            const site1 = mapSites.find(s => s.id === siteId);
            const site2 = mapSites.find(s => s.id === comparisonSites[i + 1]);
            if (site1 && site2) {
              const from = latLngToCanvas(site1.coordinates.lat, site1.coordinates.lng);
              const to = latLngToCanvas(site2.coordinates.lat, site2.coordinates.lng);
              
              ctx.beginPath();
              ctx.moveTo(from.x, from.y);
              ctx.lineTo(to.x, to.y);
              ctx.stroke();
            }
          }
        });
      } else {
        // Draw all connections with health-based colors
        mapSites.forEach((site, i) => {
          if (i < mapSites.length - 1) {
            const nextSite = mapSites[i + 1];
            const avgHealth = (site.metrics.healthScore! + nextSite.metrics.healthScore!) / 2;
            
            ctx.strokeStyle = avgHealth > 80 ? '#10b981' : avgHealth > 60 ? '#f59e0b' : '#ef4444';
            ctx.lineWidth = 2;
            
            const from = latLngToCanvas(site.coordinates.lat, site.coordinates.lng);
            const to = latLngToCanvas(nextSite.coordinates.lat, nextSite.coordinates.lng);
            
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
          }
        });
      }
      
      ctx.globalAlpha = 1;
    }

    // Draw sites or clusters
    if (showClusters && zoom <= 2) {
      // Draw clusters
      const clusters = clusterSites();
      
      clusters.forEach(cluster => {
        const pos = latLngToCanvas(cluster.center.lat, cluster.center.lng);
        const radius = Math.min(30, 15 + cluster.sites.length * 2) * zoom;
        
        // Cluster health average
        const avgHealth = cluster.sites.reduce((sum, s) => sum + (s.metrics.healthScore || 0), 0) / cluster.sites.length;
        const healthColor = avgHealth > 80 ? '#10b981' : avgHealth > 60 ? '#f59e0b' : '#ef4444';
        
        // Outer glow
        const glowGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius * 1.5);
        glowGradient.addColorStop(0, healthColor + '40');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(pos.x - radius * 1.5, pos.y - radius * 1.5, radius * 3, radius * 3);
        
        // Cluster circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = healthColor;
        ctx.globalAlpha = 0.9;
        ctx.fill();
        
        // Inner circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius - 4, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        
        // Cluster count
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(12, radius / 2)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cluster.sites.length.toString(), pos.x, pos.y);
        
        ctx.globalAlpha = 1;
      });
    } else {
      // Draw individual sites
      mapSites.forEach(site => {
        const pos = latLngToCanvas(site.coordinates.lat, site.coordinates.lng);
        
        // Skip if outside viewport
        if (pos.x < -50 || pos.x > canvas.width / window.devicePixelRatio + 50 ||
            pos.y < -50 || pos.y > canvas.height / window.devicePixelRatio + 50) {
          return;
        }
        
        const isSelected = site.id === selectedSiteId;
        const isHovered = site.id === hoveredSite;
        const isComparison = comparisonSites.includes(site.id);
        const radius = (isSelected ? 25 : (isHovered ? 22 : 18)) * Math.min(zoom, 2);
        
        // Health indicator ring
        const healthScore = site.metrics.healthScore || 0;
        const healthColor = healthScore > 80 ? '#10b981' : healthScore > 60 ? '#f59e0b' : '#ef4444';
        
        if (isSelected || isHovered || isComparison) {
          // Outer glow
          const glowGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius * 2);
          glowGradient.addColorStop(0, (isComparison ? '#fbbf24' : healthColor) + '60');
          glowGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGradient;
          ctx.fillRect(pos.x - radius * 2, pos.y - radius * 2, radius * 4, radius * 4);
        }
        
        // Status ring
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = site.status === 'active' ? '#10b981' : 
                         site.status === 'maintenance' ? '#f59e0b' : '#ef4444';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Main circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = healthColor;
        ctx.globalAlpha = isSelected ? 1 : 0.9;
        ctx.fill();
        
        // Inner circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius - 4, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        
        // Icon
        ctx.fillStyle = '#ffffff';
        ctx.font = `${radius - 8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const icon = site.type === 'greenhouse' ? '🏡' :
                     site.type === 'indoor' ? '🏢' :
                     site.type === 'vertical-farm' ? '🏗️' : '🏭';
        ctx.fillText(icon, pos.x, pos.y);
        
        ctx.globalAlpha = 1;
        
        // Labels
        if (isHovered || isSelected || zoom > 2) {
          // Background for text
          const text = site.name;
          ctx.font = 'bold 12px Arial';
          const textWidth = ctx.measureText(text).width;
          
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.fillRect(pos.x - textWidth / 2 - 4, pos.y - radius - 24, textWidth + 8, 18);
          
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(text, pos.x, pos.y - radius - 10);
          
          // Show real-time metric
          if (isHovered || isSelected) {
            const rtData = realTimeData.get(site.id);
            if (rtData) {
              const metricText = `${rtData.temperature.toFixed(1)}°F | ${rtData.humidity.toFixed(0)}% | ${rtData.co2Level.toFixed(0)}ppm`;
              const metricWidth = ctx.measureText(metricText).width;
              
              ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
              ctx.fillRect(pos.x - metricWidth / 2 - 4, pos.y + radius + 8, metricWidth + 8, 18);
              
              ctx.fillStyle = '#94a3b8';
              ctx.font = '10px Arial';
              ctx.fillText(metricText, pos.x, pos.y + radius + 20);
            }
          }
        }
        
        // Alert indicator
        if (site.alerts && site.alerts.length > 0) {
          ctx.beginPath();
          ctx.arc(pos.x + radius * 0.7, pos.y - radius * 0.7, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(site.alerts.length.toString(), pos.x + radius * 0.7, pos.y - radius * 0.7 + 3);
        }
      });
    }

    // Draw enhanced stats overlay
    const networkAnalytics = siteAnalytics.calculateNetworkAnalytics(mapSites);
    
    // Background gradient
    const overlayGradient = ctx.createLinearGradient(10, 10, 10, 150);
    overlayGradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
    overlayGradient.addColorStop(1, 'rgba(15, 23, 42, 0.85)');
    ctx.fillStyle = overlayGradient;
    ctx.fillRect(10, 10, 220, 150);
    
    ctx.strokeStyle = '#334155'; // slate-700
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 220, 150);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Network Analytics', 20, 30);
    
    // Network health indicator
    const avgHealth = mapSites.reduce((sum, s) => sum + (s.metrics.healthScore || 0), 0) / mapSites.length;
    const healthColor = avgHealth > 80 ? '#10b981' : avgHealth > 60 ? '#f59e0b' : '#ef4444';
    
    ctx.fillStyle = healthColor;
    ctx.fillRect(180, 20, 40, 4);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Arial';
    ctx.fillText(`${avgHealth.toFixed(0)}%`, 185, 35);
    
    ctx.font = '11px Arial';
    ctx.fillStyle = '#cbd5e1'; // slate-300
    const stats = [
      { label: 'Active Sites', value: `${networkAnalytics.activeSites} / ${networkAnalytics.totalSites}` },
      { label: 'Total Area', value: `${(networkAnalytics.totalArea / 1000).toFixed(1)}k sq ft` },
      { label: 'Power Usage', value: `${networkAnalytics.totalEnergy.toFixed(0)} kWh/mo` },
      { label: 'Production', value: `${networkAnalytics.totalProduction.toFixed(0)} lbs/mo` },
      { label: 'Efficiency', value: `${networkAnalytics.avgEfficiency.toFixed(2)} kWh/lb` },
      { label: 'Active Alerts', value: networkAnalytics.alertCount }
    ];
    
    stats.forEach((stat, i) => {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(stat.label + ':', 20, 55 + i * 18);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(stat.value.toString(), 120, 55 + i * 18);
    });

    // Draw comparison panel if in comparison mode
    if (comparisonMode && comparisonSites.length >= 2) {
      const site1 = mapSites.find(s => s.id === comparisonSites[0]);
      const site2 = mapSites.find(s => s.id === comparisonSites[1]);
      
      if (site1 && site2) {
        const comparison = siteAnalytics.compareSites(site1, site2);
        
        ctx.fillStyle = overlayGradient;
        ctx.fillRect(canvas.width / window.devicePixelRatio - 260, 10, 250, 120);
        ctx.strokeRect(canvas.width / window.devicePixelRatio - 260, 10, 250, 120);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('Site Comparison', canvas.width / window.devicePixelRatio - 250, 30);
        
        ctx.font = '10px Arial';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(`${site1.name} vs ${site2.name}`, canvas.width / window.devicePixelRatio - 250, 45);
        
        const metrics = [
          { label: 'Yield', value: comparison.yieldAdvantage, unit: '%' },
          { label: 'Energy', value: comparison.energyAdvantage, unit: '%' },
          { label: 'Water', value: comparison.waterAdvantage, unit: '%' }
        ];
        
        metrics.forEach((metric, i) => {
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(metric.label + ':', canvas.width / window.devicePixelRatio - 250, 65 + i * 20);
          
          const value = metric.value;
          ctx.fillStyle = value > 0 ? '#10b981' : '#ef4444';
          ctx.fillText(`${value > 0 ? '+' : ''}${value.toFixed(1)}${metric.unit}`, canvas.width / window.devicePixelRatio - 170, 65 + i * 20);
          
          // Draw comparison bar
          const barWidth = Math.abs(value) * 0.5;
          ctx.fillRect(canvas.width / window.devicePixelRatio - 100, 58 + i * 20, barWidth, 10);
        });
      }
    }

  }, [mapSites, selectedSiteId, hoveredSite, zoom, mapOffset, showClusters, showHeatMap, selectedMetric, comparisonMode, comparisonSites, realTimeData, latLngToCanvas, clusterSites, drawHeatMap]);

  // Handle mouse events with pan support
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging) {
      setMapOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      canvas.style.cursor = 'grabbing';
    } else {
      // Check if hovering over a site
      let foundSite = null;
      
      if (showClusters && zoom <= 2) {
        // Check clusters
        const clusters = clusterSites();
        for (const cluster of clusters) {
          const pos = latLngToCanvas(cluster.center.lat, cluster.center.lng);
          const radius = Math.min(30, 15 + cluster.sites.length * 2) * zoom;
          const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
          if (distance <= radius && cluster.sites.length === 1) {
            foundSite = cluster.sites[0].id;
            break;
          }
        }
      } else {
        // Check individual sites
        for (const site of mapSites) {
          const pos = latLngToCanvas(site.coordinates.lat, site.coordinates.lng);
          const radius = 18 * Math.min(zoom, 2);
          const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
          if (distance <= radius) {
            foundSite = site.id;
            break;
          }
        }
      }
      
      setHoveredSite(foundSite);
      canvas.style.cursor = foundSite ? 'pointer' : isDragging ? 'grabbing' : 'grab';
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(10, prev * delta)));
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredSite) {
      const site = mapSites.find(s => s.id === hoveredSite);
      if (site) {
        if (comparisonMode) {
          // Toggle site in comparison
          setComparisonSites(prev => {
            if (prev.includes(site.id)) {
              return prev.filter(id => id !== site.id);
            } else if (prev.length < 2) {
              return [...prev, site.id];
            } else {
              return [prev[1], site.id];
            }
          });
        } else {
          setShowSiteDetails(site);
          if (onSiteClick) {
            onSiteClick(hoveredSite);
          }
        }
      }
    }
  };

  const centerMap = () => {
    setMapOffset({ x: 0, y: 0 });
    setZoom(1);
  };

  const fitToSites = () => {
    if (mapSites.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const padding = 50;
    const canvasWidth = canvas.width / window.devicePixelRatio - padding * 2;
    const canvasHeight = canvas.height / window.devicePixelRatio - padding * 2;
    
    const bounds = calculateBounds();
    const mapWidth = bounds.maxLng - bounds.minLng;
    const mapHeight = bounds.maxLat - bounds.minLat;
    
    const scaleX = canvasWidth / (mapWidth * 100);
    const scaleY = canvasHeight / (mapHeight * 100);
    const newZoom = Math.min(scaleX, scaleY, 5);
    
    setZoom(newZoom);
    setMapOffset({ x: 0, y: 0 });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/30';
      case 'maintenance': return 'text-yellow-400 bg-yellow-900/30';
      case 'offline': return 'text-red-400 bg-red-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  return (
    <div className="relative h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setHoveredSite(null);
          setIsDragging(false);
        }}
        onClick={handleClick}
        onWheel={handleWheel}
      />
      
      {/* Enhanced Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {/* Zoom Controls */}
        <div className="bg-slate-800 rounded-lg p-2 space-y-2">
          <button
            onClick={() => setZoom(prev => Math.min(prev * 1.5, 10))}
            className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-white transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev / 1.5, 0.5))}
            className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-white transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={centerMap}
            className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-white transition-colors"
            title="Center map"
          >
            <Navigation className="w-4 h-4" />
          </button>
          <button
            onClick={fitToSites}
            className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-white transition-colors"
            title="Fit to sites"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* View Controls */}
        <div className="bg-slate-800 rounded-lg p-2 space-y-2">
          <button
            onClick={() => setShowClusters(!showClusters)}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
              showClusters ? 'bg-purple-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-gray-400'
            }`}
            title="Toggle clustering"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowHeatMap(!showHeatMap)}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
              showHeatMap ? 'bg-purple-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-gray-400'
            }`}
            title="Toggle heat map"
          >
            <Thermometer className="w-4 h-4" />
          </button>
          <button
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
              comparisonMode ? 'bg-amber-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-gray-400'
            }`}
            title="Compare sites"
          >
            <GitCompare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Heat Map Controls */}
      {showHeatMap && (
        <div className="absolute top-4 left-240 bg-slate-800 rounded-lg p-3">
          <h3 className="text-sm font-medium text-white mb-2">Heat Map Metric</h3>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="w-full px-2 py-1 bg-slate-700 text-white rounded text-sm"
          >
            {heatMapMetrics.map(metric => (
              <option key={metric.id} value={metric.id}>
                {metric.name} ({metric.unit})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Comparison Mode Indicator */}
      {comparisonMode && (
        <div className="absolute bottom-4 left-4 bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <GitCompare className="w-4 h-4" />
          <span className="text-sm font-medium">
            Comparison Mode: Select up to 2 sites
            {comparisonSites.length > 0 && ` (${comparisonSites.length} selected)`}
          </span>
          {comparisonSites.length > 0 && (
            <button
              onClick={() => setComparisonSites([])}
              className="ml-2 text-xs underline hover:no-underline"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Site Details Modal */}
      {showSiteDetails && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{showSiteDetails.name}</h3>
              <button
                onClick={() => setShowSiteDetails(null)}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">{showSiteDetails.location}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-sm ${getStatusColor(showSiteDetails.status)}`}>
                    {showSiteDetails.status.charAt(0).toUpperCase() + showSiteDetails.status.slice(1)}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {showSiteDetails.type.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-gray-400">Live</span>
                </div>
              </div>
              
              {/* Health Score */}
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Network Health Score</span>
                  <span className="text-lg font-bold text-white">{showSiteDetails.metrics.healthScore?.toFixed(0) || 0}%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${showSiteDetails.metrics.healthScore || 0}%`,
                      backgroundColor: (showSiteDetails.metrics.healthScore || 0) > 80 ? '#10b981' : 
                                      (showSiteDetails.metrics.healthScore || 0) > 60 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>
              </div>
              
              {/* Real-time Metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-700 rounded p-2 text-center">
                  <Thermometer className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">Temp</p>
                  <p className="text-sm font-medium text-white">
                    {realTimeData.get(showSiteDetails.id)?.temperature.toFixed(1) || showSiteDetails.metrics.temperature || 72}°F
                  </p>
                </div>
                <div className="bg-slate-700 rounded p-2 text-center">
                  <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">Humidity</p>
                  <p className="text-sm font-medium text-white">
                    {realTimeData.get(showSiteDetails.id)?.humidity.toFixed(0) || showSiteDetails.metrics.humidity || 65}%
                  </p>
                </div>
                <div className="bg-slate-700 rounded p-2 text-center">
                  <Wind className="w-4 h-4 text-green-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">CO₂</p>
                  <p className="text-sm font-medium text-white">
                    {realTimeData.get(showSiteDetails.id)?.co2Level.toFixed(0) || showSiteDetails.metrics.co2Level || 800}ppm
                  </p>
                </div>
              </div>
              
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                <div>
                  <p className="text-gray-400 text-sm">Fixtures</p>
                  <p className="text-white font-medium">{showSiteDetails.metrics.totalFixtures}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Power</p>
                  <p className="text-white font-medium">{showSiteDetails.metrics.totalPower} kW</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Avg PPFD</p>
                  <p className="text-white font-medium">{showSiteDetails.metrics.avgPPFD} μmol/m²/s</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Monthly Yield</p>
                  <p className="text-white font-medium">{showSiteDetails.metrics.yield} lbs</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Energy Efficiency</p>
                  <p className="text-white font-medium">
                    {((showSiteDetails.metrics.energyUsage || showSiteDetails.metrics.totalPower * 720) / showSiteDetails.metrics.yield).toFixed(2)} kWh/lb
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Water Usage</p>
                  <p className="text-white font-medium">
                    {((showSiteDetails.metrics.waterUsage || showSiteDetails.metrics.yield * 1.5) / showSiteDetails.metrics.yield).toFixed(1)} gal/lb
                  </p>
                </div>
              </div>
              
              {/* Manager and Actions */}
              <div className="pt-4 border-t border-slate-700">
                <p className="text-gray-400 text-sm mb-1">Manager</p>
                <p className="text-white mb-3">{showSiteDetails.manager}</p>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setShowSiteDetails(null);
                      if (onSiteClick) onSiteClick(showSiteDetails.id);
                    }}
                    className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                  >
                    View Dashboard
                  </button>
                  <button 
                    onClick={() => {
                      setComparisonMode(true);
                      setComparisonSites([showSiteDetails.id]);
                      setShowSiteDetails(null);
                    }}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
                  >
                    <GitCompare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}