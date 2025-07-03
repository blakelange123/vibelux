'use client'

import dynamic from 'next/dynamic'

// Dynamically import the 3D component with no SSR
const Room3DWebGL = dynamic(() => import('./Room3DWebGL').then(mod => mod.Room3DWebGL), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading 3D view...</p>
      </div>
    </div>
  )
})

export default Room3DWebGL