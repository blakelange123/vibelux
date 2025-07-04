import { GPUAcceleratedRenderer } from '@/components/GPUAcceleratedRenderer'

export default function GPURaytracingPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <GPUAcceleratedRenderer />
    </div>
  )
}