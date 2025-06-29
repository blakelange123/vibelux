'use client';

import React, { useState } from 'react';
import { 
  FolderOpen, 
  Save, 
  FileText, 
  Users, 
  Clock, 
  Tag, 
  MapPin, 
  Building, 
  Calendar,
  Download,
  Upload,
  Settings,
  Share2,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
  ChevronDown,
  Star,
  Archive,
  CheckCircle,
  AlertCircle,
  User,
  X
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  client: string;
  location: string;
  type: 'commercial' | 'industrial' | 'residential' | 'horticulture' | 'research';
  status: 'active' | 'completed' | 'draft' | 'archived';
  createdDate: string;
  modifiedDate: string;
  lastOpenedDate?: string;
  tags: string[];
  collaborators: string[];
  thumbnail?: string;
  fileSize: string;
  version: string;
  isStarred: boolean;
}

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  thumbnail: string;
  features: string[];
}

export function ProjectManager() {
  const [activeTab, setActiveTab] = useState<'recent' | 'all' | 'shared' | 'templates'>('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'Warehouse Lighting Retrofit',
      description: 'LED retrofit project for 200,000 sq ft distribution center',
      client: 'Global Logistics Corp',
      location: 'Denver, CO',
      type: 'industrial',
      status: 'active',
      createdDate: '2024-01-15',
      modifiedDate: '2024-06-10',
      lastOpenedDate: '2024-06-10',
      tags: ['LED', 'Retrofit', 'Energy Savings'],
      collaborators: ['john@company.com', 'sarah@company.com'],
      fileSize: '45.2 MB',
      version: '2.1',
      isStarred: true
    },
    {
      id: '2',
      name: 'Vertical Farm Facility',
      description: 'Multi-tier growing facility with dynamic lighting control',
      client: 'Green Growth Technologies',
      location: 'Portland, OR',
      type: 'horticulture',
      status: 'active',
      createdDate: '2024-02-20',
      modifiedDate: '2024-06-08',
      tags: ['Horticulture', 'Spectrum Control', 'Automation'],
      collaborators: ['mike@greentech.com'],
      fileSize: '78.9 MB',
      version: '1.5',
      isStarred: false
    },
    {
      id: '3',
      name: 'Office Complex Renovation',
      description: 'LEED Gold certification lighting design',
      client: 'Metro Properties',
      location: 'Seattle, WA',
      type: 'commercial',
      status: 'completed',
      createdDate: '2024-01-08',
      modifiedDate: '2024-05-15',
      tags: ['LEED', 'Office', 'Daylight Integration'],
      collaborators: ['anna@metro.com', 'david@lighting.com'],
      fileSize: '23.7 MB',
      version: '3.0',
      isStarred: false
    }
  ]);

  const projectTemplates: ProjectTemplate[] = [
    {
      id: 'warehouse',
      name: 'Industrial Warehouse',
      description: 'High-bay LED lighting layout with 30fc average',
      type: 'Industrial',
      thumbnail: '/templates/warehouse.jpg',
      features: ['High-bay fixtures', 'Motion sensors', 'Emergency lighting', 'Energy calculations']
    },
    {
      id: 'office',
      name: 'Open Office',
      description: 'Modern office space with daylight integration',
      type: 'Commercial',
      thumbnail: '/templates/office.jpg',
      features: ['Troffer fixtures', 'Daylight sensors', 'Zone control', 'LEED compliance']
    },
    {
      id: 'greenhouse',
      name: 'Greenhouse Facility',
      description: 'Horticultural lighting with spectrum control',
      type: 'Horticulture',
      thumbnail: '/templates/greenhouse.jpg',
      features: ['Full spectrum LEDs', 'Zone control', 'PPFD calculations', 'DLI optimization']
    },
    {
      id: 'lab',
      name: 'Research Laboratory',
      description: 'Precision lighting for research applications',
      type: 'Research',
      thumbnail: '/templates/lab.jpg',
      features: ['Task lighting', 'Clean room certified', 'Emergency systems', 'Data logging']
    }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || project.type === filterType;
    
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'recent' && project.lastOpenedDate) ||
                      (activeTab === 'shared' && project.collaborators.length > 0);
    
    return matchesSearch && matchesFilter && matchesTab;
  });

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'draft': return <Edit3 className="w-4 h-4 text-yellow-400" />;
      case 'archived': return <Archive className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeColor = (type: Project['type']) => {
    switch (type) {
      case 'commercial': return 'bg-blue-600';
      case 'industrial': return 'bg-orange-600';
      case 'residential': return 'bg-green-600';
      case 'horticulture': return 'bg-purple-600';
      case 'research': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Project Manager</h1>
            <p className="text-gray-400">Manage your lighting design projects</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, clients, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Types</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="residential">Residential</option>
              <option value="horticulture">Horticulture</option>
              <option value="research">Research</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex">
          {[
            { id: 'recent', name: 'Recent', count: projects.filter(p => p.lastOpenedDate).length },
            { id: 'all', name: 'All Projects', count: projects.length },
            { id: 'shared', name: 'Shared', count: projects.filter(p => p.collaborators.length > 0).length },
            { id: 'templates', name: 'Templates', count: projectTemplates.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab.name}
              <span className="ml-2 px-2 py-1 bg-gray-700 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'templates' ? (
          /* Templates Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectTemplates.map(template => (
              <div key={template.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors group">
                <div className="h-40 bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                  <Building className="w-16 h-16 text-purple-400" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{template.name}</h3>
                    <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
                      {template.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                  <div className="space-y-2 mb-4">
                    {template.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="text-xs text-gray-500 flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Projects List */
          <div className="space-y-4">
            {filteredProjects.map(project => (
              <div key={project.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {project.name}
                      </h3>
                      {project.isStarred && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                      {getStatusIcon(project.status)}
                      <span className={`px-2 py-1 rounded text-xs text-white ${getTypeColor(project.type)}`}>
                        {project.type}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 mb-3">{project.description}</p>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Building className="w-4 h-4 text-gray-500" />
                        {project.client}
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {project.location}
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {new Date(project.modifiedDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Users className="w-4 h-4 text-gray-500" />
                        {project.collaborators.length} collaborators
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                      {project.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-6">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                      Open
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No projects found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">New Project</h2>
                <button
                  onClick={() => setShowNewProjectModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  placeholder="Brief project description"
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Client</label>
                  <input
                    type="text"
                    placeholder="Client name"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="Project location"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Type</label>
                <select className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500">
                  <option value="">Select type</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="residential">Residential</option>
                  <option value="horticulture">Horticulture</option>
                  <option value="research">Research</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start from</label>
                <div className="grid grid-cols-3 gap-3">
                  <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 hover:border-purple-500 transition-colors">
                    <FileText className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <span className="text-sm text-white">Blank Project</span>
                  </button>
                  <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 hover:border-purple-500 transition-colors">
                    <FolderOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <span className="text-sm text-white">From Template</span>
                  </button>
                  <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 hover:border-purple-500 transition-colors">
                    <Upload className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <span className="text-sm text-white">Import File</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Create new project logic here
                  setShowNewProjectModal(false);
                  // Dispatch reset action to clear the canvas
                  window.dispatchEvent(new Event('resetDesigner'));
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}