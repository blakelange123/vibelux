'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  TrendingUp,
  Users,
  Globe,
  Sparkles,
  ArrowRight,
  Check,
  Building,
  DollarSign,
  Rocket,
  Target,
  BarChart3,
  Calendar,
  Mail,
  Bot,
  ShoppingCart,
  Leaf,
  Linkedin
} from 'lucide-react';

const stats = [
  { label: 'Platform Features', value: '150+', description: 'Professional tools' },
  { label: 'Fixture Database', value: '100+', description: 'Growing catalog' },
  { label: 'AI Assistant', value: 'Advanced', description: 'State-of-the-art AI integration' },
  { label: 'Founded', value: '2025', description: 'Early stage startup' }
];

export default function InvestorsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-purple-900/20 to-gray-950 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 backdrop-blur-sm rounded-full border border-purple-700/50 mb-6">
              <Rocket className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-200">Early Stage Opportunity</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Building the Future of
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Horticultural Lighting Design
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Vibelux is creating the most advanced platform for indoor farming lighting design, 
              featuring AI-powered tools, real-time collaboration, and comprehensive analytics 
              to help growers optimize their operations.
            </p>
            
            <div className="flex justify-center gap-4">
              <Link
                href="#contact"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Contact Founder
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Company Overview */}
      <div className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Company Overview
          </motion.h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl p-6 text-center"
              >
                <div className="text-4xl font-bold text-purple-400 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Highlights */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Key Product Features
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-gray-900 rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-purple-900/50 rounded-xl flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Design Assistant</h3>
              <p className="text-gray-400 mb-4">
                AI-powered assistant that helps design optimal lighting systems through 
                natural conversation, significantly reducing design time.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900 rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-green-900/50 rounded-xl flex items-center justify-center mb-4">
                <ShoppingCart className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">CEA Marketplace</h3>
              <p className="text-gray-400 mb-4">
                Innovative B2B marketplace connecting growers with buyers, enabling direct 
                trade of fresh produce within the controlled environment agriculture community.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900 rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Collaboration</h3>
              <p className="text-gray-400 mb-4">
                Teams can work together on lighting designs with live cursors, comments, 
                and instant updates - bringing modern collaboration to lighting design.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Market Opportunity */}
      <div className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Market Opportunity
          </motion.h2>
          
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-8"
            >
              <p className="text-gray-300 mb-6">
                The controlled environment agriculture market is experiencing significant growth 
                driven by climate change, food security concerns, and urbanization. Indoor farming 
                uses substantially less water and produces much more per square foot than traditional farming.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Growing TAM</h3>
                    <p className="text-sm text-gray-400">Rapid market expansion with increasing adoption of CEA</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Energy Efficiency Focus</h3>
                    <p className="text-sm text-gray-400">Lighting represents the largest operating cost in indoor farming</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Technology Gap</h3>
                    <p className="text-sm text-gray-400">Most growers still use spreadsheets for lighting design</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Founder Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Leadership
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <img 
              src="/team/blake-lange.jpg" 
              alt="Blake Lange"
              className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
            />
            <h3 className="font-semibold text-2xl mb-2">Blake Lange</h3>
            <p className="text-purple-400 text-lg mb-4">Founder & CEO</p>
            <p className="text-gray-400 mb-4">
              Passionate about revolutionizing horticultural lighting design through technology. 
              Building Vibelux to empower growers with professional tools that were previously 
              only available to large operations.
            </p>
            <a 
              href="https://www.linkedin.com/in/blakelange/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
              <span>Connect on LinkedIn</span>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Vision Section */}
      <div className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Our Vision
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <p className="text-gray-300 text-lg leading-relaxed text-center mb-8">
              We envision a future where every grower, regardless of size, has access to 
              professional-grade lighting design tools. By combining AI technology with 
              intuitive design, we're making it possible for anyone to create optimal 
              lighting systems that maximize yields while minimizing energy consumption.
            </p>
            
            <div className="bg-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-4">Why Now?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Leaf className="w-5 h-5 text-green-400 mt-0.5" />
                  <span className="text-gray-300">Explosive growth in controlled environment agriculture</span>
                </li>
                <li className="flex items-start gap-3">
                  <Bot className="w-5 h-5 text-purple-400 mt-0.5" />
                  <span className="text-gray-300">AI technology has reached a point where it can genuinely help with complex design tasks</span>
                </li>
                <li className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-blue-400 mt-0.5" />
                  <span className="text-gray-300">Growing demand for energy-efficient solutions in agriculture</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-purple-900/20 to-gray-950" id="contact">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Join Us in Building the Future
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              We're an early-stage startup with a bold vision. If you're interested in 
              learning more about our journey and investment opportunities, let's connect.
            </p>
            
            <div className="flex justify-center gap-4 mb-12">
              <a
                href="mailto:blake@vibelux.com"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                blake@vibelux.com
              </a>
            </div>
            
            <div className="bg-gray-900 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-4">Quick Contact</h3>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Name"
                    className="px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Company/Fund (Optional)"
                  className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <textarea
                  placeholder="Message"
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}