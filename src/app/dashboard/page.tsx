"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { 
  LayoutGrid, 
  Zap, 
  Calculator,
  BarChart3, 
  Settings2,
  TrendingUp,
  Calendar,
  Bell,
  Plus,
  ArrowRight,
  Lightbulb,
  Activity,
  FileText,
  DollarSign,
  Crown,
  Users,
  Shield,
  Building2,
  Cog,
  Brain,
  Leaf,
  Eye,
  Gauge
} from "lucide-react"
import { getCurrentUserRole, getCurrentUserPermissions } from '@/lib/user-permissions'

type UserRole = 'user' | 'admin' | 'developer'
type SubscriptionTier = 'FREE' | 'PROFESSIONAL' | 'ENTERPRISE'

export default function Dashboard() {
  const { user } = useAuth()
  const [userRole, setUserRole] = useState<UserRole>('user')
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('FREE')
  const [showPlantMonitoring, setShowPlantMonitoring] = useState(false)
  const permissions = getCurrentUserPermissions()

  useEffect(() => {
    setUserRole(getCurrentUserRole())
    const tier = user?.publicMetadata?.subscriptionTier as SubscriptionTier || 'FREE'
    setSubscriptionTier(tier)
  }, [user])

  const recentProjects = [
    { id: 1, name: "Greenhouse Complex A", type: "Cannabis Cultivation", status: "Completed", date: "2 days ago", fixtures: 24 },
    { id: 2, name: "Vertical Farm Design", type: "Leafy Greens", status: "In Progress", date: "1 week ago", fixtures: 48 },
    { id: 3, name: "Research Facility", type: "Mixed Crops", status: "Draft", date: "2 weeks ago", fixtures: 12 }
  ]

  // Role-based content
  const getQuickStats = () => {
    const baseStats = [
      { label: "Active Projects", value: "12", change: "+3", trend: "up", icon: LayoutGrid },
      { label: "Total Fixtures Designed", value: "1,247", change: "+24", trend: "up", icon: Lightbulb },
      { label: "Energy Efficiency Avg", value: "2.8 μmol/J", change: "+0.2", trend: "up", icon: Zap },
      { label: "Cost Savings", value: "$45,230", change: "+12%", trend: "up", icon: DollarSign }
    ]

    if (userRole === 'admin') {
      return [
        ...baseStats,
        { label: "Total Users", value: "1,524", change: "+156", trend: "up", icon: Users },
        { label: "System Health", value: "99.8%", change: "+0.1%", trend: "up", icon: Shield }
      ]
    }

    return baseStats
  }

  const getQuickActions = () => {
    const baseActions = [
      { href: "/design", label: "Start New Design", icon: LayoutGrid, color: "#a855f7" },
      { href: "/energy-dashboard", label: "Energy Dashboard", icon: Zap, color: "#10b981" },
      { href: "/calculators", label: "Open Calculator", icon: Calculator, color: "#3b82f6" },
      { href: "/fixtures", label: "Browse Fixtures", icon: Lightbulb, color: "#f59e0b" },
      { href: "/reports", label: "Generate Report", icon: FileText, color: "#22c55e" },
      { href: "/revenue-sharing", label: "Revenue Sharing", icon: TrendingUp, color: "#10b981" }
    ]

    if (userRole === 'admin') {
      return [
        ...baseActions,
        { href: "/admin/users", label: "Manage Users", icon: Users, color: "#ef4444" },
        { href: "/admin/system", label: "System Settings", icon: Cog, color: "#6b7280" }
      ]
    }

    if (subscriptionTier === 'ENTERPRISE') {
      return [
        ...baseActions,
        { href: "/multi-site", label: "Multi-Site Manager", icon: Building2, color: "#8b5cf6" }
      ]
    }

    return baseActions
  }

  const quickStats = getQuickStats()
  const quickActions = getQuickActions()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #374151', backgroundColor: 'rgba(17, 24, 39, 0.5)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff' }}>Dashboard</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <p style={{ color: '#9ca3af' }}>Welcome back, {user?.firstName || "User"}</p>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.125rem 0.5rem', 
                  borderRadius: '9999px',
                  backgroundColor: userRole === 'admin' ? '#ef4444' : subscriptionTier === 'ENTERPRISE' ? '#8b5cf6' : subscriptionTier === 'PROFESSIONAL' ? '#3b82f6' : '#6b7280',
                  color: '#ffffff'
                }}>
                  {userRole === 'admin' ? 'ADMIN' : subscriptionTier}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => setShowPlantMonitoring(!showPlantMonitoring)}
                style={{ 
                  backgroundColor: showPlantMonitoring ? '#059669' : '#374151', 
                  color: '#ffffff', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Brain style={{ height: '1rem', width: '1rem' }} />
                <span>Plant Monitoring</span>
              </button>
              <button style={{ position: 'relative', padding: '0.5rem', color: '#9ca3af' }}>
                <Bell style={{ height: '1.5rem', width: '1.5rem' }} />
                <span style={{ position: 'absolute', top: '0', right: '0', height: '0.5rem', width: '0.5rem', backgroundColor: '#ef4444', borderRadius: '50%' }}></span>
              </button>
              <Link
                href="/design"
                style={{ 
                  backgroundColor: '#7c3aed', 
                  color: '#ffffff', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  textDecoration: 'none'
                }}
              >
                <Plus style={{ height: '1rem', width: '1rem' }} />
                <span>New Design</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Upgrade Banner for Free Users */}
        {subscriptionTier === 'FREE' && (
          <div style={{ 
            background: 'linear-gradient(90deg, #7c3aed 0%, #3b82f6 100%)', 
            color: '#ffffff', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Crown style={{ height: '1.25rem', width: '1.25rem' }} />
              <span>You're on the Free plan. Limited to 5 fixtures and no exports.</span>
            </div>
            <Link href="/pricing" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              color: '#ffffff', 
              padding: '0.5rem 1rem', 
              borderRadius: '0.25rem', 
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              Upgrade Now
            </Link>
          </div>
        )}
        {/* Plant Monitoring Section */}
        {showPlantMonitoring && (
          <div style={{ 
            backgroundColor: '#1f2937', 
            border: '1px solid #374151', 
            borderRadius: '0.5rem', 
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold', 
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Leaf style={{ height: '1.25rem', width: '1.25rem', color: '#10b981' }} />
                Advanced Plant Communication System
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link
                  href="/monitoring/psi"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#8b5cf6',
                    color: '#ffffff',
                    borderRadius: '0.25rem',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Gauge style={{ height: '1rem', width: '1rem' }} />
                  PSI Monitor
                </Link>
                <Link
                  href="/plant-monitoring"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    borderRadius: '0.25rem',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Eye style={{ height: '1rem', width: '1rem' }} />
                  Full Dashboard
                </Link>
              </div>
            </div>
            
            {/* Plant Communication Overview */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem' 
            }}>
              <div style={{ 
                backgroundColor: '#374151', 
                padding: '1rem', 
                borderRadius: '0.5rem' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <Activity style={{ height: '1rem', width: '1rem', color: '#3b82f6' }} />
                  <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Sap Flow</span>
                </div>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff' }}>125.5 g/h</p>
                <p style={{ color: '#10b981', fontSize: '0.75rem' }}>Normal hydration</p>
              </div>
              
              <div style={{ 
                backgroundColor: '#374151', 
                padding: '1rem', 
                borderRadius: '0.5rem' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <Eye style={{ height: '1rem', width: '1rem', color: '#10b981' }} />
                  <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Stomatal</span>
                </div>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff' }}>280 mmol</p>
                <p style={{ color: '#10b981', fontSize: '0.75rem' }}>Optimal gas exchange</p>
              </div>
              
              <div style={{ 
                backgroundColor: '#374151', 
                padding: '1rem', 
                borderRadius: '0.5rem' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <Leaf style={{ height: '1rem', width: '1rem', color: '#f59e0b' }} />
                  <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Growth</span>
                </div>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff' }}>+0.3 mm/day</p>
                <p style={{ color: '#10b981', fontSize: '0.75rem' }}>Active expansion</p>
              </div>
              
              <div style={{ 
                backgroundColor: '#374151', 
                padding: '1rem', 
                borderRadius: '0.5rem' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <Shield style={{ height: '1rem', width: '1rem', color: '#06b6d4' }} />
                  <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Wetness</span>
                </div>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff' }}>15%</p>
                <p style={{ color: '#10b981', fontSize: '0.75rem' }}>Low disease risk</p>
              </div>
              
              <div style={{ 
                backgroundColor: '#374151', 
                padding: '1rem', 
                borderRadius: '0.5rem' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <Zap style={{ height: '1rem', width: '1rem', color: '#eab308' }} />
                  <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Electrical</span>
                </div>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff' }}>Normal</p>
                <p style={{ color: '#10b981', fontSize: '0.75rem' }}>No stress signals</p>
              </div>
              
              <div style={{ 
                backgroundColor: '#374151', 
                padding: '1rem', 
                borderRadius: '0.5rem' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <Brain style={{ height: '1rem', width: '1rem', color: '#a855f7' }} />
                  <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>AI Analysis</span>
                </div>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff' }}>Healthy</p>
                <p style={{ color: '#10b981', fontSize: '0.75rem' }}>15% stress level</p>
              </div>
              
              <div style={{ 
                backgroundColor: '#374151', 
                padding: '1rem', 
                borderRadius: '0.5rem' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <Gauge style={{ height: '1rem', width: '1rem', color: '#8b5cf6' }} />
                  <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>PSI Score</span>
                </div>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff' }}>24.5</p>
                <p style={{ color: '#10b981', fontSize: '0.75rem' }}>Optimal conditions</p>
              </div>
            </div>
            
            {/* Recent Communications */}
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                color: '#ffffff',
                marginBottom: '0.75rem'
              }}>
                Recent Plant Communications
              </h3>
              <div style={{ 
                backgroundColor: '#374151', 
                padding: '1rem', 
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: '#d1d5db'
              }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: '#10b981' }}>✓</span> Plants showing optimal growth response to current light spectrum
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: '#3b82f6' }}>→</span> Stomatal conductance indicates good gas exchange - VPD at target
                </div>
                <div>
                  <span style={{ color: '#a855f7' }}>◉</span> AI predicts harvest readiness in 14 days based on growth patterns
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {quickStats.map((stat, index) => (
            <div key={index} style={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{stat.label}</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff' }}>{stat.value}</p>
                  <p style={{ color: '#22c55e', fontSize: '0.875rem', display: 'flex', alignItems: 'center', marginTop: '0.25rem' }}>
                    <TrendingUp style={{ height: '0.75rem', width: '0.75rem', marginRight: '0.25rem' }} />
                    {stat.change}
                  </p>
                </div>
                <stat.icon style={{ height: '2rem', width: '2rem', color: '#a855f7' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {/* Recent Projects */}
          <div>
            <div style={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #374151' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#ffffff' }}>Recent Projects</h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recentProjects.map((project) => (
                    <div key={project.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#374151', borderRadius: '0.5rem' }}>
                      <div>
                        <h4 style={{ fontWeight: '500', color: '#ffffff' }}>{project.name}</h4>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{project.type} • {project.fixtures} fixtures</p>
                        <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>{project.date}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          backgroundColor: project.status === 'Completed' ? '#059669' : project.status === 'In Progress' ? '#2563eb' : '#4b5563',
                          color: project.status === 'Completed' ? '#d1fae5' : project.status === 'In Progress' ? '#dbeafe' : '#f3f4f6'
                        }}>
                          {project.status}
                        </span>
                        <ArrowRight style={{ height: '1rem', width: '1rem', color: '#9ca3af' }} />
                      </div>
                    </div>
                  ))}
                </div>
                <Link 
                  href="/operations" 
                  style={{ marginTop: '1rem', color: '#a855f7', fontSize: '0.875rem', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                  View all projects <ArrowRight style={{ height: '0.75rem', width: '0.75rem', marginLeft: '0.25rem' }} />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #374151' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#ffffff' }}>Quick Actions</h3>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {quickActions.map((action) => (
                  <Link key={action.href} href={action.href} style={{ display: 'flex', alignItems: 'center', padding: '0.75rem', backgroundColor: '#374151', borderRadius: '0.5rem', textDecoration: 'none', transition: 'background-color 0.2s' }}>
                    <action.icon style={{ height: '1.25rem', width: '1.25rem', color: action.color, marginRight: '0.75rem' }} />
                    <span style={{ color: '#ffffff' }}>{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #374151' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#ffffff' }}>Recent Activity</h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {userRole === 'admin' ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Users style={{ height: '1rem', width: '1rem', color: '#22c55e' }} />
                        <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>156 new users registered this week</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Shield style={{ height: '1rem', width: '1rem', color: '#3b82f6' }} />
                        <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>System maintenance completed</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <BarChart3 style={{ height: '1rem', width: '1rem', color: '#a855f7' }} />
                        <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>Usage analytics updated</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Activity style={{ height: '1rem', width: '1rem', color: '#22c55e' }} />
                        <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>Design completed for Project Alpha</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Calculator style={{ height: '1rem', width: '1rem', color: '#3b82f6' }} />
                        <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>PPFD calculation updated</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FileText style={{ height: '1rem', width: '1rem', color: '#a855f7' }} />
                        <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>Report exported for review</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}