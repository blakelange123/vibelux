import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { AccountingIntegrationService } from '@/lib/integrations/accounting-integration';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { facilityId } = body;

    if (!facilityId) {
      return NextResponse.json({ error: 'Missing facility ID' }, { status: 400 });
    }

    // Verify user has access to this facility
    const facilityUser = await prisma.facilityUser.findFirst({
      where: {
        facilityId,
        userId,
        role: { in: ['OWNER', 'ADMIN', 'MANAGER'] }
      },
    });

    if (!facilityUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get accounting integration config
    const integrationConfig = await prisma.integrationConfig.findFirst({
      where: {
        facilityId,
        type: 'ACCOUNTING',
        enabled: true
      }
    });

    if (!integrationConfig || !integrationConfig.metadata) {
      return NextResponse.json({ error: 'No accounting integration configured' }, { status: 404 });
    }

    try {
      // Create accounting service instance
      const accountingService = new AccountingIntegrationService({
        provider: integrationConfig.config.provider,
        accessToken: integrationConfig.metadata.accessToken,
        refreshToken: integrationConfig.metadata.refreshToken,
        companyId: integrationConfig.metadata.companyId,
        environment: integrationConfig.config.environment || 'production'
      });

      // Fetch data from the last 30 days by default
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      // Fetch revenue data
      const revenues = await accountingService.fetchRevenueData(startDate, endDate);
      
      // Import revenue data
      let importedRevenue = 0;
      let revenueCount = 0;
      const errors: string[] = [];

      for (const revenue of revenues) {
        try {
          // Check if this transaction already exists
          const existing = await prisma.sale.findFirst({
            where: {
              facilityId,
              metadata: {
                path: '$.originalId',
                equals: revenue.id
              }
            }
          });

          if (!existing) {
            // Create sale record
            const saleData = accountingService.transformToSalesRecord(revenue, facilityId);
            
            await prisma.sale.create({
              data: {
                facilityId,
                customer: saleData.customer,
                saleDate: saleData.saleDate,
                totalPrice: saleData.totalPrice,
                metadata: saleData.metadata,
                lineItems: saleData.lineItems ? {
                  create: saleData.lineItems
                } : undefined
              }
            });

            importedRevenue += revenue.amount;
            revenueCount++;
          }
        } catch (error) {
          errors.push(`Failed to import transaction ${revenue.id}: ${error.message}`);
        }
      }

      // Fetch and import expense data
      const expenses = await accountingService.fetchExpenseData(startDate, endDate);
      let expenseCount = 0;

      for (const expense of expenses) {
        try {
          const existing = await prisma.expense.findFirst({
            where: {
              facilityId,
              metadata: {
                path: '$.originalId',
                equals: expense.id
              }
            }
          });

          if (!existing) {
            await prisma.expense.create({
              data: {
                facilityId,
                category: expense.category,
                amount: expense.amount,
                description: expense.description || expense.category,
                date: expense.date,
                vendor: expense.vendor,
                metadata: {
                  source: integrationConfig.config.provider,
                  originalId: expense.id,
                  accountCode: expense.accountCode
                }
              }
            });

            expenseCount++;
          }
        } catch (error) {
          errors.push(`Failed to import expense ${expense.id}: ${error.message}`);
        }
      }

      // Update last sync time
      await prisma.integrationConfig.update({
        where: { id: integrationConfig.id },
        data: {
          config: {
            ...integrationConfig.config,
            lastSync: new Date()
          }
        }
      });

      return NextResponse.json({
        success: true,
        revenueImported: importedRevenue,
        revenueCount,
        expenseCount,
        totalRevenue: revenues.reduce((sum, r) => sum + r.amount, 0),
        totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error('Accounting sync error:', error);
      return NextResponse.json(
        { error: `Failed to sync with ${integrationConfig.config.provider}: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in accounting sync:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Get accounting sync status
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json({ error: 'Missing facility ID' }, { status: 400 });
    }

    // Verify user has access
    const facilityUser = await prisma.facilityUser.findFirst({
      where: {
        facilityId,
        userId,
      },
    });

    if (!facilityUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get integration status
    const integrationConfig = await prisma.integrationConfig.findFirst({
      where: {
        facilityId,
        type: 'ACCOUNTING'
      }
    });

    if (!integrationConfig) {
      return NextResponse.json({
        connected: false,
        provider: null,
        lastSync: null
      });
    }

    // Get recent sync stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueStats = await prisma.sale.aggregate({
      where: {
        facilityId,
        saleDate: { gte: thirtyDaysAgo },
        metadata: {
          path: '$.source',
          equals: integrationConfig.config.provider
        }
      },
      _sum: { totalPrice: true },
      _count: true
    });

    const expenseStats = await prisma.expense.aggregate({
      where: {
        facilityId,
        date: { gte: thirtyDaysAgo },
        metadata: {
          path: '$.source',
          equals: integrationConfig.config.provider
        }
      },
      _sum: { amount: true },
      _count: true
    });

    return NextResponse.json({
      connected: integrationConfig.enabled,
      provider: integrationConfig.config.provider,
      lastSync: integrationConfig.config.lastSync,
      stats: {
        revenueTotal: revenueStats._sum.totalPrice || 0,
        revenueCount: revenueStats._count,
        expenseTotal: expenseStats._sum.amount || 0,
        expenseCount: expenseStats._count
      }
    });
  } catch (error) {
    console.error('Error fetching accounting status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}