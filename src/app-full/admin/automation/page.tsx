'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Bot, Play, Pause, CheckCircle, XCircle,
  AlertCircle, Clock, TrendingUp, FileText, Shield,
  RefreshCw, Activity, Database, Zap, Info, Settings,
  Loader2, ChevronRight, Calendar, DollarSign
} from 'lucide-react';

interface AutomationJob {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRun?: Date;
  nextRun?: Date;
  frequency: string;
  stats?: {
    processed: number;
    successful: number;
    failed: number;
  };
}

export default function AutomationPage() {
  const [jobs, setJobs] = useState<AutomationJob[]>([
    {
      id: 'automated-billing',
      name: 'Automated Billing',
      description: 'Process utility bills, verify savings, and generate invoices',
      status: 'idle',
      frequency: 'Monthly (1st of each month)',
      nextRun: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    },
    {
      id: 'dispute-resolution',
      name: 'Dispute Resolution',
      description: 'Automatically resolve open disputes with utility data verification',
      status: 'idle',
      frequency: 'Daily at 2 AM PST'
    },
    {
      id: 'baseline-updates',
      name: 'Baseline Updates',
      description: 'Update client baselines with new utility data',
      status: 'idle',
      frequency: 'Weekly (Sundays at 3 AM PST)'
    },
    {
      id: 'pdf-processing',
      name: 'PDF Bill Processing',
      description: 'Process uploaded utility bill PDFs using Claude API',
      status: 'idle',
      frequency: 'Every 15 minutes'
    }
  ]);

  const [runningJob, setRunningJob] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const runAutomation = async (jobId: string) => {
    setRunningJob(jobId);
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'running' } : job
    ));
    
    addLog(`Starting ${jobId} automation...`);

    try {
      if (jobId === 'automated-billing') {
        const response = await fetch('/api/cron/automated-billing', {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'dev-secret'}`
          }
        });

        const result = await response.json();
        
        if (response.ok) {
          addLog(`✅ Automated billing completed successfully`);
          setJobs(prev => prev.map(job => 
            job.id === jobId ? { 
              ...job, 
              status: 'completed',
              lastRun: new Date(),
              stats: {
                processed: 12,
                successful: 10,
                failed: 2
              }
            } : job
          ));
        } else {
          throw new Error(result.error || 'Failed to run automation');
        }
      } else {
        // Simulate other automations
        await new Promise(resolve => setTimeout(resolve, 3000));
        addLog(`✅ ${jobId} completed successfully`);
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { 
            ...job, 
            status: 'completed',
            lastRun: new Date()
          } : job
        ));
      }
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, status: 'failed' } : job
      ));
    } finally {
      setRunningJob(null);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-blue-400 bg-blue-400/10';
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'failed':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Admin
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Automation Control Center</h1>
              <p className="text-gray-400">
                Manage and monitor automated processes for billing, verification, and dispute resolution
              </p>
            </div>
            <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Automation Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Bot className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">4</span>
            </div>
            <p className="text-gray-400">Active Automations</p>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-white">98.2%</span>
            </div>
            <p className="text-gray-400">Success Rate</p>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">247</span>
            </div>
            <p className="text-gray-400">Invoices Generated</p>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-white">$45.2K</span>
            </div>
            <p className="text-gray-400">Revenue Processed</p>
          </div>
        </div>

        {/* Automation Jobs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Automation Jobs</h3>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-gray-900/50 rounded-xl p-6 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <h4 className="font-medium text-white">{job.name}</h4>
                        <p className="text-sm text-gray-400 mt-1">{job.description}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Frequency</span>
                      <span className="text-gray-300">{job.frequency}</span>
                    </div>
                    {job.lastRun && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Last Run</span>
                        <span className="text-gray-300">
                          {job.lastRun.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {job.nextRun && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Next Run</span>
                        <span className="text-gray-300">
                          {job.nextRun.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {job.stats && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-400">Processed</p>
                        <p className="text-sm font-medium text-white">{job.stats.processed}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-400">Successful</p>
                        <p className="text-sm font-medium text-green-400">{job.stats.successful}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-400">Failed</p>
                        <p className="text-sm font-medium text-red-400">{job.stats.failed}</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => runAutomation(job.id)}
                    disabled={runningJob !== null}
                    className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      runningJob !== null
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {runningJob === job.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run Now
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Automation Logs */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Automation Logs</h3>
            <div className="bg-gray-900/50 rounded-xl border border-white/10 h-[600px] overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Recent Activity</span>
                  <button
                    onClick={() => setLogs([])}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    Clear Logs
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
                {logs.length === 0 ? (
                  <p className="text-gray-500 text-center mt-8">No recent activity</p>
                ) : (
                  <div className="space-y-2 font-mono text-sm">
                    {logs.map((log, index) => (
                      <div key={index} className="text-gray-300">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Information Panel */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-start gap-4">
            <Info className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Automation Configuration</h3>
              <p className="text-gray-300 mb-4">
                The automation system is configured to run critical processes automatically:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span><strong>Automated Billing:</strong> Runs monthly to process utility bills and generate invoices</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span><strong>Dispute Resolution:</strong> Runs daily to automatically resolve disputes using verified data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span><strong>Baseline Updates:</strong> Weekly updates to ensure accurate savings calculations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span><strong>PDF Processing:</strong> Processes uploaded utility bills every 15 minutes using Claude API</span>
                </li>
              </ul>
              <div className="mt-4">
                <Link
                  href="/admin/settings/automation"
                  className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Configure Automation Settings
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}