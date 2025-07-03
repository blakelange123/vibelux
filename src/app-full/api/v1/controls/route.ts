import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

// Device types and their control capabilities
const DEVICE_CAPABILITIES = {
  hvac: {
    actions: ['setTemperature', 'setHumidity', 'setPower', 'setMode'],
    modes: ['cool', 'heat', 'auto', 'off'],
    ranges: {
      temperature: { min: 60, max: 90 },
      humidity: { min: 30, max: 70 }
    }
  },
  light: {
    actions: ['setPower', 'setIntensity', 'setSpectrum', 'setSchedule'],
    ranges: {
      intensity: { min: 0, max: 100 },
      spectrum: {
        red: { min: 0, max: 100 },
        blue: { min: 0, max: 100 },
        white: { min: 0, max: 100 },
        farRed: { min: 0, max: 100 }
      }
    }
  },
  fan: {
    actions: ['setPower', 'setSpeed', 'setDirection'],
    ranges: {
      speed: { min: 0, max: 100 }
    }
  },
  co2: {
    actions: ['setPower', 'setTarget', 'setMode'],
    modes: ['maintain', 'boost', 'off'],
    ranges: {
      target: { min: 400, max: 1500 }
    }
  },
  irrigation: {
    actions: ['setPower', 'setFlow', 'setSchedule', 'runCycle'],
    ranges: {
      flow: { min: 0, max: 100 },
      duration: { min: 1, max: 60 } // minutes
    }
  },
  dehumidifier: {
    actions: ['setPower', 'setTarget'],
    ranges: {
      target: { min: 30, max: 70 }
    }
  }
}

// POST /api/v1/controls - Send control command
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { deviceId, action, value, projectId, roomId } = body

    // Validate project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.userId
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get device info (in production, this would come from device registry)
    const device = await getDeviceInfo(deviceId)
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    }

    // Validate action is supported by device
    const capabilities = DEVICE_CAPABILITIES[device.type as keyof typeof DEVICE_CAPABILITIES]
    if (!capabilities || !capabilities.actions.includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid action for device type',
        supportedActions: capabilities?.actions || []
      }, { status: 400 })
    }

    // Validate value ranges
    const validation = validateControlValue(device.type, action, value)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Execute control command
    const result = await executeControl(device, action, value)

    // Log control action
    await logControlAction({
      userId: session.userId,
      projectId,
      roomId,
      deviceId,
      action,
      value,
      result
    })

    // Send to WebSocket for real-time updates
    if (global.wsServer) {
      global.wsServer.broadcastDeviceState({
        projectId,
        roomId,
        deviceId,
        state: result.state,
        value: result.value
      })
    }

    return NextResponse.json({
      success: true,
      deviceId,
      action,
      value: result.value,
      state: result.state,
      timestamp: new Date()
    })
  } catch (error) {
    console.error('Control command error:', error)
    return NextResponse.json(
      { error: 'Control command failed' },
      { status: 500 }
    )
  }
}

// GET /api/v1/controls - Get device states
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const roomId = searchParams.get('roomId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.userId
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get all devices for the project/room
    const devices = await getProjectDevices(projectId, roomId)

    // Get current state for each device
    const deviceStates = await Promise.all(
      devices.map(async (device) => {
        const state = await getDeviceState(device.id)
        return {
          ...device,
          state
        }
      })
    )

    return NextResponse.json({
      projectId,
      roomId,
      devices: deviceStates
    })
  } catch (error) {
    console.error('Get device states error:', error)
    return NextResponse.json(
      { error: 'Failed to get device states' },
      { status: 500 }
    )
  }
}

// Helper functions

async function getDeviceInfo(deviceId: string) {
  // In production, this would query device registry
  // For now, return mock device
  const mockDevices: Record<string, any> = {
    'hvac_main': {
      id: 'hvac_main',
      type: 'hvac',
      name: 'Main HVAC System',
      brand: 'Ideal-Air',
      model: 'Pro Series 5 Ton',
      capabilities: DEVICE_CAPABILITIES.hvac
    },
    'light_veg_1': {
      id: 'light_veg_1',
      type: 'light',
      name: 'Veg Room LED Array',
      brand: 'Fluence',
      model: 'SPYDR 2p',
      capabilities: DEVICE_CAPABILITIES.light
    },
    'fan_exhaust_1': {
      id: 'fan_exhaust_1',
      type: 'fan',
      name: 'Exhaust Fan 1',
      brand: 'Vortex',
      model: 'S-Line 8"',
      capabilities: DEVICE_CAPABILITIES.fan
    },
    'co2_controller': {
      id: 'co2_controller',
      type: 'co2',
      name: 'CO2 Controller',
      brand: 'Titan Controls',
      model: 'Atlas 8',
      capabilities: DEVICE_CAPABILITIES.co2
    }
  }

  return mockDevices[deviceId] || null
}

