"use client"

import { useState } from 'react'
import {
  BookOpen,
  Search,
  ChevronRight,
  Star,
  Clock,
  User,
  Download,
  ExternalLink,
  FileText,
  Video,
  Code,
  Lightbulb,
  Settings,
  Zap,
  Calculator,
  BarChart3,
  Building2,
  Leaf
} from 'lucide-react'

interface DocSection {
  id: string
  title: string
  description: string
  icon: React.ElementType
  articles: DocArticle[]
}

interface DocArticle {
  id: string
  title: string
  description: string
  type: 'guide' | 'tutorial' | 'reference' | 'video'
  readTime: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  lastUpdated: string
  popular: boolean
}

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSection, setSelectedSection] = useState<string>('getting-started')

  const docSections: DocSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of Vibelux',
      icon: Lightbulb,
      articles: [
        {
          id: 'quick-start',
          title: 'Quick Start Guide',
          description: 'Get up and running with Vibelux in 5 minutes',
          type: 'guide',
          readTime: '5 min',
          difficulty: 'beginner',
          lastUpdated: '2024-03-15',
          popular: true
        },
        {
          id: 'first-design',
          title: 'Creating Your First Design',
          description: 'Step-by-step tutorial for your first lighting design',
          type: 'tutorial',
          readTime: '15 min',
          difficulty: 'beginner',
          lastUpdated: '2024-03-10',
          popular: true
        },
        {
          id: 'interface-overview',
          title: 'Interface Overview',
          description: 'Understanding the Vibelux interface and navigation',
          type: 'guide',
          readTime: '8 min',
          difficulty: 'beginner',
          lastUpdated: '2024-03-12',
          popular: false
        }
      ]
    },
    {
      id: 'design-tools',
      title: 'Design Tools',
      description: 'Master the design and modeling features',
      icon: Settings,
      articles: [
        {
          id: 'advanced-designer',
          title: 'Advanced Designer',
          description: 'Using the CAD-like design environment',
          type: 'guide',
          readTime: '20 min',
          difficulty: 'intermediate',
          lastUpdated: '2024-03-08',
          popular: true
        },
        {
          id: 'spectrum-builder',
          title: 'Spectrum Builder',
          description: 'Creating custom light spectra for your crops',
          type: 'tutorial',
          readTime: '12 min',
          difficulty: 'intermediate',
          lastUpdated: '2024-03-05',
          popular: false
        },
        {
          id: 'light-recipes',
          title: 'Light Recipes',
          description: 'Pre-built lighting configurations for common crops',
          type: 'reference',
          readTime: '6 min',
          difficulty: 'beginner',
          lastUpdated: '2024-03-14',
          popular: true
        }
      ]
    },
    {
      id: 'calculators',
      title: 'Calculators',
      description: 'ROI, energy, and optimization calculators',
      icon: Calculator,
      articles: [
        {
          id: 'roi-calculator',
          title: 'ROI Calculator Guide',
          description: 'Calculate return on investment for lighting upgrades',
          type: 'guide',
          readTime: '10 min',
          difficulty: 'intermediate',
          lastUpdated: '2024-03-11',
          popular: true
        },
        {
          id: 'vpd-calculator',
          title: 'VPD Calculator',
          description: 'Understanding Vapor Pressure Deficit calculations',
          type: 'tutorial',
          readTime: '15 min',
          difficulty: 'advanced',
          lastUpdated: '2024-03-09',
          popular: false
        },
        {
          id: 'energy-estimator',
          title: 'Energy Estimator',
          description: 'Estimate power consumption and costs',
          type: 'guide',
          readTime: '8 min',
          difficulty: 'beginner',
          lastUpdated: '2024-03-13',
          popular: true
        }
      ]
    },
    {
      id: 'automation',
      title: 'Automation & BMS',
      description: 'Building management and automation features',
      icon: Building2,
      articles: [
        {
          id: 'bms-setup',
          title: 'BMS Setup Guide',
          description: 'Configuring the Building Management System',
          type: 'guide',
          readTime: '25 min',
          difficulty: 'advanced',
          lastUpdated: '2024-03-07',
          popular: false
        },
        {
          id: 'control-strategies',
          title: 'Control Strategies',
          description: 'Creating automated control rules and conditions',
          type: 'tutorial',
          readTime: '18 min',
          difficulty: 'intermediate',
          lastUpdated: '2024-03-06',
          popular: true
        },
        {
          id: 'device-integration',
          title: 'Device Integration',
          description: 'Connecting sensors and controllers via BACnet, Modbus',
          type: 'reference',
          readTime: '30 min',
          difficulty: 'advanced',
          lastUpdated: '2024-03-04',
          popular: false
        }
      ]
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      description: 'Developer documentation and API guides',
      icon: Code,
      articles: [
        {
          id: 'rest-api',
          title: 'REST API Documentation',
          description: 'Complete API reference for developers',
          type: 'reference',
          readTime: '45 min',
          difficulty: 'advanced',
          lastUpdated: '2024-03-03',
          popular: false
        },
        {
          id: 'webhooks',
          title: 'Webhooks Guide',
          description: 'Setting up webhooks for real-time notifications',
          type: 'tutorial',
          readTime: '12 min',
          difficulty: 'intermediate',
          lastUpdated: '2024-03-02',
          popular: false
        },
        {
          id: 'sdk-examples',
          title: 'SDK Examples',
          description: 'Code examples and integration patterns',
          type: 'tutorial',
          readTime: '20 min',
          difficulty: 'advanced',
          lastUpdated: '2024-03-01',
          popular: true
        }
      ]
    }
  ]

  const allArticles = docSections.flatMap(section => section.articles)
  const filteredArticles = searchQuery 
    ? allArticles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : docSections.find(s => s.id === selectedSection)?.articles || []

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/10'
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/10'
      case 'advanced': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tutorial': return Video
      case 'reference': return FileText
      case 'video': return Video
      default: return BookOpen
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900/20 to-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Documentation
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Everything you need to know about using Vibelux for professional lighting design and automation
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-gray-400 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-6">
              <h3 className="font-semibold text-white mb-4">Categories</h3>
              <nav className="space-y-1">
                {docSections.map(section => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        setSelectedSection(section.id)
                        setSearchQuery('')
                      }}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        selectedSection === section.id && !searchQuery
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs opacity-75">{section.articles.length} articles</div>
                      </div>
                    </button>
                  )
                })}
              </nav>

              {/* Popular Articles */}
              <div className="mt-8">
                <h3 className="font-semibold text-white mb-4">Popular</h3>
                <div className="space-y-2">
                  {allArticles.filter(a => a.popular).slice(0, 3).map(article => (
                    <div key={article.id} className="text-sm">
                      <div className="text-purple-400 hover:text-purple-300 cursor-pointer">
                        {article.title}
                      </div>
                      <div className="text-gray-500 text-xs">{article.readTime}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {!searchQuery && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {docSections.find(s => s.id === selectedSection)?.title}
                </h2>
                <p className="text-gray-400">
                  {docSections.find(s => s.id === selectedSection)?.description}
                </p>
              </div>
            )}

            {searchQuery && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Search Results
                </h2>
                <p className="text-gray-400">
                  {filteredArticles.length} results for "{searchQuery}"
                </p>
              </div>
            )}

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredArticles.map(article => {
                const TypeIcon = getTypeIcon(article.type)
                return (
                  <div
                    key={article.id}
                    className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors cursor-pointer border border-gray-800 hover:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-4 h-4 text-gray-400" />
                        <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(article.difficulty)}`}>
                          {article.difficulty}
                        </span>
                        {article.popular && (
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </div>

                    <h3 className="font-semibold text-white mb-2">{article.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {article.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime}
                        </span>
                        <span>Updated {article.lastUpdated}</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredArticles.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No results found</h3>
                <p className="text-gray-400">
                  Try adjusting your search terms or browse the categories on the left.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl p-6">
            <Video className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="font-semibold text-white mb-2">Video Tutorials</h3>
            <p className="text-gray-300 text-sm mb-4">
              Watch step-by-step video guides for complex features and workflows.
            </p>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1">
              Browse Videos
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-teal-600/20 rounded-xl p-6">
            <Download className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="font-semibold text-white mb-2">Downloads</h3>
            <p className="text-gray-300 text-sm mb-4">
              Get templates, examples, and resources to accelerate your projects.
            </p>
            <button className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center gap-1">
              View Downloads
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-xl p-6">
            <User className="w-8 h-8 text-orange-400 mb-4" />
            <h3 className="font-semibold text-white mb-2">Support</h3>
            <p className="text-gray-300 text-sm mb-4">
              Need help? Contact our support team or join the community forum.
            </p>
            <button className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center gap-1">
              Get Support
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}