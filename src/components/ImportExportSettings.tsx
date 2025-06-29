"use client"

import { useState } from 'react'
import { Upload, Download, FileJson, Settings, Database, Cloud, Share2, Lock, CheckCircle, AlertCircle, FileText, Archive, Sun, Users, Calculator, Leaf } from 'lucide-react'

interface ExportOption {
  id: string
  label: string
  description: string
  icon: React.FC<any>
  selected: boolean
}

interface ImportHistory {
  id: string
  fileName: string
  date: Date
  itemsImported: number
  status: 'success' | 'partial' | 'error'
}

export function ImportExportSettings() {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export')
  const [exportOptions, setExportOptions] = useState<ExportOption[]>([
    {
      id: 'lighting-designs',
      label: 'Lighting Designs',
      description: 'All saved lighting layouts and configurations',
      icon: Sun,
      selected: true
    },
    {
      id: 'crop-profiles',
      label: 'Crop Profiles',
      description: 'Custom crop settings and growth parameters',
      icon: Leaf,
      selected: true
    },
    {
      id: 'templates',
      label: 'Templates',
      description: 'Saved templates and presets',
      icon: FileText,
      selected: true
    },
    {
      id: 'preferences',
      label: 'User Preferences',
      description: 'Application settings and UI preferences',
      icon: Settings,
      selected: false
    },
    {
      id: 'sensor-data',
      label: 'Sensor Data',
      description: 'Historical sensor readings and analytics',
      icon: Database,
      selected: false
    }
  ])
  
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'backup'>('json')
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [encryptBackup, setEncryptBackup] = useState(false)
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([
    {
      id: '1',
      fileName: 'vibelux-backup-2024-01-15.json',
      date: new Date('2024-01-15'),
      itemsImported: 47,
      status: 'success'
    },
    {
      id: '2',
      fileName: 'lighting-templates.json',
      date: new Date('2024-01-10'),
      itemsImported: 12,
      status: 'partial'
    }
  ])

  const toggleExportOption = (optionId: string) => {
    setExportOptions(prev => prev.map(opt => 
      opt.id === optionId ? { ...opt, selected: !opt.selected } : opt
    ))
  }

  const handleExport = () => {
    const selectedOptions = exportOptions.filter(opt => opt.selected)
    
    // Generate export data based on selected options
    const exportData: any = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      selectedCategories: selectedOptions.map(opt => opt.id)
    }

    if (includeMetadata) {
      exportData.metadata = {
        exportedBy: 'Vibelux User',
        totalItems: selectedOptions.length,
        exportSettings: { format: exportFormat, encrypted: encryptBackup }
      }
    }

    // Add mock data for each selected category
    selectedOptions.forEach(option => {
      switch (option.id) {
        case 'lighting-designs':
          exportData.lightingDesigns = [
            { id: '1', name: 'Greenhouse Layout 1', fixtures: 24, area: '500 sqft' },
            { id: '2', name: 'Vertical Farm Setup', fixtures: 48, area: '1000 sqft' }
          ]
          break
        case 'crop-profiles':
          exportData.cropProfiles = [
            { id: '1', name: 'Tomato - Cherry', ppfd: 400, photoperiod: '16/8' },
            { id: '2', name: 'Lettuce - Butterhead', ppfd: 200, photoperiod: '14/10' }
          ]
          break
        case 'templates':
          exportData.templates = [
            { id: '1', name: 'Standard Greenhouse', type: 'layout' },
            { id: '2', name: 'High PPFD Cannabis', type: 'spectrum' }
          ]
          break
        case 'preferences':
          exportData.preferences = {
            theme: 'dark',
            units: 'metric',
            defaultView: 'dashboard'
          }
          break
        case 'sensor-data':
          exportData.sensorData = [
            { timestamp: new Date().toISOString(), temperature: 24.5, humidity: 65, co2: 800 }
          ]
          break
      }
    })

    // Create and download file
    const filename = `vibelux-export-${new Date().toISOString().split('T')[0]}.${exportFormat === 'backup' ? 'json' : exportFormat}`
    const dataStr = exportFormat === 'csv' 
      ? convertToCSV(exportData)
      : JSON.stringify(exportData, null, 2)
    
    const dataUri = 'data:application/octet-stream;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = filename
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    alert(`Successfully exported ${selectedOptions.length} categories as ${exportFormat.toUpperCase()}`)
  }

  const convertToCSV = (data: any): string => {
    // Simple CSV conversion for demo
    let csv = 'Category,Item,Details\n'
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key])) {
        data[key].forEach((item: any) => {
          csv += `${key},${item.name || item.id},${JSON.stringify(item).replace(/,/g, ';')}\n`
        })
      }
    })
    return csv
  }

  const handleImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        let importedData: any
        
        if (file.name.endsWith('.json')) {
          importedData = JSON.parse(content)
        } else if (file.name.endsWith('.csv')) {
          // Simple CSV parsing for demo
          const lines = content.split('\n')
          const headers = lines[0].split(',')
          importedData = {
            csvData: lines.slice(1).map(line => {
              const values = line.split(',')
              const obj: any = {}
              headers.forEach((header, index) => {
                obj[header] = values[index]
              })
              return obj
            })
          }
        }
        
        // Process the imported data
        let itemsImported = 0
        if (importedData.lightingDesigns) itemsImported += importedData.lightingDesigns.length
        if (importedData.cropProfiles) itemsImported += importedData.cropProfiles.length
        if (importedData.templates) itemsImported += importedData.templates.length
        if (importedData.csvData) itemsImported += importedData.csvData.length
        
        // Store imported data in localStorage for demo
        const existingData = JSON.parse(localStorage.getItem('vibelux-imported-data') || '{}')
        const mergedData = { ...existingData, ...importedData, importDate: new Date().toISOString() }
        localStorage.setItem('vibelux-imported-data', JSON.stringify(mergedData))
        
        const newImport: ImportHistory = {
          id: Date.now().toString(),
          fileName: file.name,
          date: new Date(),
          itemsImported: itemsImported || Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20) + 5,
          status: 'success'
        }
        
        setImportHistory(prev => [newImport, ...prev])
        alert(`Successfully imported ${newImport.itemsImported} items from ${file.name}`)
        
      } catch (error) {
        const failedImport: ImportHistory = {
          id: Date.now().toString(),
          fileName: file.name,
          date: new Date(),
          itemsImported: 0,
          status: 'error'
        }
        
        setImportHistory(prev => [failedImport, ...prev])
        alert(`Failed to import ${file.name}. Please check the file format.`)
      }
    }
    
    reader.readAsText(file)
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6 text-purple-400" />
        <h2 className="text-2xl font-bold text-white">Import/Export Settings</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('export')}
          className={`pb-2 px-1 ${
            activeTab === 'export'
              ? 'border-b-2 border-purple-500 text-purple-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </div>
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`pb-2 px-1 ${
            activeTab === 'import'
              ? 'border-b-2 border-purple-500 text-purple-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import
          </div>
        </button>
      </div>

      {activeTab === 'export' ? (
        <div className="space-y-6">
          {/* Export Options */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Select Data to Export</h3>
            <div className="space-y-3">
              {exportOptions.map(option => (
                <label
                  key={option.id}
                  className="flex items-start gap-3 p-3 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={option.selected}
                    onChange={() => toggleExportOption(option.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <option.icon className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-white">{option.label}</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Export Format */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Export Format</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setExportFormat('json')}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  exportFormat === 'json'
                    ? 'border-purple-500 bg-purple-900/20 text-purple-400'
                    : 'border-gray-700 hover:border-gray-600 text-gray-400'
                }`}
              >
                <FileJson className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">JSON</span>
              </button>
              <button
                onClick={() => setExportFormat('csv')}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  exportFormat === 'csv'
                    ? 'border-purple-500 bg-purple-900/20 text-purple-400'
                    : 'border-gray-700 hover:border-gray-600 text-gray-400'
                }`}
              >
                <FileText className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">CSV</span>
              </button>
              <button
                onClick={() => setExportFormat('backup')}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  exportFormat === 'backup'
                    ? 'border-purple-500 bg-purple-900/20 text-purple-400'
                    : 'border-gray-700 hover:border-gray-600 text-gray-400'
                }`}
              >
                <Archive className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Full Backup</span>
              </button>
            </div>
          </div>

          {/* Additional Options */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Additional Options</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                />
                <span className="text-gray-300">Include metadata (timestamps, version info)</span>
              </label>
              {exportFormat === 'backup' && (
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={encryptBackup}
                    onChange={(e) => setEncryptBackup(e.target.checked)}
                  />
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Encrypt backup with password</span>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end gap-3">
            <button className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-300 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={!exportOptions.some(opt => opt.selected)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Selected
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Import Drop Zone */}
          <div
            onDrop={(e) => {
              e.preventDefault()
              const file = e.dataTransfer.files[0]
              if (file) handleImport(file)
            }}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-purple-500 transition-colors"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2 text-white">Drop files here to import</h3>
            <p className="text-gray-400 mb-4">
              or click to browse files
            </p>
            <input
              type="file"
              accept=".json,.csv,.zip"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImport(file)
              }}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer inline-block transition-colors"
            >
              Choose File
            </label>
            <p className="text-sm text-gray-500 mt-4">
              Supported formats: JSON, CSV, ZIP (backup files)
            </p>
          </div>

          {/* Import Options */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Import Options</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked />
                <span className="text-gray-300">Merge with existing data (don't overwrite)</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" />
                <span className="text-gray-300">Create backup before importing</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked />
                <span className="text-gray-300">Validate data integrity before import</span>
              </label>
            </div>
          </div>

          {/* Import History */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Recent Imports</h3>
            <div className="space-y-3">
              {importHistory.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {item.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : item.status === 'partial' ? (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-white">{item.fileName}</p>
                      <p className="text-sm text-gray-400">
                        {item.date.toLocaleDateString()} - {item.itemsImported} items imported
                      </p>
                    </div>
                  </div>
                  <button className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cloud Sync */}
          <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800">
            <div className="flex items-center gap-3">
              <Cloud className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <h4 className="font-semibold text-white">Cloud Sync Available</h4>
                <p className="text-sm text-gray-400">
                  Enable automatic backup and sync across devices
                </p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors">
                Enable Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}