import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { parseAICommand, CommandType } from '@/lib/ai-command-parser'

// Handle various AI commands beyond just room designs
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { command, context } = await request.json()
    
    // Parse the command to understand intent
    const parsedCommand = parseAICommand(command);
    
    const response = {
      type: parsedCommand.type,
      parameters: parsedCommand.parameters,
      confidence: parsedCommand.confidence
    };
    
    // Route to appropriate handler based on command type
    switch (parsedCommand.type) {
      case 'add_fixture':
        return handleAddFixture(parsedCommand.parameters, context)
      
      case 'add_fan':
        return handleAddFan(parsedCommand.parameters, context)
      
      case 'add_dehumidifier':
        return handleAddDehumidifier(parsedCommand.parameters, context)
      
      case 'add_hvac':
        return handleAddHVAC(parsedCommand.parameters, context)
      
      case 'remove_fixture':
        return handleRemoveFixture(parsedCommand.parameters, context)
      
      case 'adjust_ppfd':
        return handleAdjustPPFD(parsedCommand.parameters, context)
      
      case 'change_spectrum':
        return handleChangeSpectrum(parsedCommand.parameters, context)
      
      case 'optimize':
        return handleOptimize(parsedCommand.parameters, context)
      
      case 'calculate':
        return handleCalculation(parsedCommand.parameters, context)
      
      case 'design_room':
      case 'design_rack':
        // Forward to existing design generation endpoint
        return NextResponse.json({
          action: 'generate_design',
          parameters: parsedCommand.parameters,
          message: 'I\'ll generate a lighting design based on your specifications.'
        })
      
      default:
        // For questions and unknown commands, provide helpful response
        return NextResponse.json({
          action: 'response',
          message: 'I understand you want to ' + command + '. Could you be more specific? For example:\n' +
                   '• "Add another 600W fixture"\n' +
                   '• "Add a 16 inch oscillating fan"\n' +
                   '• "Increase PPFD to 800"\n' +
                   '• "Add a 70 pint dehumidifier"\n' +
                   '• "Calculate the DLI"',
          suggestions: getCommandSuggestions(parsedCommand.type)
        })
    }
    
  } catch (error) {
    console.error('Command processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process command' },
      { status: 500 }
    )
  }
}

function handleAddFixture(params: any, context: any) {
  const count = params.count || 1
  const wattage = params.wattage || 600
  const position = params.position || 'auto'
  
  // Generate fixture addition instruction
  const fixture = {
    type: 'fixture',
    model: {
      name: `LED ${params.fixtureType || 'Bar'} Light ${wattage}W`,
      wattage: wattage,
      ppf: wattage * 2.8, // Assume 2.8 efficacy
      efficacy: 2.8,
      spectrum: 'Full Spectrum'
    },
    count: count,
    position: position
  }
  
  return NextResponse.json({
    action: 'add_equipment',
    equipment: fixture,
    message: `I'll add ${count} ${wattage}W fixture${count > 1 ? 's' : ''} to your design. The fixture${count > 1 ? 's' : ''} will be positioned ${position === 'auto' ? 'for optimal coverage' : 'in the ' + position}.`,
    instructions: {
      placement: position === 'auto' ? 'Find empty space with lowest PPFD' : `Place in ${position}`,
      spacing: 'Maintain uniform spacing with existing fixtures'
    }
  })
}

function handleAddFan(params: any, context: any) {
  const size = params.size || 16
  const cfm = params.cfm || size * 50 // Rough estimate
  const type = params.type || 'circulation'
  
  return NextResponse.json({
    action: 'add_equipment',
    equipment: {
      type: 'fan',
      model: {
        name: `${size}" ${type.charAt(0).toUpperCase() + type.slice(1)} Fan`,
        size: size,
        cfm: cfm,
        powerDraw: size * 5, // Rough estimate
        type: type
      },
      mounting: params.mounting || 'wall'
    },
    message: `I'll add a ${size}" ${type} fan with ${cfm} CFM airflow to improve air circulation.`,
    recommendations: [
      'Position fans to create circular airflow pattern',
      'Avoid direct airflow on young plants',
      'Target 0.3-0.5 m/s air velocity at canopy level'
    ]
  })
}

