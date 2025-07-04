import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

interface WorkforceAnalytics {
  overview: {
    totalEmployees: number;
    activeToday: number;
    totalLaborCost: number;
    avgProductivity: number;
    attendanceRate: number;
    overtimeHours: number;
  };
  laborCosts: Array<{
    month: string;
    regular: number;
    overtime: number;
    benefits: number;
    total: number;
  }>;
  productivity: Array<{
    week: string;
    target: number;
    actual: number;
    efficiency: number;
    department: string;
  }>;
  attendance: Array<{
    date: string;
    present: number;
    absent: number;
    late: number;
    total: number;
  }>;
  skillsAssessment: Array<{
    employee: string;
    department: string;
    skillLevel: number;
    tasksCompleted: number;
    accuracy: number;
    speed: number;
  }>;
  departmentMetrics: Array<{
    department: string;
    headcount: number;
    productivity: number;
    cost: number;
    turnover: number;
  }>;
  payrollBreakdown: {
    totalPayroll: number;
    byDepartment: Array<{
      department: string;
      amount: number;
      percentage: number;
    }>;
    overtime: {
      total: number;
      byDepartment: Array<{
        department: string;
        hours: number;
        cost: number;
      }>;
    };
  };
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const department = searchParams.get('department') || 'all';

    // Return comprehensive workforce analytics data
    const analyticsData: WorkforceAnalytics = {
      overview: {
        totalEmployees: 24,
        activeToday: 22,
        totalLaborCost: 68400,
        avgProductivity: 98.5,
        attendanceRate: 91.7,
        overtimeHours: 38.5
      },
      laborCosts: [
        { month: 'Jan', regular: 45000, overtime: 5000, benefits: 8500, total: 58500 },
        { month: 'Feb', regular: 48000, overtime: 4200, benefits: 8800, total: 61000 },
        { month: 'Mar', regular: 52000, overtime: 6800, benefits: 9200, total: 68000 },
        { month: 'Apr', regular: 49000, overtime: 3500, benefits: 8700, total: 61200 },
        { month: 'May', regular: 51000, overtime: 5200, benefits: 8900, total: 65100 },
        { month: 'Jun', regular: 54000, overtime: 4800, benefits: 9300, total: 68100 }
      ],
      productivity: [
        { week: 'Week 1', target: 100, actual: 95, efficiency: 95, department: 'Cultivation' },
        { week: 'Week 2', target: 100, actual: 102, efficiency: 102, department: 'Cultivation' },
        { week: 'Week 3', target: 100, actual: 98, efficiency: 98, department: 'Processing' },
        { week: 'Week 4', target: 100, actual: 105, efficiency: 105, department: 'Packaging' },
        { week: 'Week 5', target: 100, actual: 92, efficiency: 92, department: 'Quality Control' },
        { week: 'Week 6', target: 100, actual: 108, efficiency: 108, department: 'Cultivation' }
      ],
      attendance: [
        { date: '2024-06-17', present: 22, absent: 2, late: 1, total: 24 },
        { date: '2024-06-18', present: 23, absent: 1, late: 0, total: 24 },
        { date: '2024-06-19', present: 21, absent: 2, late: 1, total: 24 },
        { date: '2024-06-20', present: 24, absent: 0, late: 0, total: 24 },
        { date: '2024-06-21', present: 22, absent: 1, late: 1, total: 24 }
      ],
      skillsAssessment: [
        {
          employee: 'Sarah M.',
          department: 'Cultivation',
          skillLevel: 4.8,
          tasksCompleted: 147,
          accuracy: 97.2,
          speed: 108
        },
        {
          employee: 'Mike R.',
          department: 'Processing',
          skillLevel: 4.5,
          tasksCompleted: 132,
          accuracy: 94.8,
          speed: 95
        },
        {
          employee: 'Lisa K.',
          department: 'Quality Control',
          skillLevel: 4.9,
          tasksCompleted: 89,
          accuracy: 99.1,
          speed: 87
        },
        {
          employee: 'David L.',
          department: 'Packaging',
          skillLevel: 4.2,
          tasksCompleted: 156,
          accuracy: 92.5,
          speed: 112
        }
      ],
      departmentMetrics: [
        {
          department: 'Cultivation',
          headcount: 8,
          productivity: 102.4,
          cost: 28400,
          turnover: 8.3
        },
        {
          department: 'Processing',
          headcount: 6,
          productivity: 96.8,
          cost: 21600,
          turnover: 12.5
        },
        {
          department: 'Quality Control',
          headcount: 4,
          productivity: 98.9,
          cost: 18000,
          turnover: 5.2
        },
        {
          department: 'Packaging',
          headcount: 3,
          productivity: 104.2,
          cost: 12800,
          turnover: 15.8
        },
        {
          department: 'Maintenance',
          headcount: 2,
          productivity: 89.5,
          cost: 9200,
          turnover: 0
        },
        {
          department: 'Management',
          headcount: 1,
          productivity: 95.0,
          cost: 8400,
          turnover: 0
        }
      ],
      payrollBreakdown: {
        totalPayroll: 68400,
        byDepartment: [
          { department: 'Cultivation', amount: 28400, percentage: 41.5 },
          { department: 'Processing', amount: 21600, percentage: 31.6 },
          { department: 'Quality Control', amount: 18000, percentage: 26.3 },
          { department: 'Packaging', amount: 12800, percentage: 18.7 },
          { department: 'Maintenance', amount: 9200, percentage: 13.4 },
          { department: 'Management', amount: 8400, percentage: 12.3 }
        ],
        overtime: {
          total: 4800,
          byDepartment: [
            { department: 'Cultivation', hours: 18.5, cost: 2100 },
            { department: 'Processing', hours: 12.0, cost: 1440 },
            { department: 'Packaging', hours: 8.0, cost: 960 },
            { department: 'Quality Control', hours: 0, cost: 0 },
            { department: 'Maintenance', hours: 4.0, cost: 300 },
            { department: 'Management', hours: 0, cost: 0 }
          ]
        }
      }
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching workforce analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workforce analytics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Handle workforce analytics actions
    if (data.action === 'update_productivity_target') {
      return NextResponse.json({ 
        success: true, 
        message: `Productivity target updated to ${data.target}% for ${data.department}` 
      });
    }
    
    if (data.action === 'schedule_training') {
      return NextResponse.json({ 
        success: true, 
        trainingId: `training_${Date.now()}`,
        message: `Training session scheduled for ${data.employee} in ${data.skill}` 
      });
    }

    if (data.action === 'flag_attendance_issue') {
      return NextResponse.json({ 
        success: true, 
        alertId: `alert_${Date.now()}`,
        message: `Attendance issue flagged for review` 
      });
    }

    return NextResponse.json({ 
      error: 'Invalid action' 
    }, { status: 400 });
  } catch (error) {
    console.error('Error processing workforce analytics request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}