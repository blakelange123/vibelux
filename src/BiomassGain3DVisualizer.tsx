'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, Play, Pause, RotateCw } from 'lucide-react';
import { format } from 'date-fns';

interface BiomassDataPoint {
  timestamp: Date;
  biomassGain: number; // g/m²/day
  temperature: number; // °C
  vpd: number; // kPa
  co2: number; // ppm
  lightSum: number; // mol/m²/day
  category: 'good' | 'average' | 'bad';
}

interface BiomassGain3DVisualizerProps {
  data: BiomassDataPoint[];
  facilityName?: string;
}

export function BiomassGain3DVisualizer({ data, facilityName = "Facility" }: BiomassGain3DVisualizerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [xAxis, setXAxis] = useState<'temperature' | 'vpd' | 'co2'>('temperature');
  const [yAxis, setYAxis] = useState<'lightSum' | 'time'>('lightSum');
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    if (!mountRef.current || data.length === 0) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(150, 150, 150);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create visualization
    createVisualization(scene, data);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [data, xAxis, yAxis]);

  const createVisualization = (scene: THREE.Scene, points: BiomassDataPoint[]) => {
    // Clear existing objects
    while (scene.children.length > 2) {
      scene.remove(scene.children[2]);
    }

    // Get data ranges
    const xRange = getDataRange(points, xAxis);
    const yRange = getDataRange(points, yAxis);
    const zRange = { min: 0, max: Math.max(...points.map(p => p.biomassGain)) };

    // Create axes
    createAxes(scene, xRange, yRange, zRange);

    // Create data points
    points.forEach((point, index) => {
      const x = normalizeValue(getAxisValue(point, xAxis), xRange) * 100 - 50;
      const y = normalizeValue(getAxisValue(point, yAxis), yRange) * 100 - 50;
      const z = normalizeValue(point.biomassGain, zRange) * 100;

      // Create sphere for data point
      const geometry = new THREE.SphereGeometry(2 + z / 50, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: getColorForCategory(point.category),
        transparent: true,
        opacity: 0.8
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(x, y, z);
      sphere.castShadow = true;
      sphere.receiveShadow = true;

      // Add to scene
      scene.add(sphere);

      // Create vertical line to base
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y, 0),
        new THREE.Vector3(x, y, z)
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: getColorForCategory(point.category),
        opacity: 0.3,
        transparent: true
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
    });
  };

  const createAxes = (
    scene: THREE.Scene,
    xRange: { min: number; max: number },
    yRange: { min: number; max: number },
    zRange: { min: number; max: number }
  ) => {
    // Base plane
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -50;
    plane.receiveShadow = true;
    scene.add(plane);

    // Grid
    const gridHelper = new THREE.GridHelper(100, 10, 0xcccccc, 0xeeeeee);
    gridHelper.position.y = -50;
    scene.add(gridHelper);

    // Axis lines
    const axesHelper = new THREE.AxesHelper(60);
    axesHelper.position.set(-50, -50, 0);
    scene.add(axesHelper);

    // Axis labels (simplified - in production, use CSS3DRenderer for better text)
    const loader = new THREE.FontLoader();
    // Note: In production, load actual font and create text labels
  };

  const getAxisValue = (point: BiomassDataPoint, axis: string): number => {
    switch (axis) {
      case 'temperature': return point.temperature;
      case 'vpd': return point.vpd;
      case 'co2': return point.co2;
      case 'lightSum': return point.lightSum;
      case 'time': return point.timestamp.getTime();
      default: return 0;
    }
  };

  const getDataRange = (points: BiomassDataPoint[], axis: string): { min: number; max: number } => {
    const values = points.map(p => getAxisValue(p, axis));
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  };

  const normalizeValue = (value: number, range: { min: number; max: number }): number => {
    return (value - range.min) / (range.max - range.min);
  };

  const getColorForCategory = (category: 'good' | 'average' | 'bad'): number => {
    switch (category) {
      case 'good': return 0x4ade80; // Green
      case 'average': return 0xfbbf24; // Yellow
      case 'bad': return 0xef4444; // Red
      default: return 0x6b7280; // Gray
    }
  };

  const exportVisualization = () => {
    if (!rendererRef.current) return;
    
    const link = document.createElement('a');
    link.download = `biomass-gain-3d-${format(new Date(), 'yyyy-MM-dd')}.png`;
    link.href = rendererRef.current.domElement.toDataURL();
    link.click();
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
    // Animation logic would go here for time-series playback
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>3D Biomass Gain Analysis - {facilityName}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAnimation}
              className="flex items-center gap-1"
            >
              {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isAnimating ? 'Pause' : 'Play'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportVisualization}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Axis controls */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">X-Axis:</span>
              <Select value={xAxis} onValueChange={(value: any) => setXAxis(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="vpd">VPD</SelectItem>
                  <SelectItem value="co2">CO2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Y-Axis:</span>
              <Select value={yAxis} onValueChange={(value: any) => setYAxis(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lightSum">Light Sum</SelectItem>
                  <SelectItem value="time">Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 3D Visualization */}
          <div 
            ref={mountRef} 
            className="w-full h-[600px] rounded-lg border bg-gray-50"
          />

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span>Good Days (&gt;12g/m²)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span>Average Days (6-12g/m²)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span>Bad Days (&lt;6g/m²)</span>
            </div>
          </div>

          {/* Info panel */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Z-Axis:</strong> Biomass Gain (g/m²/day) - Height represents daily biomass accumulation
            </p>
            <p className="text-sm text-blue-800 mt-1">
              Sphere size indicates biomass gain magnitude. Use mouse to rotate and zoom the visualization.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}