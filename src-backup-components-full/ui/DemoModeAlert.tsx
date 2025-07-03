import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface DemoModeAlertProps {
  feature: string;
  description?: string;
  type?: 'demo' | 'simulation' | 'coming-soon';
}

export function DemoModeAlert({ feature, description, type = 'demo' }: DemoModeAlertProps) {
  const styles = {
    demo: {
      bg: 'bg-yellow-900/20',
      border: 'border-yellow-800',
      text: 'text-yellow-400',
      icon: AlertTriangle,
      label: 'Demo Mode'
    },
    simulation: {
      bg: 'bg-blue-900/20',
      border: 'border-blue-800',
      text: 'text-blue-400',
      icon: Info,
      label: 'Simulation'
    },
    'coming-soon': {
      bg: 'bg-purple-900/20',
      border: 'border-purple-800',
      text: 'text-purple-400',
      icon: Info,
      label: 'Coming Soon'
    }
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div className={`${style.bg} ${style.border} border rounded-lg p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${style.text} mt-0.5 flex-shrink-0`} />
        <div>
          <h4 className={`font-medium ${style.text} mb-1`}>
            {style.label}: {feature}
          </h4>
          <p className="text-sm text-gray-300">
            {description || 'This feature is currently in demo mode with simulated data. Production functionality coming soon.'}
          </p>
        </div>
      </div>
    </div>
  );
}