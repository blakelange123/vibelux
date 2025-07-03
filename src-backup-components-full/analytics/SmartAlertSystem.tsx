'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Clock,
  Mail,
  MessageSquare,
  Smartphone,
  Settings,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause
} from 'lucide-react';

interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: 'active_users' | 'conversion_rate' | 'error_rate' | 'revenue' | 'page_load_time' | 'bounce_rate';
  condition: 'above' | 'below' | 'percentage_change' | 'absolute_change';
  threshold: number;
  timeWindow: '5m' | '15m' | '1h' | '24h' | '7d';
  comparison?: 'previous_period' | 'same_day_last_week' | 'baseline';
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  notifications: Array<{
    type: 'email' | 'slack' | 'sms' | 'webhook';
    target: string;
    enabled: boolean;
  }>;
  createdAt: number;
  lastTriggered?: number;
  triggerCount: number;
}

interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  metric: string;
  currentValue: number;
  threshold: number;
  condition: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: number;
  isRead: boolean;
  isResolved: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
  actions?: Array<{
    type: 'acknowledge' | 'resolve' | 'escalate' | 'snooze';
    label: string;
    action: () => void;
  }>;
}

interface SmartAlertSystemProps {
  className?: string;
  showCreateForm?: boolean;
}

export default function SmartAlertSystem({
  className = '',
  showCreateForm = false
}: SmartAlertSystemProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [selectedTab, setSelectedTab] = useState<'alerts' | 'rules'>('alerts');
  const [showRuleForm, setShowRuleForm] = useState(showCreateForm);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate mock alert rules
  const generateMockRules = (): AlertRule[] => {
    return [
      {
        id: 'rule-1',
        name: 'Low Active Users',
        description: 'Alert when active users drop below threshold',
        metric: 'active_users',
        condition: 'below',
        threshold: 100,
        timeWindow: '1h',
        comparison: 'previous_period',
        isActive: true,
        priority: 'high',
        notifications: [
          { type: 'email', target: 'admin@vibelux.com', enabled: true },
          { type: 'slack', target: '#alerts', enabled: true }
        ],
        createdAt: Date.now() - 86400000,
        lastTriggered: Date.now() - 3600000,
        triggerCount: 3
      },
      {
        id: 'rule-2',
        name: 'High Error Rate',
        description: 'Alert when error rate exceeds 5%',
        metric: 'error_rate',
        condition: 'above',
        threshold: 5,
        timeWindow: '15m',
        isActive: true,
        priority: 'critical',
        notifications: [
          { type: 'email', target: 'dev@vibelux.com', enabled: true },
          { type: 'slack', target: '#dev-alerts', enabled: true },
          { type: 'sms', target: '+1234567890', enabled: true }
        ],
        createdAt: Date.now() - 172800000,
        triggerCount: 0
      },
      {
        id: 'rule-3',
        name: 'Conversion Rate Drop',
        description: 'Alert when conversion rate drops by 20%',
        metric: 'conversion_rate',
        condition: 'percentage_change',
        threshold: -20,
        timeWindow: '24h',
        comparison: 'same_day_last_week',
        isActive: true,
        priority: 'medium',
        notifications: [
          { type: 'email', target: 'marketing@vibelux.com', enabled: true }
        ],
        createdAt: Date.now() - 259200000,
        lastTriggered: Date.now() - 86400000,
        triggerCount: 1
      },
      {
        id: 'rule-4',
        name: 'Revenue Spike',
        description: 'Alert when revenue increases significantly',
        metric: 'revenue',
        condition: 'percentage_change',
        threshold: 50,
        timeWindow: '1h',
        comparison: 'previous_period',
        isActive: true,
        priority: 'low',
        notifications: [
          { type: 'slack', target: '#revenue-alerts', enabled: true }
        ],
        createdAt: Date.now() - 345600000,
        triggerCount: 5
      }
    ];
  };

  // Generate mock alerts
  const generateMockAlerts = (rules: AlertRule[]): Alert[] => {
    const alerts: Alert[] = [];
    
    // Generate some recent alerts
    for (let i = 0; i < 10; i++) {
      const rule = rules[Math.floor(Math.random() * rules.length)];
      const severities: Alert['severity'][] = ['info', 'warning', 'error', 'critical'];
      
      alerts.push({
        id: `alert-${i + 1}`,
        ruleId: rule.id,
        ruleName: rule.name,
        metric: rule.metric,
        currentValue: Math.random() * 100,
        threshold: rule.threshold,
        condition: rule.condition,
        severity: severities[Math.floor(Math.random() * severities.length)],
        message: `${rule.name} threshold exceeded`,
        timestamp: Date.now() - Math.random() * 86400000,
        isRead: Math.random() > 0.3,
        isResolved: Math.random() > 0.6,
        resolvedAt: Math.random() > 0.6 ? Date.now() - Math.random() * 3600000 : undefined,
        resolvedBy: Math.random() > 0.6 ? 'admin@vibelux.com' : undefined
      });
    }

    return alerts.sort((a, b) => b.timestamp - a.timestamp);
  };

  useEffect(() => {
    const loadData = () => {
      const rules = generateMockRules();
      const generatedAlerts = generateMockAlerts(rules);
      
      setAlertRules(rules);
      setAlerts(generatedAlerts);
      setIsLoading(false);
    };

    loadData();

    // Simulate real-time alerts
    const interval = setInterval(() => {
      const rules = generateMockRules();
      if (Math.random() > 0.8) { // 20% chance of new alert
        const newAlert = generateMockAlerts(rules).slice(0, 1)[0];
        if (newAlert) {
          newAlert.id = `alert-${Date.now()}`;
          newAlert.timestamp = Date.now();
          newAlert.isRead = false;
          newAlert.isResolved = false;
          setAlerts(prev => [newAlert, ...prev]);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'active_users': return <Users className="w-4 h-4" />;
      case 'conversion_rate': return <TrendingUp className="w-4 h-4" />;
      case 'error_rate': return <XCircle className="w-4 h-4" />;
      case 'revenue': return <DollarSign className="w-4 h-4" />;
      case 'page_load_time': return <Clock className="w-4 h-4" />;
      case 'bounce_rate': return <TrendingDown className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'error': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'info': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-400/10';
      case 'high': return 'text-orange-400 bg-orange-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'slack': return <MessageSquare className="w-4 h-4" />;
      case 'sms': return <Smartphone className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const handleMarkAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, isResolved: true, resolvedAt: Date.now(), resolvedBy: 'current-user' }
        : alert
    ));
  };

  const handleToggleRule = (ruleId: string) => {
    setAlertRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const handleDeleteRule = (ruleId: string) => {
    setAlertRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const unreadAlerts = alerts.filter(alert => !alert.isRead);
  const unresolvedAlerts = alerts.filter(alert => !alert.isResolved);

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-purple-400 animate-pulse" />
            <span className="text-gray-300">Loading alert system...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Smart Alert System</h2>
            {unreadAlerts.length > 0 && (
              <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                {unreadAlerts.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex border border-gray-600 rounded overflow-hidden">
              <button
                onClick={() => setSelectedTab('alerts')}
                className={`px-4 py-2 text-sm ${
                  selectedTab === 'alerts' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                Alerts ({unresolvedAlerts.length})
              </button>
              <button
                onClick={() => setSelectedTab('rules')}
                className={`px-4 py-2 text-sm ${
                  selectedTab === 'rules' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                Rules ({alertRules.filter(r => r.isActive).length})
              </button>
            </div>
            {selectedTab === 'rules' && (
              <button
                onClick={() => setShowRuleForm(true)}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
              >
                <Plus className="w-4 h-4" />
                New Rule
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-400">Critical Alerts</span>
            </div>
            <p className="text-lg font-bold text-white">
              {alerts.filter(a => a.severity === 'critical' && !a.isResolved).length}
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Unread</span>
            </div>
            <p className="text-lg font-bold text-white">{unreadAlerts.length}</p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Settings className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Active Rules</span>
            </div>
            <p className="text-lg font-bold text-white">
              {alertRules.filter(r => r.isActive).length}
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Resolved Today</span>
            </div>
            <p className="text-lg font-bold text-white">
              {alerts.filter(a => a.isResolved && a.resolvedAt && a.resolvedAt > Date.now() - 86400000).length}
            </p>
          </div>
        </div>
      </div>

      {selectedTab === 'alerts' ? (
        /* Alerts Tab */
        <div className="p-6">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border transition-all ${
                  alert.isRead 
                    ? 'border-gray-700 bg-gray-900' 
                    : 'border-purple-500 bg-purple-500/10'
                } ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getMetricIcon(alert.metric)}
                    <div>
                      <h4 className="font-medium text-white">{alert.ruleName}</h4>
                      <p className="text-sm text-gray-400">{alert.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>Current: {alert.currentValue.toFixed(1)}</span>
                    <span>Threshold: {alert.threshold}</span>
                    <span>Condition: {alert.condition}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!alert.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(alert.id)}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                      >
                        Mark Read
                      </button>
                    )}
                    {!alert.isResolved && (
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                      >
                        Resolve
                      </button>
                    )}
                    {alert.isResolved && (
                      <span className="text-xs text-green-400">
                        Resolved by {alert.resolvedBy}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Rules Tab */
        <div className="p-6">
          <div className="space-y-4">
            {alertRules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 bg-gray-900 rounded-lg border border-gray-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getMetricIcon(rule.metric)}
                    <div>
                      <h4 className="font-medium text-white">{rule.name}</h4>
                      <p className="text-sm text-gray-400">{rule.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getPriorityColor(rule.priority)}`}>
                      {rule.priority}
                    </span>
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`p-2 rounded ${
                        rule.isActive ? 'text-green-400 hover:bg-green-400/10' : 'text-gray-500 hover:bg-gray-700'
                      }`}
                    >
                      {rule.isActive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setEditingRule(rule)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <span className="text-xs text-gray-500">Metric</span>
                    <p className="text-sm text-white capitalize">{rule.metric.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Condition</span>
                    <p className="text-sm text-white">{rule.condition} {rule.threshold}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Time Window</span>
                    <p className="text-sm text-white">{rule.timeWindow}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Triggered</span>
                    <p className="text-sm text-white">{rule.triggerCount} times</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Notifications:</span>
                    {rule.notifications.map((notif, index) => (
                      <div key={index} className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        notif.enabled ? 'bg-green-600/20 text-green-400' : 'bg-gray-700 text-gray-500'
                      }`}>
                        {getNotificationIcon(notif.type)}
                        <span>{notif.type}</span>
                      </div>
                    ))}
                  </div>
                  
                  {rule.lastTriggered && (
                    <span className="text-xs text-gray-500">
                      Last triggered: {new Date(rule.lastTriggered).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Rule Modal */}
      {(showRuleForm || editingRule) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {editingRule ? 'Edit Alert Rule' : 'Create Alert Rule'}
              </h3>
              <button
                onClick={() => {
                  setShowRuleForm(false);
                  setEditingRule(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Rule Name</label>
                  <input
                    type="text"
                    placeholder="Enter rule name"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Priority</label>
                  <select className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  placeholder="Describe what this rule monitors"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Metric</label>
                  <select className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white">
                    <option value="active_users">Active Users</option>
                    <option value="conversion_rate">Conversion Rate</option>
                    <option value="error_rate">Error Rate</option>
                    <option value="revenue">Revenue</option>
                    <option value="page_load_time">Page Load Time</option>
                    <option value="bounce_rate">Bounce Rate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Condition</label>
                  <select className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white">
                    <option value="above">Above</option>
                    <option value="below">Below</option>
                    <option value="percentage_change">% Change</option>
                    <option value="absolute_change">Absolute Change</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Threshold</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Time Window</label>
                  <select className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white">
                    <option value="5m">5 minutes</option>
                    <option value="15m">15 minutes</option>
                    <option value="1h">1 hour</option>
                    <option value="24h">24 hours</option>
                    <option value="7d">7 days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Compare To</label>
                  <select className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white">
                    <option value="previous_period">Previous Period</option>
                    <option value="same_day_last_week">Same Day Last Week</option>
                    <option value="baseline">Baseline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Notifications</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-900 rounded">
                    <input type="checkbox" className="w-4 h-4" />
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-white">Email</span>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-900 rounded">
                    <input type="checkbox" className="w-4 h-4" />
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-white">Slack</span>
                    <input
                      type="text"
                      placeholder="#channel"
                      className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-900 rounded">
                    <input type="checkbox" className="w-4 h-4" />
                    <Smartphone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-white">SMS</span>
                    <input
                      type="tel"
                      placeholder="+1234567890"
                      className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRuleForm(false);
                  setEditingRule(null);
                }}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded">
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}