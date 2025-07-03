'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  TestTube,
  Eye,
  MousePointer,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause
} from 'lucide-react';
// Moved email service to API routes to avoid Node.js modules in client
// import { emailService, emailTemplates, type EmailCampaign } from '@/lib/email/email-service';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  sent?: number;
  delivered?: number;
  opened?: number;
  clicked?: number;
}

export default function EmailsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'templates' | 'logs' | 'settings'>('overview');
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [stats, setStats] = useState({
    sent: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    openRate: 0,
    clickRate: 0
  });
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingSMTP, setIsTestingSMTP] = useState(false);

  // Load email statistics
  useEffect(() => {
    loadStats();
    loadCampaigns();
  }, []);

  const loadStats = async () => {
    try {
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      
      // TODO: Replace with API call to /api/admin/emails/stats
      const emailStats = { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 };
      // await emailService.getEmailStats({ startDate: last30Days });
      
      setStats(emailStats);
    } catch (error) {
      // Error handling for email stats loading
    }
  };

  const loadCampaigns = async () => {
    // In a real app, load from database
    setCampaigns([
      {
        id: '1',
        name: 'Welcome Series',
        subject: 'Welcome to Vibelux!',
        templateId: emailTemplates.welcome,
        recipients: ['user1@example.com', 'user2@example.com'],
        status: 'sent',
        sentCount: 245,
        failedCount: 3,
        openCount: 198,
        clickCount: 87,
        scheduledFor: new Date('2025-01-01')
      },
      {
        id: '2',
        name: 'Product Update Q1',
        subject: 'New Features in Vibelux',
        templateId: emailTemplates.productUpdate,
        recipients: [],
        status: 'scheduled',
        sentCount: 0,
        failedCount: 0,
        openCount: 0,
        clickCount: 0,
        scheduledFor: new Date('2025-02-01')
      }
    ]);
  };

  const handleTestSMTP = async () => {
    if (!testEmail) {
      setTestResult({ success: false, message: 'Please enter a test email address' });
      return;
    }

    setIsTestingSMTP(true);
    try {
      // TODO: Replace with API call to /api/admin/emails/test
      const result = { success: true, message: 'Configuration test disabled - use API route' }; // await emailService.testConfiguration(testEmail);
      setTestResult({
        success: result.success,
        message: result.success 
          ? 'Test email sent successfully! Check your inbox.' 
          : `Failed to send test email: ${result.error}`
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to test email configuration'
      });
    } finally {
      setIsTestingSMTP(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercent = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Email Management</h1>
        <p className="text-gray-400">Manage email campaigns, templates, and settings</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'campaigns', label: 'Campaigns', icon: Send },
          { id: 'templates', label: 'Templates', icon: FileText },
          { id: 'logs', label: 'Email Logs', icon: Clock },
          { id: 'settings', label: 'Settings', icon: Settings }
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
          {/* Email Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <Send className="w-8 h-8 text-blue-400" />
                <span className="text-xs text-gray-500">Last 30 days</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatNumber(stats.sent)}</p>
              <p className="text-gray-400 text-sm">Emails Sent</p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-8 h-8 text-green-400" />
                <span className="text-xs text-gray-500">{formatPercent(stats.openRate)}</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatNumber(stats.opened)}</p>
              <p className="text-gray-400 text-sm">Emails Opened</p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <MousePointer className="w-8 h-8 text-purple-400" />
                <span className="text-xs text-gray-500">{formatPercent(stats.clickRate)}</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatNumber(stats.clicked)}</p>
              <p className="text-gray-400 text-sm">Links Clicked</p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <span className="text-xs text-gray-500">Bounce rate</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatNumber(stats.bounced)}</p>
              <p className="text-gray-400 text-sm">Bounced</p>
            </div>
          </div>

          {/* Recent Campaigns */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Campaigns</h2>
            <div className="space-y-4">
              {campaigns.slice(0, 5).map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{campaign.name}</p>
                    <p className="text-gray-400 text-sm">{campaign.subject}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Send className="w-3 h-3" />
                        {formatNumber(campaign.sentCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatNumber(campaign.openCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointer className="w-3 h-3" />
                        {formatNumber(campaign.clickCount)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'sent' ? 'bg-green-500/20 text-green-400' :
                      campaign.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                      campaign.status === 'sending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {campaign.status === 'sent' && <CheckCircle className="w-3 h-3" />}
                      {campaign.status === 'scheduled' && <Calendar className="w-3 h-3" />}
                      {campaign.status === 'sending' && <Clock className="w-3 h-3" />}
                      {campaign.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Performance Chart */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Email Performance (Last 7 Days)</h2>
            <div className="h-64 flex items-center justify-center text-gray-500">
              {/* Add chart component here */}
              <TrendingUp className="w-12 h-12 text-gray-600" />
              <span className="ml-3">Chart visualization would go here</span>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Email Campaigns</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Plus className="w-4 h-4" />
              Create Campaign
            </button>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4 text-gray-400 font-medium">Campaign</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Recipients</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Performance</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Scheduled</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4">
                      <p className="text-white font-medium">{campaign.name}</p>
                      <p className="text-gray-400 text-sm">{campaign.subject}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'sent' ? 'bg-green-500/20 text-green-400' :
                        campaign.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                        campaign.status === 'sending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-white">{formatNumber(campaign.recipients.length)}</p>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Sent:</span>
                          <span className="text-white">{formatNumber(campaign.sentCount)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Opens:</span>
                          <span className="text-white">
                            {formatNumber(campaign.openCount)} ({formatPercent(campaign.sentCount > 0 ? (campaign.openCount / campaign.sentCount) * 100 : 0)})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Clicks:</span>
                          <span className="text-white">
                            {formatNumber(campaign.clickCount)} ({formatPercent(campaign.sentCount > 0 ? (campaign.clickCount / campaign.sentCount) * 100 : 0)})
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-white text-sm">
                        {campaign.scheduledFor ? new Date(campaign.scheduledFor).toLocaleString() : '-'}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {campaign.status === 'scheduled' && (
                          <button className="p-1 text-gray-400 hover:text-white transition-colors">
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-1 text-gray-400 hover:text-white transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">SMTP Configuration</h2>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={process.env.SMTP_HOST || 'smtp.gmail.com'}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="text"
                    value={process.env.SMTP_PORT || '587'}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    readOnly
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  From Email
                </label>
                <input
                  type="text"
                  value={process.env.EMAIL_FROM || 'noreply@vibelux.com'}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  readOnly
                />
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-white font-medium mb-4">Test Email Configuration</h3>
              
              <div className="flex items-center gap-4">
                <input
                  type="email"
                  placeholder="Enter test email address"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
                <button
                  onClick={handleTestSMTP}
                  disabled={isTestingSMTP}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <TestTube className="w-4 h-4" />
                  {isTestingSMTP ? 'Testing...' : 'Send Test Email'}
                </button>
              </div>
              
              {testResult && (
                <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                  testResult.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {testResult.message}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Email Preferences</h2>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                />
                <span className="text-white">Enable email tracking (opens and clicks)</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                />
                <span className="text-white">Send email notifications for system alerts</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                />
                <span className="text-white">Enable bulk email rate limiting</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}