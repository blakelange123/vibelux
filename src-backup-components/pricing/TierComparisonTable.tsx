'use client';

import React, { useState } from 'react';
import { Check, X, Info, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { SUBSCRIPTION_TIERS_V2, calculateAnnualSavings } from '@/lib/subscription-tiers-v2';

interface FeatureCategory {
  name: string;
  features: {
    name: string;
    key: keyof typeof SUBSCRIPTION_TIERS_V2[0]['permissions'] | 'special';
    description?: string;
    getValue?: (tier: typeof SUBSCRIPTION_TIERS_V2[0]) => string | boolean | number;
  }[];
}

const featureCategories: FeatureCategory[] = [
  {
    name: 'Core Features',
    features: [
      { name: 'PPFD/DLI/VPD Calculators', key: 'ppfdCalculator' },
      { name: 'Basic 2D Designer', key: 'basicDesigner' },
      { name: 'Fixture Library Access', key: 'special', getValue: (tier) => 
        tier.permissions.fixtureLibraryFull ? 'Full (5000+)' : 
        tier.permissions.fixtureLibraryLimited ? 'Limited (100)' : false
      },
      { name: 'Saved Projects', key: 'special', getValue: (tier) => 
        tier.limits.projects === -1 ? 'Unlimited' : tier.limits.projects
      },
      { name: 'Team Members', key: 'special', getValue: (tier) => 
        tier.limits.teamMembers === -1 ? 'Unlimited' : tier.limits.teamMembers
      },
      { name: 'Data Retention', key: 'special', getValue: (tier) => 
        tier.limits.dataRetention === -1 ? 'Forever' : `${tier.limits.dataRetention} days`
      }
    ]
  },
  {
    name: 'Design & Visualization',
    features: [
      { name: '3D Visualization', key: 'designer3D' },
      { name: 'Heat Map Analysis', key: 'heatMapVisualization' },
      { name: 'Auto-Arrangement AI', key: 'autoArrangement' },
      { name: 'Multi-Layer Design', key: 'multiLayerDesign' },
      { name: 'Shadow Mapping', key: 'shadowMapping' },
      { name: 'Object Properties Panel', key: 'objectProperties' }
    ]
  },
  {
    name: 'Electrical Tools',
    features: [
      { name: 'Basic Load Calculations', key: 'basicElectricalCalc' },
      { name: 'Electrical Estimator', key: 'electricalEstimator', description: 'Full estimation tool with costs' },
      { name: 'Load Balancing (3-phase)', key: 'electricalLoadBalancing' },
      { name: 'Circuit Planning', key: 'circuitPlanning' },
      { name: 'Wire Gauge Calculator', key: 'wireGaugeRecommendations' }
    ]
  },
  {
    name: 'Energy & Cost Analysis',
    features: [
      { name: 'Basic Energy Calculator', key: 'basicEnergyCost' },
      { name: 'Advanced Energy Analysis', key: 'advancedEnergyCost' },
      { name: 'Peak Demand Analysis', key: 'peakDemandAnalysis' },
      { name: 'Carbon Footprint', key: 'carbonFootprint' },
      { name: 'ROI Calculator', key: 'roiCalculator' },
      { name: 'Heat Load Calculator', key: 'heatLoadCalculator' }
    ]
  },
  {
    name: 'AI-Powered Features',
    features: [
      { name: 'SOP Generator', key: 'special', getValue: (tier) => 
        !tier.permissions.sopGenerator ? false :
        tier.limits.sopGeneration === -1 ? 'Unlimited' : 
        tier.limits.sopGeneration ? `${tier.limits.sopGeneration}/mo` : false,
        description: 'Uses ChatGPT API'
      },
      { name: 'AI Spectrum Recommendations', key: 'special', getValue: (tier) => 
        !tier.permissions.aiSpectrumRecommendations ? false :
        tier.limits.aiCredits === -1 ? 'Unlimited' : 
        tier.limits.aiCredits ? `${tier.limits.aiCredits}/mo` : false
      },
      { name: 'ML Yield Prediction', key: 'mlYieldPrediction' },
      { name: 'Predictive Maintenance', key: 'predictiveMaintenance' },
      { name: 'AI Crop Advisor', key: 'aiCropAdvisor' }
    ]
  },
  {
    name: 'Planning & Scheduling',
    features: [
      { name: 'Basic Scheduler', key: 'basicScheduler' },
      { name: 'Lighting Scheduler', key: 'lightingScheduler' },
      { name: 'Maintenance Scheduler', key: 'maintenanceScheduler' },
      { name: 'Crop Rotation Planner', key: 'cropRotationPlanner' }
    ]
  },
  {
    name: 'Professional Tools',
    features: [
      { name: 'Spectrum Analysis', key: 'spectrumAnalysis' },
      { name: 'Photosynthetic Modeling', key: 'photosyntheticModeling' },
      { name: 'Custom Spectrum Designer', key: 'customSpectrumDesigner' },
      { name: 'Weather Adaptive Lighting', key: 'weatherAdaptive' }
    ]
  },
  {
    name: 'Compliance & Documentation',
    features: [
      { name: 'Basic Compliance Tools', key: 'basicCompliance' },
      { name: 'Compliance Audit Trail', key: 'complianceAuditTrail' },
      { name: 'Document Generation', key: 'documentGeneration' },
      { name: 'Certificate Generation', key: 'certificateGeneration' }
    ]
  },
  {
    name: 'Integration & API',
    features: [
      { name: 'API Access', key: 'special', getValue: (tier) => 
        !tier.permissions.apiAccess ? false :
        tier.limits.apiCalls === -1 ? 'Unlimited' : 
        tier.limits.apiCalls ? `${tier.limits.apiCalls.toLocaleString()}/mo` : false
      },
      { name: 'Webhooks', key: 'webhooks' },
      { name: 'IoT Integration', key: 'iotIntegration' },
      { name: 'ERP Integration', key: 'erpIntegration' },
      { name: 'Custom Integrations', key: 'customIntegrations' }
    ]
  },
  {
    name: 'Enterprise Features',
    features: [
      { name: 'Multi-Site Management', key: 'multiSiteManagement' },
      { name: 'White-Label Branding', key: 'whiteLabel' },
      { name: 'SSO Integration', key: 'ssoIntegration' },
      { name: 'Version Control', key: 'versionControl' },
      { name: 'Role-Based Access', key: 'roleBasedAccess' }
    ]
  },
  {
    name: 'Support & Export',
    features: [
      { name: 'Support Level', key: 'special', getValue: (tier) => {
        const level = tier.limits.supportLevel;
        return level.charAt(0).toUpperCase() + level.slice(1);
      }},
      { name: 'Export Formats', key: 'special', getValue: (tier) => 
        tier.limits.exportFormats.includes('all') ? 'All formats' :
        tier.limits.exportFormats.join(', ').toUpperCase()
      }
    ]
  }
];

export default function TierComparisonTable() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Core Features']);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [highlightedTier, setHighlightedTier] = useState<string | null>(null);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const getFeatureValue = (tier: typeof SUBSCRIPTION_TIERS_V2[0], feature: typeof featureCategories[0]['features'][0]) => {
    if (feature.getValue) {
      return feature.getValue(tier);
    }
    if (feature.key === 'special') {
      return false;
    }
    return tier.permissions[feature.key];
  };

  const renderFeatureCell = (value: string | boolean | number) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-600 mx-auto" />
      ) : (
        <X className="w-4 h-4 text-gray-300 mx-auto" />
      );
    }
    return <span className="text-sm font-medium">{value}</span>;
  };

  return (
    <div className="max-w-full overflow-x-auto">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingPeriod === 'monthly' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingPeriod === 'annual' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Annual Billing
            <span className="ml-1 text-xs text-green-600">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left p-4 font-semibold sticky left-0 bg-white z-10 min-w-[200px]">
                Features
              </th>
              {SUBSCRIPTION_TIERS_V2.map(tier => (
                <th
                  key={tier.id}
                  className={`text-center p-4 min-w-[140px] relative ${
                    tier.highlighted ? 'bg-blue-50' : ''
                  } ${highlightedTier === tier.id ? 'bg-yellow-50' : ''}`}
                  onMouseEnter={() => setHighlightedTier(tier.id)}
                  onMouseLeave={() => setHighlightedTier(null)}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="font-bold text-lg">{tier.name}</div>
                  <div className="text-gray-600 text-xs mb-2">{tier.targetAudience}</div>
                  <div className="text-2xl font-bold">
                    {tier.price === 0 ? 'Free' : 
                     tier.price === -1 ? 'Custom' :
                     billingPeriod === 'monthly' ? `$${tier.price}` :
                     tier.priceAnnual ? `$${Math.round(tier.priceAnnual / 12)}` : `$${tier.price}`}
                  </div>
                  {tier.price > 0 && (
                    <div className="text-xs text-gray-500">
                      {billingPeriod === 'monthly' ? 'per month' : 'per month, billed annually'}
                    </div>
                  )}
                  {billingPeriod === 'annual' && tier.priceAnnual && tier.price > 0 && (
                    <div className="text-xs text-green-600 mt-1">
                      Save ${calculateAnnualSavings(tier.id)}/year
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featureCategories.map(category => (
              <React.Fragment key={category.name}>
                <tr 
                  className="bg-gray-50 border-t cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleCategory(category.name)}
                >
                  <td className="p-3 font-semibold sticky left-0 bg-gray-50 z-10">
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      {expandedCategories.includes(category.name) ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </td>
                  {SUBSCRIPTION_TIERS_V2.map(tier => (
                    <td 
                      key={tier.id} 
                      className={`p-3 ${
                        tier.highlighted ? 'bg-blue-50/50' : ''
                      } ${highlightedTier === tier.id ? 'bg-yellow-50' : ''}`}
                    />
                  ))}
                </tr>
                {expandedCategories.includes(category.name) && category.features.map(feature => (
                  <tr key={feature.name} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="p-3 pl-6 text-sm sticky left-0 bg-white z-10">
                      <div className="flex items-center gap-2">
                        <span>{feature.name}</span>
                        {feature.description && (
                          <div className="group relative">
                            <Info className="w-3 h-3 text-gray-400" />
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                              {feature.description}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    {SUBSCRIPTION_TIERS_V2.map(tier => (
                      <td 
                        key={tier.id} 
                        className={`p-3 text-center ${
                          tier.highlighted ? 'bg-blue-50/30' : ''
                        } ${highlightedTier === tier.id ? 'bg-yellow-50' : ''}`}
                      >
                        {renderFeatureCell(getFeatureValue(tier, feature))}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}