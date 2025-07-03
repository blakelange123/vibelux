'use client';

import React, { useState } from 'react';
import { FileText, Download, Package, Zap, Clock, Users, DollarSign, AlertCircle } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { BillOfMaterialsGenerator, ProfessionalBOM } from '@/lib/bom/bill-of-materials';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface BOMExportProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function BillOfMaterialsExport({ isOpen = false, onClose }: BOMExportProps) {
  const { state } = useDesigner();
  const { showNotification } = useNotifications();
  const [projectInfo, setProjectInfo] = useState({
    name: '',
    number: '',
    client: '',
    location: '',
    preparedBy: '',
    checkedBy: ''
  });
  const [bom, setBom] = useState<ProfessionalBOM | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateBOM = () => {
    if (!state.room) {
      showNotification('error', 'Please create a room first');
      return;
    }

    setIsGenerating(true);
    try {
      const generatedBOM = BillOfMaterialsGenerator.generate(
        state.room,
        state.objects,
        projectInfo
      );
      setBom(generatedBOM);
      showNotification('success', 'Bill of Materials generated successfully');
    } catch (error) {
      showNotification('error', 'Failed to generate Bill of Materials');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = () => {
    if (!bom) return;

    const pdf = new jsPDF('p', 'mm', 'letter');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BILL OF MATERIALS', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Project Info
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const projectInfoText = [
      `Project: ${bom.project.name}`,
      `Project #: ${bom.project.number}`,
      `Client: ${bom.project.client}`,
      `Location: ${bom.project.location}`,
      `Date: ${new Date(bom.project.date).toLocaleDateString()}`,
      `Prepared By: ${bom.project.preparedBy}`
    ];
    
    projectInfoText.forEach((text, i) => {
      pdf.text(text, 20, yPosition + (i * 5));
    });
    yPosition += 35;

    // Summary Box
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, yPosition, pageWidth - 40, 30, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.text('PROJECT SUMMARY', 25, yPosition + 7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Fixtures: ${bom.summary.totalFixtures}`, 25, yPosition + 14);
    pdf.text(`Total Connected Load: ${bom.summary.totalWattage.toLocaleString()}W`, 25, yPosition + 21);
    pdf.text(`Total Material Cost: $${bom.summary.totalCost.toLocaleString()}`, 100, yPosition + 14);
    pdf.text(`Watts/sq.ft: ${bom.summary.wattsPerSqFt.toFixed(2)}`, 100, yPosition + 21);
    yPosition += 40;

    // Materials Table
    pdf.setFont('helvetica', 'bold');
    pdf.text('MATERIALS LIST', 20, yPosition);
    yPosition += 5;

    const tableData = bom.items.map(item => [
      item.id,
      item.description,
      item.quantity.toString(),
      item.unit,
      `$${item.unitPrice?.toFixed(2) || '-'}`,
      `$${item.totalPrice?.toFixed(2) || '-'}`
    ]);

    autoTable(pdf, {
      startY: yPosition,
      head: [['ID', 'Description', 'Qty', 'Unit', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [80, 80, 80] },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 }
    });

    yPosition = (pdf as any).lastAutoTable.finalY + 10;

    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 20;
    }

    // Electrical Requirements
    pdf.setFont('helvetica', 'bold');
    pdf.text('ELECTRICAL REQUIREMENTS', 20, yPosition);
    yPosition += 7;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Connected Load: ${bom.electrical.totalConnectedLoad.toLocaleString()}W`, 25, yPosition);
    yPosition += 5;
    pdf.text(`Voltage: ${bom.electrical.voltage}`, 25, yPosition);
    yPosition += 5;
    pdf.text(`Phase: ${bom.electrical.phase}`, 25, yPosition);
    yPosition += 5;
    pdf.text(`Recommended Circuits: ${bom.electrical.recommendedCircuits.length}`, 25, yPosition);
    yPosition += 5;
    pdf.text(`Estimated Daily Usage: ${bom.electrical.estimatedDailyUsage.toFixed(1)} kWh`, 25, yPosition);
    yPosition += 10;

    // Installation Requirements
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.text('INSTALLATION REQUIREMENTS', 20, yPosition);
    yPosition += 7;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Labor Hours: ${bom.installation.laborHours.total}`, 25, yPosition);
    yPosition += 5;
    pdf.text(`Electrical: ${bom.installation.laborHours.electrical} hrs`, 30, yPosition);
    yPosition += 5;
    pdf.text(`Mounting: ${bom.installation.laborHours.mounting} hrs`, 30, yPosition);
    yPosition += 5;
    pdf.text(`Controls: ${bom.installation.laborHours.controls} hrs`, 30, yPosition);
    yPosition += 5;
    pdf.text(`Commissioning: ${bom.installation.laborHours.commissioning} hrs`, 30, yPosition);
    yPosition += 10;

    // Crew Requirements
    pdf.text(`Crew Size:`, 25, yPosition);
    yPosition += 5;
    pdf.text(`Electricians: ${bom.installation.crewSize.electricians}`, 30, yPosition);
    yPosition += 5;
    pdf.text(`Helpers: ${bom.installation.crewSize.helpers}`, 30, yPosition);
    yPosition += 10;

    // Notes
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.text('NOTES', 20, yPosition);
    yPosition += 7;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    bom.notes.forEach((note, i) => {
      pdf.text(`${i + 1}. ${note}`, 25, yPosition);
      yPosition += 5;
    });

    // Footer
    pdf.setFontSize(8);
    pdf.text(
      'Generated by VibeLux Professional Lighting Design Software',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    pdf.save(`BOM_${bom.project.number || 'project'}.pdf`);
    showNotification('success', 'Bill of Materials exported to PDF');
  };

  const exportToCSV = () => {
    if (!bom) return;

    const csv = BillOfMaterialsGenerator.exportToCSV(bom);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BOM_${bom.project.number || 'project'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('success', 'Bill of Materials exported to CSV');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bill of Materials Generator
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Generate professional BOM and installation documentation
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {!bom ? (
            // Project Info Form
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Project Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={projectInfo.name}
                      onChange={(e) => setProjectInfo({ ...projectInfo, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Project Number
                    </label>
                    <input
                      type="text"
                      value={projectInfo.number}
                      onChange={(e) => setProjectInfo({ ...projectInfo, number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Client Name
                    </label>
                    <input
                      type="text"
                      value={projectInfo.client}
                      onChange={(e) => setProjectInfo({ ...projectInfo, client: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Project Location
                    </label>
                    <input
                      type="text"
                      value={projectInfo.location}
                      onChange={(e) => setProjectInfo({ ...projectInfo, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prepared By
                    </label>
                    <input
                      type="text"
                      value={projectInfo.preparedBy}
                      onChange={(e) => setProjectInfo({ ...projectInfo, preparedBy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Checked By
                    </label>
                    <input
                      type="text"
                      value={projectInfo.checkedBy}
                      onChange={(e) => setProjectInfo({ ...projectInfo, checkedBy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">What's included in the BOM:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>All lighting fixtures from your design</li>
                      <li>Mounting hardware and accessories</li>
                      <li>Electrical components (wire, breakers, junction boxes)</li>
                      <li>Control system components (if applicable)</li>
                      <li>Labor hour estimates</li>
                      <li>Installation sequencing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // BOM Display
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Fixtures</span>
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {bom.summary.totalFixtures}
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Load</span>
                    <Zap className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(bom.summary.totalWattage / 1000).toFixed(1)}kW
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Labor Hours</span>
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {bom.installation.laborHours.total}
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Material Cost</span>
                    <DollarSign className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${bom.summary.totalCost.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Materials Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Materials List
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">Description</th>
                        <th className="px-4 py-2 text-center">Qty</th>
                        <th className="px-4 py-2 text-center">Unit</th>
                        <th className="px-4 py-2 text-right">Unit Price</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bom.items.map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-100 dark:border-gray-700/50"
                        >
                          <td className="px-4 py-2">{item.id}</td>
                          <td className="px-4 py-2">{item.description}</td>
                          <td className="px-4 py-2 text-center">{item.quantity}</td>
                          <td className="px-4 py-2 text-center">{item.unit}</td>
                          <td className="px-4 py-2 text-right">
                            ${item.unitPrice?.toFixed(2) || '-'}
                          </td>
                          <td className="px-4 py-2 text-right font-medium">
                            ${item.totalPrice?.toFixed(2) || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Electrical Requirements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Electrical Requirements
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Connected Load:</span>
                    <span className="font-medium">{bom.electrical.totalConnectedLoad.toLocaleString()}W</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Voltage:</span>
                    <span className="font-medium">{bom.electrical.voltage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Phase:</span>
                    <span className="font-medium">{bom.electrical.phase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Circuits Required:</span>
                    <span className="font-medium">{bom.electrical.recommendedCircuits.length}</span>
                  </div>
                </div>
              </div>

              {/* Installation Schedule */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Installation Schedule
                </h3>
                <div className="space-y-3">
                  {bom.installation.sequencing.map((phase, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium">
                        {phase.phase}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {phase.description}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Duration: {phase.duration}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          {!bom ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generateBOM}
                disabled={isGenerating}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate BOM
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setBom(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
              >
                Back
              </button>
              <div className="flex gap-3">
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={exportToPDF}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}