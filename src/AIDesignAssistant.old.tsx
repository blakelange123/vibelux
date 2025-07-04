'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Loader2, X, Wrench, Plus, Minus, RotateCw, Move, Trash2, AlertCircle, CheckCircle, Info, Eye, DollarSign, Zap, Grid3x3, History, Download, Mail, Copy, RefreshCw, ChevronRight, HelpCircle } from 'lucide-react';

interface AIAssistantProps {
  onDesignGenerated: (objects: any[]) => void;
  roomDimensions: { width: number; length: number; height: number };
  dlcFixtures: any[];
  currentObjects: any[];
}

interface ValidationDisplay {
  show: boolean;
  result: any;
}

interface ConversationContext {
  lastDesign: any[];
  designHistory: any[][];
  currentDiscussion: {
    cropType?: string;
    targetPPFD?: number;
    budget?: number;
    preferences?: any;
    constraints?: any;
    partialIntent?: any;
  };
  modifications: string[];
}

interface DesignPreview {
  rackCount: number;
  fixtureCount: number;
  totalCost: number;
  energyCost: number;
  uniformity: number;
  coverage: number;
}

export function AIDesignAssistant({ onDesignGenerated, roomDimensions, dlcFixtures, currentObjects }: AIAssistantProps) {
  // Store the user input for fixture selection
  const [userInput, setUserInput] = useState('');
  // Simple notification function
  const showNotification = (notification: { type: string; message: string; duration: number }) => {
  };
  
  const [isOpen, setIsOpen] = useState(false);
  const [undoStack, setUndoStack] = useState<any[][]>([]);
  
  // Listen for open event
  React.useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
    };
    
    window.addEventListener('openAIAssistant', handleOpenEvent);
    return () => {
      window.removeEventListener('openAIAssistant', handleOpenEvent);
    };
  }, []);
  const [redoStack, setRedoStack] = useState<any[][]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [validation, setValidation] = useState<ValidationDisplay>({ show: false, result: null });
  const [showHistory, setShowHistory] = useState(false);
  const [currentPreview, setCurrentPreview] = useState<DesignPreview | null>(null);
  const [messages, setMessages] = useState<Array<{ 
    role: 'user' | 'assistant'; 
    content: string; 
    action?: any; 
    validation?: any;
    preview?: DesignPreview;
    design?: any[];
    timestamp?: Date;
  }>>([
    { 
      role: 'assistant', 
      content: `Hello! I'm your Vibelux AI Lighting Designer. I specialize in creating optimal horticultural lighting designs.

**I can help you with:**
• **Rack Systems** - "Design a 2' x 4' rack with 200 PPFD"
• **Room Layouts** - "Create a 40x20 cannabis flower room"
• **Fixture Selection** - "Use the most efficient fixtures" or specific brands
• **Target Light Levels** - Specify PPFD, DLI, or general crop needs
• **Cost Optimization** - Work within budget constraints

**Quick Start Examples:**
• "Create a 2' x 8' rack with 300 PPFD for lettuce"
• "Design 4 racks for vertical farming with 5 tiers each"
• "I need 800 PPFD for flowering cannabis"
• "What's the best layout for a 30x30 room?"

**Advanced Features:**
• Multi-zone facility planning
• Electrical load calculations
• Uniformity optimization
• Energy efficiency analysis

How can I help design your lighting system today?` 
    }
  ]);
  
  const [context, setContext] = useState<ConversationContext>({
    lastDesign: [],
    designHistory: [],
    currentDiscussion: {},
    modifications: []
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [designHistory, setDesignHistory] = useState<Array<{design: any[], timestamp: Date, description: string}>>([]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, undoStack.length, redoStack.length]);
  
  // Undo/Redo functionality
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      const newUndoStack = undoStack.slice(0, -1);
      
      // Save current state to redo stack
      setRedoStack(prev => [...prev, currentObjects]);
      setUndoStack(newUndoStack);
      
      // Apply previous state
      onDesignGenerated(previousState);
      
      showNotification({
        type: 'info',
        message: 'Undid last action',
        duration: 2000
      });
    }
  };
  
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      const newRedoStack = redoStack.slice(0, -1);
      
      // Save current state to undo stack
      setUndoStack(prev => [...prev, currentObjects]);
      setRedoStack(newRedoStack);
      
      // Apply next state
      onDesignGenerated(nextState);
      
      showNotification({
        type: 'info',
        message: 'Redid last action',
        duration: 2000
      });
    }
  };
  
  // Save state before applying new design
  const applyDesignWithHistory = (newDesign: any[]) => {
    
    // Save current state to undo stack
    setUndoStack(prev => [...prev, currentObjects]);
    // Clear redo stack when new action is performed
    setRedoStack([]);
    // Apply new design
    onDesignGenerated(newDesign);
  };

  // Parse natural language to design intent
  const parseDesignIntent = (input: string): any => {
    const lowerInput = input.toLowerCase();
    
    // Extract target PPFD or micromoles
    const ppfdMatch = lowerInput.match(/(\d+)\s*(?:ppfd|micromole)/);
    const targetPPFD = ppfdMatch ? parseInt(ppfdMatch[1]) : 500;
    
    // Check if this is a shipping container request
    const isShippingContainer = lowerInput.includes('shipping container') || lowerInput.includes('container');
    
    // Extract mounting distance if specified (e.g., "1.5' from the lights")
    const mountingMatch = lowerInput.match(/(\d+(?:\.\d+)?)['\s]*(?:from|above|below)\s*(?:the\s*)?(?:lights?|ights?|fixtures?)/);
    const mountingDistance = mountingMatch ? parseFloat(mountingMatch[1]) : null;
    
    // First check if it's a rack specification (e.g., "2' x 4' rack" or "2.5' x 20' rack")
    // This needs to be checked BEFORE room size to avoid confusion
    let rackInfo = null;
    const rackDimensionMatch = lowerInput.match(/(\d+(?:\.\d+)?)(?:'|\s*foot|\s*ft)?\s*(?:x|by)\s*(\d+(?:\.\d+)?)(?:'|\s*foot|\s*ft)?/);
    if (rackDimensionMatch && (lowerInput.includes('rack') || lowerInput.includes('ayer'))) {
      rackInfo = {
        width: parseFloat(rackDimensionMatch[1]),
        length: parseFloat(rackDimensionMatch[2]),
        tiers: 1, // Will be updated if tiers are specified
        spacing: 1.25 // Default 15 inch spacing
      };
    }
    
    // Extract rack count from various patterns
    let rackCount = 1; // default to 1 if not specified
    const rackPatterns = [
      /(\d+)\s*racks?/i,
      /(\d+)\s*vertical\s*farm/i,
      /(\d+)\s*grow\s*rack/i,
      /create\s*(\d+)\s*rack/i,
      /a\s*rack/i // "a rack" means 1
    ];
    
    for (const pattern of rackPatterns) {
      const match = lowerInput.match(pattern);
      if (match) {
        if (match[0].includes('a rack')) {
          rackCount = 1;
        } else {
          rackCount = parseInt(match[1]);
        }
        break;
      }
    }
    
    // Extract tier/level count - handle typos like "ayers" for "layers"
    let tiers = 1; // default to single tier for rack systems
    const tierPatterns = [
      /(\d+)\s*(?:ayers?|layers?|levels?|tiers?|lyers?)(?:\s+(?:heigh|high|tall))?/i,
      /(\d+)\s*(?:shelves|shelf)/i,
      /(\d+)[\s-](?:tier|level|layer)/i
    ];
    
    for (const pattern of tierPatterns) {
      const match = lowerInput.match(pattern);
      if (match) {
        tiers = parseInt(match[1]);
        break;
      }
    }
    
    // Update rack tiers if we found rack info
    if (rackInfo) {
      rackInfo.tiers = tiers;
    }
    
    // Continue parsing for more detailed information
    const basicIntent = {
      targetPPFD,
      rackCount,
      tiers,
      cropType: lowerInput.includes('cannabis') ? 'cannabis' : 
                lowerInput.includes('lettuce') ? 'lettuce' : 
                lowerInput.includes('microgreen') ? 'microgreens' : 'lettuce'
    };
    
    
    // Additional rack patterns if not already found
    if (!rackInfo) {
      // Pattern 1: "racks that are 2' x 8'" 
      const rackMatch2 = lowerInput.match(/racks?.*?(\d+)['\s]*x\s*(\d+)/);
      // Pattern 2: "20 layers spread evenly" for total layers
      const totalLayersMatch = lowerInput.match(/(\d+)\s*layers?\s*(?:spread|total|evenly)/);
      // Pattern 3: "total height of 25'" or "25' tall"
      const heightMatch = lowerInput.match(/(?:height\s*of\s*|tall\s*)(\d+)/);
      
      if (rackMatch2) {
        rackInfo = {
          width: parseInt(rackMatch2[1]),
          length: parseInt(rackMatch2[2]),
          tiers: tiers,
          totalLayers: totalLayersMatch ? parseInt(totalLayersMatch[1]) : null,
          totalHeight: heightMatch ? parseInt(heightMatch[1]) : null,
          spacing: 1.25 // Default 15 inch spacing
        };
      }
      
      // Calculate tiers per rack if total layers given
      if (rackInfo && rackInfo.totalLayers && rackCount > 0) {
        rackInfo.tiers = Math.ceil(rackInfo.totalLayers / rackCount);
      }
      
      // Calculate spacing from total height if given
      if (rackInfo && rackInfo.totalHeight && rackInfo.tiers > 1) {
        rackInfo.spacing = rackInfo.totalHeight / rackInfo.tiers;
      }
      
      // Extract tier spacing if mentioned (e.g., "3' between layers")
      const spacingMatch = lowerInput.match(/(\d+(?:\.\d+)?)['"]?\s*(?:between|spacing)/i);
      if (spacingMatch && rackInfo) {
        rackInfo.spacing = parseFloat(spacingMatch[1]);
      }
    } else if (lowerInput.includes('rack') && !rackInfo) {
      // Default rack size for vertical farms only if no rack info found yet
      rackInfo = {
        width: 2,  // 2' wide for vertical farms
        length: 8, // 8' long standard
        tiers: tiers,
        spacing: 1.5
      };
    }
    
    // Extract bench count
    const benchMatch = lowerInput.match(/(\d+)\s*bench/);
    const benchCount = benchMatch ? parseInt(benchMatch[1]) : null;
    
    // Extract fan requirements
    const wantsFans = lowerInput.includes('fan') || lowerInput.includes('haf') || lowerInput.includes('vaf');
    const wantsHAF = lowerInput.includes('haf') || lowerInput.includes('horizontal');
    const wantsVAF = lowerInput.includes('vaf') || lowerInput.includes('vertical');
    
    // Extract room size if mentioned - handle various patterns
    const roomPatterns = [
      /room.*?(\d+)['\s]*x\s*(\d+)/i,  // "room that is 20' x 40'"
      /(\d+)['\s]*x\s*(\d+)['\s]*(?:room|space)/i,  // "20' x 40' room"
      /build.*?room.*?(\d+)['\s]*x\s*(\d+)/i,  // "build a room that is 20' x 40'"
      /(\d+)['\s]*(?:by|x)\s*(\d+)['\s]*(?:foot|feet|ft)?/i  // "20 by 40 feet"
    ];
    
    let roomSize = null;
    for (const pattern of roomPatterns) {
      const match = lowerInput.match(pattern);
      if (match && !lowerInput.includes('rack')) {  // Make sure it's not rack dimensions
        roomSize = {
          width: parseInt(match[1]),
          length: parseInt(match[2])
        };
        break;
      }
    }
    
    // Extract fixture preferences
    const wantsPhilips = lowerInput.includes('philips');
    const wantsUsed = lowerInput.includes('used') || lowerInput.includes('secondbloom');
    // Handle typos for "light" and "dlc list"
    const wantsEfficient = lowerInput.includes('efficient') || lowerInput.includes('efficiency') || lowerInput.includes('verjure') || lowerInput.includes('most efficient') || lowerInput.includes('ight from dc') || lowerInput.includes('light from dlc');
    const wantsVerjure = lowerInput.includes('verjure');
    const wantsDLC = lowerInput.includes('dlc') || lowerInput.includes('dc ist') || lowerInput.includes('dc list');
    const wantsUniform = lowerInput.includes('uniform') || lowerInput.includes('even');
    const wantsFluence = lowerInput.includes('fluence');
    
    // Extract layout preferences
    const wantsRows = lowerInput.includes('row');
    const wantsStaggered = lowerInput.includes('stagger');
    const wantsPerimeter = lowerInput.includes('perimeter') || lowerInput.includes('edge');
    
    // Extract crop type
    const cropType = lowerInput.includes('cannabis') ? 'cannabis' :
                    lowerInput.includes('microgreen') ? 'microgreens' : 
                    lowerInput.includes('lettuce') ? 'lettuce' :
                    lowerInput.includes('herb') ? 'herbs' : null;
    
    return {
      targetPPFD,
      benchCount,
      rackInfo,
      rackCount: rackCount || 1,
      roomSize,
      cropType,
      mountingDistance: mountingDistance, // in feet
      wantsFans: wantsFans || cropType === 'cannabis', // Always add fans for cannabis
      fanType: { wantsHAF, wantsVAF },
      fixturePreferences: { wantsPhilips, wantsUsed, wantsEfficient, wantsFluence, wantsVerjure },
      layoutPreferences: { wantsRows, wantsStaggered, wantsPerimeter, wantsUniform },
      isShippingContainer
    };
  };

  // Calculate design metrics and costs
  const calculateDesignMetrics = (objects: any[]): DesignPreview => {
    const fixtures = objects.filter(o => o.type === 'fixture');
    const racks = objects.filter(o => o.type === 'rack');
    
    // Calculate costs
    const fixtureUnitCost = 450; // Average LED fixture cost
    const rackUnitCost = 1200; // Vertical rack cost
    const totalFixtureCost = fixtures.length * fixtureUnitCost;
    const totalRackCost = racks.length * rackUnitCost;
    const totalCost = totalFixtureCost + totalRackCost;
    
    // Calculate energy costs
    const totalWattage = fixtures.reduce((sum, f) => sum + (f.model?.wattage || 600), 0);
    const kWh = totalWattage / 1000;
    const hoursPerYear = 365 * 12; // 12hr photoperiod
    const electricityRate = 0.12; // $/kWh
    const annualEnergyCost = kWh * hoursPerYear * electricityRate;
    
    // Calculate uniformity (simplified)
    const uniformity = fixtures.length > 0 ? 0.75 + (Math.min(fixtures.length / 10, 0.15)) : 0;
    
    // Calculate coverage
    const totalRackArea = racks.reduce((sum, r) => sum + (r.width * r.length), 0);
    const coverage = totalRackArea > 0 ? Math.min((fixtures.length * 4) / totalRackArea, 1) : 0;
    
    return {
      rackCount: racks.length,
      fixtureCount: fixtures.length,
      totalCost,
      energyCost: annualEnergyCost,
      uniformity,
      coverage
    };
  };
  
  // Generate optimized fixture layout
  const generateLayout = (intent: any) => {
    const objects: any[] = [];
    
    // Let the AI understand and optimize based on the request
    
    // If user mentioned shipping container but no room exists, create one
    if (intent.isShippingContainer && !room) {
      const containerRoom = {
        width: 8,
        length: 40,
        height: 8.5,
        ceilingHeight: 8.5,
        workingHeight: 3,
        reflectances: { ceiling: 0.8, walls: 0.7, floor: 0.2 },
        roomType: 'container',
        windows: []
      };
      setRoom(containerRoom);
      showNotification('info', 'Created standard 40ft shipping container layout');
    }
    
    // Check if this is a rack system request
    if (intent.rackInfo || intent.rackCount > 0) {
      
      // Intelligent layout optimization based on user intent
      const currentRoomWidth = room?.width || roomDimensions.width || 40;
      const currentRoomLength = room?.length || roomDimensions.length || 40;
      const currentRoomHeight = room?.height || roomDimensions.height || 10;
      
      // Apply intelligent defaults based on context
      if (!intent.rackInfo) {
        // No rack dimensions specified - intelligently determine based on context
        intent.rackInfo = {
          width: 2.5,  // Standard narrow rack for vertical farming
          length: 8,   // Standard 8ft sections
          tiers: intent.tiers || 5,
          spacing: 1.5
        };
      }
      
      // Intelligent rack placement algorithm
      const rackWidth = intent.rackInfo.width;
      const rackLength = intent.rackInfo.length;
      const requestedRackCount = intent.rackCount || 1;
      
      // Calculate optimal layout configuration
      let bestLayout = null;
      let maxEfficiency = 0;
      
      // Try different configurations and pick the best one
      for (let rows = 1; rows <= Math.ceil(Math.sqrt(requestedRackCount)); rows++) {
        const cols = Math.ceil(requestedRackCount / rows);
        const aisleWidth = intent.isShippingContainer ? 2.5 : 3.5;
        
        // Check if this configuration fits
        const totalWidth = cols * rackWidth + (cols + 1) * aisleWidth;
        const totalLength = rows * rackLength + (rows + 1) * aisleWidth;
        
        if (totalWidth <= currentRoomWidth && totalLength <= currentRoomLength) {
          // Calculate efficiency (utilized space / total space)
          const utilizedSpace = requestedRackCount * rackWidth * rackLength;
          const totalSpace = currentRoomWidth * currentRoomLength;
          const efficiency = utilizedSpace / totalSpace;
          
          if (efficiency > maxEfficiency) {
            maxEfficiency = efficiency;
            bestLayout = { rows, cols, aisleWidth };
          }
        }
      }
      
      // If no valid layout found, adjust rack count or dimensions
      if (!bestLayout) {
        // Calculate maximum possible racks that fit
        const minAisle = 2.5;
        const maxCols = Math.floor((currentRoomWidth + minAisle) / (rackWidth + minAisle));
        const maxRows = Math.floor((currentRoomLength + minAisle) / (rackLength + minAisle));
        const maxPossibleRacks = maxCols * maxRows;
        
        if (maxPossibleRacks < requestedRackCount) {
          intent.rackCount = maxPossibleRacks;
          // Recalculate best layout with adjusted count
          bestLayout = { rows: maxRows, cols: maxCols, aisleWidth: minAisle };
        }
      }
      
      // Use the best layout configuration
      const layout = bestLayout || { rows: 1, cols: requestedRackCount, aisleWidth: 3.5 };
      
      // Use actual room dimensions
      const effectiveRoomWidth = roomDimensions.width;
      const effectiveRoomLength = roomDimensions.length;
      
      // Place racks using the optimized layout
      let rackIndex = 0;
      const actualRackCount = Math.min(requestedRackCount, layout.rows * layout.cols);
      
      for (let row = 0; row < layout.rows && rackIndex < actualRackCount; row++) {
        for (let col = 0; col < layout.cols && rackIndex < actualRackCount; col++) {
          const x = layout.aisleWidth + (col * (rackWidth + layout.aisleWidth)) + rackWidth/2;
          const y = layout.aisleWidth + (row * (rackLength + layout.aisleWidth)) + rackLength/2;
          
          const rack = {
            id: `rack-${Date.now()}-${rackIndex}`,
            type: 'rack' as const,
            x: x,
            y: y,
            z: 0,
            rotation: 0,
            width: rackWidth,
            length: rackLength,
            height: intent.rackInfo.tiers * intent.rackInfo.spacing,
            enabled: true,
            customName: `${intent.rackInfo.width}'x${intent.rackInfo.length}' Rack ${rackIndex + 1}`,
            group: `rack-group-${Date.now()}-${rackIndex}`
          };
          objects.push(rack);
          rackIndex++;
        }
      }
      
      // Now place fixtures on each rack
      const allRacks = objects.filter(obj => obj.type === 'rack');
      
      // Enhanced fixture selection with scoring
      if (!dlcFixtures || dlcFixtures.length === 0) {
        console.error('No DLC fixtures available');
        return objects; // Return just the racks without fixtures
      }
      
      let selectedFixture = dlcFixtures[0];
      let fixtureScore = { efficiency: 0, spectrum: 0, coverage: 0 };
      
      // Check if user specifically wants 8' fixtures
      const wants8FootFixture = (userInput || "").toLowerCase().includes("8'") || (userInput || "").toLowerCase().includes("8 foot") || (userInput || "").toLowerCase().includes("eight foot") || (userInput || "").toLowerCase().includes("8' fixture");
      
      if (wants8FootFixture) {
        // Filter for 8' fixtures (around 94-98 inches)
        const eightFootFixtures = dlcFixtures.filter(fixture => {
          const lengthStr = fixture.Length || fixture.length || '';
          const lengthMatch = lengthStr.match(/(\d+\.?\d*)\s*in/);
          if (lengthMatch) {
            const lengthInches = parseFloat(lengthMatch[1]);
            return lengthInches >= 90 && lengthInches <= 100;
          }
          return false;
        });
        
        
        if (eightFootFixtures.length > 0) {
          // Score 8' fixtures based on efficiency and power
          const scoredFixtures = eightFootFixtures.map(fixture => {
            let score = 0;
            const wattage = fixture['Reported Input Wattage'] || fixture.wattage || 600;
            const ppf = fixture['Reported Photosynthetic Photon Flux (400-700nm)'] || fixture.ppf || 1800;
            const efficacy = ppf / wattage;
            
            // Efficiency score
            if (efficacy >= 3.0) score += 30;
            else if (efficacy >= 2.8) score += 25;
            else if (efficacy >= 2.5) score += 20;
            else score += 10;
            
            // Low power preference (user asked for low power)
            if (wattage <= 100) score += 30;
            else if (wattage <= 200) score += 20;
            else if (wattage <= 300) score += 10;
            
            
            return { fixture, score, efficacy };
          });
          
          scoredFixtures.sort((a, b) => b.score - a.score);
          selectedFixture = scoredFixtures[0].fixture;
          
        } else {
          console.warn('No 8-foot fixtures found in DLC list');
        }
      } else if ((intent.fixturePreferences?.wantsEfficient || intent.fixturePreferences?.wantsVerjure || intent.targetPPFD >= 800) && dlcFixtures.length > 0) {
        // If user asks for Verjure, explain it's not in database but recommend similar efficient fixtures
        if (intent.fixturePreferences?.wantsVerjure) {
        }
        
        // Score fixtures based on multiple criteria
        const scoredFixtures = dlcFixtures.map(fixture => {
          let score = 0;
          
          // Efficiency score (μmol/J) - prioritize for Verjure requests
          const efficacy = fixture.ppf / fixture.wattage;
          if (intent.fixturePreferences?.wantsVerjure) {
            // For Verjure requests, heavily weight efficiency
            if (efficacy >= 3.0) score += 50;
            else if (efficacy >= 2.8) score += 40;
            else if (efficacy >= 2.5) score += 30;
            else score += 10;
          } else {
            if (efficacy >= 3.0) score += 30;
            else if (efficacy >= 2.8) score += 25;
            else if (efficacy >= 2.5) score += 20;
            else score += 10;
          }
          
          // Log for debugging
          
          // Power match score
          if (intent.cropType === 'cannabis' && intent.targetPPFD >= 800) {
            if (fixture.wattage >= 600) score += 20;
            else if (fixture.wattage >= 400) score += 10;
          } else {
            if (fixture.wattage <= 400 && fixture.wattage >= 200) score += 20;
            else if (fixture.wattage < 200) score += 15;
          }
          
          // Manufacturer preference
          if (intent.fixturePreferences?.wantsPhilips && fixture.manufacturer?.includes('Philips')) score += 15;
          if (intent.fixturePreferences?.wantsFluence && fixture.manufacturer?.includes('Fluence')) score += 15;
          if (intent.fixturePreferences?.wantsVerjure && (fixture.manufacturer?.toLowerCase().includes('verjure') || fixture.model?.toLowerCase().includes('verjure'))) score += 20;
          
          // Coverage for rack width
          const rackWidth = intent.rackInfo?.width || 4;
          const idealCoverage = rackWidth <= 2 ? 'narrow' : 'wide';
          if (idealCoverage === 'narrow' && fixture.beamAngle <= 90) score += 10;
          else if (idealCoverage === 'wide' && fixture.beamAngle >= 120) score += 10;
          
          return { fixture, score, efficacy };
        });
        
        // Sort by score and select best
        scoredFixtures.sort((a, b) => b.score - a.score);
        selectedFixture = scoredFixtures[0].fixture;
        
        // Store scoring info for response
        const best = scoredFixtures[0];
        fixtureScore = {
          efficiency: best.efficacy,
          spectrum: 0.85, // Placeholder
          coverage: best.fixture.beamAngle >= 90 ? 0.9 : 0.7
        };
      }
      
      // Calculate fixture placement based on mounting distance and target PPFD
      let fixtureSpacing, fixtureHeight;
      
      // Use specified mounting distance or calculate based on target PPFD
      if (intent.mountingDistance) {
        fixtureHeight = intent.mountingDistance * 0.3048; // Convert feet to meters
      } else {
        // Default heights based on crop
        fixtureHeight = intent.targetPPFD >= 800 ? 0.6 : 0.3; // 2ft for high PPFD, 1ft for low
      }
      
      // Calculate spacing based on realistic photometric distribution
      // For linear fixtures, use area-based calculation instead of inverse square law
      const fixtureAreaM2 = 8 * 3.28 * 0.3048; // 8' x 1' in meters (2.44 m²)
      const ppfdAtHeight = selectedFixture.ppf / fixtureAreaM2; // PPFD directly under fixture
      
      // Calculate how many fixtures needed per square meter to achieve target
      const fixturesPerSqM = intent.targetPPFD / (ppfdAtHeight * 0.7); // 70% efficiency factor
      const spacingMeters = 1 / Math.sqrt(fixturesPerSqM);
      fixtureSpacing = Math.max(0.6, Math.min(spacingMeters, 2.0)); // Between 2' and 6.5'
      
      
      // For high PPFD targets (>600), reduce spacing
      if (intent.targetPPFD > 600) {
        fixtureSpacing = Math.min(fixtureSpacing, 1.2); // Maximum 4' apart for high intensity
      }
      
      // Place fixtures on each rack
      allRacks.forEach((rack, rackIdx) => {
        // For narrow racks (2' wide), use single column of fixtures
        const isNarrowRack = rack.width <= 2.5; // 2.5 feet or less
        
        // Calculate fixtures needed based on rack dimensions
        const fixtureSpacingFeet = fixtureSpacing * 3.28; // Convert to feet
        
        // For narrow racks or when fixture is specified, use 1 fixture per tier
        const fixturesPerRow = isNarrowRack ? 1 : Math.max(1, Math.floor(rack.width / fixtureSpacingFeet));
        const fixturesPerCol = Math.max(1, Math.floor(rack.length / fixtureSpacingFeet));
        
        
        // Place fixtures above each tier
        for (let tier = 0; tier < intent.rackInfo.tiers; tier++) {
          const tierHeight = rack.z + (tier * intent.rackInfo.spacing) + fixtureHeight * 3.28; // Keep in feet
          
          for (let row = 0; row < fixturesPerCol; row++) {
            for (let col = 0; col < fixturesPerRow; col++) {
              const x = rack.x; // Center position for single fixture on narrow rack
              const y = rack.y; // Center position
              
              // Parse fixture length if it's an 8' fixture
              let fixtureLength = 0.6; // default
              if (selectedFixture.Length) {
                const lengthMatch = selectedFixture.Length.match(/(\d+\.?\d*)\s*in/);
                if (lengthMatch) {
                  fixtureLength = parseFloat(lengthMatch[1]) * 0.0254; // Convert inches to meters
                }
              }
              
              objects.push({
                id: `fixture-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
                type: 'fixture' as const,
                x: x,
                y: y,
                z: tierHeight,
                rotation: isNarrowRack ? 90 : 0, // Rotate for narrow racks,
                width: fixtureLength, // For linear fixtures, length becomes width when rotated
                length: 0.15, // Narrow profile for linear fixtures
                height: 0.1,
                enabled: true,
                group: rack.group,
                model: {
                  model: selectedFixture['Model Number'] || selectedFixture.model || 'LED Fixture',
                  brand: selectedFixture.Manufacturer || selectedFixture.manufacturer || 'Unknown',
                  wattage: parseFloat(selectedFixture['Reported Input Wattage']) || selectedFixture.wattage || 600,
                  ppf: parseFloat(selectedFixture['Reported Photosynthetic Photon Flux (400-700nm)']) || selectedFixture.ppf || 1800,
                  ppfd: intent.targetPPFD,
                  beamAngle: parseFloat(selectedFixture['Reported Beam Angle']) || selectedFixture.beamAngle || 120,
                  manufacturer: selectedFixture.Manufacturer || selectedFixture.manufacturer || 'Unknown'
                },
                dimmingLevel: 100
              });
            }
          }
        }
      });
      
      // Add fans if requested
      if (intent.wantsFans) {
        // Add HAF fans at corners
        const fanHeight = allRacks[0]?.height / 2 || 3;
        const fanPositions = [
          { x: 1, y: 1, rotation: 45 },
          { x: roomDimensions.width - 1, y: 1, rotation: 135 },
          { x: roomDimensions.width - 1, y: roomDimensions.length - 1, rotation: 225 },
          { x: 1, y: roomDimensions.length - 1, rotation: 315 }
        ];
        
        fanPositions.forEach((pos, index) => {
          objects.push({
            id: `fan-haf-${Date.now()}-${index}`,
            type: 'fan',
            x: pos.x,
            y: pos.y,
            z: fanHeight,
            rotation: pos.rotation,
            width: 0.4,
            length: 0.4,
            height: 0.4,
            enabled: true,
            fanType: 'HAF',
            cfm: 2000,
            customName: `HAF Fan ${index + 1}`
          });
        });
        
        // Add VAF fans if room is large
        if (roomDimensions.width > 10 || roomDimensions.length > 10) {
          objects.push({
            id: `fan-vaf-${Date.now()}`,
            type: 'fan',
            x: roomDimensions.width / 2,
            y: roomDimensions.length / 2,
            z: 0.5,
            rotation: 0,
            width: 0.6,
            length: 0.6,
            height: 0.3,
            enabled: true,
            fanType: 'VAF',
            cfm: 3000,
            customName: 'VAF Floor Fan'
          });
        }
      }
      
      return objects;
    }
    
    // Original bench-based layout code
    const benchWidth = 1.83; // 6 feet
    const benchLength = roomDimensions.length * 0.8; // 80% of room length
    const aisleWidth = 1.2; // 4 feet
    
    const benchesPerRow = Math.floor((roomDimensions.width - aisleWidth) / (benchWidth + aisleWidth));
    const actualBenchCount = intent.benchCount || benchesPerRow * 2; // Default to 2 rows
    
    // Place benches
    const benchSpacing = roomDimensions.width / (benchesPerRow + 1);
    let benchIndex = 0;
    
    for (let row = 0; row < Math.ceil(actualBenchCount / benchesPerRow); row++) {
      for (let col = 0; col < benchesPerRow && benchIndex < actualBenchCount; col++) {
        objects.push({
          id: `bench-${Date.now()}-${benchIndex}`,
          type: 'bench',
          x: (col + 1) * benchSpacing,
          y: roomDimensions.length / 2,
          z: 0,
          rotation: 0,
          width: benchWidth,
          length: benchLength,
          height: 0.8,
          enabled: true,
          material: 'metal',
          hasWheels: true
        });
        benchIndex++;
      }
    }
    
    // Calculate fixture requirements
    const benchArea = actualBenchCount * benchWidth * benchLength;
    const targetTotalPPF = intent.targetPPFD * benchArea;
    
    // Select best fixture
    let selectedFixture = dlcFixtures[0]; // Default
    
    if (intent.fixturePreferences.wantsEfficient) {
      selectedFixture = dlcFixtures.reduce((best, fixture) => 
        (fixture.ppf / fixture.wattage) > (best.ppf / best.wattage) ? fixture : best
      );
    } else if (intent.fixturePreferences.wantsPhilips) {
      selectedFixture = dlcFixtures.find(f => f.manufacturer?.includes('Philips')) || selectedFixture;
    }
    
    // Apply depreciation if used fixtures
    const depreciationFactor = intent.fixturePreferences.wantsUsed ? 0.8 : 1.0;
    const effectivePPF = selectedFixture.ppf * depreciationFactor;
    
    // Calculate number of fixtures needed
    const fixturesNeeded = Math.ceil(targetTotalPPF / effectivePPF);
    
    // Generate fixture layout
    const fixtureHeight = 4; // meters
    const optimalSpacing = Math.sqrt(benchArea / fixturesNeeded);
    
    if (intent.layoutPreferences.wantsUniform || !intent.layoutPreferences.wantsRows) {
      // Grid layout for uniformity
      const cols = Math.ceil(Math.sqrt(fixturesNeeded * roomDimensions.width / roomDimensions.length));
      const rows = Math.ceil(fixturesNeeded / cols);
      
      let fixtureIndex = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols && fixtureIndex < fixturesNeeded; col++) {
          const x = (col + 1) * (roomDimensions.width / (cols + 1));
          const y = (row + 1) * (roomDimensions.length / (rows + 1));
          
          // Stagger if requested
          const xOffset = intent.layoutPreferences.wantsStaggered && row % 2 ? optimalSpacing / 2 : 0;
          
          objects.push({
            id: `fixture-${Date.now()}-${fixtureIndex}`,
            type: 'fixture',
            x: x + xOffset,
            y: y,
            z: fixtureHeight,
            rotation: 0,
            width: 1.2,
            length: 0.6,
            height: 0.2,
            enabled: true,
            model: {
              name: selectedFixture.model || 'Selected Fixture',
              wattage: selectedFixture.wattage,
              ppf: selectedFixture.ppf,
              beamAngle: 120,
              manufacturer: selectedFixture.manufacturer
            }
          });
          fixtureIndex++;
        }
      }
    }
    
    return objects;
  };

  // Intelligent conversation analysis
  const analyzeConversation = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    // Modification requests
    if (lowerInput.includes('change') || lowerInput.includes('modify') || 
        lowerInput.includes('adjust') || lowerInput.includes('move') ||
        lowerInput.includes('add more') || lowerInput.includes('remove') ||
        lowerInput.includes('too many') || lowerInput.includes('too few') ||
        lowerInput.includes('closer') || lowerInput.includes('farther') ||
        lowerInput.includes('higher') || lowerInput.includes('lower')) {
      return 'modification';
    }
    
    // Feedback on current design
    if (lowerInput.includes('too bright') || lowerInput.includes('too dim') ||
        lowerInput.includes('not enough') || lowerInput.includes('too much') ||
        lowerInput.includes('looks good') || lowerInput.includes('perfect') ||
        lowerInput.includes('concerned about') || lowerInput.includes('worried')) {
      return 'feedback';
    }
    
    // Questions about the design
    if (lowerInput.includes('why') || lowerInput.includes('how come') ||
        lowerInput.includes('what if') || lowerInput.includes('could we') ||
        lowerInput.includes('would it be better')) {
      return 'question';
    }
    
    // New design request
    if (lowerInput.match(/\d+\s*[x×]\s*\d+/) || lowerInput.includes('start over') ||
        lowerInput.includes('new design') || lowerInput.includes('different approach')) {
      return 'new_design';
    }
    
    // Information request
    if (lowerInput.includes('what is') || lowerInput.includes('explain') ||
        lowerInput.includes('tell me about') || lowerInput.includes('how does')) {
      return 'information';
    }
    
    return 'general';
  };

  // Modify existing design based on feedback
  const modifyDesign = (input: string, currentDesign: any[]): { objects: any[], explanation: string } => {
    const lowerInput = input.toLowerCase();
    let modifiedDesign = [...currentDesign];
    let explanation = '';
    
    // Spacing adjustments
    if (lowerInput.includes('closer') || lowerInput.includes('tighter')) {
      const fixtures = modifiedDesign.filter(obj => obj.type === 'fixture');
      const centerX = roomDimensions.width / 2;
      const centerY = roomDimensions.length / 2;
      
      fixtures.forEach(fixture => {
        const dx = fixture.x - centerX;
        const dy = fixture.y - centerY;
        fixture.x = centerX + dx * 0.85;
        fixture.y = centerY + dy * 0.85;
      });
      
      explanation = 'I\'ve moved the fixtures 15% closer together. This will increase light overlap and potentially raise your average PPFD.';
    }
    
    else if (lowerInput.includes('farther') || lowerInput.includes('spread')) {
      const fixtures = modifiedDesign.filter(obj => obj.type === 'fixture');
      const centerX = roomDimensions.width / 2;
      const centerY = roomDimensions.length / 2;
      
      fixtures.forEach(fixture => {
        const dx = fixture.x - centerX;
        const dy = fixture.y - centerY;
        fixture.x = centerX + dx * 1.15;
        fixture.y = centerY + dy * 1.15;
      });
      
      explanation = 'I\'ve spread the fixtures 15% farther apart. This will improve uniformity but may reduce average PPFD.';
    }
    
    // Height adjustments
    else if (lowerInput.includes('lower') || lowerInput.includes('closer to plants')) {
      modifiedDesign.forEach(obj => {
        if (obj.type === 'fixture' && obj.z > 1) {
          obj.z -= 0.5;
        }
      });
      explanation = 'I\'ve lowered the fixtures by 0.5m. This will increase light intensity but reduce coverage area.';
    }
    
    else if (lowerInput.includes('higher') || lowerInput.includes('raise')) {
      modifiedDesign.forEach(obj => {
        if (obj.type === 'fixture') {
          obj.z += 0.5;
        }
      });
      explanation = 'I\'ve raised the fixtures by 0.5m. This will improve coverage uniformity but reduce intensity.';
    }
    
    // Add/remove racks
    else if (lowerInput.includes('add') && lowerInput.includes('rack')) {
      const racks = modifiedDesign.filter(obj => obj.type === 'rack');
      if (racks.length > 0) {
        const lastRack = racks[racks.length - 1];
        const fixtures = modifiedDesign.filter(obj => obj.type === 'fixture' && obj.group === lastRack.group);
        
        // Create new rack with fixtures
        const newRack = {
          ...lastRack,
          id: `rack-${Date.now()}`,
          x: lastRack.x + lastRack.width + 1.2, // Add aisle width
          group: `rack-group-${Date.now()}`
        };
        
        modifiedDesign.push(newRack);
        
        // Clone fixtures for new rack
        fixtures.forEach(fixture => {
          modifiedDesign.push({
            ...fixture,
            id: `fixture-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF}`,
            x: fixture.x + lastRack.width + 1.2,
            group: newRack.group
          });
        });
        
        explanation = `I've added another rack with fixtures. You now have ${racks.length + 1} racks total.`;
      }
    }
    
    else if (lowerInput.includes('remove') && lowerInput.includes('rack')) {
      const racks = modifiedDesign.filter(obj => obj.type === 'rack');
      if (racks.length > 1) {
        const lastRack = racks[racks.length - 1];
        modifiedDesign = modifiedDesign.filter(obj => 
          !(obj.group === lastRack.group)
        );
        explanation = `I've removed one rack and its fixtures. You now have ${racks.length - 1} racks remaining.`;
      }
    }
    
    // Add/remove fixtures
    else if (lowerInput.includes('add more') || lowerInput.includes('not enough light') || (lowerInput.includes('increase ppfd'))) {
      const fixtures = modifiedDesign.filter(obj => obj.type === 'fixture');
      if (fixtures.length > 0) {
        const avgX = fixtures.reduce((sum, f) => sum + f.x, 0) / fixtures.length;
        const avgY = fixtures.reduce((sum, f) => sum + f.y, 0) / fixtures.length;
        
        const newFixture = {
          ...fixtures[0],
          id: `fixture-${Date.now()}`,
          x: avgX + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 4,
          y: avgY + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 4
        };
        
        modifiedDesign.push(newFixture);
        explanation = `I've added another fixture to increase light levels. You now have ${fixtures.length + 1} fixtures total.`;
      }
    }
    
    else if (lowerInput.includes('remove') || lowerInput.includes('too many') || lowerInput.includes('too bright')) {
      const fixtures = modifiedDesign.filter(obj => obj.type === 'fixture');
      if (fixtures.length > 1) {
        modifiedDesign = modifiedDesign.filter((obj, index) => 
          !(obj.type === 'fixture' && index === modifiedDesign.length - 1)
        );
        explanation = `I've removed one fixture. You now have ${fixtures.length - 1} fixtures remaining.`;
      }
    }
    
    // Fixture type changes
    else if (lowerInput.includes('more efficient') || lowerInput.includes('save energy')) {
      const efficientFixture = dlcFixtures.reduce((best, fixture) => 
        (fixture.ppf / fixture.wattage) > (best.ppf / best.wattage) ? fixture : best
      );
      
      modifiedDesign.forEach(obj => {
        if (obj.type === 'fixture' && obj.model) {
          obj.model = {
            ...efficientFixture,
            ppfd: obj.model.ppfd
          };
        }
      });
      
      explanation = `I've switched to ${efficientFixture.manufacturer} ${efficientFixture.model} fixtures - they're the most efficient option at ${(efficientFixture.ppf / efficientFixture.wattage).toFixed(1)} μmol/J.`;
    }
    
    return { objects: modifiedDesign, explanation };
  };
  
  // Generate conversational responses
  const generateConversationalResponse = (input: string, conversationType: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (conversationType === 'feedback') {
      if (lowerInput.includes('too bright') || lowerInput.includes('too much light')) {
        return 'I understand the light levels are too high. Would you like me to:\n• Remove some fixtures\n• Raise them higher\n• Switch to lower wattage models\n• Spread them farther apart\n\nWhat would work best for your situation?';
      }
      
      if (lowerInput.includes('perfect') || lowerInput.includes('looks good')) {
        return 'Great! I\'m glad the design meets your needs. Would you like me to:\n• Calculate the electrical requirements\n• Generate a cost analysis\n• Export the design\n• Make any fine adjustments?';
      }
      
      if (lowerInput.includes('worried about') || lowerInput.includes('concerned')) {
        return 'I hear your concern. Let me address that. What specifically worries you?\n• Energy costs\n• Heat management\n• Initial investment\n• Uniformity\n• Something else?\n\nI can adjust the design to address your specific concern.';
      }
    }
    
    if (conversationType === 'question') {
      if (lowerInput.includes('why') && lowerInput.includes('spacing')) {
        return 'The fixture spacing is optimized based on:\n• Your target PPFD\n• The fixture\'s beam angle (typically 120°)\n• Desired uniformity (>0.7)\n• Mounting height\n\nCloser spacing increases intensity but may create hot spots. Wider spacing improves uniformity but requires more fixtures.';
      }
      
      if (lowerInput.includes('what if')) {
        return 'That\'s a great question! Let me think through that scenario. To give you the best answer, could you be more specific about what parameter you\'d like to change?';
      }
    }
    
    return 'I\'m here to help refine your design. Tell me what you\'d like to adjust!';
  };
  
  // Generate help responses
  const generateHelpResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    // PPFD/DLI explanations
    if (lowerInput.includes('ppfd')) {
      return 'PPFD (Photosynthetic Photon Flux Density) measures the amount of light hitting your plants in µmol/m²/s. Common targets:\n\n• Lettuce/Herbs: 150-250 µmol/m²/s\n• Cannabis Veg: 300-600 µmol/m²/s\n• Cannabis Flower: 600-1000 µmol/m²/s\n\nUse the Calculations panel on the right to see your current PPFD values.';
    }
    
    if (lowerInput.includes('dli')) {
      return 'DLI (Daily Light Integral) is the total amount of light your plants receive per day, measured in mol/m²/day.\n\nDLI = PPFD × Photoperiod × 0.0036\n\nTypical DLI targets:\n• Lettuce: 12-17 mol/m²/day\n• Tomatoes: 20-30 mol/m²/day\n• Cannabis: 25-45 mol/m²/day';
    }
    
    // Navigation help
    if (lowerInput.includes('array tool')) {
      return 'To use the Array Tool:\n1. Click the grid icon in the Tool Palette (left side)\n2. Or right-click any fixture and select "Create Array"\n3. Set your rows, columns, and spacing\n4. Click "Create Array" to generate';
    }
    
    if (lowerInput.includes('cfd') || lowerInput.includes('airflow')) {
      return 'To access CFD Analysis:\n1. Click "Advanced" in the top toolbar\n2. Select "CFD Analysis" from the dropdown\n3. Place fans using the Fan tool\n4. Click "Run Analysis" to simulate airflow\n\nCFD helps optimize air circulation and temperature uniformity.';
    }
    
    if (lowerInput.includes('export') || lowerInput.includes('save')) {
      return 'To save or export your design:\n• Save Project: Ctrl/Cmd + S\n• Export PDF Report: Click Export → PDF Report\n• Export to Excel: Click Export → Excel Spreadsheet\n• Export CAD: Click Export → DXF/DWG\n\nAll export options are in the top toolbar.';
    }
    
    if (lowerInput.includes('thermal')) {
      return 'Thermal Management features:\n1. Click "Advanced" → "LED Thermal Management"\n2. View heat maps by enabling thermal overlay\n3. The system calculates BTU load automatically\n4. Use this data for HVAC sizing\n\nGo to Climate Tools for detailed HVAC calculations.';
    }
    
    // Feature explanations
    if (lowerInput.includes('spectrum')) {
      return 'Spectrum Analysis shows the light quality:\n• Blue (400-500nm): Vegetative growth, compact plants\n• Green (500-600nm): Canopy penetration\n• Red (600-700nm): Flowering, fruiting\n• Far Red (700-800nm): Stem elongation, flowering triggers\n\nAccess via Advanced → Spectrum Analysis';
    }
    
    // Uniformity and optimization
    if (lowerInput.includes('uniformity')) {
      return 'To improve light uniformity:\n\n1. Check current uniformity in Calculations panel (target >0.7)\n2. Use the Array Tool for even spacing\n3. Consider overlapping light patterns\n4. Adjust mounting height (higher = more uniform, less intense)\n5. Add perimeter fixtures for edge compensation\n\nTip: Enable False Color view to visualize uniformity.';
    }
    
    // Project management
    if (lowerInput.includes('project') || lowerInput.includes('template')) {
      return 'Project Management:\n\n• New Project: Click "New" in top toolbar\n• Save: Ctrl/Cmd + S\n• Load Template: File → Room Templates\n• Project Manager: Advanced → Project Manager\n\nTemplates available:\n- Cannabis Flower Room\n- Vertical Farm\n- Greenhouse\n- Research Chamber';
    }
    
    // Electrical planning
    if (lowerInput.includes('electrical') || lowerInput.includes('circuit')) {
      return 'Electrical Planning:\n\n1. Click "Electrical" in Tool Palette\n2. View total load in Calculations panel\n3. Circuit Planning shows breaker requirements\n4. Export electrical schedule to Excel\n\nThe system automatically calculates:\n- Total amperage\n- Circuit distribution\n- Voltage drop\n- Panel requirements';
    }
    
    // Current values from design
    if (lowerInput.includes('current') || lowerInput.includes('my ppfd') || lowerInput.includes('my dli')) {
      const avgPPFD = currentObjects.length > 0 ? 'Check the Calculations panel (right side) for live values' : 'No fixtures placed yet';
      return `Current design metrics:\n\n${avgPPFD}\n\nThe Calculations panel shows:\n• Average PPFD\n• Min/Max PPFD\n• Uniformity ratio\n• DLI at various photoperiods\n• Energy usage\n• Coverage area`;
    }
    
    // General help
    return 'I can help you with:\n\n• Design: "Create a 20x40 grow room with 500 PPFD"\n• Calculations: "What is my current DLI?"\n• Navigation: "How do I use the array tool?"\n• Features: "Explain CFD analysis"\n• Optimization: "How can I improve uniformity?"\n\nWhat would you like help with?';
  };

  // Design Preview Component
  const DesignPreviewCard = ({ preview, design }: { preview: DesignPreview; design: any[] }) => (
    <div className="bg-gray-800 rounded-lg p-4 mt-3 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-purple-400" />
          Design Preview
        </h4>
        <div className="flex gap-2">
          <button
            onClick={(event) => {
              applyDesignWithHistory(design);
              showNotification({
                type: 'success',
                message: 'Design applied to canvas! ✨',
                duration: 3000
              });
              
              // Visual feedback - flash the button
              const button = event.currentTarget as HTMLButtonElement;
              button.classList.add('animate-pulse');
              setTimeout(() => button.classList.remove('animate-pulse'), 1000);
            }}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg flex items-center gap-1"
          >
            <CheckCircle className="w-3 h-3" />
            Apply
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-gray-900 rounded p-2">
          <div className="text-gray-400 mb-1">Layout</div>
          <div className="text-white font-medium">{preview.rackCount} Racks × {preview.fixtureCount} Fixtures</div>
        </div>
        <div className="bg-gray-900 rounded p-2">
          <div className="text-gray-400 mb-1">Total Cost</div>
          <div className="text-green-400 font-medium">${preview.totalCost.toLocaleString()}</div>
        </div>
        <div className="bg-gray-900 rounded p-2">
          <div className="text-gray-400 mb-1">Annual Energy</div>
          <div className="text-yellow-400 font-medium">${preview.energyCost.toLocaleString()}/yr</div>
        </div>
        <div className="bg-gray-900 rounded p-2">
          <div className="text-gray-400 mb-1">Uniformity</div>
          <div className="text-blue-400 font-medium">{(preview.uniformity * 100).toFixed(0)}%</div>
        </div>
      </div>
      
      {/* Visual representation */}
      <div className="mt-3 bg-gray-900 rounded p-3 relative h-32">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: Math.min(preview.rackCount, 4) }).map((_, i) => (
              <div key={i} className="w-16 h-20 bg-gray-700 rounded border border-gray-600 flex items-center justify-center">
                <Grid3x3 className="w-8 h-8 text-gray-500" />
              </div>
            ))}
          </div>
          {preview.rackCount > 4 && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              +{preview.rackCount - 4} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    setIsProcessing(true);
    setProcessingStep('Analyzing request...');
    const currentUserInput = input;
    setUserInput(currentUserInput); // Store for fixture selection
    setInput(''); // Clear input immediately
    const userMessage = { role: 'user' as const, content: currentUserInput, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Try Claude API integration
      try {
        setProcessingStep('Connecting to AI...');
        const response = await fetch('/api/ai-design-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: currentUserInput,
            context: {
              roomDimensions: roomDimensions || { width: 40, length: 40, height: 10 },
              currentDesign: currentObjects,
              dlcFixtures: dlcFixtures,
              preferences: {
                targetPPFD: context.currentDiscussion.targetPPFD,
                budget: context.currentDiscussion.budget,
                cropType: context.currentDiscussion.cropType,
                growthStage: context.currentDiscussion.growthStage
              }
            },
            conversationHistory: messages.slice(-10).map(m => ({
              role: m.role,
              content: m.content
            }))
          })
        });
        
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error response:', errorText);
          throw new Error(`API returned ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        
        // Handle different intents from Claude
        if (data.intent === 'new_design' && data.design?.zones?.length > 0) {
            setProcessingStep('Processing AI design...');
            
            // Extract objects from the Claude response
            const newObjects: any[] = [];
            
            data.design.zones.forEach((zone: any) => {
              // Add fixtures
              if (zone.fixtures) {
                zone.fixtures.forEach((fixture: any) => {
                  const dlcFixture = dlcFixtures.find(f => 
                    f.model === fixture.model || 
                    (f.manufacturer === fixture.manufacturer && f.model.includes(fixture.model))
                  );
                  
                  newObjects.push({
                    id: fixture.id || `fixture-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
                    type: 'fixture' as const,
                    x: fixture.x,
                    y: fixture.y,
                    z: fixture.z || zone.dimensions.height - 3,
                    rotation: fixture.rotation || 0,
                    width: 4,
                    length: 2,
                    height: 0.5,
                    enabled: true,
                    model: dlcFixture ? {
                      id: dlcFixture.id,
                      name: dlcFixture.model,
                      manufacturer: dlcFixture.manufacturer,
                      wattage: dlcFixture.wattage,
                      ppf: dlcFixture.ppf,
                      beamAngle: 120,
                      efficacy: dlcFixture.ppf / dlcFixture.wattage,
                      spectrum: fixture.spectrum || 'Full spectrum',
                      isDLC: true
                    } : {
                      name: fixture.model,
                      manufacturer: fixture.manufacturer || 'Generic',
                      wattage: fixture.wattage,
                      ppf: fixture.ppf,
                      beamAngle: 120,
                      efficacy: fixture.ppf / fixture.wattage,
                      spectrum: fixture.spectrum || 'Full spectrum'
                    },
                    dimmingLevel: fixture.dimmingLevel || 100
                  });
                });
              }
              
              // Add racks
              if (zone.racks) {
                zone.racks.forEach((rack: any) => {
                  newObjects.push({
                    id: rack.id || `rack-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
                    type: 'rack' as const,
                    x: rack.x,
                    y: rack.y,
                    z: 0,
                    rotation: rack.orientation === 'east-west' ? 90 : 0,
                    width: rack.width,
                    length: rack.length,
                    height: rack.tiers * (rack.tierHeight || 1.5),
                    enabled: true,
                    tiers: rack.tiers,
                    tierHeight: rack.tierHeight || 1.5
                  });
                });
              }
              
              // Add HVAC fans
              if (zone.environmental?.hvacFans) {
                zone.environmental.hvacFans.forEach((fan: any) => {
                  newObjects.push({
                    id: `fan-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
                    type: 'hvacFan' as const,
                    x: fan.placement.x,
                    y: fan.placement.y,
                    z: fan.placement.z,
                    rotation: 0,
                    width: 2,
                    length: 2,
                    height: 1,
                    enabled: true,
                    fanType: fan.type,
                    airflow: fan.cfm,
                    power: 200,
                    diameter: 24,
                    mountType: fan.placement.z > 5 ? 'ceiling' : 'wall'
                  });
                });
              }
            });
            
            setProcessingStep('Applying design to canvas...');
            applyDesignWithHistory(newObjects);
            
            // Update context
            setContext(prev => ({
              ...prev,
              lastDesign: newObjects,
              designHistory: [...prev.designHistory, newObjects],
              currentDiscussion: {
                ...prev.currentDiscussion,
                cropType: data.design.zones[0]?.cropType,
                targetPPFD: data.design.zones[0]?.targetPPFD,
                budget: data.design.costs?.total
              }
            }));
            
            // Add to design history
            setDesignHistory(prev => [...prev, {
              design: newObjects,
              timestamp: new Date(),
              description: currentUserInput
            }]);
            
            // Create preview from Claude metrics
            const preview = data.design.metrics ? {
              rackCount: newObjects.filter(o => o.type === 'rack').length,
              fixtureCount: newObjects.filter(o => o.type === 'fixture').length,
              totalCost: data.design.costs?.total || 0,
              energyCost: data.design.costs?.annualOperating || 0,
              uniformity: data.design.metrics.uniformity || 0.7,
              coverage: data.design.metrics.coverage || 85
            } : calculateDesignMetrics(newObjects);
            
            // Show response with validation info
            let responseText = data.response;
            if (data.design.validation) {
              responseText += '\n\n**Validation Results:**\n';
              if (data.design.validation.meetsTargets) {
                responseText += '✅ Design meets all targets\n';
              }
              if (data.design.validation.issues?.length > 0) {
                responseText += '\n⚠️ **Issues Found:**\n';
                data.design.validation.issues.forEach((issue: string) => {
                  responseText += `• ${issue}\n`;
                });
              }
              if (data.design.validation.recommendations?.length > 0) {
                responseText += '\n💡 **Recommendations:**\n';
                data.design.validation.recommendations.forEach((rec: string) => {
                  responseText += `• ${rec}\n`;
                });
              }
            }
            
            // Show alternatives if provided
            if (data.alternatives?.length > 0) {
              responseText += '\n\n**Alternative Approaches:**\n';
              data.alternatives.forEach((alt: any, i: number) => {
                responseText += `\n${i + 1}. ${alt.description}\n`;
                if (alt.prosAndCons?.pros?.length > 0) {
                  responseText += '   Pros: ' + alt.prosAndCons.pros.join(', ') + '\n';
                }
                if (alt.prosAndCons?.cons?.length > 0) {
                  responseText += '   Cons: ' + alt.prosAndCons.cons.join(', ') + '\n';
                }
              });
            }
            
            setMessages(prev => [...prev, {
              role: 'assistant' as const,
              content: responseText,
              preview,
              design: newObjects,
              timestamp: new Date()
            }]);
            
            setCurrentPreview(preview);
            
            showNotification({
              type: 'success',
              message: `AI designed: ${newObjects.filter(o => o.type === 'rack').length} racks, ${newObjects.filter(o => o.type === 'fixture').length} fixtures`,
              duration: 3000
            });
            
          } else if (data.intent === 'modify' && data.design) {
            // Handle modification intent
            setProcessingStep('Modifying design...');
            // Similar processing for modifications
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: data.response 
            }]);
            
          } else if (data.intent === 'clear') {
            applyDesignWithHistory([]);
            showNotification({
              type: 'info',
              message: 'Canvas cleared',
              duration: 2000
            });
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: data.response 
            }]);
            
          } else {
            // For questions, validation, or other intents
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: data.response 
            }]);
          }
          
          setInput('');
          setIsProcessing(false);
          setProcessingStep('');
          return;
        
      } catch (apiError) {
        console.error('Claude API error:', apiError);
        console.error('API Error details:', {
          message: apiError instanceof Error ? apiError.message : 'Unknown error',
          status: (apiError as any)?.status,
          statusText: (apiError as any)?.statusText,
          response: (apiError as any)?.response
        });
        // Continue to fallback system
      }
      
      // Fallback to original rule-based system
      const conversationType = analyzeConversation(currentUserInput);
      
      // Handle modifications to existing design
      if (conversationType === 'modification' && context.lastDesign.length > 0) {
        const { objects, explanation } = modifyDesign(currentUserInput, context.lastDesign);
        
        // Apply the changes
        applyDesignWithHistory(objects);
        
        // Update context
        setContext(prev => ({
          ...prev,
          lastDesign: objects,
          designHistory: [...prev.designHistory, objects],
          modifications: [...prev.modifications, currentUserInput]
        }));
        
        // Generate response
        let response = explanation;
        response += '\n\nAnything else you\'d like me to adjust? I can:\n• Change spacing or height\n• Add/remove fixtures\n• Switch to different models\n• Optimize for specific goals';
        
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      }
      
      // Handle feedback and questions
      else if (conversationType === 'feedback' || conversationType === 'question') {
        const response = generateConversationalResponse(currentUserInput, conversationType);
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      }
      
      // Handle new design requests
      else if (conversationType === 'new_design' || (conversationType === 'general' && currentUserInput.match(/\d+/))) {
        // Extract information from natural conversation
        const lowerInput = currentUserInput.toLowerCase();
        
        // Try to understand the context
        const designContext = { ...context.currentDiscussion };
        
        // Parse and create design
        let intent = parseDesignIntent(currentUserInput);
        
        // Merge with partial intent if we have one
        if (context.currentDiscussion.partialIntent) {
          intent = {
            ...context.currentDiscussion.partialIntent,
            ...intent,
            // Merge rack info
            rackInfo: {
              ...context.currentDiscussion.partialIntent.rackInfo,
              ...intent.rackInfo
            }
          };
        }
        
        // Update context with parsed info
        if (intent.cropType) designContext.cropType = intent.cropType;
        if (intent.targetPPFD) designContext.targetPPFD = intent.targetPPFD;
        
        setContext(prev => ({
          ...prev,
          currentDiscussion: designContext
        }));
        
        // Clear existing objects if requested
        if (lowerInput.includes('delete') || lowerInput.includes('clear') || lowerInput.includes('remove all')) {
          onDesignGenerated([]);
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: 'Room cleared. Ready to create a new design. What would you like to create?' 
          }]);
          return;
        }
        
        // Always try to create a design if we have any rack or fixture info
        if (intent.rackInfo || intent.benchCount || intent.targetPPFD > 0) {
          // Fill in defaults if missing
          if (!intent.rackInfo && intent.targetPPFD > 0) {
            intent.rackInfo = {
              width: 2,
              length: 8,
              tiers: 5, // Default 5 tiers
              spacing: 1.5
            };
            intent.rackCount = intent.rackCount || 4; // Default 4 racks
          }
          
          setProcessingStep('Generating layout...');
          const newObjects = generateLayout(intent);
          
          setProcessingStep('Calculating costs...');
          const preview = calculateDesignMetrics(newObjects);
          
          setProcessingStep('Applying to canvas...');
          applyDesignWithHistory(newObjects);
          
          // Visual feedback
          showNotification({
            type: 'success',
            message: `Created design with ${newObjects.filter(o => o.type === 'rack').length} racks and ${newObjects.filter(o => o.type === 'fixture').length} fixtures`,
            duration: 3000
          });
          
          // Add to design history
          setDesignHistory(prev => [...prev, {
            design: newObjects,
            timestamp: new Date(),
            description: currentUserInput
          }]);
          
          // Update context
          setContext(prev => ({
            ...prev,
            lastDesign: newObjects,
            designHistory: [...prev.designHistory, newObjects]
          }));
          
          // Generate conversational response
          let response = '';
          if (intent.rackInfo) {
            const fixtureCount = newObjects.filter(o => o.type === 'fixture').length;
            const fanCount = newObjects.filter(o => o.type === 'fan').length;
            const rackCount = newObjects.filter(o => o.type === 'rack').length;
            
            if (intent.cropType === 'cannabis') {
              response = `Perfect! I've designed your cannabis flowering room.\n\n`;
              response += `**Room Layout:**\n`;
              response += `• ${rackCount} rolling tables (${intent.rackInfo.width}' × ${intent.rackInfo.length}' each)\n`;
              response += `• ${fixtureCount} high-output LED fixtures\n`;
              response += `• Target: ${intent.targetPPFD} µmol/m²/s for flowering\n`;
              if (fanCount > 0) {
                response += `• ${fanCount} circulation fans (HAF/VAF)\n`;
              }
            } else {
              response = `Perfect! I've designed your vertical farming system.\n\n`;
              response += `**Setup Details:**\n`;
              response += `• Room: ${Math.round(roomDimensions.width)}' × ${Math.round(roomDimensions.length)}'\n`;
              response += `• ${rackCount} racks (${intent.rackInfo.width}' × ${intent.rackInfo.length}' each)\n`;
              response += `• ${intent.rackInfo.tiers} layers per rack with ${intent.rackInfo.spacing.toFixed(1)}' spacing\n`;
              if (intent.rackInfo.totalLayers) {
                response += `• ${intent.rackInfo.totalLayers} total growing layers\n`;
              }
              response += `• ${fixtureCount} LED fixtures total\n`;
              response += `• Target: ${intent.targetPPFD} µmol/m²/s`;
              if (intent.mountingDistance) {
                response += ` at ${intent.mountingDistance}' mounting height\n`;
              } else {
                response += `\n`;
              }
              if (fanCount > 0) {
                response += `• ${fanCount} fans for optimal airflow\n`;
              }
            }
            
            response += `\n**Fixture Selection:**\n`;
            const fixture = newObjects.find(o => o.type === 'fixture');
            
            // Add note about Verjure if requested
            if (intent.fixturePreferences?.wantsVerjure) {
              response += `*Note: While Verjure fixtures aren't in our DLC database, I've selected the most efficient certified alternatives.*\n\n`;
            }
            
            if (fixture?.model) {
              response += `• ${fixture.model.manufacturer} ${fixture.model.model}\n`;
              response += `• ${fixture.model.wattage}W @ ${(fixture.model.ppf/fixture.model.wattage).toFixed(1)} µmol/J efficiency\n`;
              const fixturesPerLayer = Math.round(fixtureCount / (rackCount * intent.rackInfo.tiers));
              response += `• Fixtures per layer: ${fixturesPerLayer} (${Math.round(fixturesPerLayer / rackCount)} per rack)\n`;
              response += `• Total power: ${(fixtureCount * fixture.model.wattage / 1000).toFixed(1)} kW\n`;
              
              // Warning if mounting height is challenging
              if (intent.mountingDistance && intent.mountingDistance > 2 && intent.targetPPFD > 600) {
                response += `\n⚠️ Note: ${intent.mountingDistance}' mounting height with ${intent.targetPPFD} PPFD requires `;
                response += `very dense fixture placement. Consider:\n`;
                response += `• Reducing mounting height to 1-2'\n`;
                response += `• Using higher wattage fixtures\n`;
                response += `• Accepting lower PPFD (400-500)\n`;
              }
            }
            response += `\nNeed adjustments? I can modify the design or explain the calculations.`;
          } else {
            response = `I've created an initial design with ${newObjects.filter(o => o.type === 'fixture').length} fixtures.\n\n`;
            response += `Tell me more about your operation:\n`;
            response += `• What crops are you growing?\n`;
            response += `• What's your target PPFD?\n`;
            response += `• Any specific requirements?\n\n`;
            response += `I can adjust everything based on your needs!`;
          }
          
          // Basic validation
          if (newObjects.length === 0) {
            response += `\n\n⚠️ **Note:** The design generation didn't produce any objects. Try providing more specific details.`;
          }
          
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: response,
            preview,
            design: newObjects,
            timestamp: new Date()
          }]);
        } else {
          // Need more information - but be proactive
          let response = 'I\'ll help you design that! ';
          
          // Store partial intent in context
          setContext(prev => ({
            ...prev,
            currentDiscussion: {
              ...prev.currentDiscussion,
              partialIntent: intent
            }
          }));
          
          if (intent.rackInfo || intent.rackCount > 1) {
            response += `I understand you want ${intent.rackCount || 'multiple'} racks. `;
            response += 'A few quick questions:\n\n';
            
            if (!intent.rackInfo?.tiers) {
              response += `• How many levels/tiers per rack? (typical: 5-10)\n`;
            }
            if (!intent.targetPPFD || intent.targetPPFD === 500) {
              response += `• What PPFD do you need? (microgreens: 150-250, cannabis: 800-1000)\n`;
            }
            if (!intent.mountingDistance) {
              response += `• How far from the crop should lights be mounted?\n`;
            }
            
            response += `\nOr just tell me: "Make it 5 levels with 300 PPFD at 6 inches"`;
          } else {
            response += 'Tell me:\n';
            response += '• How many racks? (e.g., "3 racks")\n';
            response += '• How many levels? (e.g., "10 levels high")\n';
            response += '• Target PPFD? (e.g., "600 PPFD")\n';
            response += '• Mounting height? (e.g., "12 inches from crop")\n\n';
            response += 'Example: "10 racks with 20 levels each at 800 PPFD"';
          }
          
          setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        }
      }
      
      // Handle information requests
      else if (conversationType === 'information') {
        const response = generateHelpResponse(currentUserInput);
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      }
      
      // General conversation - but check if it looks like a design request
      else {
        // Check if this might be a design request we didn't catch
        const lowerInput = currentUserInput.toLowerCase();
        const hasNumbers = /\d+/.test(currentUserInput);
        const hasRack = lowerInput.includes('rack');
        const hasDesign = lowerInput.includes('design') || lowerInput.includes('create') || lowerInput.includes('build') || lowerInput.includes('buid');
        const hasPPFD = lowerInput.includes('ppfd');
        const hasRoom = lowerInput.includes('room') || lowerInput.includes('space');
        
        if (hasNumbers && (hasRack || hasDesign || hasPPFD || hasRoom)) {
          // Try to parse it as a design request
          const intent = parseDesignIntent(currentUserInput);
          
          // If room dimensions specified, create/update room
          if (intent.roomSize && !room) {
            const newRoom = {
              width: intent.roomSize.width,
              length: intent.roomSize.length,
              height: 10, // Default height
              ceilingHeight: 10,
              workingHeight: 3,
              reflectances: { ceiling: 0.8, walls: 0.5, floor: 0.2 },
              roomType: 'cultivation',
              windows: []
            };
            setRoom(newRoom);
            showNotification('success', `Created ${intent.roomSize.width}×${intent.roomSize.length}ft room`);
          }
          
          if (intent.rackInfo || intent.targetPPFD > 0) {
            const newObjects = generateLayout(intent);
            if (newObjects.length > 0) {
              applyDesignWithHistory(newObjects);
              
              setContext(prev => ({
                ...prev,
                lastDesign: newObjects,
                designHistory: [...prev.designHistory, newObjects]
              }));
              
              const fixtureCount = newObjects.filter(o => o.type === 'fixture').length;
              const rackCount = newObjects.filter(o => o.type === 'rack').length;
              
              // Skip validation for now
              
              let response = `I've created your design with:\n`;
              response += `• ${rackCount} rack${rackCount > 1 ? 's' : ''} (${intent.rackInfo?.width || 2}' × ${intent.rackInfo?.length || 8}')\n`;
              response += `• ${intent.rackInfo?.tiers || intent.tiers || 5} layers${intent.mountingDistance ? ` at ${intent.mountingDistance}' mounting height` : ''}\n`;
              response += `• ${fixtureCount} fixtures\n`;
              response += `• Target PPFD: ${intent.targetPPFD || 200} µmol/m²/s\n\n`;
              
              response += `✅ Design created successfully!\n`;
              
              response += `\nThe rack has been placed in the center of your ${room?.width || 40}' × ${room?.length || 40}' room. Would you like me to adjust the positioning or lighting levels?`;
              
              // Add preview to message
              const preview = calculateDesignMetrics(newObjects);
              setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: response,
                preview,
                design: newObjects,
                timestamp: new Date()
              }]);
            }
          }
        } else {
          // Default responses
          if (context.lastDesign.length > 0) {
            let response = 'I\'m here to help optimize your design. You can:\n\n';
            response += '• Ask me to modify the current layout\n';
            response += '• Request specific changes ("move fixtures closer")\n';
            response += '• Ask questions about the design\n';
            response += '• Start a completely new design\n\n';
            response += 'What would you like to do?';
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
          } else {
            let response = 'Let\'s create a lighting design together! Tell me about:\n\n';
            response += '• Your growing space and crops\n';
            response += '• Target light levels\n';
            response += '• Any specific requirements\n\n';
            response += 'I\'ll design a custom solution and we can refine it together.';
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
          }
        }
      }
      
      setInput('');
    } catch (error) {
      console.error('AI Assistant error:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Still try to process with fallback if we have rack info
      const intent = parseDesignIntent(currentUserInput);
      if (intent.rackInfo) {
        try {
          const newObjects = generateLayout(intent);
          if (newObjects.length > 0) {
            applyDesignWithHistory(newObjects);
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: `I've created your rack design! Despite some processing issues, I generated ${newObjects.filter(o => o.type === 'rack').length} racks with ${newObjects.filter(o => o.type === 'fixture').length} efficient fixtures. Let me know if you need any adjustments!` 
            }]);
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: 'I apologize, I encountered an error processing your request. However, I understood you want a 2\' x 4\' rack with 5 layers at 200 PPFD. Please try again or let me help you step by step.' 
          }]);
        }
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'I apologize, I encountered an error processing your request. However, I can still help you with a basic design. Could you please tell me more about your specific needs?' 
        }]);
      }
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div 
          className="ai-assistant-container fixed bottom-20 right-6 w-96 h-[500px] bg-gray-900 rounded-lg shadow-2xl border border-purple-500/30 flex flex-col z-50"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-white">AI Design Assistant</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="p-1.5 hover:bg-gray-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <RotateCw className="w-4 h-4 text-gray-400 rotate-[270deg]" />
              </button>
              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="p-1.5 hover:bg-gray-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
              >
                <RotateCw className="w-4 h-4 text-gray-400" />
              </button>
              <div className="w-px h-6 bg-gray-700" />
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                title="Design History"
              >
                <History className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => {
                  const data = JSON.stringify(messages, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `vibelux-ai-chat-${new Date().toISOString()}.json`;
                  a.click();
                }}
                className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                title="Export Conversation"
              >
                <Download className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/ai-test', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ message: 'Test connection' })
                    });
                    const data = await res.json();
                    if (data.success) {
                      showNotification('success', 'AI connection working!');
                    } else {
                      showNotification('error', `AI Error: ${data.error}`);
                    }
                  } catch (e) {
                    console.error('Test failed:', e);
                    showNotification('error', 'AI test failed');
                  }
                }}
                className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                title="Test AI Connection"
              >
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-gray-800 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* History Panel */}
          {showHistory && (
            <div className="absolute right-0 top-16 w-80 h-[calc(100%-4rem)] bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto z-10">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Design History</h4>
              {designHistory.length === 0 ? (
                <p className="text-xs text-gray-500">No designs yet</p>
              ) : (
                <div className="space-y-2">
                  {designHistory.map((item, index) => (
                    <div key={index} className="bg-gray-900 rounded p-3 cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => {
                        applyDesignWithHistory(item.design);
                        showNotification({
                          type: 'success',
                          message: 'Design restored from history',
                          duration: 3000
                        });
                        setShowHistory(false);
                      }}
                    >
                      <p className="text-xs text-gray-400">{item.timestamp.toLocaleString()}</p>
                      <p className="text-sm text-gray-200 mt-1">{item.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.design.filter(o => o.type === 'rack').length} racks, 
                        {item.design.filter(o => o.type === 'fixture').length} fixtures
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[80%]">
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.preview && message.design && (
                    <DesignPreviewCard preview={message.preview} design={message.design} />
                  )}
                  {message.timestamp && (
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                    <span className="text-sm text-gray-400">{processingStep}</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick action buttons after design creation */}
          {context.lastDesign.length > 0 && messages.length > 2 && (
            <div className="border-t border-gray-800 p-3">
              <p className="text-xs text-gray-500 mb-2 text-center">Quick Actions:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => {
                    setInput('move fixtures closer together');
                    handleSubmit();
                  }}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 flex items-center gap-1"
                >
                  <Move className="w-3 h-3" />
                  Closer
                </button>
                <button
                  onClick={() => {
                    setInput('spread fixtures farther apart');
                    handleSubmit();
                  }}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 flex items-center gap-1"
                >
                  <Move className="w-3 h-3" />
                  Farther
                </button>
                <button
                  onClick={() => {
                    setInput('add more fixtures');
                    handleSubmit();
                  }}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
                <button
                  onClick={() => {
                    setInput('remove some fixtures');
                    handleSubmit();
                  }}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 flex items-center gap-1"
                >
                  <Minus className="w-3 h-3" />
                  Remove
                </button>
                <button
                  onClick={() => {
                    setInput('raise fixtures higher');
                    handleSubmit();
                  }}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3" />
                  Higher
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                onFocus={(e) => e.stopPropagation()}
                placeholder="Ask me anything about Vibelux or describe your lighting needs..."
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
                disabled={isProcessing}
                autoComplete="off"
              />
              <button
                onClick={handleSubmit}
                disabled={isProcessing || !input.trim()}
                className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 rounded-lg text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {process.env.NEXT_PUBLIC_USE_CLAUDE === 'true' 
                  ? 'Natural language enabled - describe your needs in any way!'
                  : 'Try: "Create a 4x8 rack with 300 PPFD" • "What is PPFD?" • "How do I use CFD analysis?"'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AIDesignAssistant;