'use client';

import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  FileJson, 
  FileImage, 
  FileSpreadsheet,
  FileText,
  Check,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';

interface ExportImportToolProps {
  isOpen: boolean;
  onClose: () => void;
  measurements?: any[];
  calculationZones?: any[];
}

export function ExportImportTool({ 
  isOpen, 
  onClose, 
  measurements = [],
  calculationZones = []
}: ExportImportToolProps) {
  const { state, dispatch, addObject } = useDesigner();
  const { showNotification } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'png' | 'pdf'>('json');
  const [includeOptions, setIncludeOptions] = useState({
    room: true,
    fixtures: true,
    equipment: true,
    shapes: true,
    measurements: true,
    calculations: true,
    metadata: true
  });
  const [isExporting, setIsExporting] = useState(false);
  const [importPreview, setImportPreview] = useState<any>(null);
  
  // Export formats configuration
  const exportFormats = [
    { 
      id: 'json', 
      label: 'JSON', 
      icon: FileJson, 
      description: 'Complete design data',
      extension: '.json'
    },
    { 
      id: 'csv', 
      label: 'CSV', 
      icon: FileSpreadsheet, 
      description: 'Spreadsheet compatible',
      extension: '.csv'
    },
    { 
      id: 'png', 
      label: 'PNG', 
      icon: FileImage, 
      description: 'High-resolution image',
      extension: '.png'
    },
    { 
      id: 'pdf', 
      label: 'PDF', 
      icon: FileText, 
      description: 'Professional report',
      extension: '.pdf'
    }
  ];
  
  // Generate export data
  const generateExportData = () => {
    const exportData: any = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      application: 'VibeLux Designer'
    };
    
    if (includeOptions.room && state.room) {
      exportData.room = {
        width: state.room.width,
        length: state.room.length,
        height: state.room.height,
        type: state.room.type
      };
    }
    
    if (includeOptions.fixtures) {
      exportData.fixtures = state.objects.filter(obj => obj.type === 'fixture').map(obj => ({
        id: obj.id,
        x: obj.x,
        y: obj.y,
        rotation: obj.rotation || 0,
        model: obj.model,
        enabled: obj.enabled !== false
      }));
    }
    
    if (includeOptions.equipment) {
      exportData.equipment = state.objects.filter(obj => obj.type === 'equipment').map(obj => ({
        id: obj.id,
        x: obj.x,
        y: obj.y,
        width: obj.width,
        length: obj.length,
        rotation: obj.rotation || 0,
        equipmentType: obj.equipmentType,
        model: obj.model
      }));
    }
    
    if (includeOptions.shapes) {
      exportData.shapes = state.objects.filter(obj => 
        ['rectangle', 'circle', 'line'].includes(obj.type)
      );
    }
    
    if (includeOptions.measurements && measurements.length > 0) {
      exportData.measurements = measurements.map(m => ({
        type: m.type,
        points: m.points,
        value: m.value,
        unit: m.unit,
        label: m.label
      }));
    }
    
    if (includeOptions.calculations && state.calculations) {
      exportData.calculations = {
        avgPPFD: state.calculations.avgPPFD,
        minPPFD: state.calculations.minPPFD,
        maxPPFD: state.calculations.maxPPFD,
        uniformity: state.calculations.uniformity,
        coverage: state.calculations.coverage,
        totalPower: state.calculations.totalPower,
        efficacy: state.calculations.efficacy
      };
    }
    
    if (includeOptions.metadata) {
      exportData.metadata = {
        projectName: 'VibeLux Design',
        designer: 'VibeLux User',
        notes: '',
        cropType: state.ui.selectedCrop || 'lettuce'
      };
    }
    
    return exportData;
  };
  
  // Export to JSON
  const exportToJSON = () => {
    const data = generateExportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibelux_design_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('success', 'Design exported successfully');
  };
  
  // Export to CSV
  const exportToCSV = () => {
    const data = generateExportData();
    let csv = 'Type,ID,X,Y,Width,Length,Rotation,Model,Details\n';
    
    // Add fixtures
    if (data.fixtures) {
      data.fixtures.forEach((fixture: any) => {
        csv += `Fixture,${fixture.id},${fixture.x},${fixture.y},,,${fixture.rotation},${fixture.model?.model || 'Unknown'},${fixture.enabled ? 'Enabled' : 'Disabled'}\n`;
      });
    }
    
    // Add equipment
    if (data.equipment) {
      data.equipment.forEach((eq: any) => {
        csv += `Equipment,${eq.id},${eq.x},${eq.y},${eq.width},${eq.length},${eq.rotation},${eq.model?.model || 'Unknown'},${eq.equipmentType}\n`;
      });
    }
    
    // Add summary
    csv += '\nSummary\n';
    csv += `Room Size,${data.room?.width || 0} x ${data.room?.length || 0} x ${data.room?.height || 0} ft\n`;
    if (data.calculations) {
      csv += `Average PPFD,${data.calculations.avgPPFD} µmol/m²/s\n`;
      csv += `Uniformity,${(data.calculations.uniformity * 100).toFixed(1)}%\n`;
      csv += `Total Power,${data.calculations.totalPower} W\n`;
    }
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibelux_design_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('success', 'CSV exported successfully');
  };
  
  // Export to PNG
  const exportToPNG = async () => {
    setIsExporting(true);
    
    // Get canvas element
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) {
      showNotification('error', 'Canvas not found');
      setIsExporting(false);
      return;
    }
    
    // Create high-resolution copy
    const exportCanvas = document.createElement('canvas');
    const scale = 2; // 2x resolution
    exportCanvas.width = canvas.width * scale;
    exportCanvas.height = canvas.height * scale;
    
    const ctx = exportCanvas.getContext('2d')!;
    ctx.scale(scale, scale);
    ctx.drawImage(canvas, 0, 0);
    
    // Add watermark
    ctx.font = '12px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'right';
    ctx.fillText(`VibeLux Designer - ${new Date().toLocaleDateString()}`, canvas.width - 10, canvas.height - 10);
    
    // Convert to blob and download
    exportCanvas.toBlob((blob) => {
      if (!blob) {
        showNotification('error', 'Failed to export image');
        setIsExporting(false);
        return;
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vibelux_design_${new Date().toISOString().split('T')[0]}.png`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('success', 'Image exported successfully');
      setIsExporting(false);
    }, 'image/png');
  };
  
  // Export to PDF (simplified version)
  const exportToPDF = async () => {
    setIsExporting(true);
    
    // This would require a PDF library like jsPDF
    // For now, we'll create a simple HTML report
    const data = generateExportData();
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>VibeLux Design Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { border-collapse: collapse; width: 100%; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .header { background-color: #8b5cf6; color: white; padding: 20px; margin: -20px -20px 20px -20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>VibeLux Design Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <h2>Room Configuration</h2>
        <p>Dimensions: ${data.room?.width || 0} x ${data.room?.length || 0} x ${data.room?.height || 0} ft</p>
        
        <h2>Fixtures</h2>
        <table>
          <tr>
            <th>ID</th>
            <th>Position</th>
            <th>Model</th>
            <th>Status</th>
          </tr>
          ${(data.fixtures || []).map((f: any) => `
            <tr>
              <td>${f.id}</td>
              <td>(${f.x.toFixed(1)}, ${f.y.toFixed(1)})</td>
              <td>${f.model?.model || 'Unknown'}</td>
              <td>${f.enabled ? 'Enabled' : 'Disabled'}</td>
            </tr>
          `).join('')}
        </table>
        
        ${data.calculations ? `
          <h2>Performance Metrics</h2>
          <ul>
            <li>Average PPFD: ${data.calculations.avgPPFD} µmol/m²/s</li>
            <li>Uniformity: ${(data.calculations.uniformity * 100).toFixed(1)}%</li>
            <li>Coverage: ${(data.calculations.coverage * 100).toFixed(1)}%</li>
            <li>Total Power: ${data.calculations.totalPower} W</li>
            <li>Efficacy: ${data.calculations.efficacy.toFixed(2)} µmol/J</li>
          </ul>
        ` : ''}
      </body>
      </html>
    `;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibelux_report_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('success', 'Report exported successfully');
    setIsExporting(false);
  };
  
  // Handle export
  const handleExport = () => {
    switch (exportFormat) {
      case 'json':
        exportToJSON();
        break;
      case 'csv':
        exportToCSV();
        break;
      case 'png':
        exportToPNG();
        break;
      case 'pdf':
        exportToPDF();
        break;
    }
  };
  
  // Handle import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate import data
        if (!data.version || !data.room) {
          throw new Error('Invalid file format');
        }
        
        setImportPreview(data);
      } catch (error) {
        showNotification('error', 'Failed to read file. Please ensure it\'s a valid VibeLux design file.');
      }
    };
    
    reader.readAsText(file);
  };
  
  // Confirm import
  const confirmImport = () => {
    if (!importPreview) return;
    
    try {
      // Clear existing design
      dispatch({ type: 'CLEAR_DESIGN' });
      
      // Import room
      if (importPreview.room) {
        dispatch({ 
          type: 'SET_ROOM', 
          payload: importPreview.room 
        });
      }
      
      // Import fixtures
      if (importPreview.fixtures) {
        importPreview.fixtures.forEach((fixture: any) => {
          addObject({
            ...fixture,
            type: 'fixture'
          });
        });
      }
      
      // Import equipment
      if (importPreview.equipment) {
        importPreview.equipment.forEach((eq: any) => {
          addObject({
            ...eq,
            type: 'equipment'
          });
        });
      }
      
      // Import shapes
      if (importPreview.shapes) {
        importPreview.shapes.forEach((shape: any) => {
          addObject(shape);
        });
      }
      
      showNotification('success', 'Design imported successfully');
      setImportPreview(null);
      onClose();
    } catch (error) {
      showNotification('error', 'Failed to import design');
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Export/Import Design</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {!importPreview ? (
            <div className="grid grid-cols-2 gap-6">
              {/* Export Section */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-400" />
                  Export Design
                </h3>
                
                {/* Format Selection */}
                <div className="space-y-3 mb-4">
                  {exportFormats.map(format => {
                    const Icon = format.icon;
                    return (
                      <button
                        key={format.id}
                        onClick={() => setExportFormat(format.id as any)}
                        className={`
                          w-full p-3 rounded-lg border-2 transition-all text-left
                          ${exportFormat === format.id 
                            ? 'border-purple-500 bg-purple-500/10' 
                            : 'border-gray-700 hover:border-gray-600'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <div className="font-medium text-white">{format.label}</div>
                            <div className="text-xs text-gray-400">{format.description}</div>
                          </div>
                          {exportFormat === format.id && (
                            <Check className="w-5 h-5 text-purple-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {/* Include Options */}
                {exportFormat === 'json' && (
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium text-gray-400 mb-2">Include:</p>
                    {Object.entries(includeOptions).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setIncludeOptions(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                          className="rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
                        />
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                    ))}
                  </div>
                )}
                
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export
                    </>
                  )}
                </button>
              </div>
              
              {/* Import Section */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-green-400" />
                  Import Design
                </h3>
                
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 mb-3">
                    Drop your design file here or click to browse
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Choose File
                  </button>
                  <p className="text-xs text-gray-500 mt-3">
                    Supports .json files exported from VibeLux Designer
                  </p>
                </div>
                
                <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-300">
                      <p className="font-medium mb-1">Warning</p>
                      <p className="text-xs">
                        Importing a design will replace your current work. Make sure to export your current design first if you want to save it.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Import Preview */
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Import Preview</h3>
              
              <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-white mb-2">File Information</h4>
                <dl className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Version:</dt>
                    <dd className="text-gray-300">{importPreview.version}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Export Date:</dt>
                    <dd className="text-gray-300">{new Date(importPreview.exportDate).toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Room Size:</dt>
                    <dd className="text-gray-300">
                      {importPreview.room?.width} x {importPreview.room?.length} x {importPreview.room?.height} ft
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-white mb-2">Contents</h4>
                <ul className="text-sm space-y-1">
                  {importPreview.fixtures && (
                    <li className="text-gray-300">• {importPreview.fixtures.length} fixtures</li>
                  )}
                  {importPreview.equipment && (
                    <li className="text-gray-300">• {importPreview.equipment.length} equipment items</li>
                  )}
                  {importPreview.shapes && (
                    <li className="text-gray-300">• {importPreview.shapes.length} shapes</li>
                  )}
                  {importPreview.measurements && (
                    <li className="text-gray-300">• {importPreview.measurements.length} measurements</li>
                  )}
                </ul>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={confirmImport}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Import Design
                </button>
                <button
                  onClick={() => setImportPreview(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}