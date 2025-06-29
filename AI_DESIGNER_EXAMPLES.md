# AI Designer Integration Examples

The AI Designer can understand and execute natural language commands to control the Advanced Designer canvas. Here are example commands you can use:

## Room Creation
- "Create a 40x60 flowering room with 12 foot ceilings"
- "Make a 20x30 veg room with 10 foot ceiling height"
- "Design a 50x100 greenhouse with 16 foot peaks"
- "Build a 10x10 clone room"

## Fixture Placement
- "Add fixtures for 800 PPFD"
- "Fill the room with DLC certified fixtures"
- "Place a 4x8 grid of 600W LED fixtures"
- "Add 20 fixtures evenly distributed"
- "Create optimal fixture layout for cannabis flowering"

## Benching and Racking
- "Add 4x8 rolling benches in 3 rows"
- "Install 5 tier vertical racks"
- "Place fixed benches with 3 foot aisles"
- "Create multi-tier growing system with 4 levels"

## Environmental Equipment
- "Add a 2 ton AC unit"
- "Install circulation fans"
- "Add dehumidifier for 60 pints/day"
- "Place CO2 enrichment system"
- "Add complete HVAC system"

## Optimization Commands
- "Optimize layout for uniformity"
- "Maximize coverage while minimizing power"
- "Adjust fixtures for better light distribution"
- "Reduce power consumption to under 30W/sq ft"
- "Improve uniformity to above 80%"

## Analysis and Reporting
- "Analyze my current design"
- "Calculate total cost of ownership"
- "Generate bill of materials"
- "Show me the PPFD heatmap"
- "What's my current DLI?"

## Complex Workflows
- "Design a complete 2000 sq ft flowering room with benches, fixtures for 900 PPFD, and environmental controls"
- "Create a vertical farm with 4 tiers, 300 PPFD per tier, and optimize for leafy greens"
- "Build a propagation room with T5 fixtures and misting system"

## Adjustments
- "Increase all fixture heights by 1 foot"
- "Dim all lights to 80%"
- "Move fixtures closer together"
- "Rotate all fixtures 90 degrees"
- "Turn off every other fixture"

## Equipment Specific
- "Add Fluence SPYDR fixtures"
- "Use Gavita 1700e lights"
- "Install California Lightworks fixtures"
- "Place photobio MX fixtures"

## The AI Assistant Features:

### 1. Natural Language Understanding
- Parses complex commands into specific actions
- Understands context from current design state
- Handles multiple actions in sequence

### 2. Proactive Recommendations
- Monitors design changes in real-time
- Suggests improvements for:
  - Low PPFD areas
  - Poor uniformity
  - Missing equipment
  - Energy optimization
  - Cost savings

### 3. Smart Execution
- Validates commands before execution
- Provides feedback on what was done
- Shows undo options for changes
- Calculates results automatically

### 4. Context Awareness
- Knows current room dimensions
- Tracks fixture count and placement
- Monitors PPFD and uniformity metrics
- Understands equipment relationships

## API Integration

The AI Designer exposes these capabilities through the `/api/ai-designer` endpoint:

```typescript
// Parse natural language
POST /api/ai-designer
{
  "mode": "parse",
  "message": "Create a 40x60 room with fixtures for 800 PPFD",
  "currentState": { /* current designer state */ }
}

// Get suggestions
POST /api/ai-designer
{
  "mode": "suggest",
  "currentState": { /* current designer state */ }
}

// Analyze design
POST /api/ai-designer
{
  "mode": "analyze",
  "currentState": { /* current designer state */ }
}
```

## Event System

The designer emits events that the AI listens to:
- `object.added` - When fixtures or equipment are added
- `object.removed` - When items are deleted
- `object.updated` - When properties change
- `room.created` - When a room is created
- `room.updated` - When room properties change
- `calculation.completed` - When PPFD calculations finish
- `optimization.completed` - When optimization runs finish

## Future Enhancements

1. **Voice Control** - "Hey Vibelux, add more fixtures"
2. **Image Understanding** - Upload room photos for analysis
3. **Predictive Design** - AI predicts what you'll need next
4. **Collaborative AI** - Multiple users with AI mediating changes
5. **Learning System** - AI learns from your design patterns