'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Plus,
  Trash2,
  Copy,
  CheckCircle,
  AlertTriangle,
  Info,
  Book,
  Users,
  Calendar,
  Clock,
  Settings,
  Shield,
  Target,
  Beaker,
  Leaf,
  Droplets,
  Bug,
  Thermometer,
  Scale,
  Eye,
  Edit3,
  Save
} from 'lucide-react';

interface SOPSection {
  id: string;
  title: string;
  content: string;
  required: boolean;
  completed: boolean;
}

interface SOPTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  sections: SOPSection[];
  compliance: string[];
  estimatedTime: string;
  frequency: string;
}

interface UniversityStandard {
  institution: string;
  title: string;
  url: string;
  category: string;
  description: string;
}

const universityStandards: UniversityStandard[] = [
  {
    institution: "Cornell University",
    title: "Controlled Environment Agriculture Guidelines",
    url: "https://www.cornell.edu/cea-guidelines",
    category: "General",
    description: "Comprehensive guidelines for controlled environment agriculture"
  },
  {
    institution: "UC Davis",
    title: "Post-Harvest Technology Standards",
    url: "https://postharvest.ucdavis.edu/standards",
    category: "Post-Harvest",
    description: "Standards for proper handling and storage of harvested crops"
  },
  {
    institution: "Penn State Extension",
    title: "Food Safety Modernization Act Guidelines",
    url: "https://extension.psu.edu/fsma",
    category: "Food Safety",
    description: "FSMA compliance guidelines for produce operations"
  },
  {
    institution: "University of Florida",
    title: "Integrated Pest Management Protocols",
    url: "https://ipm.ifas.ufl.edu/protocols",
    category: "IPM",
    description: "Evidence-based pest management strategies"
  },
  {
    institution: "Michigan State University",
    title: "Organic Production Standards",
    url: "https://www.canr.msu.edu/organic",
    category: "Organic",
    description: "Guidelines for organic certification compliance"
  },
  {
    institution: "Texas A&M AgriLife",
    title: "Water Quality Management",
    url: "https://agrilifeextension.tamu.edu/water",
    category: "Water",
    description: "Best practices for irrigation water management"
  }
];

