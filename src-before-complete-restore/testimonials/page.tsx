import React from 'react';
import GrowerTestimonials from '@/components/GrowerTestimonials';
import Navigation from '@/components/Navigation';

export default function TestimonialsPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Success Stories from Our Growers
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how growers around the world are achieving remarkable results with Vibelux's 
              intelligent lighting design and control solutions.
            </p>
          </div>
          
          <GrowerTestimonials />
          
          {/* Additional Case Studies Section */}
          <section className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Detailed Case Studies
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full mb-4">
                    Vertical Farming
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Green Valley Farms: 32% Yield Increase
                  </h3>
                  <p className="text-gray-600">
                    How a California vertical farm transformed their operation with precision lighting
                  </p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Challenge:</h4>
                    <p className="text-gray-700">
                      Inconsistent yields and high energy costs in their 50,000 sq ft facility
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Solution:</h4>
                    <p className="text-gray-700">
                      Implemented Vibelux's advanced designer with multi-tier optimization and 
                      integrated climate control
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Results:</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>32% increase in lettuce yields</li>
                      <li>28% reduction in energy costs</li>
                      <li>15 hours/week saved on manual adjustments</li>
                      <li>ROI achieved in 14 months</li>
                    </ul>
                  </div>
                </div>
                
                <a
                  href="/case-studies/green-valley-farms"
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                >
                  Read Full Case Study →
                </a>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 text-sm font-semibold text-purple-800 bg-purple-100 rounded-full mb-4">
                    Cannabis Cultivation
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Sunshine Greenhouse: 22% Quality Improvement
                  </h3>
                  <p className="text-gray-600">
                    Achieving premium cannabinoid levels through spectrum optimization
                  </p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Challenge:</h4>
                    <p className="text-gray-700">
                      Needed to increase cannabinoid content while reducing operational costs
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Solution:</h4>
                    <p className="text-gray-700">
                      Custom spectrum recipes with Vibelux's AI-powered recommendations and 
                      automated photoperiod control
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Results:</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>22% increase in THC content</li>
                      <li>30% energy savings</li>
                      <li>25% overall yield improvement</li>
                      <li>Consistent test results batch-to-batch</li>
                    </ul>
                  </div>
                </div>
                
                <a
                  href="/case-studies/sunshine-greenhouse"
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                >
                  Read Full Case Study →
                </a>
              </div>
            </div>
          </section>
          
          {/* CTA Section */}
          <section className="mt-20 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Growing Operation?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of successful growers who are achieving better yields, 
              lower costs, and more predictable harvests with Vibelux.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/calculators/roi"
                className="inline-flex items-center px-8 py-4 bg-white text-green-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Calculate Your ROI
              </a>
              <a
                href="/demo"
                className="inline-flex items-center px-8 py-4 bg-green-800 text-white font-semibold rounded-lg hover:bg-green-900 transition-colors"
              >
                Request a Demo
              </a>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}