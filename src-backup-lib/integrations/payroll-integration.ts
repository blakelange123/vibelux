/**
 * Payroll System Integration Service
 * Supports major payroll providers for accurate labor cost tracking
 */

import { prisma } from '@/lib/prisma';

interface PayrollConfig {
  provider: 'ADP' | 'GUSTO' | 'PAYCHEX' | 'BAMBOOHR' | 'WORKDAY' | 'QUICKBOOKS_PAYROLL' | 'WURK';
  apiKey: string;
  companyId: string;
  environment?: 'sandbox' | 'production';
}

interface PayrollData {
  periodStart: Date;
  periodEnd: Date;
  employees: EmployeePayroll[];
  summary: {
    totalGrossPay: number;
    totalTaxes: number;
    totalBenefits: number;
    totalNetPay: number;
    totalEmployerCosts: number;
  };
}

interface EmployeePayroll {
  employeeId: string;
  name: string;
  department?: string;
  role?: string;
  regularHours: number;
  overtimeHours: number;
  grossPay: number;
  taxes: number;
  benefits: number;
  netPay: number;
  jobCodes?: Array<{
    code: string;
    description: string;
    hours: number;
    rate: number;
  }>;
}

interface LaborMetrics {
  costPerUnit: number; // $/kg or $/gram
  laborEfficiency: number; // units produced per labor hour
  overtimePercentage: number;
  departmentCosts: Array<{
    department: string;
    totalCost: number;
    percentage: number;
  }>;
  taskCosts: Array<{
    task: string;
    totalHours: number;
    totalCost: number;
    costPerHour: number;
  }>;
}

export class PayrollIntegrationService {
  private config: PayrollConfig;

  constructor(config: PayrollConfig) {
    this.config = config;
  }

  /**
   * Fetch payroll data from provider
   */
  async fetchPayrollData(startDate: Date, endDate: Date): Promise<PayrollData> {
    switch (this.config.provider) {
      case 'ADP':
        return this.fetchADPPayroll(startDate, endDate);
      case 'GUSTO':
        return this.fetchGustoPayroll(startDate, endDate);
      case 'PAYCHEX':
        return this.fetchPaychexPayroll(startDate, endDate);
      case 'WURK':
        return this.fetchWurkPayroll(startDate, endDate); // Cannabis-specific
      case 'QUICKBOOKS_PAYROLL':
        return this.fetchQuickBooksPayroll(startDate, endDate);
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  /**
   * ADP Integration
   */
  private async fetchADPPayroll(startDate: Date, endDate: Date): Promise<PayrollData> {
    const baseUrl = 'https://api.adp.com/hr/v2';
    
    try {
      // ADP uses OAuth 2.0 with certificate-based authentication
      const token = await this.getADPAccessToken();
      
      const response = await fetch(
        `${baseUrl}/payroll/paydata?$filter=payDate ge '${startDate.toISOString()}' and payDate le '${endDate.toISOString()}'`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      // Transform ADP data to our format
      return this.transformADPData(data);
    } catch (error) {
      console.error('ADP API error:', error);
      throw new Error(`Failed to fetch ADP data: ${error.message}`);
    }
  }

  /**
   * Gusto Integration (popular with smaller cannabis businesses)
   */
  private async fetchGustoPayroll(startDate: Date, endDate: Date): Promise<PayrollData> {
    const baseUrl = 'https://api.gusto.com/v1';
    
    try {
      // Get payrolls for date range
      const payrollsResponse = await fetch(
        `${baseUrl}/companies/${this.config.companyId}/payrolls?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      const payrolls = await payrollsResponse.json();
      
      // Aggregate all payroll periods
      const employees: EmployeePayroll[] = [];
      let totalGrossPay = 0;
      let totalTaxes = 0;
      let totalBenefits = 0;
      let totalNetPay = 0;
      let totalEmployerCosts = 0;

      for (const payroll of payrolls) {
        // Get detailed payroll data
        const detailResponse = await fetch(
          `${baseUrl}/companies/${this.config.companyId}/payrolls/${payroll.id}`,
          {
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`,
              'Accept': 'application/json'
            }
          }
        );

        const detail = await detailResponse.json();

        // Process employee payments
        for (const payment of detail.employee_compensations) {
          const employeePayroll: EmployeePayroll = {
            employeeId: payment.employee_id,
            name: payment.employee.full_name,
            department: payment.job_title,
            regularHours: payment.regular_hours || 0,
            overtimeHours: payment.overtime_hours || 0,
            grossPay: parseFloat(payment.gross_pay),
            taxes: parseFloat(payment.taxes),
            benefits: parseFloat(payment.benefits),
            netPay: parseFloat(payment.net_pay),
            jobCodes: payment.job_codes?.map((jc: any) => ({
              code: jc.code,
              description: jc.description,
              hours: jc.hours,
              rate: jc.rate
            }))
          };

          employees.push(employeePayroll);
          totalGrossPay += employeePayroll.grossPay;
          totalTaxes += employeePayroll.taxes;
          totalBenefits += employeePayroll.benefits;
          totalNetPay += employeePayroll.netPay;
        }

        totalEmployerCosts = detail.totals.company_debit;
      }

      return {
        periodStart: startDate,
        periodEnd: endDate,
        employees,
        summary: {
          totalGrossPay,
          totalTaxes,
          totalBenefits,
          totalNetPay,
          totalEmployerCosts
        }
      };
    } catch (error) {
      console.error('Gusto API error:', error);
      throw new Error(`Failed to fetch Gusto data: ${error.message}`);
    }
  }

