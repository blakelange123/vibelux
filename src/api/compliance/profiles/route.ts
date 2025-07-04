import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

interface ComplianceProfile {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerType: 'retailer' | 'distributor' | 'processor' | 'brand';
  contactInfo: {
    primaryContact: string;
    email: string;
    phone: string;
    address: string;
  };
  certificationRequirements: {
    organic: boolean;
    gmp: boolean;
    haccp: boolean;
    sqs: boolean;
    thirdParty: string[];
  };
  testingRequirements: {
    pesticides: boolean;
    microbials: boolean;
    heavyMetals: boolean;
    residualSolvents: boolean;
    potency: boolean;
    terpenes: boolean;
    customTests: string[];
  };
  packagingRequirements: {
    labeling: string[];
    materials: string[];
    sustainability: boolean;
    childResistant: boolean;
    tamperEvident: boolean;
  };
  deliveryRequirements: {
    temperature: string;
    timeWindow: string;
    documentation: string[];
    trackingRequired: boolean;
  };
  qualityStandards: {
    appearance: string;
    moisture: { min: number; max: number };
    contamination: string;
    defectTolerance: number;
  };
  auditSchedule: {
    frequency: 'monthly' | 'quarterly' | 'biannual' | 'annual';
    lastAudit: string;
    nextAudit: string;
    auditType: 'internal' | 'third-party' | 'buyer-conducted';
  };
  status: 'active' | 'pending' | 'suspended' | 'terminated';
  createdAt: string;
  updatedAt: string;
}

