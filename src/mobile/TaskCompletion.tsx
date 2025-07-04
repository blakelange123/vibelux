'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Camera,
  Scan,
  MessageSquare,
  AlertTriangle,
  Save,
  Upload,
  Users,
  Droplets,
  Scissors,
  Leaf,
  Bug,
  Package,
  Plus,
  Minus
} from 'lucide-react';
import { 
  OfflineTask, 
  TaskStatus,
  FormField,
  FieldType,
  OfflinePhoto,
  OfflineSignature
} from '@/lib/mobile/mobile-types';
import { OfflineSyncManager } from '@/lib/mobile/offline-sync';
import { BarcodeScannerImpl } from '@/lib/mobile/barcode-scanner';

interface TaskCompletionProps {
  task: OfflineTask;
  onComplete: (data: any) => void;
  onCancel: () => void;
}

export function TaskCompletion({ task, onComplete, onCancel }: TaskCompletionProps) {
  const [status, setStatus] = useState<TaskStatus>('In Progress');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<OfflinePhoto[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showSignature, setShowSignature] = useState(false);
  const [signature, setSignature] = useState<string>('');

  const scanner = new BarcodeScannerImpl();
  const syncManager = new OfflineSyncManager();

  // Task-specific form fields based on task type
  const getTaskFields = (): FormField[] => {
    switch (task.type) {
      case 'Watering':
        return [
          {
            id: 'water_amount',
            type: 'Number',
            label: 'Water Amount (L)',
            required: true
          },
          {
            id: 'ph',
            type: 'Number',
            label: 'pH Level',
            required: true
          },
          {
            id: 'ec',
            type: 'Number',
            label: 'EC Level',
            required: true
          },
          {
            id: 'runoff',
            type: 'Number',
            label: 'Runoff %',
            required: false
          }
        ];
      
      case 'Scouting':
        return [
          {
            id: 'pest_found',
            type: 'Toggle',
            label: 'Pests Found',
            required: true
          },
          {
            id: 'pest_type',
            type: 'Select',
            label: 'Pest Type',
            required: false,
            options: [
              { value: 'aphids', label: 'Aphids' },
              { value: 'spider_mites', label: 'Spider Mites' },
              { value: 'thrips', label: 'Thrips' },
              { value: 'whiteflies', label: 'Whiteflies' },
              { value: 'fungus_gnats', label: 'Fungus Gnats' },
              { value: 'other', label: 'Other' }
            ],
            conditionalDisplay: [{
              field: 'pest_found',
              operator: 'equals',
              value: true,
              action: 'show'
            }]
          },
          {
            id: 'severity',
            type: 'Select',
            label: 'Severity',
            required: false,
            options: [
              { value: 'low', label: 'Low', color: '#10B981' },
              { value: 'medium', label: 'Medium', color: '#F59E0B' },
              { value: 'high', label: 'High', color: '#EF4444' }
            ]
          },
          {
            id: 'photo_required',
            type: 'Photo',
            label: 'Take Photo of Issue',
            required: true
          }
        ];

      case 'Harvest':
        return [
          {
            id: 'plant_scan',
            type: 'Barcode',
            label: 'Scan Plant Tag',
            required: true
          },
          {
            id: 'wet_weight',
            type: 'Number',
            label: 'Wet Weight (g)',
            required: true
          },
          {
            id: 'quality_grade',
            type: 'Select',
            label: 'Quality Grade',
            required: true,
            options: [
              { value: 'A', label: 'Grade A' },
              { value: 'B', label: 'Grade B' },
              { value: 'C', label: 'Grade C' },
              { value: 'trim', label: 'Trim' }
            ]
          },
          {
            id: 'harvest_photo',
            type: 'Photo',
            label: 'Photo of Harvest',
            required: true
          }
        ];

      default:
        return [];
    }
  };

  const fields = getTaskFields();

  const getTaskIcon = () => {
    switch (task.type) {
      case 'Watering': return <Droplets className="w-6 h-6 text-blue-400" />;
      case 'Scouting': return <Bug className="w-6 h-6 text-yellow-400" />;
      case 'Harvest': return <Scissors className="w-6 h-6 text-green-400" />;
      case 'Pruning': return <Leaf className="w-6 h-6 text-green-400" />;
      default: return <CheckCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handlePhotoCapture = async (fieldId: string) => {
    try {
      // In a real app, this would use the device camera
      const photo: OfflinePhoto = {
        id: `photo_${Date.now()}`,
        uri: 'captured_photo_uri',
        thumbnail: 'thumbnail_uri',
        type: 'Task',
        relatedId: task.id,
        relatedType: 'task',
        tags: [task.type],
        timestamp: new Date(),
        syncStatus: 'pending'
      };
      
      setPhotos([...photos, photo]);
      handleFieldChange(fieldId, photo.id);
    } catch (error) {
      console.error('Photo capture failed:', error);
    }
  };

  const handleBarcodeScan = async (fieldId: string) => {
    try {
      const result = await scanner.scan();
      handleFieldChange(fieldId, result.code);
    } catch (error) {
      console.error('Barcode scan failed:', error);
    }
  };

  const handleComplete = async () => {
    const completionData = {
      taskId: task.id,
      status: 'Completed',
      completedAt: new Date(),
      completedBy: 'current-user',
      notes,
      formData,
      photos: photos.map(p => p.id),
      signature: signature || undefined
    };

    // Save offline first
    await syncManager.updateOffline('tasks', task.id, {
      status: 'Completed',
      completionData
    });

    // Try to sync if online
    if (navigator.onLine) {
      await syncManager.syncData();
    }

    onComplete(completionData);
  };

  const renderField = (field: FormField) => {
    const shouldDisplay = !field.conditionalDisplay || field.conditionalDisplay.every(rule => {
      const fieldValue = formData[rule.field];
      switch (rule.operator) {
        case 'equals': return fieldValue === rule.value;
        case 'not_equals': return fieldValue !== rule.value;
        default: return true;
      }
    });

    if (!shouldDisplay) return null;

    switch (field.type) {
      case 'Number':
        return (
          <div key={field.id} className="space-y-1">
            <label className="text-sm text-gray-400">{field.label}</label>
            <input
              type="number"
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="0"
            />
          </div>
        );

      case 'Select':
        return (
          <div key={field.id} className="space-y-1">
            <label className="text-sm text-gray-400">{field.label}</label>
            <select
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="">Select...</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'Toggle':
        return (
          <div key={field.id} className="flex items-center justify-between py-2">
            <label className="text-sm text-gray-300">{field.label}</label>
            <button
              onClick={() => handleFieldChange(field.id, !formData[field.id])}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                formData[field.id] ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                formData[field.id] ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        );

      case 'Photo':
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm text-gray-400">{field.label}</label>
            <button
              onClick={() => handlePhotoCapture(field.id)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
            >
              <Camera className="w-5 h-5" />
              <span>Take Photo</span>
            </button>
            {formData[field.id] && (
              <div className="text-sm text-green-400">Photo captured</div>
            )}
          </div>
        );

      case 'Barcode':
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm text-gray-400">{field.label}</label>
            <button
              onClick={() => handleBarcodeScan(field.id)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
            >
              <Scan className="w-5 h-5" />
              <span>Scan Barcode</span>
            </button>
            {formData[field.id] && (
              <div className="text-sm text-gray-300">Code: {formData[field.id]}</div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {getTaskIcon()}
          <div>
            <h1 className="text-lg font-semibold">{task.title}</h1>
            <p className="text-sm text-gray-400">{task.room}</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <XCircle className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Task Details */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
        <p className="text-gray-300">{task.description}</p>
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Due: {task.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>Assigned to you</span>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 mb-6">
        {fields.map(field => renderField(field))}
      </div>

      {/* Notes */}
      <div className="space-y-2 mb-6">
        <label className="text-sm text-gray-400 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
          rows={3}
          placeholder="Add any additional notes..."
        />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleComplete}
          className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Complete Task
        </button>
      </div>

      {/* Offline Indicator */}
      {task.syncStatus === 'pending' && (
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <p className="text-sm text-yellow-300">
            Working offline. Data will sync when connection is restored.
          </p>
        </div>
      )}
    </div>
  );
}