'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Shield,
  Award,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  FileText,
  Activity,
  TrendingUp,
  Star,
  Camera
} from 'lucide-react';
import {
  Employee,
  EmployeeRole,
  Department,
  EmployeeStatus,
  TrainingRecord,
  TimeEntry
} from '@/lib/workforce/workforce-types';

// Mock employee data
const mockEmployee: Employee = {
  id: '1',
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah.j@vibelux.com',
  phone: '(555) 123-4567',
  role: EmployeeRole.HEAD_GROWER,
  department: Department.CULTIVATION,
  hireDate: new Date('2022-03-15'),
  status: EmployeeStatus.ACTIVE,
  wage: 35,
  certifications: [
    {
      id: '1',
      name: 'Master Grower Certification',
      issuingBody: 'Cannabis Training Institute',
      issueDate: new Date('2022-06-01'),
      expiryDate: new Date('2025-06-01'),
      certificateNumber: 'MGC-2022-001'
    },
    {
      id: '2',
      name: 'Pesticide Application License',
      issuingBody: 'State Agriculture Department',
      issueDate: new Date('2023-01-15'),
      expiryDate: new Date('2024-01-15'),
      certificateNumber: 'PAL-2023-045'
    }
  ],
  skills: [
    { id: '1', name: 'Hydroponic Systems', category: 'cultivation' as any, level: 'expert' as any },
    { id: '2', name: 'IPM Management', category: 'cultivation' as any, level: 'advanced' as any },
    { id: '3', name: 'Team Leadership', category: 'quality' as any, level: 'advanced' as any }
  ],
  emergencyContact: {
    name: 'John Johnson',
    relationship: 'Spouse',
    phone: '(555) 987-6543',
    alternatePhone: '(555) 456-7890'
  },
  photo: '/api/placeholder/120/120',
  badgeId: 'EMP001',
  biometricId: 'BIO001'
};

const mockTrainingRecords: TrainingRecord[] = [
  {
    id: '1',
    employeeId: '1',
    trainingId: '1',
    startDate: new Date('2024-01-10'),
    completionDate: new Date('2024-01-12'),
    score: 92,
    passed: true,
    expiryDate: new Date('2025-01-12')
  },
  {
    id: '2',
    employeeId: '1',
    trainingId: '2',
    startDate: new Date('2024-01-15'),
    completionDate: new Date('2024-01-16'),
    score: 95,
    passed: true,
    expiryDate: new Date('2024-07-15')
  }
];

const mockPerformanceData = [
  { month: 'Jan', productivity: 95, quality: 92, attendance: 100 },
  { month: 'Feb', productivity: 98, quality: 94, attendance: 95 },
  { month: 'Mar', productivity: 102, quality: 96, attendance: 100 },
  { month: 'Apr', productivity: 97, quality: 93, attendance: 100 },
  { month: 'May', productivity: 105, quality: 98, attendance: 95 },
  { month: 'Jun', productivity: 103, quality: 97, attendance: 100 }
];

