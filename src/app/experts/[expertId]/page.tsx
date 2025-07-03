'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Star, 
  Clock, 
  Calendar,
  Video,
  Shield,
  Award,
  Check,
  MessageSquare,
  DollarSign,
  MapPin,
  Globe,
  Linkedin,
  AlertTriangle,
  ChevronRight,
  Users,
  BookOpen,
  Zap
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
  minimumHours: number;
  averageRating: number;
  totalSessions: number;
  responseTime: number;
  timezone: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  availability: any;
  reviews: Review[];
}

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: string;
  consultationType: string;
}

export default function ExpertProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [expert, setExpert] = useState<Expert | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Mock data for demo
  const mockExpert: Expert = {
    id: params.expertId as string,
    displayName: 'Dr. Sarah Chen',
    title: 'Cannabis Cultivation Expert',
    photoUrl: '/api/placeholder/200/200',
    bio: `Dr. Sarah Chen is a leading expert in commercial cannabis cultivation with over 15 years of experience in controlled environment agriculture. She holds a PhD in Plant Biology from UC Davis and has helped design and optimize over 50 commercial cultivation facilities across North America.

Her expertise includes:
• Strain selection and pheno-hunting strategies
• Environmental optimization for maximum yields
• IPM strategies for cannabis-specific pests
• Compliance with state and local regulations
• Staff training and SOPs development

Dr. Chen has published numerous research papers on cannabis cultivation and is a frequent speaker at industry conferences. She's passionate about helping cultivators achieve consistent, high-quality yields while maintaining compliance and profitability.`,
    specialties: ['growing', 'IPM', 'compliance', 'training'],
    certifications: [
      'PhD Plant Biology - UC Davis',
      'Certified Crop Advisor (CCA)',
      'Good Agricultural and Collection Practices (GACP)',
      'Integrated Pest Management Certification'
    ],
    yearsExperience: 15,
    hourlyRate: 300,
    minimumHours: 1,
    averageRating: 4.9,
    totalSessions: 247,
    responseTime: 2,
    timezone: 'America/Los_Angeles',
    linkedinUrl: 'https://linkedin.com/in/drsarahchen',
    websiteUrl: 'https://drsarahchen.com',
    availability: {
      monday: { available: true, start: '09:00', end: '17:00' },
      tuesday: { available: true, start: '09:00', end: '17:00' },
      wednesday: { available: true, start: '09:00', end: '17:00' },
      thursday: { available: true, start: '09:00', end: '17:00' },
      friday: { available: true, start: '09:00', end: '15:00' },
      saturday: { available: false },
      sunday: { available: false }
    },
    reviews: [
      {
        id: '1',
        clientName: 'John D.',
        rating: 5,
        comment: 'Dr. Chen helped us identify and solve a persistent powdery mildew issue that had been affecting our yields for months. Her systematic approach and deep knowledge saved our harvest.',
        createdAt: '2024-01-15',
        consultationType: 'IPM Strategy'
      },
      {
        id: '2',
        clientName: 'Maria S.',
        rating: 5,
        comment: 'Excellent consultation on facility design. She identified several inefficiencies in our HVAC system that were costing us thousands in energy bills.',
        createdAt: '2024-01-08',
        consultationType: 'Facility Optimization'
      },
      {
        id: '3',
        clientName: 'Robert K.',
        rating: 4,
        comment: 'Very knowledgeable about compliance requirements. Helped us prepare for state inspection and we passed with flying colors.',
        createdAt: '2023-12-20',
        consultationType: 'Compliance Review'
      }
    ]
  };

  useEffect(() => {
    // Use mock data for demo
    setExpert(mockExpert);
    setIsLoading(false);
  }, [params.expertId]);

  const calculateTotal = () => {
    if (!expert) return 0;
    return expert.hourlyRate * duration;
  };

  const platformFee = () => {
    return calculateTotal() * 0.1;
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !duration) {
      alert('Please select date, time, and duration');
      return;
    }

    // In production, this would create a booking through the API
    console.log('Booking:', {
      expertId: expert?.id,
      date: selectedDate,
      time: selectedTime,
      duration,
      total: calculateTotal()
    });

    // Redirect to booking confirmation
    router.push(`/experts/${expert?.id}/book?date=${selectedDate}&time=${selectedTime}&duration=${duration}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center">
        <p className="text-gray-400">Expert not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-24">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
        <Link 
          href="/experts" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Experts
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Expert Header */}
            <div className="bg-gray-800 rounded-xl p-8 mb-8">
              <div className="flex items-start gap-6">
                <img
                  src={expert.photoUrl}
                  alt={expert.displayName}
                  className="w-32 h-32 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">{expert.displayName}</h1>
                  <p className="text-xl text-gray-400 mb-4">{expert.title}</p>
                  
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="text-lg font-semibold text-white">{expert.averageRating}</span>
                      <span className="text-gray-400">({expert.reviews.length} reviews)</span>
                    </div>
                    <div className="text-gray-400">
                      <span className="font-semibold text-white">{expert.totalSessions}</span> consultations
                    </div>
                    <div className="text-gray-400">
                      <span className="font-semibold text-white">{expert.yearsExperience}</span> years exp.
                    </div>
                  </div>

                  {/* External Links */}
                  <div className="flex items-center gap-4">
                    {expert.linkedinUrl && (
                      <a 
                        href={expert.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                    {expert.websiteUrl && (
                      <a 
                        href={expert.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-gray-800 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">About</h2>
              <div className="prose prose-invert max-w-none">
                {expert.bio.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-300 mb-4 whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Specialties */}
            <div className="bg-gray-800 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Areas of Expertise</h2>
              <div className="grid grid-cols-2 gap-4">
                {expert.specialties.map((specialty) => (
                  <div key={specialty} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-900/30 rounded-lg flex items-center justify-center">
                      <Check className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="text-gray-300 capitalize">{specialty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-gray-800 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Certifications & Credentials</h2>
              <div className="space-y-3">
                {expert.certifications.map((cert, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <span className="text-gray-300">{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-gray-800 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Client Reviews</h2>
              <div className="space-y-6">
                {expert.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-700 pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-white">{review.clientName}</h4>
                        <p className="text-sm text-gray-400">{review.consultationType}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-600'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-300">{review.comment}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-4">Book a Consultation</h3>
              
              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold text-white">${expert.hourlyRate}</span>
                  <span className="text-gray-400">/hour</span>
                </div>
                <p className="text-sm text-gray-400">
                  Minimum booking: {expert.minimumHours} hour{expert.minimumHours > 1 ? 's' : ''}
                </p>
              </div>

              {/* Duration */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                >
                  {[1, 1.5, 2, 3, 4].map((hours) => (
                    <option key={hours} value={hours}>
                      {hours} hour{hours > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability Notice */}
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">Availability</span>
                </div>
                <p className="text-sm text-gray-400">
                  Mon-Thu: 9:00 AM - 5:00 PM PST<br />
                  Fri: 9:00 AM - 3:00 PM PST<br />
                  Usually responds within {expert.responseTime} hours
                </p>
              </div>

              {/* Total */}
              <div className="border-t border-gray-700 pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Consultation ({duration}h)</span>
                  <span className="text-white">${expert.hourlyRate * duration}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Platform fee (10%)</span>
                  <span className="text-white">${platformFee().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-white">Total</span>
                  <span className="text-white">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={() => router.push(`/experts/${expert.id}/book`)}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300"
              >
                Continue to Booking
              </button>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-yellow-400 font-medium mb-1">Platform Protection</p>
                    <p className="text-gray-400">
                      All consultations must be conducted through VibeLux to ensure payment protection, 
                      quality guarantees, and access to recorded sessions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-gray-300">Secure payment protection</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Video className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-300">Built-in video conferencing</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-300">Session notes & follow-ups</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}