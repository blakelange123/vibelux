'use client';

import Link from 'next/link';
import { 
  HelpCircle,
  MessageSquare,
  Book,
  Video,
  Mail,
  Phone,
  Users,
  ExternalLink,
  Search,
  ChevronRight,
  Zap,
  Shield,
  Clock,
  Star
} from 'lucide-react';

const helpCategories = [
  {
    title: 'Getting Started',
    icon: Book,
    articles: [
      { title: 'Quick Start Guide', href: '/help/quickstart' },
      { title: 'First Time Setup', href: '/help/setup' },
      { title: 'Understanding the Dashboard', href: '/help/dashboard' },
      { title: 'Basic Navigation', href: '/help/navigation' }
    ]
  },
  {
    title: 'Design & Planning',
    icon: Zap,
    articles: [
      { title: 'Using the Design Studio', href: '/help/design-studio' },
      { title: 'Fixture Placement Guide', href: '/help/fixture-placement' },
      { title: 'PPFD Calculations', href: '/help/ppfd' },
      { title: 'Climate Integration', href: '/help/climate' }
    ]
  },
  {
    title: 'Account & Billing',
    icon: Shield,
    articles: [
      { title: 'Managing Your Account', href: '/help/account' },
      { title: 'Subscription Plans', href: '/help/subscriptions' },
      { title: 'Payment Methods', href: '/help/payments' },
      { title: 'Invoices & Receipts', href: '/help/invoices' }
    ]
  },
  {
    title: 'Troubleshooting',
    icon: HelpCircle,
    articles: [
      { title: 'Common Issues', href: '/help/common-issues' },
      { title: 'Performance Problems', href: '/help/performance' },
      { title: 'Data Sync Issues', href: '/help/sync-issues' },
      { title: 'Browser Compatibility', href: '/help/browsers' }
    ]
  }
];

const contactOptions = [
  {
    title: 'Live Chat',
    description: 'Chat with our support team',
    icon: MessageSquare,
    action: 'Start Chat',
    available: true,
    responseTime: '< 2 minutes'
  },
  {
    title: 'Email Support',
    description: 'Get help via email',
    icon: Mail,
    action: 'Send Email',
    href: 'mailto:support@vibelux.com',
    available: true,
    responseTime: '< 24 hours'
  },
  {
    title: 'Phone Support',
    description: 'Talk to a specialist',
    icon: Phone,
    action: 'Call Now',
    href: 'tel:+1-888-555-0123',
    available: true,
    responseTime: 'Business hours'
  },
  {
    title: 'Community Forum',
    description: 'Get help from the community',
    icon: Users,
    action: 'Visit Forum',
    href: '/community-forum',
    available: true,
    responseTime: 'Community driven'
  }
];

const popularArticles = [
  { title: 'How to calculate DLI for your facility', views: 12543 },
  { title: 'Setting up automated lighting schedules', views: 9876 },
  { title: 'Understanding heat maps and PPFD', views: 8234 },
  { title: 'Integrating with BMS systems', views: 7652 },
  { title: 'Optimizing energy consumption', views: 6789 }
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900/20 to-gray-900 py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-xl text-gray-300 mb-8">
            Search our knowledge base or contact our support team
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 py-4 bg-gray-800 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Contact Options */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Get Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div key={option.title} className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="w-8 h-8 text-purple-400" />
                    {option.available && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Available
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{option.description}</p>
                  <p className="text-xs text-gray-500 mb-4">Response time: {option.responseTime}</p>
                  {option.href ? (
                    <Link
                      href={option.href}
                      className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {option.action}
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
                      {option.action}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
            <div className="space-y-6">
              {helpCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.title} className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon className="w-6 h-6 text-purple-400" />
                      <h3 className="text-lg font-semibold">{category.title}</h3>
                    </div>
                    <div className="space-y-2">
                      {category.articles.map((article) => (
                        <Link
                          key={article.href}
                          href={article.href}
                          className="block text-gray-300 hover:text-white transition-colors py-1"
                        >
                          {article.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="space-y-4">
                {popularArticles.map((article, index) => (
                  <div key={article.title} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                    <Link href="#" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                      <span className="text-lg font-semibold text-gray-500">#{index + 1}</span>
                      <span>{article.title}</span>
                    </Link>
                    <span className="text-sm text-gray-500">{article.views.toLocaleString()} views</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Tutorials */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Video Tutorials</h3>
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Video className="w-6 h-6 text-purple-400" />
                  <p className="text-gray-300">Learn VibeLux with our video guides</p>
                </div>
                <Link
                  href="/tutorials/videos"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Watch Tutorials
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* System Status */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">System Status</h3>
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="font-medium">All Systems Operational</span>
                  </div>
                  <Link href="/help/status" className="text-sm text-purple-400 hover:text-purple-300">
                    View Details
                  </Link>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">API Response Time</span>
                    <span className="text-green-400">45ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Uptime (30 days)</span>
                    <span className="text-green-400">99.99%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700/50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
          <p className="text-gray-300 mb-6">
            Our support team is standing by to assist you with any questions
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors">
              Start Live Chat
            </button>
            <Link
              href="/community-forum"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
            >
              Ask Community
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}