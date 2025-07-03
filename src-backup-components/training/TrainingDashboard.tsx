'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Calendar, 
  Award, 
  BookOpen, 
  Clock, 
  TrendingUp,
  Users,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  BarChart3,
  GraduationCap,
  Target,
  Zap
} from 'lucide-react';
import {
  TrainingProgram,
  TrainingProgress,
  LearningPath,
  Certification,
  TrainingSchedule,
  ProgressStatus,
  TrainingCategory,
  DifficultyLevel
} from '@/lib/training/training-types';

interface TrainingDashboardProps {
  userId: string;
  role: string;
  department: string;
}

export default function TrainingDashboard({ userId, role, department }: TrainingDashboardProps) {
  const [activePrograms, setActivePrograms] = useState<TrainingProgress[]>([]);
  const [recommendedPrograms, setRecommendedPrograms] = useState<TrainingProgram[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<TrainingSchedule[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TrainingCategory | 'all'>('all');
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);

  useEffect(() => {
    // Load training data
    loadTrainingData();
  }, [userId]);

  const loadTrainingData = async () => {
    // In a real app, this would fetch from API
    // For now, using mock data
    setActivePrograms(mockActivePrograms);
    setRecommendedPrograms(mockRecommendedPrograms);
    setUpcomingSessions(mockUpcomingSessions);
    setCertifications(mockCertifications);
    setLearningPaths(mockLearningPaths);
  };

  const getOverallProgress = () => {
    if (activePrograms.length === 0) return 0;
    const totalProgress = activePrograms.reduce((sum, prog) => sum + prog.overallProgress, 0);
    return Math.round(totalProgress / activePrograms.length);
  };

  const getCompletedCourses = () => {
    return activePrograms.filter(prog => prog.overallProgress === 100).length;
  };

  const getTotalLearningHours = () => {
    // Calculate total learning hours from active programs
    return activePrograms.reduce((total, prog) => {
      return total + prog.courseProgress.reduce((courseTotal, course) => {
        return courseTotal + course.moduleProgress.reduce((modTotal, mod) => {
          return modTotal + (mod.timeSpent || 0);
        }, 0);
      }, 0);
    }, 0) / 60; // Convert minutes to hours
  };

  const getActiveCertifications = () => {
    return certifications.filter(cert => {
      // Check if certification is still valid
      return true; // Simplified for demo
    }).length;
  };

  const getDifficultyColor = (level: DifficultyLevel) => {
    switch (level) {
      case DifficultyLevel.BEGINNER:
        return 'bg-green-500';
      case DifficultyLevel.INTERMEDIATE:
        return 'bg-yellow-500';
      case DifficultyLevel.ADVANCED:
        return 'bg-orange-500';
      case DifficultyLevel.EXPERT:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: TrainingCategory) => {
    switch (category) {
      case TrainingCategory.SAFETY:
        return <AlertCircle className="h-4 w-4" />;
      case TrainingCategory.COMPLIANCE:
        return <CheckCircle className="h-4 w-4" />;
      case TrainingCategory.CULTIVATION:
        return <Zap className="h-4 w-4" />;
      case TrainingCategory.TECHNICAL:
        return <Target className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Training Center</h1>
          <p className="text-gray-400 mt-1">Track your learning progress and discover new courses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
            <BookOpen className="h-4 w-4" />
            Browse Courses
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Overall Progress</p>
              <p className="text-2xl font-bold text-white mt-1">{getOverallProgress()}%</p>
            </div>
            <div className="h-12 w-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <Progress value={getOverallProgress()} className="mt-3" />
        </Card>

        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completed Courses</p>
              <p className="text-2xl font-bold text-white mt-1">{getCompletedCourses()}</p>
            </div>
            <div className="h-12 w-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Learning Hours</p>
              <p className="text-2xl font-bold text-white mt-1">{getTotalLearningHours().toFixed(1)}</p>
            </div>
            <div className="h-12 w-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Certifications</p>
              <p className="text-2xl font-bold text-white mt-1">{getActiveCertifications()}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="bg-gray-900 border-gray-800">
          <TabsTrigger value="active">Active Courses</TabsTrigger>
          <TabsTrigger value="catalog">Course Catalog</TabsTrigger>
          <TabsTrigger value="paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {/* Active Courses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activePrograms.map((program) => (
              <Card key={program.id} className="bg-gray-900 border-gray-800 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {mockProgramDetails[program.programId]?.title || 'Course Title'}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Last accessed: {new Date(program.lastAccessedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button size="sm" className="gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Continue
                  </Button>
                </div>
                <Progress value={program.overallProgress} className="mb-2" />
                <p className="text-sm text-gray-400">{program.overallProgress}% Complete</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="catalog" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-800"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory('all')}
            >
              All Categories
            </Badge>
            {Object.values(TrainingCategory).map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer gap-1"
                onClick={() => setSelectedCategory(category)}
              >
                {getCategoryIcon(category)}
                {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
              </Badge>
            ))}
          </div>

          {/* Recommended Programs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedPrograms.map((program) => (
              <Card key={program.id} className="bg-gray-900 border-gray-800 p-6 hover:border-purple-600 transition-colors cursor-pointer">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={`${getDifficultyColor(program.difficulty)}`}>
                      {program.difficulty}
                    </Badge>
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.round(program.duration / 60)}h
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{program.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{program.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {program.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full gap-2">
                    <BookOpen className="h-4 w-4" />
                    Enroll Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="paths" className="space-y-4">
          {/* Learning Paths */}
          <div className="space-y-4">
            {learningPaths.map((path) => (
              <Card key={path.id} className="bg-gray-900 border-gray-800 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{path.title}</h3>
                        <p className="text-sm text-gray-400">
                          {path.programs.length} courses • ~{path.estimatedDuration} hours
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">{path.description}</p>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">
                        For: {path.targetRole}
                      </Badge>
                      {path.isRecommended && (
                        <Badge className="bg-green-600">
                          Recommended
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          {/* Certification Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certifications.map((cert) => (
              <Card key={cert.id} className="bg-gray-900 border-gray-800 p-6">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                    <Award className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{cert.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{cert.issuingBody}</p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Valid until</span>
                        <span className="text-white">
                          {new Date(Date.now() + cert.validityPeriod * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          {/* Upcoming Training Sessions */}
          <Card className="bg-gray-900 border-gray-800">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Upcoming Training Sessions</h3>
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {new Date(session.startDate).getDate()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(session.startDate).toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">
                          {mockProgramDetails[session.programId]?.title || 'Training Session'}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {session.location?.type === 'virtual' ? 'Virtual Session' : session.location?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {session.enrolledParticipants.length}/{session.maxParticipants}
                      </Badge>
                      <Button size="sm">Join</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Mock data for demonstration
const mockActivePrograms: TrainingProgress[] = [
  {
    id: '1',
    userId: 'user1',
    programId: 'prog1',
    courseProgress: [],
    startedAt: new Date('2024-01-15'),
    lastAccessedAt: new Date('2024-02-20'),
    overallProgress: 65
  },
  {
    id: '2',
    userId: 'user1',
    programId: 'prog2',
    courseProgress: [],
    startedAt: new Date('2024-02-01'),
    lastAccessedAt: new Date('2024-02-19'),
    overallProgress: 30
  }
];

const mockRecommendedPrograms: TrainingProgram[] = [
  {
    id: 'prog3',
    title: 'Advanced Cultivation Techniques',
    description: 'Master advanced growing techniques including environmental optimization, pest management, and yield maximization.',
    category: TrainingCategory.CULTIVATION,
    targetRoles: ['Lead Grower', 'Head Grower'],
    courses: [],
    duration: 480,
    difficulty: DifficultyLevel.ADVANCED,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin',
    tags: ['cultivation', 'advanced', 'yield optimization'],
    isActive: true
  },
  {
    id: 'prog4',
    title: 'GMP Compliance Training',
    description: 'Comprehensive training on Good Manufacturing Practices for cannabis cultivation and processing.',
    category: TrainingCategory.COMPLIANCE,
    targetRoles: ['All Staff'],
    courses: [],
    duration: 240,
    difficulty: DifficultyLevel.INTERMEDIATE,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin',
    tags: ['compliance', 'GMP', 'regulations'],
    isActive: true
  },
  {
    id: 'prog5',
    title: 'Equipment Safety Fundamentals',
    description: 'Essential safety training for operating cultivation equipment and machinery.',
    category: TrainingCategory.SAFETY,
    targetRoles: ['All Staff'],
    courses: [],
    duration: 180,
    difficulty: DifficultyLevel.BEGINNER,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin',
    tags: ['safety', 'equipment', 'fundamentals'],
    isActive: true
  }
];

const mockUpcomingSessions: TrainingSchedule[] = [
  {
    id: 'sched1',
    programId: 'prog1',
    startDate: new Date('2024-02-25'),
    endDate: new Date('2024-02-25'),
    sessions: [],
    maxParticipants: 20,
    enrolledParticipants: ['user1', 'user2', 'user3'],
    location: {
      type: 'virtual' as any,
      name: 'Online Training Room',
      capacity: 50
    },
    status: 'scheduled' as any
  }
];

const mockCertifications: Certification[] = [
  {
    id: 'cert1',
    name: 'Certified Cultivation Specialist',
    description: 'Professional certification for cultivation specialists',
    issuingBody: 'Cannabis Industry Association',
    requirements: {
      requiredCourses: ['course1', 'course2'],
      minimumScore: 80
    },
    validityPeriod: 365,
    certificateTemplate: 'template1'
  }
];

const mockLearningPaths: LearningPath[] = [
  {
    id: 'path1',
    title: 'Cultivation Technician to Lead Grower',
    description: 'Complete pathway from entry-level cultivation technician to lead grower position',
    targetRole: 'Lead Grower',
    programs: ['prog1', 'prog3', 'prog4'],
    estimatedDuration: 120,
    milestones: [],
    createdBy: 'admin',
    isRecommended: true
  }
];

const mockProgramDetails: Record<string, { title: string }> = {
  prog1: { title: 'Cannabis Cultivation Fundamentals' },
  prog2: { title: 'Integrated Pest Management' }
};