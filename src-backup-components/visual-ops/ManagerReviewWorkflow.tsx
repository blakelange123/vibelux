'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, Clock, AlertTriangle, MessageSquare,
  User, Calendar, MapPin, Camera, FileText, Send, Flag,
  ThumbsUp, ThumbsDown, Edit3, ArrowRight, MoreVertical,
  Shield, Zap, DollarSign, Timer, Hash, Building, Tag
} from 'lucide-react';

interface PhotoReport {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending_review' | 'in_review' | 'approved' | 'rejected' | 'escalated';
  photos: {
    url: string;
    annotations?: any[];
    quality: { score: number; passed: boolean };
  }[];
  submittedBy: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  submittedAt: Date;
  location: string;
  roomZone: string;
  aiAnalysis: {
    confidence: number;
    detectedIssues: string[];
    estimatedCost?: number;
    urgency: string;
    recommendedActions: string[];
  };
  reviewHistory: ReviewAction[];
  assignedTo?: string;
  dueDate?: Date;
  tags: string[];
}

interface ReviewAction {
  id: string;
  type: 'comment' | 'approval' | 'rejection' | 'escalation' | 'reassignment';
  userId: string;
  userName: string;
  timestamp: Date;
  content?: string;
  metadata?: Record<string, any>;
}

interface ManagerReviewWorkflowProps {
  reportId: string;
  onClose: () => void;
  onActionComplete: (action: ReviewAction) => void;
}

