'use client'

import { useState, useEffect } from 'react'
import { 
  MapPin, 
  Users, 
  Activity, 
  Eye, 
  Zap, 
  AlertTriangle,
  TrendingUp,
  Monitor,
  Wifi,
  WifiOff,
  Clock,
  Globe,
  Shield,
  Filter,
  RefreshCw,
  Settings,
  BarChart3,
  Layers,
  Target,
  Radio,
  Smartphone,
  Laptop,
  Tablet,
  Chrome,
  Firefox,
  Safari,
  Signal
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

interface UserLocation {
  id: string
  user: {
    name: string
    email: string
    role: string
    subscriptionTier: string
    avatar?: string
  }
  session: {
    deviceFingerprint: string
    ipAddress: string
    userAgent: string
    location?: {
      city: string
      region: string
      country: string
      lat: number
      lng: number
      timezone: string
    }
    device: {
      type: 'mobile' | 'tablet' | 'desktop'
      os: string
      browser: string
    }
    createdAt: Date
    lastActiveAt: Date
    isActive: boolean
  }
  facility?: {
    id: string
    name: string
    type: string
    size: number
  }
  activity: {
    currentPage: string
    actions: number
    energySavings: number
    optimizationEvents: number
  }
}

interface FacilityMarker {
  id: string
  name: string
  location: { lat: number; lng: number }
  users: UserLocation[]
  status: 'active' | 'warning' | 'offline'
  energyStatus: {
    currentKW: number
    savings: number
    optimizing: boolean
  }
}

export default function AdminMapDashboard() {
  const [activeUsers, setActiveUsers] = useState<UserLocation[]>([])
  const [facilities, setFacilities] = useState<FacilityMarker[]>([])
  const [selectedUser, setSelectedUser] = useState<UserLocation | null>(null)
  const [viewMode, setViewMode] = useState<'users' | 'facilities' | 'both'>('both')
  const [realTimeMode, setRealTimeMode] = useState(true)
  const [filterBy, setFilterBy] = useState<'all' | 'premium' | 'enterprise' | 'active'>('all')
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadActiveUsers()
    loadFacilities()
    
    if (realTimeMode) {
      const interval = setInterval(() => {
        loadActiveUsers()
        loadFacilities()
      }, 5000) // Update every 5 seconds
      
      return () => clearInterval(interval)
    }
  }, [realTimeMode, filterBy])

  const loadActiveUsers = async () => {
    // Mock data - replace with actual API call
    const mockUsers: UserLocation[] = [
      {
        id: '1',
        user: {
          name: 'John Doe',
          email: 'john@greentech.com',
          role: 'ADMIN',
          subscriptionTier: 'ENTERPRISE'
        },
        session: {
          deviceFingerprint: 'fp_123',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          location: {
            city: 'San Francisco',
            region: 'California',
            country: 'United States',
            lat: 37.7749,
            lng: -122.4194,
            timezone: 'America/Los_Angeles'
          },
          device: {
            type: 'desktop',
            os: 'macOS',
            browser: 'Chrome'
          },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          lastActiveAt: new Date(Date.now() - 30 * 1000),
          isActive: true
        },
        facility: {
          id: 'fac_1',
          name: 'GreenTech SF',
          type: 'INDOOR',
          size: 10000
        },
        activity: {
          currentPage: '/dashboard/energy',
          actions: 42,
          energySavings: 1250,
          optimizationEvents: 8
        }
      },
      {
        id: '2',
        user: {
          name: 'Sarah Chen',
          email: 'sarah@vertifarms.co',
          role: 'USER',
          subscriptionTier: 'PROFESSIONAL'
        },
        session: {
          deviceFingerprint: 'fp_456',
          ipAddress: '10.0.1.50',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
          location: {
            city: 'Austin',
            region: 'Texas',
            country: 'United States',
            lat: 30.2672,
            lng: -97.7431,
            timezone: 'America/Chicago'
          },
          device: {
            type: 'mobile',
            os: 'iOS',
            browser: 'Safari'
          },
          createdAt: new Date(Date.now() - 45 * 60 * 1000),
          lastActiveAt: new Date(Date.now() - 5 * 1000),
          isActive: true
        },
        facility: {
          id: 'fac_2',
          name: 'VertiFarms Austin',
          type: 'VERTICAL_FARM',
          size: 25000
        },
        activity: {
          currentPage: '/scouting/mobile',
          actions: 15,
          energySavings: 890,
          optimizationEvents: 3
        }
      },
      {
        id: '3',
        user: {
          name: 'Dr. Emily Watson',
          email: 'ewatson@university.edu',
          role: 'RESEARCHER',
          subscriptionTier: 'ACADEMIC'
        },
        session: {
          deviceFingerprint: 'fp_789',
          ipAddress: '134.195.100.25',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: {
            city: 'Amsterdam',
            region: 'North Holland',
            country: 'Netherlands',
            lat: 52.3676,
            lng: 4.9041,
            timezone: 'Europe/Amsterdam'
          },
          device: {
            type: 'desktop',
            os: 'Windows',
            browser: 'Chrome'
          },
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          lastActiveAt: new Date(Date.now() - 2 * 60 * 1000),
          isActive: true
        },
        activity: {
          currentPage: '/research/anova',
          actions: 67,
          energySavings: 0,
          optimizationEvents: 0
        }
      }
    ]
    
    setActiveUsers(mockUsers)
  }

  const loadFacilities = async () => {
    // Mock data - replace with actual API call
    const mockFacilities: FacilityMarker[] = [
      {
        id: 'fac_1',
        name: 'GreenTech SF',
        location: { lat: 37.7749, lng: -122.4194 },
        users: activeUsers.filter(u => u.facility?.id === 'fac_1'),
        status: 'active',
        energyStatus: {
          currentKW: 45.2,
          savings: 1250,
          optimizing: true
        }
      },
      {
        id: 'fac_2',
        name: 'VertiFarms Austin',
        location: { lat: 30.2672, lng: -97.7431 },
        users: activeUsers.filter(u => u.facility?.id === 'fac_2'),
        status: 'active',
        energyStatus: {
          currentKW: 78.9,
          savings: 890,
          optimizing: true
        }
      },
      {
        id: 'fac_3',
        name: 'Urban Greens NYC',
        location: { lat: 40.7128, lng: -74.0060 },
        users: [],
        status: 'warning',
        energyStatus: {
          currentKW: 32.1,
          savings: 567,
          optimizing: false
        }
      }
    ]
    
    setFacilities(mockFacilities)
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-4 h-4" />
      case 'tablet': return <Tablet className="w-4 h-4" />
      case 'desktop': return <Laptop className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }

  const getBrowserIcon = (browser: string) => {
    if (browser.includes('Chrome')) return <Chrome className="w-4 h-4" />
    if (browser.includes('Firefox')) return <Firefox className="w-4 h-4" />
    if (browser.includes('Safari')) return <Safari className="w-4 h-4" />
    return <Globe className="w-4 h-4" />
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'PROFESSIONAL': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ACADEMIC': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getActivityStatus = (lastActiveAt: Date) => {
    const minutesAgo = (Date.now() - lastActiveAt.getTime()) / (1000 * 60)
    if (minutesAgo < 1) return { text: 'Just now', color: 'text-green-600' }
    if (minutesAgo < 5) return { text: `${Math.floor(minutesAgo)}m ago`, color: 'text-green-600' }
    if (minutesAgo < 30) return { text: `${Math.floor(minutesAgo)}m ago`, color: 'text-yellow-600' }
    return { text: `${Math.floor(minutesAgo)}m ago`, color: 'text-red-600' }
  }

  const filteredUsers = activeUsers.filter(user => {
    if (filterBy === 'all') return true
    if (filterBy === 'premium') return ['ENTERPRISE', 'PROFESSIONAL'].includes(user.user.subscriptionTier)
    if (filterBy === 'enterprise') return user.user.subscriptionTier === 'ENTERPRISE'
    if (filterBy === 'active') return user.session.isActive
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Global Activity Dashboard</h1>
            <p className="text-gray-600 mt-1">Real-time monitoring of users, facilities, and energy optimization</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={realTimeMode}
                onCheckedChange={setRealTimeMode}
                id="realtime"
              />
              <label htmlFor="realtime" className="text-sm font-medium">Real-time</label>
            </div>
            <Button 
              onClick={() => {
                setLoading(true)
                loadActiveUsers()
                loadFacilities()
                setTimeout(() => setLoading(false), 1000)
              }}
              disabled={loading}
              variant="outline"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">View Mode</label>
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="both">Users & Facilities</SelectItem>
              <SelectItem value="users">Users Only</SelectItem>
              <SelectItem value="facilities">Facilities Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Filter By</label>
          <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="premium">Premium Tiers</SelectItem>
              <SelectItem value="enterprise">Enterprise Only</SelectItem>
              <SelectItem value="active">Active Now</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <div className="flex items-center space-x-2">
            <Switch
              id="heatmap"
              checked={showHeatmap}
              onCheckedChange={setShowHeatmap}
            />
            <label htmlFor="heatmap" className="text-sm font-medium">Activity Heatmap</label>
          </div>
        </div>

        <div className="flex items-end">
          <Button variant="outline" size="sm" className="w-full">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>

        <div className="flex items-end">
          <Button variant="outline" size="sm" className="w-full">
            <Target className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{filteredUsers.length}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% from yesterday
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Facilities</p>
                <p className="text-2xl font-bold text-gray-900">{facilities.filter(f => f.status === 'active').length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {facilities.length} total facilities
                </p>
              </div>
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Energy Optimizing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {facilities.filter(f => f.energyStatus.optimizing).length}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <Zap className="w-3 h-3" />
                  Real-time optimization
                </p>
              </div>
              <Activity className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Savings Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${activeUsers.reduce((sum, user) => sum + user.activity.energySavings, 0).toLocaleString()}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +$2,340 vs yesterday
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interactive Map */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Global Activity Map
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600">
                  <Radio className="w-3 h-3 mr-1" />
                  Live
                </Badge>
                <Button variant="ghost" size="sm">
                  <Layers className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Map Container - would integrate with actual map library */}
            <div className="relative h-96 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-dashed border-blue-200 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <p className="text-blue-600 font-medium">Interactive World Map</p>
                <p className="text-sm text-blue-500 mt-1">
                  Real-time user locations and facility status
                </p>
                <p className="text-xs text-blue-400 mt-2">
                  Would integrate with Google Maps/Mapbox
                </p>
              </div>
              
              {/* Mock map markers */}
              <div className="absolute top-1/4 left-1/3">
                <div className="relative">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute -top-8 -left-6 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
                    SF: 1 user
                  </div>
                </div>
              </div>
              
              <div className="absolute top-1/3 right-1/3">
                <div className="relative">
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="absolute -top-8 -left-8 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
                    Austin: 1 user
                  </div>
                </div>
              </div>
              
              <div className="absolute top-1/5 right-1/4">
                <div className="relative">
                  <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                  <div className="absolute -top-8 -left-10 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
                    Amsterdam: 1 user
                  </div>
                </div>
              </div>
            </div>
            
            {/* Map Legend */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Enterprise Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Professional Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Academic Users</span>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Fullscreen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Users List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Active Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredUsers.map((user) => {
                const activity = getActivityStatus(user.session.lastActiveAt)
                
                return (
                  <div
                    key={user.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">{user.user.name}</h4>
                          <Badge className={getTierColor(user.user.subscriptionTier)} variant="outline">
                            {user.user.subscriptionTier}
                          </Badge>
                          {user.session.isActive && (
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <Wifi className="w-3 h-3 text-green-600 ml-1" />
                            </div>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {user.session.location ? 
                              `${user.session.location.city}, ${user.session.location.country}` : 
                              'Location unknown'
                            }
                          </p>
                          
                          <p className="flex items-center gap-2">
                            {getDeviceIcon(user.session.device.type)}
                            {user.session.device.os} • {user.session.device.browser}
                          </p>
                          
                          <p className="flex items-center gap-2">
                            <Activity className="w-3 h-3" />
                            {user.activity.currentPage}
                          </p>
                          
                          {user.facility && (
                            <p className="flex items-center gap-2">
                              <Building className="w-3 h-3" />
                              {user.facility.name} ({user.facility.size.toLocaleString()} sq ft)
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-xs font-medium ${activity.color}`}>
                          {activity.text}
                        </p>
                        {user.activity.energySavings > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            ${user.activity.energySavings} saved
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <Signal className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {user.activity.actions} actions
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Facility Status Grid */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Facility Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((facility) => (
              <div
                key={facility.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{facility.name}</h4>
                  <Badge 
                    variant={facility.status === 'active' ? 'default' : 
                            facility.status === 'warning' ? 'destructive' : 'secondary'}
                  >
                    {facility.status}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current Power:</span>
                    <span className="font-medium">{facility.energyStatus.currentKW} kW</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Daily Savings:</span>
                    <span className="font-medium text-green-600">
                      ${facility.energyStatus.savings}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active Users:</span>
                    <span className="font-medium">{facility.users.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Optimization:</span>
                    <div className="flex items-center gap-1">
                      {facility.energyStatus.optimizing ? (
                        <>
                          <Zap className="w-3 h-3 text-green-600" />
                          <span className="text-green-600 text-xs">Active</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 text-yellow-600" />
                          <span className="text-yellow-600 text-xs">Paused</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">User Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{selectedUser.user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedUser.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <p className="text-gray-900">{selectedUser.user.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Subscription</label>
                  <Badge className={getTierColor(selectedUser.user.subscriptionTier)}>
                    {selectedUser.user.subscriptionTier}
                  </Badge>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Session Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-700">IP Address</label>
                    <p>{selectedUser.session.ipAddress}</p>
                  </div>
                  <div>
                    <label className="text-gray-700">Device</label>
                    <p>{selectedUser.session.device.type} - {selectedUser.session.device.os}</p>
                  </div>
                  <div>
                    <label className="text-gray-700">Browser</label>
                    <p>{selectedUser.session.device.browser}</p>
                  </div>
                  <div>
                    <label className="text-gray-700">Location</label>
                    <p>
                      {selectedUser.session.location ? 
                        `${selectedUser.session.location.city}, ${selectedUser.session.location.region}` :
                        'Unknown'
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Activity Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="text-gray-700">Current Page</label>
                    <p>{selectedUser.activity.currentPage}</p>
                  </div>
                  <div>
                    <label className="text-gray-700">Actions Today</label>
                    <p>{selectedUser.activity.actions}</p>
                  </div>
                  <div>
                    <label className="text-gray-700">Energy Savings</label>
                    <p className="text-green-600">${selectedUser.activity.energySavings}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}