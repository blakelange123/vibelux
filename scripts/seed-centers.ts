import { seedConsolidationCenters } from '../src/lib/seed-consolidation-centers';

async function main() {
  console.log('Starting consolidation center seeding...');
  
  try {
    await seedConsolidationCenters();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding consolidation centers:', error);
    process.exit(1);
  }
}

main();