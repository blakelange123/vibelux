'use client';

import React, { useState } from 'react';
import { 
  Grid3x3, Calculator, Eye, FileDown, Settings, 
  Layers, Zap, BarChart3, Lightbulb, Building,
  Thermometer, Droplets, Wind, Sun, Activity,
  ChevronDown, Play, Square, RotateCcw, Save,
  Upload, Share2, Printer, HelpCircle, Sparkles
} from 'lucide-react';

interface RibbonToolbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onToolAction?: (action: string) => void;
}

const ribbonTabs = {
  design: {
    label: 'Design',
    icon: Grid3x3,
    sections: [
      {
        title: 'Create',
        tools: [
          { id: 'add-fixture', label: 'Add Fixture', icon: Lightbulb, size: 'large', desc: 'Place lighting fixtures' },
          { id: 'add-rack', label: 'Add Rack', icon: Layers, size: 'medium', desc: 'Growing racks' },
          { id: 'add-zone', label: 'Zone', icon: Square, size: 'medium', desc: 'Calculation zone' }
        ]
      },
      {
        title: 'Layout',
        tools: [
          { id: 'array-tool', label: 'Array', icon: Grid3x3, size: 'large', desc: 'Create fixture arrays' },
          { id: 'align-tools', label: 'Align', icon: Layers, size: 'small' },
          { id: 'distribute', label: 'Distribute', icon: Layers, size: 'small' }
        ]
      },
      {
        title: 'AI Assist',
        tools: [
          { id: 'ai-design', label: 'AI Designer', icon: Sparkles, size: 'large', desc: 'Intelligent design assistant' },
          { id: 'optimize', label: 'Optimize', icon: Zap, size: 'medium', desc: 'Auto-optimize layout' }
        ]
      }
    ]
  },
  calculate: {
    label: 'Calculate',
    icon: Calculator,
    sections: [
      {
        title: 'Photometrics',
        tools: [
          { id: 'ppfd-calc', label: 'PPFD Map', icon: Calculator, size: 'large', desc: 'Calculate light distribution' },
          { id: 'dli-calc', label: 'DLI Analysis', icon: Sun, size: 'medium', desc: 'Daily light integral' },
          { id: 'uniformity', label: 'Uniformity', icon: BarChart3, size: 'medium', desc: 'Light uniformity ratio' }
        ]
      },
      {
        title: 'Environmental',
        tools: [
          { id: 'heat-load', label: 'Heat Load', icon: Thermometer, size: 'large', desc: 'Thermal calculations' },
          { id: 'energy-use', label: 'Energy', icon: Zap, size: 'medium', desc: 'Power consumption' }
        ]
      },
      {
        title: 'Quick Calc',
        tools: [
          { id: 'live-calc', label: 'Live', icon: Play, size: 'small', toggle: true },
          { id: 'auto-calc', label: 'Auto', icon: RotateCcw, size: 'small', toggle: true }
        ]
      }
    ]
  },
  visualize: {
    label: 'Visualize',
    icon: Eye,
    sections: [
      {
        title: 'Views',
        tools: [
          { id: 'view-2d', label: '2D Plan', icon: Square, size: 'large', desc: 'Top-down view' },
          { id: 'view-3d', label: '3D Model', icon: Building, size: 'large', desc: 'Three-dimensional view' },
          { id: 'view-section', label: 'Section', icon: Layers, size: 'medium', desc: 'Cross-section view' }
        ]
      },
      {
        title: 'Analysis',
        tools: [
          { id: 'false-color', label: 'False Color', icon: Eye, size: 'large', desc: 'PPFD color mapping' },
          { id: 'contour-map', label: 'Contours', icon: Activity, size: 'medium', desc: 'Iso-PPFD lines' },
          { id: 'shadow-map', label: 'Shadows', icon: Sun, size: 'medium', desc: 'Shadow analysis' }
        ]
      },
      {
        title: 'Display',
        tools: [
          { id: 'grid-toggle', label: 'Grid', icon: Grid3x3, size: 'small', toggle: true },
          { id: 'labels', label: 'Labels', icon: Layers, size: 'small', toggle: true }
        ]
      }
    ]
  },
  export: {
    label: 'Export',
    icon: FileDown,
    sections: [
      {
        title: 'Reports',
        tools: [
          { id: 'report-standard', label: 'Standard Report', icon: FileDown, size: 'large', desc: 'Photometric report' },
          { id: 'report-economic', label: 'ROI Report', icon: BarChart3, size: 'medium', desc: 'Economic analysis' },
          { id: 'report-compliance', label: 'Compliance', icon: Settings, size: 'medium', desc: 'Regulatory report' }
        ]
      },
      {
        title: 'Data',
        tools: [
          { id: 'export-csv', label: 'CSV Data', icon: FileDown, size: 'large', desc: 'Raw calculation data' },
          { id: 'export-ies', label: 'IES Files', icon: Lightbulb, size: 'medium', desc: 'Photometric files' }
        ]
      },
      {
        title: 'Share',
        tools: [
          { id: 'save-project', label: 'Save', icon: Save, size: 'small' },
          { id: 'share-link', label: 'Share', icon: Share2, size: 'small' },
          { id: 'print', label: 'Print', icon: Printer, size: 'small' }
        ]
      }
    ]
  }
};

