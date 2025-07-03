"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Bug, AlertCircle } from 'lucide-react'

interface PestImageWithFallbackProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
}

export function PestImageWithFallback({ 
  src, 
  alt, 
  className = "", 
  width = 400, 
  height = 300 
}: PestImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false)
  
  if (hasError) {
    return (
      <div 
        className={`flex flex-col items-center justify-center bg-gray-800 border border-gray-700 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <Bug className="w-12 h-12 text-gray-600 mb-2" />
        <p className="text-xs text-gray-500">Image not available</p>
      </div>
    )
  }
  
  return (
    <div className="relative">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`object-cover rounded-lg ${className}`}
        onError={() => setHasError(true)}
        unoptimized // Since we're using placeholder paths
      />
      {/* Placeholder overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 rounded-lg">
        <div className="text-center">
          <Bug className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-400">Pest Image</p>
          <p className="text-xs text-gray-500">{alt}</p>
        </div>
      </div>
    </div>
  )
}