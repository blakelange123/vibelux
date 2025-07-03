"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ImportExportSettings } from '@/components/ImportExportSettings'
import { WhiteLabelSettings } from '@/components/WhiteLabelSettings'
import { AIAssistantSettings } from '@/components/AIAssistantSettings'
import { SecuritySettings } from '@/components/settings/SecuritySettings'
import { NotificationSettings } from '@/components/settings/NotificationSettings'
import { TeamSettings } from '@/components/settings/TeamSettings'
import { BillingSettings } from '@/components/settings/BillingSettings'
import { Database, Palette, Shield, Bell, Users, CreditCard, Sparkles, Monitor } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('import-export')
  
  const tabs = [
    { id: 'import-export', label: 'Import/Export', icon: Database },
    { id: 'white-label', label: 'White Label', icon: Palette },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800">
          {activeTab === 'import-export' && <ImportExportSettings />}
          {activeTab === 'white-label' && <WhiteLabelSettings />}
          {activeTab === 'ai-assistant' && <AIAssistantSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'team' && <TeamSettings />}
          {activeTab === 'billing' && <BillingSettings />}
        </div>
      </div>
    </div>
  )
}