'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Download,
  FileSpreadsheet,
  Calculator,
  DollarSign,
  Wrench,
  Plus,
  Trash2,
  Copy,
  Upload,
  Info
} from 'lucide-react';

interface MaterialItem {
  id: string;
  category: string;
  description: string;
  manufacturer?: string;
  model?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  supplier?: string;
  leadTime?: number; // days
  notes?: string;
}

interface MaterialCategory {
  name: string;
  items: MaterialItem[];
  subtotal: number;
}

interface BOMInputs {
  projectName: string;
  projectNumber: string;
  estimator: string;
  date: Date;
  taxRate: number;
  markupPercent: number;
  contingencyPercent: number;
  categories: MaterialCategory[];
}

// Standard electrical material database
const materialDatabase = {
  fixtures: [
    { description: 'LED High Bay 150W', unit: 'EA', unitPrice: 385 },
    { description: 'LED Linear Strip 4ft 40W', unit: 'EA', unitPrice: 125 },
    { description: 'LED Troffer 2x4 50W', unit: 'EA', unitPrice: 195 },
    { description: 'Emergency Exit Sign LED', unit: 'EA', unitPrice: 85 },
    { description: 'Emergency Light Dual Head', unit: 'EA', unitPrice: 145 }
  ],
  wire: [
    { description: '#12 THHN Copper Wire', unit: 'FT', unitPrice: 0.85 },
    { description: '#10 THHN Copper Wire', unit: 'FT', unitPrice: 1.35 },
    { description: '#8 THHN Copper Wire', unit: 'FT', unitPrice: 2.15 },
    { description: '#6 THHN Copper Wire', unit: 'FT', unitPrice: 3.45 },
    { description: '#4 THHN Copper Wire', unit: 'FT', unitPrice: 5.25 },
    { description: '#2 THHN Copper Wire', unit: 'FT', unitPrice: 7.85 },
    { description: '#1/0 THHN Copper Wire', unit: 'FT', unitPrice: 11.25 }
  ],
  conduit: [
    { description: '1/2" EMT Conduit', unit: 'FT', unitPrice: 2.85 },
    { description: '3/4" EMT Conduit', unit: 'FT', unitPrice: 3.95 },
    { description: '1" EMT Conduit', unit: 'FT', unitPrice: 5.25 },
    { description: '1-1/4" EMT Conduit', unit: 'FT', unitPrice: 7.50 },
    { description: '1-1/2" EMT Conduit', unit: 'FT', unitPrice: 9.75 },
    { description: '2" EMT Conduit', unit: 'FT', unitPrice: 13.25 }
  ],
  panels: [
    { description: 'Panel 208V 3PH 100A MLO 24 Space', unit: 'EA', unitPrice: 485 },
    { description: 'Panel 208V 3PH 200A MB 42 Space', unit: 'EA', unitPrice: 895 },
    { description: 'Panel 480V 3PH 400A MB 42 Space', unit: 'EA', unitPrice: 2450 },
    { description: 'Breaker 20A 1P', unit: 'EA', unitPrice: 35 },
    { description: 'Breaker 30A 2P', unit: 'EA', unitPrice: 85 },
    { description: 'Breaker 60A 3P', unit: 'EA', unitPrice: 225 }
  ],
  devices: [
    { description: 'Switch Single Pole 20A', unit: 'EA', unitPrice: 12 },
    { description: 'Receptacle Duplex 20A', unit: 'EA', unitPrice: 15 },
    { description: 'Receptacle GFCI 20A', unit: 'EA', unitPrice: 35 },
    { description: 'Disconnect 30A 3P NEMA 3R', unit: 'EA', unitPrice: 125 },
    { description: 'Disconnect 60A 3P NEMA 3R', unit: 'EA', unitPrice: 185 },
    { description: 'Time Clock 24HR 240V', unit: 'EA', unitPrice: 245 }
  ],
  boxes: [
    { description: '4" Square Box', unit: 'EA', unitPrice: 3.50 },
    { description: '4-11/16" Square Box Deep', unit: 'EA', unitPrice: 5.25 },
    { description: 'Pull Box 6x6x4', unit: 'EA', unitPrice: 25 },
    { description: 'Pull Box 12x12x6', unit: 'EA', unitPrice: 85 },
    { description: 'Weatherproof Box Single Gang', unit: 'EA', unitPrice: 15 }
  ],
  fittings: [
    { description: '1/2" EMT Connector', unit: 'EA', unitPrice: 1.25 },
    { description: '3/4" EMT Connector', unit: 'EA', unitPrice: 1.85 },
    { description: '1" EMT Connector', unit: 'EA', unitPrice: 2.95 },
    { description: '1/2" EMT Coupling', unit: 'EA', unitPrice: 0.95 },
    { description: '3/4" EMT Coupling', unit: 'EA', unitPrice: 1.35 },
    { description: '1" EMT Coupling', unit: 'EA', unitPrice: 2.15 }
  ],
  supports: [
    { description: 'Strut Channel 10ft', unit: 'EA', unitPrice: 28.50 },
    { description: 'Strut Strap 1/2"', unit: 'EA', unitPrice: 1.85 },
    { description: 'Strut Strap 3/4"', unit: 'EA', unitPrice: 2.15 },
    { description: 'Beam Clamp 3/8"', unit: 'EA', unitPrice: 4.25 },
    { description: 'All Thread Rod 3/8" x 10ft', unit: 'EA', unitPrice: 12.50 },
    { description: 'Spring Nut 3/8"', unit: 'EA', unitPrice: 0.85 }
  ],
  grounding: [
    { description: 'Ground Rod 5/8" x 8ft', unit: 'EA', unitPrice: 28.50 },
    { description: 'Ground Clamp Bronze', unit: 'EA', unitPrice: 8.50 },
    { description: '#6 Bare Copper Wire', unit: 'FT', unitPrice: 2.85 },
    { description: '#4 Bare Copper Wire', unit: 'FT', unitPrice: 4.25 },
    { description: 'Grounding Busbar Kit', unit: 'EA', unitPrice: 125 },
    { description: 'Exothermic Weld Kit', unit: 'EA', unitPrice: 35 }
  ],
  misc: [
    { description: 'Wire Nuts Red (100 pack)', unit: 'BOX', unitPrice: 18.50 },
    { description: 'Wire Nuts Yellow (100 pack)', unit: 'BOX', unitPrice: 22.50 },
    { description: 'Cable Ties 8" (100 pack)', unit: 'BAG', unitPrice: 8.50 },
    { description: 'Electrical Tape', unit: 'ROLL', unitPrice: 3.50 },
    { description: 'Pull String 6500lb', unit: 'FT', unitPrice: 0.25 },
    { description: 'Wire Pulling Lubricant', unit: 'GAL', unitPrice: 28.50 },
    { description: 'Phase Tape Set', unit: 'SET', unitPrice: 12.50 },
    { description: 'Labels and Markers', unit: 'SET', unitPrice: 45 }
  ]
};

