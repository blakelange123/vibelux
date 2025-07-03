'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Copy, 
  Download, 
  Share2, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Users,
  Leaf,
  Droplets,
  Zap,
  Thermometer,
  Calendar,
  FileText,
  Star,
  Tag,
  Archive,
  Trash2,
  Eye,
  Save,
  X
} from 'lucide-react'

interface SOPTemplate {
  id: string
  title: string
  category: 'lighting' | 'irrigation' | 'nutrients' | 'environment' | 'harvest' | 'pest_management' | 'general'
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  lastUpdated: string
  isCustom: boolean
  isFavorite: boolean
  steps: SOPStep[]
  materials: string[]
  safetyNotes: string[]
  tags: string[]
  createdBy?: string
  usage: number
}

interface SOPStep {
  id: string
  title: string
  description: string
  duration?: string
  warnings?: string[]
  checkpoints: string[]
  images?: string[]
  notes?: string
}

export default function SOPLibraryPage() {
  const [sops, setSOPs] = useState<SOPTemplate[]>([])
  const [filteredSOPs, setFilteredSOPs] = useState<SOPTemplate[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSOP, setSelectedSOP] = useState<SOPTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingStep, setEditingStep] = useState<string | null>(null)

  useEffect(() => {
    loadSOPs()
  }, [])

  useEffect(() => {
    filterSOPs()
  }, [sops, selectedCategory, searchQuery])

  const loadSOPs = async () => {
    // In production, this would fetch from your API
    const mockSOPs: SOPTemplate[] = [
      {
        id: 'sop_001',
        title: 'Daily Lighting System Check',
        category: 'lighting',
        description: 'Comprehensive daily inspection routine for LED grow light systems',
        difficulty: 'beginner',
        estimatedTime: '15-20 minutes',
        lastUpdated: '2024-01-15',
        isCustom: false,
        isFavorite: true,
        usage: 342,
        tags: ['daily', 'LED', 'inspection', 'PPFD'],
        steps: [
          {
            id: 'step_001',
            title: 'Visual Inspection',
            description: 'Check all fixtures for physical damage, loose connections, or unusual discoloration',
            duration: '5 minutes',
            checkpoints: [
              'All LEDs are functioning (no dark spots)',
              'No visible burn marks or discoloration',
              'Mounting hardware is secure',
              'Heat sinks are clean and unobstructed'
            ],
            warnings: ['Turn off power before touching any electrical components']
          },
          {
            id: 'step_002',
            title: 'PPFD Measurements',
            description: 'Take spot measurements at key canopy locations using PAR meter',
            duration: '8 minutes',
            checkpoints: [
              'Center canopy reading within 5% of target',
              'Edge readings within 10% of center',
              'Record all measurements in log',
              'Note any significant variations'
            ]
          },
          {
            id: 'step_003',
            title: 'System Status Check',
            description: 'Verify dimming controls and scheduling systems are operating correctly',
            duration: '5 minutes',
            checkpoints: [
              'Controller display shows correct time/schedule',
              'Dimming levels match planned photoperiod',
              'No error codes or alarms present',
              'Data logging is active'
            ]
          }
        ],
        materials: [
          'PAR meter (calibrated)',
          'Safety glasses',
          'Inspection checklist',
          'Digital camera (for documentation)',
          'Cleaning cloth'
        ],
        safetyNotes: [
          'Always turn off power before inspecting electrical connections',
          'Wear safety glasses when looking directly at LED arrays',
          'Use proper ladder safety when accessing elevated fixtures',
          'Never touch LEDs with bare hands - oils can damage coating'
        ]
      },
      {
        id: 'sop_002',
        title: 'Nutrient Solution Preparation',
        category: 'nutrients',
        description: 'Step-by-step guide for mixing hydroponic nutrient solutions',
        difficulty: 'intermediate',
        estimatedTime: '30-45 minutes',
        lastUpdated: '2024-01-12',
        isCustom: false,
        isFavorite: false,
        usage: 156,
        tags: ['hydroponic', 'EC', 'pH', 'mixing'],
        steps: [
          {
            id: 'step_101',
            title: 'Water Quality Testing',
            description: 'Test and adjust base water parameters before adding nutrients',
            duration: '10 minutes',
            checkpoints: [
              'Source water EC below 0.3',
              'pH between 6.8-7.2',
              'Temperature 18-22°C',
              'No chlorine/chloramine detected'
            ]
          },
          {
            id: 'step_102',
            title: 'Nutrient Mixing',
            description: 'Add nutrients in proper sequence to prevent precipitation',
            duration: '20 minutes',
            checkpoints: [
              'Add Part A nutrients first, mix thoroughly',
              'Add Part B nutrients, mix thoroughly',
              'Add supplements (Cal-Mag, etc.)',
              'Final EC reading matches target'
            ],
            warnings: ['Never mix concentrated nutrients directly together']
          },
          {
            id: 'step_103',
            title: 'pH Adjustment',
            description: 'Adjust final pH to optimal range for nutrient uptake',
            duration: '10 minutes',
            checkpoints: [
              'Final pH between 5.5-6.5',
              'Allow solution to stabilize 15 minutes',
              'Recheck and fine-tune if needed',
              'Document all measurements'
            ]
          }
        ],
        materials: [
          'Calibrated EC meter',
          'Calibrated pH meter',
          'Base nutrients (Part A & B)',
          'pH adjustment solutions',
          'Measuring cups/syringes',
          'Mixing paddle',
          'Clean water source'
        ],
        safetyNotes: [
          'Wear chemical-resistant gloves when handling concentrated nutrients',
          'Ensure adequate ventilation in mixing area',
          'Keep pH adjustment chemicals away from children and pets',
          'Have eyewash station readily available'
        ]
      },
      {
        id: 'sop_003',
        title: 'Environmental Control Calibration',
        category: 'environment',
        description: 'Weekly calibration procedure for temperature, humidity, and CO2 sensors',
        difficulty: 'advanced',
        estimatedTime: '60-90 minutes',
        lastUpdated: '2024-01-10',
        isCustom: false,
        isFavorite: false,
        usage: 89,
        tags: ['calibration', 'sensors', 'accuracy', 'weekly'],
        steps: [
          {
            id: 'step_201',
            title: 'Temperature Sensor Calibration',
            description: 'Verify accuracy of all temperature sensors using reference thermometer',
            duration: '25 minutes',
            checkpoints: [
              'Reference thermometer properly calibrated',
              'All sensors read within ±0.5°C of reference',
              'Adjustment made if variance exceeds tolerance',
              'Calibration date recorded in system'
            ]
          },
          {
            id: 'step_202',
            title: 'Humidity Sensor Calibration',
            description: 'Check humidity sensors against salt solution standards',
            duration: '30 minutes',
            checkpoints: [
              'Salt solution standards prepared correctly',
              'Sensors equilibrated in test chamber',
              'Readings within ±3% RH of standard',
              'Drift correction applied if needed'
            ]
          },
          {
            id: 'step_203',
            title: 'CO2 Sensor Calibration',
            description: 'Calibrate CO2 sensors using reference gas mixtures',
            duration: '25 minutes',
            checkpoints: [
              'Reference gas concentration verified',
              'Zero point calibration completed',
              'Span calibration at 1000 ppm',
              'Linearity check at multiple points'
            ],
            warnings: ['Handle compressed gas cylinders with extreme care']
          }
        ],
        materials: [
          'Calibrated reference thermometer',
          'Humidity calibration salts',
          'CO2 reference gas cylinders',
          'Calibration chamber/enclosure',
          'Data logging equipment',
          'Safety equipment for gas handling'
        ],
        safetyNotes: [
          'Follow all compressed gas safety procedures',
          'Ensure adequate ventilation when using calibration gases',
          'Use appropriate PPE for chemical handling',
          'Have emergency procedures readily available'
        ]
      }
    ]

    setSOPs(mockSOPs)
  }

  const filterSOPs = () => {
    let filtered = sops

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(sop => sop.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(sop => 
        sop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sop.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    setFilteredSOPs(filtered)
  }

  const createCustomSOP = () => {
    const newSOP: SOPTemplate = {
      id: `sop_custom_${Date.now()}`,
      title: 'New Custom SOP',
      category: 'general',
      description: 'Custom procedure created by user',
      difficulty: 'beginner',
      estimatedTime: '30 minutes',
      lastUpdated: new Date().toISOString().split('T')[0],
      isCustom: true,
      isFavorite: false,
      usage: 0,
      tags: ['custom'],
      steps: [
        {
          id: 'step_custom_1',
          title: 'Step 1',
          description: 'Describe what to do in this step',
          checkpoints: ['Checkpoint 1', 'Checkpoint 2']
        }
      ],
      materials: [],
      safetyNotes: []
    }

    setSOPs([...sops, newSOP])
    setSelectedSOP(newSOP)
    setIsEditing(true)
    setShowCreateDialog(false)
  }

  const duplicateSOP = (sop: SOPTemplate) => {
    const duplicated: SOPTemplate = {
      ...sop,
      id: `sop_copy_${Date.now()}`,
      title: `${sop.title} (Copy)`,
      isCustom: true,
      usage: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    setSOPs([...sops, duplicated])
  }

  const toggleFavorite = (sopId: string) => {
    setSOPs(sops.map(sop => 
      sop.id === sopId ? { ...sop, isFavorite: !sop.isFavorite } : sop
    ))
  }

  const saveSOP = (updatedSOP: SOPTemplate) => {
    setSOPs(sops.map(sop => 
      sop.id === updatedSOP.id ? updatedSOP : sop
    ))
    setIsEditing(false)
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      lighting: Zap,
      irrigation: Droplets,
      nutrients: Leaf,
      environment: Thermometer,
      harvest: Calendar,
      pest_management: AlertTriangle,
      general: FileText
    }
    const Icon = icons[category as keyof typeof icons] || FileText
    return <Icon className="w-4 h-4" />
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-500',
      intermediate: 'bg-yellow-500',
      advanced: 'bg-red-500'
    }
    return colors[difficulty as keyof typeof colors] || 'bg-gray-500'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              Grower SOP Library
            </h1>
            <p className="text-muted-foreground">
              Standardize your operations with customizable procedures and best practices
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create SOP
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New SOP</DialogTitle>
                  <DialogDescription>
                    Start with a blank template or duplicate an existing SOP
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Button onClick={createCustomSOP} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Blank SOP
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Or use the duplicate button on any existing SOP to customize it
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search SOPs, tags, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="lighting">Lighting</SelectItem>
              <SelectItem value="irrigation">Irrigation</SelectItem>
              <SelectItem value="nutrients">Nutrients</SelectItem>
              <SelectItem value="environment">Environment</SelectItem>
              <SelectItem value="harvest">Harvest</SelectItem>
              <SelectItem value="pest_management">Pest Management</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* SOP Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSOPs.map((sop) => (
            <Card key={sop.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(sop.category)}
                    <CardTitle className="text-lg">{sop.title}</CardTitle>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(sop.id)}
                    >
                      <Star className={`w-4 h-4 ${sop.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateSOP(sop)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <CardDescription>{sop.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getDifficultyColor(sop.difficulty)}`} />
                      <span className="capitalize">{sop.difficulty}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{sop.estimatedTime}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {sop.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {sop.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{sop.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-3">
                    <div className="text-xs text-muted-foreground">
                      Used {sop.usage} times
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSOP(sop)
                          setIsEditing(false)
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      
                      {sop.isCustom && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSOP(sop)
                            setIsEditing(true)
                          }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSOPs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No SOPs found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters, or create a new SOP
            </p>
          </div>
        )}
      </div>

      {/* SOP Detail Modal */}
      {selectedSOP && (
        <Dialog open={!!selectedSOP} onOpenChange={() => setSelectedSOP(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  {getCategoryIcon(selectedSOP.category)}
                  {isEditing ? (
                    <Input
                      value={selectedSOP.title}
                      onChange={(e) => setSelectedSOP({
                        ...selectedSOP,
                        title: e.target.value
                      })}
                      className="text-lg font-semibold"
                    />
                  ) : (
                    selectedSOP.title
                  )}
                </DialogTitle>
                
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <Button onClick={() => saveSOP(selectedSOP)}>
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      {selectedSOP.isCustom && (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      )}
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              <DialogDescription>
                {isEditing ? (
                  <Textarea
                    value={selectedSOP.description}
                    onChange={(e) => setSelectedSOP({
                      ...selectedSOP,
                      description: e.target.value
                    })}
                    placeholder="Describe this SOP..."
                  />
                ) : (
                  selectedSOP.description
                )}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="steps" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="steps">Steps</TabsTrigger>
                <TabsTrigger value="materials">Materials</TabsTrigger>
                <TabsTrigger value="safety">Safety</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>

              <TabsContent value="steps" className="space-y-4">
                {selectedSOP.steps.map((step, index) => (
                  <Card key={step.id}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>Step {index + 1}: {step.title}</span>
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingStep(editingStep === step.id ? null : step.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {editingStep === step.id ? (
                        <div className="space-y-3">
                          <Input
                            value={step.title}
                            onChange={(e) => {
                              const updatedSteps = selectedSOP.steps.map(s =>
                                s.id === step.id ? { ...s, title: e.target.value } : s
                              )
                              setSelectedSOP({ ...selectedSOP, steps: updatedSteps })
                            }}
                            placeholder="Step title"
                          />
                          <Textarea
                            value={step.description}
                            onChange={(e) => {
                              const updatedSteps = selectedSOP.steps.map(s =>
                                s.id === step.id ? { ...s, description: e.target.value } : s
                              )
                              setSelectedSOP({ ...selectedSOP, steps: updatedSteps })
                            }}
                            placeholder="Step description"
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p>{step.description}</p>
                          
                          {step.duration && (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>Duration: {step.duration}</span>
                            </div>
                          )}
                          
                          {step.warnings && step.warnings.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <div className="flex items-center space-x-2 text-yellow-800 font-medium mb-2">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Warnings</span>
                              </div>
                              <ul className="text-sm text-yellow-700 space-y-1">
                                {step.warnings.map((warning, idx) => (
                                  <li key={idx}>• {warning}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {step.checkpoints.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2 flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Checkpoints</span>
                              </h4>
                              <ul className="space-y-1">
                                {step.checkpoints.map((checkpoint, idx) => (
                                  <li key={idx} className="flex items-start space-x-2 text-sm">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>{checkpoint}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newStep: SOPStep = {
                        id: `step_${Date.now()}`,
                        title: 'New Step',
                        description: 'Describe what to do in this step',
                        checkpoints: []
                      }
                      setSelectedSOP({
                        ...selectedSOP,
                        steps: [...selectedSOP.steps, newStep]
                      })
                    }}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="materials" className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">Required Materials & Equipment</h3>
                  {isEditing ? (
                    <div className="space-y-2">
                      {selectedSOP.materials.map((material, index) => (
                        <div key={index} className="flex space-x-2">
                          <Input
                            value={material}
                            onChange={(e) => {
                              const updated = [...selectedSOP.materials]
                              updated[index] = e.target.value
                              setSelectedSOP({ ...selectedSOP, materials: updated })
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const updated = selectedSOP.materials.filter((_, i) => i !== index)
                              setSelectedSOP({ ...selectedSOP, materials: updated })
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedSOP({
                            ...selectedSOP,
                            materials: [...selectedSOP.materials, 'New material']
                          })
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Material
                      </Button>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {selectedSOP.materials.map((material, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span>{material}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="safety" className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3 flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span>Safety Notes & Precautions</span>
                  </h3>
                  {isEditing ? (
                    <div className="space-y-2">
                      {selectedSOP.safetyNotes.map((note, index) => (
                        <div key={index} className="flex space-x-2">
                          <Textarea
                            value={note}
                            onChange={(e) => {
                              const updated = [...selectedSOP.safetyNotes]
                              updated[index] = e.target.value
                              setSelectedSOP({ ...selectedSOP, safetyNotes: updated })
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const updated = selectedSOP.safetyNotes.filter((_, i) => i !== index)
                              setSelectedSOP({ ...selectedSOP, safetyNotes: updated })
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedSOP({
                            ...selectedSOP,
                            safetyNotes: [...selectedSOP.safetyNotes, 'New safety note']
                          })
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Safety Note
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedSOP.safetyNotes.map((note, index) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-800">{note}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="info" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="capitalize">{selectedSOP.category.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Difficulty:</span>
                        <span className="capitalize">{selectedSOP.difficulty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated Time:</span>
                        <span>{selectedSOP.estimatedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span>{selectedSOP.lastUpdated}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Usage Count:</span>
                        <span>{selectedSOP.usage} times</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedSOP.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}