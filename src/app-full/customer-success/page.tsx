'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Trophy,
  Target,
  TrendingUp,
  BookOpen,
  Award,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  BarChart3,
  Users,
  Zap,
  MessageSquare,
  Video,
  FileText,
  Download,
  ChevronRight,
  Star,
  Flag,
  Activity,
  Lightbulb,
  Heart
} from 'lucide-react';
import Link from 'next/link';

interface HealthScore {
  score: number;
  trend: 'up' | 'down' | 'stable';
  factors: {
    usage: number;
    engagement: number;
    satisfaction: number;
    adoption: number;
  };
}

interface Training {
  id: string;
  title: string;
  category: string;
  duration: string;
  progress: number;
  completed: boolean;
  certificateAvailable: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedDate?: Date;
  reward?: string;
}

export default function CustomerSuccessPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'overview' | 'training' | 'milestones' | 'resources'>('overview');

  // Mock data
  const healthScore: HealthScore = {
    score: 82,
    trend: 'up',
    factors: {
      usage: 90,
      engagement: 75,
      satisfaction: 88,
      adoption: 85
    }
  };

  const trainings: Training[] = [
    {
      id: '1',
      title: 'Getting Started with Vibelux',
      category: 'Fundamentals',
      duration: '30 min',
      progress: 100,
      completed: true,
      certificateAvailable: true
    },
    {
      id: '2',
      title: 'Advanced LED Design Techniques',
      category: 'Advanced',
      duration: '45 min',
      progress: 75,
      completed: false,
      certificateAvailable: false
    },
    {
      id: '3',
      title: 'Team Collaboration Best Practices',
      category: 'Collaboration',
      duration: '20 min',
      progress: 0,
      completed: false,
      certificateAvailable: false
    },
    {
      id: '4',
      title: 'API Integration Guide',
      category: 'Developer',
      duration: '60 min',
      progress: 0,
      completed: false,
      certificateAvailable: false
    }
  ];

  const milestones: Milestone[] = [
    {
      id: '1',
      title: 'First Project Created',
      description: 'Create your first LED design project',
      completed: true,
      completedDate: new Date('2024-01-05'),
      reward: 'Welcome Badge'
    },
    {
      id: '2',
      title: 'Team Player',
      description: 'Invite 3 team members to collaborate',
      completed: true,
      completedDate: new Date('2024-01-10'),
      reward: 'Collaboration Badge'
    },
    {
      id: '3',
      title: 'Power User',
      description: 'Complete 10 projects successfully',
      completed: false,
      reward: 'Power User Badge + 1 Month Free'
    },
    {
      id: '4',
      title: 'Integration Master',
      description: 'Connect 3 third-party integrations',
      completed: false,
      reward: 'Integration Badge'
    }
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'Weekly Success Check-in',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      type: 'meeting',
      duration: '30 min'
    },
    {
      id: '2',
      title: 'Advanced Training Webinar',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      type: 'webinar',
      duration: '1 hour'
    }
  ];

  const successMetrics = {
    projectsCompleted: 27,
    teamMembers: 5,
    apiCallsThisMonth: 12450,
    avgResponseTime: 230,
    supportTicketsResolved: 8,
    npsScore: 9
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-600/20 border-green-600/30';
    if (score >= 60) return 'bg-yellow-600/20 border-yellow-600/30';
    return 'bg-red-600/20 border-red-600/30';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Customer Success Center</h1>
        <p className="text-gray-400">Track your progress, access training, and maximize your Vibelux experience</p>
      </div>

      {/* Health Score Card */}
      <div className={`mb-8 p-6 rounded-xl border ${getHealthScoreBg(healthScore.score)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Account Health Score</p>
            <div className="flex items-center gap-3">
              <span className={`text-5xl font-bold ${getHealthScoreColor(healthScore.score)}`}>
                {healthScore.score}
              </span>
              <div className="flex items-center gap-1">
                {healthScore.trend === 'up' ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : healthScore.trend === 'down' ? (
                  <TrendingUp className="w-5 h-5 text-red-400 rotate-180" />
                ) : (
                  <Activity className="w-5 h-5 text-gray-400" />
                )}
                <span className={`text-sm ${
                  healthScore.trend === 'up' ? 'text-green-400' :
                  healthScore.trend === 'down' ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {healthScore.trend === 'up' ? 'Improving' :
                   healthScore.trend === 'down' ? 'Declining' :
                   'Stable'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-400">Usage</p>
              <p className="text-xl font-bold text-white">{healthScore.factors.usage}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Engagement</p>
              <p className="text-xl font-bold text-white">{healthScore.factors.engagement}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Satisfaction</p>
              <p className="text-xl font-bold text-white">{healthScore.factors.satisfaction}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Adoption</p>
              <p className="text-xl font-bold text-white">{healthScore.factors.adoption}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-white border-b-2 border-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('training')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'training'
              ? 'text-white border-b-2 border-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Training & Certification
        </button>
        <button
          onClick={() => setActiveTab('milestones')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'milestones'
              ? 'text-white border-b-2 border-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Milestones & Rewards
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'resources'
              ? 'text-white border-b-2 border-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Resources
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Success Metrics */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Success Metrics</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Flag className="w-5 h-5 text-gray-400" />
                    <span className="text-xs text-green-400">+23%</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{successMetrics.projectsCompleted}</p>
                  <p className="text-sm text-gray-400">Projects Completed</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-xs text-green-400">+2</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{successMetrics.teamMembers}</p>
                  <p className="text-sm text-gray-400">Team Members</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="w-5 h-5 text-gray-400" />
                    <span className="text-xs text-gray-400">This month</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{successMetrics.apiCallsThisMonth.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">API Calls</p>
                </div>
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                Recommended Actions
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-white font-medium">Complete Advanced Training</p>
                    <p className="text-sm text-gray-400">You're 75% through the Advanced LED Design course</p>
                  </div>
                  <button className="text-green-400 hover:text-green-300 text-sm">
                    Continue →
                  </button>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                  <Circle className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-white font-medium">Integrate with Quickbooks</p>
                    <p className="text-sm text-gray-400">Streamline your billing and invoicing workflow</p>
                  </div>
                  <button className="text-green-400 hover:text-green-300 text-sm">
                    Set up →
                  </button>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                  <Circle className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-white font-medium">Schedule Quarterly Review</p>
                    <p className="text-sm text-gray-400">Meet with your Success Manager to plan Q2</p>
                  </div>
                  <button className="text-green-400 hover:text-green-300 text-sm">
                    Schedule →
                  </button>
                </div>
              </div>
            </div>

            {/* Success Timeline */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Success Journey</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Onboarding Completed</p>
                    <p className="text-sm text-gray-400">January 5, 2024</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">First Successful Project</p>
                    <p className="text-sm text-gray-400">January 12, 2024</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Power User Status</p>
                    <p className="text-sm text-gray-400">In Progress - 7/10 projects completed</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Enterprise Upgrade</p>
                    <p className="text-sm text-gray-400">Goal for Q2 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Success Manager */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Success Manager</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Sarah Johnson</p>
                  <p className="text-sm text-gray-400">Customer Success Manager</p>
                </div>
              </div>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule Meeting
                </button>
                <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Available Mon-Fri, 9am-6pm PST
              </p>
            </div>

            {/* Upcoming Events */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-3">
                    {event.type === 'meeting' ? (
                      <Users className="w-5 h-5 text-blue-400 mt-0.5" />
                    ) : (
                      <Video className="w-5 h-5 text-purple-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-gray-400">
                        {event.date.toLocaleDateString()} • {event.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/calendar"
                className="mt-4 text-sm text-green-400 hover:text-green-300 flex items-center gap-1"
              >
                View Full Calendar
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Quick Links */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link
                  href="/help"
                  className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Knowledge Base</span>
                </Link>
                <Link
                  href="/support"
                  className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Support Tickets</span>
                </Link>
                <Link
                  href="/community"
                  className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Community Forum</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'training' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400">
              Complete training courses to earn certifications and unlock new features
            </p>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2">
              <Award className="w-4 h-4" />
              My Certificates
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {trainings.map(training => (
              <div key={training.id} className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{training.title}</h3>
                    <p className="text-sm text-gray-400">{training.category} • {training.duration}</p>
                  </div>
                  {training.completed && (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{training.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${training.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {training.completed ? (
                    <>
                      {training.certificateAvailable && (
                        <button className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2">
                          <Download className="w-4 h-4" />
                          Certificate
                        </button>
                      )}
                      <button className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
                        Review
                      </button>
                    </>
                  ) : (
                    <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                      {training.progress > 0 ? 'Continue' : 'Start'} Training
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'milestones' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Achievement Progress</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {milestones.map(milestone => (
                <div
                  key={milestone.id}
                  className={`p-4 rounded-lg border ${
                    milestone.completed
                      ? 'bg-green-900/20 border-green-600/30'
                      : 'bg-gray-700 border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Trophy className={`w-6 h-6 ${
                      milestone.completed ? 'text-green-400' : 'text-gray-400'
                    }`} />
                    {milestone.completed && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                  <h4 className="text-white font-medium mb-1">{milestone.title}</h4>
                  <p className="text-sm text-gray-400 mb-2">{milestone.description}</p>
                  {milestone.reward && (
                    <p className="text-sm text-green-400">
                      Reward: {milestone.reward}
                    </p>
                  )}
                  {milestone.completedDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      Completed {milestone.completedDate.toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Leaderboard</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gold-900/20 border border-gold-600/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🥇</span>
                  <div>
                    <p className="text-white font-medium">Your Team</p>
                    <p className="text-sm text-gray-400">127 points this month</p>
                  </div>
                </div>
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🥈</span>
                  <div>
                    <p className="text-white font-medium">Team Alpha</p>
                    <p className="text-sm text-gray-400">115 points this month</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🥉</span>
                  <div>
                    <p className="text-white font-medium">Team Beta</p>
                    <p className="text-sm text-gray-400">98 points this month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/resources/best-practices"
            className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors"
          >
            <BookOpen className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Best Practices</h3>
            <p className="text-sm text-gray-400">
              Industry-leading strategies for LED cultivation success
            </p>
          </Link>

          <Link
            href="/resources/case-studies"
            className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors"
          >
            <FileText className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Case Studies</h3>
            <p className="text-sm text-gray-400">
              Learn from successful implementations across industries
            </p>
          </Link>

          <Link
            href="/resources/templates"
            className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors"
          >
            <Download className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Templates</h3>
            <p className="text-sm text-gray-400">
              Ready-to-use project templates and configurations
            </p>
          </Link>

          <Link
            href="/resources/webinars"
            className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors"
          >
            <Video className="w-8 h-8 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Webinars</h3>
            <p className="text-sm text-gray-400">
              Live and recorded training sessions with experts
            </p>
          </Link>

          <Link
            href="/resources/roi-calculator"
            className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors"
          >
            <BarChart3 className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">ROI Calculator</h3>
            <p className="text-sm text-gray-400">
              Calculate your return on investment with Vibelux
            </p>
          </Link>

          <Link
            href="/resources/glossary"
            className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors"
          >
            <BookOpen className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Glossary</h3>
            <p className="text-sm text-gray-400">
              LED cultivation terms and definitions explained
            </p>
          </Link>
        </div>
      )}

      {/* NPS Survey */}
      <div className="mt-8 bg-blue-900/20 border border-blue-600/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Heart className="w-6 h-6 text-blue-400 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">How are we doing?</h3>
            <p className="text-sm text-gray-300 mb-4">
              Your feedback helps us improve. How likely are you to recommend Vibelux to a colleague?
            </p>
            <div className="flex items-center gap-2">
              {[...Array(11)].map((_, i) => (
                <button
                  key={i}
                  className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Not likely</span>
              <span>Very likely</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}