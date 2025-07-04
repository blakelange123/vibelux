'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  DollarSign,
  Package,
  Calendar,
  Truck,
  Shield,
  Eye,
  EyeOff,
  Send,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpDown
} from 'lucide-react';
import { 
  AnonymousTrading, 
  Offer, 
  AnonymousProfile,
  NegotiationMessage 
} from '@/lib/marketplace/anonymous-trading';

interface AnonymousNegotiationProps {
  listing: any;
  currentUserId: string;
  userType: 'buyer' | 'grower';
  anonymousProfile: AnonymousProfile;
  onClose: () => void;
}

export function AnonymousNegotiation({
  listing,
  currentUserId,
  userType,
  anonymousProfile,
  onClose
}: AnonymousNegotiationProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'active' | 'history'>('create');
  const [offerDetails, setOfferDetails] = useState({
    quantity: listing.availability.currentStock,
    pricePerUnit: listing.pricing.price,
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    deliveryMethod: 'delivery' as 'pickup' | 'delivery',
    paymentTerms: 'net30',
    message: ''
  });

  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
  const [negotiationMessages, setNegotiationMessages] = useState<NegotiationMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showIdentityWarning, setShowIdentityWarning] = useState(false);

  const handleCreateOffer = () => {
    const offer = AnonymousTrading.createOffer(
      currentUserId,
      listing,
      offerDetails
    );
    
    setActiveOffer(offer);
    setActiveTab('active');
    
    // Show success message
  };

  const handleCounterOffer = (newPrice: number, newQuantity: number, message: string) => {
    if (!activeOffer) return;
    
    const counteredOffer = AnonymousTrading.counterOffer(
      activeOffer,
      currentUserId,
      {
        pricePerUnit: newPrice,
        quantity: newQuantity,
        message
      }
    );
    
    setActiveOffer(counteredOffer);
  };

  const handleAcceptOffer = () => {
    if (!activeOffer) return;
    
    setShowIdentityWarning(true);
  };

  const confirmAcceptOffer = () => {
    if (!activeOffer) return;
    
    const acceptedOffer = AnonymousTrading.acceptOffer(activeOffer, currentUserId);
    setActiveOffer(acceptedOffer);
    setShowIdentityWarning(false);
  };

  const totalAmount = offerDetails.quantity * offerDetails.pricePerUnit;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Anonymous Negotiation</h2>
              <p className="text-sm text-gray-400 mt-1">
                Your identity is protected until the deal is accepted
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Anonymous Profile Badge */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-lg">
              <EyeOff className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-white">{anonymousProfile.displayName}</span>
            </div>
            {anonymousProfile.badges.map(badge => (
              <span key={badge} className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'create'
                ? 'text-white bg-gray-800 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Create Offer
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'active'
                ? 'text-white bg-gray-800 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Active Negotiation
            {activeOffer && (
              <span className="ml-2 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                1
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-white bg-gray-800 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            History
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {activeTab === 'create' && (
            <div className="p-6">
              {/* Product Summary */}
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-white mb-2">{listing.product.variety}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Available:</span>
                    <span className="text-white ml-2">
                      {listing.availability.currentStock} {listing.availability.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Listed Price:</span>
                    <span className="text-white ml-2">
                      ${listing.pricing.price}/{listing.pricing.unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Offer Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quantity ({listing.availability.unit})
                    </label>
                    <input
                      type="number"
                      value={offerDetails.quantity}
                      onChange={(e) => setOfferDetails({
                        ...offerDetails,
                        quantity: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      min="1"
                      max={listing.availability.currentStock}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Your Offer Price (per {listing.pricing.unit})
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        value={offerDetails.pricePerUnit}
                        onChange={(e) => setOfferDetails({
                          ...offerDetails,
                          pricePerUnit: parseFloat(e.target.value) || 0
                        })}
                        className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      value={offerDetails.deliveryDate.toISOString().split('T')[0]}
                      onChange={(e) => setOfferDetails({
                        ...offerDetails,
                        deliveryDate: new Date(e.target.value)
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Delivery Method
                    </label>
                    <select
                      value={offerDetails.deliveryMethod}
                      onChange={(e) => setOfferDetails({
                        ...offerDetails,
                        deliveryMethod: e.target.value as 'pickup' | 'delivery'
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="delivery">Delivery</option>
                      <option value="pickup">Pickup</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Terms
                  </label>
                  <select
                    value={offerDetails.paymentTerms}
                    onChange={(e) => setOfferDetails({
                      ...offerDetails,
                      paymentTerms: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="immediate">Immediate Payment</option>
                    <option value="net15">Net 15</option>
                    <option value="net30">Net 30</option>
                    <option value="custom">Custom Terms</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={offerDetails.message}
                    onChange={(e) => setOfferDetails({
                      ...offerDetails,
                      message: e.target.value
                    })}
                    rows={3}
                    placeholder="Add any specific requirements or notes..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                  />
                </div>

                {/* Total Summary */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span className="text-gray-300">Total Offer Amount:</span>
                    <span className="text-green-400">${totalAmount.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {offerDetails.quantity} {listing.availability.unit} × ${offerDetails.pricePerUnit}
                  </p>
                </div>

                {/* Privacy Notice */}
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-blue-400 font-medium mb-1">Anonymous Protection Active</p>
                      <p className="text-gray-300">
                        Your identity and business information will remain hidden during negotiations. 
                        Only if both parties accept the deal will identities be revealed.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCreateOffer}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Send Anonymous Offer
                </button>
              </div>
            </div>
          )}

          {activeTab === 'active' && activeOffer && (
            <div className="p-6">
              {/* Offer Status */}
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      activeOffer.status === 'accepted' ? 'bg-green-500' :
                      activeOffer.status === 'rejected' ? 'bg-red-500' :
                      activeOffer.status === 'expired' ? 'bg-gray-500' :
                      'bg-yellow-500'
                    } animate-pulse`} />
                    <span className="text-lg font-semibold text-white capitalize">
                      {activeOffer.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    {AnonymousTrading.getTimeRemaining(activeOffer)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Current Price:</span>
                    <span className="text-white ml-2">
                      ${activeOffer.pricePerUnit}/{listing.pricing.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Quantity:</span>
                    <span className="text-white ml-2">
                      {activeOffer.quantity} {activeOffer.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Total:</span>
                    <span className="text-green-400 ml-2 font-semibold">
                      ${activeOffer.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Delivery:</span>
                    <span className="text-white ml-2">
                      {activeOffer.deliveryDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Negotiation History */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Negotiation History</h3>
                <div className="space-y-3">
                  {activeOffer.history.map((event) => (
                    <div
                      key={event.id}
                      className="bg-gray-800 rounded-lg p-4 border-l-4 border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">
                          {event.type === 'created' && 'Offer Created'}
                          {event.type === 'countered' && 'Counter Offer'}
                          {event.type === 'accepted' && 'Offer Accepted'}
                          {event.type === 'rejected' && 'Offer Rejected'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {event.message && (
                        <p className="text-sm text-gray-300 mb-2">{event.message}</p>
                      )}
                      {event.type === 'countered' && (
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-400">
                            Price: ${event.previousPrice} → ${event.newPrice}
                          </span>
                          <span className="text-gray-400">
                            Qty: {event.previousQuantity} → {event.newQuantity}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {activeOffer.status === 'pending' || activeOffer.status === 'countered' && (
                <div className="flex gap-3">
                  <button
                    onClick={handleAcceptOffer}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Accept Offer
                  </button>
                  <button
                    onClick={() => {/* Show counter form */}}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Counter Offer
                  </button>
                  <button
                    onClick={() => {/* Reject offer */}}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-6">
              <p className="text-gray-400 text-center py-8">
                No completed negotiations yet
              </p>
            </div>
          )}
        </div>

        {/* Identity Warning Modal */}
        {showIdentityWarning && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-6">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-yellow-500" />
                <h3 className="text-lg font-semibold text-white">Identity Will Be Revealed</h3>
              </div>
              <p className="text-gray-300 mb-6">
                By accepting this offer, your identity and business information will be revealed 
                to the other party. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowIdentityWarning(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAcceptOffer}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Accept & Reveal Identity
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}