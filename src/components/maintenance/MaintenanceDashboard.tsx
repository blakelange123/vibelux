'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Wrench,
  TrendingUp,
  Settings,
  MapPin,
  Phone,
  Star,
  DollarSign,
} from 'lucide-react';

interface MaintenanceAlert {
  id: string;
  type: 'overdue' | 'upcoming' | 'predictive' | 'guarantee_violation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  equipmentName: string;
  facilityName: string;
  dueDate?: string;
  createdAt: string;
}

interface MaintenanceSchedule {
  id: string;
  name: string;
  equipment: {
    name: string;
    category: string;
  };
  nextDue: string;
  priority: string;
  frequency: string;
  assignedTo?: string;
}

interface MaintenanceStats {
  totalEquipment: number;
  overdueCount: number;
  upcomingCount: number;
  completedThisMonth: number;
  averageHealthScore: number;
  complianceRate: number;
}

export default function MaintenanceDashboard({ facilityId }: { facilityId?: string }) {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [stats, setStats] = useState<MaintenanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchMaintenanceData();
  }, [facilityId]);

  const fetchMaintenanceData = async () => {
    try {
      setLoading(true);
      
      const [alertsRes, schedulesRes, statsRes] = await Promise.all([
        fetch(`/api/maintenance/alerts${facilityId ? `?facilityId=${facilityId}` : ''}`),
        fetch(`/api/maintenance/schedules${facilityId ? `?facilityId=${facilityId}` : ''}`),
        fetch(`/api/maintenance/statistics${facilityId ? `?facilityId=${facilityId}` : ''}`)
      ]);

      const [alertsData, schedulesData, statsData] = await Promise.all([
        alertsRes.json(),
        schedulesRes.json(),
        statsRes.json()
      ]);

      setAlerts(alertsData);
      setSchedules(schedulesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      case 'upcoming': return <Clock className="h-4 w-4" />;
      case 'predictive': return <TrendingUp className="h-4 w-4" />;
      case 'guarantee_violation': return <Settings className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Dashboard</h1>
          <p className="text-gray-600">Monitor and manage equipment maintenance</p>
        </div>
        <Button onClick={fetchMaintenanceData} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEquipment}</div>
              <div className="flex items-center mt-2">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-gray-600">Active units</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overdue Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdueCount}</div>
              <div className="flex items-center mt-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-gray-600">Require immediate attention</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageHealthScore.toFixed(1)}%</div>
              <Progress value={stats.averageHealthScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.complianceRate.toFixed(1)}%</div>
              <Progress value={stats.complianceRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Critical Alerts */}
          {alerts.filter(a => a.priority === 'critical').length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You have {alerts.filter(a => a.priority === 'critical').length} critical maintenance issues requiring immediate attention.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="mt-1">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{alert.title}</p>
                          <Badge variant={getPriorityColor(alert.priority)}>
                            {alert.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {alert.equipmentName} • {alert.facilityName}
                        </p>
                      </div>
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No alerts</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Maintenance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedules.slice(0, 5).map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{schedule.name}</p>
                        <p className="text-sm text-gray-600">{schedule.equipment.name}</p>
                        <p className="text-xs text-gray-500">
                          Due: {new Date(schedule.nextDue).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={getPriorityColor(schedule.priority)}>
                        {schedule.priority}
                      </Badge>
                    </div>
                  ))}
                  {schedules.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No upcoming maintenance</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Alerts</CardTitle>
              <p className="text-sm text-gray-600">
                Monitor critical maintenance issues and equipment health
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{alert.title}</h3>
                            <Badge variant={getPriorityColor(alert.priority)}>
                              {alert.priority}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mt-1">{alert.message}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>{alert.equipmentName}</span>
                            <span>•</span>
                            <span>{alert.facilityName}</span>
                            {alert.dueDate && (
                              <>
                                <span>•</span>
                                <span>Due: {new Date(alert.dueDate).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Active Alerts</h3>
                    <p className="text-gray-600">All equipment is operating within normal parameters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedules</CardTitle>
              <p className="text-sm text-gray-600">
                Manage preventive and scheduled maintenance
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{schedule.name}</h3>
                          <Badge variant={getPriorityColor(schedule.priority)}>
                            {schedule.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>{schedule.equipment.name}</span>
                          <span>•</span>
                          <span>{schedule.equipment.category}</span>
                          <span>•</span>
                          <span>{schedule.frequency}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Next due: {new Date(schedule.nextDue).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm">
                          Schedule Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {schedules.length === 0 && (
                  <div className="text-center py-8">
                    <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Maintenance Schedules</h3>
                    <p className="text-gray-600">Create maintenance schedules for your equipment</p>
                    <Button className="mt-4">
                      Create Schedule
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Completed This Month</span>
                    <span className="font-medium">{stats?.completedThisMonth || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Health Score</span>
                    <span className="font-medium">{stats?.averageHealthScore.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Compliance Rate</span>
                    <span className="font-medium">{stats?.complianceRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipment Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{stats?.averageHealthScore.toFixed(0)}%</div>
                    <p className="text-gray-600">Average Health Score</p>
                  </div>
                  <Progress value={stats?.averageHealthScore || 0} />
                  <div className="text-sm text-gray-600 text-center">
                    Based on maintenance history, sensor data, and equipment age
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}