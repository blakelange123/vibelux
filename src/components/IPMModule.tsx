"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bug,
  Shield,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Camera,
  TrendingUp,
  Eye,
  Beaker,
  Thermometer,
  Wind,
  Droplets,
  MapPin,
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Settings,
  Target,
  Activity,
  BarChart3,
  ImageIcon
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PestIdentificationModal } from './PestIdentificationModal'
import { getPestImages } from '@/lib/pest-images'
import { PestImageWithFallback } from './PestImageWithFallback'

interface Pest {
  id: string
  commonName: string
  scientificName: string
  category: 'insect' | 'fungal' | 'bacterial' | 'viral' | 'nematode' | 'mite'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  affectedCrops: string[]
  symptoms: string[]
  lifecycle: string
  optimalConditions: {
    temperature: { min: number; max: number }
    humidity: { min: number; max: number }
    light: string
  }
  biologicalControls: string[]
  chemicalControls: string[]
  culturalControls: string[]
  image?: string
}

interface PestDetection {
  id: string
  date: string
  location: string
  pestId: string
  severity: 'trace' | 'light' | 'moderate' | 'heavy'
  plantStage: string
  detectionMethod: 'visual' | 'trap' | 'sensor' | 'lab'
  photos: string[]
  notes: string
  treated: boolean
  treatmentDate?: string
  treatmentMethod?: string
  followUpRequired: boolean
  followUpDate?: string
  reportedBy: string
}

interface IPMSchedule {
  id: string
  activity: string
  type: 'monitoring' | 'treatment' | 'prevention' | 'maintenance'
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  location: string
  assignedTo: string
  lastCompleted?: string
  nextDue: string
  priority: 'low' | 'medium' | 'high'
  description: string
}

interface EnvironmentalData {
  location: string
  temperature: number
  humidity: number
  co2: number
  light: number
  airflow: number
  timestamp: string
}

interface TreatmentRecord {
  id: string
  date: string
  pestId: string
  location: string
  treatmentType: 'biological' | 'chemical' | 'cultural' | 'mechanical'
  product: string
  concentration: string
  applicationMethod: string
  coverage: string
  applicator: string
  preharvest_interval: number
  effectiveness: number // 0-100%
  sideEffects: string[]
  cost: number
  notes: string
}

