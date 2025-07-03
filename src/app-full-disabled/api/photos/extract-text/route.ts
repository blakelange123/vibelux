import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { photoUrl } = await request.json();

    if (!photoUrl) {
      return NextResponse.json({ error: 'Photo URL is required' }, { status: 400 });
    }

    // Use OpenAI Vision API for OCR
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all visible text from this image. Return the response as JSON with: text (all text combined), confidence (0-1), and boundingBoxes array with text, x, y, width, height for each text element. Focus on equipment labels, serial numbers, model numbers, safety signs, and any readable text.'
              },
              {
                type: 'image_url',
                image_url: { url: photoUrl }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const aiResult = await response.json();
    const analysis = aiResult.choices[0]?.message?.content;

    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(analysis);
      return NextResponse.json(parsed);
    } catch {
      // Fallback to plain text extraction
      return NextResponse.json({
        text: analysis || '',
        confidence: 0.85,
        boundingBoxes: []
      });
    }

  } catch (error) {
    console.error('OCR extraction failed:', error);
    return NextResponse.json(
      { error: 'Failed to extract text from image' },
      { status: 500 }
    );
  }
}