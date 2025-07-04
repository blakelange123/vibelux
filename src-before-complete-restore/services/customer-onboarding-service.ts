/**
 * Customer Onboarding Service
 * Handles guided setup, training, and customer success
 */

import { prisma } from '@/lib/prisma';
import { controlSystemAdapter } from './control-system-adapter';
import { securityService } from './security-service';
import { utilityRateService } from './utility-rate-service';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  estimatedMinutes: number;
  required: boolean;
  dependencies?: string[];
}

interface CustomerProfile {
  facilityId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  facilityType: 'greenhouse' | 'indoor' | 'vertical_farm';
  cropTypes: string[];
  facilitySize: number; // sq ft
  currentEnergyBill: number; // monthly $
  controlSystem: string;
  timeZone: string;
  onboardingProgress: number; // 0-100%
}

interface SupportTicket {
  id: string;
  facilityId: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: 'technical' | 'billing' | 'training' | 'integration';
  assignedTo?: string;
  resolution?: string;
}

export class CustomerOnboardingService {
  private static instance: CustomerOnboardingService;

  private constructor() {}

  static getInstance(): CustomerOnboardingService {
    if (!CustomerOnboardingService.instance) {
      CustomerOnboardingService.instance = new CustomerOnboardingService();
    }
    return CustomerOnboardingService.instance;
  }

  /**
   * Start customer onboarding process
   */
  async startOnboarding(customerData: {
    companyName: string;
    contactName: string;
    contactEmail: string;
    phone: string;
    facilityType: string;
    cropTypes: string[];
    facilitySize: number;
    currentEnergyBill: number;
    zipCode: string;
  }): Promise<{ facilityId: string; onboardingSteps: OnboardingStep[] }> {
    try {
      const facilityId = `facility-${Date.now()}`;

      // Create customer profile
      await prisma.customer_profiles?.create({
        data: {
          facility_id: facilityId,
          company_name: customerData.companyName,
          contact_name: customerData.contactName,
          contact_email: customerData.contactEmail,
          phone: customerData.phone,
          facility_type: customerData.facilityType,
          crop_types: customerData.cropTypes,
          facility_size: customerData.facilitySize,
          current_energy_bill: customerData.currentEnergyBill,
          zip_code: customerData.zipCode,
          onboarding_progress: 0,
          onboarding_status: 'started'
        }
      });

      // Generate onboarding steps based on facility type
      const onboardingSteps = this.generateOnboardingSteps(customerData.facilityType);

      // Store onboarding plan
      await prisma.onboarding_plans?.create({
        data: {
          facility_id: facilityId,
          steps: onboardingSteps,
          estimated_completion_hours: onboardingSteps.reduce((sum, step) => sum + (step.estimatedMinutes / 60), 0),
          created_at: new Date()
        }
      });

      // Send welcome email
      await this.sendWelcomeEmail(customerData.contactEmail, customerData.contactName, facilityId);

      
      return { facilityId, onboardingSteps };

    } catch (error) {
      console.error('Failed to start onboarding:', error);
      throw error;
    }
  }

  /**
   * Get onboarding progress for a facility
   */
  async getOnboardingProgress(facilityId: string): Promise<{
    progress: number;
    currentStep: OnboardingStep | null;
    completedSteps: OnboardingStep[];
    remainingSteps: OnboardingStep[];
    estimatedTimeRemaining: number; // hours
  }> {
    try {
      const plan = await prisma.onboarding_plans?.findFirst({
        where: { facility_id: facilityId }
      });

      if (!plan) {
        throw new Error('Onboarding plan not found');
      }

      const steps = plan.steps as OnboardingStep[];
      const completedSteps = steps.filter(s => s.status === 'completed');
      const remainingSteps = steps.filter(s => s.status !== 'completed');
      const currentStep = steps.find(s => s.status === 'in_progress') || remainingSteps[0] || null;

      const progress = (completedSteps.length / steps.length) * 100;
      const estimatedTimeRemaining = remainingSteps.reduce((sum, step) => sum + (step.estimatedMinutes / 60), 0);

      return {
        progress,
        currentStep,
        completedSteps,
        remainingSteps,
        estimatedTimeRemaining
      };

    } catch (error) {
      console.error('Failed to get onboarding progress:', error);
      throw error;
    }
  }

