'use client';

import React, { useState } from 'react';
import { FixtureLibrary, type FixtureModel } from '@/components/FixtureLibrary';

interface FixtureLibraryCompactProps {
  isOpen: boolean;
  onSelectFixture: (fixture: FixtureModel) => void;
}

// Simple fixture library that doesn't require DesignerContext
export function FixtureLibraryCompact({ isOpen, onSelectFixture }: FixtureLibraryCompactProps) {
  return (
    <div className="p-4">
      <h3 className="text-white font-semibold mb-3">Fixture Library</h3>
      <FixtureLibrary
        onSelectFixture={onSelectFixture}
        compact={true}
      />
    </div>
  );
}