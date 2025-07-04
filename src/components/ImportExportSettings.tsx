"use client"

import { useState } from 'react'
import { Upload, Download, FileJson, Settings, Database, Cloud, Share2, Lock, CheckCircle, AlertCircle, FileText, Archive } from 'lucide-react'

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
    console.log('Exporting:', {
      options: selectedOptions.map(opt => opt.id),
      format: exportFormat,
      includeMetadata,
      encryptBackup
    })
    
    // In a real app, this would generate and download the export file
    alert(`Exporting ${selectedOptions.length} categories as ${exportFormat.toUpperCase()}`)
  }

  const handleImport = (file: File) => {
    console.log('Importing file:', file.name)
    
    // In a real app, this would process the import file
    const newImport: ImportHistory = {
      id: Date.now().toString(),
      fileName: file.name,
      date: new Date(),
      itemsImported: Math.floor(Math.random() * 50) + 10,
      status: Math.random() > 0.8 ? 'partial' : 'success'
    }
    
    setImportHistory(prev => [newImport, ...prev])
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Import/Export Settings</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('export')}
          className={`pb-2 px-1 ${
            activeTab === 'export'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
            <h3 className="text-lg font-semibold mb-4">Select Data to Export</h3>
            <div className="space-y-3">
              {exportOptions.map(option => (
                <label
                  key={option.id}
                  className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={option.selected}
                    onChange={() => toggleExportOption(option.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <option.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Export Format */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Export Format</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setExportFormat('json')}
                className={`p-3 border rounded-lg text-center ${
                  exportFormat === 'json'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <FileJson className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">JSON</span>
              </button>
              <button
                onClick={() => setExportFormat('csv')}
                className={`p-3 border rounded-lg text-center ${
                  exportFormat === 'csv'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <FileText className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">CSV</span>
              </button>
              <button
                onClick={() => setExportFormat('backup')}
                className={`p-3 border rounded-lg text-center ${
                  exportFormat === 'backup'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <Archive className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Full Backup</span>
              </button>
            </div>
          </div>

          {/* Additional Options */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Additional Options</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                />
                <span>Include metadata (timestamps, version info)</span>
              </label>
              {exportFormat === 'backup' && (
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={encryptBackup}
                    onChange={(e) => setEncryptBackup(e.target.checked)}
                  />
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-600" />
                    <span>Encrypt backup with password</span>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end gap-3">
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={!exportOptions.some(opt => opt.selected)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-indigo-600 transition-colors"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Drop files here to import</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer inline-block"
            >
              Choose File
            </label>
            <p className="text-sm text-gray-500 mt-4">
              Supported formats: JSON, CSV, ZIP (backup files)
            </p>
          </div>

          {/* Import Options */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Import Options</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked />
                <span>Merge with existing data (don't overwrite)</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" />
                <span>Create backup before importing</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked />
                <span>Validate data integrity before import</span>
              </label>
            </div>
          </div>

          {/* Import History */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Imports</h3>
            <div className="space-y-3">
              {importHistory.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
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
                      <p className="font-medium">{item.fileName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.date.toLocaleDateString()} - {item.itemsImported} items imported
                      </p>
                    </div>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-700 text-sm">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cloud Sync */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Cloud className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-semibold">Cloud Sync Available</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enable automatic backup and sync across devices
                </p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                Enable Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}