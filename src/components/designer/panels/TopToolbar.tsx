'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, Download, Upload, Undo, Redo, Settings, 
  BarChart3, Eye, Grid3x3, Layers, FileDown,
  ChevronDown, Monitor, Box, Building, Beaker,
  Cpu, Thermometer, Leaf, Globe, FlaskConical,
  FileType, Ruler, Calculator, Palette, FolderOpen,
  Code, Wind, Fan, Sun, Share2, Sliders, X, Volume2,
  FileText, Clock
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { exportToPDF, exportToExcel, exportToCAD } from '../utils/exportHandlers';
import { saveProject, exportProject, importProject } from '../utils/projectHandlers';
import { BIMImportDialog } from '../features/BIMImportDialog';
import { BIMImporter } from '../utils/bimImporter';
import { CADImportModal } from '../CADImportModal';
import { SettingsPanel } from './SettingsPanel';
import { ExportDialog } from '../dialogs/ExportDialog';
import { RoomTemplateDialog } from '../dialogs/RoomTemplateDialog';
import { ProfessionalDrawingExport } from '../export/ProfessionalDrawingExport';
import { BillOfMaterialsExport } from '../export/BillOfMaterialsExport';
import { LightDistributionComparison } from '../tools/LightDistributionComparison';
import { SolarDLIPanel } from './SolarDLIPanel';

interface TopToolbarProps {
  selectedCrop?: string;
  onCropChange?: (crop: string) => void;
  dliTarget?: number;
  onDliTargetChange?: (value: number) => void;
  cropPresets?: any;
  photoperiod?: number;
  onPhotoperiodChange?: (value: number) => void;
}

