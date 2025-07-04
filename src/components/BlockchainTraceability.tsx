"use client"

import { useState } from 'react'
import { 
  Link,
  Shield,
  CheckCircle,
  AlertCircle,
  Package,
  Truck,
  Store,
  FileCheck,
  Hash,
  Clock,
  User,
  MapPin,
  Barcode,
  Activity,
  Download,
  Upload,
  Search,
  Filter,
  ChevronRight,
  ExternalLink,
  Fingerprint,
  ShieldCheck,
  Info,
  Leaf,
  Droplets
} from 'lucide-react'

interface BatchRecord {
  id: string
  strain: string
  batchNumber: string
  plantCount: number
  startDate: string
  harvestDate?: string
  status: 'growing' | 'harvested' | 'processing' | 'packaged' | 'distributed'
  blockchainId: string
  lastTransaction: string
  complianceScore: number
}

interface TraceabilityEvent {
  id: string
  timestamp: string
  type: 'planting' | 'transplant' | 'treatment' | 'test' | 'harvest' | 'processing' | 'packaging' | 'transfer'
  description: string
  operator: string
  location: string
  data: any
  txHash: string
  verified: boolean
}

interface ComplianceDocument {
  id: string
  type: 'test_result' | 'license' | 'certificate' | 'audit' | 'inspection'
  name: string
  issueDate: string
  expiryDate?: string
  issuer: string
  status: 'valid' | 'pending' | 'expired'
  ipfsHash: string
}

interface ChainOfCustody {
  id: string
  from: string
  to: string
  timestamp: string
  quantity: number
  unit: string
  productForm: string
  signature: string
  verified: boolean
}

