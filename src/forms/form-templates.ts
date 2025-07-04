// Comprehensive Business Forms Template System
// Standard forms for HR, legal, compliance, and business operations

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'multiselect' | 'textarea' | 'checkbox' | 'radio' | 'signature' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
  options?: string[]; // for select/radio/checkbox
  defaultValue?: any;
  helpText?: string;
  section?: string;
}

export interface FormTemplate {
  id: string;
  name: string;
  category: 'tax' | 'legal' | 'hr' | 'safety' | 'compliance' | 'business' | 'cannabis' | 'custom';
  description: string;
  version: string;
  lastUpdated: Date;
  fields: FormField[];
  sections?: FormSection[];
  legalText?: string;
  instructions?: string;
  requiredSignatures?: string[];
  autoFillMappings?: { [key: string]: string }; // Map to user profile fields
  expirationDays?: number; // For forms that expire
  tags: string[];
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fieldIds: string[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export class FormTemplateManager {
  private templates: Map<string, FormTemplate> = new Map();

  constructor() {
    this.initializeStandardForms();
  }

  private initializeStandardForms(): void {
    // Tax Forms
    this.addTemplate(this.createW4Form());
    this.addTemplate(this.createW9Form());
    this.addTemplate(this.create1099Form());

    // Legal/HR Forms
    this.addTemplate(this.createNDAForm());
    this.addTemplate(this.createEmploymentAgreementForm());
    this.addTemplate(this.createContractorAgreementForm());
    this.addTemplate(this.createNonCompeteForm());
    this.addTemplate(this.createI9Form());

    // Safety & Compliance
    this.addTemplate(this.createSafetyTrainingForm());
    this.addTemplate(this.createIncidentReportForm());
    this.addTemplate(this.createWorkersCompForm());
    this.addTemplate(this.createDrugTestConsentForm());

    // Cannabis Industry Specific
    this.addTemplate(this.createCannabisLicenseForm());
    this.addTemplate(this.createStateComplianceForm());
    this.addTemplate(this.createInventoryTrackingForm());
    this.addTemplate(this.createLabTestingForm());

    // Business Operations
    this.addTemplate(this.createVendorApplicationForm());
    this.addTemplate(this.createCustomerOnboardingForm());
    this.addTemplate(this.createInsuranceClaimForm());
    this.addTemplate(this.createMaintenanceRequestForm());
  }

  // Tax Forms
  private createW4Form(): FormTemplate {
    return {
      id: 'form-w4-2024',
      name: 'Form W-4: Employee\'s Withholding Certificate',
      category: 'tax',
      description: 'IRS Form W-4 for federal tax withholding',
      version: '2024',
      lastUpdated: new Date(),
      tags: ['tax', 'irs', 'withholding', 'required'],
      fields: [
        {
          id: 'first_name',
          name: 'firstName',
          type: 'text',
          label: 'First name',
          required: true,
          section: 'personal_info'
        },
        {
          id: 'middle_initial',
          name: 'middleInitial',
          type: 'text',
          label: 'Middle initial',
          required: false,
          section: 'personal_info'
        },
        {
          id: 'last_name',
          name: 'lastName',
          type: 'text',
          label: 'Last name',
          required: true,
          section: 'personal_info'
        },
        {
          id: 'ssn',
          name: 'socialSecurityNumber',
          type: 'text',
          label: 'Social Security Number',
          required: true,
          validation: { pattern: '^\\d{3}-?\\d{2}-?\\d{4}$' },
          section: 'personal_info'
        },
        {
          id: 'address',
          name: 'address',
          type: 'textarea',
          label: 'Address',
          required: true,
          section: 'personal_info'
        },
        {
          id: 'filing_status',
          name: 'filingStatus',
          type: 'radio',
          label: 'Filing Status',
          required: true,
          options: [
            'Single or Married filing separately',
            'Married filing jointly',
            'Head of household'
          ],
          section: 'tax_info'
        },
        {
          id: 'multiple_jobs',
          name: 'multipleJobs',
          type: 'checkbox',
          label: 'I have multiple jobs or my spouse works',
          required: false,
          section: 'tax_info'
        },
        {
          id: 'dependents_amount',
          name: 'dependentsAmount',
          type: 'number',
          label: 'Dependents amount (Step 3)',
          required: false,
          section: 'tax_info'
        },
        {
          id: 'extra_withholding',
          name: 'extraWithholding',
          type: 'number',
          label: 'Extra withholding amount',
          required: false,
          section: 'tax_info'
        },
        {
          id: 'employee_signature',
          name: 'employeeSignature',
          type: 'signature',
          label: 'Employee Signature',
          required: true,
          section: 'signatures'
        },
        {
          id: 'date_signed',
          name: 'dateSigned',
          type: 'date',
          label: 'Date',
          required: true,
          section: 'signatures'
        }
      ],
      sections: [
        {
          id: 'personal_info',
          title: 'Personal Information',
          fieldIds: ['first_name', 'middle_initial', 'last_name', 'ssn', 'address']
        },
        {
          id: 'tax_info',
          title: 'Tax Information',
          fieldIds: ['filing_status', 'multiple_jobs', 'dependents_amount', 'extra_withholding']
        },
        {
          id: 'signatures',
          title: 'Signatures',
          fieldIds: ['employee_signature', 'date_signed']
        }
      ],
      autoFillMappings: {
        'first_name': 'profile.firstName',
        'last_name': 'profile.lastName',
        'address': 'profile.address'
      }
    };
  }

  private createW9Form(): FormTemplate {
    return {
      id: 'form-w9-2024',
      name: 'Form W-9: Request for Taxpayer Identification Number',
      category: 'tax',
      description: 'IRS Form W-9 for contractor tax information',
      version: '2024',
      lastUpdated: new Date(),
      tags: ['tax', 'irs', 'contractor', '1099'],
      fields: [
        {
          id: 'business_name',
          name: 'businessName',
          type: 'text',
          label: 'Name (as shown on your income tax return)',
          required: true,
          section: 'business_info'
        },
        {
          id: 'business_name_line2',
          name: 'businessNameLine2',
          type: 'text',
          label: 'Business name/disregarded entity name (if different)',
          required: false,
          section: 'business_info'
        },
        {
          id: 'tax_classification',
          name: 'taxClassification',
          type: 'radio',
          label: 'Federal tax classification',
          required: true,
          options: [
            'Individual/sole proprietor or single-member LLC',
            'C Corporation',
            'S Corporation',
            'Partnership',
            'Trust/estate',
            'Limited liability company',
            'Other'
          ],
          section: 'business_info'
        },
        {
          id: 'ein_ssn',
          name: 'einOrSsn',
          type: 'text',
          label: 'Taxpayer Identification Number (SSN or EIN)',
          required: true,
          validation: { pattern: '^\\d{2,3}-?\\d{2,7}$' },
          section: 'tax_info'
        },
        {
          id: 'address',
          name: 'address',
          type: 'textarea',
          label: 'Address (number, street, and apt. or suite no.)',
          required: true,
          section: 'contact_info'
        },
        {
          id: 'city_state_zip',
          name: 'cityStateZip',
          type: 'text',
          label: 'City, state, and ZIP code',
          required: true,
          section: 'contact_info'
        },
        {
          id: 'backup_withholding',
          name: 'backupWithholding',
          type: 'checkbox',
          label: 'I am not subject to backup withholding',
          required: false,
          section: 'certifications'
        },
        {
          id: 'signature',
          name: 'signature',
          type: 'signature',
          label: 'Signature',
          required: true,
          section: 'signatures'
        },
        {
          id: 'date',
          name: 'date',
          type: 'date',
          label: 'Date',
          required: true,
          section: 'signatures'
        }
      ],
      sections: [
        {
          id: 'business_info',
          title: 'Business Information',
          fieldIds: ['business_name', 'business_name_line2', 'tax_classification']
        },
        {
          id: 'tax_info',
          title: 'Tax Information',
          fieldIds: ['ein_ssn']
        },
        {
          id: 'contact_info',
          title: 'Contact Information',
          fieldIds: ['address', 'city_state_zip']
        },
        {
          id: 'certifications',
          title: 'Certifications',
          fieldIds: ['backup_withholding']
        },
        {
          id: 'signatures',
          title: 'Signatures',
          fieldIds: ['signature', 'date']
        }
      ]
    };
  }

  private createNDAForm(): FormTemplate {
    return {
      id: 'nda-standard-2024',
      name: 'Non-Disclosure Agreement (NDA)',
      category: 'legal',
      description: 'Standard mutual non-disclosure agreement',
      version: '2024',
      lastUpdated: new Date(),
      tags: ['legal', 'confidentiality', 'nda', 'required'],
      fields: [
        {
          id: 'party_name',
          name: 'partyName',
          type: 'text',
          label: 'Full Legal Name',
          required: true,
          section: 'parties'
        },
        {
          id: 'party_title',
          name: 'partyTitle',
          type: 'text',
          label: 'Title/Position',
          required: false,
          section: 'parties'
        },
        {
          id: 'company_name',
          name: 'companyName',
          type: 'text',
          label: 'Company/Organization',
          required: false,
          section: 'parties'
        },
        {
          id: 'purpose',
          name: 'purpose',
          type: 'textarea',
          label: 'Purpose of disclosure',
          required: true,
          section: 'terms'
        },
        {
          id: 'duration_years',
          name: 'durationYears',
          type: 'select',
          label: 'Agreement duration',
          required: true,
          options: ['1 year', '2 years', '3 years', '5 years', 'Indefinite'],
          section: 'terms'
        },
        {
          id: 'acknowledge_terms',
          name: 'acknowledgeTerms',
          type: 'checkbox',
          label: 'I acknowledge that I have read and understand the terms of this agreement',
          required: true,
          section: 'acknowledgment'
        },
        {
          id: 'signature',
          name: 'signature',
          type: 'signature',
          label: 'Digital Signature',
          required: true,
          section: 'signatures'
        },
        {
          id: 'date_signed',
          name: 'dateSigned',
          type: 'date',
          label: 'Date Signed',
          required: true,
          section: 'signatures'
        }
      ],
      sections: [
        {
          id: 'parties',
          title: 'Party Information',
          fieldIds: ['party_name', 'party_title', 'company_name']
        },
        {
          id: 'terms',
          title: 'Agreement Terms',
          fieldIds: ['purpose', 'duration_years']
        },
        {
          id: 'acknowledgment',
          title: 'Acknowledgment',
          fieldIds: ['acknowledge_terms']
        },
        {
          id: 'signatures',
          title: 'Signatures',
          fieldIds: ['signature', 'date_signed']
        }
      ],
      legalText: `
        MUTUAL NON-DISCLOSURE AGREEMENT
        
        This Non-Disclosure Agreement ("Agreement") is entered into to protect confidential information shared between the parties.
        
        1. CONFIDENTIAL INFORMATION: Any information marked as confidential or that would reasonably be considered confidential.
        
        2. OBLIGATIONS: Each party agrees to maintain confidentiality and not disclose information to third parties.
        
        3. DURATION: This agreement remains in effect for the specified duration from the date of signing.
        
        4. REMEDIES: Breach of this agreement may result in irreparable harm and legal action.
      `,
      expirationDays: 365
    };
  }

  private createSafetyTrainingForm(): FormTemplate {
    return {
      id: 'safety-training-2024',
      name: 'Workplace Safety Training Completion',
      category: 'safety',
      description: 'Documentation of completed safety training modules',
      version: '2024',
      lastUpdated: new Date(),
      tags: ['safety', 'training', 'osha', 'certification'],
      fields: [
        {
          id: 'employee_name',
          name: 'employeeName',
          type: 'text',
          label: 'Employee Name',
          required: true,
          section: 'employee_info'
        },
        {
          id: 'employee_id',
          name: 'employeeId',
          type: 'text',
          label: 'Employee ID',
          required: true,
          section: 'employee_info'
        },
        {
          id: 'department',
          name: 'department',
          type: 'select',
          label: 'Department',
          required: true,
          options: ['Cultivation', 'Processing', 'Packaging', 'Quality Control', 'Maintenance', 'Administration'],
          section: 'employee_info'
        },
        {
          id: 'training_modules',
          name: 'trainingModules',
          type: 'multiselect',
          label: 'Completed Training Modules',
          required: true,
          options: [
            'General Workplace Safety',
            'Chemical Handling & MSDS',
            'Personal Protective Equipment (PPE)',
            'Emergency Procedures',
            'Electrical Safety',
            'Lifting & Ergonomics',
            'Cannabis-Specific Safety',
            'Equipment Operation',
            'Fire Safety',
            'First Aid/CPR'
          ],
          section: 'training'
        },
        {
          id: 'training_date',
          name: 'trainingDate',
          type: 'date',
          label: 'Training Completion Date',
          required: true,
          section: 'training'
        },
        {
          id: 'trainer_name',
          name: 'trainerName',
          type: 'text',
          label: 'Trainer Name',
          required: true,
          section: 'training'
        },
        {
          id: 'quiz_score',
          name: 'quizScore',
          type: 'number',
          label: 'Quiz Score (%)',
          required: true,
          validation: { min: 0, max: 100 },
          section: 'assessment'
        },
        {
          id: 'understanding_confirmation',
          name: 'understandingConfirmation',
          type: 'checkbox',
          label: 'I understand and will follow all safety procedures covered in this training',
          required: true,
          section: 'acknowledgment'
        },
        {
          id: 'employee_signature',
          name: 'employeeSignature',
          type: 'signature',
          label: 'Employee Signature',
          required: true,
          section: 'signatures'
        },
        {
          id: 'supervisor_signature',
          name: 'supervisorSignature',
          type: 'signature',
          label: 'Supervisor Signature',
          required: true,
          section: 'signatures'
        }
      ],
      sections: [
        {
          id: 'employee_info',
          title: 'Employee Information',
          fieldIds: ['employee_name', 'employee_id', 'department']
        },
        {
          id: 'training',
          title: 'Training Details',
          fieldIds: ['training_modules', 'training_date', 'trainer_name']
        },
        {
          id: 'assessment',
          title: 'Assessment Results',
          fieldIds: ['quiz_score']
        },
        {
          id: 'acknowledgment',
          title: 'Acknowledgment',
          fieldIds: ['understanding_confirmation']
        },
        {
          id: 'signatures',
          title: 'Signatures',
          fieldIds: ['employee_signature', 'supervisor_signature']
        }
      ],
      expirationDays: 365
    };
  }

  private createCannabisLicenseForm(): FormTemplate {
    return {
      id: 'cannabis-license-application-2024',
      name: 'Cannabis License Application',
      category: 'cannabis',
      description: 'State cannabis cultivation/processing license application',
      version: '2024',
      lastUpdated: new Date(),
      tags: ['cannabis', 'license', 'state', 'compliance'],
      fields: [
        {
          id: 'license_type',
          name: 'licenseType',
          type: 'select',
          label: 'License Type',
          required: true,
          options: [
            'Cultivation - Indoor',
            'Cultivation - Outdoor',
            'Cultivation - Mixed',
            'Manufacturing',
            'Processing',
            'Distribution',
            'Testing Laboratory',
            'Retail'
          ],
          section: 'license_info'
        },
        {
          id: 'business_name',
          name: 'businessName',
          type: 'text',
          label: 'Business/DBA Name',
          required: true,
          section: 'business_info'
        },
        {
          id: 'business_structure',
          name: 'businessStructure',
          type: 'select',
          label: 'Business Structure',
          required: true,
          options: ['Sole Proprietorship', 'Partnership', 'LLC', 'Corporation', 'Other'],
          section: 'business_info'
        },
        {
          id: 'ein',
          name: 'ein',
          type: 'text',
          label: 'Federal EIN',
          required: true,
          validation: { pattern: '^\\d{2}-\\d{7}$' },
          section: 'business_info'
        },
        {
          id: 'facility_address',
          name: 'facilityAddress',
          type: 'textarea',
          label: 'Facility Address',
          required: true,
          section: 'facility_info'
        },
        {
          id: 'facility_size',
          name: 'facilitySize',
          type: 'number',
          label: 'Facility Size (sq ft)',
          required: true,
          section: 'facility_info'
        },
        {
          id: 'security_plan',
          name: 'securityPlan',
          type: 'file',
          label: 'Security Plan Document',
          required: true,
          section: 'documentation'
        },
        {
          id: 'operating_procedures',
          name: 'operatingProcedures',
          type: 'file',
          label: 'Standard Operating Procedures',
          required: true,
          section: 'documentation'
        },
        {
          id: 'financial_statements',
          name: 'financialStatements',
          type: 'file',
          label: 'Financial Statements',
          required: true,
          section: 'documentation'
        },
        {
          id: 'background_check_consent',
          name: 'backgroundCheckConsent',
          type: 'checkbox',
          label: 'I consent to background check and fingerprinting',
          required: true,
          section: 'consent'
        },
        {
          id: 'compliance_acknowledgment',
          name: 'complianceAcknowledment',
          type: 'checkbox',
          label: 'I acknowledge compliance with all state and local cannabis regulations',
          required: true,
          section: 'consent'
        }
      ],
      sections: [
        {
          id: 'license_info',
          title: 'License Information',
          fieldIds: ['license_type']
        },
        {
          id: 'business_info',
          title: 'Business Information',
          fieldIds: ['business_name', 'business_structure', 'ein']
        },
        {
          id: 'facility_info',
          title: 'Facility Information',
          fieldIds: ['facility_address', 'facility_size']
        },
        {
          id: 'documentation',
          title: 'Required Documentation',
          fieldIds: ['security_plan', 'operating_procedures', 'financial_statements']
        },
        {
          id: 'consent',
          title: 'Consent & Acknowledgment',
          fieldIds: ['background_check_consent', 'compliance_acknowledgment']
        }
      ]
    };
  }

  // Additional form creation methods would continue here...
  private create1099Form(): FormTemplate { /* Implementation */ return {} as FormTemplate; }
  private createEmploymentAgreementForm(): FormTemplate { /* Implementation */ return {} as FormTemplate; }
  private createContractorAgreementForm(): FormTemplate { /* Implementation */ return {} as FormTemplate; }
  private createNonCompeteForm(): FormTemplate { /* Implementation */ return {} as FormTemplate; }
  private createI9Form(): FormTemplate { /* Implementation */ return {} as FormTemplate; }
  private createIncidentReportForm(): FormTemplate { /* Implementation */ return {} as FormTemplate; }
  private createWorkersCompForm(): FormTemplate { /* Implementation */ return {} as FormTemplate; }
  private createDrugTestConsentForm(): FormTemplate { /* Implementation */ return {} as FormTemplate; }
  private createStateComplianceForm(): FormTemplate { /* Implementation */ return {} as FormTemplate; }
  private createInventoryTrackingForm(): FormTemplate { /* Implementation */ return {} as FormTemplate; }
  private createLabTestingForm(): FormTemplate { /* Implementation */ return {} as FormTemplate; }
  private createVendorApplicationForm(): FormTemplate { /* Implementation */ return {} as FormTemplate; }
  private createCustomerOnboardingForm(): FormTemplate { /* Implementation */ return {} as FormTemplate; }
  private createInsuranceClaimForm(): FormTemplate { /* Implementation */ return {} as FormTemplate; }
  private createMaintenanceRequestForm(): FormTemplate { /* Implementation */ return {} as FormTemplate; }

  // Public API methods
  public addTemplate(template: FormTemplate): void {
    this.templates.set(template.id, template);
  }

  public getTemplate(id: string): FormTemplate | undefined {
    return this.templates.get(id);
  }

  public getAllTemplates(): FormTemplate[] {
    return Array.from(this.templates.values());
  }

  public getTemplatesByCategory(category: FormTemplate['category']): FormTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }

  public searchTemplates(query: string): FormTemplate[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.templates.values()).filter(template =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  public getRequiredForms(): FormTemplate[] {
    return Array.from(this.templates.values()).filter(template =>
      template.tags.includes('required')
    );
  }

  public getExpiringForms(days: number = 30): FormTemplate[] {
    return Array.from(this.templates.values()).filter(template =>
      template.expirationDays && template.expirationDays <= days
    );
  }
}