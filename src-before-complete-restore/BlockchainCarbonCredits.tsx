"use client"

import { useState, useEffect } from 'react'
import { 
  Leaf, 
  TrendingUp, 
  Coins, 
  Shield,
  Activity,
  Award,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Download,
  ExternalLink,
  Hash,
  Lock,
  RefreshCw
} from 'lucide-react'

interface CarbonCredit {
  id: string
  amount: number
  pricePerTon: number
  issueDate: Date
  expiryDate: Date
  status: 'active' | 'pending' | 'retired'
  projectType: string
  verificationStandard: string
  blockchainTx?: string
}

interface EmissionMetrics {
  baseline: number
  current: number
  saved: number
  creditsEarned: number
  creditsValue: number
}

export function BlockchainCarbonCredits() {
  const [credits, setCredits] = useState<CarbonCredit[]>([])
  const [metrics, setMetrics] = useState<EmissionMetrics>({
    baseline: 2450,
    current: 1820,
    saved: 630,
    creditsEarned: 63,
    creditsValue: 1890
  })
  const [isVerifying, setIsVerifying] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'month' | 'quarter' | 'year'>('quarter')

  useEffect(() => {
    // Simulate loading credits
    const mockCredits: CarbonCredit[] = [
      {
        id: 'VBX-2024-001',
        amount: 25,
        pricePerTon: 30,
        issueDate: new Date('2024-01-15'),
        expiryDate: new Date('2029-01-15'),
        status: 'active',
        projectType: 'Energy Efficiency - LED Lighting',
        verificationStandard: 'Gold Standard',
        blockchainTx: '0x7d4e3f...8a9b2c'
      },
      {
        id: 'VBX-2024-002',
        amount: 18,
        pricePerTon: 32,
        issueDate: new Date('2024-02-20'),
        expiryDate: new Date('2029-02-20'),
        status: 'active',
        projectType: 'Renewable Energy Integration',
        verificationStandard: 'Verra VCS',
        blockchainTx: '0x9f2a1b...4d5e6f'
      },
      {
        id: 'VBX-2024-003',
        amount: 20,
        pricePerTon: 28,
        issueDate: new Date('2024-03-10'),
        expiryDate: new Date('2029-03-10'),
        status: 'pending',
        projectType: 'Energy Efficiency - HVAC Optimization',
        verificationStandard: 'Gold Standard'
      }
    ]
    setCredits(mockCredits)
  }, [])

  const calculateProjection = () => {
    const monthlyReduction = metrics.saved / 3 // quarterly to monthly
    const projectedAnnual = monthlyReduction * 12
    const projectedCredits = Math.floor(projectedAnnual / 10) // 1 credit per 10 tons
    const projectedValue = projectedCredits * 30 // average price
    
    return { projectedAnnual, projectedCredits, projectedValue }
  }

  const verifyOnBlockchain = async (creditId: string) => {
    setIsVerifying(true)
    // Simulate blockchain verification
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsVerifying(false)
    alert(`Credit ${creditId} verified on blockchain!`)
  }

  const projection = calculateProjection()

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-900/30 rounded-lg">
            <Leaf className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Carbon Credits</h2>
            <p className="text-sm text-gray-400">Blockchain-verified emission reductions</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          >
            <option value="month">Monthly</option>
            <option value="quarter">Quarterly</option>
            <option value="year">Yearly</option>
          </select>
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-green-400">-25.7%</span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.current}</p>
          <p className="text-xs text-gray-400">Current Emissions (tCO₂)</p>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-green-400">+{metrics.saved}</span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.saved}</p>
          <p className="text-xs text-gray-400">CO₂ Reduced (tons)</p>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-5 h-5 text-gray-400" />
            <Lock className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{metrics.creditsEarned}</p>
          <p className="text-xs text-gray-400">Credits Earned</p>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Coins className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-green-400">+12%</span>
          </div>
          <p className="text-2xl font-bold text-white">${metrics.creditsValue}</p>
          <p className="text-xs text-gray-400">Credit Value</p>
        </div>
      </div>

      {/* Credits Table */}
      <div className="bg-gray-900 rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-800">
          <h3 className="font-semibold text-white">Carbon Credit Registry</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-800">
                <th className="text-left p-4">Credit ID</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Value</th>
                <th className="text-left p-4">Project Type</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Blockchain</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {credits.map(credit => (
                <tr key={credit.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-500" />
                      <span className="font-mono text-sm text-white">{credit.id}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-white">{credit.amount} tCO₂</span>
                  </td>
                  <td className="p-4">
                    <span className="text-green-400">${credit.amount * credit.pricePerTon}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-300">{credit.projectType}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      credit.status === 'active' 
                        ? 'bg-green-900/30 text-green-400'
                        : credit.status === 'pending'
                        ? 'bg-yellow-900/30 text-yellow-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {credit.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {credit.blockchainTx ? (
                      <button
                        onClick={() => verifyOnBlockchain(credit.id)}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                      >
                        <Shield className="w-4 h-4" />
                        <span className="font-mono text-xs">{credit.blockchainTx}</span>
                      </button>
                    ) : (
                      <span className="text-gray-500 text-sm">Pending</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                        <Download className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Projections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-4">Annual Projections</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Projected CO₂ Reduction</span>
              <span className="text-xl font-bold text-green-400">
                {projection.projectedAnnual.toFixed(0)} tons
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Estimated Credits</span>
              <span className="text-xl font-bold text-blue-400">
                {projection.projectedCredits} credits
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Potential Value</span>
              <span className="text-xl font-bold text-purple-400">
                ${projection.projectedValue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-4">Verification Standards</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <p className="text-sm text-white">Gold Standard</p>
                <p className="text-xs text-gray-400">Premium quality credits</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <p className="text-sm text-white">Verra VCS</p>
                <p className="text-xs text-gray-400">Verified Carbon Standard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-400" />
              <div className="flex-1">
                <p className="text-sm text-white">Blockchain Verified</p>
                <p className="text-xs text-gray-400">Immutable record on Ethereum</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6 p-4 bg-gray-900 rounded-lg">
        <div>
          <p className="text-sm text-gray-400">Ready to trade credits?</p>
          <p className="text-xs text-gray-500 mt-1">Connect to carbon marketplaces</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
            View Marketplace
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            Register Credits
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}