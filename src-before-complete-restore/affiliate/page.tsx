'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  DollarSign,
  TrendingUp,
  Link2,
  Gift,
  Target,
  Award,
  Rocket,
  Shield,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Zap,
  Building,
  Crown,
  Star,
  Info,
  Globe,
  Share2,
  MessageSquare
} from 'lucide-react';

export default function AffiliatePage() {
  const [email, setEmail] = useState('');

  const affiliateTiers = [
    {
      name: 'Bronze Partner',
      icon: Award,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-700/50',
      requirements: '1-10 active referrals',
      commission: '25% → 3%',
      commissionDetail: 'Starts at 25% first 6 months',
      benefits: [
        '$50 signup bonus per referral',
        '$100 retention bonus (12+ months)',
        'Monthly automated payments',
        'Real-time tracking dashboard',
        'Marketing materials & training'
      ]
    },
    {
      name: 'Silver Partner', 
      icon: Award,
      color: 'text-gray-300',
      bgColor: 'bg-gray-700/20',
      borderColor: 'border-gray-600/50',
      requirements: '11-50 active referrals',
      commission: '30% → 5%',
      commissionDetail: 'Starts at 30% first 6 months',
      benefits: [
        '$100 signup bonus per referral',
        '$200 retention bonus (12+ months)', 
        'Everything in Bronze',
        'Priority support & training',
        'Custom landing pages'
      ]
    },
    {
      name: 'Gold Partner',
      icon: Crown,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-700/50',
      requirements: '51+ active referrals',
      commission: '35% → 8%',
      commissionDetail: 'Starts at 35% first 6 months',
      benefits: [
        '$200 signup bonus per referral',
        '$500 retention bonus (12+ months)',
        'Everything in Silver',
        'Dedicated account manager',
        'Co-branded materials & instant payouts'
      ]
    }
  ];

  const earningsExamples = [
    {
      facilitySize: 'Professional Subscription',
      monthlyRevenue: '$49/month',
      firstYearEarnings: '$235',
      lifetimeEarnings: '$445',
      description: 'Fixed subscription customer'
    },
    {
      facilitySize: 'Small Revenue Sharing',
      monthlyRevenue: '$500/month avg',
      firstYearEarnings: '$2,400',
      lifetimeEarnings: '$4,800',
      description: 'Performance-based customer'
    },
    {
      facilitySize: 'Large Revenue Sharing',
      monthlyRevenue: '$2,000/month avg',
      firstYearEarnings: '$9,600',
      lifetimeEarnings: '$19,200',
      description: 'High-value enterprise customer'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 bg-gradient-to-br from-purple-900/20 via-gray-950 to-gray-950">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 backdrop-blur-sm rounded-full border border-green-700/50">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">Earn 20-30% Commission</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="text-white">Partner With Vibelux</span>
              <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                Earn Recurring Revenue
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Join our affiliate program and earn generous commissions by helping growers 
              save money with our revolutionary revenue-sharing platform. No upfront costs 
              for your referrals means easier sales and higher conversions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/affiliate/signup" 
                className="group px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300 flex items-center gap-2"
              >
                Become an Affiliate
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/affiliate/login" 
                className="px-8 py-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border border-gray-700 hover:bg-gray-800/70 transition-all duration-300"
              >
                Affiliate Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-900 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How the Affiliate Program Works
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Simple, transparent, and lucrative - start earning in minutes
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Sign Up Free</h3>
              <p className="text-gray-400 text-sm">
                Create your affiliate account and get instant access to your dashboard
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Get Your Links</h3>
              <p className="text-gray-400 text-sm">
                Generate custom tracking links and marketing materials
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Share & Promote</h3>
              <p className="text-gray-400 text-sm">
                Share with your network of growers and industry contacts
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-400">4</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Earn Commissions</h3>
              <p className="text-gray-400 text-sm">
                Get paid monthly for every customer you refer
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Structure */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Generous Commission Structure
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Earn recurring commissions on all revenue sharing payments from your referrals
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {affiliateTiers.map((tier, index) => (
              <div 
                key={tier.name}
                className={`${tier.bgColor} rounded-2xl p-8 border ${tier.borderColor} relative`}
              >
                {index === 2 && (
                  <div className="absolute -top-3 left-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-sm px-3 py-1 rounded-full font-bold">
                    HIGHEST TIER
                  </div>
                )}
                <div className={`w-14 h-14 ${tier.bgColor} rounded-xl flex items-center justify-center mb-6`}>
                  <tier.icon className={`w-7 h-7 ${tier.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{tier.requirements}</p>
                <div className="mb-6">
                  <p className="text-3xl font-bold text-white">{tier.commission}</p>
                  <p className="text-sm text-gray-400">{tier.commissionDetail}</p>
                  <p className="text-xs text-gray-500 mt-1">Declining rate structure</p>
                </div>
                <ul className="space-y-2">
                  {tier.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className={`w-4 h-4 ${tier.color}`} />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Smart Commission Structure */}
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-2xl p-8 border border-green-700/50">
            <h3 className="text-2xl font-bold text-white mb-2 text-center">
              Smart Commission Structure
            </h3>
            <p className="text-gray-400 text-center mb-6">
              Higher rates when it matters most - front-loaded for maximum motivation
            </p>
            
            {/* Commission Timeline */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Commission Rate Timeline (Gold Partner)</span>
                <span className="text-sm text-gray-400">Revenue Sharing Customer</span>
              </div>
              <div className="relative">
                <div className="flex h-8 bg-gray-800 rounded-lg overflow-hidden">
                  <div className="bg-green-500 flex-1 flex items-center justify-center text-white text-sm font-medium">
                    30% (Months 1-6)
                  </div>
                  <div className="bg-green-400 flex-1 flex items-center justify-center text-white text-sm font-medium">
                    20% (Months 7-18)
                  </div>
                  <div className="bg-green-300 flex-1 flex items-center justify-center text-gray-800 text-sm font-medium">
                    12% (Months 19-36)
                  </div>
                  <div className="bg-green-200 flex-1 flex items-center justify-center text-gray-800 text-sm font-medium">
                    6% (37+ Months)
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>High Growth</span>
                  <span>Established</span>
                  <span>Mature</span>
                  <span>Maintenance</span>
                </div>
              </div>
            </div>

            {/* Earnings Examples */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400">Customer Type</th>
                    <th className="text-left py-3 px-4 text-gray-400">Monthly Value</th>
                    <th className="text-left py-3 px-4 text-gray-400">First Year Earnings</th>
                    <th className="text-left py-3 px-4 text-gray-400">Lifetime Total</th>
                  </tr>
                </thead>
                <tbody>
                  {earningsExamples.map((example) => (
                    <tr key={example.facilitySize} className="border-b border-gray-800">
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">{example.facilitySize}</p>
                          <p className="text-sm text-gray-400">{example.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-300 font-medium">{example.monthlyRevenue}</td>
                      <td className="py-4 px-4 text-green-400 font-semibold">{example.firstYearEarnings}</td>
                      <td className="py-4 px-4 text-green-400 font-bold">{example.lifetimeEarnings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bonuses */}
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">$50-200</div>
                <div className="text-sm text-gray-400">Instant Signup Bonus</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">$100-500</div>
                <div className="text-sm text-gray-400">12-Month Retention Bonus</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">+3-8%</div>
                <div className="text-sm text-gray-400">Growth Performance Bonus</div>
              </div>
            </div>

            <p className="text-sm text-gray-400 mt-6 text-center">
              * Gold Partner rates shown. Bronze starts at 20%, Silver at 25%. All tiers include bonuses.
            </p>
          </div>
        </div>
      </section>

      {/* Why Promote Vibelux */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Promote Vibelux?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our unique revenue sharing model makes it easy to sell and profitable for everyone
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-xl p-6">
              <Zap className="w-10 h-10 text-yellow-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Easy to Sell</h3>
              <p className="text-gray-400">
                $0 upfront cost for customers means no budget objections. They only pay from savings.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6">
              <TrendingUp className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Recurring Revenue</h3>
              <p className="text-gray-400">
                Earn commissions every month for the lifetime of your referrals. Build passive income.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6">
              <Shield className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Trusted Platform</h3>
              <p className="text-gray-400">
                Proven technology with guaranteed ROI. Happy customers mean long-term commissions.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6">
              <Gift className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Marketing Support</h3>
              <p className="text-gray-400">
                Professional materials, landing pages, and training to help you succeed.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6">
              <BarChart3 className="w-10 h-10 text-orange-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Real-Time Tracking</h3>
              <p className="text-gray-400">
                Advanced dashboard shows clicks, conversions, and earnings in real-time.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6">
              <Users className="w-10 h-10 text-pink-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Growing Market</h3>
              <p className="text-gray-400">
                Cannabis and CEA industries are booming. Tap into billions in potential revenue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Affiliate Tools */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powerful Affiliate Tools
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to succeed as a Vibelux affiliate partner
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <Link2 className="w-6 h-6 text-purple-400" />
                Marketing Resources
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Custom tracking links with UTM parameters
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Professionally designed banners and ads
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Email templates and swipe copy
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Social media content and graphics
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Webinar and presentation materials
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                Analytics Dashboard
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Real-time click and conversion tracking
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Detailed revenue reports and forecasts
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Geographic and demographic insights
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  A/B testing for landing pages
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Commission payment history
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Who Should Join */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Perfect for Industry Professionals
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              If you have connections in the growing industry, you can earn significant income
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <Building className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">Consultants</h3>
              <p className="text-sm text-gray-400">
                Add value for clients while earning commissions
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <Users className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">Equipment Dealers</h3>
              <p className="text-sm text-gray-400">
                Bundle software with lighting equipment sales
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <Globe className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">Industry Influencers</h3>
              <p className="text-sm text-gray-400">
                Monetize your audience with valuable solutions
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <MessageSquare className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">Content Creators</h3>
              <p className="text-sm text-gray-400">
                Share Vibelux and earn from your content
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sign Up CTA */}
      <section className="py-20 bg-gradient-to-br from-green-900/20 to-gray-950">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Earning Today
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of affiliates already earning with Vibelux
          </p>
          
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md mx-auto">
            <form className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
              />
              <Link
                href="/affiliate/signup"
                className="block w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all"
              >
                Create Affiliate Account
              </Link>
            </form>
            
            <div className="mt-6 flex items-center gap-6 justify-center text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Free to join
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400" />
                No quotas
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-400 mt-8">
            Already an affiliate? 
            <Link href="/affiliate/login" className="text-green-400 hover:text-green-300 ml-1">
              Log in to your dashboard
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}