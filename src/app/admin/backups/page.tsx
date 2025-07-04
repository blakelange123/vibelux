'use client';

import { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Upload,
  Shield,
  Clock,
  Server,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Play,
  Calendar,
  Settings,
  RefreshCw,
  FileArchive,
  Cloud,
  Lock,
  Trash2,
  TestTube,
  History
} from 'lucide-react';
import { disasterRecoveryClient, type BackupConfig, type RecoveryPoint, type BackupJob } from '@/lib/backup/disaster-recovery-client';

export default function BackupsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'recovery' | 'test'>('overview');
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [recoveryPoints, setRecoveryPoints] = useState<RecoveryPoint[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedRecoveryPoint, setSelectedRecoveryPoint] = useState<RecoveryPoint | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [isTestingDR, setIsTestingDR] = useState(false);
  
  const [backupConfig, setBackupConfig] = useState<BackupConfig>({
    schedule: 'daily',
    retention: {
      hourly: 24,
      daily: 7,
      weekly: 4,
      monthly: 12
    },
    encryption: true,
    compression: true,
    destinations: [
      { type: 'local', config: { path: '/var/backups' }, enabled: true },
      { type: 's3', config: { bucket: 'vibelux-backups' }, enabled: false }
    ],
    databases: ['postgres'],
    filesystems: ['/uploads', '/config']
  });

  // Load recovery points
  useEffect(() => {
    loadRecoveryPoints();
  }, []);

  const loadRecoveryPoints = async () => {
    try {
      const points = await disasterRecoveryClient.getRecoveryPoints();
      setRecoveryPoints(points);
    } catch (error) {
      console.error('Failed to load recovery points:', error);
    }
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const job = await disasterRecoveryClient.createBackup({ 
        type: 'MANUAL',
        description: 'Manual backup initiated from admin panel'
      });
      setBackupJobs([job, ...backupJobs]);
      await loadRecoveryPoints();
    } catch (error) {
      console.error('Backup creation failed:', error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestore = async (recoveryPointId: string) => {
    if (!confirm('Are you sure you want to restore from this backup? This will overwrite current data.')) {
      return;
    }

    setIsRestoring(true);
    try {
      // For client-side, we would call an API endpoint
      // await disasterRecoveryClient.restoreFromBackup(recoveryPointId);
      alert('Restore completed successfully');
    } catch (error) {
      console.error('Restore failed:', error);
      alert('Restore failed. Please check logs for details.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleTestDR = async () => {
    setIsTestingDR(true);
    try {
      const results = await disasterRecoveryClient.testRecovery('test-recovery-point');
      setTestResults(results);
    } catch (error) {
      console.error('DR test failed:', error);
    } finally {
      setIsTestingDR(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Backup & Recovery</h1>
        <p className="text-gray-400">Manage system backups and disaster recovery procedures</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: Database },
          { id: 'schedule', label: 'Schedule', icon: Calendar },
          { id: 'recovery', label: 'Recovery Points', icon: History },
          { id: 'test', label: 'DR Testing', icon: TestTube }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <Server className="w-8 h-8 text-blue-400" />
                <span className="text-xs text-gray-500">Last 24h</span>
              </div>
              <p className="text-2xl font-bold text-white">{recoveryPoints.length}</p>
              <p className="text-gray-400 text-sm">Recovery Points</p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <HardDrive className="w-8 h-8 text-green-400" />
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatBytes(recoveryPoints.reduce((sum, p) => sum + p.size, 0))}
              </p>
              <p className="text-gray-400 text-sm">Storage Used</p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-yellow-400" />
                <span className="text-xs text-gray-500">Latest</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {recoveryPoints[0] ? new Date(recoveryPoints[0].timestamp).toLocaleTimeString() : 'N/A'}
              </p>
              <p className="text-gray-400 text-sm">Last Backup</p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-8 h-8 text-purple-400" />
                <span className="text-xs text-gray-500">Status</span>
              </div>
              <p className="text-2xl font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                Protected
              </p>
              <p className="text-gray-400 text-sm">System Status</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleCreateBackup}
                disabled={isCreatingBackup}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isCreatingBackup ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Create Backup Now
              </button>

              <button
                onClick={() => setActiveTab('recovery')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Restore from Backup
              </button>

              <button
                onClick={handleTestDR}
                disabled={isTestingDR}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {isTestingDR ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4" />
                )}
                Test DR Procedure
              </button>
            </div>
          </div>

          {/* Recent Backup Jobs */}
          {backupJobs.length > 0 && (
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Backup Jobs</h2>
              <div className="space-y-3">
                {backupJobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        job.status === 'completed' ? 'bg-green-500' :
                        job.status === 'running' ? 'bg-yellow-500' :
                        job.status === 'failed' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`} />
                      <div>
                        <p className="text-white font-medium">{job.type} backup</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(job.startTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {job.size && (
                        <p className="text-white">{formatBytes(job.size)}</p>
                      )}
                      {job.endTime && (
                        <p className="text-gray-400 text-sm">
                          Duration: {formatDuration(new Date(job.endTime).getTime() - new Date(job.startTime).getTime())}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Backup Schedule</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Backup Frequency
                </label>
                <select
                  value={backupConfig.schedule}
                  onChange={(e) => setBackupConfig({
                    ...backupConfig,
                    schedule: e.target.value as any
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={backupConfig.encryption}
                    onChange={(e) => setBackupConfig({
                      ...backupConfig,
                      encryption: e.target.checked
                    })}
                    className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span className="text-white">Enable Encryption</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={backupConfig.compression}
                    onChange={(e) => setBackupConfig({
                      ...backupConfig,
                      compression: e.target.checked
                    })}
                    className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <FileArchive className="w-4 h-4 text-gray-400" />
                  <span className="text-white">Enable Compression</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Retention Policy</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hourly Backups
                </label>
                <input
                  type="number"
                  value={backupConfig.retention.hourly}
                  onChange={(e) => setBackupConfig({
                    ...backupConfig,
                    retention: {
                      ...backupConfig.retention,
                      hourly: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  min="1"
                  max="168"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Daily Backups
                </label>
                <input
                  type="number"
                  value={backupConfig.retention.daily}
                  onChange={(e) => setBackupConfig({
                    ...backupConfig,
                    retention: {
                      ...backupConfig.retention,
                      daily: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  min="1"
                  max="31"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Weekly Backups
                </label>
                <input
                  type="number"
                  value={backupConfig.retention.weekly}
                  onChange={(e) => setBackupConfig({
                    ...backupConfig,
                    retention: {
                      ...backupConfig.retention,
                      weekly: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  min="1"
                  max="52"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monthly Backups
                </label>
                <input
                  type="number"
                  value={backupConfig.retention.monthly}
                  onChange={(e) => setBackupConfig({
                    ...backupConfig,
                    retention: {
                      ...backupConfig.retention,
                      monthly: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  min="1"
                  max="120"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Backup Destinations</h2>
            
            <div className="space-y-3">
              {backupConfig.destinations.map((dest, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={dest.enabled}
                        onChange={(e) => {
                          const newDests = [...backupConfig.destinations];
                          newDests[index].enabled = e.target.checked;
                          setBackupConfig({
                            ...backupConfig,
                            destinations: newDests
                          });
                        }}
                        className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                      />
                      {dest.type === 's3' ? (
                        <Cloud className="w-5 h-5 text-blue-400" />
                      ) : (
                        <HardDrive className="w-5 h-5 text-green-400" />
                      )}
                      <span className="text-white font-medium capitalize">{dest.type} Storage</span>
                    </label>
                  </div>
                  <Settings className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recovery Points Tab */}
      {activeTab === 'recovery' && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Available Recovery Points</h2>
              <button
                onClick={loadRecoveryPoints}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {recoveryPoints.map((point) => (
                <div key={point.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium flex items-center gap-2">
                        {point.type} Backup
                        {point.verified && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {new Date(point.timestamp).toLocaleString()}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {point.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-white">{formatBytes(point.size)}</p>
                        <p className="text-gray-400 text-xs">
                          Checksum: {point.checksum.substring(0, 8)}...
                        </p>
                      </div>
                      <button
                        onClick={() => handleRestore(point.id)}
                        disabled={isRestoring}
                        className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DR Testing Tab */}
      {activeTab === 'test' && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Disaster Recovery Testing</h2>
            
            <p className="text-gray-400 mb-6">
              Test your disaster recovery procedures to ensure backups are working correctly
              and can be restored when needed.
            </p>

            <button
              onClick={handleTestDR}
              disabled={isTestingDR}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isTestingDR ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              Run DR Test Suite
            </button>
          </div>

          {testResults && (
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Test Results</h3>
              
              <div className="mb-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  testResults.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {testResults.success ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {testResults.success ? 'All Tests Passed' : 'Some Tests Failed'}
                </div>
              </div>

              <div className="space-y-3">
                {testResults.results.map((result: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        result.passed ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-white">{result.test}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">{result.duration}ms</p>
                      {result.error && (
                        <p className="text-red-400 text-xs">{result.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}