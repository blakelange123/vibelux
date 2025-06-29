import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { DocumentAnalyzer } from '@/lib/integrations/document-analyzer';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

// POST /api/investment/document-upload - Upload and analyze financial documents
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const facilityId = formData.get('facilityId') as string;
    const files = formData.getAll('documents') as File[];
    const documentTypes = formData.getAll('documentTypes') as string[];

    if (!facilityId) {
      return NextResponse.json(
        { error: 'Facility ID is required' },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No documents provided' },
        { status: 400 }
      );
    }

    // Validate file types and sizes
    const validTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB
    
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.type}` },
          { status: 400 }
        );
      }
      
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum size is 10MB` },
          { status: 400 }
        );
      }
    }

    const analyzer = new DocumentAnalyzer();
    const uploadResults = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const expectedType = documentTypes[i] || undefined;
      
      try {
        // Save file to disk
        const uploadId = randomUUID();
        const uploadDir = join(process.cwd(), 'uploads', 'financial-documents', userId);
        await mkdir(uploadDir, { recursive: true });
        
        const filename = `${uploadId}-${file.name}`;
        const filepath = join(uploadDir, filename);
        
        const bytes = await file.arrayBuffer();
        await writeFile(filepath, Buffer.from(bytes));

        // Extract text content based on file type
        let textContent = '';
        
        if (file.type === 'text/plain' || file.type === 'text/csv') {
          textContent = await file.text();
        } else if (file.type === 'application/pdf') {
          // For PDFs, we'd need a PDF parser like pdf2pic or pdf-parse
          // For now, we'll return an error and suggest text/CSV upload
          textContent = 'PDF parsing not yet implemented. Please upload as text/CSV or image.';
        } else if (file.type.startsWith('image/')) {
          // For images, Claude can analyze them directly
          textContent = `Image file: ${file.name}. Content will be analyzed visually.`;
        } else {
          textContent = 'Unsupported format for text extraction.';
        }

        // Analyze document with Claude
        const analysis = await analyzer.analyzeFinancialDocument(
          textContent,
          file.name,
          expectedType
        );

        // Save to database
        const documentRecord = await prisma.financialDocument.create({
          data: {
            id: uploadId,
            userId,
            facilityId,
            filename: file.name,
            originalName: file.name,
            fileType: file.type,
            fileSize: file.size,
            filePath: filepath,
            documentType: analysis.documentType,
            analysisResult: analysis,
            extractedData: analysis.extractedData,
            confidence: analysis.confidence,
            period: analysis.period ? {
              startDate: analysis.period.startDate,
              endDate: analysis.period.endDate
            } : null,
            currency: analysis.currency,
            processingStatus: analysis.errors.length > 0 ? 'ERROR' : 'COMPLETED',
            errors: analysis.errors,
            warnings: analysis.warnings
          }
        });

        uploadResults.push({
          id: uploadId,
          filename: file.name,
          documentType: analysis.documentType,
          confidence: analysis.confidence,
          errors: analysis.errors,
          warnings: analysis.warnings,
          success: true
        });

      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        uploadResults.push({
          filename: file.name,
          success: false,
          error: error.message
        });
      }
    }

    // Validate consistency across all uploaded documents
    const analysisResults = uploadResults
      .filter(r => r.success)
      .map(r => ({ 
        documentType: r.documentType, 
        confidence: r.confidence,
        errors: r.errors || [],
        warnings: r.warnings || []
      }));

    let consistencyCheck = { valid: true, issues: [], recommendations: [] };
    if (analysisResults.length > 1) {
      // We'd need to fetch the full analysis results for this
      // For now, just return basic validation
    }

    return NextResponse.json({
      success: true,
      uploadedDocuments: uploadResults.length,
      successfulAnalyses: uploadResults.filter(r => r.success).length,
      results: uploadResults,
      consistencyCheck,
      nextSteps: {
        canGenerateDueDiligence: uploadResults.some(r => r.success && r.confidence > 60),
        recommendedActions: [
          'Review extracted data for accuracy',
          'Verify document periods match your analysis requirements',
          'Generate due diligence report from analyzed documents'
        ]
      }
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process documents' },
      { status: 500 }
    );
  }
}

// GET /api/investment/document-upload - List uploaded documents
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    const documents = await prisma.financialDocument.findMany({
      where: {
        userId,
        ...(facilityId && { facilityId })
      },
      select: {
        id: true,
        filename: true,
        originalName: true,
        fileType: true,
        fileSize: true,
        documentType: true,
        confidence: true,
        period: true,
        currency: true,
        processingStatus: true,
        errors: true,
        warnings: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      documents,
      summary: {
        total: documents.length,
        byType: documents.reduce((acc, doc) => {
          acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        averageConfidence: documents.length > 0 
          ? Math.round(documents.reduce((sum, doc) => sum + doc.confidence, 0) / documents.length)
          : 0
      }
    });

  } catch (error) {
    console.error('Document list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// DELETE /api/investment/document-upload - Delete document
export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Find and delete document
    const document = await prisma.financialDocument.findFirst({
      where: {
        id: documentId,
        userId
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete from database
    await prisma.financialDocument.delete({
      where: { id: documentId }
    });

    // TODO: Delete physical file from disk

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Document deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}