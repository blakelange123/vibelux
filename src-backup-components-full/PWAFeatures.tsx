"use client"

import { useState, useEffect } from 'react'
import { 
  Smartphone, 
  Download, 
  Bell, 
  Home,
  Share2,
  Zap,
  WifiOff,
  Camera,
  Mic,
  MapPin,
  Shield,
  Battery,
  RefreshCw,
  Check,
  X,
  Info,
  Chrome,
  Monitor,
  Apple,
  Settings,
  Vibrate,
  Activity,
  ChevronRight
} from 'lucide-react'

interface PWAFeature {
  id: string
  name: string
  description: string
  icon: React.FC<any>
  enabled: boolean
  supported: boolean
  permission?: 'granted' | 'denied' | 'prompt'
}

interface InstallPrompt {
  platform: 'iOS' | 'Android' | 'Desktop'
  instructions: string[]
}

export function PWAFeatures() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null)
  const [showInstallInstructions, setShowInstallInstructions] = useState(false)
  const [platform, setPlatform] = useState<'iOS' | 'Android' | 'Desktop'>('Desktop')
  
  const [features, setFeatures] = useState<PWAFeature[]>([
    {
      id: 'offline',
      name: 'Offline Access',
      description: 'Use the app without internet connection',
      icon: WifiOff,
      enabled: true,
      supported: true
    },
    {
      id: 'push-notifications',
      name: 'Push Notifications',
      description: 'Get alerts for important updates',
      icon: Bell,
      enabled: false,
      supported: true,
      permission: 'prompt'
    },
    {
      id: 'camera',
      name: 'Camera Access',
      description: 'Take photos directly in the app',
      icon: Camera,
      enabled: false,
      supported: true,
      permission: 'prompt'
    },
    {
      id: 'geolocation',
      name: 'Location Services',
      description: 'Get location-based recommendations',
      icon: MapPin,
      enabled: false,
      supported: true,
      permission: 'prompt'
    },
    {
      id: 'microphone',
      name: 'Voice Commands',
      description: 'Use voice to control the app',
      icon: Mic,
      enabled: false,
      supported: true,
      permission: 'prompt'
    },
    {
      id: 'vibration',
      name: 'Haptic Feedback',
      description: 'Feel vibrations for important alerts',
      icon: Vibrate,
      enabled: true,
      supported: 'vibrate' in navigator
    },
    {
      id: 'share',
      name: 'Native Sharing',
      description: 'Share content using device share menu',
      icon: Share2,
      enabled: true,
      supported: 'share' in navigator
    },
    {
      id: 'home-screen',
      name: 'Add to Home Screen',
      description: 'Quick access from your home screen',
      icon: Home,
      enabled: true,
      supported: true
    }
  ])

  const [appMetrics, setAppMetrics] = useState({
    cacheSize: '45.2 MB',
    lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    version: '2.3.1',
    serviceWorkerStatus: 'active'
  })

  useEffect(() => {
    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('iOS')
    } else if (/android/.test(userAgent)) {
      setPlatform('Android')
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPromptEvent(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt()
      const { outcome } = await installPromptEvent.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
      }
      setInstallPromptEvent(null)
    } else {
      setShowInstallInstructions(true)
    }
  }

  const requestPermission = async (featureId: string) => {
    const feature = features.find(f => f.id === featureId)
    if (!feature || feature.permission === 'granted') return

    let permission: PermissionState = 'prompt'

    switch (featureId) {
      case 'push-notifications':
        const notificationPermission = await Notification.requestPermission()
        permission = notificationPermission as PermissionState
        break
      case 'camera':
        try {
          await navigator.mediaDevices.getUserMedia({ video: true })
          permission = 'granted'
        } catch {
          permission = 'denied'
        }
        break
      case 'geolocation':
        try {
          await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject)
          })
          permission = 'granted'
        } catch {
          permission = 'denied'
        }
        break
      case 'microphone':
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true })
          permission = 'granted'
        } catch {
          permission = 'denied'
        }
        break
    }

    setFeatures(prev => prev.map(f => 
      f.id === featureId ? { ...f, permission, enabled: permission === 'granted' } : f
    ))
  }

  const getInstallInstructions = (): InstallPrompt => {
    switch (platform) {
      case 'iOS':
        return {
          platform: 'iOS',
          instructions: [
            'Tap the Share button in Safari',
            'Scroll down and tap "Add to Home Screen"',
            'Tap "Add" in the top right corner',
            'The app will now appear on your home screen'
          ]
        }
      case 'Android':
        return {
          platform: 'Android',
          instructions: [
            'Tap the menu button (3 dots) in Chrome',
            'Select "Add to Home Screen"',
            'Enter a name for the app',
            'Tap "Add" to install'
          ]
        }
      default:
        return {
          platform: 'Desktop',
          instructions: [
            'Look for the install icon in the address bar',
            'Click the install button',
            'Follow the prompts to install',
            'The app will open in its own window'
          ]
        }
    }
  }

  const getPlatformIcon = () => {
    switch (platform) {
      case 'iOS': return <Apple className="w-5 h-5" />
      case 'Android': return <Chrome className="w-5 h-5" />
      default: return <Monitor className="w-5 h-5" />
    }
  }

  const getFeatureStatus = (feature: PWAFeature) => {
    if (!feature.supported) return { icon: <X className="w-4 h-4" />, color: 'text-gray-400' }
    if (feature.permission === 'denied') return { icon: <X className="w-4 h-4" />, color: 'text-red-600' }
    if (feature.permission === 'granted' || feature.enabled) return { icon: <Check className="w-4 h-4" />, color: 'text-green-600' }
    return { icon: <Info className="w-4 h-4" />, color: 'text-yellow-600' }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Progressive Web App</h2>
        </div>
        <div className="flex items-center gap-2">
          {getPlatformIcon()}
          <span className="text-sm text-gray-600 dark:text-gray-400">{platform}</span>
        </div>
      </div>

      {/* Install Status */}
      <div className="mb-8">
        {isInstalled ? (
          <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  App Installed
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Vibelux is installed and ready to use offline
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-800 rounded-full">
                  <Download className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200">
                    Install Vibelux App
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Get the full app experience with offline access
                  </p>
                </div>
              </div>
              <button
                onClick={handleInstall}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Install Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PWA Features */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">App Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map(feature => {
            const status = getFeatureStatus(feature)
            return (
              <div
                key={feature.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <feature.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <h4 className="font-medium">{feature.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 ${status.color}`}>
                    {status.icon}
                  </div>
                </div>
                
                {feature.permission === 'prompt' && feature.supported && (
                  <button
                    onClick={() => requestPermission(feature.id)}
                    className="mt-3 w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                  >
                    Enable {feature.name}
                  </button>
                )}
                
                {feature.permission === 'denied' && (
                  <p className="mt-3 text-xs text-red-600">
                    Permission denied. Please enable in browser settings.
                  </p>
                )}
                
                {!feature.supported && (
                  <p className="mt-3 text-xs text-gray-500">
                    Not supported on this device
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* App Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Download className="w-5 h-5 text-indigo-600 mb-2" />
          <p className="text-lg font-semibold">{appMetrics.cacheSize}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Cache Size</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <RefreshCw className="w-5 h-5 text-green-600 mb-2" />
          <p className="text-lg font-semibold">
            {Math.floor((Date.now() - appMetrics.lastUpdate.getTime()) / (1000 * 60 * 60 * 24))}d ago
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Last Update</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Zap className="w-5 h-5 text-yellow-600 mb-2" />
          <p className="text-lg font-semibold">v{appMetrics.version}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">App Version</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Activity className="w-5 h-5 text-blue-600 mb-2" />
          <p className="text-lg font-semibold capitalize">{appMetrics.serviceWorkerStatus}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Service Worker</p>
        </div>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 border rounded-lg">
          <Zap className="w-8 h-8 text-yellow-600 mb-3" />
          <h4 className="font-semibold mb-2">Lightning Fast</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Instant loading with intelligent caching and background sync
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <WifiOff className="w-8 h-8 text-blue-600 mb-3" />
          <h4 className="font-semibold mb-2">Works Offline</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Full functionality even without internet connection
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <Shield className="w-8 h-8 text-green-600 mb-3" />
          <h4 className="font-semibold mb-2">Secure & Private</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            HTTPS required with encrypted local storage
          </p>
        </div>
      </div>

      {/* App Settings */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">App Settings</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <span>Notification Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
            <div className="flex items-center gap-3">
              <Battery className="w-5 h-5 text-gray-600" />
              <span>Battery Optimization</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-gray-600" />
              <span>Update Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-600" />
              <span>Advanced Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Install Instructions Modal */}
      {showInstallInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Install on {platform}
            </h3>
            <ol className="space-y-3">
              {getInstallInstructions().instructions.map((instruction, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-sm font-semibold text-indigo-600">
                    {idx + 1}
                  </span>
                  <span className="text-sm">{instruction}</span>
                </li>
              ))}
            </ol>
            <button
              onClick={() => setShowInstallInstructions(false)}
              className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}