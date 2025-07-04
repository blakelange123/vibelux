import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');

    // Get user with verification data
    const dbUser = await prisma.user.findUnique({
      where: vendorId ? { id: vendorId } : { clerkId: user.userId },
      include: {
        vendorVerification: true,
        verificationDocuments: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate verification score and status
    const verificationData = calculateVerificationStatus(
      dbUser.vendorVerification,
      dbUser.verificationDocuments
    );

    return NextResponse.json({
      success: true,
      data: {
        vendor: {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email
        },
        verification: verificationData,
        documents: dbUser.verificationDocuments.map(doc => ({
          id: doc.id,
          type: doc.documentType,
          status: doc.status,
          uploadedAt: doc.createdAt,
          expiryDate: doc.expiryDate,
          filename: doc.originalName
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification status' },
      { status: 500 }
    );
  }
}

function calculateVerificationStatus(
  verification: any,
  documents: any[]
): any {
  if (!verification) {
    return {
      score: 0,
      tier: 'unverified',
      status: 'unverified',
      identityVerified: false,
      businessVerified: false,
      bankVerified: false,
      insuranceVerified: false,
      documentsSubmitted: documents.length,
      documentsVerified: documents.filter(d => d.status === 'verified').length,
      documentsExpired: documents.filter(d => 
        d.expiryDate && new Date(d.expiryDate) < new Date()
      ).length
    };
  }

  // Calculate score based on verified documents and flags
  let score = 0;
  
  // Base points for each verification type
  if (verification.identityVerified) score += 25;
  if (verification.businessVerified) score += 25;
  if (verification.bankVerified) score += 20;
  if (verification.insuranceVerified) score += 20;
  
  // Additional points for verified documents
  const verifiedDocs = documents.filter(d => d.status === 'verified').length;
  score += Math.min(verifiedDocs * 2, 10); // Max 10 points for documents
  
  // Determine tier based on score
  let tier = 'unverified';
  if (score >= 90) tier = 'premium';
  else if (score >= 70) tier = 'verified';
  else if (score >= 30) tier = 'basic';
  
  // Determine overall status
  let status = 'unverified';
  if (documents.some(d => d.status === 'pending' || d.status === 'reviewing')) {
    status = 'pending';
  } else if (score >= 30) {
    status = 'partial';
  }
  if (score >= 70) {
    status = 'verified';
  }
  if (documents.some(d => d.expiryDate && new Date(d.expiryDate) < new Date())) {
    status = 'expired';
  }

  return {
    score,
    tier,
    status,
    ...verification,
    documentsSubmitted: documents.length,
    documentsVerified: verifiedDocs,
    documentsExpired: documents.filter(d => 
      d.expiryDate && new Date(d.expiryDate) < new Date()
    ).length,
    nextSteps: getNextSteps(verification, documents)
  };
}

function getNextSteps(verification: any, documents: any[]): string[] {
  const steps: string[] = [];
  
  if (!verification || !verification.identityVerified) {
    steps.push('Upload government-issued ID for identity verification');
  }
  
  if (!verification || !verification.businessVerified) {
    steps.push('Upload business license or registration documents');
  }
  
  if (!verification || !verification.bankVerified) {
    steps.push('Upload recent bank statement for financial verification');
  }
  
  if (!verification || !verification.insuranceVerified) {
    steps.push('Upload current insurance certificate');
  }
  
  const expiredDocs = documents.filter(d => 
    d.expiryDate && new Date(d.expiryDate) < new Date()
  );
  
  if (expiredDocs.length > 0) {
    steps.push(`Renew ${expiredDocs.length} expired document(s)`);
  }
  
  return steps;
}