import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

// In production, use cloud storage (S3, GCS, etc.)
const UPLOAD_DIR = join(process.cwd(), 'uploads', 'verification-documents');

export async function POST(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;
    const vendorId = formData.get('vendorId') as string;

    if (!file || !documentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const filename = `${documentType}-${uniqueId}.${fileExtension}`;
    const filepath = join(UPLOAD_DIR, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Create database record for document
    const documentRecord = await prisma.$transaction(async (tx) => {
      // Get user from database
      const dbUser = await tx.user.findUnique({ 
        where: { clerkId: user.userId },
        include: { vendorVerification: true }
      });

      if (!dbUser) {
        throw new Error('User not found');
      }

      // Create verification document record
      const document = await tx.verificationDocument.create({
        data: {
          userId: dbUser.id,
          documentType,
          filename,
          originalName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          storageUrl: `/uploads/verification-documents/${filename}`,
          storageProvider: 'local',
          status: 'pending',
          expiryDate: getExpiryDate(documentType),
          metadata: {
            uploadedBy: user.userId,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
          }
        }
      });

      // Create or update vendor verification record
      if (!dbUser.vendorVerification) {
        await tx.vendorVerification.create({
          data: {
            userId: dbUser.id,
            verificationScore: 10, // Base score for uploading first document
            verificationTier: 'basic'
          }
        });
      } else {
        // Update verification flags based on document type
        const updateData: any = {};
        
        if (documentType === 'identity_document') {
          updateData.identityVerified = false; // Will be true after manual verification
        } else if (documentType === 'business_license') {
          updateData.businessVerified = false;
        } else if (documentType === 'bank_statement') {
          updateData.bankVerified = false;
        } else if (documentType === 'insurance_certificate') {
          updateData.insuranceVerified = false;
        }

        await tx.vendorVerification.update({
          where: { userId: dbUser.id },
          data: updateData
        });
      }

      return document;
    });

    // Trigger verification process (async)
    triggerDocumentVerification(documentRecord);

    return NextResponse.json({
      success: true,
      data: {
        documentId: documentRecord.id,
        filename: documentRecord.filename,
        status: documentRecord.status,
        message: 'Document uploaded successfully and queued for verification'
      }
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

function getExpiryDate(documentType: string): Date | null {
  const expiryPeriods: { [key: string]: number } = {
    'business_license': 365, // 1 year
    'insurance_certificate': 365, // 1 year
    'organic_certification': 365, // 1 year
    'gap_certification': 365, // 1 year
    'tax_document': 365, // 1 year
    'bank_statement': 90, // 3 months
    'identity_document': 1825 // 5 years
  };

  const days = expiryPeriods[documentType];
  if (!days) return null;

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  return expiryDate;
}

async function triggerDocumentVerification(document: any) {
  // In production, this would:
  // 1. Send to OCR service for text extraction
  // 2. Validate document authenticity
  // 3. Check against business registries
  // 4. Update verification status
  // 5. Send notification to vendor
  
  
  // Simulate async verification
  setTimeout(async () => {
    // Update document status to verified (simplified)
  }, 5000);
}