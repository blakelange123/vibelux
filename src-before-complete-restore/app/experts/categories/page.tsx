'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Search,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Filter,
  ChevronRight,
  Star,
  Award
} from 'lucide-react';
import { consultationCategories, getAverageRateByCategory, getExpertiseDistribution } from '@/lib/consultation-categories';

export default function ExpertCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string>('all');

  const expertiseDistribution = getExpertiseDistribution();

  const filteredCategories = consultationCategories.filter(category => {
    const matchesSearch = searchTerm === '' || 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.subcategories.some(sub => 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
      );

    const matchesExpertise = selectedExpertise === 'all' ||
      category.subcategories.some(sub => sub.expertiseLevel === selectedExpertise);

    return matchesSearch && matchesExpertise;
  });

  return (
    <div className="min-h-screen bg-gray-950 pt-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-b border-indigo-800/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <Link 
            href="/experts"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Experts
          </Link>
          
          <h1 className="text-4xl font-bold text-white mb-4">Expert Consultation Categories</h1>
          <p className="text-xl text-gray-400 max-w-3xl">
            Explore our comprehensive range of expert consultation services across all aspects of controlled environment agriculture.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{consultationCategories.length}</div>
              <div className="text-sm text-gray-400">Categories</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">
                {consultationCategories.reduce((sum, cat) => sum + cat.subcategories.length, 0)}
              </div>
              <div className="text-sm text-gray-400">Specializations</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{expertiseDistribution.expert}</div>
              <div className="text-sm text-gray-400">Expert-Level Services</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">$200-350</div>
              <div className="text-sm text-gray-400">Rate Range/Hour</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search categories, specializations, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            
            <select
              value={selectedExpertise}
              onChange={(e) => setSelectedExpertise(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Expertise Levels</option>
              <option value="beginner">Beginner Friendly</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert Level</option>
            </select>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition-all">
              <div className="flex items-start gap-4 mb-6">
                <div className="text-4xl">{category.icon}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                  <p className="text-gray-400 mb-4">{category.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-white">${getAverageRateByCategory(category.id)}/hr avg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-white">{category.subcategories.length} specializations</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subcategories */}
              <div className="space-y-3">
                {category.subcategories.slice(0, 4).map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{sub.name}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          sub.expertiseLevel === 'expert' ? 'bg-red-500' :
                          sub.expertiseLevel === 'advanced' ? 'bg-orange-500' :
                          sub.expertiseLevel === 'intermediate' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></div>
                      </div>
                      <p className="text-sm text-gray-400">{sub.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium text-white">${sub.averageRate}/hr</div>
                      <div className="text-xs text-gray-400">{sub.typicalDuration}min</div>
                    </div>
                  </div>
                ))}
                
                {category.subcategories.length > 4 && (
                  <div className="text-center">
                    <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                      +{category.subcategories.length - 4} more specializations
                    </button>
                  </div>
                )}
              </div>

              {/* Find Experts Button */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <Link
                  href={`/experts?specialty=${category.id}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  Find {category.name} Experts
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No categories found matching your criteria.</div>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedExpertise('all');
              }}
              className="text-indigo-400 hover:text-indigo-300"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Expertise Legend */}
        <div className="mt-12 bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Expertise Levels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <div>
                <div className="font-medium text-white">Beginner</div>
                <div className="text-sm text-gray-400">Foundational guidance</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <div>
                <div className="font-medium text-white">Intermediate</div>
                <div className="text-sm text-gray-400">Process optimization</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <div>
                <div className="font-medium text-white">Advanced</div>
                <div className="text-sm text-gray-400">Complex problem solving</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <div>
                <div className="font-medium text-white">Expert</div>
                <div className="text-sm text-gray-400">Cutting-edge innovation</div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-12 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-600/30 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">How Expert Consultations Work</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-white mb-2">1. Find Your Expert</h4>
              <p className="text-gray-400 text-sm">Browse categories and find experts with the specific expertise you need</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-white mb-2">2. Book & Pay</h4>
              <p className="text-gray-400 text-sm">Schedule your consultation and pay securely through our platform</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-white mb-2">3. Get Expert Guidance</h4>
              <p className="text-gray-400 text-sm">Connect via video call for personalized consultation and actionable advice</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}