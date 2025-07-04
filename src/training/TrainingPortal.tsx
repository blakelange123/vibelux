'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap, PlayCircle, CheckCircle, Lock, Clock,
  Award, TrendingUp, BookOpen, Video, FileText, Users,
  Star, Trophy, Target, Zap, Shield, AlertTriangle,
  ChevronRight, Download, RefreshCw, BarChart3
} from 'lucide-react';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'safety' | 'equipment' | 'quality' | 'compliance' | 'advanced';
  duration: number; // minutes
  lessons: Lesson[];
  requiredScore: number;
  certification: boolean;
  prerequisites?: string[];
  icon: any;
  color: string;
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'interactive' | 'quiz' | 'practical';
  duration: number;
  content: string;
  completed?: boolean;
  score?: number;
}

interface UserProgress {
  moduleId: string;
  completedLessons: string[];
  totalScore: number;
  attempts: number;
  certified: boolean;
  certifiedDate?: Date;
  expiresAt?: Date;
}

interface Certificate {
  id: string;
  moduleId: string;
  userId: string;
  issuedDate: Date;
  expiresDate: Date;
  score: number;
  verificationCode: string;
}

const trainingModules: TrainingModule[] = [
  {
    id: 'visual-ops-basics',
    title: 'Visual Operations Basics',
    description: 'Learn how to use the photo reporting system effectively',
    category: 'basics',
    duration: 30,
    requiredScore: 80,
    certification: true,
    icon: GraduationCap,
    color: 'from-purple-500 to-purple-600',
    lessons: [
      {
        id: 'intro',
        title: 'Introduction to Visual Operations',
        type: 'video',
        duration: 5,
        content: 'Overview of the Visual Operations system and its benefits'
      },
      {
        id: 'taking-photos',
        title: 'Taking Effective Photos',
        type: 'interactive',
        duration: 10,
        content: 'Best practices for capturing clear, informative photos'
      },
      {
        id: 'using-annotations',
        title: 'Using Annotation Tools',
        type: 'interactive',
        duration: 8,
        content: 'How to mark and highlight issues in photos'
      },
      {
        id: 'basics-quiz',
        title: 'Knowledge Check',
        type: 'quiz',
        duration: 7,
        content: 'Test your understanding of Visual Operations basics'
      }
    ]
  },
  {
    id: 'pest-identification',
    title: 'Pest & Disease Identification',
    description: 'Identify common pests and diseases in cultivation',
    category: 'quality',
    duration: 45,
    requiredScore: 85,
    certification: true,
    icon: Shield,
    color: 'from-red-500 to-red-600',
    prerequisites: ['visual-ops-basics'],
    lessons: [
      {
        id: 'common-pests',
        title: 'Common Cultivation Pests',
        type: 'video',
        duration: 15,
        content: 'Visual guide to spider mites, aphids, thrips, and more'
      },
      {
        id: 'disease-symptoms',
        title: 'Disease Symptoms & Patterns',
        type: 'interactive',
        duration: 12,
        content: 'Recognizing powdery mildew, root rot, and nutrient deficiencies'
      },
      {
        id: 'photo-angles',
        title: 'Photo Angles for Pest Detection',
        type: 'practical',
        duration: 10,
        content: 'Where and how to photograph for best AI detection'
      },
      {
        id: 'pest-quiz',
        title: 'Pest Identification Quiz',
        type: 'quiz',
        duration: 8,
        content: 'Identify pests and diseases from photo examples'
      }
    ]
  },
  {
    id: 'equipment-safety',
    title: 'Equipment & Safety Reporting',
    description: 'Report equipment issues and safety hazards properly',
    category: 'safety',
    duration: 40,
    requiredScore: 90,
    certification: true,
    icon: AlertTriangle,
    color: 'from-orange-500 to-orange-600',
    prerequisites: ['visual-ops-basics'],
    lessons: [
      {
        id: 'safety-hazards',
        title: 'Identifying Safety Hazards',
        type: 'video',
        duration: 12,
        content: 'Common safety issues and OSHA requirements'
      },
      {
        id: 'equipment-failures',
        title: 'Equipment Failure Signs',
        type: 'interactive',
        duration: 10,
        content: 'Early warning signs of equipment problems'
      },
      {
        id: 'emergency-reporting',
        title: 'Emergency Reporting Procedures',
        type: 'practical',
        duration: 8,
        content: 'When and how to report critical issues'
      },
      {
        id: 'safety-quiz',
        title: 'Safety Certification Quiz',
        type: 'quiz',
        duration: 10,
        content: 'Test your safety knowledge and reporting skills'
      }
    ]
  },
  {
    id: 'quality-control',
    title: 'Quality Control Documentation',
    description: 'Document quality issues for compliance and improvement',
    category: 'quality',
    duration: 35,
    requiredScore: 85,
    certification: true,
    icon: Eye,
    color: 'from-indigo-500 to-indigo-600',
    prerequisites: ['visual-ops-basics'],
    lessons: [
      {
        id: 'quality-standards',
        title: 'Understanding Quality Standards',
        type: 'video',
        duration: 10,
        content: 'Industry standards and compliance requirements'
      },
      {
        id: 'defect-documentation',
        title: 'Documenting Defects',
        type: 'interactive',
        duration: 12,
        content: 'How to properly document quality issues'
      },
      {
        id: 'batch-tracking',
        title: 'Batch Tracking & Traceability',
        type: 'practical',
        duration: 8,
        content: 'Linking issues to specific batches and lots'
      },
      {
        id: 'quality-quiz',
        title: 'Quality Control Quiz',
        type: 'quiz',
        duration: 5,
        content: 'Test your quality documentation skills'
      }
    ]
  },
  {
    id: 'compliance-documentation',
    title: 'Compliance & Audit Documentation',
    description: 'Create audit-ready documentation with photos',
    category: 'compliance',
    duration: 50,
    requiredScore: 90,
    certification: true,
    icon: FileText,
    color: 'from-purple-600 to-purple-700',
    prerequisites: ['visual-ops-basics', 'quality-control'],
    lessons: [
      {
        id: 'regulatory-requirements',
        title: 'Regulatory Requirements',
        type: 'video',
        duration: 15,
        content: 'Understanding state and federal compliance needs'
      },
      {
        id: 'audit-preparation',
        title: 'Audit Preparation',
        type: 'interactive',
        duration: 12,
        content: 'Creating photo documentation for audits'
      },
      {
        id: 'chain-of-custody',
        title: 'Chain of Custody Documentation',
        type: 'practical',
        duration: 13,
        content: 'Tracking product movement with photos'
      },
      {
        id: 'compliance-quiz',
        title: 'Compliance Certification',
        type: 'quiz',
        duration: 10,
        content: 'Comprehensive compliance knowledge test'
      }
    ]
  },
  {
    id: 'advanced-ai-features',
    title: 'Advanced AI Features',
    description: 'Master advanced AI analysis and reporting features',
    category: 'advanced',
    duration: 60,
    requiredScore: 85,
    certification: true,
    icon: Zap,
    color: 'from-yellow-500 to-yellow-600',
    prerequisites: ['pest-identification', 'equipment-safety', 'quality-control'],
    lessons: [
      {
        id: 'ai-confidence',
        title: 'Understanding AI Confidence Scores',
        type: 'video',
        duration: 10,
        content: 'How to interpret and act on AI analysis results'
      },
      {
        id: 'multi-photo-analysis',
        title: 'Multi-Photo Analysis Techniques',
        type: 'interactive',
        duration: 15,
        content: 'Using multiple angles for better AI detection'
      },
      {
        id: 'trend-analysis',
        title: 'Trend Analysis & Predictions',
        type: 'practical',
        duration: 20,
        content: 'Using historical data to predict issues'
      },
      {
        id: 'advanced-quiz',
        title: 'Advanced Features Certification',
        type: 'quiz',
        duration: 15,
        content: 'Test your mastery of advanced features'
      }
    ]
  }
];

