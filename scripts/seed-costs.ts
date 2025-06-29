import { seedCostCategories } from '../src/lib/seed-cost-categories';

async function main() {
  console.log('Starting cost category seeding...');
  
  try {
    await seedCostCategories();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding cost categories:', error);
    process.exit(1);
  }
}

main();