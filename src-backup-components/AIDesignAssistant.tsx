'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Minimize2, Maximize2, Wand2, Sparkles, Loader2, RotateCcw, Zap } from 'lucide-react';
import { useDesigner } from './designer/context/DesignerContext';
import { useNotifications } from './designer/context/NotificationContext';
import { TokenUsageTracker } from './TokenUsageTracker';
import type { DesignerAction } from '@/app/api/ai-designer/route';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: Date;
  actions?: DesignerAction[];
}

export function AIDesignAssistant() {
  const { state, dispatch, addObject, updateRoom, clearObjects, showNotification } = useDesigner();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Hi! I'm your AI Design Assistant. I can help you create and optimize your lighting design.",
      sender: 'assistant',
      timestamp: new Date()
    },
    {
      id: '2',
      text: "**Try commands like:**\n" +
            "• 'Create a 40x60 room with 12 foot ceilings'\n" +
            "• 'Add 4x8 grid of fixtures for 800 PPFD'\n" +
            "• 'Add 3 rows of rolling benches'\n" +
            "• 'Place fixtures at specific locations'\n\n" +
            "**🌱 Plant Support:**\n" +
            "• 'Add lettuce plants in 4 rows'\n" +
            "• 'Place high wire tomatoes with 3 foot spacing'\n" +
            "• 'Add hemp plants in flowering stage'\n" +
            "• 'Create a grid of microgreens'\n\n" +
            "**🎯 Narrow Space Optimization:**\n" +
            "• 'I need a 2' x 30' calculation surface with lights 2.5' above'\n" +
            "• 'Find the best DLC fixture for 400 PPFD on a 2x30 rack'\n" +
            "• 'Optimize DLC fixtures for a narrow 2x30 growing area'",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get contextual suggestions on state change
  useEffect(() => {
    if (isOpen) {
      // Add a small delay to prevent rapid-fire requests
      const timeoutId = setTimeout(() => {
        getSuggestions();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [state.room, state.objects.length, isOpen]);

  const getSuggestions = async () => {
    // Prevent multiple concurrent requests
    if (isFetchingSuggestions) return;
    
    setIsFetchingSuggestions(true);
    try {
      const response = await fetch('/api/ai-designer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'suggest',
          currentState: {
            room: state.room,
            objects: state.objects,
            calculations: state.calculations
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } else {
        console.warn('Failed to get suggestions:', response.status);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
      // Set empty suggestions on error to prevent UI issues
      setSuggestions([]);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const executeActions = async (actions: DesignerAction[]) => {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'CREATE_ROOM':
            updateRoom({
              width: action.params.width,
              length: action.params.length,
              height: action.params.height,
              ceilingHeight: action.params.ceilingHeight || action.params.height,
              workingHeight: action.params.workingHeight || 3,
              roomType: action.params.roomType || 'cultivation',
              reflectances: {
                ceiling: 0.8,
                walls: 0.5,
                floor: 0.2
              }
            });
            showNotification('success', `Created ${action.params.width}x${action.params.length} room`);
            break;

          case 'ADD_FIXTURE':
            addObject({
              type: 'fixture',
              x: action.params.x,
              y: action.params.y,
              z: action.params.z || state.room?.workingHeight || 3,
              rotation: 0,
              width: 4,
              length: 2,
              height: 0.5,
              enabled: true,
              model: {
                name: action.params.modelName || 'LED Fixture',
                wattage: action.params.wattage || 600,
                ppf: action.params.ppf || 1800,
                beamAngle: 120,
                efficacy: 3.0
              },
              dimmingLevel: action.params.dimmingLevel || 100
            });
            break;

          case 'ADD_FIXTURES_ARRAY': {
            const { rows, columns, spacing = 4, centerX, centerY, targetPPFD } = action.params;
            
            // If no specific grid size provided, calculate based on room and target PPFD
            let gridRows = rows;
            let gridCols = columns;
            
            if (!rows || !columns) {
              const roomWidth = state.room?.width || 40;
              const roomLength = state.room?.length || 40;
              const optimalSpacing = targetPPFD > 600 ? 4 : 5;
              gridCols = Math.floor(roomWidth / optimalSpacing);
              gridRows = Math.floor(roomLength / optimalSpacing);
            }
            
            const roomCenterX = centerX || (state.room?.width || 0) / 2;
            const roomCenterY = centerY || (state.room?.length || 0) / 2;
            const totalWidth = (gridCols - 1) * spacing;
            const totalLength = (gridRows - 1) * spacing;
            const startX = roomCenterX - totalWidth / 2;
            const startY = roomCenterY - totalLength / 2;

            for (let row = 0; row < gridRows; row++) {
              for (let col = 0; col < gridCols; col++) {
                addObject({
                  type: 'fixture',
                  x: startX + col * spacing,
                  y: startY + row * spacing,
                  z: state.room?.workingHeight || 3,
                  rotation: 0,
                  width: 4,
                  length: 2,
                  height: 0.5,
                  enabled: true,
                  model: {
                    name: 'LED Bar Light',
                    wattage: 600,
                    ppf: targetPPFD ? targetPPFD * 4.6 : 1800, // Rough PPF from PPFD
                    beamAngle: 120,
                    efficacy: 3.0
                  },
                  dimmingLevel: 100
                });
              }
            }
            showNotification('success', `Added ${gridRows}x${gridCols} fixture array`);
            break;
          }

          case 'ADD_EQUIPMENT': {
            const equipmentType = action.params.type;
            const equipmentMap = {
              hvac: { width: 4, length: 4, height: 3, name: 'HVAC Unit' },
              fan: { width: 2, length: 2, height: 2, name: 'Circulation Fan' },
              dehumidifier: { width: 2, length: 3, height: 4, name: 'Dehumidifier' },
              co2: { width: 1, length: 1, height: 2, name: 'CO2 System' },
              irrigation: { width: 3, length: 2, height: 1, name: 'Irrigation System' }
            };

            const equipment = equipmentMap[equipmentType];
            if (equipment) {
              addObject({
                type: 'equipment',
                equipmentType,
                x: action.params.x,
                y: action.params.y,
                z: 0,
                rotation: 0,
                width: equipment.width,
                length: equipment.length,
                height: equipment.height,
                enabled: true,
                customName: equipment.name,
                specs: action.params.specs || {}
              });
              showNotification('success', `Added ${equipment.name}`);
            }
            break;
          }

          case 'ADD_BENCHING': {
            const { type, rows: benchRows, width, length, height = 3, tiers = 1 } = action.params;
            const benchSpacing = width + 3; // 3 ft aisle
            const roomWidth = state.room?.width || 40;
            const roomLength = state.room?.length || 40;
            const startX = (roomWidth - (benchRows * benchSpacing - 3)) / 2;
            const centerY = roomLength / 2;

            for (let i = 0; i < benchRows; i++) {
              addObject({
                type: type === 'rack' ? 'rack' : 'bench',
                x: startX + i * benchSpacing,
                y: centerY - length / 2,
                z: 0,
                rotation: 0,
                width,
                length,
                height: type === 'rack' ? height * tiers : 3,
                enabled: true,
                customName: `${type === 'rolling' ? 'Rolling Bench' : type === 'rack' ? 'Rack System' : 'Fixed Bench'} ${i + 1}`,
                benchType: type,
                tiers: type === 'rack' ? tiers : undefined
              });
            }
            showNotification('success', `Added ${benchRows} ${type} benches`);
            break;
          }

          case 'UPDATE_ROOM':
            updateRoom(action.params);
            showNotification('success', 'Updated room configuration');
            break;

          case 'OPTIMIZE_LAYOUT':
            // Trigger optimization
            showNotification('info', 'Optimizing layout... (this would trigger optimization algorithm)');
            break;

          case 'SET_TARGET_PPFD':
            if (state.room) {
              updateRoom({
                targetDLI: action.params.dli,
                // Store target PPFD in room metadata
                targetPPFD: action.params.targetPPFD
              });
            }
            showNotification('success', `Set target to ${action.params.targetPPFD} PPFD`);
            break;

          case 'CLEAR_CANVAS':
            clearObjects();
            showNotification('info', 'Cleared all objects from canvas');
            break;

          case 'CALCULATE_SURFACE': {
            const { x, y, width, length, height, targetPPFD, mountingHeight } = action.params;
            // Create a visual calculation surface
            addObject({
              type: 'calculation_surface',
              x,
              y, 
              z: height,
              width,
              length,
              height: 0.1,
              enabled: true,
              customName: `Calculation Surface ${width}'×${length}'`,
              targetPPFD,
              mountingHeight
            });
            showNotification('info', `Created ${width}'×${length}' calculation surface with ${targetPPFD} PPFD target`);
            break;
          }

          case 'OPTIMIZE_DLC_FIXTURES': {
            const { surfaceWidth, surfaceLength, targetPPFD, mountingHeight, x = 10, y = 10, z = 3 } = action.params;
            
            // Import and use DLC fixture selector
            import('@/lib/dlc-fixture-selector').then(({ selectOptimalFixture, generateFixturePlacements }) => {
              const recommendations = selectOptimalFixture({
                targetPPFD,
                canopyWidth: surfaceWidth,
                canopyLength: surfaceLength,
                mountingHeight,
                preferredFormFactor: action.params.preferredFormFactor,
                maxWattage: action.params.maxWattage,
                minEfficacy: action.params.minEfficacy || 2.8
              });

              if (recommendations.length > 0) {
                const best = recommendations[0];
                const placements = generateFixturePlacements(best, x, y, z + mountingHeight);
                
                // Add fixtures to canvas
                placements.forEach((placement, index) => {
                  addObject({
                    type: 'fixture',
                    x: placement.x,
                    y: placement.y,
                    z: placement.z,
                    rotation: placement.rotation,
                    width: best.fixture.width || 4,
                    length: best.fixture.length || 0.5,
                    height: 0.5,
                    enabled: true,
                    customName: `${best.fixture.manufacturer} ${best.fixture.model}`,
                    model: {
                      ...best.fixture,
                      isDLC: true
                    },
                    dimmingLevel: 100
                  });
                });

                showNotification('success', 
                  `Added ${best.quantity} × ${best.fixture.model} fixtures\n` +
                  `Expected PPFD: ${best.expectedPPFD} | Uniformity: ${best.uniformity} | ` +
                  `Total Power: ${best.totalPower}W | Efficacy: ${(best.fixture.ppf / best.fixture.wattage).toFixed(2)} μmol/J`
                );

                // Add analysis message
                const analysisMessage: Message = {
                  id: Date.now().toString(),
                  text: `**DLC Fixture Analysis Complete**\n\n` +
                        `🏆 **Best Option:** ${best.fixture.manufacturer} ${best.fixture.model}\n` +
                        `• Fixtures needed: ${best.quantity}\n` +
                        `• Layout: ${best.layout.rows} row(s) × ${best.layout.columns} columns\n` +
                        `• Expected PPFD: ${best.expectedPPFD} μmol/m²/s (target: ${targetPPFD})\n` +
                        `• Uniformity: ${(best.uniformity * 100).toFixed(0)}%\n` +
                        `• Total Power: ${best.totalPower}W\n` +
                        `• System Efficacy: ${(best.fixture.ppf / best.fixture.wattage).toFixed(2)} μmol/J\n\n` +
                        `**Why this fixture?**\n` +
                        best.reasoning.map(r => `• ${r}`).join('\n') + '\n\n' +
                        `**Other top options:**\n` +
                        recommendations.slice(1, 3).map((rec, i) => 
                          `${i + 2}. ${rec.fixture.model} - ${rec.quantity} fixtures, ${rec.expectedPPFD} PPFD, ${rec.totalPower}W`
                        ).join('\n'),
                  sender: 'assistant',
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, analysisMessage]);
              } else {
                showNotification('warning', 'No suitable DLC fixtures found for these requirements');
              }
            });
            break;
          }

          case 'ADD_PLANT': {
            const { x, y, variety, growthStage = 'vegetative', width = 2, length = 2, targetDLI = 15 } = action.params;
            
            // DLI targets by plant type
            const dliTargets: Record<string, number> = {
              'lettuce': 12,
              'hemp': 25,
              'high-wire': 20,
              'tomato': 20,
              'cannabis': 35,
              'herbs': 10,
              'microgreens': 8
            };
            
            addObject({
              type: 'plant',
              x,
              y,
              z: 0,
              rotation: 0,
              width,
              length,
              height: variety === 'high-wire' ? 6 : 1,
              enabled: true,
              variety,
              growthStage,
              targetDLI: targetDLI || dliTargets[variety] || 15,
              customName: `${variety} - ${growthStage}`
            });
            
            showNotification('success', `Added ${variety} plant at (${x}, ${y})`);
            break;
          }

          case 'ADD_PLANTS_ARRAY': {
            const { 
              rows, 
              columns, 
              spacing = 2, 
              variety, 
              growthStage = 'vegetative',
              centerX,
              centerY 
            } = action.params;
            
            // Calculate grid dimensions
            let gridRows = rows;
            let gridCols = columns;
            
            if (!rows || !columns) {
              const roomWidth = state.room?.width || 40;
              const roomLength = state.room?.length || 40;
              gridCols = Math.floor(roomWidth / spacing);
              gridRows = Math.floor(roomLength / spacing);
            }
            
            const roomCenterX = centerX || (state.room?.width || 0) / 2;
            const roomCenterY = centerY || (state.room?.length || 0) / 2;
            const totalWidth = (gridCols - 1) * spacing;
            const totalLength = (gridRows - 1) * spacing;
            const startX = roomCenterX - totalWidth / 2;
            const startY = roomCenterY - totalLength / 2;
            
            // Plant-specific properties
            const plantSizes: Record<string, { width: number; length: number; height: number }> = {
              'lettuce': { width: 1, length: 1, height: 0.5 },
              'hemp': { width: 3, length: 3, height: 4 },
              'high-wire': { width: 1.5, length: 1.5, height: 8 },
              'tomato': { width: 2, length: 2, height: 5 },
              'cannabis': { width: 3, length: 3, height: 4 },
              'herbs': { width: 1, length: 1, height: 1 },
              'microgreens': { width: 2, length: 1, height: 0.25 }
            };
            
            const dliTargets: Record<string, number> = {
              'lettuce': 12,
              'hemp': 25,
              'high-wire': 20,
              'tomato': 20,
              'cannabis': 35,
              'herbs': 10,
              'microgreens': 8
            };
            
            const plantSize = plantSizes[variety] || { width: 2, length: 2, height: 2 };
            
            for (let row = 0; row < gridRows; row++) {
              for (let col = 0; col < gridCols; col++) {
                addObject({
                  type: 'plant',
                  x: startX + col * spacing,
                  y: startY + row * spacing,
                  z: 0,
                  rotation: 0,
                  width: plantSize.width,
                  length: plantSize.length,
                  height: plantSize.height,
                  enabled: true,
                  variety,
                  growthStage,
                  targetDLI: dliTargets[variety] || 15,
                  customName: `${variety}-${row}-${col}`
                });
              }
            }
            
            showNotification('success', `Added ${gridRows}x${gridCols} ${variety} plants`);
            break;
          }

          default:
        }
      } catch (error) {
        console.error('Error executing action:', error);
        showNotification('error', `Failed to execute ${action.type}`);
      }
    }

    // Trigger recalculation after all actions
    dispatch({ type: 'RECALCULATE' });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-designer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          mode: 'parse',
          currentState: {
            room: state.room,
            objects: state.objects,
            calculations: state.calculations
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429 && errorData.upgradeRequired) {
          // Handle usage limit reached
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            text: `⚠️ **Usage Limit Reached**\n\n${errorData.message}\n\n**Current Usage:** ${errorData.used}/${errorData.limit}\n**Resets:** ${new Date(errorData.resetDate).toLocaleDateString()}\n\nPlease upgrade your subscription to continue using AI features.`,
            sender: 'assistant',
            timestamp: new Date()
          }]);
          setIsLoading(false);
          return;
        }
        throw new Error('Failed to process request');
      }

      const data = await response.json();

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message || 'Processing your request...',
        sender: 'assistant',
        timestamp: new Date(),
        actions: data.actions
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Execute actions if any
      if (data.actions && data.actions.length > 0) {
        await executeActions(data.actions);
      }

      // Update suggestions
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'assistant',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const analyzeDesign = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-designer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'analyze',
          currentState: {
            room: state.room,
            objects: state.objects,
            calculations: state.calculations
          }
        })
      });

      if (!response.ok) throw new Error('Failed to analyze design');

      const data = await response.json();
      
      // Format analysis results
      const analysisText = `
📊 **Design Analysis**

**Metrics:**
• Fixtures: ${data.analysis.metrics.fixtureCount}
• Total Power: ${data.analysis.metrics.totalPower.toFixed(0)}W
• Power Density: ${data.analysis.metrics.powerDensity.toFixed(1)} W/ft²
• Average PPFD: ${data.analysis.metrics.averagePPFD.toFixed(0)} μmol/m²/s
• Uniformity: ${(data.analysis.metrics.uniformity * 100).toFixed(0)}%
• Coverage: ${data.analysis.metrics.coverage.toFixed(0)}%

**Recommendations:**
${data.analysis.recommendations.map((r: any) => 
  `• ${r.priority === 'high' ? '⚠️' : '✅'} ${r.message}`
).join('\n')}

**Status:** ${data.analysis.status.replace('-', ' ')}
      `.trim();

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: analysisText,
        sender: 'assistant',
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Error analyzing design:', error);
      showNotification('error', 'Failed to analyze design');
    } finally {
      setIsLoading(false);
    }
  };

  const getFactBasedRecommendations = async (cropType: string) => {
    if (!cropType || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-designer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'fact-check',
          cropType,
          growthStage: 'vegetative',
          targetMetrics: {
            ppfd: state.calculations?.averagePPFD || 0,
            uniformity: state.calculations?.uniformity || 0
          },
          environmentalFactors: {
            energyCosts: 0.12 // $0.12/kWh average
          },
          currentState: {
            room: state.room,
            objects: state.objects,
            calculations: state.calculations
          }
        })
      });

      if (!response.ok) throw new Error('Failed to get fact-based recommendations');

      const data = await response.json();
      
      if (data.recommendations && data.recommendations.length > 0) {
        const factText = `
🧪 **Scientific Design Analysis for ${cropType.charAt(0).toUpperCase() + cropType.slice(1)}**

${data.recommendations.map((rec: any, index: number) => `
**${index + 1}. ${rec.confidence.toUpperCase()} CONFIDENCE** ${getVerificationBadge(rec.verificationStatus)}
${rec.recommendation}

📚 **Scientific Basis:**
${rec.scientificBasis.sources.join(', ')}

🔬 **Research Support:**
${rec.scientificBasis.studies.slice(0, 2).join('\n')}

💡 **Why this matters:**
${rec.reasoning}

${rec.credibilityReport ? `
📊 **Research Verification:**
• Total Studies: ${rec.credibilityReport.researchBacking.totalStudies}
• Peer-Reviewed: ${rec.credibilityReport.researchBacking.peerReviewedStudies}
• Avg Citations: ${rec.credibilityReport.researchBacking.averageCitationCount.toFixed(0)}
• Credibility Score: ${(rec.credibilityReport.overallCredibility * 100).toFixed(0)}%
` : ''}

${rec.warningFlags && rec.warningFlags.length > 0 ? `⚠️ **Considerations:** ${rec.warningFlags.join(', ')}` : ''}
`).join('\n---\n')}

*Recommendations verified against live research databases including ResearchGate, ArXiv, and peer-reviewed journals.*
        `.trim();

        function getVerificationBadge(status: string): string {
          switch (status) {
            case 'verified': return '✅ VERIFIED';
            case 'conflicted': return '⚠️ CONFLICTED';
            case 'unverified': return '❓ UNVERIFIED';
            default: return '⏳ CHECKING';
          }
        }

        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: factText,
          sender: 'assistant',
          timestamp: new Date()
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `✅ Your current design appears to align with scientific requirements for ${cropType}. No major issues detected.`,
          sender: 'assistant',
          timestamp: new Date()
        }]);
      }

    } catch (error) {
      console.error('Error getting fact-based recommendations:', error);
      showNotification('error', 'Failed to get scientific recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center z-50"
        title="AI Design Assistant"
      >
        <Bot className="w-6 h-6" />
      </button>

      {/* Assistant Panel */}
      {isOpen && (
        <div className={`fixed bottom-24 right-6 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl transition-all z-50 ${
          isMinimized ? 'w-80 h-16' : 'w-[450px] h-[700px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">AI Design Assistant</h3>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-400">AI-Powered Assistant</p>
                  <TokenUsageTracker feature="ai_designer" compact={true} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={analyzeDesign}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Analyze current design"
                disabled={isLoading}
              >
                <Sparkles className="w-4 h-4 text-gray-400" />
              </button>
              <div className="relative group">
                <button
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  title="Scientific fact-check"
                  disabled={isLoading}
                >
                  <Wand2 className="w-4 h-4 text-green-400" />
                </button>
                <div className="absolute top-10 right-0 hidden group-hover:block bg-gray-800 border border-gray-700 rounded-lg p-2 min-w-64 z-50 max-h-96 overflow-y-auto">
                  <p className="text-xs text-gray-400 mb-2">Fact-check design for:</p>
                  <div className="space-y-2">
                    {/* Popular crops */}
                    <div>
                      <p className="text-xs font-semibold text-gray-300 mb-1">Popular Crops</p>
                      <div className="grid grid-cols-2 gap-1">
                        {['Cannabis sativa', 'Lettuce', 'Tomato', 'Basil'].map(crop => (
                          <button
                            key={crop}
                            onClick={() => getFactBasedRecommendations(crop)}
                            className="text-left px-2 py-1 text-xs text-gray-300 hover:bg-gray-700 rounded truncate"
                            disabled={isLoading}
                          >
                            {crop}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Leafy Greens */}
                    <div>
                      <p className="text-xs font-semibold text-gray-300 mb-1">Leafy Greens</p>
                      <div className="grid grid-cols-2 gap-1">
                        {['Butterhead Lettuce', 'Spinach', 'Kale', 'Arugula', 'Bok Choy', 'Swiss Chard'].map(crop => (
                          <button
                            key={crop}
                            onClick={() => getFactBasedRecommendations(crop)}
                            className="text-left px-2 py-1 text-xs text-gray-300 hover:bg-gray-700 rounded truncate"
                            disabled={isLoading}
                          >
                            {crop}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Herbs & Spices */}
                    <div>
                      <p className="text-xs font-semibold text-gray-300 mb-1">Herbs & Spices</p>
                      <div className="grid grid-cols-2 gap-1">
                        {['Basil', 'Cilantro', 'Parsley', 'Mint', 'Oregano', 'Thyme'].map(crop => (
                          <button
                            key={crop}
                            onClick={() => getFactBasedRecommendations(crop)}
                            className="text-left px-2 py-1 text-xs text-gray-300 hover:bg-gray-700 rounded truncate"
                            disabled={isLoading}
                          >
                            {crop}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Fruiting Vegetables */}
                    <div>
                      <p className="text-xs font-semibold text-gray-300 mb-1">Fruiting Vegetables</p>
                      <div className="grid grid-cols-2 gap-1">
                        {['Cherry Tomato', 'Bell Pepper', 'Cucumber', 'Eggplant', 'Strawberry', 'Zucchini'].map(crop => (
                          <button
                            key={crop}
                            onClick={() => getFactBasedRecommendations(crop)}
                            className="text-left px-2 py-1 text-xs text-gray-300 hover:bg-gray-700 rounded truncate"
                            disabled={isLoading}
                          >
                            {crop}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Microgreens */}
                    <div>
                      <p className="text-xs font-semibold text-gray-300 mb-1">Microgreens</p>
                      <div className="grid grid-cols-2 gap-1">
                        {['Pea Shoots', 'Radish', 'Broccoli', 'Sunflower', 'Wheatgrass', 'Mustard'].map(crop => (
                          <button
                            key={crop}
                            onClick={() => getFactBasedRecommendations(crop)}
                            className="text-left px-2 py-1 text-xs text-gray-300 hover:bg-gray-700 rounded truncate"
                            disabled={isLoading}
                          >
                            {crop}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-500">Database contains 500+ varieties</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4 text-gray-400" /> : <Minimize2 className="w-4 h-4 text-gray-400" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100% - 140px)' }}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-800 text-gray-200 border border-gray-700'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className="text-xs mt-1 opacity-60">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="px-4 pb-4 border-b border-gray-700">
                  <p className="text-xs text-gray-400 mb-3">Suggestions:</p>
                  <div className="space-y-2">
                    {suggestions.slice(0, 2).map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left text-sm px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors truncate"
                        title={suggestion}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      // Prevent event bubbling to avoid conflicts with global shortcuts
                      e.stopPropagation();
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    onKeyPress={(e) => {
                      // Prevent event bubbling for all keypress events
                      e.stopPropagation();
                    }}
                    placeholder="Ask me anything about lighting design..."
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    disabled={isLoading}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-disable-shortcuts="true"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}