/**
 * Demo Mode Configuration
 * 
 * This file defines which features are in demo mode and provides
 * appropriate disclaimers for each feature type.
 */

import React from 'react';

export interface DemoFeature {
  id: string;
  name: string;
  description: string;
  category: 'iot' | 'financial' | 'analytics' | 'integration' | 'marketplace';
  isDemoOnly: boolean;
  productionRequirements?: string[];
  demoDataSource?: string;
}

export const DEMO_FEATURES: DemoFeature[] = [
  {
    id: 'energy-monitoring',
    name: 'Real-time Energy Monitoring',
    description: 'Live energy consumption data from IoT sensors',
    category: 'iot',
    isDemoOnly: false,
    productionRequirements: ['VibeLux Energy Meters', 'IoT Gateway'],
    demoDataSource: 'Simulated based on typical agricultural facility patterns',
  },
  {
    id: 'sensor-readings',
    name: 'Environmental Sensor Data',
    description: 'Temperature, humidity, CO2, and light readings',
    category: 'iot',
    isDemoOnly: false,
    productionRequirements: ['VibeLux Environmental Sensors', 'IoT Gateway'],
    demoDataSource: 'Simulated with realistic daily/seasonal variations',
  },
  {
    id: 'equipment-control',
    name: 'Equipment Control',
    description: 'Remote control of HVAC, lighting, and irrigation',
    category: 'iot',
    isDemoOnly: false,
    productionRequirements: ['VibeLux Controllers', 'Compatible equipment'],
    demoDataSource: 'Simulated control responses',
  },
  {
    id: 'utility-bills',
    name: 'Utility Bill Integration',
    description: 'Automated utility bill retrieval and analysis',
    category: 'integration',
    isDemoOnly: false,
    productionRequirements: ['Utility account credentials', 'API access approval'],
    demoDataSource: 'Sample utility bill data',
  },
  {
    id: 'invoice-generation',
    name: 'Automated Invoicing',
    description: 'Revenue share invoices based on energy savings',
    category: 'financial',
    isDemoOnly: false,
    productionRequirements: ['Active utility integration', 'Verified baseline data'],
    demoDataSource: 'Calculated from simulated energy data',
  },
  {
    id: 'payment-processing',
    name: 'Payment Processing',
    description: 'Stripe integration for invoice payments',
    category: 'financial',
    isDemoOnly: false,
    productionRequirements: ['Stripe account', 'Bank account verification'],
    demoDataSource: 'Stripe test mode',
  },
  {
    id: 'yield-predictions',
    name: 'ML Yield Predictions',
    description: 'AI-powered crop yield forecasting',
    category: 'analytics',
    isDemoOnly: false,
    productionRequirements: ['Historical yield data', 'Environmental sensors'],
    demoDataSource: 'Pre-trained model with sample data',
  },
  {
    id: 'marketplace-listings',
    name: 'Produce Marketplace',
    description: 'B2B marketplace for farm products',
    category: 'marketplace',
    isDemoOnly: false,
    productionRequirements: ['Verified farmer account', 'Product inventory'],
    demoDataSource: 'Sample marketplace listings',
  },
  {
    id: 'compliance-tracking',
    name: 'Compliance Management',
    description: 'Food safety and regulatory compliance tracking',
    category: 'integration',
    isDemoOnly: false,
    productionRequirements: ['Compliance documentation', 'Audit records'],
    demoDataSource: 'Sample compliance records',
  },
];

export const DEMO_NOTICES = {
  iot: {
    title: 'IoT Hardware Demo Mode',
    message: 'Sensor readings and equipment controls shown are simulated. Install VibeLux hardware to see real data from your facility.',
    icon: '🔌',
  },
  financial: {
    title: 'Financial Demo Mode',
    message: 'Financial figures and transactions are examples only. Production system uses real payment processing and verified data.',
    icon: '💰',
  },
  analytics: {
    title: 'Analytics Demo Mode',
    message: 'Predictions and insights are based on sample data. Connect your actual facility data for personalized analytics.',
    icon: '📊',
  },
  integration: {
    title: 'Integration Demo Mode',
    message: 'External integrations are simulated. Connect your actual accounts to enable real data synchronization.',
    icon: '🔗',
  },
  marketplace: {
    title: 'Marketplace Demo Mode',
    message: 'Product listings and orders shown are examples. Create your seller account to list real products.',
    icon: '🛒',
  },
};

export function getDemoNotice(category: DemoFeature['category']) {
  return DEMO_NOTICES[category];
}

export function isFeatureDemo(featureId: string): boolean {
  // In production, this would check actual system configuration
  const isDemoEnvironment = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  
  if (!isDemoEnvironment) {
    return false;
  }
  
  const feature = DEMO_FEATURES.find(f => f.id === featureId);
  return feature ? !feature.isDemoOnly : true;
}

export function getDemoFeatureInfo(featureId: string): DemoFeature | undefined {
  return DEMO_FEATURES.find(f => f.id === featureId);
}

// Helper to add demo watermark to charts/visualizations
export function addDemoWatermark(chartOptions: any) {
  if (!isFeatureDemo('analytics')) {
    return chartOptions;
  }
  
  return {
    ...chartOptions,
    title: {
      ...chartOptions.title,
      subtext: 'Demo Data - Not Real Measurements',
      subtextStyle: {
        color: '#666',
        fontSize: 10,
        fontStyle: 'italic',
      },
    },
  };
}

// Helper to add demo badge to data tables
export function getDemoTableHeader() {
  if (!process.env.NEXT_PUBLIC_DEMO_MODE) {
    return null;
  }
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 mb-4 text-sm">
      <span className="font-medium text-blue-900">Demo Mode:</span>
      <span className="text-blue-700 ml-1">
        Data shown is for demonstration purposes only
      </span>
    </div>
  );
}