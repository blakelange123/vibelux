'use client';

import React from 'react';
import { useDesigner } from '../context/DesignerContext';

const SIMPLE_FIXTURES = [
  { id: 1, brand: 'Gavita', model: 'LED 1700e', wattage: 635, ppf: 1700, efficacy: 2.68 },
  { id: 2, brand: 'Fluence', model: 'SPYDR 2i', wattage: 630, ppf: 1650, efficacy: 2.62 },
  { id: 3, brand: 'Lumileds', model: 'HL550', wattage: 550, ppf: 1450, efficacy: 2.64 },
  { id: 4, brand: 'Test', model: 'LED-600W', wattage: 600, ppf: 1620, efficacy: 2.7 },
];

export function SimpleFixtureList() {
  const { dispatch } = useDesigner();
  
  const selectFixture = (fixture: any) => {
    
    // First set the fixture model
    dispatch({ type: 'SET_SELECTED_FIXTURE', payload: fixture });
    
    // Then set the tool to place mode
    dispatch({ type: 'SET_TOOL', payload: 'place' });
    
    // Close panel and show placement message
    window.dispatchEvent(new CustomEvent('closePanels'));
    window.dispatchEvent(new CustomEvent('showPlacementMode', { 
      detail: { message: `Click to place ${fixture.brand} ${fixture.model}` }
    }));
  };
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Select a Fixture</h3>
      <div className="space-y-2">
        {SIMPLE_FIXTURES.map((fixture) => (
          <button
            key={fixture.id}
            onClick={() => selectFixture(fixture)}
            className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
          >
            <div className="font-medium">{fixture.brand} {fixture.model}</div>
            <div className="text-sm text-gray-400">
              {fixture.wattage}W • {fixture.ppf} PPF • {fixture.efficacy} PPE
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}