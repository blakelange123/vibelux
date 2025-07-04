'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot, 
  Cpu, 
  Wrench, 
  Truck, 
  Eye, 
  Zap, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react';

interface RobotStatus {
  id: string;
  name: string;
  type: 'harvesting' | 'planting' | 'maintenance' | 'logistics' | 'inspection';
  status: 'online' | 'offline' | 'maintenance' | 'error';
  battery: number;
  currentTask?: string;
  location: string;
  lastUpdate: Date;
}

interface RoboticTask {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedRobot?: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  estimatedDuration: number;
  description: string;
  scheduledTime: Date;
}

export default function RoboticIntegrationCenter() {
  const [robots, setRobots] = useState<RobotStatus[]>([
    {
      id: 'harvest-01',
      name: 'Harvest Bot Alpha',
      type: 'harvesting',
      status: 'offline',
      battery: 0,
      location: 'Charging Station A',
      lastUpdate: new Date()
    },
    {
      id: 'plant-01',
      name: 'Seeding Unit Beta',
      type: 'planting',
      status: 'offline',
      battery: 0,
      location: 'Staging Area B',
      lastUpdate: new Date()
    },
    {
      id: 'maint-01',
      name: 'Maintenance Drone',
      type: 'maintenance',
      status: 'offline',
      battery: 0,
      location: 'Service Bay C',
      lastUpdate: new Date()
    },
    {
      id: 'logistics-01',
      name: 'Transport AGV',
      type: 'logistics',
      status: 'offline',
      battery: 0,
      location: 'Warehouse D',
      lastUpdate: new Date()
    },
    {
      id: 'inspect-01',
      name: 'Vision Inspector',
      type: 'inspection',
      status: 'offline',
      battery: 0,
      location: 'Calibration Zone',
      lastUpdate: new Date()
    }
  ]);

  const [tasks, setTasks] = useState<RoboticTask[]>([
    {
      id: 'task-001',
      type: 'Harvest Ready Crops',
      priority: 'high',
      status: 'queued',
      estimatedDuration: 120,
      description: 'Harvest mature lettuce in Zone A-3',
      scheduledTime: new Date(Date.now() + 3600000)
    },
    {
      id: 'task-002',
      type: 'Plant New Seedlings',
      priority: 'medium',
      status: 'queued',
      estimatedDuration: 90,
      description: 'Plant 200 basil seedlings in Zone B-1',
      scheduledTime: new Date(Date.now() + 7200000)
    },
    {
      id: 'task-003',
      type: 'System Maintenance',
      priority: 'low',
      status: 'queued',
      estimatedDuration: 45,
      description: 'Clean irrigation nozzles in Zone C-2',
      scheduledTime: new Date(Date.now() + 10800000)
    }
  ]);

  const [automationLevel, setAutomationLevel] = useState(3.5);

  const getRobotIcon = (type: RobotStatus['type']) => {
    switch (type) {
      case 'harvesting': return <Bot className="h-5 w-5" />;
      case 'planting': return <Cpu className="h-5 w-5" />;
      case 'maintenance': return <Wrench className="h-5 w-5" />;
      case 'logistics': return <Truck className="h-5 w-5" />;
      case 'inspection': return <Eye className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: RobotStatus['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-400';
      case 'maintenance': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
    }
  };

  const getPriorityColor = (priority: RoboticTask['priority']) => {
    switch (priority) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Robotic Integration Center</h1>
          <p className="text-gray-600 mt-2">Level 5 Automation Infrastructure (Development Mode)</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Current Automation Level</p>
            <div className="flex items-center space-x-2">
              <Progress value={automationLevel * 20} className="w-24" />
              <span className="font-bold text-lg">{automationLevel}/5</span>
            </div>
          </div>
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            Development Phase
          </Badge>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Robotic systems are in development phase. All robots are currently offline. 
          Integration with physical hardware will enable Level 5 full automation.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="robots" className="space-y-4">
        <TabsList>
          <TabsTrigger value="robots">Robot Fleet</TabsTrigger>
          <TabsTrigger value="tasks">Task Queue</TabsTrigger>
          <TabsTrigger value="coordination">AI Coordination</TabsTrigger>
          <TabsTrigger value="settings">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="robots" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {robots.map((robot) => (
              <Card key={robot.id} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getRobotIcon(robot.type)}
                      <CardTitle className="text-lg">{robot.name}</CardTitle>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(robot.status)}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge variant="outline" className="capitalize">
                        {robot.status}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Battery:</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={robot.battery} className="w-16" />
                        <span className="text-sm">{robot.battery}%</span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Location:</span>
                      <span className="text-sm font-medium">{robot.location}</span>
                    </div>

                    {robot.currentTask && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Task:</span>
                        <span className="text-sm font-medium">{robot.currentTask}</span>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" variant="outline" disabled>
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline" disabled>
                        <Zap className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Automated Task Queue</h3>
            <Button disabled>
              <Bot className="h-4 w-4 mr-2" />
              Auto-Schedule Tasks
            </Button>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <h4 className="font-semibold">{task.type}</h4>
                        <Badge variant="outline" className="capitalize">
                          {task.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mt-1">{task.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {task.estimatedDuration} min
                        </span>
                        <span>Scheduled: {task.scheduledTime.toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" disabled>
                        Assign Robot
                      </Button>
                      <Button size="sm" variant="outline" disabled>
                        Priority
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coordination" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cpu className="h-5 w-5 mr-2" />
                AI Coordination Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Path Planning</h4>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Advanced pathfinding algorithms for optimal robot navigation 
                      and collision avoidance in multi-robot environments.
                    </p>
                    <Badge className="mt-2" variant="outline">Ready for Integration</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Task Optimization</h4>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Machine learning models for optimal task assignment and 
                      scheduling based on robot capabilities and farm conditions.
                    </p>
                    <Badge className="mt-2" variant="outline">Ready for Integration</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Predictive Maintenance</h4>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      AI-powered prediction of robot maintenance needs to prevent 
                      downtime and optimize fleet performance.
                    </p>
                    <Badge className="mt-2" variant="outline">Ready for Integration</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Quality Control</h4>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Computer vision and ML models for automated quality 
                      assessment and grading of harvested crops.
                    </p>
                    <Badge className="mt-2" variant="outline">Ready for Integration</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Robotic System Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Safety protocols and emergency stop systems are built into all robotic operations.
                    Human override is always available.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Hardware Integration Points</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        ROS2 Communication Interface
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        MQTT Device Control
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Computer Vision Pipeline
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Fleet Management API
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Automation Features Ready</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Autonomous Task Scheduling
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Multi-Robot Coordination
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Predictive Maintenance
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Quality Control Integration
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-blue-900 mb-2">Level 5 Automation Readiness</h5>
                  <p className="text-blue-700 text-sm">
                    The VibeLux platform is architecturally ready for Level 5 (Full Automation) integration. 
                    The AI coordination engine, sensor systems, and control interfaces are designed to support 
                    autonomous robotic operations with minimal human intervention.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}