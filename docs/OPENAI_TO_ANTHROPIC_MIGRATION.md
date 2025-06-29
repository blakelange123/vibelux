# OpenAI to Anthropic SDK Migration Guide

## Overview
This guide outlines the migration from OpenAI SDK to Anthropic SDK across the Vibelux application.

## Current State
- **OpenAI SDK**: Used in 10+ components for AI-powered features
- **Anthropic SDK**: Already configured and used in some components
- **Both SDKs**: Currently running in parallel

## Migration Strategy

### Phase 1: Configuration Updates
1. **Remove hardcoded API keys** ✅ (Completed)
2. **Update environment variables**:
   ```bash
   # .env.local
   CLAUDE_API_KEY=your-anthropic-api-key
   # Remove OPENAI_API_KEY after migration
   ```

### Phase 2: API Route Migrations

#### 1. `/src/app/api/ai-interpret-data/route.ts`
**Current**: Uses OpenAI for data interpretation
**Action**: Replace with Anthropic Claude
```typescript
// Replace
import { createOpenAIClient } from '@/lib/openai-config';
const openai = createOpenAIClient();

// With
import { createClaudeClient } from '@/lib/claude-config';
const claude = createClaudeClient();

// Update API calls
const response = await claude.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 4000,
  messages: [{ role: 'user', content: prompt }]
});
```

#### 2. `/src/app/api/ai-assistant/globalgap/route.ts`
**Current**: GlobalGAP certification assistant using OpenAI
**Action**: Migrate to Claude with enhanced context

#### 3. `/src/app/api/ai-test/route.ts` & `/src/app/api/test-openai/route.ts`
**Action**: Remove or consolidate into single Claude test endpoint

### Phase 3: Component Updates

#### Key Components to Update:
1. `AIAssistant.tsx` - General AI chat interface
2. `AIDesignAssistant.tsx` - Design-specific AI
3. `HistoricalDataImport.tsx` - Data interpretation
4. `AdvancedDesignerProfessional.tsx` - Professional design tools

### Phase 4: Library Updates

#### Update `ai-data-interpreter.ts`:
- Replace OpenAI calls with Claude
- Maintain fallback mechanisms
- Update prompt engineering for Claude's style

### Phase 5: Utility Scripts
- Update `check-openai-limits.js` → `check-claude-limits.js`
- Update `check-ai-config.js` for Anthropic
- Update `production-checklist.js`

## Code Conversion Examples

### OpenAI to Claude API Call:
```typescript
// OpenAI
const completion = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [{ role: 'user', content: prompt }],
  max_tokens: 4000,
  temperature: 0.7
});
const result = completion.choices[0].message.content;

// Claude
const message = await claude.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 4000,
  temperature: 0.7,
  messages: [{ role: 'user', content: prompt }]
});
const result = message.content[0].text;
```

### Model Selection:
```typescript
// OpenAI models
'gpt-4-turbo-preview' → 'claude-3-5-sonnet-20241022'
'gpt-3.5-turbo' → 'claude-3-5-haiku-20241022'
'gpt-4-vision-preview' → 'claude-3-5-sonnet-20241022' (with image support)
```

## Benefits of Migration
1. **Better context handling**: Claude handles longer contexts better
2. **Cost efficiency**: Competitive pricing for similar capabilities
3. **Consistency**: Single AI provider across the platform
4. **Performance**: Claude's models are optimized for technical tasks

## Testing Checklist
- [ ] All API routes respond correctly
- [ ] Fallback mechanisms work when API is unavailable
- [ ] Rate limiting functions properly
- [ ] Usage tracking updates correctly
- [ ] Error messages are user-friendly
- [ ] Performance meets or exceeds OpenAI implementation

## Rollback Plan
Keep OpenAI configuration in place but disabled. Can re-enable by:
1. Restoring OPENAI_API_KEY in environment
2. Reverting library imports
3. Redeploying affected services

## Timeline
- Week 1: Configuration and API routes
- Week 2: Component updates
- Week 3: Testing and optimization
- Week 4: Full deployment and OpenAI removal