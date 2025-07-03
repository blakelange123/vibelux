'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  FileText, 
  Download, 
  Plus, 
  Calendar, 
  DollarSign, 
  Building2, 
  User, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Phone,
  Mail,
  Hash,
  CreditCard,
  Truck,
  Package,
  Scale,
  Zap
} from 'lucide-react'

interface UCCFiling {
  id: string
  filingNumber?: string
  status: 'draft' | 'pending' | 'filed' | 'expired' | 'terminated'
  filingDate?: string
  expirationDate?: string
  debtor: CompanyInfo
  securedParty: CompanyInfo
  collateral: CollateralInfo[]
  totalValue: number
  filingJurisdiction: string
  additionalTerms?: string
  createdAt: string
  lastModified: string
}

interface CompanyInfo {
  legalName: string
  dbaName?: string
  entityType: 'corporation' | 'llc' | 'partnership' | 'individual'
  federalTaxId?: string
  stateId?: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  contact: {
    name: string
    title: string
    phone: string
    email: string
  }
}

interface CollateralInfo {
  id: string
  category: 'lighting_equipment' | 'environmental_controls' | 'irrigation_systems' | 'monitoring_equipment' | 'structural' | 'other'
  description: string
  manufacturer?: string
  model?: string
  serialNumber?: string
  quantity: number
  unitValue: number
  totalValue: number
  location: string
  installationDate?: string
  warrantyExpiration?: string
}

