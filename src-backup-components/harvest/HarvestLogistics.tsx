'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  Scale, 
  Clock, 
  Users, 
  MapPin, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Calendar,
  Truck,
  Thermometer,
  BarChart3,
  Download,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Camera,
  QrCode,
  Star,
  Target
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { DatePicker } from '@/components/ui/date-picker'

interface HarvestBatch {
  id: string
  batchNumber: string
  crop: string
  variety: string
  zone: string
  block: string
  plantedDate: Date
  harvestDate: Date
  status: 'planned' | 'in-progress' | 'completed' | 'quality-check' | 'shipped'
  estimatedYield: number
  actualYield: number
  qualityGrade: 'A' | 'B' | 'C' | 'reject'
  crew: HarvestCrew[]
  equipment: string[]
  notes: string
  photos: string[]
  weight: {
    gross: number
    net: number
    tare: number
  }
  packaging: {
    type: string
    count: number
    size: string
  }
  tracking: {
    startTime: Date
    endTime?: Date
    breaks: number
    productivity: number // kg/hour
  }
}

interface HarvestCrew {
  id: string
  name: string
  role: 'picker' | 'packer' | 'supervisor' | 'quality-checker'
  hourlyRate: number
  hoursWorked: number
  productivity: number
  qualityScore: number
}

interface YieldPrediction {
  zone: string
  crop: string
  variety: string
  currentWeight: number
  predictedYield: number
  daysToHarvest: number
  confidence: number
  factors: {
    environmentalScore: number
    plantHealth: number
    historicalPerformance: number
  }
}

