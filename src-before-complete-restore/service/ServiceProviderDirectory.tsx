'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Search,
  MapPin,
  Star,
  Phone,
  Mail,
  Award,
  Clock,
  DollarSign,
  Shield,
  CheckCircle,
  Filter,
  SortAsc,
} from 'lucide-react';

interface ServiceProvider {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  verified: boolean;
  emergencyService: boolean;
  certifications: {
    certificationType: string;
    certificationBody: string;
    expirationDate?: string;
  }[];
  specializations: {
    category: string;
    skillLevel: string;
    experienceYears: number;
  }[];
  reviews: {
    overallRating: number;
    comment?: string;
    reviewer: { name: string };
    createdAt: string;
  }[];
}

interface Filters {
  category: string;
  location: string;
  rating: string;
  emergencyOnly: boolean;
  verifiedOnly: boolean;
}

export default function ServiceProviderDirectory() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [filters, setFilters] = useState<Filters>({
    category: '',
    location: '',
    rating: '',
    emergencyOnly: false,
    verifiedOnly: false,
  });
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [providers, searchTerm, filters, sortBy]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/service-providers');
      const data = await response.json();
      setProviders(data);
    } catch (error) {
      console.error('Error fetching service providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...providers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(provider =>
        provider.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.specializations.some(spec => 
          spec.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(provider =>
        provider.specializations.some(spec => spec.category === filters.category)
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(provider =>
        provider.city.toLowerCase().includes(filters.location.toLowerCase()) ||
        provider.state.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Rating filter
    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(provider => provider.rating >= minRating);
    }

    // Emergency service filter
    if (filters.emergencyOnly) {
      filtered = filtered.filter(provider => provider.emergencyService);
    }

    // Verified only filter
    if (filters.verifiedOnly) {
      filtered = filtered.filter(provider => provider.verified);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        case 'experience':
          return b.completedJobs - a.completedJobs;
        case 'name':
          return a.companyName.localeCompare(b.companyName);
        default:
          return 0;
      }
    });

    setFilteredProviders(filtered);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getSpecializationColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'LIGHTING_SYSTEMS': 'bg-blue-100 text-blue-800',
      'HVAC_CLIMATE_CONTROL': 'bg-green-100 text-green-800',
      'IRRIGATION_FERTIGATION': 'bg-cyan-100 text-cyan-800',
      'ELECTRICAL_SYSTEMS': 'bg-yellow-100 text-yellow-800',
      'AUTOMATION_CONTROLS': 'bg-purple-100 text-purple-800',
      'PEST_MANAGEMENT': 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Service Provider Directory</h1>
          <p className="text-gray-600">Find certified service providers for your facility</p>
        </div>
        <Button onClick={fetchProviders} variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search providers, services, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Service Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="LIGHTING_SYSTEMS">Lighting Systems</SelectItem>
                <SelectItem value="HVAC_CLIMATE_CONTROL">HVAC & Climate</SelectItem>
                <SelectItem value="IRRIGATION_FERTIGATION">Irrigation</SelectItem>
                <SelectItem value="ELECTRICAL_SYSTEMS">Electrical</SelectItem>
                <SelectItem value="AUTOMATION_CONTROLS">Automation</SelectItem>
                <SelectItem value="PEST_MANAGEMENT">Pest Management</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />

            <Select value={filters.rating} onValueChange={(value) => setFilters({ ...filters, rating: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Min Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Rating</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
                <SelectItem value="4.0">4.0+ Stars</SelectItem>
                <SelectItem value="3.5">3.5+ Stars</SelectItem>
                <SelectItem value="3.0">3.0+ Stars</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="reviews">Review Count</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4 mt-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.emergencyOnly}
                onChange={(e) => setFilters({ ...filters, emergencyOnly: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Emergency Service Only</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Verified Providers Only</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredProviders.length} of {providers.length} providers
        </p>
      </div>

      {/* Provider Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProviders.map((provider) => (
          <Card key={provider.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">{provider.companyName}</CardTitle>
                    {provider.verified && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-gray-600">{provider.contactName}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{provider.city}, {provider.state}</span>
                  </div>
                </div>
                {provider.emergencyService && (
                  <Badge variant="destructive" className="text-xs">
                    Emergency
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex">{renderStars(provider.rating)}</div>
                <span className="text-sm font-medium">{provider.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({provider.reviewCount} reviews)</span>
              </div>

              {/* Specializations */}
              <div className="flex flex-wrap gap-1">
                {provider.specializations.slice(0, 3).map((spec, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className={`text-xs ${getSpecializationColor(spec.category)}`}
                  >
                    {spec.category.replace(/_/g, ' ')}
                  </Badge>
                ))}
                {provider.specializations.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{provider.specializations.length - 3} more
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span>{provider.completedJobs} jobs</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span>{provider.certifications.length} certs</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <span>{provider.companyName}</span>
                        {provider.verified && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Contact Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{provider.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{provider.email}</span>
                        </div>
                      </div>

                      {/* Specializations */}
                      <div>
                        <h4 className="font-medium mb-2">Specializations</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {provider.specializations.map((spec, index) => (
                            <div key={index} className="p-2 border rounded">
                              <div className="font-medium text-sm">
                                {spec.category.replace(/_/g, ' ')}
                              </div>
                              <div className="text-xs text-gray-600">
                                {spec.skillLevel} • {spec.experienceYears} years
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Certifications */}
                      <div>
                        <h4 className="font-medium mb-2">Certifications</h4>
                        <div className="space-y-2">
                          {provider.certifications.map((cert, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <div className="font-medium text-sm">
                                  {cert.certificationType.replace(/_/g, ' ')}
                                </div>
                                <div className="text-xs text-gray-600">{cert.certificationBody}</div>
                              </div>
                              {cert.expirationDate && (
                                <div className="text-xs text-gray-500">
                                  Expires: {new Date(cert.expirationDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recent Reviews */}
                      <div>
                        <h4 className="font-medium mb-2">Recent Reviews</h4>
                        <div className="space-y-3">
                          {provider.reviews.slice(0, 3).map((review, index) => (
                            <div key={index} className="p-3 border rounded">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex">{renderStars(review.overallRating)}</div>
                                <span className="text-xs text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {review.comment && (
                                <p className="text-sm text-gray-700">{review.comment}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">- {review.reviewer.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button size="sm" className="flex-1">
                  Request Service
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No providers found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}