  /**
   * Wurk Integration (Cannabis-specific HR/Payroll)
   */
  private async fetchWurkPayroll(startDate: Date, endDate: Date): Promise<PayrollData> {
    const baseUrl = 'https://api.wurkhcm.com/v1';
    
    try {
      const response = await fetch(
        `${baseUrl}/payroll/runs?company_id=${this.config.companyId}&start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      // Wurk provides cannabis-specific job codes
      const employees: EmployeePayroll[] = data.payroll_runs.flatMap((run: any) => 
        run.employee_payments.map((payment: any) => ({
          employeeId: payment.employee_id,
          name: payment.employee_name,
          department: payment.department,
          role: payment.role,
          regularHours: payment.regular_hours,
          overtimeHours: payment.overtime_hours,
          grossPay: payment.gross_pay,
          taxes: payment.total_taxes,
          benefits: payment.total_benefits,
          netPay: payment.net_pay,
          jobCodes: payment.time_entries?.map((entry: any) => ({
            code: entry.job_code,
            description: entry.task_description, // e.g., "Trimming", "Harvesting", "Packaging"
            hours: entry.hours,
            rate: entry.hourly_rate
          }))
        }))
      );

      const summary = data.summary;

      return {
        periodStart: startDate,
        periodEnd: endDate,
        employees,
        summary: {
          totalGrossPay: summary.gross_pay,
          totalTaxes: summary.taxes,
          totalBenefits: summary.benefits,
          totalNetPay: summary.net_pay,
          totalEmployerCosts: summary.total_cost
        }
      };
    } catch (error) {
      console.error('Wurk API error:', error);
      throw new Error(`Failed to fetch Wurk data: ${error.message}`);
    }
  }

  /**
   * Paychex Integration
   */
  private async fetchPaychexPayroll(startDate: Date, endDate: Date): Promise<PayrollData> {
    // Paychex implementation
    throw new Error('Paychex integration not yet implemented');
  }

  /**
   * QuickBooks Payroll Integration
   */
  private async fetchQuickBooksPayroll(startDate: Date, endDate: Date): Promise<PayrollData> {
    // QuickBooks Payroll implementation
    throw new Error('QuickBooks Payroll integration not yet implemented');
  }

  /**
   * Calculate labor metrics for analytics
   */
  async calculateLaborMetrics(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<LaborMetrics> {
    // Get payroll data
    const payrollData = await this.fetchPayrollData(startDate, endDate);
    
    // Get production data
    const harvests = await prisma.harvestBatch.findMany({
      where: {
        facilityId,
        harvestDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const totalYield = harvests.reduce((sum, h) => sum + (h.actualYield || 0), 0);
    const totalLaborCost = payrollData.summary.totalEmployerCosts;
    const totalHours = payrollData.employees.reduce(
      (sum, e) => sum + e.regularHours + e.overtimeHours, 
      0
    );
    const totalOvertimeHours = payrollData.employees.reduce(
      (sum, e) => sum + e.overtimeHours, 
      0
    );

    // Calculate department costs
    const departmentMap = new Map<string, number>();
    payrollData.employees.forEach(employee => {
      const dept = employee.department || 'Unassigned';
      const cost = employee.grossPay + (employee.benefits || 0);
      departmentMap.set(dept, (departmentMap.get(dept) || 0) + cost);
    });

    const departmentCosts = Array.from(departmentMap.entries()).map(([dept, cost]) => ({
      department: dept,
      totalCost: cost,
      percentage: (cost / totalLaborCost) * 100
    }));

    // Calculate task costs from job codes
    const taskMap = new Map<string, { hours: number; cost: number }>();
    payrollData.employees.forEach(employee => {
      employee.jobCodes?.forEach(jobCode => {
        const existing = taskMap.get(jobCode.description) || { hours: 0, cost: 0 };
        existing.hours += jobCode.hours;
        existing.cost += jobCode.hours * jobCode.rate;
        taskMap.set(jobCode.description, existing);
      });
    });

    const taskCosts = Array.from(taskMap.entries()).map(([task, data]) => ({
      task,
      totalHours: data.hours,
      totalCost: data.cost,
      costPerHour: data.hours > 0 ? data.cost / data.hours : 0
    }));

    return {
      costPerUnit: totalYield > 0 ? totalLaborCost / totalYield : 0,
      laborEfficiency: totalHours > 0 ? totalYield / totalHours : 0,
      overtimePercentage: totalHours > 0 ? (totalOvertimeHours / totalHours) * 100 : 0,
      departmentCosts,
      taskCosts
    };
  }

  /**
   * Transform payroll data for database storage
   */
  transformToLaborRecord(payrollData: PayrollData, facilityId: string) {
    return {
      facilityId,
      periodStart: payrollData.periodStart,
      periodEnd: payrollData.periodEnd,
      totalHours: payrollData.employees.reduce(
        (sum, e) => sum + e.regularHours + e.overtimeHours, 
        0
      ),
      totalCost: payrollData.summary.totalEmployerCosts,
      employeeCount: payrollData.employees.length,
      metadata: {
        provider: this.config.provider,
        summary: payrollData.summary,
        byDepartment: this.aggregateByDepartment(payrollData.employees),
        byTask: this.aggregateByTask(payrollData.employees)
      }
    };
  }

  /**
   * Helper methods
   */
  private async getADPAccessToken(): Promise<string> {
    // ADP OAuth implementation
    throw new Error('ADP OAuth not implemented');
  }

  private transformADPData(data: any): PayrollData {
    // Transform ADP response to our format
    throw new Error('ADP transformation not implemented');
  }

  private aggregateByDepartment(employees: EmployeePayroll[]) {
    const deptMap = new Map<string, any>();
    
    employees.forEach(emp => {
      const dept = emp.department || 'Unassigned';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, {
          employeeCount: 0,
          totalHours: 0,
          totalCost: 0
        });
      }
      
      const deptData = deptMap.get(dept)!;
      deptData.employeeCount++;
      deptData.totalHours += emp.regularHours + emp.overtimeHours;
      deptData.totalCost += emp.grossPay + (emp.benefits || 0);
    });

    return Object.fromEntries(deptMap);
  }

  private aggregateByTask(employees: EmployeePayroll[]) {
    const taskMap = new Map<string, any>();
    
    employees.forEach(emp => {
      emp.jobCodes?.forEach(job => {
        if (!taskMap.has(job.description)) {
          taskMap.set(job.description, {
            totalHours: 0,
            totalCost: 0,
            employeeCount: new Set()
          });
        }
        
        const taskData = taskMap.get(job.description)!;
        taskData.totalHours += job.hours;
        taskData.totalCost += job.hours * job.rate;
        taskData.employeeCount.add(emp.employeeId);
      });
    });

    // Convert Set to count
    taskMap.forEach((value, key) => {
      value.employeeCount = value.employeeCount.size;
    });

    return Object.fromEntries(taskMap);
  }
}

/**
 * Payroll provider configurations
 */
export const PAYROLL_PROVIDERS = {
  ADP: {
    name: 'ADP Workforce Now',
    requiredFields: ['clientId', 'clientSecret', 'organizationId'],
    supportsCannabis: true,
    features: ['time-tracking', 'benefits', 'compliance', 'reporting']
  },
  GUSTO: {
    name: 'Gusto',
    requiredFields: ['apiToken'],
    supportsCannabis: true,
    features: ['payroll', 'benefits', 'time-tracking', 'compliance']
  },
  PAYCHEX: {
    name: 'Paychex Flex',
    requiredFields: ['clientId', 'username', 'password'],
    supportsCannabis: true,
    features: ['payroll', 'hr', 'time-attendance', 'benefits']
  },
  WURK: {
    name: 'Wurk HCM',
    requiredFields: ['apiKey', 'companyId'],
    supportsCannabis: true,
    cannabisSpecific: true,
    features: ['payroll', 'hr', 'compliance', 'time-tracking', '280E-allocation']
  },
  BAMBOOHR: {
    name: 'BambooHR',
    requiredFields: ['apiKey', 'subdomain'],
    supportsCannabis: false,
    features: ['hr', 'time-tracking', 'pto']
  },
  WORKDAY: {
    name: 'Workday HCM',
    requiredFields: ['tenant', 'username', 'password'],
    supportsCannabis: false,
    features: ['hr', 'payroll', 'finance', 'planning']
  }
};