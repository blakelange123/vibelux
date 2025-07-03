'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  DollarSign, 
  Calendar,
  Shield,
  Award,
  Video,
  MessageSquare,
  TrendingUp,
  Leaf,
  Package,
  Wrench,
  Bug,
  ShoppingCart,
  FileCheck,
  Users,
  ChevronRight,
  CheckCircle
} from 'lucide-react';

interface Expert {
  id: string;
  displayName: string;
  title: string;
  photoUrl: string;
  bio: string;
  specialties: string[];
  certifications: string[];
  yearsExperience: number;
  hourlyRate: number;
  averageRating: number;
  totalSessions: number;
  responseTime: number;
  status: string;
}

const specialtyIcons: Record<string, any> = {
  growing: Leaf,
  packaging: Package,
  engineering: Wrench,
  IPM: Bug,
  sales: ShoppingCart,
  compliance: FileCheck,
  business: TrendingUp,
  design: Users
};

const specialtyColors: Record<string, string> = {
  growing: 'green',
  packaging: 'blue',
  engineering: 'orange',
  IPM: 'red',
  sales: 'purple',
  compliance: 'yellow',
  business: 'indigo',
  design: 'pink'
};

export default function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExperts();
  }, []);

  useEffect(() => {
    filterAndSortExperts();
  }, [experts, searchTerm, selectedSpecialty, sortBy]);

  const loadExperts = async () => {
    try {
      const response = await fetch('/api/experts');
      if (response.ok) {
        const data = await response.json();
        setExperts(data.experts);
      }
    } catch (error) {
      console.error('Error loading experts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortExperts = () => {
    let filtered = [...experts];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(expert => 
        expert.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by specialty
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(expert => 
        expert.specialties.includes(selectedSpecialty)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'experience':
          return b.yearsExperience - a.yearsExperience;
        case 'sessions':
          return b.totalSessions - a.totalSessions;
        case 'price-low':
          return a.hourlyRate - b.hourlyRate;
        case 'price-high':
          return b.hourlyRate - a.hourlyRate;
        default:
          return 0;
      }
    });

    setFilteredExperts(filtered);
  };

  // Mock data for demo
  const mockExperts: Expert[] = [
    {
      id: '1',
      displayName: 'Dr. Sarah Chen',
      title: 'Cannabis Cultivation Expert',
      photoUrl: '/api/placeholder/150/150',
      bio: 'PhD in Plant Biology with 15+ years in commercial cannabis cultivation. Specialized in optimizing yields and terpene profiles.',
      specialties: ['growing', 'IPM', 'compliance'],
      certifications: ['PhD Plant Biology', 'Certified Crop Advisor', 'GACP Certified'],
      yearsExperience: 15,
      hourlyRate: 300,
      averageRating: 4.9,
      totalSessions: 247,
      responseTime: 2,
      status: 'ACTIVE'
    },
    {
      id: '2',
      displayName: 'Michael Rodriguez',
      title: 'Facility Design Engineer',
      photoUrl: '/api/placeholder/150/150',
      bio: 'Licensed PE specializing in CEA facility design. Expert in HVAC, electrical, and automation systems.',
      specialties: ['engineering', 'design'],
      certifications: ['Professional Engineer (PE)', 'LEED AP', 'CEM'],
      yearsExperience: 12,
      hourlyRate: 250,
      averageRating: 4.8,
      totalSessions: 189,
      responseTime: 4,
      status: 'ACTIVE'
    },
    {
      id: '3',
      displayName: 'Jennifer Park',
      title: 'IPM & Compliance Specialist',
      photoUrl: '/api/placeholder/150/150',
      bio: 'Former state regulator turned consultant. Expert in pest management and regulatory compliance.',
      specialties: ['IPM', 'compliance'],
      certifications: ['Certified IPM Specialist', 'State Compliance Auditor'],
      yearsExperience: 10,
      hourlyRate: 200,
      averageRating: 4.7,
      totalSessions: 156,
      responseTime: 3,
      status: 'ACTIVE'
    }
  ];

  useEffect(() => {
    // Use mock data for demo
    setExperts(mockExperts);
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 pt-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-xl rounded-full mb-8 border border-white/10">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300">
                Trusted Industry Experts
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Get Expert Guidance
            </h1>
            
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Connect with verified cultivation experts for personalized consulting. 
              From growing to compliance, get the expertise you need to succeed.
            </p>

            {/* Platform Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold text-white">Verified Experts</h3>
                <p className="text-sm text-gray-400">All experts vetted and verified</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <Video className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-white">Secure Video Calls</h3>
                <p className="text-sm text-gray-400">Built-in platform video</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-semibold text-white">Safe Payments</h3>
                <p className="text-sm text-gray-400">Secure escrow protection</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h3 className="font-semibold text-white">Satisfaction Guaranteed</h3>
                <p className="text-sm text-gray-400">Money-back guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search experts by name, specialty, or topic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Specialty Filter */}
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Specialties</option>
              <option value="growing-agronomy">🌱 Growing & Agronomy</option>
              <option value="engineering-systems">⚙️ Engineering & Systems</option>
              <option value="food-safety-compliance">🛡️ Food Safety & Compliance</option>
              <option value="business-operations">📊 Business Operations</option>
              <option value="marketing-sales">📈 Marketing & Sales</option>
              <option value="supply-chain-distribution">🚚 Supply Chain & Distribution</option>
              <option value="technology-integration">💻 Technology Integration</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="sessions">Most Sessions</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* Experts Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : filteredExperts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No experts found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperts.map((expert) => (
                <Link 
                  key={expert.id} 
                  href={`/experts/${expert.id}`}
                  className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-all duration-300 border border-gray-700 hover:border-indigo-500 group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={expert.photoUrl}
                      alt={expert.displayName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                        {expert.displayName}
                      </h3>
                      <p className="text-sm text-gray-400">{expert.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-white font-medium">{expert.averageRating}</span>
                        </div>
                        <span className="text-gray-600">•</span>
                        <span className="text-sm text-gray-400">{expert.totalSessions} sessions</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                    {expert.bio}
                  </p>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {expert.specialties.map((specialty) => {
                      const Icon = specialtyIcons[specialty] || Users;
                      const color = specialtyColors[specialty] || 'gray';
                      return (
                        <span
                          key={specialty}
                          className={`inline-flex items-center gap-1 px-3 py-1 bg-${color}-900/20 border border-${color}-600/30 rounded-full text-xs text-${color}-400`}
                        >
                          <Icon className="w-3 h-3" />
                          {specialty}
                        </span>
                      );
                    })}
                  </div>

                  {/* Certifications */}
                  {expert.certifications.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <Award className="w-3 h-3" />
                        Certifications:
                      </div>
                      <div className="text-xs text-gray-300">
                        {expert.certifications.slice(0, 2).join(', ')}
                        {expert.certifications.length > 2 && ` +${expert.certifications.length - 2} more`}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div>
                      <span className="text-2xl font-bold text-white">${expert.hourlyRate}</span>
                      <span className="text-sm text-gray-400">/hour</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Responds in ~{expert.responseTime}h</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {expert.yearsExperience} years experience
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Platform Security Notice */}
      <section className="py-12 bg-gray-900/50 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Shield className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Your Consultations Are Protected
          </h2>
          <p className="text-gray-400 mb-6">
            All expert consultations must be conducted through the VibeLux platform to ensure 
            quality, security, and satisfaction guarantees.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-gray-800 rounded-lg p-4">
              <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
              <h3 className="font-semibold text-white mb-1">Secure Payments</h3>
              <p className="text-sm text-gray-400">
                Payments held in escrow until consultation is completed
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
              <h3 className="font-semibold text-white mb-1">Quality Guarantee</h3>
              <p className="text-sm text-gray-400">
                Money-back guarantee if not satisfied with consultation
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
              <h3 className="font-semibold text-white mb-1">Recorded Sessions</h3>
              <p className="text-sm text-gray-400">
                Optional recording for future reference and dispute resolution
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Become an Expert CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-t border-indigo-800/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Are You an Industry Expert?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join our platform and share your expertise. Earn $180-$270/hour (after platform fee).
          </p>
          <Link
            href="/experts/apply"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-indigo-600/30"
          >
            Apply to Become an Expert
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}