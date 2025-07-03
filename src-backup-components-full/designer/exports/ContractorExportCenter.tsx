'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, FileText, Map, Zap, Package, Wrench, 
  CheckSquare, Calendar, DollarSign, Shield, 
  Truck, ClipboardList, AlertTriangle, HardHat,
  Building, FileSpreadsheet, Image, Settings,
  Users, Phone, Mail, MapPin
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';

interface ContractorExportCenterProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function ContractorExportCenter({ isOpen = true, onClose }: ContractorExportCenterProps) {
  const { state } = useDesigner();
  const [exportType, setExportType] = useState<'package' | 'individual'>('package');
  const [selectedExports, setSelectedExports] = useState<string[]>([]);

  const contractorExports = {
    // Installation & Construction
    installation: {
      title: 'Installation Documents',
      icon: <HardHat className="w-5 h-5" />,
      exports: [
        { id: 'installation-drawings', name: 'Installation Drawings (CAD)', format: 'DWG/PDF', essential: true },
        { id: 'mounting-details', name: 'Mounting Details & Hardware', format: 'PDF', essential: true },
        { id: 'conduit-routing', name: 'Conduit Routing Plans', format: 'PDF', essential: true },
        { id: 'fixture-schedule', name: 'Fixture Installation Schedule', format: 'CSV/PDF', essential: true },
        { id: 'field-verification', name: 'Field Verification Checklist', format: 'PDF', essential: false },
        { id: 'safety-requirements', name: 'Safety Requirements & PPE', format: 'PDF', essential: true }
      ]
    },

    // Electrical Systems
    electrical: {
      title: 'Electrical Documentation',
      icon: <Zap className="w-5 h-5" />,
      exports: [
        { id: 'panel-schedules', name: 'Panel Schedules & Load Calculations', format: 'PDF', essential: true },
        { id: 'circuit-diagrams', name: 'Circuit Diagrams & Routing', format: 'PDF', essential: true },
        { id: 'single-line', name: 'Single-Line Diagrams', format: 'PDF', essential: true },
        { id: 'conduit-fill', name: 'Conduit Fill Calculations', format: 'PDF', essential: false },
        { id: 'grounding-plan', name: 'Equipment Grounding Plan', format: 'PDF', essential: true },
        { id: 'arc-flash-study', name: 'Arc Flash Study & Labels', format: 'PDF', essential: false }
      ]
    },

    // Materials & Procurement
    materials: {
      title: 'Materials & Procurement',
      icon: <Package className="w-5 h-5" />,
      exports: [
        { id: 'bom-detailed', name: 'Detailed Bill of Materials', format: 'Excel/CSV', essential: true },
        { id: 'material-takeoff', name: 'Material Takeoff Quantities', format: 'Excel', essential: true },
        { id: 'vendor-contacts', name: 'Vendor Contact Information', format: 'PDF', essential: false },
        { id: 'shipping-schedule', name: 'Material Delivery Schedule', format: 'PDF', essential: false },
        { id: 'storage-requirements', name: 'Material Storage Requirements', format: 'PDF', essential: false },
        { id: 'substitute-products', name: 'Approved Substitute Products', format: 'PDF', essential: false }
      ]
    },

    // Project Management
    project: {
      title: 'Project Management',
      icon: <ClipboardList className="w-5 h-5" />,
      exports: [
        { id: 'project-schedule', name: 'Installation Schedule (Gantt)', format: 'PDF/MS Project', essential: true },
        { id: 'labor-estimates', name: 'Labor Time Estimates', format: 'Excel', essential: true },
        { id: 'milestone-checklist', name: 'Project Milestone Checklist', format: 'PDF', essential: false },
        { id: 'coordination-drawings', name: 'MEP Coordination Drawings', format: 'PDF', essential: false },
        { id: 'punch-list', name: 'Pre-Construction Punch List', format: 'PDF', essential: false },
        { id: 'progress-tracking', name: 'Progress Tracking Templates', format: 'Excel', essential: false }
      ]
    },

    // Testing & Commissioning
    testing: {
      title: 'Testing & Commissioning',
      icon: <CheckSquare className="w-5 h-5" />,
      exports: [
        { id: 'commissioning-plan', name: 'Commissioning Plan & Procedures', format: 'PDF', essential: true },
        { id: 'test-procedures', name: 'Testing Procedures & Forms', format: 'PDF', essential: true },
        { id: 'acceptance-criteria', name: 'Performance Acceptance Criteria', format: 'PDF', essential: true },
        { id: 'calibration-requirements', name: 'Calibration Requirements', format: 'PDF', essential: false },
        { id: 'warranty-documentation', name: 'Warranty Documentation', format: 'PDF', essential: true },
        { id: 'maintenance-schedule', name: 'Maintenance Schedule Template', format: 'PDF', essential: false }
      ]
    },

    // Permits & Compliance
    permits: {
      title: 'Permits & Compliance',
      icon: <Shield className="w-5 h-5" />,
      exports: [
        { id: 'permit-drawings', name: 'Permit Submittal Drawings', format: 'PDF', essential: true },
        { id: 'code-compliance', name: 'Code Compliance Report', format: 'PDF', essential: true },
        { id: 'energy-compliance', name: 'Energy Code Compliance', format: 'PDF', essential: true },
        { id: 'inspection-checklist', name: 'Inspection Readiness Checklist', format: 'PDF', essential: false },
        { id: 'acd-documentation', name: 'AHJ Review Documentation', format: 'PDF', essential: false },
        { id: 'certificate-compliance', name: 'Certificate of Compliance Template', format: 'PDF', essential: false }
      ]
    },

    // Cost & Bidding
    financial: {
      title: 'Cost Estimation & Bidding',
      icon: <DollarSign className="w-5 h-5" />,
      exports: [
        { id: 'cost-breakdown', name: 'Detailed Cost Breakdown', format: 'Excel', essential: true },
        { id: 'labor-analysis', name: 'Labor Analysis by Trade', format: 'Excel', essential: true },
        { id: 'change-order-template', name: 'Change Order Templates', format: 'PDF', essential: false },
        { id: 'value-engineering', name: 'Value Engineering Options', format: 'PDF', essential: false },
        { id: 'bid-comparison', name: 'Bid Comparison Worksheet', format: 'Excel', essential: false },
        { id: 'payment-schedule', name: 'Payment Schedule Template', format: 'PDF', essential: false }
      ]
    },

    // Field Support
    field: {
      title: 'Field Support Tools',
      icon: <Wrench className="w-5 h-5" />,
      exports: [
        { id: 'field-drawings', name: 'Field Installation Drawings', format: 'PDF (11x17)', essential: true },
        { id: 'troubleshooting-guide', name: 'Troubleshooting Guide', format: 'PDF', essential: true },
        { id: 'startup-procedures', name: 'System Startup Procedures', format: 'PDF', essential: true },
        { id: 'qr-code-labels', name: 'QR Code Asset Labels', format: 'PDF Labels', essential: false },
        { id: 'emergency-contacts', name: 'Emergency Contact List', format: 'PDF', essential: true },
        { id: 'field-change-forms', name: 'Field Change Request Forms', format: 'PDF', essential: false }
      ]
    }
  };

