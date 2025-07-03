/**
 * Cultivation Safety Disclaimers Page
 */

import { Metadata } from 'next';
import { AlertTriangle, Shield, Zap, Thermometer, Eye, Leaf } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cultivation Safety Disclaimers | VibeLux',
  description: 'Important safety information and disclaimers for cannabis and plant cultivation lighting',
};

export default function DisclaimersPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg">
          {/* Header */}
          <div className="bg-red-600 text-white p-6 rounded-t-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 mr-3" />
              <div>
                <h1 className="text-2xl font-bold">CRITICAL SAFETY DISCLAIMERS</h1>
                <p className="text-red-100 mt-1">Read Before Using VibeLux Cultivation Platform</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Emergency Warning */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <Zap className="h-6 w-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-red-800 mb-3">⚠️ IMMEDIATE ACTION REQUIRED</h2>
                  <p className="text-red-700 font-semibold mb-3">
                    If you observe ANY of these signs, reduce light intensity and adjust spectrum IMMEDIATELY:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="list-disc list-inside text-red-700 space-y-1">
                      <li><strong>Leaf bleaching or white spots</strong></li>
                      <li><strong>Brown or crispy leaf tips</strong></li>
                      <li><strong>Excessive stem stretching ({'>'}8cm internodes)</strong></li>
                      <li><strong>Curled or twisted leaves</strong></li>
                    </ul>
                    <ul className="list-disc list-inside text-red-700 space-y-1">
                      <li><strong>Purple or red leaf edges</strong></li>
                      <li><strong>Stunted growth or wilting</strong></li>
                      <li><strong>Unusual plant odors</strong></li>
                      <li><strong>Rapid dehydration</strong></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Spectrum-Specific Warnings */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Far-Red Warning */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Eye className="h-5 w-5 text-orange-600 mr-2" />
                  <h3 className="text-lg font-semibold text-orange-800">Far-Red Light (700-800nm)</h3>
                </div>
                <div className="space-y-2 text-orange-700">
                  <p><strong>MAXIMUM SAFE LEVEL: 25%</strong></p>
                  <p><strong>WARNING LEVEL: 15%</strong></p>
                  <p className="text-sm">
                    <strong>Dangers:</strong> Excessive stem stretching, weak branch structure, 
                    reduced flower density, potential plant collapse
                  </p>
                  <p className="text-sm">
                    <strong>Cannabis-specific:</strong> Extremely sensitive to far-red excess. 
                    Even 20% can cause severe stretching in flowering.
                  </p>
                </div>
              </div>

              {/* White Light Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Thermometer className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="text-lg font-semibold text-yellow-800">White Light</h3>
                </div>
                <div className="space-y-2 text-yellow-700">
                  <p><strong>MAXIMUM SAFE LEVEL: 70%</strong></p>
                  <p><strong>WARNING LEVEL: 60% (at high intensity)</strong></p>
                  <p className="text-sm">
                    <strong>Dangers:</strong> Leaf bleaching, tip burn, cannabinoid degradation, 
                    photoinhibition, heat stress
                  </p>
                  <p className="text-sm">
                    <strong>High-risk combo:</strong> White {'>'} 60% + Intensity {'>'} 800 PPFD = 
                    Immediate burn risk
                  </p>
                </div>
              </div>

              {/* UV-B Warning */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Shield className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-purple-800">UV-B Light (280-315nm)</h3>
                </div>
                <div className="space-y-2 text-purple-700">
                  <p><strong>MAXIMUM SAFE LEVEL: 5%</strong></p>
                  <p><strong>WARNING LEVEL: 2%</strong></p>
                  <p className="text-sm">
                    <strong>Dangers:</strong> DNA damage, cell death, leaf necrosis, 
                    severe photosynthesis reduction, plant death
                  </p>
                  <p className="text-sm">
                    <strong>Safety note:</strong> Start at 0.5% and increase gradually. 
                    Monitor daily for damage signs.
                  </p>
                </div>
              </div>

              {/* Intensity Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Leaf className="h-5 w-5 text-red-600 mr-2" />
                  <h3 className="text-lg font-semibold text-red-800">Light Intensity (PPFD)</h3>
                </div>
                <div className="space-y-2 text-red-700">
                  <p><strong>CRITICAL LEVEL: {'>'} 1200 PPFD</strong></p>
                  <p><strong>HIGH RISK: {'>'} 1000 PPFD</strong></p>
                  <p className="text-sm">
                    <strong>Dangers:</strong> Photoinhibition, heat stress, rapid dehydration, 
                    complete crop loss, equipment damage
                  </p>
                  <p className="text-sm">
                    <strong>Cannabis limits:</strong> Rarely exceed 1000 PPFD even with CO₂ 
                    supplementation. Monitor constantly above 800 PPFD.
                  </p>
                </div>
              </div>
            </div>

            {/* Phase-Specific Guidelines */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Growth Phase Safety Guidelines</h2>
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Growth Phase
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Max PPFD
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Max Far-Red
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Max White
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Critical Warnings
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Seedling
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        400 PPFD
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        5%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        30%
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600">
                        Extremely light sensitive. Any burn spreads rapidly.
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Vegetative
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        700 PPFD
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        8%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        40%
                      </td>
                      <td className="px-6 py-4 text-sm text-orange-600">
                        Monitor for stretching. Blue deficiency causes weak stems.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Early Flowering
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        1000 PPFD
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        10%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        50%
                      </td>
                      <td className="px-6 py-4 text-sm text-yellow-600">
                        Peak sensitivity period. Stress affects flower development.
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Late Flowering
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        1200 PPFD
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        15%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        60%
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600">
                        EXTREME CAUTION. Daily monitoring essential. Tip burn spreads fast.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legal and Professional Disclaimers */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🏛️ Legal and Professional Responsibility</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>VibeLux is a calculation tool only.</strong> We provide guidance based on horticultural science, 
                  but cannot account for every variable in your specific environment.
                </p>
                <p>
                  <strong>Professional consultation required:</strong> Commercial operations should consult with 
                  qualified horticulturists, especially for high-value crops or large-scale facilities.
                </p>
                <p>
                  <strong>Legal compliance:</strong> Users are solely responsible for compliance with all applicable 
                  laws, regulations, and licensing requirements in their jurisdiction.
                </p>
                <p>
                  <strong>Insurance and liability:</strong> Verify that your cultivation activities are covered by 
                  appropriate insurance. VibeLux assumes no liability for crop losses or legal issues.
                </p>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">🆘 Emergency Response</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">Immediate Plant Stress</h3>
                  <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
                    <li>Reduce light intensity by 50%</li>
                    <li>Increase distance from canopy</li>
                    <li>Improve air circulation</li>
                    <li>Check leaf surface temperature</li>
                    <li>Document symptoms with photos</li>
                    <li>Consult cultivation expert if severe</li>
                  </ol>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">Equipment Emergency</h3>
                  <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
                    <li>Turn off all lighting immediately</li>
                    <li>Ensure electrical safety</li>
                    <li>Ventilate area if overheating</li>
                    <li>Contact equipment manufacturer</li>
                    <li>Do not attempt repairs while powered</li>
                    <li>Implement backup lighting if available</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Final Warning */}
            <div className="mt-8 p-6 bg-red-600 text-white rounded-lg">
              <h3 className="text-lg font-bold mb-2">⚠️ FINAL WARNING</h3>
              <p className="leading-relaxed">
                Cannabis and other high-value crops can be destroyed in hours by improper lighting. 
                <strong> When in doubt, use lower intensity and conservative spectrum settings.</strong> 
                It's easier to increase gradually than to recover from light damage. 
                Monitor your plants daily and prioritize their health over maximum theoretical yields.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}