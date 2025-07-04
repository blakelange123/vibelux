"use client"

import { useState, useRef } from 'react'
import { Upload, File, Check, X, AlertCircle } from 'lucide-react'
import { convertUploadedIES, extractPhotometricSummary, type ParsedIESFile } from '@/lib/ies-parser'

interface IESUploaderProps {
  onIESUploaded: (iesData: ParsedIESFile) => void
  className?: string
}

export function IESUploader({ onIESUploaded, className = '' }: IESUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [uploadedFile, setUploadedFile] = useState<ParsedIESFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.ies')) {
      setErrorMessage('Please upload a valid .ies file')
      setUploadStatus('error')
      return
    }

    setUploadStatus('uploading')
    setErrorMessage('')

    try {
      const parsedIES = await convertUploadedIES(file)
      setUploadedFile(parsedIES)
      setUploadStatus('success')
      onIESUploaded(parsedIES)
    } catch (error) {
      console.error('IES upload error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to parse IES file')
      setUploadStatus('error')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const resetUpload = () => {
    setUploadStatus('idle')
    setErrorMessage('')
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const photometricSummary = uploadedFile ? extractPhotometricSummary(uploadedFile) : null

  return (
    <div className={`bg-gray-800/50 rounded-xl border border-gray-700 p-4 ${className}`}>
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <Upload className="w-4 h-4" />
        Custom IES Upload
      </h3>

      {uploadStatus === 'idle' && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer ${
            isDragOver 
              ? 'border-purple-500 bg-purple-500/10' 
              : 'border-gray-600 hover:border-gray-500 bg-gray-900/50'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <Upload className={`w-8 h-8 mx-auto mb-2 ${
              isDragOver ? 'text-purple-400' : 'text-gray-400'
            }`} />
            <p className="text-white text-sm font-medium mb-1">
              Upload IES Photometric File
            </p>
            <p className="text-gray-400 text-xs">
              Drag & drop or click to select .ies file
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".ies"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {uploadStatus === 'uploading' && (
        <div className="text-center py-6">
          <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-300 text-sm">Parsing IES file...</p>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 font-medium text-sm">Upload Failed</span>
          </div>
          <p className="text-red-300 text-xs mb-3">{errorMessage}</p>
          <button
            onClick={resetUpload}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded text-white text-xs transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {uploadStatus === 'success' && uploadedFile && photometricSummary && (
        <div className="space-y-4">
          <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-medium text-sm">IES File Loaded</span>
              </div>
              <button
                onClick={resetUpload}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-1">
              <p className="text-white text-xs font-medium">
                {uploadedFile.header.filename}
              </p>
              {uploadedFile.header.manufacturer && (
                <p className="text-gray-300 text-xs">
                  {uploadedFile.header.manufacturer} - {uploadedFile.header.luminaire}
                </p>
              )}
            </div>
          </div>

          {/* Photometric Summary */}
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
              <File className="w-3 h-3" />
              Photometric Summary
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Beam Angle:</span>
                <p className="text-white font-medium">{photometricSummary.beamAngle.toFixed(0)}°</p>
              </div>
              <div>
                <span className="text-gray-400">Field Angle:</span>
                <p className="text-white font-medium">{photometricSummary.fieldAngle.toFixed(0)}°</p>
              </div>
              <div>
                <span className="text-gray-400">Total Lumens:</span>
                <p className="text-white font-medium">{photometricSummary.totalLumens.toFixed(0)}</p>
              </div>
              <div>
                <span className="text-gray-400">Max Candela:</span>
                <p className="text-white font-medium">{photometricSummary.maxCandela.toFixed(0)}</p>
              </div>
              <div>
                <span className="text-gray-400">Fixture Size:</span>
                <p className="text-white font-medium">
                  {photometricSummary.fixtureSize.width.toFixed(1)} × {photometricSummary.fixtureSize.length.toFixed(1)}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Est. PPFD:</span>
                <p className="text-white font-medium">{photometricSummary.centerBeamPPFD.toFixed(0)}</p>
              </div>
            </div>
          </div>

          {/* Usage Note */}
          <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3">
            <p className="text-blue-300 text-xs">
              <strong>Note:</strong> This IES file will be used for accurate photometric modeling 
              instead of synthetic data. PPFD calculations will reflect the actual measured 
              light distribution pattern.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}