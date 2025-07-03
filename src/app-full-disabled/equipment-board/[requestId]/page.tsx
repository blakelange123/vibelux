'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Package, Building, MapPin, Calendar, Clock,
  DollarSign, TrendingUp, Users, MessageSquare, Shield,
  CheckCircle, AlertCircle, Eye, Edit, Share2, Flag,
  FileText, Download, Plus, Send, X, Loader2, Info
} from 'lucide-react';

interface EquipmentRequest {
  id: string;
  title: string;
  equipmentType: string;
  brand: string;
  specifications: {
    power: string;
    coverage: string;
    features: string[];
    requirements: string[];
  };
  quantity: number;
  estimatedValue: number;
  proposedRevShare: number;
  termMonths: number;
  description: string;
  useCase: string;
  expectedROI: number;
  currentSituation: string;
  deliveryLocation: string;
  neededBy: string;
  installationReady: boolean;
  status: string;
  viewCount: number;
  facility: {
    id: string;
    name: string;
    type: string;
    city: string;
    state: string;
    size: number;
  };
  requester: {
    id: string;
    name: string;
    email: string;
    verified: boolean;
    memberSince: string;
  };
  offers: Array<{
    id: string;
    investorName: string;
    equipmentValue: number;
    proposedRevShare: number;
    status: string;
  }>;
  createdAt: string;
}

interface Question {
  id: string;
  askerName: string;
  question: string;
  answer?: string;
  askedAt: string;
  answeredAt?: string;
}