  /**
   * Complete an onboarding step
   */
  async completeOnboardingStep(facilityId: string, stepId: string, results?: any): Promise<void> {
    try {
      const plan = await prisma.onboarding_plans?.findFirst({
        where: { facility_id: facilityId }
      });

      if (!plan) {
        throw new Error('Onboarding plan not found');
      }

      const steps = plan.steps as OnboardingStep[];
      const stepIndex = steps.findIndex(s => s.id === stepId);

      if (stepIndex === -1) {
        throw new Error('Onboarding step not found');
      }

      // Mark step as completed
      steps[stepIndex].status = 'completed';

      // Check if all dependencies for next steps are met
      this.updateStepAvailability(steps);

      // Calculate new progress
      const completedSteps = steps.filter(s => s.status === 'completed');
      const progress = (completedSteps.length / steps.length) * 100;

      // Update database
      await prisma.onboarding_plans?.update({
        where: { facility_id: facilityId },
        data: {
          steps: steps,
          updated_at: new Date()
        }
      });

      await prisma.customer_profiles?.update({
        where: { facility_id: facilityId },
        data: {
          onboarding_progress: progress,
          onboarding_status: progress === 100 ? 'completed' : 'in_progress'
        }
      });

      // Log step completion
      await this.logOnboardingEvent(facilityId, 'step_completed', {
        stepId,
        stepTitle: steps[stepIndex].title,
        progress,
        results
      });

      // Send progress notification
      if (progress === 100) {
        await this.sendOnboardingCompletedEmail(facilityId);
      } else {
        await this.sendProgressUpdateEmail(facilityId, progress);
      }


    } catch (error) {
      console.error('Failed to complete onboarding step:', error);
      throw error;
    }
  }

  /**
   * Create support ticket
   */
  async createSupportTicket(ticketData: {
    facilityId: string;
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'technical' | 'billing' | 'training' | 'integration';
    userEmail: string;
  }): Promise<string> {
    try {
      const ticketId = `ticket-${Date.now()}`;

      await prisma.support_tickets?.create({
        data: {
          id: ticketId,
          facility_id: ticketData.facilityId,
          subject: ticketData.subject,
          description: ticketData.description,
          priority: ticketData.priority,
          status: 'open',
          category: ticketData.category,
          user_email: ticketData.userEmail,
          created_at: new Date()
        }
      });

      // Auto-assign based on category and priority
      const assignedTo = await this.autoAssignTicket(ticketData.category, ticketData.priority);
      
      if (assignedTo) {
        await prisma.support_tickets?.update({
          where: { id: ticketId },
          data: { assigned_to: assignedTo }
        });
      }

      // Send notification emails
      await this.sendTicketCreatedEmail(ticketData.userEmail, ticketId, ticketData.subject);
      
      if (assignedTo) {
        await this.sendTicketAssignedEmail(assignedTo, ticketId, ticketData);
      }

      return ticketId;

    } catch (error) {
      console.error('Failed to create support ticket:', error);
      throw error;
    }
  }

  /**
   * Schedule onboarding call
   */
  async scheduleOnboardingCall(facilityId: string, preferredTimes: string[]): Promise<string> {
    try {
      // Find available customer success manager
      const csm = await this.findAvailableCSM(preferredTimes);
      
      if (!csm) {
        throw new Error('No customer success managers available for preferred times');
      }

      // Create calendar event
      const eventId = await this.createCalendarEvent({
        facilityId,
        csmEmail: csm.email,
        preferredTimes,
        type: 'onboarding_call'
      });

      // Update onboarding plan
      await this.completeOnboardingStep(facilityId, 'schedule_call', {
        scheduledWith: csm.name,
        eventId,
        scheduledTime: preferredTimes[0]
      });

      return eventId;

    } catch (error) {
      console.error('Failed to schedule onboarding call:', error);
      throw error;
    }
  }

