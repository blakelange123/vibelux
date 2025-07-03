import { useState, useEffect } from 'react';
import { dlcFixturesParser } from '@/lib/dlc-fixtures-parser';
import type { FixtureModel } from '@/components/FixtureLibrary';

export function useDLCFixtures() {
  const [fixtures, setFixtures] = useState<FixtureModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDLCFixtures();
  }, []);

  const loadDLCFixtures = async () => {
    try {
      setLoading(true);
      const parser = dlcFixturesParser;
      
      // Try to load DLC fixtures from CSV file
      try {
        await parser.loadFromFile('/data/dlc-fixtures.csv');
      } catch (e) {
        // If file not found, use sample data
        // The parser will use default/sample data
      }
      
      const dlcFixtures = parser.getFixtureModels();
      setFixtures(dlcFixtures);
      setError(null);
    } catch (err) {
      console.error('Error loading DLC fixtures:', err);
      setError('Failed to load DLC fixtures');
      setFixtures([]);
    } finally {
      setLoading(false);
    }
  };

  return { fixtures, loading, error, reload: loadDLCFixtures };
}