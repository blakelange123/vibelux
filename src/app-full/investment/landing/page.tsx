'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Building2, 
  Users, 
  Shield,
  DollarSign,
  Zap,
  ArrowRight,
  CheckCircle,
  BarChart,
  Leaf,
  Target,
  HandshakeIcon,
  MessageSquare,
  FileCheck,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function InvestmentLanding() {
  const router = useRouter();
  const [userType, setUserType] = useState<'investor' | 'grower' | null>(null);

  const investorBenefits = [
    { icon: TrendingUp, title: 'High Returns', description: '18-25% target IRR on equipment investments' },
    { icon: Shield, title: 'Asset-Backed', description: 'Physical equipment with UCC-1 security' },
    { icon: BarChart, title: 'Real-Time Monitoring', description: 'Track performance metrics 24/7' },
    { icon: HandshakeIcon, title: 'Direct Relationships', description: 'No pooling - direct facility partnerships' }
  ];

  const growerBenefits = [
    { icon: DollarSign, title: 'Zero Upfront Cost', description: 'Get equipment with no capital required' },
    { icon: Zap, title: 'Energy Savings', description: '30-40% reduction in energy costs' },
    { icon: Leaf, title: 'Yield Improvement', description: '20-30% increase in production' },
    { icon: Users, title: 'Expert Support', description: 'Technical assistance and optimization' }
  ];

  const processSteps = [
    { step: 1, title: 'Create Profile', description: 'Quick onboarding with financial verification' },
    { step: 2, title: 'Get Matched', description: 'AI matches you with compatible partners' },
    { step: 3, title: 'Due Diligence', description: 'Review detailed metrics and projections' },
    { step: 4, title: 'Close Deal', description: 'Digital contracts and automated payments' }
  ];

  const stats = [
    { value: '$12M+', label: 'Invested' },
    { value: '87%', label: 'Success Rate' },
    { value: '156', label: 'Active Facilities' },
    { value: '22%', label: 'Avg Returns' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge className="mb-4 bg-blue-900/50 text-blue-300 border-blue-600">
            <Sparkles className="w-3 h-3 mr-1" />
            Smart Investment Matching Platform
          </Badge>
          <h1 className="text-5xl font-bold text-white mb-6">
            Connect Capital with Cannabis Cultivation
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            VibeLux matches accredited investors with high-growth indoor farming facilities 
            seeking equipment financing and operational improvements.
          </p>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mb-12 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* User Type Selection */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
              onClick={() => setUserType('investor')}
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              I'm an Investor
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-green-600 text-green-400 hover:bg-green-900/20 px-8 py-6 text-lg"
              onClick={() => setUserType('grower')}
            >
              <Building2 className="w-5 h-5 mr-2" />
              I'm a Grower
            </Button>
          </div>
        </div>

        {/* Benefits Section */}
        {userType && (
          <div className="mb-16 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-center text-white mb-8">
              {userType === 'investor' ? 'Why Invest Through VibeLux' : 'Why Partner with VibeLux'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {(userType === 'investor' ? investorBenefits : growerBenefits).map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <Card key={benefit.title} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <Icon className={`w-8 h-8 mb-2 ${
                        userType === 'investor' ? 'text-blue-400' : 'text-green-400'
                      }`} />
                      <CardTitle className="text-lg text-white">{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-white mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {processSteps.map((step, index) => (
              <div key={step.step} className="relative">
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-700 -z-10" />
                )}
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-purple-600">
                    <span className="text-xl font-bold text-purple-300">{step.step}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Types */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-white mb-8">Investment Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">GaaS (Growing as a Service)</CardTitle>
                <CardDescription className="text-gray-400">Equipment financing model</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <span>Fixed monthly payments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <span>Equipment ownership transfer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <span>Predictable returns</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">YEP (Yield Enhancement)</CardTitle>
                <CardDescription className="text-gray-400">Performance-based model</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <span>Revenue share on improvements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <span>Aligned incentives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <span>Higher return potential</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Hybrid Model</CardTitle>
                <CardDescription className="text-gray-400">Best of both worlds</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <span>Base payments + upside</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <span>Risk mitigation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <span>Flexible terms</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Built for Trust & Transparency</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <Shield className="w-8 h-8 text-purple-400 mb-2" />
              <p className="font-semibold text-white">SEC Compliant</p>
              <p className="text-sm text-gray-400">Regulation D offerings</p>
            </div>
            <div className="flex flex-col items-center">
              <FileCheck className="w-8 h-8 text-purple-400 mb-2" />
              <p className="font-semibold text-white">Due Diligence</p>
              <p className="text-sm text-gray-400">Verified financials</p>
            </div>
            <div className="flex flex-col items-center">
              <MessageSquare className="w-8 h-8 text-purple-400 mb-2" />
              <p className="font-semibold text-white">Direct Communication</p>
              <p className="text-sm text-gray-400">In-platform messaging</p>
            </div>
            <div className="flex flex-col items-center">
              <Target className="w-8 h-8 text-purple-400 mb-2" />
              <p className="font-semibold text-white">Smart Matching</p>
              <p className="text-sm text-gray-400">AI-powered compatibility</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {userType && (
          <div className="text-center animate-in fade-in duration-500">
            <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-purple-600 max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  {userType === 'investor' 
                    ? 'Start Investing in High-Growth Cannabis Facilities'
                    : 'Get Funding for Your Equipment Upgrades'
                  }
                </h3>
                <p className="text-gray-300 mb-6">
                  {userType === 'investor'
                    ? 'Join our network of accredited investors earning strong returns while supporting sustainable agriculture.'
                    : 'Access capital with no upfront costs and pay only from the savings and increased yields.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href={userType === 'investor' ? '/investment/onboarding' : '/facility/onboarding'}>
                    <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href={userType === 'investor' ? '/investment' : '/facility'}>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      Explore Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}