  /**
   * Generate training materials
   */
  async generateTrainingMaterials(facilityId: string): Promise<{
    videos: string[];
    documents: string[];
    checklistUrl: string;
  }> {
    try {
      const customer = await prisma.customer_profiles?.findFirst({
        where: { facility_id: facilityId }
      });

      if (!customer) {
        throw new Error('Customer profile not found');
      }

      // Generate custom training materials based on their setup
      const materials = {
        videos: this.getTrainingVideos(customer.facility_type, customer.control_system),
        documents: this.getTrainingDocuments(customer.facility_type, customer.crop_types),
        checklistUrl: this.generateCustomChecklist(facilityId, customer)
      };

      // Log material generation
      await this.logOnboardingEvent(facilityId, 'training_materials_generated', {
        materialTypes: Object.keys(materials),
        facilityType: customer.facility_type,
        controlSystem: customer.control_system
      });

      return materials;

    } catch (error) {
      console.error('Failed to generate training materials:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private generateOnboardingSteps(facilityType: string): OnboardingStep[] {
    const baseSteps: OnboardingStep[] = [
      {
        id: 'welcome_call',
        title: 'Welcome Call',
        description: 'Schedule initial consultation with customer success team',
        status: 'pending',
        estimatedMinutes: 30,
        required: true
      },
      {
        id: 'facility_assessment',
        title: 'Facility Assessment',
        description: 'Review facility layout, equipment, and energy usage',
        status: 'pending',
        estimatedMinutes: 45,
        required: true,
        dependencies: ['welcome_call']
      },
      {
        id: 'control_system_integration',
        title: 'Control System Integration',
        description: 'Connect VibeLux to existing control system',
        status: 'pending',
        estimatedMinutes: 60,
        required: true,
        dependencies: ['facility_assessment']
      },
      {
        id: 'security_setup',
        title: 'Security Configuration',
        description: 'Set up encryption and access controls',
        status: 'pending',
        estimatedMinutes: 30,
        required: true,
        dependencies: ['control_system_integration']
      },
      {
        id: 'baseline_establishment',
        title: 'Energy Baseline',
        description: 'Establish energy usage baseline for savings calculation',
        status: 'pending',
        estimatedMinutes: 15,
        required: true,
        dependencies: ['security_setup']
      },
      {
        id: 'optimization_testing',
        title: 'Optimization Testing',
        description: 'Test energy optimization in shadow mode',
        status: 'pending',
        estimatedMinutes: 120,
        required: true,
        dependencies: ['baseline_establishment']
      },
      {
        id: 'team_training',
        title: 'Team Training',
        description: 'Train facility operators on VibeLux dashboard and controls',
        status: 'pending',
        estimatedMinutes: 90,
        required: true,
        dependencies: ['optimization_testing']
      },
      {
        id: 'go_live',
        title: 'Go Live',
        description: 'Activate energy optimization and monitoring',
        status: 'pending',
        estimatedMinutes: 30,
        required: true,
        dependencies: ['team_training']
      }
    ];

    // Add facility-specific steps
    if (facilityType === 'greenhouse') {
      baseSteps.splice(4, 0, {
        id: 'weather_integration',
        title: 'Weather Integration',
        description: 'Connect local weather data for greenhouse optimization',
        status: 'pending',
        estimatedMinutes: 20,
        required: false,
        dependencies: ['security_setup']
      });
    }

    if (facilityType === 'vertical_farm') {
      baseSteps.splice(5, 0, {
        id: 'multi_tier_setup',
        title: 'Multi-Tier Setup',
        description: 'Configure lighting zones for vertical growing systems',
        status: 'pending',
        estimatedMinutes: 45,
        required: true,
        dependencies: ['baseline_establishment']
      });
    }

    return baseSteps;
  }

  private updateStepAvailability(steps: OnboardingStep[]): void {
    for (const step of steps) {
      if (step.status === 'pending' && step.dependencies) {
        // Check if all dependencies are completed
        const dependenciesMet = step.dependencies.every(depId =>
          steps.find(s => s.id === depId)?.status === 'completed'
        );
        
        if (dependenciesMet) {
          step.status = 'pending'; // Available to start
        }
      }
    }
  }

  private async autoAssignTicket(category: string, priority: string): Promise<string | null> {
    // Simple assignment logic - would be more sophisticated in production
    const assignments: Record<string, string> = {
      'technical': 'tech-support@vibelux.com',
      'integration': 'integration@vibelux.com',
      'billing': 'billing@vibelux.com',
      'training': 'training@vibelux.com'
    };

    return assignments[category] || 'support@vibelux.com';
  }

  private async findAvailableCSM(preferredTimes: string[]): Promise<{ name: string; email: string } | null> {
    // Mock CSM finder - would integrate with calendar system
    return {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@vibelux.com'
    };
  }

  private async createCalendarEvent(eventData: any): Promise<string> {
    // Mock calendar integration - would use Google Calendar, Outlook, etc.
    return `event-${Date.now()}`;
  }

  private getTrainingVideos(facilityType: string, controlSystem: string): string[] {
    return [
      '/training/vibelux-overview.mp4',
      `/training/${facilityType}-optimization.mp4`,
      `/training/${controlSystem}-integration.mp4`,
      '/training/dashboard-tour.mp4',
      '/training/troubleshooting.mp4'
    ];
  }

  private getTrainingDocuments(facilityType: string, cropTypes: string[]): string[] {
    const docs = [
      '/docs/vibelux-user-guide.pdf',
      `/docs/${facilityType}-best-practices.pdf`,
      '/docs/safety-guidelines.pdf'
    ];

    // Add crop-specific documents
    for (const crop of cropTypes) {
      docs.push(`/docs/${crop}-optimization-guide.pdf`);
    }

    return docs;
  }

  private generateCustomChecklist(facilityId: string, customer: any): string {
    // Generate facility-specific checklist
    return `/checklists/${facilityId}-onboarding-checklist.pdf`;
  }

  private async logOnboardingEvent(facilityId: string, eventType: string, details: any): Promise<void> {
    try {
      await prisma.onboarding_events?.create({
        data: {
          facility_id: facilityId,
          event_type: eventType,
          details: JSON.stringify(details),
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to log onboarding event:', error);
    }
  }

  private async sendWelcomeEmail(email: string, name: string, facilityId: string): Promise<void> {
    // Mock email service - would integrate with SendGrid, Mailgun, etc.
  }

  private async sendOnboardingCompletedEmail(facilityId: string): Promise<void> {
  }

  private async sendProgressUpdateEmail(facilityId: string, progress: number): Promise<void> {
  }

  private async sendTicketCreatedEmail(email: string, ticketId: string, subject: string): Promise<void> {
  }

  private async sendTicketAssignedEmail(assigneeEmail: string, ticketId: string, ticketData: any): Promise<void> {
  }
}

// Export singleton
export const customerOnboardingService = CustomerOnboardingService.getInstance();