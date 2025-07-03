'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Search,
  Filter,
  UserPlus,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Award,
  AlertCircle,
  Download,
  ChevronDown
} from 'lucide-react';
import { Employee, EmployeeRole, Department, EmployeeStatus } from '@/lib/workforce/workforce-types';

// Mock data
const mockEmployees: Employee[] = [
  {
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
      { id: '1', name: 'Master Grower Certification', issuingBody: 'Cannabis Training Institute', issueDate: new Date('2022-06-01') }
    ],
    skills: [],
    emergencyContact: { name: 'John Johnson', relationship: 'Spouse', phone: '(555) 987-6543' },
    photo: '/api/placeholder/40/40'
  },
  {
    id: '2',
    firstName: 'Mike',
    lastName: 'Chen',
    email: 'mike.c@vibelux.com',
    phone: '(555) 234-5678',
    role: EmployeeRole.CULTIVATION_TECH,
    department: Department.CULTIVATION,
    hireDate: new Date('2023-01-10'),
    status: EmployeeStatus.ACTIVE,
    wage: 22,
    certifications: [],
    skills: [],
    emergencyContact: { name: 'Lisa Chen', relationship: 'Sister', phone: '(555) 876-5432' },
    badgeId: 'EMP002'
  },
  {
    id: '3',
    firstName: 'Jessica',
    lastName: 'Martinez',
    email: 'jessica.m@vibelux.com',
    phone: '(555) 345-6789',
    role: EmployeeRole.IPM_SPECIALIST,
    department: Department.CULTIVATION,
    hireDate: new Date('2022-08-20'),
    status: EmployeeStatus.ACTIVE,
    wage: 28,
    certifications: [
      { id: '2', name: 'IPM Certification', issuingBody: 'State Agriculture Dept', issueDate: new Date('2022-10-15'), expiryDate: new Date('2024-10-15') }
    ],
    skills: [],
    emergencyContact: { name: 'Carlos Martinez', relationship: 'Father', phone: '(555) 765-4321' }
  }
];

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'all'>('all');
  const [selectedRole, setSelectedRole] = useState<EmployeeRole | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = searchTerm === '' || 
      `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    const matchesRole = selectedRole === 'all' || employee.role === selectedRole;
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const getRoleBadgeColor = (role: EmployeeRole) => {
    const colors: Record<EmployeeRole, string> = {
      [EmployeeRole.HEAD_GROWER]: 'bg-purple-600',
      [EmployeeRole.LEAD_GROWER]: 'bg-blue-600',
      [EmployeeRole.CULTIVATION_TECH]: 'bg-green-600',
      [EmployeeRole.IPM_SPECIALIST]: 'bg-orange-600',
      [EmployeeRole.HARVEST_TECH]: 'bg-yellow-600',
      [EmployeeRole.PROCESSING_TECH]: 'bg-pink-600',
      [EmployeeRole.QUALITY_CONTROL]: 'bg-red-600',
      [EmployeeRole.MAINTENANCE]: 'bg-gray-600',
      [EmployeeRole.MANAGER]: 'bg-indigo-600',
      [EmployeeRole.ADMIN]: 'bg-teal-600'
    };
    return colors[role] || 'bg-gray-600';
  };

  const formatRole = (role: EmployeeRole) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/workforce"
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Employee Management</h1>
                <p className="text-gray-400">Manage your team members and their information</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <Link
                href="/workforce/employees/new"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add Employee
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-900 rounded-lg">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value as Department | 'all')}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="all">All Departments</option>
                {Object.values(Department).map(dept => (
                  <option key={dept} value={dept}>
                    {dept.charAt(0).toUpperCase() + dept.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as EmployeeRole | 'all')}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="all">All Roles</option>
                {Object.values(EmployeeRole).map(role => (
                  <option key={role} value={role}>
                    {formatRole(role)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
        )}

        {/* Employee Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{mockEmployees.length}</div>
            <div className="text-sm text-gray-400">Total Employees</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">
              {mockEmployees.filter(e => e.status === EmployeeStatus.ACTIVE).length}
            </div>
            <div className="text-sm text-gray-400">Active</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">3</div>
            <div className="text-sm text-gray-400">Expiring Certs</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">$26.50</div>
            <div className="text-sm text-gray-400">Avg Wage/Hour</div>
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-sm font-medium text-gray-400">Employee</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Department</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Role</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Contact</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Wage</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        {employee.photo ? (
                          <img src={employee.photo} alt="" className="w-full h-full rounded-full" />
                        ) : (
                          <span className="text-sm font-medium">
                            {employee.firstName[0]}{employee.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                        <div className="text-sm text-gray-400">
                          {employee.badgeId || `EMP${employee.id.padStart(3, '0')}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300 capitalize">{employee.department}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getRoleBadgeColor(employee.role)}`}>
                      {formatRole(employee.role)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-300">{employee.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-300">{employee.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{employee.wage}/hr</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      employee.status === EmployeeStatus.ACTIVE 
                        ? 'bg-green-900/30 text-green-400 border border-green-600/30'
                        : 'bg-gray-900/30 text-gray-400 border border-gray-600/30'
                    }`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {employee.certifications.some(cert => 
                        cert.expiryDate && cert.expiryDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                      ) && (
                        <AlertCircle className="w-4 h-4 text-yellow-400" title="Certification expiring soon" />
                      )}
                      <Link
                        href={`/workforce/employees/${employee.id}`}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Link>
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
}