function validateControlValue(deviceType: string, action: string, value: any): { valid: boolean; error?: string } {
  const capabilities = DEVICE_CAPABILITIES[deviceType as keyof typeof DEVICE_CAPABILITIES]
  if (!capabilities) {
    return { valid: false, error: 'Unknown device type' }
  }

  // Check power commands
  if (action === 'setPower') {
    if (typeof value !== 'boolean') {
      return { valid: false, error: 'Power value must be boolean' }
    }
    return { valid: true }
  }

  // Check mode commands
  if (action === 'setMode' && 'modes' in capabilities) {
    if (!capabilities.modes.includes(value)) {
      return { valid: false, error: `Invalid mode. Valid modes: ${capabilities.modes.join(', ')}` }
    }
    return { valid: true }
  }

  // Check range-based commands
  if ('ranges' in capabilities) {
    if (action === 'setTemperature' && capabilities.ranges.temperature) {
      const { min, max } = capabilities.ranges.temperature
      if (typeof value !== 'number' || value < min || value > max) {
        return { valid: false, error: `Temperature must be between ${min} and ${max}` }
      }
    }

    if (action === 'setHumidity' && capabilities.ranges.humidity) {
      const { min, max } = capabilities.ranges.humidity
      if (typeof value !== 'number' || value < min || value > max) {
        return { valid: false, error: `Humidity must be between ${min} and ${max}` }
      }
    }

    if (action === 'setIntensity' && capabilities.ranges.intensity) {
      const { min, max } = capabilities.ranges.intensity
      if (typeof value !== 'number' || value < min || value > max) {
        return { valid: false, error: `Intensity must be between ${min} and ${max}` }
      }
    }

    if (action === 'setTarget' && capabilities.ranges.target) {
      const { min, max } = capabilities.ranges.target
      if (typeof value !== 'number' || value < min || value > max) {
        return { valid: false, error: `Target must be between ${min} and ${max}` }
      }
    }
  }

  return { valid: true }
}

async function executeControl(device: any, action: string, value: any) {
  // In production, this would send commands to actual devices via:
  // - MQTT
  // - HTTP APIs
  // - Modbus
  // - Serial/USB
  // etc.

  // Simulate control execution
  await new Promise(resolve => setTimeout(resolve, 200))

  // Return simulated result
  const state: Record<string, any> = {
    power: action === 'setPower' ? value : true,
    lastUpdate: new Date()
  }

  if (action === 'setTemperature') state.temperature = value
  if (action === 'setHumidity') state.humidity = value
  if (action === 'setIntensity') state.intensity = value
  if (action === 'setMode') state.mode = value
  if (action === 'setTarget') state.target = value

  return {
    success: true,
    state,
    value
  }
}

async function logControlAction(params: any) {
  // In production, log to database for audit trail
}

async function getProjectDevices(projectId: string, roomId?: string | null) {
  // In production, query device registry
  // For now, return mock devices
  const allDevices = [
    {
      id: 'hvac_main',
      type: 'hvac',
      name: 'Main HVAC System',
      roomId: 'room_1',
      online: true
    },
    {
      id: 'light_veg_1',
      type: 'light',
      name: 'Veg Room LED Array',
      roomId: 'room_1',
      online: true
    },
    {
      id: 'fan_exhaust_1',
      type: 'fan',
      name: 'Exhaust Fan 1',
      roomId: 'room_1',
      online: true
    },
    {
      id: 'co2_controller',
      type: 'co2',
      name: 'CO2 Controller',
      roomId: 'room_1',
      online: true
    }
  ]

  if (roomId) {
    return allDevices.filter(d => d.roomId === roomId)
  }

  return allDevices
}

async function getDeviceState(deviceId: string) {
  // In production, query actual device state
  // For now, return mock state
  const mockStates: Record<string, any> = {
    'hvac_main': {
      power: true,
      mode: 'cool',
      temperature: 75,
      humidity: 55,
      setpoint: { temperature: 75, humidity: 55 }
    },
    'light_veg_1': {
      power: true,
      intensity: 80,
      spectrum: { red: 65, blue: 20, white: 15, farRed: 0 },
      schedule: { on: '06:00', off: '18:00' }
    },
    'fan_exhaust_1': {
      power: true,
      speed: 60,
      direction: 'exhaust'
    },
    'co2_controller': {
      power: true,
      mode: 'maintain',
      target: 800,
      current: 785
    }
  }

  return mockStates[deviceId] || { power: false }
}