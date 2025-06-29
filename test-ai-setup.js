/**
 * Test script to verify AWS Bedrock (Claude) setup
 * Run with: node test-ai-setup.js
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, ...values] = line.split('=');
      if (key && values.length) {
        process.env[key.trim()] = values.join('=').trim();
      }
    }
  });
}

async function testBedrockSetup() {
  console.log('🧪 Testing AWS Bedrock (Claude) setup...\n');

  // Check environment variables
  if (!process.env.AWS_ACCESS_KEY_ID) {
    console.error('❌ AWS_ACCESS_KEY_ID not found in .env.local');
    return;
  }
  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ AWS_SECRET_ACCESS_KEY not found in .env.local');
    return;
  }
  
  console.log('✅ Environment variables found');
  console.log(`📍 Region: ${process.env.AWS_REGION || 'us-east-1'}`);

  // Test simple text analysis with smaller token limit for Opus 4
  const prompt = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: "What causes yellow lettuce leaves?"
      }
    ]
  };

  // Claude model selection
  // Using Opus 4 inference profile
  let modelId = 'us.anthropic.claude-opus-4-20250514-v1:0'; // Opus 4 inference profile
  // Fallback: 'anthropic.claude-3-sonnet-20240229-v1:0'

  // Initialize Bedrock client
  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  try {

    console.log('🔗 Bedrock client initialized');
    console.log(`🤖 Attempting to use model: ${modelId}`);
    
    const command = new InvokeModelCommand({
      modelId: modelId,
      body: JSON.stringify(prompt),
      contentType: 'application/json'
    });

    console.log('📤 Sending test analysis request to Claude...');
    
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    console.log('✅ SUCCESS! Claude responded:\n');
    console.log('📊 Analysis Result:');
    console.log('─'.repeat(50));
    console.log(responseBody.content[0].text);
    console.log('─'.repeat(50));
    
    console.log('\n🎉 AWS Bedrock setup is working perfectly!');
    console.log('\n📝 Next steps:');
    console.log('1. Your AI service will now use Claude as the primary provider');
    console.log('2. Test plant health analysis with actual images');
    console.log('3. Consider adding Clarifai for specialized disease detection');
    
  } catch (error) {
    console.error('\n❌ Setup test failed:');
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.$metadata?.httpStatusCode
    });
    
    if (error.name === 'ThrottlingException') {
      console.error('\n⚠️  Opus 4 is rate limited. This is normal for new accounts.');
      console.error('Trying with Claude 3 Sonnet instead...\n');
      
      // Retry with Sonnet
      const sonnetCommand = new InvokeModelCommand({
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        body: JSON.stringify(prompt),
        contentType: 'application/json'
      });
      
      try {
        const response = await client.send(sonnetCommand);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        
        console.log('✅ SUCCESS with Claude 3 Sonnet!\n');
        console.log('📊 Analysis Result:');
        console.log('─'.repeat(50));
        console.log(responseBody.content[0].text);
        console.log('─'.repeat(50));
        
        console.log('\n📝 Note: Opus 4 is configured but rate-limited.');
        console.log('Your app will automatically fallback to Sonnet when needed.');
        return;
      } catch (fallbackError) {
        console.error('Fallback to Sonnet also failed:', fallbackError.message);
      }
    } else if (error.name === 'AccessDeniedException') {
      console.error('🔐 Access denied - check your IAM permissions');
      console.error('   Make sure your IAM user has AmazonBedrockFullAccess policy');
    } else if (error.name === 'ValidationException') {
      console.error('🚫 Model access not granted');
      console.error('   Go to AWS Bedrock console → Model access → Request access to Claude models');
      console.error('   Specific model:', modelId);
    } else if (error.code === 'CredentialsError') {
      console.error('🔑 Invalid AWS credentials');
      console.error('   Double-check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    } else {
      console.error('🐛 Unexpected error:', error.message);
    }
    
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Verify AWS credentials are correct');
    console.error('2. Check Bedrock model access in AWS console');
    console.error('3. Ensure IAM user has proper permissions');
    console.error('4. Try a different AWS region if needed');
  }
}

// Run the test
testBedrockSetup().catch(console.error);