export default function TrainingPortal({ userId, facilityId }: { userId: string; facilityId: string }) {
  const router = useRouter();
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    // Load user progress and certificates
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      // In production, fetch from API
      const mockProgress: UserProgress[] = [
        {
          moduleId: 'visual-ops-basics',
          completedLessons: ['intro', 'taking-photos'],
          totalScore: 85,
          attempts: 1,
          certified: true,
          certifiedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          expiresAt: new Date(Date.now() + 358 * 24 * 60 * 60 * 1000)
        }
      ];
      setUserProgress(mockProgress);
    } catch (error) {
      console.error('Failed to load training data:', error);
    }
  };

  const getModuleProgress = (moduleId: string): number => {
    const progress = userProgress.find(p => p.moduleId === moduleId);
    if (!progress) return 0;
    
    const module = trainingModules.find(m => m.id === moduleId);
    if (!module) return 0;
    
    return (progress.completedLessons.length / module.lessons.length) * 100;
  };

  const isModuleUnlocked = (module: TrainingModule): boolean => {
    if (!module.prerequisites || module.prerequisites.length === 0) return true;
    
    return module.prerequisites.every(prereq => {
      const progress = userProgress.find(p => p.moduleId === prereq);
      return progress?.certified === true;
    });
  };

  const getCategoryStats = () => {
    const stats: Record<string, { total: number; completed: number }> = {};
    
    trainingModules.forEach(module => {
      if (!stats[module.category]) {
        stats[module.category] = { total: 0, completed: 0 };
      }
      stats[module.category].total++;
      
      const progress = userProgress.find(p => p.moduleId === module.id);
      if (progress?.certified) {
        stats[module.category].completed++;
      }
    });
    
    return stats;
  };

  const getTotalCertifications = () => {
    return userProgress.filter(p => p.certified).length;
  };

  const getExpiringCertifications = () => {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return userProgress.filter(p => 
      p.certified && p.expiresAt && p.expiresAt < thirtyDaysFromNow
    ).length;
  };

  const startModule = (module: TrainingModule) => {
    if (!isModuleUnlocked(module)) {
      alert('Complete prerequisite modules first');
      return;
    }
    setSelectedModule(module);
    setActiveLesson(module.lessons[0]);
  };

  const completeLesson = (lessonId: string, score?: number) => {
    if (!selectedModule) return;
    
    const progress = userProgress.find(p => p.moduleId === selectedModule.id) || {
      moduleId: selectedModule.id,
      completedLessons: [],
      totalScore: 0,
      attempts: 0,
      certified: false
    };
    
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      if (score) {
        progress.totalScore = Math.max(progress.totalScore, score);
      }
    }
    
    // Check if module is complete
    if (progress.completedLessons.length === selectedModule.lessons.length) {
      if (progress.totalScore >= selectedModule.requiredScore) {
        progress.certified = true;
        progress.certifiedDate = new Date();
        progress.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        
        // Generate certificate
        const certificate: Certificate = {
          id: `cert-${Date.now()}`,
          moduleId: selectedModule.id,
          userId,
          issuedDate: new Date(),
          expiresDate: progress.expiresAt,
          score: progress.totalScore,
          verificationCode: `VB-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        };
        setCertificates([...certificates, certificate]);
      }
    }
    
    // Update progress
    setUserProgress([
      ...userProgress.filter(p => p.moduleId !== selectedModule.id),
      progress
    ]);
    
    // Move to next lesson
    const currentIndex = selectedModule.lessons.findIndex(l => l.id === lessonId);
    if (currentIndex < selectedModule.lessons.length - 1) {
      setActiveLesson(selectedModule.lessons[currentIndex + 1]);
    } else {
      // Module complete
      setActiveLesson(null);
    }
  };

  const downloadCertificate = (certificate: Certificate) => {
    // In production, generate PDF certificate
    // Download certificate functionality
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GraduationCap className="w-8 h-8 text-purple-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Training Portal</h1>
                <p className="text-sm text-gray-400">Visual Operations Certification Program</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-400">Certifications</p>
                <p className="text-2xl font-bold text-white">{getTotalCertifications()}</p>
              </div>
              {getExpiringCertifications() > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg px-4 py-2">
                  <p className="text-sm text-yellow-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {getExpiringCertifications()} expiring soon
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedModule ? (
        /* Module View */
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => {
              setSelectedModule(null);
              setActiveLesson(null);
            }}
            className="text-gray-400 hover:text-white mb-6"
          >
            ← Back to modules
          </button>
          
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className={`bg-gradient-to-r ${selectedModule.color} p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <selectedModule.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedModule.title}</h2>
                    <p className="text-white/80">{selectedModule.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/80">Progress</p>
                  <p className="text-3xl font-bold text-white">{Math.round(getModuleProgress(selectedModule.id))}%</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-400">Duration</span>
                  </div>
                  <p className="text-xl font-semibold text-white">{selectedModule.duration} min</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-400">Pass Score</span>
                  </div>
                  <p className="text-xl font-semibold text-white">{selectedModule.requiredScore}%</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-400">Certificate</span>
                  </div>
                  <p className="text-xl font-semibold text-white">{selectedModule.certification ? 'Yes' : 'No'}</p>
                </div>
              </div>
              
              {/* Lessons */}
              <h3 className="text-lg font-semibold text-white mb-4">Lessons</h3>
              <div className="space-y-3">
                {selectedModule.lessons.map((lesson, index) => {
                  const progress = userProgress.find(p => p.moduleId === selectedModule.id);
                  const isCompleted = progress?.completedLessons.includes(lesson.id);
                  const isActive = activeLesson?.id === lesson.id;
                  
                  return (
                    <div
                      key={lesson.id}
                      className={`bg-gray-900 rounded-lg p-4 border ${
                        isActive ? 'border-purple-500' : 'border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-green-600' : isActive ? 'bg-purple-600' : 'bg-gray-700'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : (
                              <span className="text-white font-medium">{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{lesson.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span className="capitalize">{lesson.type}</span>
                              <span>•</span>
                              <span>{lesson.duration} min</span>
                            </div>
                          </div>
                        </div>
                        {!isCompleted && (
                          <button
                            onClick={() => setActiveLesson(lesson)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            {isActive ? 'Continue' : 'Start'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Active Lesson Content */}
              {activeLesson && (
                <div className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4">{activeLesson.title}</h3>
                  <p className="text-gray-300 mb-6">{activeLesson.content}</p>
                  
                  {activeLesson.type === 'video' && (
                    <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center mb-6">
                      <PlayCircle className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                  
                  {activeLesson.type === 'quiz' && (
                    <div className="space-y-4 mb-6">
                      <p className="text-sm text-gray-400">Sample quiz questions would appear here</p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => completeLesson(activeLesson.id, 90)}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Complete Lesson
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Modules List */
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <p className="text-3xl font-bold text-white">{getTotalCertifications()}</p>
              <p className="text-sm text-gray-400">Certifications Earned</p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-blue-500" />
                <span className="text-xs text-gray-500">Time</span>
              </div>
              <p className="text-3xl font-bold text-white">12.5</p>
              <p className="text-sm text-gray-400">Hours Completed</p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <span className="text-xs text-gray-500">Score</span>
              </div>
              <p className="text-3xl font-bold text-white">92%</p>
              <p className="text-sm text-gray-400">Average Score</p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <Star className="w-8 h-8 text-purple-500" />
                <span className="text-xs text-gray-500">Rank</span>
              </div>
              <p className="text-3xl font-bold text-white">#3</p>
              <p className="text-sm text-gray-400">In Your Facility</p>
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterCategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              All Modules
            </button>
            {['basics', 'safety', 'quality', 'compliance', 'advanced'].map(category => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  filterCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingModules
              .filter(module => filterCategory === 'all' || module.category === filterCategory)
              .map(module => {
                const progress = getModuleProgress(module.id);
                const isUnlocked = isModuleUnlocked(module);
                const userProg = userProgress.find(p => p.moduleId === module.id);
                const isCertified = userProg?.certified || false;
                
                return (
                  <div
                    key={module.id}
                    className={`bg-gray-800 rounded-xl border border-gray-700 overflow-hidden ${
                      !isUnlocked ? 'opacity-60' : ''
                    }`}
                  >
                    <div className={`bg-gradient-to-r ${module.color} p-4`}>
                      <div className="flex items-center justify-between">
                        <module.icon className="w-8 h-8 text-white" />
                        {!isUnlocked && <Lock className="w-5 h-5 text-white/60" />}
                        {isCertified && <Award className="w-5 h-5 text-white" />}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-2">{module.title}</h3>
                      <p className="text-sm text-gray-400 mb-4">{module.description}</p>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Duration</span>
                          <span className="text-white">{module.duration} min</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Lessons</span>
                          <span className="text-white">{module.lessons.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Pass Score</span>
                          <span className="text-white">{module.requiredScore}%</span>
                        </div>
                      </div>
                      
                      {progress > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-500">Progress</span>
                            <span className="text-white">{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {module.prerequisites && module.prerequisites.length > 0 && !isUnlocked && (
                        <p className="text-xs text-yellow-400 mb-4">
                          Requires: {module.prerequisites.join(', ')}
                        </p>
                      )}
                      
                      <button
                        onClick={() => startModule(module)}
                        disabled={!isUnlocked}
                        className={`w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                          isUnlocked
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isCertified ? 'Review' : progress > 0 ? 'Continue' : 'Start'}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
          
          {/* Certificates Section */}
          {certificates.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-white mb-6">Your Certificates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map(cert => {
                  const module = trainingModules.find(m => m.id === cert.moduleId);
                  if (!module) return null;
                  
                  return (
                    <div key={cert.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Award className="w-8 h-8 text-yellow-500" />
                          <div>
                            <h3 className="font-semibold text-white">{module.title}</h3>
                            <p className="text-sm text-gray-400">Certificate of Completion</p>
                          </div>
                        </div>
                        <button
                          onClick={() => downloadCertificate(cert)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Download className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Issued</span>
                          <p className="text-white">{cert.issuedDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Expires</span>
                          <p className="text-white">{cert.expiresDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Score</span>
                          <p className="text-white">{cert.score}%</p>
                        </div>
                        <div>
                          <span className="text-gray-500">ID</span>
                          <p className="text-white font-mono text-xs">{cert.verificationCode}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}