export function IPMModule() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pests' | 'monitoring' | 'treatments' | 'schedule' | 'analytics'>('dashboard')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('30days')
  const [showPestModal, setShowPestModal] = useState(false)
  const [selectedPestForDetection, setSelectedPestForDetection] = useState<string | null>(null)

  // Sample data
  const commonPests: Pest[] = [
    {
      id: 'aphids',
      commonName: 'Aphids',
      scientificName: 'Aphidoidea',
      category: 'insect',
      riskLevel: 'high',
      affectedCrops: ['Lettuce', 'Spinach', 'Kale', 'Herbs'],
      symptoms: ['Yellowing leaves', 'Sticky honeydew', 'Curled leaves', 'Stunted growth'],
      lifecycle: '10-14 days at 20°C',
      optimalConditions: {
        temperature: { min: 18, max: 24 },
        humidity: { min: 60, max: 80 },
        light: 'Moderate'
      },
      biologicalControls: ['Ladybugs', 'Lacewings', 'Parasitic wasps'],
      chemicalControls: ['Insecticidal soap', 'Neem oil', 'Pyrethrins'],
      culturalControls: ['Remove infected plants', 'Increase air circulation', 'Yellow sticky traps']
    },
    {
      id: 'thrips',
      commonName: 'Thrips',
      scientificName: 'Thysanoptera',
      category: 'insect',
      riskLevel: 'high',
      affectedCrops: ['Tomatoes', 'Peppers', 'Cucumbers', 'Herbs'],
      symptoms: ['Silver stippling on leaves', 'Black specks', 'Leaf curling', 'Flower damage'],
      lifecycle: '15-20 days',
      optimalConditions: {
        temperature: { min: 20, max: 28 },
        humidity: { min: 45, max: 65 },
        light: 'High'
      },
      biologicalControls: ['Predatory mites', 'Minute pirate bugs', 'Nematodes'],
      chemicalControls: ['Spinosad', 'Abamectin', 'Imidacloprid'],
      culturalControls: ['Blue sticky traps', 'Remove weeds', 'Quarantine new plants']
    },
    {
      id: 'powdery_mildew',
      commonName: 'Powdery Mildew',
      scientificName: 'Erysiphales',
      category: 'fungal',
      riskLevel: 'medium',
      affectedCrops: ['Cucumbers', 'Tomatoes', 'Peppers', 'Lettuce'],
      symptoms: ['White powdery coating', 'Yellowing leaves', 'Leaf drop', 'Reduced yield'],
      lifecycle: '7-10 days in optimal conditions',
      optimalConditions: {
        temperature: { min: 20, max: 26 },
        humidity: { min: 70, max: 90 },
        light: 'Low to moderate'
      },
      biologicalControls: ['Bacillus subtilis', 'Trichoderma', 'Milk spray'],
      chemicalControls: ['Potassium bicarbonate', 'Sulfur', 'Myclobutanil'],
      culturalControls: ['Improve air circulation', 'Reduce humidity', 'Remove affected leaves']
    },
    {
      id: 'spider_mites',
      commonName: 'Spider Mites',
      scientificName: 'Tetranychidae',
      category: 'mite',
      riskLevel: 'high',
      affectedCrops: ['All crops'],
      symptoms: ['Fine webbing', 'Stippled leaves', 'Yellowing', 'Leaf drop'],
      lifecycle: '5-20 days depending on temperature',
      optimalConditions: {
        temperature: { min: 25, max: 30 },
        humidity: { min: 30, max: 50 },
        light: 'High'
      },
      biologicalControls: ['Predatory mites', 'Ladybugs', 'Lacewings'],
      chemicalControls: ['Miticides', 'Insecticidal soap', 'Horticultural oil'],
      culturalControls: ['Increase humidity', 'Water stress management', 'Remove debris']
    }
  ]

  const recentDetections: PestDetection[] = [
    {
      id: '1',
      date: '2024-01-15',
      location: 'Grow Room A - Tier 2',
      pestId: 'aphids',
      severity: 'light',
      plantStage: 'Vegetative',
      detectionMethod: 'visual',
      photos: [],
      notes: 'Found small colony on lettuce plants, isolated area',
      treated: true,
      treatmentDate: '2024-01-15',
      treatmentMethod: 'Ladybug release',
      followUpRequired: true,
      followUpDate: '2024-01-22',
      reportedBy: 'John Smith'
    },
    {
      id: '2',
      date: '2024-01-12',
      location: 'Grow Room B - Tier 1',
      pestId: 'thrips',
      severity: 'moderate',
      plantStage: 'Flowering',
      detectionMethod: 'trap',
      photos: [],
      notes: 'Blue sticky traps showing increased thrips activity',
      treated: false,
      followUpRequired: true,
      followUpDate: '2024-01-16',
      reportedBy: 'Sarah Johnson'
    },
    {
      id: '3',
      date: '2024-01-10',
      location: 'Grow Room C - Tier 3',
      pestId: 'powdery_mildew',
      severity: 'trace',
      plantStage: 'Mature',
      detectionMethod: 'visual',
      photos: [],
      notes: 'Early signs on cucumber leaves, humidity spike detected',
      treated: true,
      treatmentDate: '2024-01-11',
      treatmentMethod: 'Bacillus subtilis spray',
      followUpRequired: true,
      followUpDate: '2024-01-18',
      reportedBy: 'Mike Davis'
    }
  ]

  const ipmSchedule: IPMSchedule[] = [
    {
      id: '1',
      activity: 'Visual Pest Inspection',
      type: 'monitoring',
      frequency: 'daily',
      location: 'All Grow Rooms',
      assignedTo: 'Growing Team',
      lastCompleted: '2024-01-15',
      nextDue: '2024-01-16',
      priority: 'high',
      description: 'Daily visual inspection of plants for pest symptoms and damage'
    },
    {
      id: '2',
      activity: 'Sticky Trap Monitoring',
      type: 'monitoring',
      frequency: 'weekly',
      location: 'All Grow Rooms',
      assignedTo: 'IPM Specialist',
      lastCompleted: '2024-01-12',
      nextDue: '2024-01-19',
      priority: 'medium',
      description: 'Count and identify pests on yellow and blue sticky traps'
    },
    {
      id: '3',
      activity: 'Beneficial Insect Release',
      type: 'treatment',
      frequency: 'biweekly',
      location: 'Grow Room A',
      assignedTo: 'IPM Specialist',
      lastCompleted: '2024-01-08',
      nextDue: '2024-01-22',
      priority: 'medium',
      description: 'Release ladybugs and predatory mites for biological control'
    },
    {
      id: '4',
      activity: 'Environmental Calibration',
      type: 'maintenance',
      frequency: 'weekly',
      location: 'All Locations',
      assignedTo: 'Maintenance Team',
      lastCompleted: '2024-01-14',
      nextDue: '2024-01-21',
      priority: 'low',
      description: 'Calibrate temperature and humidity sensors'
    }
  ]

  const environmentalData: EnvironmentalData[] = [
    { location: 'Grow Room A', temperature: 22.5, humidity: 65, co2: 1200, light: 450, airflow: 0.8, timestamp: '2024-01-15T10:00:00Z' },
    { location: 'Grow Room B', temperature: 24.1, humidity: 72, co2: 1150, light: 520, airflow: 0.9, timestamp: '2024-01-15T10:00:00Z' },
    { location: 'Grow Room C', temperature: 23.8, humidity: 68, co2: 1180, light: 480, airflow: 0.85, timestamp: '2024-01-15T10:00:00Z' }
  ]

  const treatmentRecords: TreatmentRecord[] = [
    {
      id: '1',
      date: '2024-01-15',
      pestId: 'aphids',
      location: 'Grow Room A - Tier 2',
      treatmentType: 'biological',
      product: 'Ladybugs (Hippodamia convergens)',
      concentration: '1000 beetles per 100 sq ft',
      applicationMethod: 'Manual release',
      coverage: '100%',
      applicator: 'John Smith',
      preharvest_interval: 0,
      effectiveness: 85,
      sideEffects: [],
      cost: 150,
      notes: 'Released during evening hours, good establishment'
    },
    {
      id: '2',
      date: '2024-01-11',
      pestId: 'powdery_mildew',
      location: 'Grow Room C - Tier 3',
      treatmentType: 'biological',
      product: 'Bacillus subtilis QST 713',
      concentration: '2 g/L',
      applicationMethod: 'Foliar spray',
      coverage: '95%',
      applicator: 'Sarah Johnson',
      preharvest_interval: 0,
      effectiveness: 92,
      sideEffects: [],
      cost: 45,
      notes: 'Applied early morning, good coverage achieved'
    }
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'trace': return 'bg-blue-900/30 text-blue-300 border border-blue-700'
      case 'light': return 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
      case 'moderate': return 'bg-orange-900/30 text-orange-300 border border-orange-700'
      case 'heavy': return 'bg-red-900/30 text-red-300 border border-red-700'
      default: return 'bg-gray-900/30 text-gray-300 border border-gray-700'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-900/30 text-green-300 border border-green-700'
      case 'medium': return 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
      case 'high': return 'bg-orange-900/30 text-orange-300 border border-orange-700'
      case 'critical': return 'bg-red-900/30 text-red-300 border border-red-700'
      default: return 'bg-gray-900/30 text-gray-300 border border-gray-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-900/30 text-gray-300 border border-gray-700'
      case 'medium': return 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
      case 'high': return 'bg-red-900/30 text-red-300 border border-red-700'
      default: return 'bg-gray-900/30 text-gray-300 border border-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Pest Identification Modal */}
      <PestIdentificationModal
        isOpen={showPestModal}
        onClose={() => setShowPestModal(false)}
        onSelectPest={(pestId) => {
          setSelectedPestForDetection(pestId)
          setShowPestModal(false)
        }}
      />

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-900/30 rounded-xl mr-4">
                <Bug className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Integrated Pest Management
                </h1>
                <p className="text-sm text-gray-400">
                  Comprehensive pest monitoring and control for vertical farming
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Locations</option>
                <option value="grow-room-a">Grow Room A</option>
                <option value="grow-room-b">Grow Room B</option>
                <option value="grow-room-c">Grow Room C</option>
              </select>
              <Button variant="outline" className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Report Detection
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-800">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
              { id: 'pests', name: 'Pest Library', icon: Bug },
              { id: 'monitoring', name: 'Monitoring', icon: Eye },
              { id: 'treatments', name: 'Treatments', icon: Beaker },
              { id: 'schedule', name: 'Schedule', icon: Calendar },
              { id: 'analytics', name: 'Analytics', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-400 text-green-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Active Detections</p>
                        <p className="text-3xl font-bold text-orange-400">3</p>
                      </div>
                      <div className="p-3 bg-orange-900/30 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-orange-400" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Requiring action</span>
                        <span className="text-gray-300">2/3</span>
                      </div>
                      <Progress value={67} className="h-2 bg-gray-800" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Treatment Success</p>
                        <p className="text-3xl font-bold text-green-400">92%</p>
                      </div>
                      <div className="p-3 bg-green-900/30 rounded-lg">
                        <Target className="w-6 h-6 text-green-400" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Last 30 days</span>
                        <span className="text-gray-300">11/12</span>
                      </div>
                      <Progress value={92} className="h-2 bg-gray-800" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Prevention Score</p>
                        <p className="text-3xl font-bold text-blue-400">87</p>
                      </div>
                      <div className="p-3 bg-blue-900/30 rounded-lg">
                        <Shield className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Environmental factors</span>
                        <span className="text-green-400">Good</span>
                      </div>
                      <Progress value={87} className="h-2 bg-gray-800" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Monitoring Tasks</p>
                        <p className="text-3xl font-bold text-purple-400">8</p>
                      </div>
                      <div className="p-3 bg-purple-900/30 rounded-lg">
                        <Calendar className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Due today</span>
                        <span className="text-gray-300">3/8</span>
                      </div>
                      <Progress value={38} className="h-2 bg-gray-800" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity and Environmental Monitoring */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Bug className="w-5 h-5 mr-2 text-green-400" />
                      Recent Detections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentDetections.slice(0, 3).map((detection) => {
                        const pest = commonPests.find(p => p.id === detection.pestId)
                        const pestImages = getPestImages(detection.pestId)
                        return (
                          <div key={detection.id} className="flex items-start justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors">
                            <div className="flex gap-3">
                              <div className="w-16 h-16 flex-shrink-0">
                                <PestImageWithFallback
                                  src={pestImages?.images.adult || pestImages?.images.damage || pestImages?.images.closeup || ''}
                                  alt={pest?.commonName || 'Unknown pest'}
                                  width={64}
                                  height={64}
                                  className="w-16 h-16"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge className={getSeverityColor(detection.severity)}>
                                    {detection.severity}
                                  </Badge>
                                  <Badge variant="outline" className="border-gray-600 text-gray-300">{pest?.commonName}</Badge>
                                  <span className="text-sm text-gray-500">{detection.date}</span>
                                </div>
                                <p className="text-sm text-gray-200 mb-1">
                                  {detection.location}
                                </p>
                                <p className="text-xs text-gray-400">{detection.notes}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {detection.treated ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              ) : (
                                <AlertTriangle className="w-5 h-5 text-orange-400" />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <Button variant="outline" className="w-full mt-4 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
                      View All Detections
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Thermometer className="w-5 h-5 mr-2 text-red-400" />
                      Environmental Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {environmentalData.map((data, index) => (
                        <div key={index} className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-white">{data.location}</h4>
                            <span className="text-sm text-gray-400">Now</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center">
                              <Thermometer className="w-4 h-4 mr-2 text-red-400" />
                              <span className="text-gray-200">{data.temperature}°C</span>
                            </div>
                            <div className="flex items-center">
                              <Droplets className="w-4 h-4 mr-2 text-blue-400" />
                              <span className="text-gray-200">{data.humidity}%</span>
                            </div>
                            <div className="flex items-center">
                              <Wind className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-gray-200">{data.airflow} m/s</span>
                            </div>
                            <div className="flex items-center">
                              <Activity className="w-4 h-4 mr-2 text-green-400" />
                              <span className="text-gray-200">{data.co2} ppm</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts and Schedule */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Pest Risk Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {commonPests.slice(0, 4).map((pest) => {
                          const pestImages = getPestImages(pest.id)
                          return (
                            <div key={pest.id} className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 flex-shrink-0">
                                  <PestImageWithFallback
                                    src={pestImages?.images.adult || pestImages?.images.damage || pestImages?.images.closeup || ''}
                                    alt={pest.commonName}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12"
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="font-medium text-white">{pest.commonName}</h4>
                                    <Badge className={getRiskColor(pest.riskLevel)}>
                                      {pest.riskLevel} risk
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-400">
                                    Affects: {pest.affectedCrops.join(', ')}
                                  </p>
                                </div>
                              </div>
                              <div className="text-sm text-gray-400">
                                Optimal: {pest.optimalConditions.temperature.min}-{pest.optimalConditions.temperature.max}°C
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">Today's Tasks</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {ipmSchedule.filter(task => task.nextDue === '2024-01-16').map((task) => (
                        <div key={task.id} className="p-3 bg-gray-800 border border-gray-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-200">{task.activity}</span>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400">{task.location}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                        onClick={() => setShowPestModal(true)}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Pest Identification Guide
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
                        <Camera className="w-4 h-4 mr-2" />
                        Report Detection
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
                        <Beaker className="w-4 h-4 mr-2" />
                        Log Treatment
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
                        <Eye className="w-4 h-4 mr-2" />
                        Inspection Checklist
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'pests' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Pest Library</h2>
                <div className="flex space-x-2">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setShowPestModal(true)}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Visual Identification
                  </Button>
                  <Button variant="outline" className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {commonPests.map((pest) => {
                  const pestImages = getPestImages(pest.id)
                  return (
                    <Card key={pest.id} className="cursor-pointer bg-gray-900 border-gray-800 hover:border-gray-600 transition-all">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <CardTitle className="text-lg text-white">{pest.commonName}</CardTitle>
                            <CardDescription className="text-gray-400">
                              <em>{pest.scientificName}</em>
                            </CardDescription>
                          </div>
                          <Badge className={getRiskColor(pest.riskLevel)}>
                            {pest.riskLevel}
                          </Badge>
                        </div>
                        <div className="h-32">
                          <PestImageWithFallback
                            src={pestImages?.images.damage || pestImages?.images.adult || pestImages?.images.closeup || ''}
                            alt={pest.commonName}
                            width={400}
                            height={128}
                            className="w-full h-32"
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Symptoms</h4>
                            <ul className="text-sm text-gray-400 space-y-1">
                              {pest.symptoms.slice(0, 3).map((symptom, index) => (
                                <li key={index} className="flex items-center">
                                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2" />
                                  {symptom}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Affected Crops</h4>
                            <div className="flex flex-wrap gap-1">
                              {pest.affectedCrops.slice(0, 3).map((crop, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-gray-700 text-gray-300">
                                  {crop}
                                </Badge>
                              ))}
                              {pest.affectedCrops.length > 3 && (
                                <Badge variant="outline" className="text-xs border-gray-700 text-gray-300">
                                  +{pest.affectedCrops.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Optimal Conditions</h4>
                            <div className="text-sm text-gray-400 space-y-1">
                              <div>Temp: {pest.optimalConditions.temperature.min}-{pest.optimalConditions.temperature.max}°C</div>
                              <div>Humidity: {pest.optimalConditions.humidity.min}-{pest.optimalConditions.humidity.max}%</div>
                            </div>
                          </div>

                          <Button 
                            variant="outline" 
                            className="w-full bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                            onClick={() => {
                              setSelectedPestForDetection(pest.id)
                              setShowPestModal(true)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details & Images
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'monitoring' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Pest Monitoring</h2>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Detection
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Recent Detections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentDetections.map((detection) => {
                          const pest = commonPests.find(p => p.id === detection.pestId)
                          const pestImages = getPestImages(detection.pestId)
                          return (
                            <div key={detection.id} className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex gap-3">
                                  <div className="w-20 h-20 flex-shrink-0">
                                    <PestImageWithFallback
                                      src={pestImages?.images.damage || pestImages?.images.adult || pestImages?.images.closeup || ''}
                                      alt={pest?.commonName || 'Unknown pest'}
                                      width={80}
                                      height={80}
                                      className="w-20 h-20"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h4 className="font-medium text-white">{pest?.commonName}</h4>
                                      <Badge className={getSeverityColor(detection.severity)}>
                                        {detection.severity}
                                      </Badge>
                                      <Badge variant="outline" className="border-gray-600 text-gray-300">{detection.detectionMethod}</Badge>
                                    </div>
                                    <div className="text-sm text-gray-400 space-y-1">
                                      <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                        {detection.location}
                                      </div>
                                      <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                        {detection.date} • {detection.plantStage}
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-300 mt-2">{detection.notes}</p>
                                    
                                    {detection.treated && (
                                      <div className="mt-3 p-2 bg-green-900/30 border border-green-700 rounded">
                                        <div className="flex items-center text-sm text-green-300">
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Treated on {detection.treatmentDate} with {detection.treatmentMethod}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {detection.followUpRequired && (
                                      <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-700 rounded">
                                        <div className="flex items-center text-sm text-yellow-300">
                                          <Calendar className="w-4 h-4 mr-2" />
                                          Follow-up required by {detection.followUpDate}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                                    onClick={() => {
                                      setSelectedPestForDetection(detection.pestId)
                                      setShowPestModal(true)
                                    }}
                                  >
                                    <ImageIcon className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                                  >
                                    Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Detection Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">This Week</span>
                          <span className="font-medium text-gray-200">3 detections</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Treated</span>
                          <span className="font-medium text-green-400">2/3</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Follow-ups Due</span>
                          <span className="font-medium text-orange-400">3</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Most Common</span>
                          <span className="font-medium text-gray-200">Aphids</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Risk Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Alert className="bg-yellow-900/30 border-yellow-700">
                          <AlertTriangle className="h-4 w-4 text-yellow-400" />
                          <AlertDescription className="text-yellow-300">
                            High humidity in Grow Room B may favor powdery mildew
                          </AlertDescription>
                        </Alert>
                        <Alert className="bg-orange-900/30 border-orange-700">
                          <AlertTriangle className="h-4 w-4 text-orange-400" />
                          <AlertDescription className="text-orange-300">
                            Thrips activity increasing based on trap counts
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}