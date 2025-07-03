"use client"

import { useState } from 'react'
import {
  Building2,
  Leaf,
  TrendingUp,
  Clock,
  Award,
  Users,
  Lightbulb,
  BarChart3,
  ArrowRight,
  Play,
  Download,
  ExternalLink,
  Filter,
  Search,
  Star,
  MapPin,
  Calendar
} from 'lucide-react'

interface CaseStudy {
  id: string
  title: string
  company: string
  industry: string
  location: string
  date: string
  featured: boolean
  thumbnail: string
  description: string
  results: {
    energySavings: string
    yieldIncrease?: string
    roiPeriod: string
    co2Reduction: string
  }
  tags: string[]
  downloadUrl?: string
  videoUrl?: string
}

export default function CaseStudiesPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const caseStudies: CaseStudy[] = [
    {
      id: 'vertical-farm-netherlands',
      title: 'Automated Vertical Farm Reduces Energy by 40%',
      company: 'GreenTech Farms B.V.',
      industry: 'Vertical Farming',
      location: 'Amsterdam, Netherlands',
      date: '2024-01-15',
      featured: true,
      thumbnail: '/api/placeholder/400/240',
      description: 'A 5-story vertical farm implemented Vibelux\'s LED optimization system to achieve significant energy savings while maintaining crop quality.',
      results: {
        energySavings: '40%',
        yieldIncrease: '15%',
        roiPeriod: '14 months',
        co2Reduction: '680 tons/year'
      },
      tags: ['LED Optimization', 'Energy Efficiency', 'Automation', 'ROI'],
      downloadUrl: '/case-studies/vertical-farm-netherlands.pdf',
      videoUrl: '/case-studies/vertical-farm-tour.mp4'
    },
    {
      id: 'greenhouse-retrofit-california',
      title: 'Cannabis Cultivation Facility Retrofit',
      company: 'Pacific Growers Inc.',
      industry: 'Cannabis',
      location: 'California, USA',
      date: '2024-02-20',
      featured: true,
      thumbnail: '/api/placeholder/400/240',
      description: 'Complete lighting retrofit of 50,000 sq ft cannabis facility using Vibelux design tools and spectrum optimization.',
      results: {
        energySavings: '35%',
        yieldIncrease: '22%',
        roiPeriod: '18 months',
        co2Reduction: '450 tons/year'
      },
      tags: ['Cannabis', 'Retrofit', 'Spectrum Optimization', 'Compliance'],
      downloadUrl: '/case-studies/cannabis-facility-retrofit.pdf'
    },
    {
      id: 'research-facility-uk',
      title: 'University Research Greenhouse Modernization',
      company: 'Cambridge Agricultural Research',
      industry: 'Research',
      location: 'Cambridge, UK',
      date: '2023-11-10',
      featured: false,
      thumbnail: '/api/placeholder/400/240',
      description: 'Research facility upgraded with precision lighting controls for plant phenotyping studies and breeding programs.',
      results: {
        energySavings: '28%',
        roiPeriod: '24 months',
        co2Reduction: '120 tons/year'
      },
      tags: ['Research', 'Precision Agriculture', 'Academic', 'Innovation'],
      downloadUrl: '/case-studies/university-research-facility.pdf'
    },
    {
      id: 'hydroponic-warehouse-canada',
      title: 'Hydroponic Warehouse Conversion',
      company: 'Northern Greens Ltd.',
      industry: 'Hydroponics',
      location: 'Toronto, Canada',
      date: '2023-09-05',
      featured: false,
      thumbnail: '/api/placeholder/400/240',
      description: 'Warehouse conversion to hydroponic lettuce production using Vibelux\'s complete environmental control system.',
      results: {
        energySavings: '32%',
        yieldIncrease: '18%',
        roiPeriod: '20 months',
        co2Reduction: '290 tons/year'
      },
      tags: ['Hydroponics', 'Warehouse Conversion', 'Lettuce', 'Environmental Control']
    }
  ]

  const industries = ['all', 'Vertical Farming', 'Cannabis', 'Research', 'Hydroponics']

  const filteredCaseStudies = caseStudies.filter(study => {
    const matchesIndustry = selectedIndustry === 'all' || study.industry === selectedIndustry
    const matchesSearch = study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         study.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         study.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesIndustry && matchesSearch
  })

  const featuredStudies = caseStudies.filter(study => study.featured)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900/20 to-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Customer Success Stories
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover how leading growers worldwide are achieving remarkable results with Vibelux technology
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Featured Case Studies */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8">Featured Success Stories</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredStudies.map(study => (
              <div key={study.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-600 transition-colors">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-purple-400 opacity-50" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                      Featured
                    </span>
                  </div>
                  {study.videoUrl && (
                    <button className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/30 transition-colors">
                      <Play className="w-12 h-12 text-white" />
                    </button>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <MapPin className="w-4 h-4" />
                    {study.location}
                    <Calendar className="w-4 h-4 ml-2" />
                    {new Date(study.date).toLocaleDateString()}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{study.title}</h3>
                  <p className="text-gray-400 mb-4">{study.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-green-400 text-xl font-bold">{study.results.energySavings}</p>
                      <p className="text-xs text-gray-400">Energy Savings</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-blue-400 text-xl font-bold">{study.results.roiPeriod}</p>
                      <p className="text-xs text-gray-400">ROI Period</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {study.downloadUrl && (
                        <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                    <button className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search case studies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
            />
          </div>
          
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
          >
            {industries.map(industry => (
              <option key={industry} value={industry}>
                {industry === 'all' ? 'All Industries' : industry}
              </option>
            ))}
          </select>
        </div>

        {/* All Case Studies */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCaseStudies.map(study => (
            <div key={study.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="w-full h-32 bg-gradient-to-br from-purple-600/10 to-blue-600/10 flex items-center justify-center">
                <Leaf className="w-8 h-8 text-green-400 opacity-50" />
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <span>{study.industry}</span>
                  <span>•</span>
                  <span>{study.location}</span>
                </div>
                
                <h3 className="font-bold text-white mb-2 line-clamp-2">{study.title}</h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{study.description}</p>
                
                <div className="flex justify-between items-center text-sm mb-3">
                  <div>
                    <span className="text-green-400 font-bold">{study.results.energySavings}</span>
                    <span className="text-gray-400 ml-1">saved</span>
                  </div>
                  <div>
                    <span className="text-blue-400 font-bold">{study.results.roiPeriod}</span>
                    <span className="text-gray-400 ml-1">ROI</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {study.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-800 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="text-purple-400 hover:text-purple-300 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Create Your Own Success Story?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Join hundreds of growers who have transformed their operations with Vibelux technology. 
            Contact our team to discuss your project requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors">
              Schedule Consultation
            </button>
            <button className="px-6 py-3 border border-gray-600 hover:bg-gray-800 rounded-lg font-medium transition-colors">
              Request Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}