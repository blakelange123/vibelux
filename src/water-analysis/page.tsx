import { WaterAnalysisWizard } from '@/components/WaterAnalysisWizard'

export default function WaterAnalysisPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <WaterAnalysisWizard />
      </div>
    </div>
  )
}