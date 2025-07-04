"use client"

import { useState } from 'react'
import {
  FileText,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  Clock,
  Tag,
  Search,
  Filter,
  Plus,
  ChevronUp
} from 'lucide-react'

interface FeatureRequest {
  id: string
  title: string
  description: string
  category: string
  status: 'pending' | 'in-review' | 'planned' | 'in-progress' | 'completed'
  votes: number
  comments: number
  createdAt: Date
  author: string
  tags: string[]
}

export default function FeaturesPage() {
  const [features] = useState<FeatureRequest[]>([
    {
      id: '1',
      title: 'Mobile App for Remote Monitoring',
      description: 'Native mobile app to monitor and control grow lights remotely',
      category: 'Mobile',
      status: 'planned',
      votes: 87,
      comments: 23,
      createdAt: new Date('2024-01-15'),
      author: 'John Grower',
      tags: ['mobile', 'monitoring', 'remote-control']
    },
    {
      id: '2',
      title: 'Weather Integration for DLI Adjustments',
      description: 'Automatically adjust supplemental lighting based on weather forecasts',
      category: 'Integration',
      status: 'in-review',
      votes: 64,
      comments: 15,
      createdAt: new Date('2024-01-20'),
      author: 'Sarah Farm',
      tags: ['weather', 'automation', 'DLI']
    },
    {
      id: '3',
      title: 'Pest Detection AI',
      description: 'Use computer vision to detect pests and diseases early',
      category: 'AI/ML',
      status: 'pending',
      votes: 102,
      comments: 31,
      createdAt: new Date('2024-01-22'),
      author: 'Mike Tech',
      tags: ['AI', 'pest-management', 'computer-vision']
    }
  ])

  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('votes')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10'
      case 'in-progress': return 'text-blue-400 bg-blue-400/10'
      case 'planned': return 'text-purple-400 bg-purple-400/10'
      case 'in-review': return 'text-yellow-400 bg-yellow-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Feature Requests</h1>
          <p className="text-gray-400">Vote and comment on features you'd like to see</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Request Feature
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search features..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-review">In Review</option>
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
          >
            <option value="votes">Most Voted</option>
            <option value="recent">Most Recent</option>
            <option value="comments">Most Discussed</option>
          </select>
        </div>
      </div>

      {/* Feature List */}
      <div className="space-y-4">
        {features.map(feature => (
          <div key={feature.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-100">{feature.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(feature.status)}`}>
                    {feature.status.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-gray-400 mb-4">{feature.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{feature.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Tag className="w-4 h-4" />
                    <span>{feature.category}</span>
                  </div>
                  <div className="flex gap-2">
                    {feature.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3">
                <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-700 rounded-lg transition-colors">
                  <ChevronUp className="w-5 h-5 text-purple-400" />
                  <span className="text-lg font-semibold text-gray-100">{feature.votes}</span>
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MessageSquare className="w-4 h-4" />
                  <span>{feature.comments}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}