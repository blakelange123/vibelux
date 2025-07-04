'use client';

import { useState } from 'react';
import { 
  MapPin, MessageSquare, AlertTriangle, Shield, QrCode,
  Radio, Package, Users, Activity, CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default function TrackingDemoPage() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const features = [
    {
      id: 'qr-tracking',
      title: 'QR Code Tracking',
      icon: QrCode,
      description: 'Generate and scan QR codes for containers, inventory, and assets',
      benefits: [
        'Instant QR code generation',
        'Batch printing capabilities',
        'Mobile scanning support',
        'Movement history tracking'
      ]
    },
    {
      id: 'real-time',
      title: 'Real-Time Location',
      icon: MapPin,
      description: 'Track workers and assets in real-time without mesh networks',
      benefits: [
        'GPS-based tracking',
        'No infrastructure needed',
        'Works on any smartphone',
        'Live location sharing'
      ]
    },
    {
      id: 'messaging',
      title: 'Instant Messaging',
      icon: MessageSquare,
      description: 'Send messages and alerts to workers instantly',
      benefits: [
        'Broadcast messages',
        'Direct messaging',
        'Priority alerts',
        'Task assignments'
      ]
    },
    {
      id: 'sos-alerts',
      title: 'SOS & Safety Alerts',
      icon: AlertTriangle,
      description: 'Emergency alerts and safety notifications',
      benefits: [
        'One-touch SOS button',
        'Automatic location sharing',
        'Nearby worker alerts',
        'Push notifications'
      ]
    },
    {
      id: 'geofencing',
      title: 'Geofencing',
      icon: Shield,
      description: 'Create virtual boundaries for safety and security',
      benefits: [
        'Entry/exit alerts',
        'Restricted zones',
        'Safety perimeters',
        'Time-based rules'
      ]
    },
    {
      id: 'ble-ready',
      title: 'BLE Mesh Ready',
      icon: Radio,
      description: 'Upgrade to BLE mesh when needed',
      benefits: [
        'Indoor positioning',
        'Phone as beacon',
        'Atrius compatible',
        'Edge computing'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Asset & Labor Tracking Demo
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Complete tracking solution that works with or without mesh networks. 
            Start with GPS and upgrade to BLE mesh anytime.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="bg-gray-900/50 rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
                onClick={() => setActiveDemo(feature.id)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                </div>
                
                <p className="text-gray-400 mb-4">{feature.description}</p>
                
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Demo Scenarios */}
        <div className="bg-gray-900/50 rounded-xl p-8 border border-white/10 mb-12">
          <h2 className="text-2xl font-bold mb-6">Try It Now</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                Container Tracking Scenario
              </h3>
              <p className="text-gray-400 mb-4">
                Track a container from loading dock to storage area using QR codes and real-time updates.
              </p>
              <ol className="space-y-2 text-sm text-gray-300 mb-4">
                <li>1. Generate QR code for container</li>
                <li>2. Scan at each location</li>
                <li>3. View movement history</li>
                <li>4. Get alerts on delays</li>
              </ol>
              <Link
                href="/tracking?demo=container"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Demo
              </Link>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                Worker Safety Scenario
              </h3>
              <p className="text-gray-400 mb-4">
                Monitor worker locations, send alerts, and ensure safety compliance in real-time.
              </p>
              <ol className="space-y-2 text-sm text-gray-300 mb-4">
                <li>1. Enable real-time tracking</li>
                <li>2. Create safety zones</li>
                <li>3. Test SOS alerts</li>
                <li>4. Send task assignments</li>
              </ol>
              <Link
                href="/tracking?demo=safety"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Demo
              </Link>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-8 border border-purple-500/20">
          <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">1</span>
              </div>
              <h3 className="font-semibold mb-2">Start Simple</h3>
              <p className="text-sm text-gray-400">
                Begin with QR codes and smartphone GPS. No infrastructure investment needed.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">2</span>
              </div>
              <h3 className="font-semibold mb-2">Track Everything</h3>
              <p className="text-sm text-gray-400">
                Monitor assets, workers, and movements in real-time with instant alerts.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">3</span>
              </div>
              <h3 className="font-semibold mb-2">Scale When Ready</h3>
              <p className="text-sm text-gray-400">
                Upgrade to BLE mesh for indoor precision when your needs grow.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/tracking"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-300 font-semibold text-lg"
          >
            <Activity className="w-5 h-5" />
            Launch Full Tracking System
          </Link>
          
          <p className="text-sm text-gray-400 mt-4">
            No credit card required • Works immediately • Upgrade anytime
          </p>
        </div>
      </div>
    </div>
  );
}