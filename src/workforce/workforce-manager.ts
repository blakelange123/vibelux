import { 
  Employee, 
  Shift, 
  Schedule, 
  Task, 
  TimeEntry, 
  Training, 
  TrainingRecord,
  LaborMetrics,
  EmployeeRole,
  Department,
  TaskCategory,
  ClockMethod,
  EmployeeStatus,
  ProductivityMetrics
} from './workforce-types';

export class WorkforceManager {
  private employees: Map<string, Employee> = new Map();
  private schedules: Map<string, Schedule> = new Map();
  private timeEntries: Map<string, TimeEntry[]> = new Map();
  private tasks: Map<string, Task> = new Map();
  private trainings: Map<string, Training> = new Map();

  // Employee Management
  addEmployee(employee: Employee): void {
    this.employees.set(employee.id, employee);
  }

  getEmployee(id: string): Employee | undefined {
    return this.employees.get(id);
  }

  getEmployeesByDepartment(department: Department): Employee[] {
    return Array.from(this.employees.values()).filter(
      emp => emp.department === department && emp.status === EmployeeStatus.ACTIVE
    );
  }

  getEmployeesByRole(role: EmployeeRole): Employee[] {
    return Array.from(this.employees.values()).filter(
      emp => emp.role === role && emp.status === EmployeeStatus.ACTIVE
    );
  }

  // Scheduling
  createSchedule(weekStartDate: Date): Schedule {
    const schedule: Schedule = {
      id: this.generateId(),
      weekStartDate,
      shifts: [],
      published: false
    };
    this.schedules.set(schedule.id, schedule);
    return schedule;
  }

  addShift(scheduleId: string, shift: Shift): void {
    const schedule = this.schedules.get(scheduleId);
    if (schedule) {
      schedule.shifts.push(shift);
    }
  }

  publishSchedule(scheduleId: string, publishedBy: string): void {
    const schedule = this.schedules.get(scheduleId);
    if (schedule) {
      schedule.published = true;
      schedule.publishedDate = new Date();
      schedule.publishedBy = publishedBy;
      
      // Notify employees
      this.notifySchedulePublished(schedule);
    }
  }

