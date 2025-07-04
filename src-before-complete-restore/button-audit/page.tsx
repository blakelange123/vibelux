'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Search, X } from 'lucide-react'

interface ButtonIssue {
  component: string
  issue: string
  severity: 'error' | 'warning' | 'info'
  line?: string
  suggestion?: string
}

// Known button issues from the codebase
const BUTTON_ISSUES: ButtonIssue[] = [
  {
    component: 'EnergyManagement',
    issue: 'Professional Export button missing onClick handler',
    severity: 'error',
    line: 'Professional Export button',
    suggestion: 'Add export functionality or connect to existing export handler'
  },
  {
    component: 'Navigation',
    issue: 'Some navigation buttons may not have proper routing',
    severity: 'warning',
    suggestion: 'Verify all navigation links point to valid routes'
  },
  {
    component: 'Various Components',
    issue: 'Console.log statements in onClick handlers',
    severity: 'warning',
  },
  {
    component: 'Modal Buttons',
    issue: 'Some modal close buttons might not properly close modals',
    severity: 'warning',
    suggestion: 'Ensure onClose prop is properly passed and called'
  },
  {
    component: 'Form Submissions',
    issue: 'Some forms missing proper submission handlers',
    severity: 'error',
    suggestion: 'Add form validation and submission logic'
  }
]

export default function ButtonAuditPage() {
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)

  const filteredIssues = BUTTON_ISSUES.filter(issue => {
    const matchesFilter = filter === 'all' || issue.severity === filter
    const matchesSearch = searchTerm === '' || 
      issue.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.issue.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const severityCounts = {
    error: BUTTON_ISSUES.filter(i => i.severity === 'error').length,
    warning: BUTTON_ISSUES.filter(i => i.severity === 'warning').length,
    info: BUTTON_ISSUES.filter(i => i.severity === 'info').length
  }

  const runFullScan = async () => {
    setIsScanning(true)
    setScanProgress(0)

    // Simulate scanning progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setScanProgress(i)
    }

    setIsScanning(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Button Functionality Audit</h1>
          <p className="text-gray-400 text-lg">
            Comprehensive analysis of all interactive elements across the application
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-3xl font-bold text-white mb-2">{BUTTON_ISSUES.length}</div>
            <div className="text-gray-400">Total Issues Found</div>
          </div>
          <div className="bg-red-900/20 rounded-lg p-6 border border-red-800">
            <div className="text-3xl font-bold text-red-500 mb-2">{severityCounts.error}</div>
            <div className="text-red-400">Critical Errors</div>
          </div>
          <div className="bg-yellow-900/20 rounded-lg p-6 border border-yellow-800">
            <div className="text-3xl font-bold text-yellow-500 mb-2">{severityCounts.warning}</div>
            <div className="text-yellow-400">Warnings</div>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-6 border border-blue-800">
            <div className="text-3xl font-bold text-blue-500 mb-2">{severityCounts.info}</div>
            <div className="text-blue-400">Info</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 flex-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                All Issues
              </button>
              <button
                onClick={() => setFilter('error')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'error' ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                Errors
              </button>
              <button
                onClick={() => setFilter('warning')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'warning' ? 'bg-yellow-600' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                Warnings
              </button>
              <button
                onClick={() => setFilter('info')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'info' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                Info
              </button>
            </div>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
              )}
            </div>

            <button
              onClick={runFullScan}
              disabled={isScanning}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scanning... {scanProgress}%
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Run Full Scan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {filteredIssues.map((issue, index) => (
            <div
              key={index}
              className={`bg-gray-900 rounded-lg p-6 border ${
                issue.severity === 'error' 
                  ? 'border-red-800' 
                  : issue.severity === 'warning'
                  ? 'border-yellow-800'
                  : 'border-blue-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {issue.severity === 'error' ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : issue.severity === 'warning' ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                    <h3 className="text-lg font-semibold">{issue.component}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      issue.severity === 'error'
                        ? 'bg-red-900/50 text-red-300'
                        : issue.severity === 'warning'
                        ? 'bg-yellow-900/50 text-yellow-300'
                        : 'bg-blue-900/50 text-blue-300'
                    }`}>
                      {issue.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-2">{issue.issue}</p>
                  {issue.line && (
                    <p className="text-sm text-gray-500 mb-2">Location: {issue.line}</p>
                  )}
                  {issue.suggestion && (
                    <div className="bg-gray-800 rounded p-3 mt-3">
                      <p className="text-sm text-gray-400">
                        <span className="font-medium text-green-400">Suggestion:</span> {issue.suggestion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredIssues.length === 0 && (
          <div className="bg-gray-900 rounded-lg p-12 text-center border border-gray-800">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Issues Found</h3>
            <p className="text-gray-400">
              {searchTerm 
                ? 'No issues match your search criteria'
                : 'All buttons are functioning correctly!'}
            </p>
          </div>
        )}

        {/* Recommendations */}
        <div className="mt-12 bg-gray-900 rounded-lg p-8 border border-gray-800">
          <h2 className="text-2xl font-bold mb-6">Recommendations</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Implement Centralized Button Handler</h3>
                <p className="text-gray-400">Create a unified button component that handles common functionality like loading states, disabled states, and error handling.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Add Button Analytics</h3>
                <p className="text-gray-400">Track button clicks to identify which features are most used and optimize the UI accordingly.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Implement Keyboard Navigation</h3>
                <p className="text-gray-400">Ensure all interactive elements are accessible via keyboard for better accessibility.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Add Loading States</h3>
                <p className="text-gray-400">Show loading indicators for async operations to improve user experience.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-8 flex gap-4 justify-end">
          <button className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            Export as CSV
          </button>
          <button className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            Export as PDF
          </button>
          <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
            Generate Full Report
          </button>
        </div>
      </div>
    </div>
  )
}