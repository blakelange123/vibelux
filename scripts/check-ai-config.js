#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking AI Assistant Configuration...\n');

// Check for .env.local file
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.error('❌ .env.local file not found!');
  console.log('\nTo fix this:');
  console.log('1. Create a .env.local file in the root directory');
  console.log('2. Add your Claude API key:');
  console.log('   CLAUDE_API_KEY=sk-ant-...\n');
  process.exit(1);
}

// Read .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const hasClaudeKey = envContent.includes('CLAUDE_API_KEY=');
const hasOpenAIKey = envContent.includes('OPENAI_API_KEY=');

if (!hasClaudeKey) {
  console.error('❌ CLAUDE_API_KEY not found in .env.local!');
  console.log('\nTo fix this:');
  console.log('1. Get your API key from https://console.anthropic.com/settings/keys');
  console.log('2. Add to .env.local:');
  console.log('   CLAUDE_API_KEY=sk-ant-...\n');
  
  if (hasOpenAIKey) {
    console.log('⚠️  Note: Found OPENAI_API_KEY - Vibelux is migrating to Claude');
    console.log('   Please add Claude API key for full functionality\n');
  }
  process.exit(1);
}

// Check if key is properly formatted
const keyMatch = envContent.match(/CLAUDE_API_KEY=(.+)/);
if (keyMatch) {
  const key = keyMatch[1].trim();
  if (key.startsWith('sk-ant-') && key.length > 30) {
    console.log('✅ Claude API key found and appears valid');
  } else {
    console.error('⚠️  Claude API key found but may be invalid');
    console.log('   Make sure it starts with "sk-ant-" and is complete\n');
  }
}

// Check for legacy OpenAI key
if (hasOpenAIKey) {
  console.log('ℹ️  Legacy OpenAI key found - can be removed after migration');
}

// Test API endpoint
console.log('\n🔍 Testing AI Design Assistant endpoint...');
fetch('http://localhost:3001/api/ai-design-chat', {
  method: 'GET'
})
.then(res => res.json())
.then(data => {
  if (data.status === 'ready') {
    console.log('✅ AI Design Assistant is ready!');
    console.log(`   Model: ${data.model}`);
    console.log(`   Capabilities: ${data.capabilities.length} features\n`);
  } else {
    console.error('❌ AI Design Assistant not ready');
    console.log(`   Status: ${data.status}\n`);
  }
})
.catch(err => {
  console.error('❌ Could not reach API endpoint');
  console.log('   Make sure the development server is running on port 3001\n');
});