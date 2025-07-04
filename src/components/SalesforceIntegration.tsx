"use client"

import { useState } from 'react'
import { 
  Cloud, 
  Send, 
  Search, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  X,
  Link,
  Building
} from 'lucide-react'

interface SalesforceIntegrationProps {
  data: any
  reportId?: string
  onClose?: () => void
}

export function SalesforceIntegration({ data, reportId, onClose }: SalesforceIntegrationProps) {
  const [opportunityId, setOpportunityId] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const searchOpportunities = async (query: string) => {
    if (!query) return

    setIsSearching(true)
    try {
      // In production, this would search Salesforce
      // For now, mock search results
      const mockResults = [
        { Id: '0061234567890ABC', Name: 'Indoor Farm Expansion - Phase 2', Account: 'Green Acres Farm', Amount: 250000 },
        { Id: '0061234567890DEF', Name: 'Greenhouse Lighting Upgrade', Account: 'Sunshine Gardens', Amount: 180000 },
        { Id: '0061234567890GHI', Name: 'Vertical Farm Implementation', Account: 'Urban Harvest Co', Amount: 420000 }
      ].filter(opp => 
        opp.Name.toLowerCase().includes(query.toLowerCase()) ||
        opp.Account.toLowerCase().includes(query.toLowerCase())
      )

      setSearchResults(mockResults)
    } catch (error) {
      console.error('Search error:', error)
      setStatus({
        type: 'error',
        message: 'Failed to search opportunities'
      })
    } finally {
      setIsSearching(false)
    }
  }

  const pushToSalesforce = async () => {
    if (!opportunityId) {
      setStatus({
        type: 'error',
        message: 'Please select or enter an opportunity ID'
      })
      return
    }

    setIsSending(true)
    setStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/salesforce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opportunityId,
          data: {
            ...data,
            reportId
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Successfully updated Salesforce opportunity!'
        })
        
        // Clear form after success
        setTimeout(() => {
          setOpportunityId('')
          setSearchResults([])
          if (onClose) onClose()
        }, 2000)
      } else {
        setStatus({
          type: 'error',
          message: result.error || 'Failed to update Salesforce'
        })
      }
    } catch (error) {
      console.error('Push error:', error)
      setStatus({
        type: 'error',
        message: 'Network error. Please try again.'
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-900/30 rounded-lg">
            <Cloud className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Salesforce Integration</h3>
            <p className="text-sm text-gray-400">Push analysis data to opportunity</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search Section */}
      <div className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Search Opportunities
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or account..."
              onChange={(e) => searchOpportunities(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
            {isSearching && (
              <Loader2 className="absolute right-3 top-2.5 w-5 h-5 text-blue-400 animate-spin" />
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-2 max-h-48 overflow-y-auto">
            {searchResults.map(opp => (
              <button
                key={opp.Id}
                onClick={() => {
                  setOpportunityId(opp.Id)
                  setSearchResults([])
                }}
                className="w-full text-left p-3 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white">{opp.Name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-400">{opp.Account}</span>
                    </div>
                  </div>
                  <span className="text-sm text-green-400">${(opp.Amount / 1000).toFixed(0)}k</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Direct Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Or Enter Opportunity ID
          </label>
          <input
            type="text"
            value={opportunityId}
            onChange={(e) => setOpportunityId(e.target.value)}
            placeholder="0061234567890ABC"
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Data Preview */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Data to Push</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {data.energySavings && (
              <div>
                <span className="text-gray-500">Energy Savings:</span>
                <span className="text-white ml-2">{data.energySavings}%</span>
              </div>
            )}
            {data.roiPercentage && (
              <div>
                <span className="text-gray-500">ROI:</span>
                <span className="text-white ml-2">{data.roiPercentage}%</span>
              </div>
            )}
            {data.fixtureCount && (
              <div>
                <span className="text-gray-500">Fixtures:</span>
                <span className="text-white ml-2">{data.fixtureCount}</span>
              </div>
            )}
            {data.coverageArea && (
              <div>
                <span className="text-gray-500">Coverage:</span>
                <span className="text-white ml-2">{data.coverageArea} sq ft</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Message */}
        {status.type && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            status.type === 'success' 
              ? 'bg-green-900/30 text-green-400 border border-green-800' 
              : 'bg-red-900/30 text-red-400 border border-red-800'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm">{status.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={pushToSalesforce}
            disabled={!opportunityId || isSending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Push to Salesforce
              </>
            )}
          </button>
          
          {opportunityId && (
            <a
              href={`https://your-instance.salesforce.com/${opportunityId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Link className="w-5 h-5" />
              View in SF
            </a>
          )}
        </div>
      </div>
    </div>
  )
}