export default function HarvestLogistics() {
  const [batches, setBatches] = useState<HarvestBatch[]>([])
  const [predictions, setPredictions] = useState<YieldPrediction[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedBatch, setSelectedBatch] = useState<HarvestBatch | null>(null)
  const [showNewBatch, setShowNewBatch] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - replace with API calls
  useEffect(() => {
    // Load harvest batches
    const mockBatches: HarvestBatch[] = [
      {
        id: '1',
        batchNumber: 'HRV-2024-001',
        crop: 'Cannabis',
        variety: 'Purple Haze',
        zone: 'A',
        block: '1',
        plantedDate: new Date('2024-01-15'),
        harvestDate: new Date('2024-04-15'),
        status: 'in-progress',
        estimatedYield: 125.5,
        actualYield: 0,
        qualityGrade: 'A',
        crew: [
          { id: '1', name: 'John Doe', role: 'picker', hourlyRate: 18, hoursWorked: 6, productivity: 12.5, qualityScore: 95 },
          { id: '2', name: 'Jane Smith', role: 'supervisor', hourlyRate: 25, hoursWorked: 8, productivity: 0, qualityScore: 98 }
        ],
        equipment: ['Scale-001', 'Cart-A12', 'Trimmer-05'],
        notes: 'High quality batch, watch for mold in humid conditions',
        photos: [],
        weight: { gross: 0, net: 0, tare: 2.5 },
        packaging: { type: 'Grove Bags', count: 0, size: '1lb' },
        tracking: {
          startTime: new Date(),
          productivity: 0
        }
      },
      {
        id: '2',
        batchNumber: 'HRV-2024-002',
        crop: 'Lettuce',
        variety: 'Butter Crunch',
        zone: 'B',
        block: '3',
        plantedDate: new Date('2024-03-01'),
        harvestDate: new Date('2024-04-10'),
        status: 'completed',
        estimatedYield: 89.2,
        actualYield: 92.1,
        qualityGrade: 'A',
        crew: [
          { id: '3', name: 'Mike Johnson', role: 'picker', hourlyRate: 16, hoursWorked: 4, productivity: 23.0, qualityScore: 92 }
        ],
        equipment: ['Scale-002', 'Cooler-B1'],
        notes: 'Exceeded yield expectations, excellent quality',
        photos: ['/harvest/batch-002-1.jpg'],
        weight: { gross: 94.6, net: 92.1, tare: 2.5 },
        packaging: { type: 'Clamshells', count: 184, size: '5oz' },
        tracking: {
          startTime: new Date('2024-04-10T06:00:00'),
          endTime: new Date('2024-04-10T10:00:00'),
          breaks: 1,
          productivity: 23.0
        }
      }
    ]
    setBatches(mockBatches)

    // Load yield predictions
    const mockPredictions: YieldPrediction[] = [
      {
        zone: 'A',
        crop: 'Cannabis',
        variety: 'OG Kush',
        currentWeight: 45.2,
        predictedYield: 118.5,
        daysToHarvest: 12,
        confidence: 87,
        factors: {
          environmentalScore: 92,
          plantHealth: 89,
          historicalPerformance: 85
        }
      },
      {
        zone: 'C',
        crop: 'Basil',
        variety: 'Genovese',
        currentWeight: 12.8,
        predictedYield: 28.3,
        daysToHarvest: 5,
        confidence: 94,
        factors: {
          environmentalScore: 96,
          plantHealth: 94,
          historicalPerformance: 91
        }
      }
    ]
    setPredictions(mockPredictions)
  }, [])

  const filteredBatches = batches.filter(batch => {
    const matchesStatus = filterStatus === 'all' || batch.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.variety.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'quality-check': return 'bg-purple-100 text-purple-800'
      case 'shipped': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return <Calendar className="w-4 h-4" />
      case 'in-progress': return <Clock className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'quality-check': return <Star className="w-4 h-4" />
      case 'shipped': return <Truck className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800'
      case 'B': return 'bg-yellow-100 text-yellow-800'
      case 'C': return 'bg-orange-100 text-orange-800'
      case 'reject': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateTotalYield = () => {
    return batches.reduce((sum, batch) => sum + (batch.actualYield || batch.estimatedYield), 0)
  }

  const calculateAverageProductivity = () => {
    const totalProductivity = batches.reduce((sum, batch) => {
      return sum + batch.crew.reduce((crewSum, member) => crewSum + member.productivity, 0)
    }, 0)
    const totalCrew = batches.reduce((sum, batch) => sum + batch.crew.length, 0)
    return totalCrew > 0 ? totalProductivity / totalCrew : 0
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Harvest Logistics</h1>
            <p className="text-gray-600 mt-1">Manage harvest planning, crew coordination, and yield tracking</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowNewBatch(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Batch
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="batches">Harvest Batches</TabsTrigger>
          <TabsTrigger value="predictions">Yield Predictions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Yield (kg)</p>
                    <p className="text-2xl font-bold text-gray-900">{calculateTotalYield().toFixed(1)}</p>
                  </div>
                  <Scale className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Batches</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {batches.filter(b => b.status === 'in-progress').length}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Productivity</p>
                    <p className="text-2xl font-bold text-gray-900">{calculateAverageProductivity().toFixed(1)}</p>
                    <p className="text-xs text-gray-500">kg/hour</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Quality Score</p>
                    <p className="text-2xl font-bold text-gray-900">94.2%</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Harvests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {batches.slice(0, 5).map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(batch.status)}
                        <div>
                          <p className="font-medium">{batch.batchNumber}</p>
                          <p className="text-sm text-gray-600">{batch.crop} - {batch.variety}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(batch.status)}>
                          {batch.status}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {(batch.actualYield || batch.estimatedYield).toFixed(1)} kg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Harvests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictions.map((prediction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Target className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium">{prediction.crop} - {prediction.variety}</p>
                          <p className="text-sm text-gray-600">Zone {prediction.zone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{prediction.daysToHarvest} days</p>
                        <p className="text-sm text-gray-600">{prediction.predictedYield.toFixed(1)} kg</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Harvest Batches Tab */}
        <TabsContent value="batches" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input 
                    placeholder="Search batches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="quality-check">Quality Check</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Batch List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBatches.map((batch) => (
              <Card key={batch.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedBatch(batch)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{batch.batchNumber}</CardTitle>
                    <Badge className={getStatusColor(batch.status)}>
                      {batch.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{batch.crop} - {batch.variety}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Location:</span>
                      <span className="text-sm font-medium">Zone {batch.zone}, Block {batch.block}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Harvest Date:</span>
                      <span className="text-sm font-medium">{batch.harvestDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Yield:</span>
                      <span className="text-sm font-medium">
                        {batch.actualYield > 0 ? batch.actualYield.toFixed(1) : batch.estimatedYield.toFixed(1)} kg
                        {batch.actualYield === 0 && <span className="text-gray-500"> (est.)</span>}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quality:</span>
                      <Badge className={getGradeColor(batch.qualityGrade)}>
                        Grade {batch.qualityGrade}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Crew:</span>
                      <span className="text-sm font-medium">{batch.crew.length} members</span>
                    </div>
                    
                    {batch.status === 'in-progress' && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Progress</span>
                          <span className="text-xs text-gray-600">65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Yield Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {predictions.map((prediction, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{prediction.crop} - {prediction.variety}</span>
                    <Badge variant="outline">Zone {prediction.zone}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Current Weight</p>
                        <p className="text-lg font-semibold">{prediction.currentWeight} kg</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Predicted Yield</p>
                        <p className="text-lg font-semibold text-green-600">{prediction.predictedYield} kg</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Days to Harvest</p>
                        <p className="text-lg font-semibold">{prediction.daysToHarvest}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Confidence</p>
                        <p className="text-lg font-semibold">{prediction.confidence}%</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Prediction Factors</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Environmental Score</span>
                          <span className="text-xs font-medium">{prediction.factors.environmentalScore}%</span>
                        </div>
                        <Progress value={prediction.factors.environmentalScore} className="h-1" />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Plant Health</span>
                          <span className="text-xs font-medium">{prediction.factors.plantHealth}%</span>
                        </div>
                        <Progress value={prediction.factors.plantHealth} className="h-1" />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Historical Performance</span>
                          <span className="text-xs font-medium">{prediction.factors.historicalPerformance}%</span>
                        </div>
                        <Progress value={prediction.factors.historicalPerformance} className="h-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Yield vs Prediction Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mb-2" />
                  <p>Chart visualization placeholder</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Crew Productivity Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <TrendingUp className="w-12 h-12 mb-2" />
                  <p>Chart visualization placeholder</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}