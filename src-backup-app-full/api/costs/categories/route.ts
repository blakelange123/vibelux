import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET cost categories
export async function GET(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.costCategory.findMany({
      where: { isActive: true },
      include: {
        children: true,
        _count: {
          select: { expenses: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST create category
export async function POST(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, parentId } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = await prisma.costCategory.create({
      data: {
        name,
        description,
        parentId
      }
    });

    return NextResponse.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// Seed default categories
export async function seedDefaultCategories() {
  const defaultCategories = [
    { name: 'Labor', description: 'Employee wages and benefits' },
    { name: 'Utilities', description: 'Electricity, water, gas' },
    { name: 'Nutrients', description: 'Fertilizers and growing media' },
    { name: 'Supplies', description: 'General cultivation supplies' },
    { name: 'Equipment', description: 'Tools and small equipment' },
    { name: 'Facility', description: 'Rent, maintenance, repairs' },
    { name: 'Packaging', description: 'Product packaging materials' },
    { name: 'Testing', description: 'Lab testing and compliance' },
    { name: 'Transportation', description: 'Delivery and logistics' },
    { name: 'Marketing', description: 'Advertising and promotion' },
    { name: 'Professional', description: 'Legal, accounting, consulting' },
    { name: 'Insurance', description: 'Business insurance premiums' },
    { name: 'Other', description: 'Miscellaneous expenses' }
  ];

  for (const cat of defaultCategories) {
    await prisma.costCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    });
  }
}