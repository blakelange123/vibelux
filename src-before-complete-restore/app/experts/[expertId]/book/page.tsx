'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Shield,
  AlertTriangle,
  CreditCard,
  MessageSquare,
  FileText,
  Check,
  ChevronRight,
  Lock
} from 'lucide-react';

export default function BookExpertPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(1);
  const [objectives, setObjectives] = useState<string>('');
  const [preparationNotes, setPreparationNotes] = useState<string>('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Get available time slots for selected date
  useEffect(() => {
    if (selectedDate) {
      // In production, this would fetch from API based on expert's availability
      const slots = generateTimeSlots();
      setAvailableSlots(slots);
    }
  }, [selectedDate]);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const calculateTotal = () => {
    const hourlyRate = 200; // Base rate, would fetch from expert data
    return hourlyRate * duration;
  };

  const platformFee = () => {
    return calculateTotal() * 0.1;
  };

  const expertEarnings = () => {
    return calculateTotal() * 0.9;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      // Create consultation booking
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expertId: params.expertId,
          scheduledDate: selectedDate,
          scheduledTime: selectedTime,
          duration: duration * 60, // Convert to minutes
          objectives: objectives.split('\n').filter(o => o.trim()),
          preparationNotes,
          totalAmount: calculateTotal(),
          platformFee: platformFee(),
          expertEarnings: expertEarnings()
        })
      });

      if (response.ok) {
        const { consultationId, checkoutUrl } = await response.json();
        // Redirect to Stripe checkout
        window.location.href = checkoutUrl;
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-b border-indigo-800/30">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
          <Link 
            href={`/experts/${params.expertId}`}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Expert Profile
          </Link>
          
          <h1 className="text-3xl font-bold text-white mb-2">Book Your Consultation</h1>
          <p className="text-gray-400">Complete the booking details below</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Date and Time Selection */}
          <div className="bg-gray-800 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Select Date & Time
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Time (PST)
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                  disabled={!selectedDate}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="">Select a time</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value={1}>1 hour</option>
                <option value={1.5}>1.5 hours</option>
                <option value={2}>2 hours</option>
                <option value={3}>3 hours</option>
              </select>
            </div>
          </div>

          {/* Consultation Details */}
          <div className="bg-gray-800 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Consultation Details
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What would you like to achieve? (Required)
                </label>
                <textarea
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  rows={4}
                  required
                  placeholder="Please list your main objectives for this consultation. Be as specific as possible..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
                />
                <p className="text-sm text-gray-400 mt-2">
                  Enter each objective on a new line
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preparation Notes (Optional)
                </label>
                <textarea
                  value={preparationNotes}
                  onChange={(e) => setPreparationNotes(e.target.value)}
                  rows={4}
                  placeholder="Any background information, specific questions, or materials you'd like to discuss..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-800 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              Payment Summary
            </h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Consultation ({duration} hour{duration > 1 ? 's' : ''})</span>
                <span className="text-white">${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Platform fee (10%)</span>
                <span className="text-white">${platformFee().toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-700 pt-3 flex justify-between">
                <span className="text-lg font-semibold text-white">Total</span>
                <span className="text-lg font-semibold text-white">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-300 flex items-start gap-2">
                <Lock className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                Your payment is secure and will be held in escrow until the consultation is completed.
              </p>
            </div>
          </div>

          {/* Platform Terms */}
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-8">
            <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Important Terms & Conditions
            </h2>
            
            <div className="space-y-4 text-sm text-gray-300 mb-6">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p>All consultations must be conducted through the VibeLux platform video system</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p>Sharing contact information for off-platform communication is prohibited</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p>Sessions may be recorded for quality and dispute resolution (with consent)</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p>Cancellations must be made at least 24 hours in advance for a full refund</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p>Expert earnings (90% of consultation fee) are released after session completion</p>
              </div>
            </div>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-300">
                I agree to the VibeLux Expert Consultation Terms & Conditions and understand that 
                all consultations must be conducted through the platform
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col items-center gap-4">
            <button
              type="submit"
              disabled={!agreeToTerms || isLoading}
              className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  Continue to Payment
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            <p className="text-sm text-gray-400 text-center">
              You will be redirected to our secure payment processor
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}