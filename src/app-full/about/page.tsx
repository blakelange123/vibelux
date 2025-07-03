'use client';

import Link from 'next/link';
import { 
  Sparkles, 
  Award, 
  Users, 
  Lightbulb, 
  Target,
  ArrowRight,
  CheckCircle,
  Building,
  Leaf,
  Globe,
  BookOpen,
  Briefcase,
  GraduationCap
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              About <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Vibelux</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Revolutionizing controlled environment agriculture through intelligent lighting design
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                At Vibelux, we're on a mission to empower growers with the most advanced horticultural 
                lighting design platform in the industry. We believe that optimal light is the key to 
                sustainable, profitable indoor agriculture.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Our comprehensive platform combines cutting-edge science, intuitive design tools, and 
                data-driven insights to help growers of all sizes maximize yields while minimizing 
                energy costs.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10">
                <Target className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">Precision</h3>
                <p className="text-gray-400 text-sm">Scientific accuracy in every calculation</p>
              </div>
              <div className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10">
                <Leaf className="w-10 h-10 text-green-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">Sustainability</h3>
                <p className="text-gray-400 text-sm">Reduce energy use and carbon footprint</p>
              </div>
              <div className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10">
                <Users className="w-10 h-10 text-blue-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">Accessibility</h3>
                <p className="text-gray-400 text-sm">Tools for hobbyists to mega-farms</p>
              </div>
              <div className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10">
                <Lightbulb className="w-10 h-10 text-yellow-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">Innovation</h3>
                <p className="text-gray-400 text-sm">Cutting-edge features and AI tools</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Meet Our Founder</h2>
            <p className="text-xl text-gray-400">Visionary leadership in agricultural technology</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Left Column - Profile */}
              <div className="text-center space-y-4">
                <div className="w-48 h-48 mx-auto bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                  <span className="text-6xl font-bold text-white">BL</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Blake Lange</h3>
                <p className="text-purple-400 font-medium">Founder & CEO</p>
                <div className="flex justify-center gap-4">
                  <a href="https://www.linkedin.com/in/blakelange/" target="_blank" rel="noopener noreferrer" 
                     className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Right Columns - Bio and Achievements */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h4 className="text-xl font-semibold text-white mb-3">Pioneering Controlled Environment Agriculture</h4>
                  <p className="text-gray-300 leading-relaxed">
                    Blake Lange is a recognized leader in controlled environment agriculture (CEA) and 
                    horticultural lighting technology. With a unique blend of technical expertise and 
                    entrepreneurial vision, Blake founded Vibelux to democratize access to professional-grade 
                    lighting design tools.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-white mb-3">Professional Background</h4>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Currently serving at Acuity Brands, Blake brings deep industry experience in LED technology 
                    and sustainable agriculture. His work focuses on advancing the science of photobiology and 
                    making sophisticated lighting calculations accessible to growers at every scale.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">
                        <span className="font-medium text-white">Industry Leadership:</span> Active member of the Global 
                        CEA Consortium (GCEAC) Sustainability Committee and Resource Innovation Institute's CEA Leadership Committee
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">
                        <span className="font-medium text-white">Government Collaboration:</span> Contributed to USDA 
                        Specialty Crop Research Initiative's Economics Group, advancing agricultural innovation
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">
                        <span className="font-medium text-white">Thought Leadership:</span> Invited speaker for 
                        "Holland on the Hill" program, sharing insights on agricultural technology and sustainability
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-purple-400" />
                      Certifications
                    </h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Certified Horticulturist (ASHS)</li>
                      <li>• LED Professional Certifications (Philips)</li>
                      <li>• Solution Selling Certified</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Building className="w-5 h-5 text-purple-400" />
                      Professional Memberships
                    </h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• American Society of Agricultural Engineers</li>
                      <li>• International Society for Horticultural Science</li>
                      <li>• Illuminating Engineering Society</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-600/10 border border-purple-600/20 rounded-xl p-6">
                  <p className="text-purple-300 italic">
                    "My vision for Vibelux is to empower every grower – from hobbyists to commercial operations – 
                    with the same sophisticated tools used by industry leaders. By combining scientific rigor with 
                    intuitive design, we're making professional lighting optimization accessible to all."
                  </p>
                  <p className="text-purple-400 font-medium mt-3">- Blake Lange, Founder & CEO</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Impact */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Beyond Technology</h2>
            <p className="text-xl text-gray-400">Committed to community and sustainable agriculture</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur p-8 rounded-2xl border border-white/10">
              <Globe className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Global Impact</h3>
              <p className="text-gray-300">
                Working with international organizations to advance sustainable agriculture and food security 
                through innovative lighting solutions.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur p-8 rounded-2xl border border-white/10">
              <Users className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Community Leadership</h3>
              <p className="text-gray-300">
                Active in local community as a youth sports coach and parks advisory committee member, 
                fostering the next generation of leaders.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur p-8 rounded-2xl border border-white/10">
              <BookOpen className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Knowledge Sharing</h3>
              <p className="text-gray-300">
                Regular speaker and educator, committed to democratizing agricultural technology knowledge 
                across the industry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Us in Revolutionizing Agriculture
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Experience the future of horticultural lighting design
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/pricing" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Explore Our Plans
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}