export function BlockchainTraceability() {
  const [activeView, setActiveView] = useState<'batches' | 'events' | 'compliance' | 'verify'>('batches')
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyActive, setShowOnlyActive] = useState(true)

  // Active batches
  const batches: BatchRecord[] = [
    {
      id: 'batch-001',
      strain: 'Blue Dream',
      batchNumber: 'BD-2024-001',
      plantCount: 120,
      startDate: '2024-01-01',
      status: 'growing',
      blockchainId: '0x742d35Cc6634C0532925a3b844Bc9e7595f89590',
      lastTransaction: '2 hours ago',
      complianceScore: 98
    },
    {
      id: 'batch-002',
      strain: 'OG Kush',
      batchNumber: 'OGK-2024-003',
      plantCount: 80,
      startDate: '2023-12-15',
      harvestDate: '2024-02-10',
      status: 'processing',
      blockchainId: '0x123f681646d4a755815f9cb19e7acc8de34567890',
      lastTransaction: '1 day ago',
      complianceScore: 100
    },
    {
      id: 'batch-003',
      strain: 'Gorilla Glue #4',
      batchNumber: 'GG4-2024-002',
      plantCount: 100,
      startDate: '2023-11-20',
      harvestDate: '2024-01-15',
      status: 'packaged',
      blockchainId: '0x456b7ef234a8b5c6d7e8f90123456789abcdef01',
      lastTransaction: '5 hours ago',
      complianceScore: 95
    }
  ]

  // Recent events for selected batch
  const recentEvents: TraceabilityEvent[] = [
    {
      id: 'event-001',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      type: 'treatment',
      description: 'Applied organic pest control (neem oil)',
      operator: 'John Doe',
      location: 'Flower Room A',
      data: { product: 'Neem Oil', dosage: '2ml/L', volume: '50L' },
      txHash: '0xabc123...def456',
      verified: true
    },
    {
      id: 'event-002',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      type: 'test',
      description: 'Microbial testing - Lab results uploaded',
      operator: 'Quality Team',
      location: 'Lab Partner XYZ',
      data: { testType: 'Microbial', result: 'Pass', certificate: 'CERT-2024-0145' },
      txHash: '0xdef789...ghi012',
      verified: true
    },
    {
      id: 'event-003',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'transplant',
      description: 'Moved from vegetative to flowering',
      operator: 'Jane Smith',
      location: 'Veg Room 1 → Flower Room A',
      data: { plantCount: 120, avgHeight: '45cm' },
      txHash: '0xghi345...jkl678',
      verified: true
    }
  ]

  // Compliance documents
  const complianceDocuments: ComplianceDocument[] = [
    {
      id: 'doc-001',
      type: 'license',
      name: 'State Cultivation License',
      issueDate: '2023-01-15',
      expiryDate: '2024-01-15',
      issuer: 'State Cannabis Control Board',
      status: 'valid',
      ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco'
    },
    {
      id: 'doc-002',
      type: 'test_result',
      name: 'Heavy Metals Test - Batch OGK-2024-003',
      issueDate: '2024-02-12',
      issuer: 'Certified Lab Services',
      status: 'valid',
      ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
    },
    {
      id: 'doc-003',
      type: 'certificate',
      name: 'Organic Certification',
      issueDate: '2023-06-01',
      expiryDate: '2024-06-01',
      issuer: 'Organic Standards Authority',
      status: 'valid',
      ipfsHash: 'QmZoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco'
    }
  ]

  // Chain of custody for packaged batch
  const chainOfCustody: ChainOfCustody[] = [
    {
      id: 'custody-001',
      from: 'Cultivation Facility',
      to: 'Processing Lab',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      quantity: 5.2,
      unit: 'kg',
      productForm: 'Dried Flower',
      signature: '0x1234...5678',
      verified: true
    },
    {
      id: 'custody-002',
      from: 'Processing Lab',
      to: 'Distribution Center',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      quantity: 4.8,
      unit: 'kg',
      productForm: 'Packaged Units (1g, 3.5g, 7g)',
      signature: '0x5678...9abc',
      verified: true
    },
    {
      id: 'custody-003',
      from: 'Distribution Center',
      to: 'Retail Store ABC',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      quantity: 2.0,
      unit: 'kg',
      productForm: 'Retail Packages',
      signature: '0x9abc...def0',
      verified: true
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'growing':
        return 'text-green-400 bg-green-500/20'
      case 'harvested':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'processing':
        return 'text-blue-400 bg-blue-500/20'
      case 'packaged':
        return 'text-purple-400 bg-purple-500/20'
      case 'distributed':
        return 'text-gray-400 bg-gray-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'planting':
        return Leaf
      case 'transplant':
        return Package
      case 'treatment':
        return Droplets
      case 'test':
        return FileCheck
      case 'harvest':
        return Truck
      case 'processing':
        return Activity
      case 'packaging':
        return Package
      case 'transfer':
        return Truck
      default:
        return Activity
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Blockchain Traceability & Compliance</h2>
            <p className="text-sm text-gray-400 mt-1">
              Immutable record keeping for seed-to-sale tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import Records
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Link className="w-4 h-4" />
              Connect Wallet
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2">
          {(['batches', 'events', 'compliance', 'verify'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                activeView === view
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {view} {view === 'verify' ? 'Product' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Blockchain Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Link className="w-5 h-5 text-green-400" />
            <h4 className="font-medium text-white">Network Status</h4>
          </div>
          <p className="text-2xl font-bold text-white">Connected</p>
          <p className="text-sm text-gray-400">Ethereum Mainnet</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-5 h-5 text-blue-400" />
            <h4 className="font-medium text-white">Total Records</h4>
          </div>
          <p className="text-2xl font-bold text-white">1,847</p>
          <p className="text-sm text-gray-400">On-chain entries</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <h4 className="font-medium text-white">Compliance Rate</h4>
          </div>
          <p className="text-2xl font-bold text-white">98.5%</p>
          <p className="text-sm text-gray-400">All batches</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <h4 className="font-medium text-white">Last Update</h4>
          </div>
          <p className="text-2xl font-bold text-white">2h ago</p>
          <p className="text-sm text-gray-400">Block #18,745,231</p>
        </div>
      </div>

      {/* Batches View */}
      {activeView === 'batches' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Active Batches</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search batches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer"
                onClick={() => setSelectedBatch(batch.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <Package className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{batch.strain}</h4>
                      <p className="text-sm text-gray-400">Batch: {batch.batchNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(batch.status)}`}>
                      {batch.status}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Plants</p>
                    <p className="text-white font-medium">{batch.plantCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Start Date</p>
                    <p className="text-white font-medium">{new Date(batch.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Compliance</p>
                    <p className="text-white font-medium">{batch.complianceScore}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Last Update</p>
                    <p className="text-white font-medium">{batch.lastTransaction}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Fingerprint className="w-3 h-3" />
                    <span className="font-mono">{batch.blockchainId}</span>
                    <button className="ml-auto hover:text-purple-400 transition-colors">
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events View */}
      {activeView === 'events' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Traceability Events</h3>
          <div className="space-y-4">
            {recentEvents.map((event, idx) => {
              const EventIcon = getEventIcon(event.type)
              return (
                <div key={event.id} className="relative">
                  {idx < recentEvents.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-700" />
                  )}
                  <div className="flex gap-4">
                    <div className={`p-3 rounded-lg flex-shrink-0 ${
                      event.verified ? 'bg-green-500/20' : 'bg-yellow-500/20'
                    }`}>
                      <EventIcon className={`w-6 h-6 ${
                        event.verified ? 'text-green-400' : 'text-yellow-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-white">{event.description}</h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {event.operator}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(event.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          {event.verified && (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          )}
                        </div>
                        
                        {event.data && (
                          <div className="mt-3 p-3 bg-gray-900 rounded-lg text-sm">
                            <pre className="text-gray-300">
                              {JSON.stringify(event.data, null, 2)}
                            </pre>
                          </div>
                        )}

                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                          <Hash className="w-3 h-3" />
                          <span className="font-mono">{event.txHash}</span>
                          <button className="ml-auto hover:text-purple-400 transition-colors">
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Compliance View */}
      {activeView === 'compliance' && (
        <>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Compliance Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complianceDocuments.map((doc) => (
                <div key={doc.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        doc.status === 'valid' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                      }`}>
                        <FileCheck className={`w-5 h-5 ${
                          doc.status === 'valid' ? 'text-green-400' : 'text-yellow-400'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{doc.name}</h4>
                        <p className="text-sm text-gray-400">{doc.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      doc.status === 'valid' ? 'bg-green-500/20 text-green-400' :
                      doc.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {doc.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Issued By</span>
                      <span className="text-white">{doc.issuer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Issue Date</span>
                      <span className="text-white">{new Date(doc.issueDate).toLocaleDateString()}</span>
                    </div>
                    {doc.expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Expires</span>
                        <span className="text-white">{new Date(doc.expiryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-mono">IPFS: {doc.ipfsHash.slice(0, 12)}...</span>
                    <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chain of Custody */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Chain of Custody</h3>
            <div className="space-y-4">
              {chainOfCustody.map((transfer, idx) => (
                <div key={transfer.id} className="relative">
                  {idx < chainOfCustody.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-700" />
                  )}
                  <div className="flex gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg flex-shrink-0">
                      <Truck className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1 p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{transfer.from}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-white">{transfer.to}</span>
                        </div>
                        {transfer.verified && <CheckCircle className="w-5 h-5 text-green-400" />}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Quantity</p>
                          <p className="text-white">{transfer.quantity} {transfer.unit}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Form</p>
                          <p className="text-white">{transfer.productForm}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Date</p>
                          <p className="text-white">{new Date(transfer.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Signature: <span className="font-mono">{transfer.signature}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Verify Product View */}
      {activeView === 'verify' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Product Verification</h3>
          
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-purple-500/20 rounded-full mb-4">
                <Barcode className="w-12 h-12 text-purple-400" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Scan or Enter Product Code</h4>
              <p className="text-gray-400">Verify authenticity and view complete product history</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter product barcode or QR code..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
              
              <button className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                Verify Product
              </button>
            </div>

            <div className="mt-8 p-4 bg-blue-900/20 rounded-lg border border-blue-800">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-white mb-1">Consumer Trust</h4>
                  <p className="text-sm text-gray-300">
                    Each product can be verified through the blockchain, providing complete transparency 
                    from seed to sale. Consumers can view test results, growing conditions, and handling history.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}