export default function EmployeeDetailPage() {
  const params = useParams();
  const employeeId = params.id as string;
  
  const [employee, setEmployee] = useState<Employee>(mockEmployee);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'training' | 'timesheet'>('overview');
  const [editForm, setEditForm] = useState(employee);

  const handleSave = () => {
    setEmployee(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(employee);
    setIsEditing(false);
  };

  const getStatusColor = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.ACTIVE: return 'bg-green-500/20 text-green-400 border-green-500/30';
      case EmployeeStatus.ON_LEAVE: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case EmployeeStatus.TERMINATED: return 'bg-red-500/20 text-red-400 border-red-500/30';
      case EmployeeStatus.SUSPENDED: return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatRole = (role: EmployeeRole) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const getExpiryStatus = (expiryDate?: Date) => {
    if (!expiryDate) return null;
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', color: 'text-red-400', text: 'Expired' };
    if (daysUntilExpiry <= 30) return { status: 'expiring', color: 'text-yellow-400', text: `Expires in ${daysUntilExpiry} days` };
    return { status: 'valid', color: 'text-green-400', text: 'Valid' };
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/workforce/employees"
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{employee.firstName} {employee.lastName}</h1>
                <p className="text-gray-400">{formatRole(employee.role)} • {employee.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Employee Profile Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start gap-6">
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-24 h-24 bg-gray-700 rounded-full overflow-hidden">
                {employee.photo ? (
                  <img src={employee.photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                    {employee.firstName[0]}{employee.lastName[0]}
                  </div>
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-1 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{employee.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{employee.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Hire Date</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{employee.hireDate.toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                {isEditing ? (
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as EmployeeStatus })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    {Object.values(EmployeeStatus).map(status => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(employee.status)}`}>
                    {employee.status.replace('_', ' ').toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'performance', label: 'Performance', icon: TrendingUp },
              { id: 'training', label: 'Training', icon: Award },
              { id: 'timesheet', label: 'Timesheet', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-gray-400">Hourly Rate</span>
                </div>
                <div className="text-2xl font-bold text-green-400">${employee.wage}</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-400">Performance</span>
                </div>
                <div className="text-2xl font-bold text-purple-400">97%</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400">Attendance</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">98%</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-400">Rating</span>
                </div>
                <div className="text-2xl font-bold text-yellow-400">4.8</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">First Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                      ) : (
                        <div className="text-white">{employee.firstName}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                      ) : (
                        <div className="text-white">{employee.lastName}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Badge ID</label>
                    <div className="text-white">{employee.badgeId}</div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Department</label>
                    {isEditing ? (
                      <select
                        value={editForm.department}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value as Department })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
                      >
                        {Object.values(Department).map(dept => (
                          <option key={dept} value={dept}>
                            {dept.charAt(0).toUpperCase() + dept.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-white capitalize">{employee.department}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Role</label>
                    {isEditing ? (
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value as EmployeeRole })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
                      >
                        {Object.values(EmployeeRole).map(role => (
                          <option key={role} value={role}>
                            {formatRole(role)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-white">{formatRole(employee.role)}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Name</label>
                    <div className="text-white">{employee.emergencyContact.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Relationship</label>
                    <div className="text-white">{employee.emergencyContact.relationship}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Primary Phone</label>
                    <div className="text-white">{employee.emergencyContact.phone}</div>
                  </div>
                  {employee.emergencyContact.alternatePhone && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Alternate Phone</label>
                      <div className="text-white">{employee.emergencyContact.alternatePhone}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Skills and Certifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skills */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Skills</h3>
                <div className="space-y-3">
                  {employee.skills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div>
                        <div className="font-medium">{skill.name}</div>
                        <div className="text-sm text-gray-400 capitalize">{skill.category}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        skill.level === 'expert' ? 'bg-green-500/20 text-green-400' :
                        skill.level === 'advanced' ? 'bg-blue-500/20 text-blue-400' :
                        skill.level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Certifications</h3>
                <div className="space-y-3">
                  {employee.certifications.map((cert) => {
                    const expiryStatus = getExpiryStatus(cert.expiryDate);
                    return (
                      <div key={cert.id} className="p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{cert.name}</div>
                            <div className="text-sm text-gray-400">{cert.issuingBody}</div>
                            <div className="text-xs text-gray-500">
                              Issued: {cert.issueDate.toLocaleDateString()}
                            </div>
                          </div>
                          {expiryStatus && (
                            <span className={`text-xs ${expiryStatus.color}`}>
                              {expiryStatus.text}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="text-center py-12 text-gray-400">
            <TrendingUp className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Performance Analytics</h3>
            <p>Detailed performance metrics and reviews coming soon</p>
          </div>
        )}

        {/* Training Tab */}
        {activeTab === 'training' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-lg font-semibold">Training History</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Training</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Completed</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Score</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTrainingRecords.map((record) => (
                    <tr key={record.id} className="border-b border-gray-700">
                      <td className="p-4">Training {record.trainingId}</td>
                      <td className="p-4">
                        {record.completionDate?.toLocaleDateString() || 'In Progress'}
                      </td>
                      <td className="p-4">
                        {record.score && (
                          <span className={`font-medium ${record.passed ? 'text-green-400' : 'text-red-400'}`}>
                            {record.score}%
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          record.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {record.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="p-4">
                        {record.expiryDate?.toLocaleDateString() || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Timesheet Tab */}
        {activeTab === 'timesheet' && (
          <div className="text-center py-12 text-gray-400">
            <Clock className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Timesheet Records</h3>
            <p>Individual timesheet data and analytics coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}