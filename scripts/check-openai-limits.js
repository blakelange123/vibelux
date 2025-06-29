#!/usr/bin/env node

const https = require('https');

console.log('🔍 Checking OpenAI API Status and Limits...\n');

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('❌ OPENAI_API_KEY not found in environment');
  console.log('\nSet it with: export OPENAI_API_KEY=sk-...');
  process.exit(1);
}

// Test API with a minimal request
const data = JSON.stringify({
  model: 'gpt-4-turbo-preview',
  messages: [
    { role: 'system', content: 'You are a test.' },
    { role: 'user', content: 'Reply with just "OK"' }
  ],
  max_tokens: 10
});

const options = {
  hostname: 'api.openai.com',
  port: 443,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  // Check rate limit headers
  const rateLimitHeaders = {
    'requests-limit': res.headers['x-ratelimit-limit-requests'],
    'requests-remaining': res.headers['x-ratelimit-remaining-requests'],
    'requests-reset': res.headers['x-ratelimit-reset-requests'],
    'tokens-limit': res.headers['x-ratelimit-limit-tokens'],
    'tokens-remaining': res.headers['x-ratelimit-remaining-tokens'],
    'tokens-reset': res.headers['x-ratelimit-reset-tokens']
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
      console.log(`Usage: ${response.usage.total_tokens} tokens`);
    } else if (res.statusCode === 429) {
      console.log('\n⚠️  Rate limit exceeded!');
      console.log('Error:', response.error?.message || 'Rate limit hit');
      
      // Calculate tier based on limits
      const requestLimit = parseInt(rateLimitHeaders['requests-limit']);
      let tier = 'Unknown';
      if (requestLimit <= 500) tier = 'Free Tier';
      else if (requestLimit <= 5000) tier = 'Tier 1 ($5+)';
      else if (requestLimit <= 10000) tier = 'Tier 2 ($50+)';
      else tier = 'Tier 3+ ($100+)';
      
      console.log(`\n💳 Current Tier: ${tier}`);
      console.log('\nTo increase limits:');
      console.log('1. Add payment method at https://platform.openai.com/account/billing');
      console.log('2. Increase usage to move up tiers');
      console.log('3. Or wait for limits to reset');
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