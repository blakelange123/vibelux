'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Star, TrendingUp, Clock, Zap, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  growerName: string;
  farmName: string;
  location: string;
  cropType: string;
  imageUrl?: string;
  quote: string;
  metrics: {
    yieldImprovement?: string;
    energySavings?: string;
    timeSaved?: string;
    roiPeriod?: string;
  };
  rating: number;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    growerName: 'Sarah Mitchell',
    farmName: 'Green Valley Farms',
    location: 'California, USA',
    cropType: 'Leafy Greens',
    quote: "Vibelux transformed our operation. The precision lighting design and automated controls have given us complete control over our crop cycles. We're seeing healthier plants and more consistent harvests than ever before.",
    metrics: {
      yieldImprovement: '32%',
      energySavings: '28%',
      timeSaved: '15 hrs/week',
      roiPeriod: '14 months'
    },
    rating: 5,
    date: '2024-11-15'
  },
  {
    id: '2',
    growerName: 'Tom Anderson',
    farmName: 'Vertical Harvest Co.',
    location: 'Michigan, USA',
    cropType: 'Tomatoes',
    quote: "The ROI calculator was spot-on. We achieved payback in just 11 months, and the yield improvements exceeded our expectations. The integration with our climate computer made implementation seamless.",
    metrics: {
      yieldImprovement: '28%',
      energySavings: '35%',
      roiPeriod: '11 months'
    },
    rating: 5,
    date: '2024-10-20'
  },
  {
    id: '3',
    growerName: 'Maria Gonzalez',
    farmName: 'Sunshine Greenhouse',
    location: 'Texas, USA',
    cropType: 'Cannabis',
    quote: "The PPFD mapping and spectrum optimization tools helped us achieve unprecedented cannabinoid levels. Our testing results improved by 22%, and we reduced our energy costs significantly.",
    metrics: {
      yieldImprovement: '25%',
      energySavings: '30%',
      timeSaved: '20 hrs/week',
      roiPeriod: '16 months'
    },
    rating: 5,
    date: '2024-09-08'
  },
  {
    id: '4',
    growerName: 'Alex Chen',
    farmName: 'Urban Farm Systems',
    location: 'New York, USA',
    cropType: 'Herbs & Microgreens',
    quote: "The multi-tier optimization feature was a game-changer for our vertical farm. We maximized every cubic foot of space while maintaining perfect lighting uniformity across all levels.",
    metrics: {
      yieldImprovement: '42%',
      energySavings: '25%',
      timeSaved: '12 hrs/week'
    },
    rating: 5,
    date: '2024-08-22'
  },
  {
    id: '5',
    growerName: 'Robert Williams',
    farmName: 'Heritage Orchids',
    location: 'Florida, USA',
    cropType: 'Orchids',
    quote: "The precision spectrum control allowed us to trigger flowering exactly when needed. Our production schedule is now perfectly predictable, and flower quality has never been better.",
    metrics: {
      yieldImprovement: '18%',
      energySavings: '22%',
      roiPeriod: '18 months'
    },
    rating: 5,
    date: '2024-07-30'
  }
];

export default function GrowerTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const MetricCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Grower Success Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real results from real growers. See how Vibelux is transforming controlled environment agriculture.
          </p>
        </div>

        {/* Carousel View for Mobile */}
        <div className="lg:hidden relative">
          <Card className="p-6 shadow-xl">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {testimonials[currentIndex].growerName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {testimonials[currentIndex].farmName} • {testimonials[currentIndex].location}
                  </p>
                  <p className="text-sm text-gray-500">
                    Growing: {testimonials[currentIndex].cropType}
                  </p>
                </div>
                <div className="flex">{renderStars(testimonials[currentIndex].rating)}</div>
              </div>

              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-gray-200" />
                <p className="text-gray-700 italic pl-6">
                  "{testimonials[currentIndex].quote}"
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {testimonials[currentIndex].metrics.yieldImprovement && (
                  <MetricCard
                    icon={TrendingUp}
                    label="Yield Improvement"
                    value={testimonials[currentIndex].metrics.yieldImprovement}
                    color="bg-green-500"
                  />
                )}
                {testimonials[currentIndex].metrics.energySavings && (
                  <MetricCard
                    icon={Zap}
                    label="Energy Savings"
                    value={testimonials[currentIndex].metrics.energySavings}
                    color="bg-blue-500"
                  />
                )}
                {testimonials[currentIndex].metrics.timeSaved && (
                  <MetricCard
                    icon={Clock}
                    label="Time Saved"
                    value={testimonials[currentIndex].metrics.timeSaved}
                    color="bg-purple-500"
                  />
                )}
              </div>
            </div>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Grid View for Desktop */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
          {testimonials.slice(0, 3).map((testimonial) => (
            <Card
              key={testimonial.id}
              className={`p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform ${
                hoveredCard === testimonial.id ? '-translate-y-2' : ''
              }`}
              onMouseEnter={() => setHoveredCard(testimonial.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {testimonial.growerName}
                  </h3>
                  <p className="text-sm text-gray-600">{testimonial.farmName}</p>
                  <p className="text-xs text-gray-500">{testimonial.location}</p>
                </div>
                <div className="flex">{renderStars(testimonial.rating)}</div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Growing: {testimonial.cropType}
                </p>
              </div>

              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 w-6 h-6 text-gray-200" />
                <p className="text-sm text-gray-700 italic pl-4 line-clamp-4">
                  "{testimonial.quote}"
                </p>
              </div>

              <div className="space-y-2">
                {testimonial.metrics.yieldImprovement && (
                  <div className="flex items-center justify-between py-2 border-t">
                    <span className="text-sm text-gray-600">Yield</span>
                    <span className="text-sm font-bold text-green-600">
                      +{testimonial.metrics.yieldImprovement}
                    </span>
                  </div>
                )}
                {testimonial.metrics.energySavings && (
                  <div className="flex items-center justify-between py-2 border-t">
                    <span className="text-sm text-gray-600">Energy</span>
                    <span className="text-sm font-bold text-blue-600">
                      -{testimonial.metrics.energySavings}
                    </span>
                  </div>
                )}
                {testimonial.metrics.roiPeriod && (
                  <div className="flex items-center justify-between py-2 border-t">
                    <span className="text-sm text-gray-600">ROI</span>
                    <span className="text-sm font-bold text-purple-600">
                      {testimonial.metrics.roiPeriod}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <a
            href="/testimonials"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            View All Success Stories
            <ChevronRight className="ml-2 w-5 h-5" />
          </a>
        </div>

        {/* Summary Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-4xl font-bold text-green-600 mb-2">28%</p>
            <p className="text-sm text-gray-600">Average Yield Increase</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">30%</p>
            <p className="text-sm text-gray-600">Average Energy Savings</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-purple-600 mb-2">14mo</p>
            <p className="text-sm text-gray-600">Average ROI Period</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-orange-600 mb-2">500+</p>
            <p className="text-sm text-gray-600">Happy Growers</p>
          </div>
        </div>
      </div>
    </section>
  );
}