const sopTemplates: SOPTemplate[] = [
  {
    id: "seeding-transplanting",
    name: "Seeding & Transplanting",
    category: "Production",
    description: "Standard procedures for seed starting and transplanting operations",
    estimatedTime: "2-4 hours",
    frequency: "Weekly",
    compliance: ["GAP", "Organic NOP", "Food Safety"],
    sections: [
      {
        id: "equipment",
        title: "Equipment & Materials",
        content: "• Seed trays and growing medium\n• Seeds (verify lot numbers and viability)\n• Labels and markers\n• Watering equipment\n• pH and EC meters\n• Personal protective equipment",
        required: true,
        completed: false
      },
      {
        id: "preparation",
        title: "Pre-Seeding Preparation",
        content: "1. Sanitize all equipment with approved disinfectant\n2. Prepare growing medium according to specifications\n3. Verify environmental conditions (temp: 70-75°F, humidity: 65-75%)\n4. Document seed source and lot information\n5. Check irrigation water quality (pH 5.5-6.5, EC <1.2)",
        required: true,
        completed: false
      },
      {
        id: "seeding",
        title: "Seeding Process",
        content: "1. Fill trays with prepared growing medium\n2. Create planting holes at specified depth (2x seed diameter)\n3. Place seeds according to spacing requirements\n4. Cover seeds lightly with growing medium\n5. Apply initial watering (mist setting)\n6. Label trays with variety, date, and lot number",
        required: true,
        completed: false
      },
      {
        id: "post-seeding",
        title: "Post-Seeding Care",
        content: "1. Place trays in designated germination area\n2. Monitor temperature and humidity daily\n3. Maintain consistent moisture levels\n4. Document germination rates after 7 days\n5. Identify and address any issues promptly",
        required: true,
        completed: false
      },
      {
        id: "transplanting",
        title: "Transplanting Protocol",
        content: "1. Assess seedling readiness (2-4 true leaves)\n2. Prepare final growing containers\n3. Carefully remove seedlings from trays\n4. Plant at appropriate depth and spacing\n5. Water thoroughly after transplanting\n6. Monitor for transplant shock for 48 hours",
        required: true,
        completed: false
      },
      {
        id: "documentation",
        title: "Record Keeping",
        content: "• Seed source and lot numbers\n• Seeding date and quantities\n• Germination rates\n• Environmental conditions\n• Any deviations or issues\n• Staff responsible for operation",
        required: true,
        completed: false
      }
    ]
  },
  {
    id: "harvest-handling",
    name: "Harvest & Post-Harvest Handling",
    category: "Harvest",
    description: "Procedures for safe and efficient harvesting and handling",
    estimatedTime: "4-6 hours",
    frequency: "Daily",
    compliance: ["FSMA", "GAP", "HACCP"],
    sections: [
      {
        id: "pre-harvest",
        title: "Pre-Harvest Assessment",
        content: "1. Evaluate crop maturity and quality\n2. Check weather conditions and timing\n3. Inspect for pests or diseases\n4. Test residue levels if applicable\n5. Prepare harvest equipment and containers\n6. Brief harvest team on procedures",
        required: true,
        completed: false
      },
      {
        id: "harvest-procedures",
        title: "Harvest Procedures",
        content: "1. Harvest during optimal conditions (cool temperatures)\n2. Use clean, sharp cutting tools\n3. Handle produce gently to minimize damage\n4. Remove field heat quickly\n5. Sort and grade according to specifications\n6. Pack in appropriate containers",
        required: true,
        completed: false
      },
      {
        id: "cooling",
        title: "Cooling and Storage",
        content: "1. Move harvested product to cooling area immediately\n2. Pre-cool to target temperature within 2 hours\n3. Maintain cold chain throughout handling\n4. Monitor temperature and humidity continuously\n5. Use FIFO (First In, First Out) rotation\n6. Document all temperature logs",
        required: true,
        completed: false
      },
      {
        id: "packaging",
        title: "Packaging and Labeling",
        content: "1. Use only approved packaging materials\n2. Ensure packages are clean and food-safe\n3. Apply proper labels with required information\n4. Include lot codes and harvest dates\n5. Verify weight and count accuracy\n6. Seal packages according to specifications",
        required: true,
        completed: false
      },
      {
        id: "quality-control",
        title: "Quality Control",
        content: "1. Conduct visual inspection of all products\n2. Test samples for quality parameters\n3. Document any defects or issues\n4. Implement corrective actions as needed\n5. Maintain quality control records\n6. Train staff on quality standards",
        required: true,
        completed: false
      }
    ]
  },
  {
    id: "ipm-protocol",
    name: "Integrated Pest Management",
    category: "Pest Management",
    description: "Systematic approach to pest prevention and control",
    estimatedTime: "1-2 hours",
    frequency: "Weekly",
    compliance: ["IPM", "Organic NOP", "GAP"],
    sections: [
      {
        id: "monitoring",
        title: "Pest Monitoring",
        content: "1. Conduct visual inspections of all crops\n2. Use sticky traps and monitoring tools\n3. Identify and record pest populations\n4. Monitor beneficial insect populations\n5. Document weather conditions\n6. Take photos for identification assistance",
        required: true,
        completed: false
      },
      {
        id: "prevention",
        title: "Prevention Strategies",
        content: "1. Maintain proper sanitation practices\n2. Control environmental conditions\n3. Use resistant varieties when available\n4. Implement crop rotation schedules\n5. Manage water and nutrient levels\n6. Exclude pests through physical barriers",
        required: true,
        completed: false
      },
      {
        id: "biological-control",
        title: "Biological Control",
        content: "1. Release beneficial insects as scheduled\n2. Monitor establishment of beneficial populations\n3. Avoid pesticides harmful to beneficials\n4. Provide habitat for natural enemies\n5. Document biological control effectiveness\n6. Maintain beneficial insect records",
        required: true,
        completed: false
      },
      {
        id: "intervention",
        title: "Intervention Protocols",
        content: "1. Determine treatment thresholds\n2. Select appropriate control methods\n3. Apply treatments according to label instructions\n4. Document all pesticide applications\n5. Monitor treatment effectiveness\n6. Implement resistance management strategies",
        required: true,
        completed: false
      }
    ]
  },
  {
    id: "nutrient-management",
    name: "Nutrient Management",
    category: "Nutrition",
    description: "Systematic approach to plant nutrition and fertilizer management",
    estimatedTime: "2-3 hours",
    frequency: "Weekly",
    compliance: ["GAP", "Organic NOP", "Environmental"],
    sections: [
      {
        id: "testing",
        title: "Soil and Tissue Testing",
        content: "1. Collect representative soil samples\n2. Submit samples to certified laboratory\n3. Interpret test results according to crop needs\n4. Conduct plant tissue analysis if recommended\n5. Document all test results\n6. Develop nutrient management plan",
        required: true,
        completed: false
      },
      {
        id: "fertilizer-selection",
        title: "Fertilizer Selection",
        content: "1. Choose appropriate fertilizer types\n2. Calculate application rates based on test results\n3. Consider timing of nutrient needs\n4. Select organic vs. conventional sources\n5. Verify fertilizer quality and analysis\n6. Plan application schedule",
        required: true,
        completed: false
      },
      {
        id: "application",
        title: "Application Procedures",
        content: "1. Calibrate application equipment\n2. Apply fertilizers at recommended rates\n3. Incorporate as needed for nutrient availability\n4. Monitor weather conditions during application\n5. Document all applications\n6. Clean equipment after use",
        required: true,
        completed: false
      },
      {
        id: "monitoring",
        title: "Plant Monitoring",
        content: "1. Observe plant growth and color\n2. Monitor for nutrient deficiency symptoms\n3. Conduct regular tissue testing\n4. Adjust nutrient program as needed\n5. Document plant responses\n6. Maintain nutrient management records",
        required: true,
        completed: false
      }
    ]
  },
  {
    id: "water-quality",
    name: "Water Quality Management",
    category: "Water",
    description: "Procedures for maintaining irrigation water quality and safety",
    estimatedTime: "1-2 hours",
    frequency: "Daily",
    compliance: ["FSMA", "GAP", "Water Quality"],
    sections: [
      {
        id: "source-protection",
        title: "Water Source Protection",
        content: "1. Identify and protect water sources\n2. Monitor source water quality regularly\n3. Implement buffer zones around sources\n4. Control access to water sources\n5. Document source water test results\n6. Develop contingency plans for contamination",
        required: true,
        completed: false
      },
      {
        id: "testing",
        title: "Water Quality Testing",
        content: "1. Collect water samples using proper procedures\n2. Test for microbial indicators (E. coli)\n3. Analyze chemical parameters (pH, EC, nutrients)\n4. Test for heavy metals if required\n5. Document all test results\n6. Take corrective action if needed",
        required: true,
        completed: false
      },
      {
        id: "treatment",
        title: "Water Treatment",
        content: "1. Install appropriate filtration systems\n2. Use approved disinfection methods\n3. Monitor treatment system effectiveness\n4. Maintain treatment equipment regularly\n5. Document treatment procedures\n6. Verify treated water quality",
        required: true,
        completed: false
      },
      {
        id: "distribution",
        title: "Water Distribution",
        content: "1. Maintain clean distribution systems\n2. Prevent cross-contamination\n3. Monitor water pressure and flow\n4. Clean and sanitize irrigation equipment\n5. Test water at points of use\n6. Document distribution system maintenance",
        required: true,
        completed: false
      }
    ]
  }
];