export default function ManagerReviewWorkflow({
  reportId,
  onClose,
  onActionComplete
}: ManagerReviewWorkflowProps) {
  const [report, setReport] = useState<PhotoReport | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'photos' | 'history'>('details');
  const [comment, setComment] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    // Mock data - in production, fetch from API
    const mockReport: PhotoReport = {
      id: reportId,
      type: 'pest_disease',
      title: 'Spider mites detected on multiple plants',
      description: 'Found spider mites on lower leaves of plants in rows 4-6. Seeing webbing and leaf damage.',
      severity: 'high',
      status: 'pending_review',
      photos: [
        {
          url: '/mock-photo-1.jpg',
          quality: { score: 85, passed: true },
          annotations: []
        },
        {
          url: '/mock-photo-2.jpg',
          quality: { score: 72, passed: true },
          annotations: []
        }
      ],
      submittedBy: {
        id: 'user-1',
        name: 'John Smith',
        role: 'Cultivation Tech'
      },
      submittedAt: new Date(Date.now() - 30 * 60 * 1000),
      location: 'Facility A',
      roomZone: 'Veg Room 3',
      aiAnalysis: {
        confidence: 0.94,
        detectedIssues: ['Spider mites', 'Leaf damage', 'Webbing present'],
        estimatedCost: 5000,
        urgency: 'Immediate action required - risk of spread',
        recommendedActions: [
          'Isolate affected plants immediately',
          'Apply neem oil or insecticidal soap',
          'Increase humidity to 60-70%',
          'Inspect all plants in adjacent rows',
          'Schedule follow-up inspection in 48 hours'
        ]
      },
      reviewHistory: [],
      tags: ['ipm', 'pest-control', 'urgent']
    };
    
    setReport(mockReport);
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    
    const action: ReviewAction = {
      id: Date.now().toString(),
      type: 'approval',
      userId: 'manager-1',
      userName: 'Manager Name',
      timestamp: new Date(),
      content: comment,
      metadata: {
        priority,
        assignedTo: assignee,
        estimatedCost: report?.aiAnalysis.estimatedCost
      }
    };
    
    // Create work order or task
    await createWorkOrder();
    
    onActionComplete(action);
    setIsSubmitting(false);
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    
    const action: ReviewAction = {
      id: Date.now().toString(),
      type: 'rejection',
      userId: 'manager-1',
      userName: 'Manager Name',
      timestamp: new Date(),
      content: comment || 'Insufficient evidence or poor photo quality'
    };
    
    onActionComplete(action);
    setIsSubmitting(false);
  };

  const handleEscalate = async () => {
    setIsSubmitting(true);
    
    const action: ReviewAction = {
      id: Date.now().toString(),
      type: 'escalation',
      userId: 'manager-1',
      userName: 'Manager Name',
      timestamp: new Date(),
      content: comment,
      metadata: {
        escalatedTo: 'Senior Management',
        reason: 'High cost impact'
      }
    };
    
    onActionComplete(action);
    setIsSubmitting(false);
  };

  const createWorkOrder = async () => {
    // In production, create actual work order
    // Work order creation: priority, assignee, due date, description, actions
    // Submit work order to API for processing
  };

  const getPriorityDueDate = (priority: string) => {
    const now = new Date();
    switch (priority) {
      case 'urgent': return new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours
      case 'high': return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      case 'medium': return new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours
      default: return new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const availableAssignees = [
    { id: 'team-ipm', name: 'IPM Team', available: true },
    { id: 'john-doe', name: 'John Doe - Pest Specialist', available: true },
    { id: 'jane-smith', name: 'Jane Smith - Senior Tech', available: false },
    { id: 'maintenance', name: 'Maintenance Team', available: true }
  ];

  if (!report) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">{report.title}</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{report.submittedBy.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{report.roomZone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">
                  {new Date(report.submittedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(report.severity)}`}>
              {report.severity}
            </span>
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex items-center gap-6 px-6">
          {(['details', 'photos', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
              <p className="text-white">{report.description}</p>
            </div>

            {/* AI Analysis */}
            <div className="bg-purple-900/20 border border-purple-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-purple-300 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  AI Analysis
                </h3>
                <span className="text-sm text-purple-400">
                  {Math.round(report.aiAnalysis.confidence * 100)}% confidence
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Detected Issues:</p>
                  <div className="flex flex-wrap gap-2">
                    {report.aiAnalysis.detectedIssues.map(issue => (
                      <span key={issue} className="px-2 py-1 bg-purple-800/30 text-purple-300 rounded text-sm">
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
                
                {report.aiAnalysis.estimatedCost && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                    <span className="text-white">
                      Estimated Impact: ${report.aiAnalysis.estimatedCost.toLocaleString()}
                    </span>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-400 mb-2">Recommended Actions:</p>
                  <ul className="space-y-1">
                    {report.aiAnalysis.recommendedActions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Review Actions */}
            <div className="space-y-4">
              <h3 className="font-medium text-white">Review Actions</h3>
              
              {/* Priority Selection */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Set Priority</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'urgent'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => setPriority(level)}
                      className={`py-2 px-3 rounded-lg border transition-all capitalize ${
                        priority === level
                          ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee Selection */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Assign To</label>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select assignee...</option>
                  {availableAssignees.map(person => (
                    <option 
                      key={person.id} 
                      value={person.id}
                      disabled={!person.available}
                    >
                      {person.name} {!person.available && '(Unavailable)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Add Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add review notes or instructions..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="space-y-4">
            {report.photos.map((photo, index) => (
              <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-gray-600" />
                  <span className="ml-2 text-gray-500">Photo {index + 1}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Quality Score</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        photo.quality.score >= 80 ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {photo.quality.score}%
                      </span>
                      {photo.quality.passed ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {report.reviewHistory.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No review history yet</p>
            ) : (
              report.reviewHistory.map(action => (
                <div key={action.id} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{action.userName}</span>
                      <span className="text-xs text-gray-500">
                        {action.timestamp.toLocaleString()}
                      </span>
                    </div>
                    {action.content && (
                      <p className="text-sm text-gray-300">{action.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-700 p-6 bg-gray-800/50">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleReject}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
            
            <button
              onClick={handleEscalate}
              disabled={isSubmitting}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Flag className="w-4 h-4" />
              Escalate
            </button>
            
            <button
              onClick={handleApprove}
              disabled={isSubmitting || !assignee}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Approve & Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}