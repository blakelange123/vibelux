# AI-Powered Historical Data Import Setup Guide

## Overview
The Historical Data Import feature uses OpenAI's GPT-4 to intelligently understand and process messy cultivation data. This guide explains how to set it up.

## Prerequisites
1. OpenAI API account with GPT-4 access
2. API key from https://platform.openai.com/api-keys

## Setup Steps

### 1. Environment Variables
Add your OpenAI API key to `.env.local`:

```bash
# DO NOT commit this file to git
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important**: 
- Do NOT use `NEXT_PUBLIC_` prefix (this would expose your key)
- Add `.env.local` to `.gitignore`
- Never commit API keys to version control

### 2. Cost Considerations
- GPT-4 Turbo costs approximately $0.01 per 1K input tokens
- Each data import uses ~2-3K tokens
- Estimated cost: $0.02-0.03 per import
- Consider implementing usage limits

### 3. Security Best Practices

#### API Route Protection
The API route at `/api/ai-interpret-data` is already secured server-side. Consider adding:

```typescript
// Rate limiting example
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per hour
});
```

#### Data Privacy
- Only sample data (first 20 rows) is sent to OpenAI
- No sensitive data should be in column headers
- Consider data anonymization if needed

### 4. Testing the Integration

1. **Test with Sample Data**:
```csv
date,temp,humidity,co2,ph,ec,yield
2024-01-01,75.5,55%,1200ppm,6.2,1.8,125g
2024-01-02,76.0,52,1150,6.1,1.9ec,130
```

2. **Expected AI Response**:
- Recognizes temperature in Fahrenheit
- Identifies mixed units (%, ppm, ec)
- Suggests proper data types
- Provides confidence scores

### 5. Fallback Options

If OpenAI API is unavailable:
1. System falls back to pattern-based matching
2. Basic field recognition still works
3. Manual mapping interface available

### 6. Alternative AI Providers

To use other AI providers, modify `/api/ai-interpret-data/route.ts`:

```typescript
// Example: Using Anthropic Claude
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

### 7. On-Premise Option

For complete data privacy, consider:
- Llama 2 or Mistral models
- Local deployment with Ollama
- Requires significant compute resources

### 8. Monitoring & Logging

Add monitoring to track:
- API usage and costs
- Success/failure rates
- Processing times
- Common data patterns

### 9. User Documentation

Inform users about:
- What data is sent to AI (samples only)
- How their data is protected
- Option to disable AI features
- Manual mapping alternatives

## Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Check `.env.local` exists
   - Verify key format (starts with `sk-`)
   - Restart Next.js server

2. **"Failed to interpret data"**
   - Check API key has GPT-4 access
   - Verify internet connection
   - Check OpenAI service status

3. **High API Costs**
   - Implement caching for similar schemas
   - Reduce sample size
   - Use GPT-3.5 for initial parsing

## Support
For issues or questions:
- Check OpenAI API documentation
- Review error logs in browser console
- Contact support with sanitized examples