export default function EquipmentRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { requestId } = params;
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Mock data - would be fetched based on requestId
  const request: EquipmentRequest = {
    id: requestId as string,
    title: '500 LED Grow Lights for Expansion',
    equipmentType: 'LED Grow Lights',
    brand: 'Fluence or equivalent',
    specifications: {
      power: '630W per fixture',
      coverage: '4x4 ft per fixture',
      features: ['Full spectrum', 'Dimmable', 'Daisy chainable', 'IP65 rated'],
      requirements: ['240V power', 'Mounting height 6-8ft', 'Environmental controls']
    },
    quantity: 500,
    estimatedValue: 425000,
    proposedRevShare: 12,
    termMonths: 48,
    description: 'We are expanding our facility and need high-efficiency LED grow lights for our new 20,000 sq ft growing area. Looking for a reliable investor partner to provide equipment through revenue sharing.',
    useCase: 'The lights will be used for leafy greens production in our controlled environment. We have a proven track record with our existing 10,000 sq ft operation.',
    expectedROI: 35,
    currentSituation: 'Currently using older HPS lights in existing facility. Ready to upgrade to LED for better efficiency and yields.',
    deliveryLocation: 'Sacramento, CA 95820',
    neededBy: '2024-04-15',
    installationReady: true,
    status: 'OPEN',
    viewCount: 342,
    facility: {
      id: 'FAC-123',
      name: 'Green Valley Farms',
      type: 'Greenhouse',
      city: 'Sacramento',
      state: 'CA',
      size: 30000
    },
    requester: {
      id: 'USR-456',
      name: 'John Smith',
      email: 'john@greenvalleyfarms.com',
      verified: true,
      memberSince: '2023-06-15'
    },
    offers: [
      {
        id: 'OFF-1',
        investorName: 'LED Partners Inc',
        equipmentValue: 420000,
        proposedRevShare: 11,
        status: 'PENDING'
      },
      {
        id: 'OFF-2',
        investorName: 'Growth Capital LLC',
        equipmentValue: 425000,
        proposedRevShare: 12.5,
        status: 'PENDING'
      }
    ],
    createdAt: '2024-02-15'
  };

  const questions: Question[] = [
    {
      id: 'Q1',
      askerName: 'InvestorPro',
      question: 'What are your current monthly energy costs with the HPS lights?',
      answer: 'Currently spending about $8,500/month on energy. We expect LED to reduce this by 40%.',
      askedAt: '2024-02-16',
      answeredAt: '2024-02-16'
    },
    {
      id: 'Q2',
      askerName: 'GreenTech Capital',
      question: 'Do you have historical yield data from your existing operation?',
      answer: 'Yes, we average 2.5 lbs per sq ft per month with leafy greens. Happy to share detailed reports.',
      askedAt: '2024-02-17',
      answeredAt: '2024-02-17'
    }
  ];

  const platformFee = request.estimatedValue * 0.15;
  const monthlyRevShare = (request.estimatedValue * 0.1 * request.proposedRevShare) / 100;

  const handleSubmitOffer = () => {
    router.push(`/equipment-board/${requestId}/offer`);
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return;
    
    setSubmitting(true);
    try {
      // Submit question
      await fetch(`/api/equipment-requests/${requestId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion })
      });
      
      setNewQuestion('');
      setShowQuestionModal(false);
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const isRequester = true; // Would check if current user is the requester

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/equipment-board"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Equipment Board
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{request.title}</h1>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {request.facility.name}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {request.facility.city}, {request.facility.state}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Posted {new Date(request.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {request.viewCount} views
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isRequester ? (
                <>
                  <button className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <button className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    <Flag className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Equipment Details */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Equipment Details</h2>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Type</div>
                  <div className="text-white">{request.equipmentType}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Preferred Brand</div>
                  <div className="text-white">{request.brand}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Quantity</div>
                  <div className="text-white">{request.quantity} units</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Estimated Value</div>
                  <div className="text-white">${request.estimatedValue.toLocaleString()}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Specifications</h3>
                  <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Power</span>
                      <span className="text-white">{request.specifications.power}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Coverage</span>
                      <span className="text-white">{request.specifications.coverage}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Features Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {request.specifications.features.map((feature, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Installation Requirements</h3>
                  <ul className="space-y-1">
                    {request.specifications.requirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{request.description}</p>
              
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Use Case</h3>
                  <p className="text-gray-400">{request.useCase}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Current Situation</h3>
                  <p className="text-gray-400">{request.currentSituation}</p>
                </div>
              </div>
            </div>

            {/* Q&A Section */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Questions & Answers</h2>
                {!isRequester && (
                  <button
                    onClick={() => setShowQuestionModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ask Question
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">{q.askerName}</span>
                          <span className="text-xs text-gray-500">{new Date(q.askedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-300 mb-2">{q.question}</p>
                        {q.answer && (
                          <div className="mt-3 pl-4 border-l-2 border-purple-600/50">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-purple-400">Response from {request.requester.name}</span>
                              <span className="text-xs text-gray-500">{new Date(q.answeredAt!).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-400">{q.answer}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {questions.length === 0 && (
                <p className="text-center text-gray-400 py-8">No questions yet. Be the first to ask!</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investment Terms */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Investment Terms</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Equipment Value</span>
                    <span className="text-2xl font-bold text-white">${request.estimatedValue.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-white/10">
                  <span className="text-sm text-gray-400">Revenue Share</span>
                  <span className="text-lg font-medium text-white">{request.proposedRevShare}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Term Length</span>
                  <span className="text-lg font-medium text-white">{request.termMonths} months</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Expected ROI</span>
                  <span className="text-lg font-medium text-green-400">{request.expectedROI}%</span>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Platform Fee (15%)</span>
                    <span className="text-lg font-medium text-purple-400">${platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Est. Monthly Rev Share</span>
                    <span className="text-lg font-medium text-green-400">${monthlyRevShare.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {!isRequester && (
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200"
                >
                  Submit Offer
                </button>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Equipment Needed By</span>
                  <span className="text-white font-medium">{new Date(request.neededBy).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Delivery Location</span>
                  <span className="text-white">{request.deliveryLocation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Installation Ready</span>
                  <span className="flex items-center gap-1">
                    {request.installationReady ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">Yes</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-red-400" />
                        <span className="text-red-400">No</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Facility Info */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Facility Information</h3>
              
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{request.facility.name}</h4>
                  <p className="text-sm text-gray-400">{request.facility.type}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Size</span>
                  <span className="text-white">{request.facility.size.toLocaleString()} sq ft</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Location</span>
                  <span className="text-white">{request.facility.city}, {request.facility.state}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                    {request.requester.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{request.requester.name}</span>
                      {request.requester.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400">Member since {new Date(request.requester.memberSince).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Offers */}
            {isRequester && request.offers.length > 0 && (
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Current Offers</h3>
                <div className="space-y-3">
                  {request.offers.map((offer) => (
                    <Link
                      key={offer.id}
                      href={`/equipment-board/${requestId}/offers/${offer.id}`}
                      className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white">{offer.investorName}</span>
                        <span className="text-xs text-gray-400">View →</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">${offer.equipmentValue.toLocaleString()}</span>
                        <span className="text-purple-400">{offer.proposedRevShare}% rev share</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  {request.offers.length} offer{request.offers.length !== 1 ? 's' : ''} received
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-gray-900 rounded-2xl border border-white/10 max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Ready to Submit an Offer?</h3>
            <p className="text-gray-400 mb-6">
              You'll be able to customize your offer terms and provide equipment details on the next page.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowOfferModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitOffer}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ask Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-gray-900 rounded-2xl border border-white/10 max-w-lg w-full p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Ask a Question</h3>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="What would you like to know about this equipment request?"
              className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowQuestionModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuestion}
                disabled={!newQuestion.trim() || submitting}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}