import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-utils';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }, { status: 400 });
    }

    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    // Generate unique filename with secure random ID
    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(16).toString('hex');
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomSuffix}.${extension}`;

    // Convert file to buffer for upload
    const buffer = Buffer.from(await file.arrayBuffer());

    // Initialize S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });

    // Upload to S3
    const bucketName = process.env.AWS_S3_BUCKET || 'vibelux-photos';
    const key = `photos/${user.id}/${filename}`;
    
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        userId: user.id,
        uploadedAt: new Date().toISOString()
      }
    });

    try {
      await s3Client.send(uploadCommand);
    } catch (uploadError) {
      console.error('S3 upload error:', uploadError);
      throw new Error('Failed to upload to storage');
    }

    // Generate the photo URL
    const bucketUrl = process.env.AWS_S3_BUCKET_URL || `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`;
    const photoUrl = `${bucketUrl}/${key}`;

    // Store photo metadata in database (optional)
    // await prisma.photo.create({
    //   data: {
    //     userId: user.id,
    //     url: photoUrl,
    //     filename,
    //     size: file.size,
    //     type: file.type
    //   }
    // });

    return NextResponse.json({
      success: true,
      url: photoUrl,
      filename,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    // Don't expose internal error details to client
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}