function handleAddDehumidifier(params: any, context: any) {
  const capacity = params.capacity || 70
  const coverage = capacity * 10 // Rough sq ft estimate
  
  return NextResponse.json({
    action: 'add_equipment',
    equipment: {
      type: 'dehumidifier',
      model: {
        name: `${capacity} Pint/Day Dehumidifier`,
        capacity: capacity,
        coverage: coverage,
        powerDraw: capacity * 8 // Rough estimate
      }
    },
    message: `I'll add a ${capacity} pint/day dehumidifier suitable for approximately ${coverage} sq ft.`,
    recommendations: [
      'Place centrally for even humidity control',
      'Ensure proper drainage or auto-pump setup',
      'Target 50-60% RH for most growth stages'
    ]
  })
}

function handleAddHVAC(params: any, context: any) {
  const btu = params.btu || params.tons * 12000 || 24000
  const tons = btu / 12000
  const type = params.type || 'mini-split'
  
  return NextResponse.json({
    action: 'add_equipment',
    equipment: {
      type: 'hvac',
      model: {
        name: `${tons} Ton ${type.replace('-', ' ').toUpperCase()} AC`,
        btu: btu,
        tons: tons,
        type: type,
        powerDraw: btu / 10 // Rough estimate
      }
    },
    message: `I'll add a ${tons} ton ${type} system with ${btu.toLocaleString()} BTU cooling capacity.`,
    sizing: {
      heatLoadFromLights: context?.totalLightWattage ? context.totalLightWattage * 3.41 : 'Unknown',
      recommendedBTU: context?.roomArea ? context.roomArea * 50 : btu,
      selected: btu
    }
  })
}

function handleRemoveFixture(params: any, context: any) {
  const count = params.count || 1
  
  return NextResponse.json({
    action: 'remove_equipment',
    equipment: {
      type: 'fixture',
      count: count
    },
    message: `I'll remove ${count} fixture${count > 1 ? 's' : ''} from your design.`,
    warning: count > 1 ? 'This may significantly impact your PPFD uniformity.' : null
  })
}

function handleAdjustPPFD(params: any, context: any) {
  const targetPPFD = params.targetPPFD
  const action = params.action
  
  return NextResponse.json({
    action: 'adjust_lighting',
    adjustment: {
      type: 'ppfd',
      target: targetPPFD,
      method: action === 'increase' ? 'add_fixtures_or_increase_power' : 'dim_or_remove_fixtures'
    },
    message: `I'll ${action} the PPFD ${targetPPFD ? 'to ' + targetPPFD + ' μmol/m²/s' : ''}.`,
    options: [
      action === 'increase' ? 'Add more fixtures' : 'Dim existing fixtures',
      action === 'increase' ? 'Increase fixture power' : 'Remove some fixtures',
      'Adjust mounting height'
    ]
  })
}

function handleChangeSpectrum(params: any, context: any) {
  const spectrum = params.spectrum || 'full'
  
  return NextResponse.json({
    action: 'adjust_spectrum',
    spectrum: {
      type: spectrum,
      blueRatio: params.blueRatio,
      redRatio: params.redRatio
    },
    message: `I'll change the spectrum to ${spectrum} configuration.`,
    details: getSpectrumDetails(spectrum)
  })
}

function handleOptimize(params: any, context: any) {
  const target = params.target || 'general'
  
  return NextResponse.json({
    action: 'optimize',
    optimization: {
      target: target,
      method: getOptimizationMethod(target)
    },
    message: `I'll optimize your design for ${target}.`,
    steps: getOptimizationSteps(target)
  })
}

function handleCalculation(params: any, context: any) {
  const calculate = params.calculate || 'general'
  
  return NextResponse.json({
    action: 'calculate',
    calculation: {
      type: calculate,
      requiresData: getRequiredDataForCalculation(calculate)
    },
    message: `I'll calculate the ${calculate} for your setup.`,
    formula: getCalculationFormula(calculate)
  })
}

