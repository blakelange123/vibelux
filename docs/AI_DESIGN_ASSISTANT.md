# AI Design Assistant - GPT-4 Integration

The Vibelux AI Design Assistant now features full GPT-4 integration for intelligent, natural language facility design.

## Features

### Natural Language Understanding
- Handles typos, colloquialisms, and incomplete sentences
- Understands context from conversation history
- Interprets complex multi-part requests

### Intelligent Design Generation
- Multi-zone facility layouts
- Automatic fixture selection from DLC database
- Optimal placement calculations
- Rack and tier configurations
- HVAC fan placement
- Electrical load planning

### Advanced Capabilities
- **8-foot Fixture Detection**: Automatically filters fixtures 94-98 inches in length
- **Typo Handling**: "ayers" → "layers", "build me 2 racks" → proper rack count
- **Phased Buildouts**: Design facilities in stages with budget tracking
- **Code Compliance**: Validates against building codes and standards
- **Cost Analysis**: Equipment, installation, operating costs, and ROI

## Setup

1. **Get OpenAI API Key**
   - Visit https://platform.openai.com/api-keys
   - Create a new API key
   - Add to your `.env.local` file:
   ```
   OPENAI_API_KEY=sk-...your-key-here...
   NEXT_PUBLIC_USE_OPENAI=true
   ```

2. **Test the Integration**
   - Open the AI Design Assistant panel
   - Try: "Design a 40x20 cannabis flower room with 800 PPFD using 8' fixtures"
   - The AI will create a complete design with proper fixture placement

## API Endpoint

The AI Design Assistant uses the `/api/ai-design-chat` endpoint:

### Request Format
```json
{
  "message": "User's natural language request",
  "context": {
    "roomDimensions": { "width": 40, "length": 20, "height": 10 },
    "currentDesign": [...existing objects...],
    "dlcFixtures": [...DLC fixture database...],
    "preferences": {
      "targetPPFD": 800,
      "budget": 50000,
      "cropType": "cannabis",
      "growthStage": "flowering"
    }
  },
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

### Response Format
```json
{
  "success": true,
  "intent": "new_design",
  "response": "Natural language explanation",
  "design": {
    "zones": [{
      "name": "Flower Room 1",
      "dimensions": { "width": 40, "length": 20, "height": 10 },
      "purpose": "flowering",
      "targetPPFD": 800,
      "fixtures": [{
        "id": "unique_id",
        "model": "Fluence SPYDR 2p",
        "x": 10, "y": 5, "z": 7,
        "wattage": 645,
        "ppf": 1700
      }],
      "racks": [{
        "x": 5, "y": 10,
        "width": 4, "length": 8,
        "tiers": 1
      }]
    }],
    "metrics": {
      "totalWattage": 25800,
      "avgPPFD": 850,
      "uniformity": 0.82
    },
    "costs": {
      "equipment": 45000,
      "total": 52000,
      "annualOperating": 8500
    },
    "validation": {
      "meetsTargets": true,
      "codeCompliant": true,
      "recommendations": ["Consider adding HAF fans"]
    }
  }
}
```

## Example Requests

### Basic Design
```
"I need 800 PPFD for cannabis in a 40x20 room"
```

### Vertical Farm
```
"Design a vertical farm with 10 racks, 5 tiers each, for lettuce at 250 PPFD"
```

### 8-Foot Fixtures
```
"Use 8' fixtures for my 100x50 warehouse grow"
```

### Phased Buildout
```
"Design phase 1 with 4 racks, then phase 2 adds 6 more racks, $100k total budget"
```

### Natural Language with Typos
```
"build me 2 racks with 5 ayers each for micorgreens"
```
→ AI understands: 2 racks, 5 layers/tiers each, for microgreens

## Fallback Behavior

If the GPT-4 API is unavailable or returns an error, the system falls back to the original rule-based design system. This ensures the AI Assistant always provides a response.

## Cost Considerations

- GPT-4 API calls are charged per token (roughly $0.01 per 1K input tokens, $0.03 per 1K output tokens)
- Average design request uses ~2-3K tokens total
- Consider implementing caching for repeated requests
- Monitor usage via OpenAI dashboard

## Troubleshooting

1. **"API key not found"**
   - Ensure OPENAI_API_KEY is set in .env.local
   - Restart the development server

2. **"Failed to parse AI response"**
   - Check API key permissions
   - Verify GPT-4 model access
   - Check console for detailed errors

3. **Designs not appearing on canvas**
   - Ensure fixture models match DLC database
   - Check browser console for object validation errors
   - Verify room dimensions are set correctly

## Future Enhancements

- Fine-tuning on cultivation-specific data
- Image generation for facility layouts
- Integration with CAD export
- Real-time collaboration features
- Voice input support