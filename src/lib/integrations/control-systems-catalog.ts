/**
 * Catalog of Popular Greenhouse/Grow Control Systems
 * These are the systems VibeLux will integrate with
 */

export interface ControlSystem {
  id: string;
  name: string;
  manufacturer: string;
  category: 'greenhouse' | 'cannabis' | 'vertical-farm' | 'building-automation';
  protocols: string[];
  apiType: 'rest' | 'modbus' | 'bacnet' | 'proprietary' | 'cloud';
  features: string[];
  integration: {
    method: string;
    requirements: string[];
    dataAvailable: string[];
    controlCapabilities: string[];
  };
}

export const CONTROL_SYSTEMS: ControlSystem[] = [
  {
    id: 'argus-titan',
    name: 'Argus Titan',
    manufacturer: 'Argus Control Systems',
    category: 'greenhouse',
    protocols: ['Modbus TCP', 'BACnet/IP', 'OPC UA'],
    apiType: 'modbus',
    features: ['Climate control', 'Irrigation', 'Lighting', 'Fertilization'],
    integration: {
      method: 'Direct Modbus TCP connection to Argus controller',
      requirements: [
        'Network access to Argus system',
        'Modbus register map from Argus',
        'Read/write permissions configuration'
      ],
      dataAvailable: [
        'Current light levels',
        'Zone temperatures',
        'Power consumption',
        'Schedule status',
        'Alarm states'
      ],
      controlCapabilities: [
        'Adjust light intensity (if dimmable)',
        'Override schedules temporarily',
        'Read-only mode available'
      ]
    }
  },
  {
    id: 'priva-connext',
    name: 'Priva Connext',
    manufacturer: 'Priva',
    category: 'greenhouse',
    protocols: ['REST API', 'OPC UA', 'Modbus'],
    apiType: 'rest',
    features: ['Climate control', 'Energy management', 'Labor', 'Analytics'],
    integration: {
      method: 'Priva Cloud API integration',
      requirements: [
        'Priva API credentials',
        'Customer consent form',
        'API subscription plan'
      ],
      dataAvailable: [
        'Real-time sensor data',
        'Energy consumption',
        'Climate settings',
        'Production data',
        'Historical trends'
      ],
      controlCapabilities: [
        'Adjust climate setpoints',
        'Modify lighting schedules',
        'Energy optimization mode'
      ]
    }
  },
  {
    id: 'link4-icrop',
    name: 'iCrop',
    manufacturer: 'Link4 Corporation',
    category: 'cannabis',
    protocols: ['REST API', 'Modbus RTU'],
    apiType: 'cloud',
    features: ['Environmental control', 'Alerts', 'Remote access', 'Data logging'],
    integration: {
      method: 'Link4 Cloud API',
      requirements: [
        'iCrop Cloud subscription',
        'API key generation',
        'Facility ID mapping'
      ],
      dataAvailable: [
        'Zone climate data',
        'Equipment status',
        'Alert history',
        'Energy usage estimates'
      ],
      controlCapabilities: [
        'Adjust temperature setpoints',
        'Modify light schedules',
        'CO2 level control'
      ]
    }
  },
  {
    id: 'trolmaster-hydro-x',
    name: 'Hydro-X Pro',
    manufacturer: 'TrolMaster',
    category: 'cannabis',
    protocols: ['HTTP API', 'Modbus TCP'],
    apiType: 'rest',
    features: ['Multi-zone control', 'Lighting', 'HVAC', 'CO2', 'Irrigation'],
    integration: {
      method: 'Local HTTP API or Cloud API',
      requirements: [
        'Hydro-X Pro controller',
        'Network connectivity',
        'API enabled in settings'
      ],
      dataAvailable: [
        'All sensor readings',
        'Device states',
        'Schedule information',
        'Power consumption'
      ],
      controlCapabilities: [
        'Full lighting control',
        'Climate adjustments',
        'Schedule overrides',
        'Scene activation'
      ]
    }
  },
  {
    id: 'gavita-master',
    name: 'Gavita Master Controller',
    manufacturer: 'Gavita/Hawthorne',
    category: 'cannabis',
    protocols: ['Proprietary RF', 'Modbus TCP (EL3)'],
    apiType: 'proprietary',
    features: ['Lighting control', 'Dimming', 'Sunrise/sunset', 'Temperature protection'],
    integration: {
      method: 'Modbus TCP via EL3 model or API bridge',
      requirements: [
        'Gavita EL3 controller or',
        'Third-party API bridge',
        'Controller firmware 2.0+'
      ],
      dataAvailable: [
        'Light intensity levels',
        'Temperature readings',
        'Power consumption',
        'Fixture status'
      ],
      controlCapabilities: [
        'Dimming control (0-100%)',
        'On/off control',
        'Schedule modification',
        'Temperature dim response'
      ]
    }
  },
  {
    id: 'ridder-synopta',
    name: 'Synopta',
    manufacturer: 'Ridder',
    category: 'greenhouse',
    protocols: ['OPC UA', 'Modbus', 'BACnet'],
    apiType: 'modbus',
    features: ['Climate control', 'Irrigation', 'Energy', 'Labor', 'Logistics'],
    integration: {
      method: 'OPC UA server connection',
      requirements: [
        'Synopta version 9+',
        'OPC UA module license',
        'Network firewall rules'
      ],
      dataAvailable: [
        'Complete climate data',
        'Energy measurements',
        'Water usage',
        'Production metrics'
      ],
      controlCapabilities: [
        'Climate strategy adjustment',
        'Lighting control',
        'Screen management',
        'Heating optimization'
      ]
    }
  },
  {
    id: 'schneider-ecostruxure',
    name: 'EcoStruxure Building',
    manufacturer: 'Schneider Electric',
    category: 'building-automation',
    protocols: ['BACnet/IP', 'Modbus TCP', 'REST API'],
    apiType: 'bacnet',
    features: ['HVAC', 'Lighting', 'Power monitoring', 'Security'],
    integration: {
      method: 'BACnet/IP or EcoStruxure API',
      requirements: [
        'BACnet integration license',
        'IT approval for network access',
        'Point mapping documentation'
      ],
      dataAvailable: [
        'Power consumption by circuit',
        'Lighting zones status',
        'HVAC operation',
        'Demand metrics'
      ],
      controlCapabilities: [
        'Lighting dimming',
        'HVAC setpoint adjustment',
        'Demand response participation'
      ]
    }
  },
  {
    id: 'johnson-metasys',
    name: 'Metasys',
    manufacturer: 'Johnson Controls',
    category: 'building-automation',
    protocols: ['BACnet/IP', 'REST API', 'OPC UA'],
    apiType: 'rest',
    features: ['Building automation', 'Energy management', 'Lighting control'],
    integration: {
      method: 'Metasys API or BACnet',
      requirements: [
        'Metasys version 10.0+',
        'API user account',
        'SSL certificates'
      ],
      dataAvailable: [
        'Space utilization',
        'Energy consumption',
        'Equipment runtime',
        'Alarm status'
      ],
      controlCapabilities: [
        'Zone control',
        'Schedule management',
        'Demand limiting',
        'Load shedding'
      ]
    }
  },
  {
    id: 'growtronix',
    name: 'GrowtronixOS',
    manufacturer: 'Growtronix',
    category: 'cannabis',
    protocols: ['REST API', 'WebSocket', 'Modbus'],
    apiType: 'rest',
    features: ['Automation', 'Monitoring', 'Alerts', 'Data analytics'],
    integration: {
      method: 'GrowtronixOS Web API',
      requirements: [
        'API license',
        'User authentication token',
        'Webhook configuration'
      ],
      dataAvailable: [
        'All sensor data',
        'Device statuses',
        'Historical logs',
        'Alert configurations'
      ],
      controlCapabilities: [
        'Full device control',
        'Rule modification',
        'Schedule updates',
        'Alert thresholds'
      ]
    }
  },
  {
    id: 'microgrow-optigrow',
    name: 'OptiGrow',
    manufacturer: 'MicroGrow Systems',
    category: 'cannabis',
    protocols: ['Cloud API', 'MQTT'],
    apiType: 'cloud',
    features: ['Wireless sensors', 'Automated control', 'Mobile app'],
    integration: {
      method: 'OptiGrow Cloud API',
      requirements: [
        'Cloud subscription',
        'API access enabled',
        'Facility permissions'
      ],
      dataAvailable: [
        'Wireless sensor mesh data',
        'Control states',
        'Historical trends',
        'Energy estimates'
      ],
      controlCapabilities: [
        'Zone control',
        'Recipe management',
        'Alert configuration'
      ]
    }
  }
];

/**
 * Get integration instructions for a specific control system
 */
export function getIntegrationGuide(systemId: string): string {
  const system = CONTROL_SYSTEMS.find(s => s.id === systemId);
  if (!system) return 'System not found';
  
  return `
# ${system.name} Integration Guide

## Overview
${system.name} by ${system.manufacturer} is a ${system.category} control system.

## Integration Method
${system.integration.method}

## Requirements
${system.integration.requirements.map(r => `- ${r}`).join('\n')}

## Available Data
${system.integration.dataAvailable.map(d => `- ${d}`).join('\n')}

## Control Capabilities
${system.integration.controlCapabilities.map(c => `- ${c}`).join('\n')}

## Protocol: ${system.protocols.join(', ')}
  `;
}

/**
 * Check if a control system supports required features
 */
export function checkCompatibility(
  systemId: string, 
  requiredFeatures: string[]
): { compatible: boolean; missing: string[] } {
  const system = CONTROL_SYSTEMS.find(s => s.id === systemId);
  if (!system) return { compatible: false, missing: requiredFeatures };
  
  const missing = requiredFeatures.filter(
    feature => !system.integration.controlCapabilities.includes(feature)
  );
  
  return {
    compatible: missing.length === 0,
    missing
  };
}