function getCommandSuggestions(type: CommandType): string[] {
  const suggestions: Record<CommandType, string[]> = {
    'add_fixture': [
      '"Add another 600W bar light"',
      '"Add 2 more fixtures in the corner"',
      '"Add a 400W panel light"'
    ],
    'add_fan': [
      '"Add a 16 inch oscillating fan"',
      '"Add an exhaust fan with 400 CFM"',
      '"Add 2 circulation fans"'
    ],
    'add_dehumidifier': [
      '"Add a 70 pint dehumidifier"',
      '"Add a small dehumidifier"',
      '"Add commercial dehumidifier"'
    ],
    'add_hvac': [
      '"Add a 2 ton mini split"',
      '"Add 24000 BTU AC"',
      '"Add portable AC unit"'
    ],
    'adjust_ppfd': [
      '"Increase PPFD to 800"',
      '"Decrease PPFD by 20%"',
      '"Set PPFD to 600"'
    ],
    'change_spectrum': [
      '"Change to flowering spectrum"',
      '"Set 30% blue ratio"',
      '"Use vegetative spectrum"'
    ],
    'optimize': [
      '"Optimize for energy efficiency"',
      '"Optimize uniformity"',
      '"Optimize coverage"'
    ],
    'calculate': [
      '"Calculate the DLI"',
      '"What\'s the total power draw?"',
      '"Calculate monthly cost"'
    ],
    'compare': [
      '"Compare LED vs HPS"',
      '"Compare 600W vs 800W fixtures"'
    ],
    'design_room': [
      '"Design a 10x20 room with 600 PPFD"',
      '"Create lighting for 20x40 flowering room"'
    ],
    'design_rack': [
      '"Design a 4x8 rack with 5 tiers"',
      '"Create 2x4 propagation rack"'
    ],
    'remove_fixture': [
      '"Remove 2 fixtures"',
      '"Delete the last fixture"'
    ],
    'question': [
      '"What\'s the best PPFD for lettuce?"',
      '"How many fixtures do I need?"'
    ],
    'unknown': [
      '"Design a 10x20 room"',
      '"Add another fixture"',
      '"Calculate the DLI"'
    ]
  }
  
  return suggestions[type] || suggestions['unknown']
}

function getSpectrumDetails(spectrum: string): any {
  const details: Record<string, any> = {
    'flowering': {
      blue: 15,
      green: 25,
      red: 50,
      farRed: 10,
      description: 'Enhanced red for flower development'
    },
    'vegetative': {
      blue: 30,
      green: 30,
      red: 35,
      farRed: 5,
      description: 'Higher blue for compact growth'
    },
    'full': {
      blue: 20,
      green: 30,
      red: 45,
      farRed: 5,
      description: 'Balanced full spectrum'
    }
  }
  
  return details[spectrum] || details['full']
}

function getOptimizationMethod(target: string): string {
  const methods: Record<string, string> = {
    'energy': 'Minimize fixture count while maintaining target PPFD',
    'uniformity': 'Redistribute fixtures for even coverage',
    'coverage': 'Eliminate dark spots and overlap',
    'general': 'Balance energy, uniformity, and coverage'
  }
  
  return methods[target] || methods['general']
}

function getOptimizationSteps(target: string): string[] {
  const steps: Record<string, string[]> = {
    'energy': [
      'Calculate minimum fixtures needed',
      'Use highest efficacy fixtures',
      'Optimize mounting height',
      'Implement dimming schedules'
    ],
    'uniformity': [
      'Analyze current light distribution',
      'Identify hot and cold spots',
      'Redistribute fixture spacing',
      'Adjust individual fixture power'
    ],
    'coverage': [
      'Map current coverage area',
      'Identify gaps in coverage',
      'Add fixtures to dark areas',
      'Adjust beam angles if needed'
    ]
  }
  
  return steps[target] || steps['general']
}

function getRequiredDataForCalculation(type: string): string[] {
  const requirements: Record<string, string[]> = {
    'dli': ['PPFD value', 'Photoperiod hours'],
    'ppfd': ['Total PPF', 'Coverage area'],
    'power': ['Fixture count', 'Wattage per fixture'],
    'cost': ['Total power', 'Hours per day', 'Electricity rate'],
    'heat': ['Total fixture wattage', 'Room volume']
  }
  
  return requirements[type] || []
}

function getCalculationFormula(type: string): string {
  const formulas: Record<string, string> = {
    'dli': 'DLI = PPFD × Photoperiod × 0.0036',
    'ppfd': 'PPFD = Total PPF ÷ Area (m²)',
    'power': 'Power = Fixtures × Wattage',
    'cost': 'Monthly Cost = Power × Hours × Days × Rate',
    'heat': 'Heat Load (BTU) = Watts × 3.41'
  }
  
  return formulas[type] || 'Custom calculation required'
}