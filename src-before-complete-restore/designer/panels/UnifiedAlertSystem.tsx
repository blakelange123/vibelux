'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell, BellOff, Mail, AlertTriangle, CheckCircle,
  Info, AlertCircle, X, Filter, Clock,
  Send, Settings, Archive, Trash2,
  Users, Phone, MessageSquare, Zap,
  TrendingUp, Thermometer, Droplets, Wind,
  Eye, EyeOff, Download, RefreshCw
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';

interface AlertRule {
  id: string;
  name: string;
  type: 'threshold' | 'change' | 'schedule' | 'maintenance';
  category: 'environmental' | 'equipment' | 'performance' | 'safety';
  enabled: boolean;
  condition: {
    parameter: string;
    operator: 'above' | 'below' | 'equals' | 'changes' | 'offline';
    value?: number;
    duration?: number; // minutes
  };
  severity: 'critical' | 'warning' | 'info';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  };
  recipients: string[];
  cooldown: number; // minutes between alerts
  lastTriggered?: Date;
}

interface Alert {
  id: string;
  ruleId: string;
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  details?: any;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

interface NotificationChannel {
  id: string;
  type: 'email' | 'sms' | 'webhook' | 'slack';
  name: string;
  enabled: boolean;
  config: {
    email?: { smtp: string; port: number; from: string; };
    sms?: { provider: string; apiKey: string; from: string; };
    webhook?: { url: string; method: string; headers: Record<string, string>; };
    slack?: { webhookUrl: string; channel: string; };
  };
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'operator' | 'technician' | 'viewer';
  preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    quietHours: { start: string; end: string; };
    categories: string[];
  };
}

