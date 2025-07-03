'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import PhotoReportFlow from '@/components/visual-ops/PhotoReportFlow';
import { 
  Bug, Wrench, Shield, Eye, Package, Zap, 
  ThermometerSun, Droplets, Leaf, AlertTriangle, 
  Users, ClipboardCheck 
} from 'lucide-react';

const reportTypeConfigs = {
  'pest_disease': {
    title: 'Pest/Disease Report',
    icon: Bug,
    color: 'red',
    guidelines: [
      'Capture clear close-up of affected area',
      'Include wider shot showing spread pattern',
      'Photo any visible pests or eggs',
      'Show both top and bottom of leaves if applicable'
    ],
    requiredFields: ['description', 'severity', 'affectedArea'],
    aiPrompt: 'Analyze for pest or disease presence, identify type, assess severity and spread risk'
  },
  'equipment_issue': {
    title: 'Equipment Issue',
    icon: Wrench,
    color: 'orange',
    guidelines: [
      'Show the specific problem area',
      'Include equipment model/serial number if visible',
      'Capture any error messages or warning lights',
      'Photo any visible damage or wear'
    ],
    requiredFields: ['description', 'severity', 'equipmentId'],
    aiPrompt: 'Identify equipment malfunction, estimate repair cost and urgency'
  },
  'safety_hazard': {
    title: 'Safety Hazard',
    icon: Shield,
    color: 'red',
    guidelines: [
      'Capture the hazard from a safe distance',
      'Show the surrounding area for context',
      'Include any missing safety equipment',
      'Document blocked exits or pathways'
    ],
    requiredFields: ['description', 'severity', 'immediateAction'],
    aiPrompt: 'Assess safety risk level, identify OSHA violations, recommend immediate actions'
  },
  'quality_issue': {
    title: 'Quality Issue',
    icon: Eye,
    color: 'indigo',
    guidelines: [
      'Use good lighting to show defects clearly',
      'Include batch/lot numbers if visible',
      'Capture multiple angles of the issue',
      'Show comparison with normal product if possible'
    ],
    requiredFields: ['description', 'severity', 'batchInfo'],
    aiPrompt: 'Identify quality defects, assess impact on product, determine if batch should be quarantined'
  },
  'inventory_count': {
    title: 'Inventory Check',
    icon: Package,
    color: 'green',
    guidelines: [
      'Capture full shelf or storage area',
      'Ensure labels are readable',
      'Show any damage or expiration dates',
      'Include multiple angles for accuracy'
    ],
    requiredFields: ['description', 'itemCount', 'location'],
    aiPrompt: 'Count visible items, read labels and expiration dates, identify low stock items'
  },
  'electrical_issue': {
    title: 'Electrical Issue',
    icon: Zap,
    color: 'yellow',
    guidelines: [
      'SAFETY FIRST - Do not touch exposed wires',
      'Capture from a safe distance',
      'Show any sparking, smoking, or damage',
      'Include circuit breaker panel if relevant'
    ],
    requiredFields: ['description', 'severity', 'immediateAction'],
    aiPrompt: 'Identify electrical hazards, assess fire risk, recommend safety actions'
  },
  'environmental': {
    title: 'Environmental Issue',
    icon: ThermometerSun,
    color: 'blue',
    guidelines: [
      'Show temperature/humidity displays if visible',
      'Capture any condensation or frost',
      'Photo ventilation issues or blockages',
      'Include multiple areas if widespread'
    ],
    requiredFields: ['description', 'environmentalData'],
    aiPrompt: 'Analyze environmental conditions, identify HVAC issues, assess impact on operations'
  },
  'water_leak': {
    title: 'Water/Leak Issue',
    icon: Droplets,
    color: 'blue',
    guidelines: [
      'Show the source of leak if visible',
      'Capture the extent of water spread',
      'Include any damage to equipment or products',
      'Photo from multiple angles'
    ],
    requiredFields: ['description', 'severity', 'affectedArea'],
    aiPrompt: 'Identify leak source, assess water damage risk, recommend containment actions'
  },
  'plant_health': {
    title: 'Plant Health Check',
    icon: Leaf,
    color: 'green',
    guidelines: [
      'Capture overall plant structure',
      'Close-up of any discoloration or damage',
      'Show new growth or flowering status',
      'Include canopy density view'
    ],
    requiredFields: ['description', 'plantStage', 'healthScore'],
    aiPrompt: 'Assess plant health, identify nutrient deficiencies, predict yield impact'
  },
  'compliance': {
    title: 'Compliance Documentation',
    icon: ClipboardCheck,
    color: 'purple',
    guidelines: [
      'Ensure all labels are clearly visible',
      'Capture required signage or documentation',
      'Show clean and organized areas',
      'Include timestamps or date markers'
    ],
    requiredFields: ['description', 'complianceType', 'documentation'],
    aiPrompt: 'Verify compliance requirements, identify any violations, document for audit trail'
  },
  'cleaning_needed': {
    title: 'Cleaning Required',
    icon: AlertTriangle,
    color: 'yellow',
    guidelines: [
      'Show the full area needing cleaning',
      'Capture any contamination or buildup',
      'Include surrounding areas for context',
      'Document before starting any cleaning'
    ],
    requiredFields: ['description', 'cleaningType', 'estimatedTime'],
    aiPrompt: 'Assess cleaning requirements, identify contamination risks, estimate cleaning time'
  },
  'training_needed': {
    title: 'Training Issue',
    icon: Users,
    color: 'orange',
    guidelines: [
      'Capture incorrect procedure if safe to do so',
      'Show proper setup for comparison',
      'Include any missing safety equipment',
      'Document the specific issue clearly'
    ],
    requiredFields: ['description', 'trainingType', 'personnelInvolved'],
    aiPrompt: 'Identify training gaps, assess safety risks, recommend specific training modules'
  }
};

export default function VisualOpsCaptureePage() {
  const searchParams = useSearchParams();
  const reportType = searchParams.get('type') || 'pest_disease';
  const facilityId = searchParams.get('facility') || 'default-facility';
  const userId = searchParams.get('user') || 'current-user';
  
  const config = reportTypeConfigs[reportType as keyof typeof reportTypeConfigs] || reportTypeConfigs['pest_disease'];

  return (
    <PhotoReportFlow
      reportType={reportType}
      reportTypeConfig={config}
      facilityId={facilityId}
      userId={userId}
    />
  );
}