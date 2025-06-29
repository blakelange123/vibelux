# AI Provider Setup Guide

## 🤖 **Intelligent Provider Routing**

The VibeLux AI service automatically routes tasks to the best provider for each use case:

### **Provider Specializations:**

| Provider | Best For | Fallback Priority |
|----------|----------|-------------------|
| **Claude (AWS Bedrock)** | General analysis, complex reasoning, recipe optimization | 🥇 Primary (Default) |
| **Clarifai** | Disease detection, pest identification, plant classification | 🥈 Secondary |
| **OpenAI Vision** | Simple classification, cost-effective basic tasks | 🥉 Third |
| **Google Vertex AI** | Batch processing, custom AutoML training | 4th |
| **AWS SageMaker** | Custom model deployment, edge inference | 5th |

---

## 🔧 **Environment Variables**

Add these to your `.env.local` file:

```bash
# AWS Configuration (Required for Claude/Bedrock and SageMaker)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# OpenAI Configuration (Optional - for cost optimization)
OPENAI_API_KEY=sk-your_openai_api_key

# Clarifai Configuration (Recommended - best for plant diseases)
CLARIFAI_API_KEY=your_clarifai_api_key
CLARIFAI_USER_ID=your_clarifai_user_id

# Google Cloud Configuration (Optional - for batch processing)
GOOGLE_PROJECT_ID=your_google_project_id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

---

## 📋 **Step-by-Step Setup**

### **1. Claude (AWS Bedrock) - PRIMARY PROVIDER** ⭐

**Why:** Best overall AI for greenhouse analysis, complex reasoning, and detailed explanations.

**Setup:**
1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Create IAM user with these policies:
   - `AmazonBedrockFullAccess`
   - `AmazonSageMakerFullAccess` (for future use)
3. Generate Access Key & Secret
4. In AWS Bedrock console, request access to Claude 3 Sonnet model

**Cost:** ~$3-15 per 1000 images analyzed

---

### **2. Clarifai - DISEASE DETECTION SPECIALIST** 🌱

**Why:** Specialized models trained specifically on plant diseases and crop monitoring.

**Setup:**
1. Sign up at [Clarifai.com](https://clarifai.com/)
2. Go to Account → Security → Create API Key
3. Choose \"Plant Disease Detection\" model in your dashboard
4. Note your User ID from account settings

**Cost:** ~$20-80/month for typical greenhouse

---

### **3. OpenAI Vision - COST-EFFECTIVE OPTION** 💰

**Why:** Good for simple classification tasks and when cost optimization is important.

**Setup:**
1. Create account at [OpenAI Platform](https://platform.openai.com/)
2. Add billing information (required)
3. Generate API key from API Keys section
4. Set spending limits for cost control

**Cost:** ~$0.01-0.03 per image (most cost-effective)

---

### **4. Google Vertex AI - BATCH PROCESSING** 📊

**Why:** Excellent for processing thousands of images or training custom models.

**Setup:**
1. Create [Google Cloud Project](https://console.cloud.google.com/)
2. Enable APIs: AI Platform, AutoML, Vertex AI
3. Create Service Account with roles:
   - AI Platform Admin
   - AutoML Admin
   - Vertex AI User
4. Download service account JSON key

**Cost:** ~$30-150/month depending on usage

---

## 🚀 **Quick Start Configurations**

### **Minimum Setup (Claude Only)**
```bash
# Just AWS Bedrock for Claude
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

### **Recommended Setup (Claude + Clarifai)**
```bash
# Best of both worlds
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
CLARIFAI_API_KEY=your_clarifai_key
CLARIFAI_USER_ID=your_clarifai_user
```

### **Full Production Setup**
```bash
# All providers for maximum reliability
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
OPENAI_API_KEY=sk-your_openai_key
CLARIFAI_API_KEY=your_clarifai_key
CLARIFAI_USER_ID=your_clarifai_user
GOOGLE_PROJECT_ID=your_project
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

---

## 🎯 **Automatic Task Routing Examples**

The AI service automatically chooses the best provider:

```typescript
// Disease detection → Clarifai first, Claude fallback
const diseaseResult = await aiService.analyzePlantHealth(image, {
  taskType: 'disease-detection'
});

// General analysis → Claude first
const generalResult = await aiService.analyzePlantHealth(image, {
  taskType: 'general-analysis'
});

// Batch processing → Google Vertex AI first
const batchResults = await aiService.batchAnalyzePlantHealth(images, {
  taskType: 'batch-processing'
});
```

---

## 💰 **Cost Optimization**

**Monthly Cost Estimates:**

| Setup Type | Cost Range | Use Case |
|------------|------------|----------|
| Claude Only | $50-200 | Small greenhouse, getting started |
| Claude + Clarifai | $70-280 | Best balance of accuracy and cost |
| Full Production | $120-530 | Enterprise, maximum reliability |

**Cost-Saving Tips:**
1. Start with Claude-only setup
2. Add Clarifai for specialized plant disease detection
3. Use caching to reduce duplicate API calls
4. Implement rate limiting for cost control
5. Use batch processing for high-volume scenarios

---

## ✅ **Testing Your Setup**

After configuration, test each provider:

```typescript
import { getAIAnalyticsService } from '@/services/ai-analytics-service';

const aiService = getAIAnalyticsService();

// Test plant health analysis
const testImage = '/path/to/plant-image.jpg';
const result = await aiService.analyzePlantHealth(testImage, {
  taskType: 'disease-detection'
});

console.log('Analysis result:', result);
```

---

## 🔍 **Provider Health Check**

Check which providers are working:

```typescript
const healthStatus = await aiService.checkProviderHealth();
console.log('Provider status:', healthStatus);

// Expected output:
// {
//   'aws-bedrock': { status: 'healthy', latency: 250 },
//   'clarifai': { status: 'healthy', latency: 180 },
//   'openai-vision': { status: 'healthy', latency: 300 },
//   'google-vertex': { status: 'not-configured' }
// }
```

---

## 🎓 **Best Practices**

1. **Start Simple**: Begin with Claude (AWS Bedrock) only
2. **Add Gradually**: Add Clarifai for plant disease detection
3. **Monitor Costs**: Set up billing alerts in each platform
4. **Use Task Types**: Let the system route to optimal providers
5. **Cache Results**: Implement caching for repeated analyses
6. **Monitor Performance**: Track which providers work best for your data

The system is designed to be fault-tolerant - if one provider fails, it automatically tries the next best option for your specific task type.