#!/usr/bin/env node

const https = require('https');

console.log('🔍 Checking Claude API Status and Limits...\n');

const apiKey = process.env.CLAUDE_API_KEY;

if (!apiKey) {
  console.error('❌ CLAUDE_API_KEY not found in environment');
  console.log('\nSet it with: export CLAUDE_API_KEY=sk-ant-...');
  process.exit(1);
}

// Test API with a minimal request
const data = JSON.stringify({
  model: 'claude-3-5-haiku-20241022',
  messages: [
    { role: 'user', content: 'Reply with just "OK"' }
  ],
  max_tokens: 10
});

const options = {
  hostname: 'api.anthropic.com',
  port: 443,
  path: '/v1/messages',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  // Check rate limit headers
  const rateLimitHeaders = {
    'requests-limit': res.headers['anthropic-ratelimit-requests-limit'],
    'requests-remaining': res.headers['anthropic-ratelimit-requests-remaining'],
    'requests-reset': res.headers['anthropic-ratelimit-requests-reset'],
    'tokens-limit': res.headers['anthropic-ratelimit-tokens-limit'],
    'tokens-remaining': res.headers['anthropic-ratelimit-tokens-remaining'],
    'tokens-reset': res.headers['anthropic-ratelimit-tokens-reset']
  };

  console.log('\n📊 Rate Limit Status:');
  console.log(`Requests: ${rateLimitHeaders['requests-remaining'] || 'N/A'} / ${rateLimitHeaders['requests-limit'] || 'N/A'}`);
  console.log(`Tokens: ${rateLimitHeaders['tokens-remaining'] || 'N/A'} / ${rateLimitHeaders['tokens-limit'] || 'N/A'}`);
  
  if (rateLimitHeaders['requests-reset']) {
    const resetTime = new Date(rateLimitHeaders['requests-reset']);
    console.log(`Resets at: ${resetTime.toLocaleTimeString()}`);
  }

  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    const response = JSON.parse(responseData);
    
    if (res.statusCode === 200) {
      console.log('\n✅ API is working!');
      console.log(`Model: ${response.model}`);
      if (response.usage) {
        console.log(`Usage: ${response.usage.input_tokens + response.usage.output_tokens} tokens`);
        console.log(`  Input: ${response.usage.input_tokens} tokens`);
        console.log(`  Output: ${response.usage.output_tokens} tokens`);
      }
    } else if (res.statusCode === 429) {
      console.log('\n⚠️  Rate limit exceeded!');
      console.log('Error:', response.error?.message || 'Rate limit hit');
      
      // Show tier information
      console.log(`\n💳 Rate Limits:`);
      console.log('Default: 1,000 requests/minute, 100,000 tokens/minute');
      console.log('\nTo increase limits:');
      console.log('1. Contact Anthropic sales for higher tier');
      console.log('2. Implement exponential backoff');
      console.log('3. Or wait for limits to reset');
    } else if (res.statusCode === 401) {
      console.log('\n❌ Authentication Error');
      console.log('Invalid API key. Check your CLAUDE_API_KEY');
    } else {
      console.log('\n❌ API Error:', res.statusCode);
      console.log('Response:', response);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(data);
req.end();