'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Shield,
  Lock,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  FileText,
  TrendingUp
} from 'lucide-react';
import { PlatformProtection } from '@/lib/marketplace/platform-protection';

interface CheckoutProps {
  cart: {
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
      vendorId: string;
      vendorName: string;
    }>;
    subtotal: number;
  };
  buyerId: string;
}

export function MarketplaceCheckout({ cart, buyerId }: CheckoutProps) {
  const [step, setStep] = useState<'shipping' | 'payment' | 'review' | 'complete'>('shipping');
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'ach' | 'terms'>('credit');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const platformProtection = new PlatformProtection();
  
  // Calculate fees and totals
  const platformFee = cart.subtotal * 0.15;
  const estimatedTax = cart.subtotal * 0.08;
  const shipping = cart.subtotal > 500 ? 0 : 50;
  const total = cart.subtotal + estimatedTax + shipping;
  const vendorPayout = cart.subtotal - platformFee;

  const handlePlaceOrder = async () => {
    if (!agreeToTerms) return;

    // Validate transaction
    const validation = platformProtection.validateTransaction({
      vendorId: cart.items[0].vendorId,
      buyerId,
      amount: cart.subtotal,
      productIds: cart.items.map(item => item.id)
    });

    if (validation.valid) {
      // Process order
      setStep('complete');
      
      // Generate contract
      const contract = platformProtection.generatePlatformAgreement({
        orderId: `ORD-${Date.now()}`,
        buyerId,
        vendorId: cart.items[0].vendorId,
        amount: total,
        platformFee: validation.platformFee
      });

    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Secure Checkout</h1>
          <div className="flex items-center gap-2 text-green-400">
            <Shield className="w-5 h-5" />
            <span className="text-sm">Protected by Vibelux Platform Protection</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {['Shipping', 'Payment', 'Review'].map((label, index) => {
            const isActive = 
              (index === 0 && step === 'shipping') ||
              (index === 1 && step === 'payment') ||
              (index === 2 && step === 'review');
            const isComplete = 
              (index === 0 && (step === 'payment' || step === 'review' || step === 'complete')) ||
              (index === 1 && (step === 'review' || step === 'complete'));

            return (
              <div key={label} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${isActive ? 'bg-purple-600 text-white' : 
                      isComplete ? 'bg-green-600 text-white' : 
                      'bg-gray-800 text-gray-400'}
                  `}>
                    {isComplete ? <CheckCircle className="w-5 h-5" /> : index + 1}
                  </div>
                  <span className={`ml-3 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    isComplete ? 'bg-green-600' : 'bg-gray-800'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <div className="bg-gray-900 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.name}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.company}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, company: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.zipCode}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep('payment')}
                  className="w-full mt-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-gray-900 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
                
                <div className="space-y-4 mb-6">
                  <label className={`
                    block p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${paymentMethod === 'credit' 
                      ? 'border-purple-600 bg-purple-600/10' 
                      : 'border-gray-700 hover:border-gray-600'}
                  `}>
                    <input
                      type="radio"
                      name="payment"
                      value="credit"
                      checked={paymentMethod === 'credit'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5" />
                        <div>
                          <p className="font-medium">Credit Card</p>
                          <p className="text-sm text-gray-400">Instant processing</p>
                        </div>
                      </div>
                      <CheckCircle className={`w-5 h-5 ${
                        paymentMethod === 'credit' ? 'text-purple-400' : 'text-gray-600'
                      }`} />
                    </div>
                  </label>

                  <label className={`
                    block p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${paymentMethod === 'ach' 
                      ? 'border-purple-600 bg-purple-600/10' 
                      : 'border-gray-700 hover:border-gray-600'}
                  `}>
                    <input
                      type="radio"
                      name="payment"
                      value="ach"
                      checked={paymentMethod === 'ach'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5" />
                        <div>
                          <p className="font-medium">ACH Transfer</p>
                          <p className="text-sm text-gray-400">Lower fees, 2-3 days</p>
                        </div>
                      </div>
                      <CheckCircle className={`w-5 h-5 ${
                        paymentMethod === 'ach' ? 'text-purple-400' : 'text-gray-600'
                      }`} />
                    </div>
                  </label>

                  <label className={`
                    block p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${paymentMethod === 'terms' 
                      ? 'border-purple-600 bg-purple-600/10' 
                      : 'border-gray-700 hover:border-gray-600'}
                  `}>
                    <input
                      type="radio"
                      name="payment"
                      value="terms"
                      checked={paymentMethod === 'terms'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5" />
                        <div>
                          <p className="font-medium">Net Terms</p>
                          <p className="text-sm text-gray-400">Requires approval</p>
                        </div>
                      </div>
                      <CheckCircle className={`w-5 h-5 ${
                        paymentMethod === 'terms' ? 'text-purple-400' : 'text-gray-600'
                      }`} />
                    </div>
                  </label>
                </div>

                {paymentMethod === 'credit' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep('shipping')}
                    className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep('review')}
                    className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="bg-gray-900 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">Review & Place Order</h2>
                
                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {cart.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-400">
                            Sold by {item.vendorName} • Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform Protection Notice */}
                <div className="mb-6 p-4 bg-blue-900/20 border border-blue-600 rounded-lg">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-300 mb-1">Platform Protection</h4>
                      <ul className="text-sm text-blue-200 space-y-1">
                        <li>• Buyer protection for all purchases</li>
                        <li>• Secure payment processing</li>
                        <li>• Dispute resolution services</li>
                        <li>• Quality guarantee from verified vendors</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="mb-6">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="rounded bg-gray-800 border-gray-700 text-purple-600 focus:ring-purple-500 mt-1"
                    />
                    <div className="text-sm">
                      <p>I agree to the following terms:</p>
                      <ul className="mt-2 space-y-1 text-gray-400">
                        <li>• This transaction is subject to Vibelux platform terms</li>
                        <li>• A 15% platform fee applies to support secure transactions</li>
                        <li>• All communications must remain on the platform</li>
                        <li>• Attempting to circumvent fees violates terms of service</li>
                      </ul>
                    </div>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep('payment')}
                    className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={!agreeToTerms}
                    className={`flex-1 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      agreeToTerms 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    Place Secure Order
                  </button>
                </div>
              </div>
            )}

            {step === 'complete' && (
              <div className="bg-gray-900 rounded-xl p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
                <p className="text-gray-400 mb-6">
                  Your order has been confirmed and the vendor has been notified.
                </p>
                
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-400 mb-1">Order Number</p>
                  <p className="font-mono text-lg">ORD-{Date.now()}</p>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-green-400 mb-6">
                  <Shield className="w-4 h-4" />
                  <span>Protected by Vibelux Platform Guarantee</span>
                </div>

                <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  View Order Details
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Platform Fee (15%)</span>
                  <span className="text-orange-400">${platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Estimated Tax</span>
                  <span>${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-4 mb-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Buyer Protection</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <Shield className="w-4 h-4" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <Truck className="w-4 h-4" />
                  <span>Tracked Shipping</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <Clock className="w-4 h-4" />
                  <span>24/7 Support</span>
                </div>
              </div>

              {/* Vendor Payout Info */}
              <div className="mt-6 p-3 bg-gray-800 rounded-lg text-sm">
                <p className="text-gray-400 mb-1">Vendor Receives</p>
                <p className="font-semibold">${vendorPayout.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">After platform fee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}