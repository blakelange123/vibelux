import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const zipCode = searchParams.get('zipCode');
    const category = searchParams.get('category');
    const radius = parseInt(searchParams.get('radius') || '50');
    const emergencyOnly = searchParams.get('emergencyOnly') === 'true';

    const whereClause: any = {
      status: 'ACTIVE',
      verified: true,
    };

    // Filter by service category
    if (category) {
      whereClause.specializations = {
        some: {
          category: category.toUpperCase().replace(/[^A-Z_]/g, '_'),
        },
      };
    }

    // Filter by emergency service availability
    if (emergencyOnly) {
      whereClause.emergencyService = true;
    }

    // Filter by geographic area if zipCode provided
    if (zipCode) {
      whereClause.serviceAreas = {
        some: {
          zipCode: zipCode,
        },
      };
    }

    const serviceProviders = await prisma.serviceProvider.findMany({
      where: whereClause,
      include: {
        certifications: {
          where: {
            verified: true,
            OR: [
              { expirationDate: null },
              { expirationDate: { gte: new Date() } },
            ],
          },
        },
        specializations: true,
        serviceAreas: zipCode ? {
          where: { zipCode },
        } : true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            reviewer: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { completedJobs: 'desc' },
      ],
    });

    return NextResponse.json(serviceProviders);
  } catch (error) {
    console.error('Error fetching service providers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Create service provider registration
    const serviceProvider = await prisma.serviceProvider.create({
      data: {
        companyName: data.companyName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        businessType: data.businessType,
        licenseNumber: data.licenseNumber,
        insuranceNumber: data.insuranceNumber,
        bondNumber: data.bondNumber,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country || 'US',
        serviceRadius: data.serviceRadius || 50,
        emergencyService: data.emergencyService || false,
        status: 'PENDING', // Requires verification
      },
    });

    // Add certifications if provided
    if (data.certifications && data.certifications.length > 0) {
      await prisma.serviceProviderCertification.createMany({
        data: data.certifications.map((cert: any) => ({
          serviceProviderId: serviceProvider.id,
          certificationType: cert.type,
          certificationBody: cert.body,
          certificationNumber: cert.number,
          issueDate: new Date(cert.issueDate),
          expirationDate: cert.expirationDate ? new Date(cert.expirationDate) : null,
          documentUrl: cert.documentUrl,
        })),
      });
    }

    // Add specializations if provided
    if (data.specializations && data.specializations.length > 0) {
      await prisma.serviceProviderSpecialization.createMany({
        data: data.specializations.map((spec: any) => ({
          serviceProviderId: serviceProvider.id,
          category: spec.category,
          subcategory: spec.subcategory,
          experienceYears: spec.experienceYears || 0,
          skillLevel: spec.skillLevel || 'BEGINNER',
        })),
      });
    }

    // Add service areas if provided
    if (data.serviceAreas && data.serviceAreas.length > 0) {
      await prisma.serviceArea.createMany({
        data: data.serviceAreas.map((area: any) => ({
          serviceProviderId: serviceProvider.id,
          zipCode: area.zipCode,
          city: area.city,
          state: area.state,
          travelTime: area.travelTime,
          serviceFee: area.serviceFee,
        })),
      });
    }

    return NextResponse.json(serviceProvider, { status: 201 });
  } catch (error) {
    console.error('Error creating service provider:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}