  getEmployeeSchedule(employeeId: string, startDate: Date, endDate: Date): Shift[] {
    const shifts: Shift[] = [];
    
    this.schedules.forEach(schedule => {
      if (schedule.published && 
          schedule.weekStartDate >= startDate && 
          schedule.weekStartDate <= endDate) {
        const employeeShifts = schedule.shifts.filter(
          shift => shift.employeeId === employeeId
        );
        shifts.push(...employeeShifts);
      }
    });
    
    return shifts.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // Time Tracking
  clockIn(employeeId: string, method: ClockMethod, location: string): TimeEntry {
    const entry: TimeEntry = {
      id: this.generateId(),
      employeeId,
      clockIn: new Date(),
      location,
      method
    };
    
    const employeeEntries = this.timeEntries.get(employeeId) || [];
    employeeEntries.push(entry);
    this.timeEntries.set(employeeId, employeeEntries);
    
    return entry;
  }

  clockOut(employeeId: string): TimeEntry | null {
    const entries = this.timeEntries.get(employeeId);
    if (!entries) return null;
    
    const currentEntry = entries.find(e => !e.clockOut);
    if (currentEntry) {
      currentEntry.clockOut = new Date();
      currentEntry.totalHours = this.calculateHours(
        currentEntry.clockIn,
        currentEntry.clockOut,
        currentEntry.breakStart,
        currentEntry.breakEnd
      );
      
      // Calculate overtime if applicable
      if (currentEntry.totalHours > 8) {
        currentEntry.overtimeHours = currentEntry.totalHours - 8;
      }
    }
    
    return currentEntry;
  }

  startBreak(employeeId: string): void {
    const entries = this.timeEntries.get(employeeId);
    if (!entries) return;
    
    const currentEntry = entries.find(e => !e.clockOut);
    if (currentEntry) {
      currentEntry.breakStart = new Date();
    }
  }

  endBreak(employeeId: string): void {
    const entries = this.timeEntries.get(employeeId);
    if (!entries) return;
    
    const currentEntry = entries.find(e => !e.clockOut && e.breakStart);
    if (currentEntry) {
      currentEntry.breakEnd = new Date();
    }
  }

  // Task Management
  createTask(task: Task): void {
    this.tasks.set(task.id, task);
  }

  assignTask(taskId: string, employeeId: string, shiftId?: string): void {
    const task = this.tasks.get(taskId);
    if (task && shiftId) {
      // Find shift and add task
      this.schedules.forEach(schedule => {
        const shift = schedule.shifts.find(s => s.id === shiftId);
        if (shift && shift.employeeId === employeeId) {
          shift.tasks.push(task);
        }
      });
    }
  }

  completeTask(taskId: string, employeeId: string, actualMinutes: number): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.completedAt = new Date();
      task.completedBy = employeeId;
      task.actualMinutes = actualMinutes;
      
      // Update productivity metrics
      this.updateProductivityMetrics(employeeId, task);
    }
  }

  // Training Management
  assignTraining(employeeId: string, trainingId: string): TrainingRecord {
    const record: TrainingRecord = {
      id: this.generateId(),
      employeeId,
      trainingId,
      startDate: new Date(),
      passed: false
    };
    
    return record;
  }

  completeTraining(recordId: string, score: number): void {
    // Implementation for completing training
  }

  getRequiredTrainings(role: EmployeeRole): Training[] {
    return Array.from(this.trainings.values()).filter(
      training => training.requiredFor.includes(role)
    );
  }

  // Labor Analytics
  calculateLaborMetrics(department: Department, date: Date): LaborMetrics {
    const employees = this.getEmployeesByDepartment(department);
    let totalHours = 0;
    let regularHours = 0;
    let overtimeHours = 0;
    let laborCost = 0;
    
    employees.forEach(employee => {
      const entries = this.getEmployeeTimeEntries(employee.id, date);
      entries.forEach(entry => {
        if (entry.totalHours) {
          totalHours += entry.totalHours;
          regularHours += Math.min(entry.totalHours, 8);
          overtimeHours += entry.overtimeHours || 0;
          
          // Calculate cost
          const regularCost = Math.min(entry.totalHours, 8) * employee.wage;
          const overtimeCost = (entry.overtimeHours || 0) * employee.wage * 1.5;
          laborCost += regularCost + overtimeCost;
        }
      });
    });
    
    const productivity = this.calculateProductivity(department, date);
    
    return {
      date,
      department,
      totalHours,
      regularHours,
      overtimeHours,
      laborCost,
      productivity
    };
  }

  calculateProductivity(department: Department, date: Date): ProductivityMetrics {
    // Calculate productivity metrics based on completed tasks
    const tasks = this.getCompletedTasksByDepartment(department, date);
    const tasksCompleted = tasks.length;
    const totalTaskTime = tasks.reduce((sum, task) => sum + (task.actualMinutes || 0), 0);
    const avgTaskCompletionTime = tasksCompleted > 0 ? totalTaskTime / tasksCompleted : 0;
    
    // Calculate efficiency (actual vs estimated time)
    const totalEstimatedTime = tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);
    const efficiencyRate = totalEstimatedTime > 0 
      ? (totalEstimatedTime / totalTaskTime) * 100 
      : 0;
    
    // Calculate specific outputs based on task categories
    const outputPerHour = this.calculateOutputPerHour(tasks);
    
    return {
      tasksCompleted,
      tasksAssigned: tasksCompleted, // Would need to track assigned separately
      avgTaskCompletionTime,
      efficiencyRate,
      outputPerHour
    };
  }

  // Shift Coverage Analysis
  analyzeShiftCoverage(date: Date): {
    department: Department;
    required: number;
    scheduled: number;
    actual: number;
    coverage: number;
  }[] {
    const coverage = [];
    
    Object.values(Department).forEach(dept => {
      const required = this.getRequiredStaffing(dept, date);
      const scheduled = this.getScheduledStaffing(dept, date);
      const actual = this.getActualStaffing(dept, date);
      
      coverage.push({
        department: dept,
        required,
        scheduled,
        actual,
        coverage: (actual / required) * 100
      });
    });
    
    return coverage;
  }

  // Helper Methods
  private calculateHours(
    clockIn: Date,
    clockOut: Date,
    breakStart?: Date,
    breakEnd?: Date
  ): number {
    let totalMinutes = (clockOut.getTime() - clockIn.getTime()) / 60000;
    
    if (breakStart && breakEnd) {
      const breakMinutes = (breakEnd.getTime() - breakStart.getTime()) / 60000;
      totalMinutes -= breakMinutes;
    }
    
    return totalMinutes / 60;
  }

  private updateProductivityMetrics(employeeId: string, task: Task): void {
    // Update real-time productivity tracking
  }

  private getEmployeeTimeEntries(employeeId: string, date: Date): TimeEntry[] {
    const entries = this.timeEntries.get(employeeId) || [];
    return entries.filter(entry => {
      const entryDate = new Date(entry.clockIn);
      return entryDate.toDateString() === date.toDateString();
    });
  }

  private getCompletedTasksByDepartment(department: Department, date: Date): Task[] {
    return Array.from(this.tasks.values()).filter(task => {
      if (!task.completedAt) return false;
      const taskDate = new Date(task.completedAt);
      return taskDate.toDateString() === date.toDateString();
      // Would need to add department tracking to tasks
    });
  }

  private calculateOutputPerHour(tasks: Task[]): any {
    const output: any = {};
    
    tasks.forEach(task => {
      switch (task.category) {
        case TaskCategory.TRANSPLANTING:
          output.plantsTransplanted = (output.plantsTransplanted || 0) + 1;
          break;
        case TaskCategory.PRUNING:
          output.plantsPruned = (output.plantsPruned || 0) + 1;
          break;
        case TaskCategory.HARVESTING:
          // Would need to track weight in task data
          output.poundsHarvested = (output.poundsHarvested || 0) + 1;
          break;
        case TaskCategory.TRIMMING:
          output.poundsTrimmed = (output.poundsTrimmed || 0) + 1;
          break;
        case TaskCategory.PACKAGING:
          output.unitsPackaged = (output.unitsPackaged || 0) + 1;
          break;
      }
    });
    
    return output;
  }

  private getRequiredStaffing(department: Department, date: Date): number {
    // Would implement based on cultivation schedule and room requirements
    const baseStaffing: Record<Department, number> = {
      [Department.CULTIVATION]: 8,
      [Department.PROCESSING]: 4,
      [Department.PACKAGING]: 3,
      [Department.QUALITY]: 2,
      [Department.MAINTENANCE]: 2,
      [Department.ADMINISTRATION]: 2
    };
    
    return baseStaffing[department] || 0;
  }

  private getScheduledStaffing(department: Department, date: Date): number {
    let count = 0;
    
    this.schedules.forEach(schedule => {
      schedule.shifts.forEach(shift => {
        if (shift.date.toDateString() === date.toDateString() &&
            shift.department === department) {
          count++;
        }
      });
    });
    
    return count;
  }

  private getActualStaffing(department: Department, date: Date): number {
    const employees = this.getEmployeesByDepartment(department);
    let count = 0;
    
    employees.forEach(employee => {
      const entries = this.getEmployeeTimeEntries(employee.id, date);
      if (entries.length > 0) {
        count++;
      }
    });
    
    return count;
  }

  private notifySchedulePublished(schedule: Schedule): void {
    // Send notifications to affected employees
    const employeeIds = new Set(schedule.shifts.map(s => s.employeeId));
    employeeIds.forEach(id => {
      // Send email/SMS/push notification
    });
  }

  private generateId(): string {
    return `${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
  }
}