// Demo compliance profiles store
const demoProfiles: ComplianceProfile[] = [
  {
    id: 'buyer-001',
    buyerId: 'whole-foods-001',
    buyerName: 'Whole Foods Market',
    buyerType: 'retailer',
    contactInfo: {
      primaryContact: 'Sarah Johnson',
      email: 'sarah.johnson@wholefoods.com',
      phone: '+1-512-555-0100',
      address: '550 Bowie St, Austin, TX 78703'
    },
    certificationRequirements: {
      organic: true,
      gmp: true,
      haccp: true,
      sqs: true,
      thirdParty: ['USDA Organic', 'Safe Quality Foods (SQF)']
    },
    testingRequirements: {
      pesticides: true,
      microbials: true,
      heavyMetals: true,
      residualSolvents: false,
      potency: true,
      terpenes: false,
      customTests: ['Mycotoxins', 'Foreign Matter']
    },
    packagingRequirements: {
      labeling: ['Nutrition Facts', 'Organic Certification', 'Lot/Batch Code', 'Best By Date'],
      materials: ['Food Grade', 'Recyclable'],
      sustainability: true,
      childResistant: false,
      tamperEvident: true
    },
    deliveryRequirements: {
      temperature: '35-45°F refrigerated',
      timeWindow: '6 AM - 12 PM weekdays only',
      documentation: ['COA', 'Delivery Receipt', 'Temperature Log'],
      trackingRequired: true
    },
    qualityStandards: {
      appearance: 'Premium grade, uniform color, no visible defects',
      moisture: { min: 8, max: 12 },
      contamination: 'Zero tolerance for foreign matter',
      defectTolerance: 2
    },
    auditSchedule: {
      frequency: 'quarterly',
      lastAudit: '2024-03-15T10:00:00Z',
      nextAudit: '2024-06-15T10:00:00Z',
      auditType: 'third-party'
    },
    status: 'active',
    createdAt: '2023-01-15T09:30:00Z',
    updatedAt: '2024-06-01T14:20:00Z'
  },
  {
    id: 'buyer-002',
    buyerId: 'us-foods-001',
    buyerName: 'US Foods',
    buyerType: 'distributor',
    contactInfo: {
      primaryContact: 'Mike Rodriguez',
      email: 'mike.rodriguez@usfoods.com',
      phone: '+1-847-555-0200',
      address: '9399 W Higgins Rd, Rosemont, IL 60018'
    },
    certificationRequirements: {
      organic: false,
      gmp: true,
      haccp: true,
      sqs: true,
      thirdParty: ['BRC Global Standard', 'SQF Level 2']
    },
    testingRequirements: {
      pesticides: true,
      microbials: true,
      heavyMetals: true,
      residualSolvents: false,
      potency: false,
      terpenes: false,
      customTests: ['Allergens', 'Nutritional Analysis']
    },
    packagingRequirements: {
      labeling: ['Product Name', 'Lot Code', 'Pack Date', 'Use By Date'],
      materials: ['Food Safe', 'Freezer Safe'],
      sustainability: false,
      childResistant: false,
      tamperEvident: false
    },
    deliveryRequirements: {
      temperature: 'Frozen -10°F to 0°F',
      timeWindow: '24/7 with 48hr notice',
      documentation: ['BOL', 'COA', 'Invoice'],
      trackingRequired: true
    },
    qualityStandards: {
      appearance: 'Commercial grade, consistent sizing',
      moisture: { min: 6, max: 10 },
      contamination: '<0.1% foreign matter by weight',
      defectTolerance: 5
    },
    auditSchedule: {
      frequency: 'biannual',
      lastAudit: '2024-01-20T08:00:00Z',
      nextAudit: '2024-07-20T08:00:00Z',
      auditType: 'buyer-conducted'
    },
    status: 'active',
    createdAt: '2023-03-10T11:45:00Z',
    updatedAt: '2024-05-15T16:30:00Z'
  },
  {
    id: 'buyer-003',
    buyerId: 'kroger-001',
    buyerName: 'Kroger Co.',
    buyerType: 'retailer',
    contactInfo: {
      primaryContact: 'Lisa Chen',
      email: 'lisa.chen@kroger.com',
      phone: '+1-513-555-0300',
      address: '1014 Vine St, Cincinnati, OH 45202'
    },
    certificationRequirements: {
      organic: false,
      gmp: true,
      haccp: true,
      sqs: false,
      thirdParty: ['Global Food Safety Initiative (GFSI)']
    },
    testingRequirements: {
      pesticides: true,
      microbials: true,
      heavyMetals: false,
      residualSolvents: false,
      potency: false,
      terpenes: false,
      customTests: ['Shelf Life Study']
    },
    packagingRequirements: {
      labeling: ['UPC Code', 'Kroger PLU', 'Country of Origin'],
      materials: ['Consumer Ready'],
      sustainability: true,
      childResistant: false,
      tamperEvident: false
    },
    deliveryRequirements: {
      temperature: 'Ambient 65-75°F',
      timeWindow: 'Tuesday/Thursday 8 AM - 2 PM',
      documentation: ['ASN', 'Packing List'],
      trackingRequired: false
    },
    qualityStandards: {
      appearance: 'Retail ready, attractive presentation',
      moisture: { min: 9, max: 14 },
      contamination: 'Visual inspection only',
      defectTolerance: 3
    },
    auditSchedule: {
      frequency: 'annual',
      lastAudit: '2023-11-05T13:00:00Z',
      nextAudit: '2024-11-05T13:00:00Z',
      auditType: 'internal'
    },
    status: 'active',
    createdAt: '2023-06-20T10:15:00Z',
    updatedAt: '2024-04-10T12:45:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const buyerType = searchParams.get('buyerType');
    const status = searchParams.get('status');
    const certificationRequired = searchParams.get('certificationRequired');
    const profileId = searchParams.get('id');

    let filteredProfiles = [...demoProfiles];

    // Get specific profile
    if (profileId) {
      const profile = demoProfiles.find(p => p.id === profileId);
      if (!profile) {
        return NextResponse.json(
          { error: 'Compliance profile not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ profile });
    }

    // Apply filters
    if (buyerType) {
      filteredProfiles = filteredProfiles.filter(p => p.buyerType === buyerType);
    }
    if (status) {
      filteredProfiles = filteredProfiles.filter(p => p.status === status);
    }
    if (certificationRequired) {
      filteredProfiles = filteredProfiles.filter(p => {
        const certs = p.certificationRequirements;
        switch (certificationRequired) {
          case 'organic': return certs.organic;
          case 'gmp': return certs.gmp;
          case 'haccp': return certs.haccp;
          case 'sqs': return certs.sqs;
          default: return true;
        }
      });
    }

    // Summary statistics
    const summary = {
      totalProfiles: filteredProfiles.length,
      activeProfiles: filteredProfiles.filter(p => p.status === 'active').length,
      pendingAudits: filteredProfiles.filter(p => 
        new Date(p.auditSchedule.nextAudit) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ).length,
      certificationBreakdown: {
        organic: filteredProfiles.filter(p => p.certificationRequirements.organic).length,
        gmp: filteredProfiles.filter(p => p.certificationRequirements.gmp).length,
        haccp: filteredProfiles.filter(p => p.certificationRequirements.haccp).length,
        sqs: filteredProfiles.filter(p => p.certificationRequirements.sqs).length
      }
    };

    return NextResponse.json({
      profiles: filteredProfiles,
      summary,
      filters: {
        buyerTypes: ['retailer', 'distributor', 'processor', 'brand'],
        statuses: ['active', 'pending', 'suspended', 'terminated'],
        certifications: ['organic', 'gmp', 'haccp', 'sqs']
      }
    });
  } catch (error) {
    console.error('Error fetching compliance profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance profiles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const profileData = await request.json();
    
    // Validate required fields
    const requiredFields = ['buyerName', 'buyerType', 'contactInfo'];
    for (const field of requiredFields) {
      if (!profileData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create new compliance profile
    const newProfile: ComplianceProfile = {
      id: `buyer-${Date.now()}`,
      buyerId: profileData.buyerId || `${profileData.buyerName.toLowerCase().replace(/\s+/g, '-')}-001`,
      buyerName: profileData.buyerName,
      buyerType: profileData.buyerType,
      contactInfo: profileData.contactInfo,
      certificationRequirements: profileData.certificationRequirements || {
        organic: false,
        gmp: true,
        haccp: true,
        sqs: false,
        thirdParty: []
      },
      testingRequirements: profileData.testingRequirements || {
        pesticides: true,
        microbials: true,
        heavyMetals: false,
        residualSolvents: false,
        potency: false,
        terpenes: false,
        customTests: []
      },
      packagingRequirements: profileData.packagingRequirements || {
        labeling: [],
        materials: [],
        sustainability: false,
        childResistant: false,
        tamperEvident: false
      },
      deliveryRequirements: profileData.deliveryRequirements || {
        temperature: 'Ambient',
        timeWindow: 'Business hours',
        documentation: [],
        trackingRequired: false
      },
      qualityStandards: profileData.qualityStandards || {
        appearance: 'Commercial grade',
        moisture: { min: 8, max: 12 },
        contamination: 'Standard tolerance',
        defectTolerance: 5
      },
      auditSchedule: profileData.auditSchedule || {
        frequency: 'annual',
        lastAudit: '',
        nextAudit: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        auditType: 'internal'
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In production, this would save to database
    demoProfiles.push(newProfile);

    return NextResponse.json({
      success: true,
      profile: newProfile,
      message: 'Compliance profile created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating compliance profile:', error);
    return NextResponse.json(
      { error: 'Failed to create compliance profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { profileId, ...updateData } = await request.json();
    
    const profileIndex = demoProfiles.findIndex(p => p.id === profileId);
    if (profileIndex === -1) {
      return NextResponse.json(
        { error: 'Compliance profile not found' },
        { status: 404 }
      );
    }

    // Update profile
    demoProfiles[profileIndex] = {
      ...demoProfiles[profileIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      profile: demoProfiles[profileIndex],
      message: 'Compliance profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating compliance profile:', error);
    return NextResponse.json(
      { error: 'Failed to update compliance profile' },
      { status: 500 }
    );
  }
}