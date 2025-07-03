'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Share,
  Lock,
  Unlock,
  Calendar,
  Tag,
  User,
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  FolderOpen,
  File,
  FileImage,
  FileVideo,
  Archive
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  size: string;
  uploadedBy: string;
  uploadDate: string;
  lastModified: string;
  status: 'approved' | 'pending' | 'rejected';
  isConfidential: boolean;
  tags: string[];
  description: string;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Facility Safety Protocol 2024.pdf',
    type: 'PDF',
    category: 'Safety & Compliance',
    size: '2.4 MB',
    uploadedBy: 'John Smith',
    uploadDate: '2024-01-15',
    lastModified: '2024-01-20',
    status: 'approved',
    isConfidential: false,
    tags: ['safety', 'protocol', 'mandatory'],
    description: 'Updated facility safety protocols and emergency procedures'
  },
  {
    id: '2',
    name: 'Q4 Harvest Report.xlsx',
    type: 'Excel',
    category: 'Reports',
    size: '1.8 MB',
    uploadedBy: 'Sarah Johnson',
    uploadDate: '2024-01-10',
    lastModified: '2024-01-12',
    status: 'approved',
    isConfidential: true,
    tags: ['harvest', 'quarterly', 'data'],
    description: 'Comprehensive harvest data and yield analysis for Q4'
  },
  {
    id: '3',
    name: 'Equipment Maintenance Log.pdf',
    type: 'PDF',
    category: 'Maintenance',
    size: '890 KB',
    uploadedBy: 'Mike Davis',
    uploadDate: '2024-01-08',
    lastModified: '2024-01-08',
    status: 'pending',
    isConfidential: false,
    tags: ['maintenance', 'equipment', 'log'],
    description: 'Monthly equipment maintenance records and schedules'
  },
  {
    id: '4',
    name: 'Investment Presentation.pptx',
    type: 'PowerPoint',
    category: 'Investment',
    size: '5.2 MB',
    uploadedBy: 'Emily Chen',
    uploadDate: '2024-01-05',
    lastModified: '2024-01-15',
    status: 'approved',
    isConfidential: true,
    tags: ['investment', 'presentation', 'financial'],
    description: 'Investment opportunity presentation for potential investors'
  },
  {
    id: '5',
    name: 'Compliance Certificate.pdf',
    type: 'PDF',
    category: 'Legal & Compliance',
    size: '450 KB',
    uploadedBy: 'Legal Team',
    uploadDate: '2024-01-03',
    lastModified: '2024-01-03',
    status: 'approved',
    isConfidential: false,
    tags: ['compliance', 'certificate', 'legal'],
    description: 'State compliance certification for cultivation activities'
  }
];

const categories = [
  'All Categories',
  'Safety & Compliance',
  'Reports',
  'Maintenance',
  'Investment',
  'Legal & Compliance',
  'Training',
  'Operations',
  'Financial'
];

const statusColors = {
  approved: 'text-green-500 bg-green-500/20',
  pending: 'text-yellow-500 bg-yellow-500/20',
  rejected: 'text-red-500 bg-red-500/20'
};

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf':
      return FileText;
    case 'excel':
    case 'xlsx':
      return File;
    case 'powerpoint':
    case 'pptx':
      return File;
    case 'image':
    case 'jpg':
    case 'png':
      return FileImage;
    case 'video':
    case 'mp4':
      return FileVideo;
    default:
      return File;
  }
};

export default function FacilityDocuments() {
  const [documents, setDocuments] = useState(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All Categories' || doc.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDeleteDocument = (id: string) => {
    setDocuments(docs => docs.filter(doc => doc.id !== id));
  };

  const handleStatusChange = (id: string, newStatus: 'approved' | 'pending' | 'rejected') => {
    setDocuments(docs => docs.map(doc => 
      doc.id === id ? { ...doc, status: newStatus } : doc
    ));
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Document Management</h1>
          <p className="text-gray-300 mt-2">Organize and manage facility documents and files</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents, descriptions, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Document Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Total Documents</p>
                    <p className="text-2xl font-bold mt-1 text-white">{documents.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Pending Review</p>
                    <p className="text-2xl font-bold mt-1 text-white">
                      {documents.filter(d => d.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Confidential</p>
                    <p className="text-2xl font-bold mt-1 text-white">
                      {documents.filter(d => d.isConfidential).length}
                    </p>
                  </div>
                  <Lock className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Total Storage</p>
                    <p className="text-2xl font-bold mt-1 text-white">10.7 MB</p>
                  </div>
                  <Archive className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents List */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Documents ({filteredDocuments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDocuments.map((doc) => {
                  const FileIcon = getFileIcon(doc.type);
                  return (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex items-center space-x-3">
                          <FileIcon className="h-8 w-8 text-blue-500" />
                          {doc.isConfidential && <Lock className="h-4 w-4 text-red-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-white">{doc.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[doc.status]}`}>
                              {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{doc.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>{doc.category}</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span>Uploaded by {doc.uploadedBy}</span>
                            <span>•</span>
                            <span>{doc.uploadDate}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            {doc.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recently Added Documents</CardTitle>
              <CardDescription className="text-gray-300">
                Documents uploaded in the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDocuments
                  .filter(doc => {
                    const uploadDate = new Date(doc.uploadDate);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return uploadDate >= weekAgo;
                  })
                  .map(doc => {
                    const FileIcon = getFileIcon(doc.type);
                    return (
                      <div key={doc.id} className="flex items-center space-x-4 p-4 border border-gray-600 rounded-lg">
                        <FileIcon className="h-8 w-8 text-blue-500" />
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{doc.name}</h3>
                          <p className="text-sm text-gray-400">Uploaded on {doc.uploadDate}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Shared Documents</CardTitle>
              <CardDescription className="text-gray-300">
                Documents shared with external parties or investors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                <Share className="h-12 w-12 mx-auto mb-4" />
                <p>No shared documents yet</p>
                <p className="text-sm">Documents shared with external parties will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Archived Documents</CardTitle>
              <CardDescription className="text-gray-300">
                Documents that have been archived or are no longer active
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                <Archive className="h-12 w-12 mx-auto mb-4" />
                <p>No archived documents</p>
                <p className="text-sm">Archived documents will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Modal would go here */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white">Upload Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file">Select File</Label>
                <Input id="file" type="file" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Brief description of the document" className="mt-1" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}