export function SOPGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<SOPTemplate | null>(null);
  const [customSOP, setCustomSOP] = useState<SOPTemplate | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showStandards, setShowStandards] = useState(false);

  const createCustomSOP = () => {
    const newSOP: SOPTemplate = {
      id: `custom-${Date.now()}`,
      name: "Custom SOP",
      category: "Custom",
      description: "Custom standard operating procedure",
      estimatedTime: "TBD",
      frequency: "TBD",
      compliance: [],
      sections: [
        {
          id: "overview",
          title: "Overview",
          content: "Describe the purpose and scope of this procedure...",
          required: true,
          completed: false
        }
      ]
    };
    setCustomSOP(newSOP);
    setSelectedTemplate(newSOP);
  };

  const addSection = () => {
    if (!customSOP) return;
    
    const newSection: SOPSection = {
      id: `section-${Date.now()}`,
      title: "New Section",
      content: "Add content for this section...",
      required: false,
      completed: false
    };
    
    setCustomSOP({
      ...customSOP,
      sections: [...customSOP.sections, newSection]
    });
  };

  const updateSection = (sectionId: string, updates: Partial<SOPSection>) => {
    if (!selectedTemplate) return;
    
    const updatedTemplate = {
      ...selectedTemplate,
      sections: selectedTemplate.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    };
    
    setSelectedTemplate(updatedTemplate);
    if (customSOP && customSOP.id === selectedTemplate.id) {
      setCustomSOP(updatedTemplate);
    }
  };

  const deleteSection = (sectionId: string) => {
    if (!customSOP) return;
    
    setCustomSOP({
      ...customSOP,
      sections: customSOP.sections.filter(section => section.id !== sectionId)
    });
  };

  const exportSOP = () => {
    if (!selectedTemplate) return;
    
    const completionRate = (selectedTemplate.sections.filter(s => s.completed).length / selectedTemplate.sections.length * 100).toFixed(0);
    
    const sopContent = `
# ${selectedTemplate.name}
**Category:** ${selectedTemplate.category}
**Estimated Time:** ${selectedTemplate.estimatedTime}
**Frequency:** ${selectedTemplate.frequency}
**Completion Rate:** ${completionRate}%

## Description
${selectedTemplate.description}

## Compliance Standards
${selectedTemplate.compliance.map(c => `- ${c}`).join('\n')}

## Sections

${selectedTemplate.sections.map(section => `
### ${section.title} ${section.required ? '(Required)' : '(Optional)'} ${section.completed ? '✅' : '⏳'}

${section.content}

---
`).join('')}

## University Standards Reference
${universityStandards.filter(std => 
  selectedTemplate.category.toLowerCase().includes(std.category.toLowerCase()) ||
  std.category === 'General'
).map(std => `
- **${std.institution}**: ${std.title}
  ${std.description}
  URL: ${std.url}
`).join('')}

---
Generated by Vibelux SOP Generator on ${new Date().toLocaleDateString()}
`;

    const blob = new Blob([sopContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate.name.replace(/\s+/g, '-').toLowerCase()}-sop.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'production': return <Leaf className="w-5 h-5 text-green-500" />;
      case 'harvest': return <Scale className="w-5 h-5 text-orange-500" />;
      case 'pest management': return <Bug className="w-5 h-5 text-red-500" />;
      case 'nutrition': return <Beaker className="w-5 h-5 text-blue-500" />;
      case 'water': return <Droplets className="w-5 h-5 text-cyan-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-400" />
              Standard Operating Procedure Generator
            </h1>
            <p className="text-gray-400">Create comprehensive SOPs based on university standards and best practices</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowStandards(!showStandards)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Book className="w-4 h-4" />
              University Standards
            </button>
            
            <button
              onClick={createCustomSOP}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Custom SOP
            </button>
            
            {selectedTemplate && (
              <button
                onClick={exportSOP}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export SOP
              </button>
            )}
          </div>
        </div>

        {/* University Standards Panel */}
        {showStandards && (
          <div className="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Book className="w-6 h-6 text-blue-400" />
              University Standards & Guidelines
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {universityStandards.map((standard) => (
                <div key={standard.url} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{standard.institution}</h3>
                    <span className="px-2 py-1 bg-blue-600 text-xs rounded">{standard.category}</span>
                  </div>
                  <h4 className="text-sm font-medium text-blue-400 mb-2">{standard.title}</h4>
                  <p className="text-gray-400 text-sm mb-3">{standard.description}</p>
                  <a 
                    href={standard.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    View Standard →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Template Selection */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">SOP Templates</h2>
            
            <div className="space-y-3">
              {sopTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'bg-purple-900 border-purple-600'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getCategoryIcon(template.category)}
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{template.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {template.estimatedTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {template.frequency}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.compliance.map((comp) => (
                          <span key={comp} className="px-2 py-1 bg-gray-700 text-xs rounded">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SOP Content */}
          {selectedTemplate && (
            <div className="lg:col-span-2 bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    {getCategoryIcon(selectedTemplate.category)}
                    {selectedTemplate.name}
                  </h2>
                  <p className="text-gray-400 mt-1">{selectedTemplate.description}</p>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    Completion Rate
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {((selectedTemplate.sections.filter(s => s.completed).length / selectedTemplate.sections.length) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Estimated Time</div>
                  <div className="font-semibold text-white">{selectedTemplate.estimatedTime}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Frequency</div>
                  <div className="font-semibold text-white">{selectedTemplate.frequency}</div>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Sections</h3>
                  {customSOP && (
                    <button
                      onClick={addSection}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Section
                    </button>
                  )}
                </div>
                
                {selectedTemplate.sections.map((section) => (
                  <div key={section.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateSection(section.id, { completed: !section.completed })}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                            section.completed 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-700 border border-gray-600'
                          }`}
                        >
                          {section.completed && <CheckCircle className="w-4 h-4" />}
                        </button>
                        
                        {editingSection === section.id ? (
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                            onBlur={() => setEditingSection(null)}
                            onKeyPress={(e) => e.key === 'Enter' && setEditingSection(null)}
                          />
                        ) : (
                          <h4 className="font-medium text-white flex items-center gap-2">
                            {section.title}
                            {section.required && (
                              <span className="px-2 py-1 bg-red-600 text-xs rounded">Required</span>
                            )}
                          </h4>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {customSOP && (
                          <>
                            <button
                              onClick={() => setEditingSection(section.id)}
                              className="p-1 text-gray-400 hover:text-white"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteSection(section.id)}
                              className="p-1 text-gray-400 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-gray-300 text-sm whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Compliance Standards */}
              <div className="mt-6 bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  Compliance Standards
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.compliance.map((standard) => (
                    <span key={standard} className="px-3 py-1 bg-blue-600 text-white text-sm rounded">
                      {standard}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}