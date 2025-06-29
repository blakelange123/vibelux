import {
  ComplianceEvent,
  ComplianceTask,
  License,
  Inspection,
  Regulation,
  ComplianceReport,
  Training,
  EventStatus,
  TaskStatus,
  Priority,
  LicenseStatus,
  InspectionStatus,
  ReportStatus,
  Frequency
} from './compliance-types';

export class ComplianceManager {
  private events: Map<string, ComplianceEvent> = new Map();
  private tasks: Map<string, ComplianceTask> = new Map();
  private licenses: Map<string, License> = new Map();
  private inspections: Map<string, Inspection> = new Map();
  private regulations: Map<string, Regulation> = new Map();
  private reports: Map<string, ComplianceReport> = new Map();
  private trainings: Map<string, Training> = new Map();

  // Event Management
  createEvent(event: Omit<ComplianceEvent, 'id' | 'createdAt' | 'updatedAt'>): ComplianceEvent {
    const newEvent: ComplianceEvent = {
      ...event,
      id: `EVT-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.events.set(newEvent.id, newEvent);

    // Create reminders
    this.scheduleReminders(newEvent);

    // Create tasks if needed
    if (event.type === 'License Renewal') {
      this.createLicenseRenewalTasks(newEvent);
    }

    return newEvent;
  }

  updateEventStatus(eventId: string, status: EventStatus, completedBy?: string): void {
    const event = this.events.get(eventId);
    if (!event) throw new Error('Event not found');

    event.status = status;
    if (status === EventStatus.Completed) {
      event.completedDate = new Date();
      event.completedBy = completedBy;
    }
    event.updatedAt = new Date();

    // Create next recurring event if applicable
    if (status === EventStatus.Completed && event.recurringConfig) {
      this.createNextRecurringEvent(event);
    }
  }

  // Task Management
  createTask(task: Omit<ComplianceTask, 'id' | 'createdAt' | 'updatedAt'>): ComplianceTask {
    const newTask: ComplianceTask = {
      ...task,
      id: `TSK-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.set(newTask.id, newTask);
    
    // Notify assignee
    this.notifyTaskAssignee(newTask);

    return newTask;
  }

  updateTaskStatus(taskId: string, status: TaskStatus, completedBy?: string): void {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');

    task.status = status;
    if (status === TaskStatus.Completed) {
      task.completedDate = new Date();
      task.completedBy = completedBy;
    }
    task.updatedAt = new Date();

    // Check if all event tasks are complete
    this.checkEventCompletion(task.eventId);
  }

  updateTaskChecklist(taskId: string, checklistItemId: string, completed: boolean, completedBy: string): void {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');

    const item = task.checklist.find(i => i.id === checklistItemId);
    if (!item) throw new Error('Checklist item not found');

    item.completed = completed;
    if (completed) {
      item.completedBy = completedBy;
      item.completedAt = new Date();
    }

    task.updatedAt = new Date();
  }

  // License Management
  addLicense(license: Omit<License, 'id' | 'createdAt' | 'updatedAt'>): License {
    const newLicense: License = {
      ...license,
      id: `LIC-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.licenses.set(newLicense.id, newLicense);

    // Create renewal event
    this.createLicenseRenewalEvent(newLicense);

    return newLicense;
  }

  renewLicense(licenseId: string, newExpiryDate: Date, fees: any[]): void {
    const license = this.licenses.get(licenseId);
    if (!license) throw new Error('License not found');

    // Add to history
    license.history.push({
      action: 'Renewed',
      date: new Date(),
      performedBy: 'System',
      notes: `Renewed until ${newExpiryDate.toISOString().split('T')[0]}`
    });

    // Update license
    license.issueDate = new Date();
    license.expiryDate = newExpiryDate;
    license.renewalDate = new Date(newExpiryDate.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days before expiry
    license.status = LicenseStatus.Active;
    license.fees.push(...fees);
    license.updatedAt = new Date();

    // Create next renewal event
    this.createLicenseRenewalEvent(license);
  }

  // Inspection Management
  scheduleInspection(inspection: Omit<Inspection, 'id' | 'createdAt' | 'updatedAt'>): Inspection {
    const newInspection: Inspection = {
      ...inspection,
      id: `INS-${Date.now()}`,
      status: InspectionStatus.Scheduled,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.inspections.set(newInspection.id, newInspection);

    // Create compliance event
    this.createEvent({
      title: `${inspection.type} Inspection`,
      description: `Scheduled inspection by ${inspection.inspectorOrganization}`,
      type: 'Inspection',
      category: 'StateRegulatory',
      dueDate: inspection.scheduledDate,
      reminderDays: [30, 14, 7, 1],
      frequency: 'OneTime',
      status: EventStatus.Upcoming,
      priority: Priority.High,
      responsiblePerson: 'Compliance Manager',
      responsibleDepartment: 'Compliance',
      regulatoryBody: inspection.inspectorOrganization,
      attachments: [],
      notes: ''
    });

    return newInspection;
  }

  recordInspectionResults(
    inspectionId: string, 
    findings: any[], 
    passed: boolean, 
    score?: number
  ): void {
    const inspection = this.inspections.get(inspectionId);
    if (!inspection) throw new Error('Inspection not found');

    inspection.actualDate = new Date();
    inspection.findings = findings;
    inspection.passed = passed;
    inspection.score = score;
    inspection.status = passed ? InspectionStatus.Passed : InspectionStatus.Failed;
    inspection.updatedAt = new Date();

    // Create corrective actions for findings
    findings.forEach(finding => {
      if (finding.correctionRequired) {
        this.createCorrectiveActionTask(inspection, finding);
      }
    });

    // Schedule follow-up if failed
    if (!passed) {
      inspection.followUpDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      inspection.status = InspectionStatus.PendingCorrections;
    }
  }

  // Report Management
  createReport(report: Omit<ComplianceReport, 'id' | 'createdAt' | 'updatedAt'>): ComplianceReport {
    const newReport: ComplianceReport = {
      ...report,
      id: `RPT-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.reports.set(newReport.id, newReport);

    return newReport;
  }

  submitReport(reportId: string, submittedBy: string): void {
    const report = this.reports.get(reportId);
    if (!report) throw new Error('Report not found');

    report.status = ReportStatus.Submitted;
    report.submittedDate = new Date();
    report.preparedBy = submittedBy;
    report.updatedAt = new Date();

    // Generate confirmation
    report.confirmationNumber = this.generateConfirmationNumber();

    // Mark related event as complete
    const relatedEvent = Array.from(this.events.values())
      .find(e => e.type === 'Report Submission' && 
                 e.dueDate.toISOString().split('T')[0] === report.dueDate.toISOString().split('T')[0]);
    
    if (relatedEvent) {
      this.updateEventStatus(relatedEvent.id, EventStatus.Completed, submittedBy);
    }
  }

  // Training Management
  addTraining(training: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>): Training {
    const newTraining: Training = {
      ...training,
      id: `TRN-${Date.now()}`,
      completions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.trainings.set(newTraining.id, newTraining);

    // Create training events for required trainings
    if (training.required) {
      this.createTrainingEvents(newTraining);
    }

    return newTraining;
  }

  recordTrainingCompletion(
    trainingId: string,
    employeeId: string,
    employeeName: string,
    score?: number
  ): void {
    const training = this.trainings.get(trainingId);
    if (!training) throw new Error('Training not found');

    const completion = {
      employeeId,
      employeeName,
      completedDate: new Date(),
      score,
      certificateNumber: this.generateCertificateNumber(),
      expiryDate: training.expiryMonths 
        ? new Date(Date.now() + training.expiryMonths * 30 * 24 * 60 * 60 * 1000)
        : undefined
    };

    training.completions.push(completion);
    training.updatedAt = new Date();

    // Schedule renewal if applicable
    if (completion.expiryDate && training.required) {
      this.scheduleTrainingRenewal(training, employeeId, completion.expiryDate);
    }
  }

  // Calendar View
  getUpcomingEvents(days: number = 30): ComplianceEvent[] {
    const cutoffDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const now = new Date();

    return Array.from(this.events.values())
      .filter(event => {
        return event.status !== EventStatus.Completed &&
               event.status !== EventStatus.Cancelled &&
               event.dueDate >= now &&
               event.dueDate <= cutoffDate;
      })
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  getOverdueItems(): {
    events: ComplianceEvent[];
    tasks: ComplianceTask[];
    licenses: License[];
    reports: ComplianceReport[];
  } {
    const now = new Date();

    return {
      events: Array.from(this.events.values())
        .filter(e => e.status !== EventStatus.Completed && e.dueDate < now),
      
      tasks: Array.from(this.tasks.values())
        .filter(t => t.status !== TaskStatus.Completed && t.dueDate < now),
      
      licenses: Array.from(this.licenses.values())
        .filter(l => l.status === LicenseStatus.Expired || 
                     (l.status === LicenseStatus.Active && l.expiryDate < now)),
      
      reports: Array.from(this.reports.values())
        .filter(r => r.status !== ReportStatus.Submitted && r.dueDate < now)
    };
  }

  // Compliance Score
  getComplianceScore(): {
    overall: number;
    byCategory: Record<string, number>;
    issues: string[];
    strengths: string[];
  } {
    const scores: Record<string, { total: number; completed: number }> = {};
    const issues: string[] = [];
    const strengths: string[] = [];

    // Calculate by category
    this.events.forEach(event => {
      if (!scores[event.category]) {
        scores[event.category] = { total: 0, completed: 0 };
      }
      
      scores[event.category].total++;
      if (event.status === EventStatus.Completed) {
        scores[event.category].completed++;
      } else if (event.status === EventStatus.Overdue) {
        issues.push(`Overdue ${event.type}: ${event.title}`);
      }
    });

    // Check licenses
    let expiredLicenses = 0;
    this.licenses.forEach(license => {
      if (license.status === LicenseStatus.Expired) {
        expiredLicenses++;
        issues.push(`Expired license: ${license.type} - ${license.number}`);
      }
    });

    // Calculate scores
    const byCategory: Record<string, number> = {};
    let totalScore = 0;
    let categoryCount = 0;

    Object.entries(scores).forEach(([category, data]) => {
      if (data.total > 0) {
        const score = (data.completed / data.total) * 100;
        byCategory[category] = Math.round(score);
        totalScore += score;
        categoryCount++;
        
        if (score >= 95) {
          strengths.push(`Excellent ${category} compliance`);
        }
      }
    });

    const overall = categoryCount > 0 ? Math.round(totalScore / categoryCount) : 100;

    // Deduct for expired licenses
    if (expiredLicenses > 0) {
      const penalty = expiredLicenses * 10;
      return {
        overall: Math.max(0, overall - penalty),
        byCategory,
        issues,
        strengths
      };
    }

    return { overall, byCategory, issues, strengths };
  }

  // Helper methods
  private scheduleReminders(event: ComplianceEvent): void {
    event.reminderDays.forEach(days => {
      const reminderDate = new Date(event.dueDate.getTime() - days * 24 * 60 * 60 * 1000);
      
      // Schedule reminder notification
    });
  }

  private createLicenseRenewalTasks(event: ComplianceEvent): void {
    const tasks = [
      {
        title: 'Gather renewal documentation',
        description: 'Collect all required documents for license renewal',
        dueDate: new Date(event.dueDate.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days before
        estimatedHours: 4
      },
      {
        title: 'Complete renewal application',
        description: 'Fill out and review renewal application forms',
        dueDate: new Date(event.dueDate.getTime() - 45 * 24 * 60 * 60 * 1000), // 45 days before
        estimatedHours: 2
      },
      {
        title: 'Submit renewal and payment',
        description: 'Submit application and process payment',
        dueDate: new Date(event.dueDate.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days before
        estimatedHours: 1
      }
    ];

    tasks.forEach(taskData => {
      this.createTask({
        eventId: event.id,
        title: taskData.title,
        description: taskData.description,
        assignedTo: event.responsiblePerson,
        dueDate: taskData.dueDate,
        status: TaskStatus.NotStarted,
        priority: event.priority,
        estimatedHours: taskData.estimatedHours,
        checklist: [],
        documents: [],
        notes: ''
      });
    });
  }

  private createNextRecurringEvent(event: ComplianceEvent): void {
    if (!event.recurringConfig) return;

    const nextDate = this.calculateNextDate(event.dueDate, event.recurringConfig);
    
    this.createEvent({
      ...event,
      dueDate: nextDate,
      status: EventStatus.Upcoming,
      completedDate: undefined,
      completedBy: undefined
    });
  }

  private calculateNextDate(currentDate: Date, config: any): Date {
    const next = new Date(currentDate);
    
    switch (config.frequency) {
      case Frequency.Daily:
        next.setDate(next.getDate() + config.interval);
        break;
      case Frequency.Weekly:
        next.setDate(next.getDate() + (7 * config.interval));
        break;
      case Frequency.Monthly:
        next.setMonth(next.getMonth() + config.interval);
        break;
      case Frequency.Quarterly:
        next.setMonth(next.getMonth() + (3 * config.interval));
        break;
      case Frequency.Annual:
        next.setFullYear(next.getFullYear() + config.interval);
        break;
    }
    
    return next;
  }

  private createLicenseRenewalEvent(license: License): void {
    const reminderDate = new Date(license.renewalDate);
    
    this.createEvent({
      title: `${license.type} License Renewal - ${license.number}`,
      description: `Renewal required for ${license.holder} at ${license.facility}`,
      type: 'License',
      category: 'StateRegulatory',
      dueDate: license.renewalDate,
      reminderDays: [90, 60, 30, 14, 7],
      frequency: 'OneTime',
      status: EventStatus.Upcoming,
      priority: Priority.Critical,
      responsiblePerson: 'Compliance Manager',
      responsibleDepartment: 'Compliance',
      regulatoryBody: license.issuingAuthority,
      referenceNumber: license.number,
      attachments: [],
      notes: `License expires on ${license.expiryDate.toISOString().split('T')[0]}`
    });
  }

  private createCorrectiveActionTask(inspection: Inspection, finding: any): void {
    this.createTask({
      eventId: `INS-${inspection.id}`,
      title: `Corrective Action: ${finding.category}`,
      description: finding.description,
      assignedTo: 'Facility Manager',
      dueDate: finding.correctionDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: TaskStatus.NotStarted,
      priority: finding.severity === 'Critical' ? Priority.Critical : Priority.High,
      estimatedHours: 8,
      checklist: [
        {
          id: '1',
          text: 'Document root cause',
          completed: false,
          required: true
        },
        {
          id: '2',
          text: 'Implement correction',
          completed: false,
          required: true
        },
        {
          id: '3',
          text: 'Verify effectiveness',
          completed: false,
          required: true
        },
        {
          id: '4',
          text: 'Update procedures if needed',
          completed: false,
          required: false
        }
      ],
      documents: [],
      notes: `Finding from ${inspection.type} inspection on ${inspection.actualDate}`
    });
  }

  private createTrainingEvents(training: Training): void {
    // Create initial training event
    this.createEvent({
      title: `${training.title} Training Due`,
      description: training.description,
      type: 'Training',
      category: 'HR',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      reminderDays: [30, 14, 7, 1],
      frequency: training.frequency,
      status: EventStatus.Upcoming,
      priority: training.required ? Priority.High : Priority.Medium,
      responsiblePerson: 'Training Coordinator',
      responsibleDepartment: 'HR',
      regulatoryBody: training.provider,
      attachments: [],
      notes: `Target roles: ${training.targetRoles.join(', ')}`
    });
  }

  private scheduleTrainingRenewal(training: Training, employeeId: string, expiryDate: Date): void {
    const renewalDate = new Date(expiryDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days before expiry
    
    this.createEvent({
      title: `${training.title} Renewal - Employee ${employeeId}`,
      description: `Training certification expiring for ${training.title}`,
      type: 'Training',
      category: 'HR',
      dueDate: renewalDate,
      reminderDays: [30, 14, 7],
      frequency: 'OneTime',
      status: EventStatus.Upcoming,
      priority: Priority.High,
      responsiblePerson: employeeId,
      responsibleDepartment: 'Operations',
      regulatoryBody: training.provider,
      attachments: [],
      notes: `Certification expires on ${expiryDate.toISOString().split('T')[0]}`
    });
  }

  private checkEventCompletion(eventId: string): void {
    const tasks = Array.from(this.tasks.values()).filter(t => t.eventId === eventId);
    const allComplete = tasks.every(t => t.status === TaskStatus.Completed);
    
    if (allComplete && tasks.length > 0) {
      this.updateEventStatus(eventId, EventStatus.Completed, 'System');
    }
  }

  private notifyTaskAssignee(task: ComplianceTask): void {
  }

  private generateConfirmationNumber(): string {
    return `CONF-${Date.now().toString(36).toUpperCase()}`;
  }

  private generateCertificateNumber(): string {
    return `CERT-${Date.now().toString(36).toUpperCase()}`;
  }
}