export function TopToolbar({ 
  selectedCrop = 'custom', 
  onCropChange, 
  dliTarget = 30, 
  onDliTargetChange, 
  cropPresets,
  photoperiod = 12,
  onPhotoperiodChange
}: TopToolbarProps) {
  const { state, dispatch, undo, redo, canUndo, canRedo, updateRoom } = useDesigner();
  const { showNotification } = useNotifications();
  const { ui, calculations } = state;
  
  const [showBIMImport, setShowBIMImport] = useState(false);
  const [showCADImport, setShowCADImport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvancedMenu, setShowAdvancedMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showProfessionalExport, setShowProfessionalExport] = useState(false);
  const [showBOMExport, setShowBOMExport] = useState(false);
  const [showDistributionComparison, setShowDistributionComparison] = useState(false);
  const [showSolarDLI, setShowSolarDLI] = useState(false);
  
  const advancedMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (advancedMenuRef.current && !advancedMenuRef.current.contains(event.target as Node)) {
        setShowAdvancedMenu(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: 'pdf' | 'excel' | 'cad' | 'ifc' | 'gbxml' | 'professional' | 'bom') => {
    setShowExportMenu(false);
    try {
      switch (format) {
        case 'pdf':
          await exportToPDF(state);
          showNotification('success', 'PDF report generated successfully');
          break;
        case 'excel':
          exportToExcel(state);
          showNotification('success', 'Excel file exported successfully');
          break;
        case 'cad':
          exportToCAD(state);
          showNotification('success', 'CAD file exported successfully');
          break;
        case 'professional':
          // Professional drawing export is handled by its own dialog
          setShowProfessionalExport(true);
          break;
        case 'bom':
          // Bill of Materials export is handled by its own dialog
          setShowBOMExport(true);
          break;
        case 'ifc': {
          const ifc = BIMImporter.exportToIFC(state.room, state.objects);
          const blob = new Blob([ifc], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `vibelux_export_${new Date().toISOString().split('T')[0]}.ifc`;
          a.click();
          URL.revokeObjectURL(url);
          showNotification('success', 'IFC file exported successfully');
          break;
        }
        case 'gbxml': {
          const gbxml = BIMImporter.exportToGBXML(state.room, state.objects);
          const blob = new Blob([gbxml], { type: 'application/xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `vibelux_export_${new Date().toISOString().split('T')[0]}.xml`;
          a.click();
          URL.revokeObjectURL(url);
          showNotification('success', 'gbXML file exported successfully');
          break;
        }
      }
    } catch (error) {
      showNotification('error', `Failed to export as ${format.toUpperCase()}`);
    }
  };

  const handleSave = () => {
    try {
      saveProject(state);
      showNotification('success', 'Project saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      showNotification('error', 'Failed to save project');
    }
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const project = await importProject(file);
          dispatch({ type: 'LOAD_PROJECT', payload: project.state as any });
          showNotification('success', `Project "${project.name}" loaded successfully`);
        } catch (error) {
          showNotification('error', 'Failed to load project. Please check the file format.');
        }
      }
    };
    input.click();
  };

  return (
    <div className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 relative z-50">
      {/* Left Section - Logo and Navigation */}
      <div className="flex items-center gap-8">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">VibeLux</h1>
        </div>
        
        {/* File Operations */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleSave}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Save Project"
          >
            <Save className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={handleLoad}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Open Project"
          >
            <Upload className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={() => setShowBIMImport(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Import BIM/IFC"
          >
            <Building className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={() => {
              setShowTemplateDialog(true);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Room Templates"
          >
            <Layers className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
          
          {/* Export Menu */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1"
              title="Export"
            >
              <Download className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <ChevronDown className="w-3 h-3 text-gray-700 dark:text-gray-300" />
            </button>
            
            {showExportMenu && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                >
                  <FileType className="w-4 h-4" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">PDF Report</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Detailed lighting analysis</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                >
                  <FileDown className="w-4 h-4" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Excel Spreadsheet</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Fixture schedule & calculations</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('cad')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                >
                  <Box className="w-4 h-4" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">CAD File</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">DWG/DXF format</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('professional')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                >
                  <Ruler className="w-4 h-4" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Professional Drawing</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Construction-ready PDF</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('bom')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                >
                  <FileText className="w-4 h-4" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Bill of Materials</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Material list & installation docs</div>
                  </div>
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button
                  onClick={() => handleExport('ifc')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                >
                  <Building className="w-4 h-4" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">IFC File</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">BIM interoperability</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('gbxml')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                >
                  <Globe className="w-4 h-4" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">gbXML File</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Energy analysis</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center Section - Crop Presets and DLI Target */}
      <div className="flex items-center gap-6">
        {/* Crop Preset Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Leaf className="w-4 h-4 text-green-500" />
          <select 
            value={selectedCrop}
            onChange={(e) => {
              const crop = e.target.value;
              onCropChange?.(crop);
              
              // Update room DLI based on crop preset
              const dliValues: { [key: string]: number } = {
                lettuce: 14,
                tomatoes: 25,
                cannabis: 40,
                herbs: 20,
                strawberries: 18,
                custom: 30
              };
              
              const targetDLI = dliValues[crop] || 30;
              updateRoom({ targetDLI });
              onDliTargetChange?.(targetDLI);
              showNotification('success', `Applied ${crop} preset: ${targetDLI} DLI target`);
            }}
            className="bg-transparent text-sm font-medium outline-none cursor-pointer text-gray-700 dark:text-gray-300"
          >
            <option value="custom">Custom</option>
            <option value="lettuce">Lettuce (14 DLI)</option>
            <option value="tomatoes">Tomatoes (25 DLI)</option>
            <option value="cannabis">Cannabis (40 DLI)</option>
            <option value="herbs">Herbs (20 DLI)</option>
            <option value="strawberries">Strawberries (18 DLI)</option>
          </select>
        </div>
        
        {/* Photoperiod Input */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Clock className="w-4 h-4 text-blue-500" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Hours:</label>
          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={photoperiod}
            onChange={(e) => onPhotoperiodChange?.(Number(e.target.value))}
            className="w-16 px-2 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-purple-500"
          />
        </div>
        
        {/* DLI Target Slider */}
        <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Sun className="w-4 h-4 text-yellow-500" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target DLI:</label>
          <input
            type="range"
            min="5"
            max="60"
            value={dliTarget}
            onChange={(e) => onDliTargetChange?.(Number(e.target.value))}
            className="w-24 accent-purple-600"
          />
          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 min-w-[3ch]">{dliTarget}</span>
        </div>
        
        {/* Solar DLI Calculator Button */}
        <button
          onClick={() => setShowSolarDLI(true)}
          className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg transition-colors flex items-center gap-2"
          title="Solar DLI Calculator"
        >
          <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">Solar DLI</span>
        </button>
        
        {/* Metrics Display */}
        <div className="flex items-center gap-4 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Avg PPFD:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{calculations?.averagePPFD?.toFixed(0) || 0} µmol</span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Actual DLI:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {((calculations?.averagePPFD || 0) * photoperiod * 0.0036).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (canUndo) undo();
          }}
          disabled={!canUndo}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
        <button
          onClick={() => {
            if (canRedo) redo();
          }}
          disabled={!canRedo}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
        <button
          onClick={() => setShowDistributionComparison(true)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Light Distribution Comparison"
        >
          <BarChart3 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
      </div>
      
      {/* Dialogs */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <BIMImportDialog isOpen={showBIMImport} onClose={() => setShowBIMImport(false)} />
      <CADImportModal 
        isOpen={showCADImport} 
        onClose={() => setShowCADImport(false)}
        onImport={(geometry) => {
          showNotification('success', 'CAD file imported successfully');
        }}
      />
      <ExportDialog isOpen={showExportDialog} onClose={() => setShowExportDialog(false)} />
      <RoomTemplateDialog 
        isOpen={showTemplateDialog} 
        onClose={() => {
          setShowTemplateDialog(false);
        }} 
      />
      
      {/* Professional Drawing Export Modal */}
      {showProfessionalExport && (
        <ProfessionalDrawingExport 
          isOpen={showProfessionalExport}
          onClose={() => setShowProfessionalExport(false)}
        />
      )}
      
      {/* Bill of Materials Export Modal */}
      {showBOMExport && (
        <BillOfMaterialsExport 
          isOpen={showBOMExport}
          onClose={() => setShowBOMExport(false)}
        />
      )}
      
      {/* Light Distribution Comparison Modal */}
      <LightDistributionComparison 
        isOpen={showDistributionComparison}
        onClose={() => setShowDistributionComparison(false)}
      />
      
      {/* Solar DLI Panel */}
      {showSolarDLI && (
        <SolarDLIPanel 
          isOpen={showSolarDLI}
          onClose={() => setShowSolarDLI(false)}
        />
      )}
    </div>
  );
}