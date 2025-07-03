'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  ArrowRight,
  Check,
  ShoppingCart,
  Users,
  TrendingUp,
  Shield,
  Package,
  Truck,
  BarChart3,
  DollarSign,
  Globe,
  Play,
  Star,
  Leaf
} from 'lucide-react';

const features = [
  {
    icon: Package,
    title: 'Product Listings',
    description: 'Create detailed listings with photos, certifications, and real-time inventory'
  },
  {
    icon: Users,
    title: 'Verified Network',
    description: 'Early access to connect with incoming buyers including restaurants and retailers'
  },
  {
    icon: Truck,
    title: 'Order Management',
    description: 'Handle orders from placement to delivery with automated workflows'
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track sales, inventory turnover, and market demand insights'
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Protected transactions with automated invoicing and payment processing'
  },
  {
    icon: Globe,
    title: 'Market Intelligence',
    description: 'Price recommendations based on market conditions and demand'
  }
];

const productCategories = [
  'Leafy Greens', 'Herbs', 'Microgreens', 'Tomatoes', 'Berries', 
  'Cucumbers', 'Peppers', 'Floriculture', 'Mushrooms', 'Cannabis', 'Specialty Crops'
];

const benefits = {
  growers: [
    'Direct access to buyers - no middlemen',
    'Set your own prices and terms',
    'Reduce waste with pre-orders',
    'Build lasting customer relationships',
    'Automated inventory sync with VibeLux',
    'Professional storefront in minutes'
  ],
  buyers: [
    'Source directly from local growers',
    'Transparent pricing and availability',
    'Quality guarantees and certifications',
    'Flexible delivery options',
    'Consolidated ordering from multiple farms',
    'Fresh produce within 24-48 hours'
  ]
};

export default function MarketplaceFeaturePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-600/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Features
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div className="px-4 py-2 bg-green-500/20 rounded-full">
                <span className="text-sm font-medium text-green-300">NEW: Marketplace</span>
              </div>
            </div>

            <h1 className="text-5xl font-bold mb-6">
              CEA Marketplace
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              The largest controlled environment agriculture marketplace connecting growers 
              directly with restaurants, retailers, and distributors. No middlemen, just fresh produce.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/marketplace/onboarding"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
              >
                Join Marketplace
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/marketplace/produce-board"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Browse Products
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Early Access Launch</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">Be Among the First</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">Free for First 100 Growers</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* For Growers */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Leaf className="w-8 h-8 text-green-400" />
                <h3 className="text-2xl font-bold">For Growers</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold mb-1">Create Your Profile</h4>
                    <p className="text-gray-400 text-sm">Set up your farm profile with certifications and growing methods</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold mb-1">List Your Products</h4>
                    <p className="text-gray-400 text-sm">Add products with photos, pricing, and availability</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold mb-1">Receive Orders</h4>
                    <p className="text-gray-400 text-sm">Get notified of new orders and manage fulfillment</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-semibold mb-1">Get Paid</h4>
                    <p className="text-gray-400 text-sm">Receive payments directly with only 5% marketplace fee</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* For Buyers */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <ShoppingCart className="w-8 h-8 text-blue-400" />
                <h3 className="text-2xl font-bold">For Buyers</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold mb-1">Browse Products</h4>
                    <p className="text-gray-400 text-sm">Search by product type, location, certifications, and more</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold mb-1">Connect with Growers</h4>
                    <p className="text-gray-400 text-sm">Message growers directly and build relationships</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold mb-1">Place Orders</h4>
                    <p className="text-gray-400 text-sm">Order from multiple farms in one transaction</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-semibold mb-1">Receive Fresh Produce</h4>
                    <p className="text-gray-400 text-sm">Get delivery or pickup based on your preferences</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            Powerful Features for Modern Agriculture
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-xl p-6"
                >
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8">Supported Product Categories</h2>
          <p className="text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            From leafy greens to floriculture, our marketplace supports the full spectrum 
            of controlled environment agriculture products.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {productCategories.map((category) => (
              <div
                key={category}
                className="px-4 py-2 bg-gray-800 rounded-full text-gray-300 hover:bg-gray-700 transition-colors"
              >
                {category}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Comparison */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose VibeLux Marketplace?</h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-green-900/20 to-green-900/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Leaf className="w-8 h-8 text-green-400" />
                Benefits for Growers
              </h3>
              <ul className="space-y-3">
                {benefits.growers.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-blue-900/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <ShoppingCart className="w-8 h-8 text-blue-400" />
                Benefits for Buyers
              </h3>
              <ul className="space-y-3">
                {benefits.buyers.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Launch Special Pricing</h2>
          
          <div className="bg-gray-800 rounded-2xl p-8 mb-8">
            <div className="bg-green-900/30 rounded-lg p-4 mb-6 border border-green-600/50">
              <p className="text-lg font-semibold text-green-400">🎉 First 100 Growers Join FREE!</p>
              <p className="text-sm text-gray-300 mt-1">Be part of building the CEA marketplace from the ground up</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">After Launch Special</h3>
                <div className="text-4xl font-bold text-green-400 mb-2">$29/month</div>
                <p className="text-gray-400">Unlimited listings and full features</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Transaction Fee</h3>
                <div className="text-4xl font-bold text-blue-400 mb-2">5%</div>
                <p className="text-gray-400">Only on completed sales</p>
              </div>
            </div>
          </div>

          <p className="text-gray-400 mb-8">
            Always free for buyers • No setup fees • Cancel anytime
          </p>

          <Link
            href="/marketplace/onboarding"
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-lg transition-colors"
          >
            Start Selling Today
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Success Stories</h2>
          
          <div className="bg-gray-800 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-xl text-gray-300 mb-4">
              "We've increased our sales by 300% and eliminated food waste by connecting 
              directly with local restaurants through VibeLux Marketplace."
            </p>
            <p className="text-gray-400">
              - Green Valley Farms, California
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">85%</div>
              <p className="text-gray-400">Reduction in food waste</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-400 mb-2">3.2x</div>
              <p className="text-gray-400">Average revenue increase</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">48hr</div>
              <p className="text-gray-400">Farm to table delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-900/20 to-emerald-900/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Join the Future of Fresh
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Connect with the largest network of CEA growers and buyers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/marketplace/onboarding"
              className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-lg transition-colors"
            >
              Join as a Grower
            </Link>
            <Link
              href="/marketplace/produce-board"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-lg transition-colors"
            >
              Browse as a Buyer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}