  const handleExportPackage = () => {
    // Generate comprehensive contractor package
    const essentialExports = Object.values(contractorExports)
      .flatMap(category => category.exports.filter(exp => exp.essential))
      .map(exp => exp.id);

    generateContractorPackage(essentialExports);
  };

  const generateContractorPackage = (exportIds: string[]) => {
    // Implementation would generate all selected exports as a ZIP package
  };

  const toggleExport = (exportId: string) => {
    setSelectedExports(prev => 
      prev.includes(exportId) 
        ? prev.filter(id => id !== exportId)
        : [...prev, exportId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-600 rounded-lg">
                <HardHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Contractor Export Center</h2>
                <p className="text-gray-400">Generate installation-ready documentation packages</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>

          {/* Export Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setExportType('package')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                exportType === 'package'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Complete Package
            </button>
            <button
              onClick={() => setExportType('individual')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                exportType === 'individual'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Individual Exports
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {exportType === 'package' ? (
            /* Package Mode */
            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Complete Contractor Package</CardTitle>
                  <CardDescription className="text-gray-400">
                    All essential documents for project execution and compliance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(contractorExports).map(([key, category]) => (
                      <div key={key} className="text-center">
                        <div className="w-16 h-16 bg-orange-600/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                          {React.cloneElement(category.icon, { className: "w-8 h-8 text-orange-400" })}
                        </div>
                        <h4 className="text-sm font-medium text-white">{category.title}</h4>
                        <p className="text-xs text-gray-400">
                          {category.exports.filter(exp => exp.essential).length} essential docs
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-white font-medium">Package Contents</h4>
                        <p className="text-sm text-gray-400">
                          {Object.values(contractorExports).reduce((sum, cat) => 
                            sum + cat.exports.filter(exp => exp.essential).length, 0
                          )} essential documents included
                        </p>
                      </div>
                      <Badge variant="outline" className="text-orange-400 border-orange-400">
                        Production Ready
                      </Badge>
                    </div>

                    <button
                      onClick={handleExportPackage}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Generate Complete Package (ZIP)
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Package Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(contractorExports).map(([key, category]) => (
                  <Card key={key} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        {category.icon}
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {category.exports.filter(exp => exp.essential).map(exp => (
                          <div key={exp.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">{exp.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {exp.format}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            /* Individual Mode */
            <div className="space-y-6">
              {Object.entries(contractorExports).map(([key, category]) => (
                <Card key={key} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      {category.icon}
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {category.exports.map(exp => (
                        <div
                          key={exp.id}
                          className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                            selectedExports.includes(exp.id)
                              ? 'border-orange-500 bg-orange-500/10'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                          onClick={() => toggleExport(exp.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-white">{exp.name}</h4>
                                {exp.essential && (
                                  <Badge variant="outline" className="text-xs text-orange-400 border-orange-400">
                                    Essential
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">{exp.format}</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={selectedExports.includes(exp.id)}
                              onChange={() => toggleExport(exp.id)}
                              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-orange-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Generate Selected */}
              {selectedExports.length > 0 && (
                <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">
                        {selectedExports.length} documents selected
                      </p>
                      <p className="text-sm text-gray-400">
                        Ready for export
                      </p>
                    </div>
                    <button
                      onClick={() => generateContractorPackage(selectedExports)}
                      className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Export Selected ({selectedExports.length})
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}