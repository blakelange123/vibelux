#!/usr/bin/env node

console.log('🚀 Vibelux Production Readiness Checklist\n');

const checks = {
  environment: {
    'Claude API Key': !!process.env.CLAUDE_API_KEY,
    'Stripe Secret Key': !!process.env.STRIPE_SECRET_KEY,
    'Stripe Webhook Secret': !!process.env.STRIPE_WEBHOOK_SECRET,
    'Clerk Secret Key': !!process.env.CLERK_SECRET_KEY,
    'Database URL': !!process.env.DATABASE_URL,
  },
  
  claude: {
    'API Key Format': process.env.CLAUDE_API_KEY?.startsWith('sk-ant-') || false,
    'Key Length Valid': (process.env.CLAUDE_API_KEY?.length || 0) > 40,
  },
  
  migration: {
    'OpenAI Key (Legacy)': !!process.env.OPENAI_API_KEY ? '⚠️ Can be removed' : '✅ Not present',
  },
  
  recommendations: {
    'Use Anthropic Account': '✅ Required for production',
    'Claude Haiku for Simple': '💰 Fast & cost-effective for basic queries',
    'Claude Sonnet for Complex': '🧠 Best for complex designs & analysis',
    'Enable Usage Tracking': '✅ Track API costs per user',
    'Implement Caching': '⚠️  Cache common designs to reduce costs',
    'Rate Limiting': '🛡️ Default: 1000 req/min, 100K tokens/min',
  }
};

// Check environment variables
console.log('📋 Environment Variables:');
Object.entries(checks.environment).forEach(([key, value]) => {
  console.log(`  ${value ? '✅' : '❌'} ${key}`);
});

console.log('\n🤖 Claude Configuration:');
Object.entries(checks.claude).forEach(([key, value]) => {
  console.log(`  ${value ? '✅' : '❌'} ${key}`);
});

console.log('\n🔄 Migration Status:');
Object.entries(checks.migration).forEach(([key, value]) => {
  console.log(`  ${value}`);
});

console.log('\n💡 Production Recommendations:');
Object.entries(checks.recommendations).forEach(([key, value]) => {
  console.log(`  ${value} ${key}`);
});

// Cost estimates
console.log('\n💰 AI Cost Estimates (Claude 3.5 Sonnet):');
console.log('  • Per design request: ~$0.02-0.05');
console.log('  • 100 requests/day: ~$60-150/month');
console.log('  • With 80% margin: $300-750 revenue needed');
console.log('  • Break-even: ~1-2 Professional subscriptions');
console.log('\n📊 Model Pricing (per 1M tokens):');
console.log('  • Claude Haiku: $0.25 input / $1.25 output');
console.log('  • Claude Sonnet: $3 input / $15 output');

console.log('\n📈 Token Limits by Plan:');
console.log('  • Small facilities (<5k sq ft): 4,000 tokens');
console.log('  • Medium facilities (5-10k sq ft): 6,000 tokens');
console.log('  • Large facilities (10-20k sq ft): 8,000 tokens');
console.log('  • XL facilities (>20k sq ft): 10,000 tokens');

// Final assessment
const envReady = Object.values(checks.environment).filter(v => v).length;
const totalEnv = Object.values(checks.environment).length;

console.log('\n🎯 Overall Readiness:');
console.log(`  Environment: ${envReady}/${totalEnv} configured`);

if (envReady === totalEnv) {
  console.log('\n✅ Ready for production!');
} else {
  console.log('\n⚠️  Missing configuration - see above for details');
  console.log('\n📝 Next Steps:');
  console.log('  1. Set missing environment variables');
  console.log('  2. Upgrade OpenAI account to paid tier');
  console.log('  3. Test with production API keys');
  console.log('  4. Monitor usage and costs');
}