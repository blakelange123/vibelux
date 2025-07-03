'use client';

import React from 'react';
import { scaleLinear } from '@visx/scale';
import { HeatmapRect } from '@visx/heatmap';
import { Group } from '@visx/group';

interface HeatmapWidgetProps {
  config: {
    title?: string;
    rows: number;
    cols: number;
    colorScale?: 'viridis' | 'heat' | 'cool' | 'blues';
    min?: number;
    max?: number;
    showValues?: boolean;
    unit?: string;
  };
  data: any;
  loading: boolean;
}

const colorScales = {
  viridis: ['#440154', '#31688e', '#35b779', '#fde725'],
  heat: ['#0000ff', '#00ff00', '#ffff00', '#ff0000'],
  cool: ['#0000ff', '#00ffff', '#ffffff'],
  blues: ['#f7fbff', '#c6dbef', '#6baed6', '#08519c']
};

export function HeatmapWidget({ config, data, loading }: HeatmapWidgetProps) {
  const { 
    rows, 
    cols, 
    colorScale = 'viridis', 
    min = 0, 
    max = 100,
    showValues = false,
    unit = ''
  } = config;
  
  // Transform data into heatmap format
  const heatmapData = React.useMemo(() => {
    if (!data?.values) {
      // Generate empty grid
      return Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => ({
          row,
          col,
          value: 0
        }))
      );
    }
    
    // Ensure data matches grid dimensions
    const values = data.values;
    return Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) => ({
        row,
        col,
        value: values[row]?.[col] ?? 0
      }))
    );
  }, [data, rows, cols]);
  
  // Calculate dimensions
  const margin = { top: 10, left: 10, right: 10, bottom: 10 };
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);
  
  const innerWidth = dimensions.width - margin.left - margin.right;
  const innerHeight = dimensions.height - margin.top - margin.bottom;
  const binWidth = innerWidth / cols;
  const binHeight = innerHeight / rows;
  
  // Color scale
  const colorMax = max;
  const bucketSizeMax = colorMax / colorScales[colorScale].length;
  const xScale = scaleLinear<number>({
    domain: [0, cols],
    range: [0, innerWidth]
  });
  const yScale = scaleLinear<number>({
    domain: [0, rows],
    range: [0, innerHeight]
  });
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading heatmap data...
      </div>
    );
  }
  
  return (
    <div ref={containerRef} className="w-full h-full">
      {dimensions.width > 0 && (
        <svg width={dimensions.width} height={dimensions.height}>
          <Group top={margin.top} left={margin.left}>
            <HeatmapRect
              data={heatmapData}
              xScale={xScale}
              yScale={yScale}
              colorScale={scaleLinear<string>({
                domain: [min, max],
                range: colorScales[colorScale]
              })}
              binWidth={binWidth}
              binHeight={binHeight}
              gap={1}
            >
              {(heatmap) =>
                heatmap.map((heatmapBins) =>
                  heatmapBins.map((bin) => (
                    <g key={`heatmap-rect-${bin.row}-${bin.column}`}>
                      <rect
                        className="cursor-pointer"
                        width={bin.width}
                        height={bin.height}
                        x={bin.x}
                        y={bin.y}
                        fill={bin.color}
                        fillOpacity={bin.opacity}
                        onClick={() => {
                        }}
                      />
                      {showValues && binWidth > 30 && binHeight > 20 && (
                        <text
                          x={bin.x + bin.width / 2}
                          y={bin.y + bin.height / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize={10}
                          pointerEvents="none"
                        >
                          {bin.datum?.value?.toFixed(0)}{unit}
                        </text>
                      )}
                    </g>
                  ))
                )
              }
            </HeatmapRect>
          </Group>
        </svg>
      )}
    </div>
  );
}