"use client"
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  FileType, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Download,
  Eye,
  X
} from 'lucide-react'

interface CADImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (geometry: any) => void
}

const SUPPORTED_FORMATS = {
  native: ['dxf', 'ifc'],
  cloud: ['dwg', 'rvt', 'rfa', 'skp', 'nwd', 'nwc', '3ds', 'obj', 'fbx']
}

export function CADImportModal({ isOpen, onClose, onImport }: CADImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [converting, setConverting] = useState(false)
  const [conversionStatus, setConversionStatus] = useState<'idle' | 'uploading' | 'converting' | 'success' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [jobData, setJobData] = useState<any>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setConversionStatus('idle')
      setErrorMessage('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/dxf': ['.dxf'],
      'application/dwg': ['.dwg'],
      'application/ifc': ['.ifc'],
      'application/rvt': ['.rvt', '.rfa'],
      'application/skp': ['.skp'],
      'model/obj': ['.obj'],
      'model/fbx': ['.fbx'],
      'model/3ds': ['.3ds'],
      'application/nwd': ['.nwd', '.nwc']
    },
    maxFiles: 1
  })

  const handleConvert = async () => {
    if (!file) return

    const extension = file.name.split('.').pop()?.toLowerCase()
    
    // Check if native parsing is available
    if (SUPPORTED_FORMATS.native.includes(extension!)) {
      // Handle native formats (DXF, IFC)
      handleNativeImport()
    } else {
      // Use Forge for cloud conversion
      handleForgeConversion()
    }
  }

  const handleNativeImport = async () => {
    setConverting(true)
    setConversionStatus('converting')

    try {
      // For now, just simulate - you'd implement actual DXF/IFC parsing here
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setConversionStatus('success')
      // Parse the file and create Three.js geometry
      // onImport(parsedGeometry)
    } catch (error) {
      setConversionStatus('error')
      setErrorMessage('Failed to parse file')
    } finally {
      setConverting(false)
    }
  }

  const handleForgeConversion = async () => {
    setConverting(true)
    setConversionStatus('uploading')
    setProgress(0)

    try {
      // Upload and convert
      const formData = new FormData()
      formData.append('file', file!)
      formData.append('outputFormat', 'obj') // or 'svf2' for viewing

      const response = await fetch('/api/forge/convert', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Conversion failed')
      }

      const data = await response.json()
      setJobData(data)
      setConversionStatus('converting')
      
      // Poll for status
      pollForCompletion(data.urn)
      
    } catch (error) {
      setConversionStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Conversion failed')
      setConverting(false)
    }
  }

  const pollForCompletion = async (urn: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/forge/status?urn=${urn}`)
        const data = await response.json()
        
        // Update progress
        const progressMatch = data.progress?.match(/(\d+)%/)
        if (progressMatch) {
          setProgress(parseInt(progressMatch[1]))
        }
        
        if (data.status === 'success') {
          clearInterval(pollInterval)
          setConversionStatus('success')
          setConverting(false)
          
          // Download and import
          if (data.downloadUrls.length > 0) {
            downloadAndImport(urn, data.downloadUrls[0].urn)
          }
        } else if (data.status === 'failed') {
          clearInterval(pollInterval)
          setConversionStatus('error')
          setErrorMessage('Conversion failed')
          setConverting(false)
        }
      } catch (error) {
        clearInterval(pollInterval)
        setConversionStatus('error')
        setErrorMessage('Failed to check status')
        setConverting(false)
      }
    }, 2000)
  }

  const downloadAndImport = async (urn: string, derivativeUrn: string) => {
    try {
      const response = await fetch(`/api/forge/download?urn=${urn}&derivativeUrn=${derivativeUrn}`)
      const blob = await response.blob()
      
      // Parse the downloaded file (OBJ, etc.) and create Three.js geometry
      // This is where you'd use Three.js loaders
      
      // For now, close modal
      onClose()
    } catch (error) {
      setErrorMessage('Failed to download converted file')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Import CAD File</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white mb-2">
              {isDragActive ? 'Drop the file here' : 'Drag & drop a CAD file here'}
            </p>
            <p className="text-sm text-gray-400">
              or click to select a file
            </p>
          </div>

          {/* Supported formats */}
          <div className="mt-4">
            <p className="text-sm text-gray-400 mb-2">Supported formats:</p>
            <div className="flex flex-wrap gap-2">
              {[...SUPPORTED_FORMATS.native, ...SUPPORTED_FORMATS.cloud].map(format => (
                <span
                  key={format}
                  className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded uppercase"
                >
                  .{format}
                </span>
              ))}
            </div>
          </div>

          {/* Selected file */}
          {file && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileType className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-sm text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null)
                    setConversionStatus('idle')
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Conversion status */}
          {conversionStatus !== 'idle' && (
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-2">
                {conversionStatus === 'uploading' && (
                  <>
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    <span className="text-white">Uploading file...</span>
                  </>
                )}
                {conversionStatus === 'converting' && (
                  <>
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    <span className="text-white">Converting file... {progress}%</span>
                  </>
                )}
                {conversionStatus === 'success' && (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">Conversion complete!</span>
                  </>
                )}
                {conversionStatus === 'error' && (
                  <>
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span className="text-white">Error: {errorMessage}</span>
                  </>
                )}
              </div>

              {/* Progress bar */}
              {conversionStatus === 'converting' && (
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleConvert}
              disabled={!file || converting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {converting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}