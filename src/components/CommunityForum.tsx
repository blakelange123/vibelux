"use client"
import { useState } from 'react'
import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Clock,
  User,
  Search,
  Filter,
  Plus,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle,
  Pin,
  Lock,
  Users,
  Hash,
  ChevronRight,
  FileDown,
  FileText,
  X
} from 'lucide-react'
import { exportToCSV, exportToPDF, generateForumReportHTML } from '@/lib/exportUtils'

interface ForumPost {
  id: string
  title: string
  content: string
  author: {
    name: string
    avatar?: string
    role: 'member' | 'moderator' | 'expert' | 'admin'
  }
  category: string
  tags: string[]
  createdAt: Date
  lastActivity: Date
  views: number
  replies: number
  likes: number
  isPinned?: boolean
  isLocked?: boolean
  hasAcceptedAnswer?: boolean
}

interface ForumCategory {
  id: string
  name: string
  description: string
  icon: React.FC<any>
  postCount: number
  color: string
}

export function CommunityForum() {
  const [posts, setPosts] = useState<ForumPost[]>([])

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'unanswered'>('latest')
  const [showNewPost, setShowNewPost] = useState(false)

  const categories: ForumCategory[] = [
    { id: 'growing', name: 'Growing Techniques', description: 'Cultivation methods and best practices', icon: MessageSquare, postCount: 156, color: 'green' },
    { id: 'equipment', name: 'Equipment Reviews', description: 'Fixture comparisons and recommendations', icon: Award, postCount: 89, color: 'blue' },
    { id: 'troubleshooting', name: 'Troubleshooting', description: 'Problem solving and technical support', icon: AlertCircle, postCount: 234, color: 'yellow' },
    { id: 'business', name: 'Business & Finance', description: 'ROI, financing, and business strategies', icon: TrendingUp, postCount: 67, color: 'purple' },
    { id: 'showcase', name: 'Project Showcase', description: 'Share your grow room designs and results', icon: Users, postCount: 45, color: 'pink' }
  ]

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'expert': return 'text-purple-400 bg-purple-400/10'
      case 'moderator': return 'text-green-400 bg-green-400/10'
      case 'admin': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category.toLowerCase().includes(selectedCategory)
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  }).sort((a, b) => {
    if (sortBy === 'latest') return b.lastActivity.getTime() - a.lastActivity.getTime()
    if (sortBy === 'popular') return b.views - a.views
    return a.replies === 0 ? -1 : 1
  })

  const topContributors: any[] = []

  const handleExportPDF = () => {
    const reportHTML = generateForumReportHTML({
      posts: filteredPosts,
      category: selectedCategory === 'all' ? 'All Categories' : 
                categories.find(c => c.id === selectedCategory)?.name || selectedCategory
    })
    exportToPDF(reportHTML, `Forum_Posts_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const handleExportCSV = () => {
    const csvData = filteredPosts.map(post => ({
      'Title': post.title,
      'Author': post.author.name,
      'Role': post.author.role,
      'Category': post.category,
      'Created': new Date(post.createdAt).toLocaleDateString(),
      'Last Activity': new Date(post.lastActivity).toLocaleDateString(),
      'Views': post.views,
      'Replies': post.replies,
      'Likes': post.likes,
      'Tags': post.tags.join(', '),
      'Status': post.hasAcceptedAnswer ? 'Answered' : post.isLocked ? 'Locked' : 'Open'
    }))
    exportToCSV(csvData, `Forum_Posts_${new Date().toISOString().split('T')[0]}.csv`)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Community Forum</h1>
          <p className="text-gray-400">Connect with growers, share knowledge, and get expert advice</p>
        </div>
        <button
          onClick={() => setShowNewPost(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Posts</span>
            <MessageSquare className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">{posts.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Active Members</span>
            <Users className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">0</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Expert Contributors</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">0</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Solved Questions</span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">0%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Categories */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold text-gray-100 mb-4">Categories</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === 'all' ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'
                }`}
              >
                All Categories
              </button>
              {categories.map(category => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{category.postCount}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold text-gray-100 mb-4">Top Contributors</h3>
            <div className="space-y-3">
              {topContributors.map((contributor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {contributor.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-100">{contributor.name}</p>
                      <p className="text-xs text-gray-400">{contributor.posts} posts</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(contributor.role)}`}>
                    {contributor.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            >
              <option value="latest">Latest Activity</option>
              <option value="popular">Most Popular</option>
              <option value="unanswered">Unanswered</option>
            </select>
            
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
              title="Export to PDF"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden lg:inline">PDF</span>
            </button>
            
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
              title="Export to CSV"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden lg:inline">CSV</span>
            </button>
          </div>

          {/* Posts */}
          <div className="space-y-3">
            {filteredPosts.length === 0 ? (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No posts yet</h3>
                <p className="text-gray-400 mb-4">Be the first to start a discussion!</p>
                <button
                  onClick={() => setShowNewPost(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create First Post
                </button>
              </div>
            ) : (
              filteredPosts.map(post => (
              <div 
                key={post.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {post.isPinned && (
                        <Pin className="w-4 h-4 text-purple-400" />
                      )}
                      {post.isLocked && (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                      <h3 className="font-medium text-gray-100 hover:text-purple-400 transition-colors">
                        {post.title}
                      </h3>
                      {post.hasAcceptedAnswer && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{post.content}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${getRoleColor(post.author.role)}`}>
                        {post.author.role}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(post.lastActivity).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      {post.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-xs">
                          <Hash className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="text-sm">
                      <p className="text-gray-100 font-medium">{post.replies}</p>
                      <p className="text-xs text-gray-400">replies</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-100 font-medium">{post.views}</p>
                      <p className="text-xs text-gray-400">views</p>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">{post.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </div>

      {/* New Post Dialog */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Create New Post</h2>
                <button
                  onClick={() => setShowNewPost(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const newPost: ForumPost = {
                id: Date.now().toString(),
                title: formData.get('title') as string,
                content: formData.get('content') as string,
                author: {
                  name: 'Current User',
                  role: 'member'
                },
                category: formData.get('category') as string,
                tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
                createdAt: new Date(),
                lastActivity: new Date(),
                views: 0,
                replies: 0,
                likes: 0
              }
              setPosts([newPost, ...posts])
              setShowNewPost(false)
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your post title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  name="category"
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                <textarea
                  name="content"
                  required
                  rows={6}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Share your thoughts, questions, or experiences..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma separated)</label>
                <input
                  name="tags"
                  type="text"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g. LED, yield, nutrients"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create Post
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewPost(false)}
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}