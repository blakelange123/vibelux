'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Camera, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Bug, 
  Leaf, 
  Thermometer,
  Droplets,
  Wind,
  CheckCircle,
  Upload,
  Wifi,
  WifiOff,
  Save,
  Navigation,
  QrCode,
  Search,
  Filter,
  Star,
  Plus
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'

interface ScoutingRecord {
  id: string
  timestamp: Date
  location: {
    latitude: number
    longitude: number
    zone?: string
    block?: string
  }
  type: 'pest' | 'disease' | 'deficiency' | 'general'
  severity: 'low' | 'medium' | 'high' | 'critical'
  issue: string
  notes: string
  photos: File[]
  environmental: {
    temperature?: number
    humidity?: number
    leafWetness?: number
  }
  actionRequired: boolean
  assignedTo?: string
  synced: boolean
}

interface GPS {
  latitude: number
  longitude: number
  accuracy: number
}

export default function MobileScoutingApp() {
  const [records, setRecords] = useState<ScoutingRecord[]>([])
  const [currentRecord, setCurrentRecord] = useState<Partial<ScoutingRecord>>({})
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [gpsLocation, setGpsLocation] = useState<GPS | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [activeTab, setActiveTab] = useState('scout')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Initialize offline storage and GPS
  useEffect(() => {
    // Load offline records
    const stored = localStorage.getItem('scoutingRecords')
    if (stored) {
      setRecords(JSON.parse(stored))
    }

    // Setup online/offline detection
    const handleOnline = () => {
      setIsOnline(true)
      syncRecords()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Get GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        (error) => console.error('GPS error:', error),
        { enableHighAccuracy: true }
      )
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Save records to local storage
  useEffect(() => {
    localStorage.setItem('scoutingRecords', JSON.stringify(records))
  }, [records])

  const syncRecords = async () => {
    if (!isOnline) return

    const unsyncedRecords = records.filter(record => !record.synced)
    
    for (const record of unsyncedRecords) {
      try {
        const formData = new FormData()
        formData.append('data', JSON.stringify(record))
        
        record.photos.forEach((photo, index) => {
          formData.append(`photo_${index}`, photo)
        })

        const response = await fetch('/api/scouting/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          setRecords(prev => prev.map(r => 
            r.id === record.id ? { ...r, synced: true } : r
          ))
        }
      } catch (error) {
        console.error('Sync error:', error)
      }
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setShowScanner(true)
    } catch (error) {
      console.error('Camera error:', error)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context?.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `scouting_${Date.now()}.jpg`, { type: 'image/jpeg' })
          setCurrentRecord(prev => ({
            ...prev,
            photos: [...(prev.photos || []), file]
          }))
        }
      }, 'image/jpeg', 0.8)
    }
  }

  const saveRecord = () => {
    if (!currentRecord.issue || !currentRecord.type) return

    const newRecord: ScoutingRecord = {
      id: `scouting_${Date.now()}`,
      timestamp: new Date(),
      location: {
        latitude: gpsLocation?.latitude || 0,
        longitude: gpsLocation?.longitude || 0,
        zone: currentRecord.location?.zone,
        block: currentRecord.location?.block
      },
      type: currentRecord.type as 'pest' | 'disease' | 'deficiency' | 'general',
      severity: currentRecord.severity as 'low' | 'medium' | 'high' | 'critical',
      issue: currentRecord.issue,
      notes: currentRecord.notes || '',
      photos: currentRecord.photos || [],
      environmental: currentRecord.environmental || {},
      actionRequired: currentRecord.actionRequired || false,
      assignedTo: currentRecord.assignedTo,
      synced: false
    }

    setRecords(prev => [newRecord, ...prev])
    setCurrentRecord({})
    setIsRecording(false)
    
    if (isOnline) {
      syncRecords()
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pest': return <Bug className="w-4 h-4" />
      case 'disease': return <AlertTriangle className="w-4 h-4" />
      case 'deficiency': return <Leaf className="w-4 h-4" />
      default: return <Search className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">Field Scouting</h1>
            <div className="flex items-center gap-2">
              <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
                {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              {gpsLocation && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  GPS: {gpsLocation.accuracy.toFixed(0)}m
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border-b">
          <TabsTrigger value="scout">Scout</TabsTrigger>
          <TabsTrigger value="records">Records ({records.length})</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
        </TabsList>

        {/* Scouting Tab */}
        <TabsContent value="scout" className="p-4 space-y-4">
          {!isRecording ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  New Scouting Record
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setIsRecording(true)} 
                  className="w-full"
                  size="lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Scouting
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Issue Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Issue Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={currentRecord.type} 
                    onValueChange={(value) => setCurrentRecord(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pest">🐛 Pest</SelectItem>
                      <SelectItem value="disease">🦠 Disease</SelectItem>
                      <SelectItem value="deficiency">🍃 Deficiency</SelectItem>
                      <SelectItem value="general">📋 General</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Severity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Severity Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={currentRecord.severity} 
                    onValueChange={(value) => setCurrentRecord(prev => ({ ...prev, severity: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Low</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="high">🟠 High</SelectItem>
                      <SelectItem value="critical">🔴 Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Issue Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Issue Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input 
                    placeholder="Brief description of the issue"
                    value={currentRecord.issue || ''}
                    onChange={(e) => setCurrentRecord(prev => ({ ...prev, issue: e.target.value }))}
                  />
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input 
                      placeholder="Zone"
                      value={currentRecord.location?.zone || ''}
                      onChange={(e) => setCurrentRecord(prev => ({
                        ...prev,
                        location: { ...prev.location, zone: e.target.value }
                      }))}
                    />
                    <Input 
                      placeholder="Block"
                      value={currentRecord.location?.block || ''}
                      onChange={(e) => setCurrentRecord(prev => ({
                        ...prev,
                        location: { ...prev.location, block: e.target.value }
                      }))}
                    />
                  </div>
                  {gpsLocation && (
                    <div className="text-xs text-gray-500">
                      GPS: {gpsLocation.latitude.toFixed(6)}, {gpsLocation.longitude.toFixed(6)}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Camera */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Photos ({currentRecord.photos?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      onClick={startCamera} 
                      variant="outline" 
                      className="w-full"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                    
                    {showScanner && (
                      <div className="relative">
                        <video 
                          ref={videoRef} 
                          className="w-full rounded-lg"
                          autoPlay 
                          playsInline
                        />
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                          <Button onClick={capturePhoto} size="lg" className="rounded-full">
                            <Camera className="w-6 h-6" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    placeholder="Detailed observations, recommendations, etc."
                    value={currentRecord.notes || ''}
                    onChange={(e) => setCurrentRecord(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </CardContent>
              </Card>

              {/* Action Required */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="actionRequired"
                      checked={currentRecord.actionRequired || false}
                      onCheckedChange={(checked) => 
                        setCurrentRecord(prev => ({ ...prev, actionRequired: checked as boolean }))
                      }
                    />
                    <label htmlFor="actionRequired" className="text-sm font-medium">
                      Immediate action required
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Save Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsRecording(false)} 
                  variant="outline" 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveRecord} 
                  className="flex-1"
                  disabled={!currentRecord.issue || !currentRecord.type}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Record
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="p-4">
          <div className="space-y-3">
            {records.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No scouting records yet</p>
                  <p className="text-sm">Start by creating your first scouting record</p>
                </CardContent>
              </Card>
            ) : (
              records.map((record) => (
                <Card key={record.id} className="relative">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(record.type)}
                          <span className="font-medium">{record.issue}</span>
                          <Badge className={getSeverityColor(record.severity)}>
                            {record.severity}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {record.location.zone && `Zone ${record.location.zone}`}
                            {record.location.block && ` Block ${record.location.block}`}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {record.timestamp.toLocaleString()}
                          </div>
                          {record.photos.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Camera className="w-3 h-3" />
                              {record.photos.length} photo{record.photos.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                        {record.notes && (
                          <p className="text-sm text-gray-700 mt-2">{record.notes}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {!record.synced && (
                          <Badge variant="outline" className="text-xs">
                            <Upload className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                        {record.actionRequired && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Action Needed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Map Tab */}
        <TabsContent value="map" className="p-4">
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Map view coming soon</p>
              <p className="text-sm">GPS-tagged scouting locations will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sync Button */}
      {isOnline && records.some(r => !r.synced) && (
        <div className="fixed bottom-4 right-4">
          <Button onClick={syncRecords} className="rounded-full shadow-lg">
            <Upload className="w-4 h-4 mr-2" />
            Sync {records.filter(r => !r.synced).length}
          </Button>
        </div>
      )}
    </div>
  )
}