export function BillOfMaterialsGenerator() {
  const [inputs, setInputs] = useState<BOMInputs>({
    projectName: 'Grow Room Lighting Project',
    projectNumber: 'PRJ-2024-001',
    estimator: 'Electrical Contractor',
    date: new Date(),
    taxRate: 8.5,
    markupPercent: 15,
    contingencyPercent: 10,
    categories: [
      {
        name: 'Lighting Fixtures',
        items: [],
        subtotal: 0
      },
      {
        name: 'Wire & Cable',
        items: [],
        subtotal: 0
      },
      {
        name: 'Conduit & Fittings',
        items: [],
        subtotal: 0
      },
      {
        name: 'Panels & Distribution',
        items: [],
        subtotal: 0
      },
      {
        name: 'Devices & Controls',
        items: [],
        subtotal: 0
      },
      {
        name: 'Boxes & Enclosures',
        items: [],
        subtotal: 0
      },
      {
        name: 'Support & Hardware',
        items: [],
        subtotal: 0
      },
      {
        name: 'Grounding & Bonding',
        items: [],
        subtotal: 0
      },
      {
        name: 'Miscellaneous',
        items: [],
        subtotal: 0
      }
    ]
  });

  const [selectedCategory, setSelectedCategory] = useState(0);
  const [showImport, setShowImport] = useState(false);

  // Calculate totals
  const calculateTotals = () => {
    let materialTotal = 0;
    const updatedCategories = inputs.categories.map(category => {
      const categorySubtotal = category.items.reduce((sum, item) => sum + item.totalPrice, 0);
      materialTotal += categorySubtotal;
      return { ...category, subtotal: categorySubtotal };
    });

    const tax = materialTotal * (inputs.taxRate / 100);
    const subtotalWithTax = materialTotal + tax;
    const markup = subtotalWithTax * (inputs.markupPercent / 100);
    const contingency = subtotalWithTax * (inputs.contingencyPercent / 100);
    const total = subtotalWithTax + markup + contingency;

    return {
      categories: updatedCategories,
      materialTotal,
      tax,
      subtotalWithTax,
      markup,
      contingency,
      total
    };
  };

  const addMaterialItem = (categoryIndex: number, item: Partial<MaterialItem>) => {
    const newItem: MaterialItem = {
      id: `item-${Date.now()}`,
      category: inputs.categories[categoryIndex].name,
      description: item.description || '',
      manufacturer: item.manufacturer,
      model: item.model,
      quantity: item.quantity || 1,
      unit: item.unit || 'EA',
      unitPrice: item.unitPrice || 0,
      totalPrice: (item.quantity || 1) * (item.unitPrice || 0),
      supplier: item.supplier,
      leadTime: item.leadTime,
      notes: item.notes
    };

    const updatedCategories = [...inputs.categories];
    updatedCategories[categoryIndex].items.push(newItem);
    
    setInputs(prev => ({ ...prev, categories: updatedCategories }));
  };

  const updateMaterialItem = (categoryIndex: number, itemId: string, updates: Partial<MaterialItem>) => {
    const updatedCategories = [...inputs.categories];
    const itemIndex = updatedCategories[categoryIndex].items.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      const item = updatedCategories[categoryIndex].items[itemIndex];
      const updatedItem = {
        ...item,
        ...updates,
        totalPrice: (updates.quantity || item.quantity) * (updates.unitPrice || item.unitPrice)
      };
      updatedCategories[categoryIndex].items[itemIndex] = updatedItem;
      setInputs(prev => ({ ...prev, categories: updatedCategories }));
    }
  };

  const deleteMaterialItem = (categoryIndex: number, itemId: string) => {
    const updatedCategories = [...inputs.categories];
    updatedCategories[categoryIndex].items = updatedCategories[categoryIndex].items.filter(
      item => item.id !== itemId
    );
    setInputs(prev => ({ ...prev, categories: updatedCategories }));
  };

  const exportToExcel = () => {
    const totals = calculateTotals();
    
    // Create CSV content
    let csv = `BILL OF MATERIALS\n`;
    csv += `Project: ${inputs.projectName}\n`;
    csv += `Project Number: ${inputs.projectNumber}\n`;
    csv += `Date: ${inputs.date.toLocaleDateString()}\n`;
    csv += `Estimator: ${inputs.estimator}\n\n`;
    
    csv += `Category,Description,Manufacturer,Model,Quantity,Unit,Unit Price,Total Price,Supplier,Lead Time,Notes\n`;
    
    totals.categories.forEach(category => {
      category.items.forEach(item => {
        csv += `"${category.name}","${item.description}","${item.manufacturer || ''}","${item.model || ''}",`;
        csv += `${item.quantity},"${item.unit}",${item.unitPrice.toFixed(2)},${item.totalPrice.toFixed(2)},`;
        csv += `"${item.supplier || ''}","${item.leadTime || ''}","${item.notes || ''}"\n`;
      });
      
      if (category.items.length > 0) {
        csv += `,,,,,,Category Subtotal:,${category.subtotal.toFixed(2)},,\n`;
      }
    });
    
    csv += `\nSUMMARY\n`;
    csv += `Material Total,,,,,,${totals.materialTotal.toFixed(2)}\n`;
    csv += `Tax (${inputs.taxRate}%),,,,,,${totals.tax.toFixed(2)}\n`;
    csv += `Subtotal,,,,,,${totals.subtotalWithTax.toFixed(2)}\n`;
    csv += `Markup (${inputs.markupPercent}%),,,,,,${totals.markup.toFixed(2)}\n`;
    csv += `Contingency (${inputs.contingencyPercent}%),,,,,,${totals.contingency.toFixed(2)}\n`;
    csv += `TOTAL,,,,,,${totals.total.toFixed(2)}\n`;
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `BOM_${inputs.projectNumber}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    const totals = calculateTotals();
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    
    if (printWindow) {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Bill of Materials - ${inputs.projectName}</title>
            <style>
              @page { size: letter portrait; margin: 0.5in; }
              body { 
                font-family: Arial, sans-serif; 
                font-size: 10pt; 
                line-height: 1.4;
                color: #333;
              }
              .header { 
                border-bottom: 2px solid #333; 
                margin-bottom: 20px; 
                padding-bottom: 10px;
              }
              h1 { font-size: 18pt; margin: 0; }
              h2 { font-size: 14pt; margin: 15px 0 10px 0; }
              .info-grid { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 10px;
                margin-bottom: 20px;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-bottom: 20px;
                font-size: 9pt;
              }
              th { 
                background: #f0f0f0; 
                border: 1px solid #ccc; 
                padding: 8px; 
                text-align: left;
                font-weight: bold;
              }
              td { 
                border: 1px solid #ccc; 
                padding: 6px;
              }
              .number { text-align: right; }
              .category-header { 
                background: #e0e0e0; 
                font-weight: bold;
              }
              .subtotal-row { 
                background: #f8f8f8; 
                font-weight: bold;
              }
              .summary { 
                margin-top: 30px; 
                border-top: 2px solid #333; 
                padding-top: 20px;
              }
              .summary-table { 
                width: 300px; 
                margin-left: auto;
              }
              .summary-table td { 
                border: none; 
                padding: 4px;
              }
              .total-row { 
                font-weight: bold; 
                font-size: 11pt;
                border-top: 2px solid #333;
              }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>BILL OF MATERIALS</h1>
              <div class="info-grid">
                <div>
                  <strong>Project:</strong> ${inputs.projectName}<br>
                  <strong>Project Number:</strong> ${inputs.projectNumber}
                </div>
                <div>
                  <strong>Date:</strong> ${inputs.date.toLocaleDateString()}<br>
                  <strong>Estimator:</strong> ${inputs.estimator}
                </div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 30%">Description</th>
                  <th style="width: 15%">Manufacturer</th>
                  <th style="width: 10%">Model</th>
                  <th style="width: 8%" class="number">Qty</th>
                  <th style="width: 7%">Unit</th>
                  <th style="width: 10%" class="number">Unit Price</th>
                  <th style="width: 10%" class="number">Total</th>
                  <th style="width: 10%">Supplier</th>
                </tr>
              </thead>
              <tbody>
                ${totals.categories.map(category => {
                  if (category.items.length === 0) return '';
                  
                  return `
                    <tr class="category-header">
                      <td colspan="8">${category.name.toUpperCase()}</td>
                    </tr>
                    ${category.items.map(item => `
                      <tr>
                        <td>${item.description}</td>
                        <td>${item.manufacturer || '-'}</td>
                        <td>${item.model || '-'}</td>
                        <td class="number">${item.quantity}</td>
                        <td>${item.unit}</td>
                        <td class="number">$${item.unitPrice.toFixed(2)}</td>
                        <td class="number">$${item.totalPrice.toFixed(2)}</td>
                        <td>${item.supplier || '-'}</td>
                      </tr>
                    `).join('')}
                    <tr class="subtotal-row">
                      <td colspan="6" style="text-align: right">Category Subtotal:</td>
                      <td class="number">$${category.subtotal.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <div class="summary">
              <h2>SUMMARY</h2>
              <table class="summary-table">
                <tr>
                  <td>Material Total:</td>
                  <td class="number">$${totals.materialTotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Tax (${inputs.taxRate}%):</td>
                  <td class="number">$${totals.tax.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Subtotal:</td>
                  <td class="number">$${totals.subtotalWithTax.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Markup (${inputs.markupPercent}%):</td>
                  <td class="number">$${totals.markup.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Contingency (${inputs.contingencyPercent}%):</td>
                  <td class="number">$${totals.contingency.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                  <td>TOTAL:</td>
                  <td class="number">$${totals.total.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <div class="no-print" style="margin-top: 40px; text-align: center;">
              <button onclick="window.print()" style="padding: 10px 20px; font-size: 14pt;">
                Print / Save as PDF
              </button>
              <button onclick="window.close()" style="padding: 10px 20px; font-size: 14pt; margin-left: 10px;">
                Close
              </button>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Package className="w-5 h-5 text-blue-400" />
            Bill of Materials Generator
          </CardTitle>
          <CardDescription className="text-gray-400">
            Comprehensive material list with pricing and specifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-400">Project Name</label>
              <input
                type="text"
                value={inputs.projectName}
                onChange={(e) => setInputs(prev => ({ ...prev, projectName: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Project Number</label>
              <input
                type="text"
                value={inputs.projectNumber}
                onChange={(e) => setInputs(prev => ({ ...prev, projectNumber: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Estimator</label>
              <input
                type="text"
                value={inputs.estimator}
                onChange={(e) => setInputs(prev => ({ ...prev, estimator: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Date</label>
              <input
                type="date"
                value={inputs.date.toISOString().split('T')[0]}
                onChange={(e) => setInputs(prev => ({ ...prev, date: new Date(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              />
            </div>
          </div>

          {/* Quick Add from Database */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowImport(!showImport)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Quick Add from Database
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export to Excel
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export to PDF
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Add Panel */}
      {showImport && (
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Quick Add Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(materialDatabase).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300 capitalize">{category}</h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {items.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const categoryIndex = inputs.categories.findIndex(
                            cat => cat.name.toLowerCase().includes(category.toLowerCase()) ||
                                  category.toLowerCase().includes(cat.name.toLowerCase())
                          );
                          if (categoryIndex !== -1) {
                            addMaterialItem(categoryIndex, item);
                          }
                        }}
                        className="w-full text-left px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors"
                      >
                        {item.description} - ${item.unitPrice}/{item.unit}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {inputs.categories.map((category, index) => (
          <button
            key={index}
            onClick={() => setSelectedCategory(index)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {category.name}
            {category.items.length > 0 && (
              <Badge variant="outline" className="ml-2">{category.items.length}</Badge>
            )}
          </button>
        ))}
      </div>

      {/* Material Items Table */}
      <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-sm">
            {inputs.categories[selectedCategory].name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 text-gray-400">Description</th>
                  <th className="text-left py-2 text-gray-400">Mfr/Model</th>
                  <th className="text-center py-2 text-gray-400">Qty</th>
                  <th className="text-center py-2 text-gray-400">Unit</th>
                  <th className="text-right py-2 text-gray-400">Unit Price</th>
                  <th className="text-right py-2 text-gray-400">Total</th>
                  <th className="text-center py-2 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inputs.categories[selectedCategory].items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-800">
                    <td className="py-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateMaterialItem(selectedCategory, item.id, { description: e.target.value })}
                        className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        value={item.manufacturer || ''}
                        onChange={(e) => updateMaterialItem(selectedCategory, item.id, { manufacturer: e.target.value })}
                        placeholder="Manufacturer"
                        className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs mb-1"
                      />
                      <input
                        type="text"
                        value={item.model || ''}
                        onChange={(e) => updateMaterialItem(selectedCategory, item.id, { model: e.target.value })}
                        placeholder="Model"
                        className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                      />
                    </td>
                    <td className="py-2 text-center">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateMaterialItem(selectedCategory, item.id, { quantity: Number(e.target.value) })}
                        className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs text-center"
                        min="0"
                      />
                    </td>
                    <td className="py-2 text-center">
                      <select
                        value={item.unit}
                        onChange={(e) => updateMaterialItem(selectedCategory, item.id, { unit: e.target.value })}
                        className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                      >
                        <option value="EA">EA</option>
                        <option value="FT">FT</option>
                        <option value="LF">LF</option>
                        <option value="BOX">BOX</option>
                        <option value="BAG">BAG</option>
                        <option value="ROLL">ROLL</option>
                        <option value="GAL">GAL</option>
                        <option value="SET">SET</option>
                        <option value="HR">HR</option>
                      </select>
                    </td>
                    <td className="py-2 text-right">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateMaterialItem(selectedCategory, item.id, { unitPrice: Number(e.target.value) })}
                        className="w-24 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs text-right"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="py-2 text-right text-white font-medium">
                      ${item.totalPrice.toFixed(2)}
                    </td>
                    <td className="py-2 text-center">
                      <button
                        onClick={() => deleteMaterialItem(selectedCategory, item.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={7} className="py-2">
                    <button
                      onClick={() => addMaterialItem(selectedCategory, {})}
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Item
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {inputs.categories[selectedCategory].items.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700 text-right">
              <span className="text-gray-400 mr-2">Category Subtotal:</span>
              <span className="text-xl font-bold text-white">
                ${totals.categories[selectedCategory].subtotal.toFixed(2)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Calculator className="w-4 h-4 text-green-400" />
              Cost Adjustments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-gray-400">Tax Rate (%)</label>
              <input
                type="number"
                value={inputs.taxRate}
                onChange={(e) => setInputs(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                min="0"
                max="20"
                step="0.1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Markup (%)</label>
              <input
                type="number"
                value={inputs.markupPercent}
                onChange={(e) => setInputs(prev => ({ ...prev, markupPercent: Number(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                min="0"
                max="100"
                step="1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Contingency (%)</label>
              <input
                type="number"
                value={inputs.contingencyPercent}
                onChange={(e) => setInputs(prev => ({ ...prev, contingencyPercent: Number(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                min="0"
                max="50"
                step="1"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              Project Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-300">
                <span>Material Total:</span>
                <span className="font-medium">${totals.materialTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tax ({inputs.taxRate}%):</span>
                <span className="font-medium">${totals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300 pt-2 border-t border-gray-700">
                <span>Subtotal:</span>
                <span className="font-medium">${totals.subtotalWithTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Markup ({inputs.markupPercent}%):</span>
                <span className="font-medium">${totals.markup.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Contingency ({inputs.contingencyPercent}%):</span>
                <span className="font-medium">${totals.contingency.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white text-lg font-bold pt-3 border-t border-gray-600">
                <span>TOTAL:</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>

            <Alert className="mt-4 border-blue-600">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Total includes {inputs.categories.reduce((sum, cat) => sum + cat.items.length, 0)} items 
                across {inputs.categories.filter(cat => cat.items.length > 0).length} categories.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}