export function RibbonToolbar({ activeTab = 'design', onTabChange, onToolAction }: RibbonToolbarProps) {
  const [toggleStates, setToggleStates] = useState<{ [key: string]: boolean }>({
    'live-calc': false,
    'auto-calc': true,
    'grid-toggle': true,
    'labels': false
  });

  const handleToolClick = (toolId: string, isToggle?: boolean) => {
    if (isToggle) {
      setToggleStates(prev => ({ ...prev, [toolId]: !prev[toolId] }));
    }
    onToolAction?.(toolId);
  };

  const renderTool = (tool: any) => {
    const isToggled = toggleStates[tool.id];
    const IconComponent = tool.icon;
    
    if (tool.size === 'large') {
      return (
        <button
          key={tool.id}
          onClick={() => handleToolClick(tool.id, tool.toggle)}
          className={`
            flex flex-col items-center gap-1 p-3 rounded-lg border border-transparent
            hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700
            transition-all duration-200 group min-w-[72px]
            ${tool.toggle && isToggled ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600' : ''}
          `}
          title={tool.desc}
        >
          <IconComponent className={`w-8 h-8 ${tool.toggle && isToggled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'} group-hover:text-blue-600 dark:group-hover:text-blue-400`} />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{tool.label}</span>
          {tool.desc && (
            <span className="text-xs text-gray-500 dark:text-gray-400 text-center leading-tight">{tool.desc}</span>
          )}
        </button>
      );
    }

    if (tool.size === 'medium') {
      return (
        <button
          key={tool.id}
          onClick={() => handleToolClick(tool.id, tool.toggle)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border border-transparent
            hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700
            transition-all duration-200 group min-w-[100px]
            ${tool.toggle && isToggled ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600' : ''}
          `}
          title={tool.desc}
        >
          <IconComponent className={`w-5 h-5 ${tool.toggle && isToggled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'} group-hover:text-blue-600 dark:group-hover:text-blue-400`} />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tool.label}</span>
            {tool.desc && <span className="text-xs text-gray-500 dark:text-gray-400">{tool.desc}</span>}
          </div>
        </button>
      );
    }

    // Small size
    return (
      <button
        key={tool.id}
        onClick={() => handleToolClick(tool.id, tool.toggle)}
        className={`
          flex flex-col items-center gap-1 p-2 rounded-lg border border-transparent
          hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700
          transition-all duration-200 group min-w-[48px]
          ${tool.toggle && isToggled ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600' : ''}
        `}
        title={tool.desc || tool.label}
      >
        <IconComponent className={`w-4 h-4 ${tool.toggle && isToggled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'} group-hover:text-blue-600 dark:group-hover:text-blue-400`} />
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{tool.label}</span>
      </button>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      {/* Tab Bar */}
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700">
        {Object.entries(ribbonTabs).map(([tabId, tab]) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tabId}
              onClick={() => onTabChange?.(tabId)}
              className={`
                flex items-center gap-2 px-4 py-2 border-b-2 transition-all
                ${activeTab === tabId 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                }
              `}
            >
              <TabIcon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Ribbon Content */}
      <div className="p-4">
        <div className="flex items-start gap-8">
          {ribbonTabs[activeTab as keyof typeof ribbonTabs]?.sections.map((section, index) => (
            <div key={index} className="flex flex-col gap-3">
              {/* Section Title */}
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-1">
                {section.title}
              </div>
              
              {/* Section Tools */}
              <div className="flex items-start gap-2 flex-wrap">
                {section.tools.map(renderTool)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Activity className="w-4 h-4" />
          <span>Ready • Objects: 12 • PPFD Calculated</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
            <HelpCircle className="w-4 h-4" />
            <span>Help</span>
          </button>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            VibeLux Professional v2.0
          </div>
        </div>
      </div>
    </div>
  );
}