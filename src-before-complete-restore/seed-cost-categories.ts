import { prisma } from '@/lib/prisma';

export async function seedCostCategories() {
  const defaultCategories = [
    { name: 'Labor', description: 'Employee wages, benefits, and payroll taxes' },
    { name: 'Utilities', description: 'Electricity, water, gas, and other utilities' },
    { name: 'Nutrients', description: 'Fertilizers, growing media, and amendments' },
    { name: 'Supplies', description: 'General cultivation supplies and consumables' },
    { name: 'Equipment', description: 'Small tools and equipment purchases' },
    { name: 'Facility', description: 'Rent, lease, maintenance, and repairs' },
    { name: 'Packaging', description: 'Product packaging and labeling materials' },
    { name: 'Testing', description: 'Lab testing, compliance, and quality control' },
    { name: 'Transportation', description: 'Delivery, shipping, and logistics' },
    { name: 'Marketing', description: 'Advertising, promotion, and branding' },
    { name: 'Professional', description: 'Legal, accounting, and consulting services' },
    { name: 'Insurance', description: 'Business insurance premiums and coverage' },
    { name: 'Licenses', description: 'Licensing fees and regulatory compliance' },
    { name: 'Technology', description: 'Software, hardware, and IT services' },
    { name: 'Other', description: 'Miscellaneous and uncategorized expenses' }
  ];

  
  for (const category of defaultCategories) {
    try {
      await prisma.costCategory.upsert({
        where: { name: category.name },
        update: { description: category.description },
        create: category
      });
    } catch (error) {
      console.error(`Error creating category ${category.name}:`, error);
    }
  }
  
}