"use client"

import { useState, useCallback } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Download, Eye } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface DataInterpretation {
  mappings: Array<{
    sourceField: string
    interpretedMeaning: string
    suggestedVibeluxField: string
    dataType: string
    unit?: string
    confidence: number
    transformationNeeded?: string
  }>
  dataQuality: number
  suggestions: string[]
  warnings: string[]
  interpretedSchema: string
}

export function AIDataUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<{ headers: string[]; data: any[][] } | null>(null)
  const [interpretation, setInterpretation] = useState<DataInterpretation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'upload' | 'preview' | 'interpret' | 'results'>('upload')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFile(file)
      setError(null)
      parseCSV(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const parseCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        
        if (lines.length < 2) {
          setError('File must contain at least a header row and one data row')
          return
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        const data = lines.slice(1, 21).map(line => // Limit to first 20 rows for preview
          line.split(',').map(cell => cell.trim().replace(/"/g, ''))
        )

        setCsvData({ headers, data })
        setStep('preview')
      } catch (err) {
        setError('Failed to parse CSV file. Please check the format.')
      }
    }
    reader.readAsText(file)
  }

  const interpretData = async () => {
    if (!csvData) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai-interpret-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          headers: csvData.headers,
          sampleData: csvData.data,
          context: `File: ${file?.name}`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to interpret data')
      }

      const result = await response.json()
      setInterpretation(result)
      setStep('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to interpret data')
    } finally {
      setLoading(false)
    }
  }

  const downloadResults = () => {
    if (!interpretation) return
    
    const blob = new Blob([JSON.stringify(interpretation, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vibelux-interpretation-${file?.name?.replace(/\.[^/.]+$/, '')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    setFile(null)
    setCsvData(null)
    setInterpretation(null)
    setError(null)
    setStep('upload')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">AI Data Interpreter</h2>
            <p className="text-gray-400">Upload CSV/Excel files for AI-powered analysis</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {['Upload', 'Preview', 'Interpret', 'Results'].map((stepName, index) => {
            const stepOrder = ['upload', 'preview', 'interpret', 'results']
            const currentIndex = stepOrder.indexOf(step)
            const isActive = index === currentIndex
            const isCompleted = index < currentIndex
            
            return (
              <div key={stepName} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isActive ? 'bg-blue-500 text-white' :
                  'bg-gray-600 text-gray-300'
                }`}>
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  isActive ? 'text-white font-medium' : 'text-gray-400'
                }`}>
                  {stepName}
                </span>
                {index < 3 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            )
          })}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Upload Step */}
        {step === 'upload' && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-400 bg-blue-400/10' : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-white mb-2">
              {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
            </p>
            <p className="text-gray-400 mb-4">
              Supports CSV, XLS, and XLSX files (max 10MB)
            </p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
              Choose File
            </button>
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && csvData && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-white">Data Preview</h3>
                <p className="text-gray-400">
                  File: {file?.name} • {csvData.headers.length} columns • {csvData.data.length} rows (preview)
                </p>
              </div>
              <button
                onClick={() => setStep('interpret')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Continue to Interpret
              </button>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    {csvData.headers.map((header, index) => (
                      <th key={index} className="text-left p-2 text-gray-300 font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.data.slice(0, 5).map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-gray-800">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="p-2 text-gray-400">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Interpret Step */}
        {step === 'interpret' && (
          <div className="text-center py-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Loader2 className={`w-8 h-8 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
              <h3 className="text-lg font-medium text-white">
                {loading ? 'AI is analyzing your data...' : 'Ready to interpret'}
              </h3>
            </div>
            
            {loading ? (
              <p className="text-gray-400 mb-6">
                Our AI is examining your data structure, identifying field meanings, and preparing insights.
                This usually takes 10-30 seconds.
              </p>
            ) : (
              <>
                <p className="text-gray-400 mb-6">
                  Click below to start AI interpretation of your cultivation data.
                </p>
                <button
                  onClick={interpretData}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg"
                >
                  Start AI Analysis
                </button>
              </>
            )}
          </div>
        )}

        {/* Results Step */}
        {step === 'results' && interpretation && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-white">AI Interpretation Results</h3>
                <p className="text-gray-400">
                  Data quality score: {interpretation.dataQuality}/100
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadResults}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={reset}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  New File
                </button>
              </div>
            </div>

            {/* Field Mappings */}
            <div className="grid gap-6">
              <div className="bg-gray-900/50 rounded-lg p-6">
                <h4 className="text-white font-medium mb-4">Field Mappings</h4>
                <div className="space-y-3">
                  {interpretation.mappings.map((mapping, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                      <div className="flex-1">
                        <div className="text-white font-medium">{mapping.sourceField}</div>
                        <div className="text-gray-400 text-sm">{mapping.interpretedMeaning}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-400 text-sm">{mapping.suggestedVibeluxField}</div>
                        <div className="text-gray-500 text-xs">{mapping.confidence}% confidence</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              {interpretation.suggestions.length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                  <h4 className="text-blue-400 font-medium mb-3">Suggestions</h4>
                  <ul className="space-y-2">
                    {interpretation.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-blue-300 text-sm">
                        • {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {interpretation.warnings.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
                  <h4 className="text-yellow-400 font-medium mb-3">Warnings</h4>
                  <ul className="space-y-2">
                    {interpretation.warnings.map((warning, index) => (
                      <li key={index} className="text-yellow-300 text-sm">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}