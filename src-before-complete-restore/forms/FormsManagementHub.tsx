'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  FileText, Plus, Search, Filter, Download, Upload,
  Eye, Edit, Trash2, Share2, Calendar, Clock,
  CheckCircle, AlertTriangle, X, Settings,
  Folder, Star, Archive, Lock, Users, Tag,
  PenTool, Send, Copy, ExternalLink, Database
} from 'lucide-react';
import { FormTemplateManager, FormTemplate } from '@/lib/forms/form-templates';
import { VibeLuxFileServer, DocumentMetadata } from '@/lib/documents/file-server';

interface FormSubmission {
  id: string;
  templateId: string;
  templateName: string;
  submittedBy: string;
  submittedAt: Date;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'expired';
  formData: { [key: string]: any };
  attachments: string[];
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
  dueDate?: Date;
}

export function FormsManagementHub() {
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState<'templates' | 'submissions' | 'documents'>('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);

  const formManager = new FormTemplateManager();
  const fileServer = new VibeLuxFileServer();

  useEffect(() => {
    loadData();
  }, [selectedTab, searchQuery, selectedCategory]);

  const loadData = () => {
    // Load templates
    let allTemplates = formManager.getAllTemplates();
    if (selectedCategory !== 'all') {
      allTemplates = formManager.getTemplatesByCategory(selectedCategory as any);
    }
    if (searchQuery) {
      allTemplates = formManager.searchTemplates(searchQuery);
    }
    setTemplates(allTemplates);

    // Load mock submissions
    const mockSubmissions: FormSubmission[] = [
      {
        id: 'sub_001',
        templateId: 'form-w4-2024',
        templateName: 'Form W-4: Employee\'s Withholding Certificate',
        submittedBy: user?.id || 'user_001',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'approved',
        formData: {
          firstName: 'John',
          lastName: 'Doe',
          ssn: '***-**-1234',
          filingStatus: 'Single or Married filing separately'
        },
        attachments: [],
        reviewedBy: 'manager_001',
        reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'sub_002',
        templateId: 'nda-standard-2024',
        templateName: 'Non-Disclosure Agreement (NDA)',
        submittedBy: user?.id || 'user_002',
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'submitted',
        formData: {
          partyName: 'Jane Smith',
          purpose: 'Access to proprietary cultivation techniques',
          durationYears: '2 years'
        },
        attachments: ['doc_001', 'doc_002'],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ];
    setSubmissions(mockSubmissions);

    // Load documents
    const allDocs = fileServer.searchDocuments(searchQuery, user?.id || 'user_001', {
      category: selectedCategory === 'all' ? undefined : selectedCategory as any
    });
    setDocuments(allDocs);
  };

  const categories = [
    { value: 'all', label: 'All Categories', icon: Folder },
    { value: 'tax', label: 'Tax Forms', icon: FileText },
    { value: 'legal', label: 'Legal Documents', icon: Lock },
    { value: 'hr', label: 'HR Forms', icon: Users },
    { value: 'safety', label: 'Safety & Training', icon: AlertTriangle },
    { value: 'cannabis', label: 'Cannabis Compliance', icon: Star },
    { value: 'business', label: 'Business Operations', icon: Database }
  ];

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    expired: 'bg-orange-100 text-orange-800'
  };

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Form Templates</h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            {templates.length} templates
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFormBuilder(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
          <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import Template
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => {
          const CategoryIcon = categories.find(c => c.value === template.category)?.icon || FileText;
          
          return (
            <div key={template.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CategoryIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm leading-tight">{template.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{template.category}</p>
                  </div>
                </div>
                {template.tags.includes('required') && (
                  <Star className="w-4 h-4 text-yellow-500" />
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {template.description}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{template.fields.length} fields</span>
                <span>v{template.version}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedTemplate(template)}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                >
                  <PenTool className="w-3 h-3" />
                  Fill Form
                </button>
                <button className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                  <Eye className="w-3 h-3" />
                </button>
                <button className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Templates Found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first form template'}
          </p>
          <button
            onClick={() => setShowFormBuilder(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create Template
          </button>
        </div>
      )}
    </div>
  );

  const renderSubmissionsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Form Submissions</h3>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
            {submissions.length} submissions
          </span>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">Form</th>
                <th className="text-left p-4 font-medium text-gray-600">Submitted By</th>
                <th className="text-left p-4 font-medium text-gray-600">Date</th>
                <th className="text-left p-4 font-medium text-gray-600">Status</th>
                <th className="text-left p-4 font-medium text-gray-600">Due Date</th>
                <th className="text-left p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(submission => (
                <tr key={submission.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-sm">{submission.templateName}</div>
                      <div className="text-xs text-gray-500">ID: {submission.id}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">{submission.submittedBy}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">{submission.submittedAt.toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{submission.submittedAt.toLocaleTimeString()}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[submission.status]}`}>
                      {submission.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {submission.dueDate ? (
                      <div className="text-sm">
                        {submission.dueDate.toLocaleDateString()}
                        {submission.dueDate < new Date() && (
                          <div className="text-xs text-red-500">Overdue</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No due date</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-blue-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-600">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-purple-600">
                        <Share2 className="w-4 h-4" />
                      </button>
                      {submission.attachments.length > 0 && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {submission.attachments.length} files
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Document Storage</h3>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
            {documents.length} documents
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Files
          </button>
          <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
            <Folder className="w-4 h-4" />
            New Folder
          </button>
        </div>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Total Storage</span>
          </div>
          <div className="text-2xl font-bold">2.4 GB</div>
          <div className="text-xs text-gray-500">of 10 GB used</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Documents</span>
          </div>
          <div className="text-2xl font-bold">247</div>
          <div className="text-xs text-gray-500">files stored</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium">Shared</span>
          </div>
          <div className="text-2xl font-bold">23</div>
          <div className="text-xs text-gray-500">active links</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Archive className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">Archived</span>
          </div>
          <div className="text-2xl font-bold">156</div>
          <div className="text-xs text-gray-500">old documents</div>
        </div>
      </div>

      {/* Document Grid/List */}
      <div className="bg-white border rounded-lg p-6">
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Document Storage</h3>
          <p className="text-gray-500 mb-6">
            Secure cloud storage for all your business documents with version control and access management.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="p-4 border rounded-lg">
              <Lock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium mb-1">Encrypted Storage</h4>
              <p className="text-sm text-gray-600">AES-256 encryption</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium mb-1">Access Control</h4>
              <p className="text-sm text-gray-600">Role-based permissions</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-medium mb-1">Version History</h4>
              <p className="text-sm text-gray-600">Track all changes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Forms & Documents</h1>
          <p className="text-gray-600">Manage business forms, submissions, and document storage</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'templates', label: 'Form Templates', icon: FileText },
            { id: 'submissions', label: 'Submissions', icon: Send },
            { id: 'documents', label: 'Document Storage', icon: Database }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search forms, documents, or submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'templates' && renderTemplatesTab()}
      {selectedTab === 'submissions' && renderSubmissionsTab()}
      {selectedTab === 'documents' && renderDocumentsTab()}

      {/* Form Builder Modal */}
      {showFormBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Create Form Template</h2>
              <button onClick={() => setShowFormBuilder(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Form builder interface would be implemented here...</p>
            </div>
          </div>
        </div>
      )}

      {/* Form Filling Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">{selectedTemplate.name}</h2>
              <button onClick={() => setSelectedTemplate(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Form filling interface would be implemented here...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}