export default function UCCFilingsPage() {
  const [filings, setFilings] = useState<UCCFiling[]>([])
  const [selectedFiling, setSelectedFiling] = useState<UCCFiling | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    loadFilings()
  }, [])

  const loadFilings = async () => {
    // Mock data - in production, this would fetch from your API
    const mockFilings: UCCFiling[] = [
      {
        id: 'ucc_001',
        filingNumber: 'UCC-2024-001547',
        status: 'filed',
        filingDate: '2024-01-15',
        expirationDate: '2029-01-15',
        totalValue: 2850000,
        filingJurisdiction: 'Delaware',
        debtor: {
          legalName: 'Green Valley Cultivation LLC',
          dbaName: 'Green Valley Farms',
          entityType: 'llc',
          federalTaxId: '12-3456789',
          stateId: 'DE-LLC-7891234',
          address: {
            street: '1250 Agriculture Way',
            city: 'Dover',
            state: 'DE',
            zipCode: '19901',
            country: 'USA'
          },
          contact: {
            name: 'Michael Chen',
            title: 'Chief Operating Officer',
            phone: '(302) 555-0147',
            email: 'mchen@greenvalleyfarms.com'
          }
        },
        securedParty: {
          legalName: 'VibeLux Technologies Inc.',
          entityType: 'corporation',
          federalTaxId: '98-7654321',
          address: {
            street: '500 Innovation Drive',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA'
          },
          contact: {
            name: 'Sarah Johnson',
            title: 'Director of Finance',
            phone: '(415) 555-0892',
            email: 'sarah.johnson@vibelux.com'
          }
        },
        collateral: [
          {
            id: 'col_001',
            category: 'lighting_equipment',
            description: 'LED Grow Light Systems - Full Spectrum 640W',
            manufacturer: 'VibeLux',
            model: 'VL-640-FS',
            quantity: 120,
            unitValue: 1200,
            totalValue: 144000,
            location: 'Facility A - Rooms 1-8',
            installationDate: '2024-01-20',
            warrantyExpiration: '2027-01-20'
          },
          {
            id: 'col_002',
            category: 'environmental_controls',
            description: 'Climate Control System with CO2 Injection',
            manufacturer: 'Quest Dehumidifiers',
            model: 'Dual 150',
            quantity: 8,
            unitValue: 15000,
            totalValue: 120000,
            location: 'Facility A - HVAC Room',
            installationDate: '2024-01-22'
          },
          {
            id: 'col_003',
            category: 'irrigation_systems',
            description: 'Automated Fertigation System',
            manufacturer: 'Netafim',
            model: 'GrowSphere Pro',
            quantity: 1,
            unitValue: 85000,
            totalValue: 85000,
            location: 'Facility A - Nutrient Room',
            installationDate: '2024-01-25'
          }
        ],
        createdAt: '2024-01-10',
        lastModified: '2024-01-15'
      },
      {
        id: 'ucc_002',
        status: 'draft',
        totalValue: 1750000,
        filingJurisdiction: 'California',
        debtor: {
          legalName: 'Pacific Coast Growers Inc.',
          entityType: 'corporation',
          federalTaxId: '45-9876543',
          address: {
            street: '2800 Coastal Highway',
            city: 'Santa Barbara',
            state: 'CA',
            zipCode: '93105',
            country: 'USA'
          },
          contact: {
            name: 'Roberto Martinez',
            title: 'CEO',
            phone: '(805) 555-0234',
            email: 'rmartinez@pacificcoastgrowers.com'
          }
        },
        securedParty: {
          legalName: 'VibeLux Technologies Inc.',
          entityType: 'corporation',
          federalTaxId: '98-7654321',
          address: {
            street: '500 Innovation Drive',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA'
          },
          contact: {
            name: 'Sarah Johnson',
            title: 'Director of Finance',
            phone: '(415) 555-0892',
            email: 'sarah.johnson@vibelux.com'
          }
        },
        collateral: [
          {
            id: 'col_004',
            category: 'lighting_equipment',
            description: 'LED Grow Light Systems - Premium Series',
            manufacturer: 'VibeLux',
            model: 'VL-1000-PREM',
            quantity: 80,
            unitValue: 1800,
            totalValue: 144000,
            location: 'Facility B - Greenhouse Complex'
          }
        ],
        createdAt: '2024-01-20',
        lastModified: '2024-01-22'
      }
    ]

    setFilings(mockFilings)
  }

  const createNewFiling = () => {
    const newFiling: UCCFiling = {
      id: `ucc_${Date.now()}`,
      status: 'draft',
      totalValue: 0,
      filingJurisdiction: '',
      debtor: {
        legalName: '',
        entityType: 'llc',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        },
        contact: {
          name: '',
          title: '',
          phone: '',
          email: ''
        }
      },
      securedParty: {
        legalName: 'VibeLux Technologies Inc.',
        entityType: 'corporation',
        federalTaxId: '98-7654321',
        address: {
          street: '500 Innovation Drive',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'USA'
        },
        contact: {
          name: 'Sarah Johnson',
          title: 'Director of Finance',
          phone: '(415) 555-0892',
          email: 'sarah.johnson@vibelux.com'
        }
      },
      collateral: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }

    setFilings([newFiling, ...filings])
    setSelectedFiling(newFiling)
    setIsEditing(true)
    setShowCreateDialog(false)
  }

  const addCollateralItem = () => {
    if (!selectedFiling) return

    const newItem: CollateralInfo = {
      id: `col_${Date.now()}`,
      category: 'lighting_equipment',
      description: '',
      quantity: 1,
      unitValue: 0,
      totalValue: 0,
      location: ''
    }

    const updatedFiling = {
      ...selectedFiling,
      collateral: [...selectedFiling.collateral, newItem],
      lastModified: new Date().toISOString()
    }

    setSelectedFiling(updatedFiling)
    updateFiling(updatedFiling)
  }

  const updateCollateralItem = (itemId: string, updates: Partial<CollateralInfo>) => {
    if (!selectedFiling) return

    const updatedCollateral = selectedFiling.collateral.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, ...updates }
        updated.totalValue = updated.quantity * updated.unitValue
        return updated
      }
      return item
    })

    const totalValue = updatedCollateral.reduce((sum, item) => sum + item.totalValue, 0)

    const updatedFiling = {
      ...selectedFiling,
      collateral: updatedCollateral,
      totalValue,
      lastModified: new Date().toISOString()
    }

    setSelectedFiling(updatedFiling)
    updateFiling(updatedFiling)
  }

  const removeCollateralItem = (itemId: string) => {
    if (!selectedFiling) return

    const updatedCollateral = selectedFiling.collateral.filter(item => item.id !== itemId)
    const totalValue = updatedCollateral.reduce((sum, item) => sum + item.totalValue, 0)

    const updatedFiling = {
      ...selectedFiling,
      collateral: updatedCollateral,
      totalValue,
      lastModified: new Date().toISOString()
    }

    setSelectedFiling(updatedFiling)
    updateFiling(updatedFiling)
  }

  const updateFiling = (updatedFiling: UCCFiling) => {
    setFilings(filings.map(f => f.id === updatedFiling.id ? updatedFiling : f))
  }

  const submitFiling = async (filing: UCCFiling) => {
    // In production, this would submit to the appropriate state's UCC filing system
    const updatedFiling = {
      ...filing,
      status: 'pending' as const,
      filingDate: new Date().toISOString().split('T')[0],
      filingNumber: `UCC-${new Date().getFullYear()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString().slice(2, 8)}`,
      expirationDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 5 years
    }

    updateFiling(updatedFiling)
    setSelectedFiling(updatedFiling)
    setIsEditing(false)
  }

  const generateUCCForm = (filing: UCCFiling) => {
    // Generate UCC-1 form data for download
    const formData = {
      debtorName: filing.debtor.legalName,
      debtorAddress: `${filing.debtor.address.street}, ${filing.debtor.address.city}, ${filing.debtor.address.state} ${filing.debtor.address.zipCode}`,
      securedPartyName: filing.securedParty.legalName,
      securedPartyAddress: `${filing.securedParty.address.street}, ${filing.securedParty.address.city}, ${filing.securedParty.address.state} ${filing.securedParty.address.zipCode}`,
      collateralDescription: filing.collateral.map(c => c.description).join('; '),
      totalValue: filing.totalValue,
      filingNumber: filing.filingNumber
    }

    // Create download
    const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `UCC-1-${filing.filingNumber || filing.id}.json`
    a.click()
  }

  const filteredFilings = filings.filter(filing => {
    const matchesSearch = filing.debtor.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         filing.filingNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || filing.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-500',
      pending: 'bg-yellow-500',
      filed: 'bg-green-500',
      expired: 'bg-red-500',
      terminated: 'bg-blue-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      lighting_equipment: Zap,
      environmental_controls: Scale,
      irrigation_systems: Truck,
      monitoring_equipment: Package,
      structural: Building2,
      other: Package
    }
    const Icon = icons[category as keyof typeof icons] || Package
    return <Icon className="w-4 h-4" />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              UCC-1 Filings Generator
            </h1>
            <p className="text-muted-foreground">
              Manage UCC-1 financing statements for Grow-as-a-Service equipment
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Filing
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New UCC-1 Filing</DialogTitle>
                  <DialogDescription>
                    Start a new UCC-1 financing statement for equipment financing
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Button onClick={createNewFiling} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Filing
                  </Button>
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
              placeholder="Search by company name or filing number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="filed">Filed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Filings List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>UCC-1 Filings</CardTitle>
                <CardDescription>{filteredFilings.length} filings found</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredFilings.map((filing) => (
                    <div
                      key={filing.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedFiling?.id === filing.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedFiling(filing)
                        setIsEditing(false)
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">{filing.debtor.legalName}</div>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(filing.status)}`} />
                          <span className="text-xs capitalize">{filing.status}</span>
                        </div>
                      </div>
                      
                      {filing.filingNumber && (
                        <div className="text-xs text-muted-foreground mb-1">
                          {filing.filingNumber}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-green-600">
                          ${filing.totalValue.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          {filing.collateral.length} items
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {filteredFilings.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No filings found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filing Details */}
          <div className="lg:col-span-2">
            {selectedFiling ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {selectedFiling.filingNumber || 'Draft Filing'}
                      </CardTitle>
                      <CardDescription>
                        {selectedFiling.debtor.legalName} • {selectedFiling.filingJurisdiction || 'No jurisdiction set'}
                      </CardDescription>
                    </div>
                    
                    <div className="flex space-x-2">
                      {selectedFiling.status === 'draft' && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(!isEditing)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            {isEditing ? 'View' : 'Edit'}
                          </Button>
                          <Button onClick={() => submitFiling(selectedFiling)}>
                            Submit Filing
                          </Button>
                        </>
                      )}
                      {selectedFiling.status !== 'draft' && (
                        <Button
                          variant="outline"
                          onClick={() => generateUCCForm(selectedFiling)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Tabs defaultValue="parties" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="parties">Parties</TabsTrigger>
                      <TabsTrigger value="collateral">Collateral</TabsTrigger>
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                    </TabsList>

                    <TabsContent value="parties" className="space-y-6">
                      {/* Debtor Information */}
                      <div>
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Debtor Information
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium mb-1">Legal Name *</label>
                            {isEditing ? (
                              <Input
                                value={selectedFiling.debtor.legalName}
                                onChange={(e) => setSelectedFiling({
                                  ...selectedFiling,
                                  debtor: { ...selectedFiling.debtor, legalName: e.target.value }
                                })}
                              />
                            ) : (
                              <p className="text-sm">{selectedFiling.debtor.legalName || 'Not specified'}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">DBA Name</label>
                            {isEditing ? (
                              <Input
                                value={selectedFiling.debtor.dbaName || ''}
                                onChange={(e) => setSelectedFiling({
                                  ...selectedFiling,
                                  debtor: { ...selectedFiling.debtor, dbaName: e.target.value }
                                })}
                              />
                            ) : (
                              <p className="text-sm">{selectedFiling.debtor.dbaName || 'Not specified'}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2 mt-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Entity Type</label>
                            {isEditing ? (
                              <Select
                                value={selectedFiling.debtor.entityType}
                                onValueChange={(value: any) => setSelectedFiling({
                                  ...selectedFiling,
                                  debtor: { ...selectedFiling.debtor, entityType: value }
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="corporation">Corporation</SelectItem>
                                  <SelectItem value="llc">LLC</SelectItem>
                                  <SelectItem value="partnership">Partnership</SelectItem>
                                  <SelectItem value="individual">Individual</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <p className="text-sm capitalize">{selectedFiling.debtor.entityType}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Federal Tax ID</label>
                            {isEditing ? (
                              <Input
                                value={selectedFiling.debtor.federalTaxId || ''}
                                onChange={(e) => setSelectedFiling({
                                  ...selectedFiling,
                                  debtor: { ...selectedFiling.debtor, federalTaxId: e.target.value }
                                })}
                              />
                            ) : (
                              <p className="text-sm">{selectedFiling.debtor.federalTaxId || 'Not specified'}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Secured Party Information */}
                      <div>
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          Secured Party Information
                        </h3>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="grid gap-2 text-sm">
                            <div><strong>Legal Name:</strong> {selectedFiling.securedParty.legalName}</div>
                            <div><strong>Federal Tax ID:</strong> {selectedFiling.securedParty.federalTaxId}</div>
                            <div><strong>Address:</strong> {selectedFiling.securedParty.address.street}, {selectedFiling.securedParty.address.city}, {selectedFiling.securedParty.address.state} {selectedFiling.securedParty.address.zipCode}</div>
                            <div><strong>Contact:</strong> {selectedFiling.securedParty.contact.name} ({selectedFiling.securedParty.contact.title})</div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="collateral" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Collateral Items</h3>
                        {isEditing && (
                          <Button onClick={addCollateralItem} size="sm">
                            <Plus className="w-4 h-4 mr-1" />
                            Add Item
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {selectedFiling.collateral.map((item) => (
                          <Card key={item.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(item.category)}
                                  <span className="font-medium">{item.description || 'Untitled Item'}</span>
                                </div>
                                {isEditing && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeCollateralItem(item.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                              
                              <div className="grid gap-3 md:grid-cols-3">
                                <div>
                                  <label className="block text-xs font-medium mb-1">Description</label>
                                  {isEditing ? (
                                    <Input
                                      value={item.description}
                                      onChange={(e) => updateCollateralItem(item.id, { description: e.target.value })}
                                      size="sm"
                                    />
                                  ) : (
                                    <p className="text-sm">{item.description}</p>
                                  )}
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium mb-1">Quantity</label>
                                  {isEditing ? (
                                    <Input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => updateCollateralItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                                      size="sm"
                                    />
                                  ) : (
                                    <p className="text-sm">{item.quantity}</p>
                                  )}
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium mb-1">Unit Value</label>
                                  {isEditing ? (
                                    <Input
                                      type="number"
                                      value={item.unitValue}
                                      onChange={(e) => updateCollateralItem(item.id, { unitValue: parseFloat(e.target.value) || 0 })}
                                      size="sm"
                                    />
                                  ) : (
                                    <p className="text-sm">${item.unitValue.toLocaleString()}</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="mt-3 pt-3 border-t">
                                <div className="flex justify-between items-center text-sm">
                                  <span>Total Value:</span>
                                  <span className="font-medium text-green-600">
                                    ${item.totalValue.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        {selectedFiling.collateral.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No collateral items added</p>
                            {isEditing && (
                              <Button onClick={addCollateralItem} className="mt-2" size="sm">
                                Add First Item
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="summary" className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-3">Filing Status</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Status:</span>
                                <Badge className={getStatusColor(selectedFiling.status)}>
                                  {selectedFiling.status}
                                </Badge>
                              </div>
                              {selectedFiling.filingNumber && (
                                <div className="flex justify-between">
                                  <span>Filing Number:</span>
                                  <span className="font-mono">{selectedFiling.filingNumber}</span>
                                </div>
                              )}
                              {selectedFiling.filingDate && (
                                <div className="flex justify-between">
                                  <span>Filing Date:</span>
                                  <span>{selectedFiling.filingDate}</span>
                                </div>
                              )}
                              {selectedFiling.expirationDate && (
                                <div className="flex justify-between">
                                  <span>Expiration:</span>
                                  <span>{selectedFiling.expirationDate}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-3">Financial Summary</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Total Collateral Value:</span>
                                <span className="font-medium text-green-600">
                                  ${selectedFiling.totalValue.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Number of Items:</span>
                                <span>{selectedFiling.collateral.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Filing Jurisdiction:</span>
                                <span>{selectedFiling.filingJurisdiction || 'Not set'}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-3">Collateral Breakdown</h4>
                          <div className="space-y-2">
                            {['lighting_equipment', 'environmental_controls', 'irrigation_systems', 'monitoring_equipment', 'structural', 'other'].map(category => {
                              const items = selectedFiling.collateral.filter(c => c.category === category)
                              const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0)
                              
                              if (items.length === 0) return null
                              
                              return (
                                <div key={category} className="flex justify-between items-center text-sm">
                                  <div className="flex items-center gap-2">
                                    {getCategoryIcon(category)}
                                    <span className="capitalize">{category.replace('_', ' ')}</span>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">${totalValue.toLocaleString()}</div>
                                    <div className="text-xs text-muted-foreground">{items.length} items</div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium mb-2">No Filing Selected</h3>
                    <p>Select a filing from the list to view details</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}