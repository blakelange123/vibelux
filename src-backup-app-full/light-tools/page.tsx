"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LightToolsRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/lighting-tools')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-white">Redirecting to Lighting Tools...</div>
    </div>
  )
}