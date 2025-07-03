'use client'

import { useState } from 'react'
import { CollaborativeEditor } from '@/components/collaboration/CollaborativeEditor'
import { CollaborativeCanvas } from '@/components/collaboration/CollaborativeCanvas'
import { 
  Users, 
  FileText, 
  Palette,
  Settings,
  Info,
  Code,
  Zap,
  Shield
} from 'lucide-react'

export default function CollaborationDemoPage() {
  const [activeTab, setActiveTab] = useState<'editor' | 'canvas'>('editor')
  const [projectId] = useState(`demo-${Date.now()}`)

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-600/20 rounded-xl">
              <Users className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Real-time Collaboration Demo
              </h1>
              <p className="text-gray-400 mt-1">
                Experience live collaborative editing with multiple users
              </p>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-blue-400 mb-1">How to test collaboration:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-400">
                <li>Open this page in multiple browser windows or tabs</li>
                <li>Each window simulates a different user with a unique color</li>
                <li>Try moving your cursor, selecting text, and making edits</li>
                <li>Watch as changes sync in real-time across all windows</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Demo Area */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-gray-800 rounded-t-xl border-b border-gray-700 px-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                    activeTab === 'editor'
                      ? 'text-purple-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Text Editor
                  </div>
                  {activeTab === 'editor' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('canvas')}
                  className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                    activeTab === 'canvas'
                      ? 'text-purple-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Canvas Designer
                  </div>
                  {activeTab === 'canvas' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="bg-gray-800 rounded-b-xl">
              {activeTab === 'editor' ? (
                <CollaborativeEditor
                  projectId={projectId}
                  initialContent="Welcome to the VibeLux collaborative editor!

Try editing this text while having multiple browser windows open. You'll see:
• Real-time cursor positions of other users
• Live text updates as others type
• Collaborative selections highlighted in user colors
• Threaded comments on selected text

This editor uses:
- WebSocket connections for low-latency updates
- Operational Transform for conflict resolution
- Presence awareness for user activity
- Optimistic updates for smooth interactions"
                  className="rounded-b-xl"
                />
              ) : (
                <CollaborativeCanvas
                  projectId={projectId}
                  initialObjects={[
                    {
                      id: '1',
                      type: 'rect',
                      x: 100,
                      y: 100,
                      width: 200,
                      height: 150,
                      color: '#60a5fa'
                    },
                    {
                      id: '2',
                      type: 'circle',
                      x: 400,
                      y: 200,
                      radius: 80,
                      color: '#34d399'
                    },
                    {
                      id: '3',
                      type: 'text',
                      x: 250,
                      y: 400,
                      text: 'Collaborative Canvas',
                      color: '#f59e0b'
                    }
                  ]}
                  className="rounded-b-xl"
                />
              )}
            </div>
          </div>

          {/* Features Panel */}
          <div className="space-y-6">
            {/* Features */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Collaboration Features
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <div>
                    <p className="text-gray-300 font-medium">Real-time Cursors</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      See where other users are pointing
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <div>
                    <p className="text-gray-300 font-medium">Live Editing</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Changes sync instantly across all users
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <div>
                    <p className="text-gray-300 font-medium">Presence Awareness</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Know who's online and what they're doing
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <div>
                    <p className="text-gray-300 font-medium">Collaborative Comments</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Add threaded comments to any selection
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <div>
                    <p className="text-gray-300 font-medium">Conflict Resolution</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Automatic handling of simultaneous edits
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Technical Details */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-400" />
                Technical Implementation
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400 font-medium">WebSocket Protocol</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Low-latency bidirectional communication
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Operational Transform</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Ensures consistency across concurrent edits
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Event-Driven Architecture</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Efficient state synchronization
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Optimistic Updates</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Immediate local feedback for better UX
                  </p>
                </div>
              </div>
            </div>

            {/* Integration Guide */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                Integration Guide
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs font-mono text-gray-400 mb-1">1. Import the hook:</p>
                  <code className="text-xs text-purple-400">
                    import {'{ useCollaboration }'} from '@/hooks/useCollaboration'
                  </code>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs font-mono text-gray-400 mb-1">2. Initialize in your component:</p>
                  <code className="text-xs text-purple-400">
                    const {'{ sendCursor, sendEdit }'} = useCollaboration({'{ projectId }'})
                  </code>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs font-mono text-gray-400 mb-1">3. Send updates:</p>
                  <code className="text-xs text-purple-400">
                    sendEdit({'{ type: "update", data: {...} }'})
                  </code>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Security & Privacy
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  End-to-end encryption available
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  Project-based access control
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  No data persistence in demo mode
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  Session-based authentication
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* WebSocket Server Note */}
        <div className="mt-8 bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-400 mb-1">Note: WebSocket Server Required</p>
              <p className="text-gray-400">
                This demo requires a WebSocket server to be running. In a production environment, 
                you would connect to your collaboration server endpoint. For local testing, you can 
                use a mock WebSocket server or connect to a development server.
              </p>
              <p className="text-gray-500 mt-2 font-mono text-xs">
                Default endpoint: {process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}