import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// POST temperature reading
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const body = await request.json();
    const { temperature, unit, location, deviceId } = body;

    // Verify order exists
    const order = await prisma.consolidationOrder.findUnique({
      where: { id: params.orderId }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create temperature reading
    const reading = await prisma.temperatureReading.create({
      data: {
        consolidationOrderId: params.orderId,
        temperature,
        unit,
        location,
        deviceId
      }
    });

    // Check if temperature is out of range
    if (order.tempRequirementMin && order.tempRequirementMax) {
      let tempInRequiredUnit = temperature;
      
      // Convert if needed
      if (unit !== order.tempRequirementUnit) {
        tempInRequiredUnit = unit === 'F' 
          ? (temperature - 32) * 5/9  // F to C
          : temperature * 9/5 + 32;   // C to F
      }

      const isOutOfRange = tempInRequiredUnit < order.tempRequirementMin || 
                          tempInRequiredUnit > order.tempRequirementMax;

      if (isOutOfRange) {
        // Check for existing unresolved alert
        const existingAlert = await prisma.coldChainAlert.findFirst({
          where: {
            consolidationOrderId: params.orderId,
            alertType: 'temperature-excursion',
            resolved: false
          },
          orderBy: { timestamp: 'desc' }
        });

        if (!existingAlert) {
          // Create new alert
          await prisma.coldChainAlert.create({
            data: {
              consolidationOrderId: params.orderId,
              alertType: 'temperature-excursion',
              severity: 'high',
              message: `Temperature ${temperature}°${unit} outside range ` +
                      `(${order.tempRequirementMin}-${order.tempRequirementMax}°${order.tempRequirementUnit}) ` +
                      `at ${location}`,
              temperature
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: reading
    });
  } catch (error) {
    console.error('Error recording temperature:', error);
    return NextResponse.json(
      { error: 'Failed to record temperature' },
      { status: 500 }
    );
  }
}