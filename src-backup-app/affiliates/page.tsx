/**
 * Affiliate Program Page
 * Dashboard and link management for affiliates
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { 
  Link as LinkIcon, 
  Copy, 
  Eye, 
  BarChart3, 
  DollarSign, 
  TrendingUp,
  Plus,
  Settings,
  Share2,
  Calendar,
  ExternalLink,
  Download
} from 'lucide-react'

interface AffiliateLink {
  id: string
  shortCode: string
  originalUrl: string
  affiliateUrl: string
  customAlias?: string
  campaign?: string
  source?: string
  medium?: string
  isActive: boolean
  expiresAt?: string
  stats: {
    clicks: number
    uniqueClicks: number
    conversions: number
    revenue: number
  }
  createdAt: string
}

interface AffiliateDashboard {
  affiliate: {
    id: string
    code: string
    status: string
    commissionRate: number
    cookieDuration: number
  }
  metrics: {
    totalClicks: number
    totalConversions: number
    conversionRate: number
    totalRevenue: number
    pendingCommissions: number
    approvedCommissions: number
  }
}

export default function AffiliatesPage() {
  const { isLoaded, isSignedIn, user } = useAuth()
  const [dashboard, setDashboard] = useState<AffiliateDashboard | null>(null)
  const [links, setLinks] = useState<AffiliateLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newLink, setNewLink] = useState({
    url: '',
    campaign: '',
    source: '',
    medium: '',
    customAlias: '',
    title: '',
    description: ''
  })

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadDashboard()
      loadLinks()
    }
  }, [isLoaded, isSignedIn])

  const loadDashboard = async () => {
    try {
      const response = await fetch('/api/affiliates/dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboard(data)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    }
  }

  const loadLinks = async () => {
    try {
      const response = await fetch('/api/affiliates/links')
      if (response.ok) {
        const data = await response.json()
        setLinks(data.links)
      }
    } catch (error) {
      console.error('Error loading links:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createLink = async () => {
    try {
      const response = await fetch('/api/affiliates/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newLink)
      })

      if (response.ok) {
        const data = await response.json()
        setLinks(prev => [data.link, ...prev])
        setNewLink({
          url: '',
          campaign: '',
          source: '',
          medium: '',
          customAlias: '',
          title: '',
          description: ''
        })
        setShowCreateForm(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create link')
      }
    } catch (error) {
      console.error('Error creating link:', error)
      alert('Failed to create link')
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Show success message
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sign In Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to access the affiliate program.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Affiliate Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your affiliate links and track your performance
          </p>
        </div>

        {/* Dashboard Stats */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Clicks
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboard.metrics.totalClicks.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Conversions
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboard.metrics.totalConversions}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Conversion Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboard.metrics.conversionRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Earnings
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(dashboard.metrics.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Affiliate Info */}
        {dashboard && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Your Affiliate Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Affiliate Code
                </label>
                <div className="flex items-center mt-1">
                  <code className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded font-mono text-sm">
                    {dashboard.affiliate.code}
                  </code>
                  <button
                    onClick={() => copyToClipboard(dashboard.affiliate.code)}
                    className="ml-2 p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Commission Rate
                </label>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {dashboard.affiliate.commissionRate}%
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Cookie Duration
                </label>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {dashboard.affiliate.cookieDuration} days
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Create Link Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Create New Affiliate Link
            </h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              <Plus size={16} />
              <span>New Link</span>
            </button>
          </div>

          {showCreateForm && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target URL *
                  </label>
                  <input
                    type="url"
                    value={newLink.url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://vibelux.app/products/..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Custom Alias (optional)
                  </label>
                  <input
                    type="text"
                    value={newLink.customAlias}
                    onChange={(e) => setNewLink(prev => ({ ...prev, customAlias: e.target.value }))}
                    placeholder="my-custom-link"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Campaign
                  </label>
                  <input
                    type="text"
                    value={newLink.campaign}
                    onChange={(e) => setNewLink(prev => ({ ...prev, campaign: e.target.value }))}
                    placeholder="summer-sale"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Source
                  </label>
                  <input
                    type="text"
                    value={newLink.source}
                    onChange={(e) => setNewLink(prev => ({ ...prev, source: e.target.value }))}
                    placeholder="instagram"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Medium
                  </label>
                  <input
                    type="text"
                    value={newLink.medium}
                    onChange={(e) => setNewLink(prev => ({ ...prev, medium: e.target.value }))}
                    placeholder="social"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={createLink}
                  disabled={!newLink.url}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg"
                >
                  Create Link
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Links Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Affiliate Links
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : links.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No affiliate links created yet. Create your first link above!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Link
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Conversions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {links.map((link) => (
                    <tr key={link.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {link.customAlias || link.shortCode}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                            vibelux.app/go/{link.shortCode}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {link.campaign || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {link.stats.clicks}
                          <span className="text-gray-500 dark:text-gray-400 ml-1">
                            ({link.stats.uniqueClicks} unique)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {link.stats.conversions}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formatCurrency(link.stats.revenue)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(link.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyToClipboard(link.affiliateUrl)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Copy link"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => window.open(link.affiliateUrl, '_blank')}
                            className="text-gray-600 hover:text-gray-700"
                            title="Open link"
                          >
                            <ExternalLink size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}