export function UnifiedAlertSystem({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useDesigner();
  const { showNotification } = useNotifications();
  
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules' | 'channels' | 'recipients'>('alerts');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'environmental' | 'equipment' | 'performance' | 'safety'>('all');
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  
  // Alert rules
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: 'high-temp',
      name: 'High Temperature Alert',
      type: 'threshold',
      category: 'environmental',
      enabled: true,
      condition: {
        parameter: 'temperature',
        operator: 'above',
        value: 85,
        duration: 5
      },
      severity: 'warning',
      notifications: { email: true, sms: false, push: true, inApp: true },
      recipients: ['admin@facility.com', 'maintenance@facility.com'],
      cooldown: 30
    },
    {
      id: 'low-ppfd',
      name: 'Low Light Levels',
      type: 'threshold',
      category: 'performance',
      enabled: true,
      condition: {
        parameter: 'ppfd',
        operator: 'below',
        value: 200,
        duration: 15
      },
      severity: 'warning',
      notifications: { email: true, sms: false, push: false, inApp: true },
      recipients: ['grower@facility.com'],
      cooldown: 60
    },
    {
      id: 'fixture-offline',
      name: 'Fixture Offline',
      type: 'change',
      category: 'equipment',
      enabled: true,
      condition: {
        parameter: 'fixture.status',
        operator: 'offline',
        duration: 1
      },
      severity: 'critical',
      notifications: { email: true, sms: true, push: true, inApp: true },
      recipients: ['maintenance@facility.com', 'admin@facility.com'],
      cooldown: 0
    },
    {
      id: 'power-surge',
      name: 'Power Surge Detected',
      type: 'threshold',
      category: 'safety',
      enabled: true,
      condition: {
        parameter: 'power.current',
        operator: 'above',
        value: 100,
        duration: 0
      },
      severity: 'critical',
      notifications: { email: true, sms: true, push: true, inApp: true },
      recipients: ['maintenance@facility.com', 'safety@facility.com'],
      cooldown: 5
    },
    {
      id: 'maintenance-due',
      name: 'Fixture Maintenance Due',
      type: 'maintenance',
      category: 'equipment',
      enabled: true,
      condition: {
        parameter: 'fixture.runtime',
        operator: 'above',
        value: 20000 // hours
      },
      severity: 'info',
      notifications: { email: true, sms: false, push: false, inApp: true },
      recipients: ['maintenance@facility.com'],
      cooldown: 1440 // Daily
    }
  ]);
  
  // Active alerts
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'alert-1',
      ruleId: 'high-temp',
      timestamp: new Date(Date.now() - 1800000), // 30 min ago
      severity: 'warning',
      title: 'High Temperature Warning',
      message: 'Zone 3 temperature reached 87°F',
      details: { zone: 3, temperature: 87, duration: '15 minutes' },
      acknowledged: false,
      resolved: false
    },
    {
      id: 'alert-2',
      ruleId: 'fixture-offline',
      timestamp: new Date(Date.now() - 300000), // 5 min ago
      severity: 'critical',
      title: 'Fixture Offline',
      message: 'Fixture F-125 is not responding',
      details: { fixtureId: 'F-125', zone: 2, lastSeen: new Date(Date.now() - 600000) },
      acknowledged: true,
      acknowledgedBy: 'maintenance@facility.com',
      acknowledgedAt: new Date(Date.now() - 180000),
      resolved: false
    }
  ]);
  
  // Notification channels
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: 'email-primary',
      type: 'email',
      name: 'Primary Email Server',
      enabled: true,
      config: {
        email: {
          smtp: 'smtp.facility.com',
          port: 587,
          from: 'alerts@facility.com'
        }
      }
    },
    {
      id: 'sms-twilio',
      type: 'sms',
      name: 'Twilio SMS',
      enabled: true,
      config: {
        sms: {
          provider: 'twilio',
          apiKey: '***********',
          from: '+1234567890'
        }
      }
    },
    {
      id: 'slack-ops',
      type: 'slack',
      name: 'Operations Slack',
      enabled: true,
      config: {
        slack: {
          webhookUrl: 'https://hooks.slack.com/services/******',
          channel: '#facility-alerts'
        }
      }
    }
  ]);
  
  // Recipients
  const [recipients, setRecipients] = useState<Recipient[]>([
    {
      id: 'admin',
      name: 'Admin User',
      email: 'admin@facility.com',
      phone: '+1234567890',
      role: 'admin',
      preferences: {
        email: true,
        sms: true,
        push: true,
        quietHours: { start: '22:00', end: '06:00' },
        categories: ['environmental', 'equipment', 'performance', 'safety']
      }
    },
    {
      id: 'grower',
      name: 'Head Grower',
      email: 'grower@facility.com',
      phone: '+0987654321',
      role: 'operator',
      preferences: {
        email: true,
        sms: false,
        push: true,
        quietHours: { start: '20:00', end: '07:00' },
        categories: ['environmental', 'performance']
      }
    }
  ]);
  
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [testMode, setTestMode] = useState(false);
  
  // Simulate real-time monitoring
  useEffect(() => {
    if (!testMode) return;
    
    const interval = setInterval(() => {
      // Simulate random alert
      const rules = alertRules.filter(r => r.enabled);
      if (rules.length > 0 && crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.7) {
        const rule = rules[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * rules.length)];
        const newAlert: Alert = {
          id: `alert-${Date.now()}`,
          ruleId: rule.id,
          timestamp: new Date(),
          severity: rule.severity,
          title: rule.name,
          message: `Test alert: ${rule.name} triggered`,
          acknowledged: false,
          resolved: false
        };
        
        setAlerts(prev => [newAlert, ...prev]);
        showNotification(rule.severity === 'critical' ? 'error' : 'warning', newAlert.message);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [testMode, alertRules, showNotification]);
  
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            acknowledged: true, 
            acknowledgedBy: 'current.user@facility.com',
            acknowledgedAt: new Date()
          }
        : alert
    ));
    showNotification('info', 'Alert acknowledged');
  };
  
  const resolveAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, resolved: true, resolvedAt: new Date() }
        : alert
    ));
    showNotification('success', 'Alert resolved');
  };
  
  const sendTestAlert = (rule: AlertRule) => {
    const testAlert: Alert = {
      id: `test-${Date.now()}`,
      ruleId: rule.id,
      timestamp: new Date(),
      severity: rule.severity,
      title: `TEST: ${rule.name}`,
      message: `This is a test alert for ${rule.name}`,
      details: { test: true },
      acknowledged: false,
      resolved: false
    };
    
    setAlerts(prev => [testAlert, ...prev]);
    
    // Simulate sending notifications
    const channels: string[] = [];
    if (rule.notifications.email) channels.push('email');
    if (rule.notifications.sms) channels.push('SMS');
    if (rule.notifications.push) channels.push('push');
    
    showNotification('info', `Test alert sent via ${channels.join(', ')}`);
  };
  
  const exportAlertHistory = () => {
    const data = {
      alerts: alerts,
      exported: new Date().toISOString(),
      rules: alertRules
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('success', 'Alert history exported');
  };
  
  const renderAlertsTab = () => {
    const filteredAlerts = alerts.filter(alert => {
      if (!showAcknowledged && alert.acknowledged && !alert.resolved) return false;
      if (selectedCategory !== 'all') {
        const rule = alertRules.find(r => r.id === alert.ruleId);
        if (rule?.category !== selectedCategory) return false;
      }
      return true;
    });
    
    const activeAlerts = filteredAlerts.filter(a => !a.resolved);
    const resolvedAlerts = filteredAlerts.filter(a => a.resolved);
    
    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm"
            >
              <option value="all">All Categories</option>
              <option value="environmental">Environmental</option>
              <option value="equipment">Equipment</option>
              <option value="performance">Performance</option>
              <option value="safety">Safety</option>
            </select>
            
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={showAcknowledged}
                onChange={(e) => setShowAcknowledged(e.target.checked)}
                className="w-4 h-4"
              />
              Show acknowledged
            </label>
          </div>
          
          <button
            onClick={exportAlertHistory}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export History
          </button>
        </div>
        
        {/* Active Alerts */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Active Alerts ({activeAlerts.length})
          </h3>
          
          {activeAlerts.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-400">No active alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAlerts.map(alert => {
                const rule = alertRules.find(r => r.id === alert.ruleId);
                return (
                  <div
                    key={alert.id}
                    className={`rounded-lg p-4 border ${
                      alert.severity === 'critical' 
                        ? 'bg-red-900/20 border-red-800' 
                        : alert.severity === 'warning'
                        ? 'bg-yellow-900/20 border-yellow-800'
                        : 'bg-blue-900/20 border-blue-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {alert.severity === 'critical' ? (
                          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        ) : alert.severity === 'warning' ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        ) : (
                          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                        )}
                        <div>
                          <h4 className="font-medium text-white">{alert.title}</h4>
                          <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
                          {alert.details && (
                            <div className="mt-2 text-xs text-gray-400">
                              {Object.entries(alert.details).map(([key, value]) => (
                                <div key={key}>
                                  {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                            {alert.acknowledged && (
                              <span className="text-green-400">
                                Acknowledged by {alert.acknowledgedBy}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {!alert.acknowledged && (
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
                          >
                            Acknowledge
                          </button>
                        )}
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Resolved Alerts */}
        {resolvedAlerts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Resolved ({resolvedAlerts.length})
            </h3>
            
            <div className="space-y-2">
              {resolvedAlerts.map(alert => (
                <div key={alert.id} className="bg-gray-800 rounded-lg p-3 opacity-60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{alert.title}</p>
                      <p className="text-sm text-gray-400">{alert.message}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      Resolved {new Date(alert.resolvedAt!).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderRulesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Alert Rules</h3>
        <button
          onClick={() => setEditingRule({
            id: `rule-${Date.now()}`,
            name: 'New Alert Rule',
            type: 'threshold',
            category: 'environmental',
            enabled: true,
            condition: { parameter: '', operator: 'above', value: 0 },
            severity: 'warning',
            notifications: { email: true, sms: false, push: false, inApp: true },
            recipients: [],
            cooldown: 30
          })}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
        >
          Add Rule
        </button>
      </div>
      
      <div className="space-y-3">
        {alertRules.map(rule => (
          <div key={rule.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) => {
                      setAlertRules(rules => rules.map(r => 
                        r.id === rule.id ? { ...r, enabled: e.target.checked } : r
                      ));
                    }}
                    className="w-4 h-4"
                  />
                </label>
                <div>
                  <h4 className="font-medium text-white">{rule.name}</h4>
                  <p className="text-sm text-gray-400">
                    {rule.category} • {rule.type}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  rule.severity === 'critical' ? 'bg-red-900/30 text-red-400' :
                  rule.severity === 'warning' ? 'bg-yellow-900/30 text-yellow-400' :
                  'bg-blue-900/30 text-blue-400'
                }`}>
                  {rule.severity}
                </span>
                <button
                  onClick={() => sendTestAlert(rule)}
                  className="p-2 text-gray-400 hover:text-white"
                  title="Send test alert"
                >
                  <Send className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingRule(rule)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <span>Condition:</span>
                <span className="text-white">
                  {rule.condition.parameter} {rule.condition.operator} {rule.condition.value}
                  {rule.condition.duration && ` for ${rule.condition.duration} min`}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {rule.notifications.email && <Mail className="w-4 h-4 text-gray-400" />}
                  {rule.notifications.sms && <Phone className="w-4 h-4 text-gray-400" />}
                  {rule.notifications.push && <Bell className="w-4 h-4 text-gray-400" />}
                  {rule.notifications.inApp && <MessageSquare className="w-4 h-4 text-gray-400" />}
                </div>
                <span className="text-gray-400">
                  {rule.recipients.length} recipients
                </span>
                <span className="text-gray-400">
                  {rule.cooldown} min cooldown
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  const renderChannelsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Notification Channels</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map(channel => (
          <div key={channel.id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {channel.type === 'email' && <Mail className="w-5 h-5 text-blue-500" />}
                {channel.type === 'sms' && <Phone className="w-5 h-5 text-green-500" />}
                {channel.type === 'slack' && <MessageSquare className="w-5 h-5 text-purple-500" />}
                {channel.type === 'webhook' && <Zap className="w-5 h-5 text-yellow-500" />}
                <div>
                  <h4 className="font-medium text-white">{channel.name}</h4>
                  <p className="text-sm text-gray-400 capitalize">{channel.type}</p>
                </div>
              </div>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={channel.enabled}
                  onChange={(e) => {
                    setChannels(channels => channels.map(c => 
                      c.id === channel.id ? { ...c, enabled: e.target.checked } : c
                    ));
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm text-white">Enabled</span>
              </label>
            </div>
            
            <div className="space-y-2 text-sm">
              {channel.type === 'email' && channel.config.email && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">SMTP:</span>
                    <span className="text-white">{channel.config.email.smtp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">From:</span>
                    <span className="text-white">{channel.config.email.from}</span>
                  </div>
                </>
              )}
              {channel.type === 'sms' && channel.config.sms && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Provider:</span>
                    <span className="text-white">{channel.config.sms.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">From:</span>
                    <span className="text-white">{channel.config.sms.from}</span>
                  </div>
                </>
              )}
              {channel.type === 'slack' && channel.config.slack && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Channel:</span>
                  <span className="text-white">{channel.config.slack.channel}</span>
                </div>
              )}
            </div>
            
            <button className="mt-4 w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
              Configure
            </button>
          </div>
        ))}
      </div>
      
      <button className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 border-dashed">
        + Add Channel
      </button>
    </div>
  );
  
  const renderRecipientsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recipients</h3>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
          Add Recipient
        </button>
      </div>
      
      <div className="space-y-4">
        {recipients.map(recipient => (
          <div key={recipient.id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{recipient.name}</h4>
                  <p className="text-sm text-gray-400">{recipient.email}</p>
                </div>
              </div>
              
              <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded">
                {recipient.role}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-2">Contact Methods:</p>
                <div className="flex items-center gap-2">
                  {recipient.preferences.email && <Mail className="w-4 h-4 text-green-500" />}
                  {recipient.preferences.sms && <Phone className="w-4 h-4 text-green-500" />}
                  {recipient.preferences.push && <Bell className="w-4 h-4 text-green-500" />}
                </div>
              </div>
              
              <div>
                <p className="text-gray-400 mb-2">Quiet Hours:</p>
                <p className="text-white">
                  {recipient.preferences.quietHours.start} - {recipient.preferences.quietHours.end}
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Alert Categories:</p>
              <div className="flex flex-wrap gap-2">
                {recipient.preferences.categories.map(cat => (
                  <span key={cat} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-6xl w-full h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Unified Alert System</h2>
              <p className="text-sm text-gray-400">Real-time monitoring and notifications</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTestMode(!testMode)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm ${
                testMode
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {testMode ? (
                <>
                  <Activity className="w-4 h-4 animate-pulse" />
                  Test Mode ON
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  Test Mode
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="bg-gray-800 px-6 py-2 border-b border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-400">System Status:</span>
                <span className="text-green-400">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-gray-400">Active Alerts:</span>
                <span className="text-white font-medium">
                  {alerts.filter(a => !a.resolved).length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Last Check:</span>
                <span className="text-white">Just now</span>
              </div>
            </div>
            <button
              className="flex items-center gap-2 text-gray-400 hover:text-white"
              onClick={() => showNotification('info', 'Refreshing alert status...')}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-gray-800 px-4 py-2 flex gap-4 border-b border-gray-700">
          {(['alerts', 'rules', 'channels', 'recipients'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'alerts' && renderAlertsTab()}
          {activeTab === 'rules' && renderRulesTab()}
          {activeTab === 'channels' && renderChannelsTab()}
          {activeTab === 'recipients' && renderRecipientsTab()}
        </div>
        
        {/* Edit Rule Modal */}
        {editingRule && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
            <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Edit Alert Rule</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Rule Name</label>
                  <input
                    type="text"
                    value={editingRule.name}
                    onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Type</label>
                    <select
                      value={editingRule.type}
                      onChange={(e) => setEditingRule({ ...editingRule, type: e.target.value as any })}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                    >
                      <option value="threshold">Threshold</option>
                      <option value="change">Change</option>
                      <option value="schedule">Schedule</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Category</label>
                    <select
                      value={editingRule.category}
                      onChange={(e) => setEditingRule({ ...editingRule, category: e.target.value as any })}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                    >
                      <option value="environmental">Environmental</option>
                      <option value="equipment">Equipment</option>
                      <option value="performance">Performance</option>
                      <option value="safety">Safety</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Severity</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['info', 'warning', 'critical'] as const).map(severity => (
                      <button
                        key={severity}
                        onClick={() => setEditingRule({ ...editingRule, severity })}
                        className={`px-3 py-2 rounded-lg capitalize ${
                          editingRule.severity === severity
                            ? severity === 'critical' ? 'bg-red-600 text-white' :
                              severity === 'warning' ? 'bg-yellow-600 text-white' :
                              'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {severity}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Add more fields as needed */}
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setEditingRule(null)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setAlertRules(rules => {
                        const existing = rules.findIndex(r => r.id === editingRule.id);
                        if (existing >= 0) {
                          return rules.map(r => r.id === editingRule.id ? editingRule : r);
                        } else {
                          return [...rules, editingRule];
                        }
                      });
                      setEditingRule(null);
                      showNotification('success', 'Alert rule saved');
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                  >
                    Save Rule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}