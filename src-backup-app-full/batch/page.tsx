"use client"

import { useState } from 'react'
import { 
  Package, 
  Upload, 
  Download,
  Settings,
  Check,
  X,
  AlertCircle,
  Loader2,
  FileText,
  Lightbulb,
  Calendar,
  Calculator,
  BarChart3,
  Copy,
  Play,
  Pause,
  RefreshCw,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react'

interface BatchOperation {
  id: string
  name: string
  type: 'fixtures' | 'schedules' | 'calculations' | 'reports' | 'exports'
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  totalItems: number
  processedItems: number
  errors: string[]
  startTime?: Date
  endTime?: Date
}

export default function BatchOperationsPage() {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new')
  const [selectedOperationType, setSelectedOperationType] = useState<string>('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [operations, setOperations] = useState<BatchOperation[]>([
    {
      id: '1',
      name: 'Update 50 Fixtures',
      type: 'fixtures',
      status: 'completed',
      progress: 100,
      totalItems: 50,
      processedItems: 50,
      errors: [],
      startTime: new Date('2024-03-15T10:00:00'),
      endTime: new Date('2024-03-15T10:05:00')
    },
    {
      id: '2',
      name: 'Generate Monthly Reports',
      type: 'reports',
      status: 'running',
      progress: 65,
      totalItems: 12,
      processedItems: 8,
      errors: [],
      startTime: new Date('2024-03-15T14:00:00')
    }
  ])

  const operationTypes = [
    {
      id: 'fixtures',
      name: 'Fixture Updates',
      description: 'Bulk update fixture settings, schedules, and configurations',
      icon: Lightbulb,
      actions: ['Update Settings', 'Apply Schedules', 'Import Configurations', 'Export Data']
    },
    {
      id: 'schedules',
      name: 'Schedule Management',
      description: 'Create, modify, or apply lighting schedules in bulk',
      icon: Calendar,
      actions: ['Create Schedules', 'Modify Existing', 'Apply to Fixtures', 'Export Schedules']
    },
    {
      id: 'calculations',
      name: 'Bulk Calculations',
      description: 'Run DLI, PPFD, and energy calculations for multiple configurations',
      icon: Calculator,
      actions: ['DLI Calculations', 'PPFD Analysis', 'Energy Usage', 'Cost Analysis']
    },
    {
      id: 'reports',
      name: 'Report Generation',
      description: 'Generate multiple reports for different time periods or locations',
      icon: BarChart3,
      actions: ['Energy Reports', 'Performance Analysis', 'Compliance Reports', 'Custom Reports']
    },
    {
      id: 'exports',
      name: 'Data Export',
      description: 'Export data in various formats for multiple entities',
      icon: FileSpreadsheet,
      actions: ['Export to Excel', 'Export to CSV', 'Export to PDF', 'API Export']
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'running': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="w-5 h-5" />
      case 'running': return <Loader2 className="w-5 h-5 animate-spin" />
      case 'failed': return <X className="w-5 h-5" />
      default: return <AlertCircle className="w-5 h-5" />
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const startBatchOperation = () => {
    const newOperation: BatchOperation = {
      id: Date.now().toString(),
      name: `Batch ${selectedOperationType} - ${selectedFiles.length} files`,
      type: selectedOperationType as any,
      status: 'running',
      progress: 0,
      totalItems: selectedFiles.length * 10, // Mock calculation
      processedItems: 0,
      errors: [],
      startTime: new Date()
    }

    setOperations([newOperation, ...operations])
    setSelectedFiles([])
    setSelectedOperationType('')

    // Simulate progress
    const interval = setInterval(() => {
      setOperations(prev => prev.map(op => {
        if (op.id === newOperation.id && op.status === 'running') {
          const newProgress = Math.min(op.progress + 10, 100)
          const newProcessedItems = Math.floor((newProgress / 100) * op.totalItems)
          
          if (newProgress === 100) {
            clearInterval(interval)
            return {
              ...op,
              progress: 100,
              processedItems: op.totalItems,
              status: 'completed',
              endTime: new Date()
            }
          }
          
          return {
            ...op,
            progress: newProgress,
            processedItems: newProcessedItems
          }
        }
        return op
      }))
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-black p-8 pl-72">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
            Batch Operations
          </h1>
          <p className="text-gray-400">
            Perform bulk operations on fixtures, schedules, and data
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-6 py-3 rounded-t-lg transition-all ${
              activeTab === 'new'
                ? 'bg-gray-900/50 text-white border-t-2 border-purple-500'
                : 'bg-black/50 text-gray-400 hover:text-white'
            }`}
          >
            New Operation
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-t-lg transition-all ${
              activeTab === 'history'
                ? 'bg-gray-900/50 text-white border-t-2 border-purple-500'
                : 'bg-black/50 text-gray-400 hover:text-white'
            }`}
          >
            History
          </button>
        </div>

        {activeTab === 'new' ? (
          <div className="space-y-8">
            {/* Operation Type Selection */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">
                Select Operation Type
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {operationTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedOperationType(type.id)}
                      className={`p-4 rounded-lg border transition-all text-left ${
                        selectedOperationType === type.id
                          ? 'bg-purple-600/20 border-purple-500 text-white'
                          : 'bg-black/50 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <Icon className="w-8 h-8 mb-3" />
                      <h3 className="font-semibold mb-1">{type.name}</h3>
                      <p className="text-sm opacity-80">{type.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Operation Details */}
            {selectedOperationType && (
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Configure {operationTypes.find(t => t.id === selectedOperationType)?.name}
                </h2>

                {/* Actions */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Select Actions
                  </label>
                  <div className="space-y-2">
                    {operationTypes
                      .find(t => t.id === selectedOperationType)
                      ?.actions.map((action) => (
                        <label
                          key={action}
                          className="flex items-center gap-3 p-3 bg-black/50 rounded-lg border border-white/10 hover:border-white/20 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-purple-600 bg-black border-white/20 rounded focus:ring-purple-500"
                          />
                          <span className="text-white">{action}</span>
                        </label>
                      ))}
                  </div>
                </div>

                {/* File Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Upload Data Files
                  </label>
                  <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-white/20 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-400 mb-2">
                        Drag and drop files here or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports CSV, Excel, and JSON files
                      </p>
                    </label>
                  </div>

                  {/* Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-white/10"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <span className="text-white">{file.name}</span>
                            <span className="text-sm text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <button
                            onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Start Button */}
                <button
                  onClick={startBatchOperation}
                  disabled={selectedFiles.length === 0}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Start Batch Operation
                </button>
              </div>
            )}
          </div>
        ) : (
          /* History Tab */
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="space-y-4">
              {operations.map((operation) => (
                <div
                  key={operation.id}
                  className="p-4 bg-black/50 rounded-lg border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={getStatusColor(operation.status)}>
                        {getStatusIcon(operation.status)}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{operation.name}</h3>
                        <p className="text-sm text-gray-400">
                          Started: {operation.startTime?.toLocaleString()}
                          {operation.endTime && ` • Completed: ${operation.endTime.toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {operation.status === 'running' && (
                        <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all">
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      {operation.status === 'completed' && (
                        <>
                          <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {(operation.status === 'running' || operation.status === 'completed') && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>{operation.processedItems} / {operation.totalItems} items</span>
                        <span>{operation.progress}%</span>
                      </div>
                      <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                          style={{ width: `${operation.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {operation.errors.length > 0 && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-sm">
                        {operation.errors.length} errors occurred
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}