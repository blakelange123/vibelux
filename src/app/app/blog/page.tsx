"use client"

import { useState } from 'react'
import {
  Search,
  Calendar,
  User,
  Clock,
  ArrowRight,
  Filter,
  Tag,
  TrendingUp,
  Leaf,
  Lightbulb,
  BarChart3,
  Building2,
  Zap,
  Eye,
  MessageCircle,
  Heart,
  Share2
} from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: {
    name: string
    role: string
    avatar: string
  }
  publishedAt: string
  readTime: string
  category: string
  tags: string[]
  featured: boolean
  views: number
  comments: number
  likes: number
  thumbnail: string
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTag, setSelectedTag] = useState<string>('')

  const categories = [
    'all',
    'Industry News',
    'Technology',
    'Case Studies',
    'Best Practices',
    'Product Updates',
    'Growing Tips'
  ]

  const blogPosts: BlogPost[] = [
    {
      id: 'led-spectrum-optimization-2024',
      title: 'LED Spectrum Optimization: Latest Research and Practical Applications',
      excerpt: 'Discover the latest breakthroughs in LED spectrum research and how to apply them to maximize crop yields and quality in your growing operation.',
      content: 'Full article content...',
      author: {
        name: 'Dr. Sarah Chen',
        role: 'Lead Horticulture Scientist',
        avatar: '/api/placeholder/40/40'
      },
      publishedAt: '2024-03-15',
      readTime: '8 min',
      category: 'Technology',
      tags: ['LED', 'Spectrum', 'Research', 'Optimization'],
      featured: true,
      views: 2450,
      comments: 23,
      likes: 156,
      thumbnail: '/api/placeholder/600/400'
    },
    {
      id: 'vertical-farming-profitability',
      title: 'The Economics of Vertical Farming: Achieving Profitability in 2024',
      excerpt: 'A comprehensive analysis of the current state of vertical farming economics and strategies to improve profitability in the evolving market.',
      content: 'Full article content...',
      author: {
        name: 'Michael Rodriguez',
        role: 'Business Development Director',
        avatar: '/api/placeholder/40/40'
      },
      publishedAt: '2024-03-12',
      readTime: '12 min',
      category: 'Industry News',
      tags: ['Vertical Farming', 'Economics', 'ROI', 'Business'],
      featured: true,
      views: 1890,
      comments: 34,
      likes: 98,
      thumbnail: '/api/placeholder/600/400'
    },
    {
      id: 'automated-climate-control',
      title: 'Advanced Climate Control: How AI is Revolutionizing Greenhouse Management',
      excerpt: 'Explore how artificial intelligence and machine learning are transforming climate control systems in modern greenhouses.',
      content: 'Full article content...',
      author: {
        name: 'Alex Thompson',
        role: 'Automation Engineer',
        avatar: '/api/placeholder/40/40'
      },
      publishedAt: '2024-03-10',
      readTime: '10 min',
      category: 'Technology',
      tags: ['AI', 'Climate Control', 'Automation', 'Greenhouse'],
      featured: false,
      views: 1245,
      comments: 18,
      likes: 67,
      thumbnail: '/api/placeholder/600/400'
    },
    {
      id: 'cannabis-lighting-compliance',
      title: 'Cannabis Cultivation Lighting: Navigating Compliance and Optimization',
      excerpt: 'A guide to meeting regulatory requirements while optimizing lighting systems for cannabis cultivation facilities.',
      content: 'Full article content...',
      author: {
        name: 'Jennifer Park',
        role: 'Compliance Specialist',
        avatar: '/api/placeholder/40/40'
      },
      publishedAt: '2024-03-08',
      readTime: '15 min',
      category: 'Best Practices',
      tags: ['Cannabis', 'Compliance', 'Lighting', 'Regulations'],
      featured: false,
      views: 987,
      comments: 12,
      likes: 45,
      thumbnail: '/api/placeholder/600/400'
    },
    {
      id: 'energy-efficiency-tips',
      title: '10 Proven Strategies to Reduce Energy Costs in Commercial Growing',
      excerpt: 'Practical tips and proven strategies to significantly reduce energy consumption and costs in your growing operation.',
      content: 'Full article content...',
      author: {
        name: 'Robert Kim',
        role: 'Energy Efficiency Consultant',
        avatar: '/api/placeholder/40/40'
      },
      publishedAt: '2024-03-05',
      readTime: '7 min',
      category: 'Growing Tips',
      tags: ['Energy Efficiency', 'Cost Reduction', 'Sustainability'],
      featured: false,
      views: 1567,
      comments: 28,
      likes: 89,
      thumbnail: '/api/placeholder/600/400'
    },
    {
      id: 'bms-integration-guide',
      title: 'Building Management System Integration: From Planning to Implementation',
      excerpt: 'A step-by-step guide to successfully integrate building management systems in agricultural facilities.',
      content: 'Full article content...',
      author: {
        name: 'Laura Stevens',
        role: 'Systems Integration Manager',
        avatar: '/api/placeholder/40/40'
      },
      publishedAt: '2024-03-02',
      readTime: '18 min',
      category: 'Technology',
      tags: ['BMS', 'Integration', 'Planning', 'Implementation'],
      featured: false,
      views: 756,
      comments: 15,
      likes: 42,
      thumbnail: '/api/placeholder/600/400'
    }
  ]

  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags)))
  
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    const matchesTag = !selectedTag || post.tags.includes(selectedTag)
    
    return matchesSearch && matchesCategory && matchesTag
  })

  const featuredPosts = blogPosts.filter(post => post.featured)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Technology': return Zap
      case 'Industry News': return TrendingUp
      case 'Case Studies': return Building2
      case 'Best Practices': return Lightbulb
      case 'Product Updates': return BarChart3
      case 'Growing Tips': return Leaf
      default: return MessageCircle
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900/20 to-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Vibelux Blog
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Insights, updates, and expert knowledge from the world of professional horticulture lighting
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-gray-400 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Featured Posts */}
        {!searchQuery && !selectedTag && selectedCategory === 'all' && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8">Featured Articles</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map(post => (
                <article key={post.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-600 transition-colors">
                  <div className="relative">
                    <div className="w-full h-64 bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                      <Leaf className="w-16 h-16 text-purple-400 opacity-50" />
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                        Featured
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </span>
                      <span className="px-2 py-1 bg-gray-800 rounded text-xs">
                        {post.category}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 hover:text-purple-400 transition-colors cursor-pointer">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 mb-4 line-clamp-2">{post.excerpt}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {post.author.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{post.author.name}</p>
                          <p className="text-xs text-gray-400">{post.author.role}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {post.comments}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {post.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filter by:</span>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 8).map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTag === tag
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => {
            const CategoryIcon = getCategoryIcon(post.category)
            return (
              <article key={post.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
                <div className="w-full h-48 bg-gradient-to-br from-purple-600/10 to-blue-600/10 flex items-center justify-center">
                  <CategoryIcon className="w-12 h-12 text-purple-400 opacity-50" />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-white mb-2 line-clamp-2 hover:text-purple-400 transition-colors cursor-pointer">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-3">{post.excerpt}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {post.comments}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs">
                        {post.author.name[0]}
                      </div>
                      <span className="text-sm text-gray-400">{post.author.name}</span>
                    </div>
                    
                    <button className="text-purple-400 hover:text-purple-300 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No articles found</h3>
            <p className="text-gray-400">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter to get the latest insights, updates, and expert tips delivered directly to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400"
            />
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors">
              Subscribe
            </button>
          </div>
        </div>

        {/* Categories Overview */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(1).map(category => {
              const Icon = getCategoryIcon(category)
              const count = blogPosts.filter(post => post.category === category).length
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors text-center border border-gray-800 hover:border-gray-700"
                >
                  <Icon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="font-medium text-white text-sm">{category}</div>
                  <div className="text-xs text-gray-400">{count} articles</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}