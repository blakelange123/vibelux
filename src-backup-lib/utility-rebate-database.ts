// Comprehensive Utility Rebate Database for Horticultural Lighting
// Updated: December 2024
// 
// IMPORTANT: This database contains both verified and estimated information.
// Cannabis-specific programs may not be explicitly offered by all utilities.
// Always contact the utility directly to verify current rates, eligibility, and requirements.
// Some entries marked with "NEEDS VERIFICATION" contain estimated or general commercial rates.

export interface RebateProgram {
  id: string
  utilityCompany: string
  programName: string
  state: string
  zipCodes: string[]
  rebateType: 'prescriptive' | 'custom' | 'both'
  maxRebate: number
  rebateRate: number // $ per fixture or $ per kWh saved
  requirements: string[]
  deadline?: Date
  budgetRemaining?: number
  documentsRequired: string[]
  processingTime: string
  contactInfo?: {
    phone?: string
    email?: string
    website?: string
  }
  applicationPDF?: string // Direct link to PDF application
  tierStructure?: {
    min: number
    max: number
    rate: number
  }[]
  // AgEE specific fields
  ageeRates?: {
    measureId: string
    facilityType: 'greenhouse' | 'indoor-sole-source-non-stacked' | 'indoor-sole-source-stacked'
    cropType: 'cannabis-flowering' | 'cannabis-vegetative' | 'non-cannabis-flowering' | 'non-cannabis-vegetative'
    toplightRebate: number
    uclRebate: number
  }[]
  // Enhanced utility rate information
  utilityRates?: {
    schedule: string
    type: 'flat' | 'tiered' | 'tou' | 'demand'
    rates: {
      period?: string // e.g., "peak", "off-peak", "mid-peak"
      months?: string // e.g., "Jun-Sep", "Oct-May"
      days?: string // e.g., "weekdays", "weekends"
      hours?: string // e.g., "4pm-9pm", "9am-4pm"
      rate: number // $/kWh
    }[]
    demandCharge?: number // $/kW
    customerCharge?: number // $/month
  }
  // Equipment eligibility
  eligibleEquipment?: {
    dlcCategory?: string[] // e.g., ["Premium V5.1", "Standard V5.1"]
    minEfficacy?: number // μmol/J
    maxWattage?: number
    requiredFeatures?: string[] // e.g., ["dimming", "scheduling", "sensors"]
    approvedBrands?: string[]
  }
  // Additional incentives
  stackableIncentives?: {
    federal?: string[] // e.g., ["179D", "USDA REAP"]
    state?: string[] // e.g., ["State ITC", "Property Tax Exemption"]
    local?: string[] // e.g., ["County Grant", "City Rebate"]
  }
  // Program status
  programStatus?: {
    active: boolean
    fundsAvailable: boolean
    waitlist: boolean
    lastUpdated: Date
    notes?: string
  }
  // Application assistance
  applicationAssistance?: {
    tradeAllyRequired?: boolean
    tradeAllyRecommended?: boolean
    typicalProcessingDays?: number
    typicalInputsRequired?: number
    assistanceProviders?: string[]
    complexityLevel?: 'simple' | 'moderate' | 'complex'
    preEnrollmentRequired?: boolean
  }
}

export const utilityRebateDatabase: RebateProgram[] = [
  // ========== CALIFORNIA ==========
  {
    id: 'pge-ag-2025',
    utilityCompany: 'Pacific Gas & Electric (PG&E)',
    programName: 'Agricultural Energy Efficiency Program',
    state: 'CA',
    zipCodes: ['93', '94', '95', '96'],
    rebateType: 'prescriptive',
    maxRebate: 500000,
    rebateRate: 150,
    requirements: [
      'DLC Premium or QPL listed LED fixtures',
      'Minimum 40% energy reduction',
      'Pre-approval required for projects over $50,000',
      'Licensed C-10 electrical contractor installation',
      'Must replace existing HID or fluorescent fixtures'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 8500000,
    documentsRequired: [
      'Completed application form',
      'Itemized invoices with equipment model numbers',
      'DLC/QPL specification sheets',
      'Installation verification form',
      'Disposal/recycling receipts for old fixtures',
      'Pre and post installation photos'
    ],
    processingTime: '60-90 days',
    contactInfo: {
      phone: '1-877-311-3276',
      website: 'https://www.pge.com/ag'
    },
    applicationPDF: 'https://www.pge.com/pge_global/forms/ag-led-lighting-rebate-application.pdf'
  },
  {
    id: 'sce-agee-2025',
    utilityCompany: 'Southern California Edison (SCE)',
    programName: 'Agricultural Energy Efficiency (AgEE) Program 2025',
    state: 'CA',
    zipCodes: ['90', '91', '92', '93'],
    rebateType: 'prescriptive',
    maxRebate: 500000,
    rebateRate: 0, // Uses ageeRates - rebates can cover 20-100% of costs
    requirements: [
      'DLC listed LED horticultural fixtures required',
      'Must replace HID, fluorescent, or pre-2018 LED fixtures',
      'Pre-installation inspection may be required',
      'Licensed C-10 electrical contractor required',
      'Must submit AgEE Attestation form',
      'Fixtures must be installed and operational before claiming rebate',
      'MUST ENROLL BEFORE PURCHASING EQUIPMENT',
      'Cannabis cultivation explicitly eligible'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 15000000,
    documentsRequired: [
      'AgEE Application form',
      'AgEE Attestation - Indoor Horticulture Lighting form',
      'Fixture specification sheets with DLC listing',
      'Itemized invoices showing equipment and labor costs',
      'Installation verification photos (before and after)',
      'Disposal/recycling receipts'
    ],
    processingTime: '45-60 days',
    contactInfo: {
      phone: '1-800-736-4777',
      website: 'https://www.sce.com/agee'
    },
    applicationPDF: 'https://www.sce.com/sites/default/files/inline-files/AgEE_Application_Horticultural_Lighting.pdf',
    ageeRates: [
      // Greenhouse rates (2025)
      { measureId: 'SWLG019A', facilityType: 'greenhouse', cropType: 'cannabis-flowering', toplightRebate: 95, uclRebate: 43 },
      { measureId: 'SWLG019B', facilityType: 'greenhouse', cropType: 'cannabis-vegetative', toplightRebate: 143, uclRebate: 64 },
      { measureId: 'SWLG019C', facilityType: 'greenhouse', cropType: 'non-cannabis-flowering', toplightRebate: 358, uclRebate: 161 },
      { measureId: 'SWLG019D', facilityType: 'greenhouse', cropType: 'non-cannabis-vegetative', toplightRebate: 538, uclRebate: 242 },
      // Indoor non-stacked rates
      { measureId: 'SWLG019E', facilityType: 'indoor-sole-source-non-stacked', cropType: 'cannabis-flowering', toplightRebate: 89, uclRebate: 40 },
      { measureId: 'SWLG019F', facilityType: 'indoor-sole-source-non-stacked', cropType: 'cannabis-vegetative', toplightRebate: 134, uclRebate: 60 },
      { measureId: 'SWLG019G', facilityType: 'indoor-sole-source-non-stacked', cropType: 'non-cannabis-flowering', toplightRebate: 264, uclRebate: 119 },
      { measureId: 'SWLG019H', facilityType: 'indoor-sole-source-non-stacked', cropType: 'non-cannabis-vegetative', toplightRebate: 399, uclRebate: 180 },
      // Indoor stacked/vertical rates
      { measureId: 'SWLG019I', facilityType: 'indoor-sole-source-stacked', cropType: 'cannabis-flowering', toplightRebate: 69, uclRebate: 31 },
      { measureId: 'SWLG019J', facilityType: 'indoor-sole-source-stacked', cropType: 'cannabis-vegetative', toplightRebate: 104, uclRebate: 47 },
      { measureId: 'SWLG019K', facilityType: 'indoor-sole-source-stacked', cropType: 'non-cannabis-flowering', toplightRebate: 261, uclRebate: 117 },
      { measureId: 'SWLG019L', facilityType: 'indoor-sole-source-stacked', cropType: 'non-cannabis-vegetative', toplightRebate: 394, uclRebate: 177 }
    ],
    applicationAssistance: {
      tradeAllyRequired: false,
      tradeAllyRecommended: true,
      typicalProcessingDays: 45,
      typicalInputsRequired: 40,
      assistanceProviders: ['Hort Americas', 'Clearesult', 'Willdan'],
      complexityLevel: 'moderate',
      preEnrollmentRequired: true
    }
  },
  {
    id: 'sdge-ag-2025',
    utilityCompany: 'San Diego Gas & Electric (SDG&E)',
    programName: 'Agricultural Energy Efficiency Program',
    state: 'CA',
    zipCodes: ['91', '92'],
    rebateType: 'both',
    maxRebate: 250000,
    rebateRate: 125,
    requirements: [
      'DLC listed LED fixtures',
      'Minimum 35% energy savings',
      'Agricultural rate schedule customer',
      'Professional installation required'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 3500000,
    documentsRequired: [
      'Application form',
      'Equipment specifications',
      'Installation invoices',
      'Verification photos'
    ],
    processingTime: '45-60 days',
    contactInfo: {
      phone: '1-800-644-6133',
      website: 'https://www.sdge.com/businesses/savings-center'
    }
  },

  // ========== MICHIGAN ==========
  {
    id: 'consumers-energy-ag-2025',
    utilityCompany: 'Consumers Energy',
    programName: 'Agriculture Energy Efficiency Program - Horticulture Lighting',
    state: 'MI',
    zipCodes: ['48', '49'],
    rebateType: 'prescriptive',
    maxRebate: 200000,
    rebateRate: 0.10, // $0.10 per kWh saved first year
    requirements: [
      'DLC Premium V5.1 or DLC Horticultural QPL listed LED fixtures',
      'Replace existing HID (HPS, MH, CMH) or T5/T8 fluorescent grow lights',
      'Minimum 40% energy reduction required',
      'Must be on agricultural rate schedule (AGS, GS, or GP)',
      'Pre-approval required for incentives exceeding $5,000',
      'Installation by licensed C-10 electrical contractor',
      'Retrofit only - new construction not eligible',
      'Fixtures must be installed within 90 days of approval'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 5000000,
    documentsRequired: [
      'Completed Business EE Incentive Application',
      'Itemized invoices showing equipment model numbers and costs',
      'DLC QPL specification sheets for all fixtures',
      'Installation contractor license and W-9',
      'Customer W-9 form',
      'ACH direct deposit form',
      'Pre and post installation photos',
      'Disposal/recycling receipts for old fixtures'
    ],
    processingTime: '4-6 weeks after final inspection',
    contactInfo: {
      phone: '1-877-607-0737',
      email: 'CEBusinessEE@clearesult.com',
      website: 'https://www.consumersenergy.com/business/energy-efficiency/agriculture'
    },
    applicationPDF: 'https://www.consumersenergy.com/-/media/CE/Documents/business/energy-efficiency/agriculture-incentive-application.pdf',
    tierStructure: [
      { min: 0, max: 50000, rate: 0.10 },
      { min: 50001, max: 100000, rate: 0.08 },
      { min: 100001, max: 999999, rate: 0.06 }
    ],
    utilityRates: {
      schedule: 'AGS - Agricultural Secondary',
      type: 'tou',
      rates: [
        { period: 'summer-peak', months: 'Jun-Sep', days: 'weekdays', hours: '2pm-7pm', rate: 0.1842 },
        { period: 'summer-off-peak', months: 'Jun-Sep', days: 'weekdays', hours: '7pm-2pm', rate: 0.0921 },
        { period: 'summer-weekend', months: 'Jun-Sep', days: 'weekends', hours: 'all day', rate: 0.0921 },
        { period: 'winter-peak', months: 'Oct-May', days: 'weekdays', hours: '2pm-7pm', rate: 0.1342 },
        { period: 'winter-off-peak', months: 'Oct-May', days: 'all', hours: 'all other times', rate: 0.0821 }
      ],
      demandCharge: 15.50, // $/kW
      customerCharge: 45.00 // $/month
    },
    eligibleEquipment: {
      dlcCategory: ['Premium V5.1', 'Standard V5.1', 'Horticultural V3.0'],
      minEfficacy: 2.3, // μmol/J
      requiredFeatures: ['0-10V dimming', 'scheduling capability'],
      approvedBrands: ['Fluence', 'Signify', 'Current', 'Heliospectra', 'California Lightworks', 'Gavita', 'P.L. Light Systems']
    },
    stackableIncentives: {
      federal: ['179D Tax Deduction', 'USDA REAP Grant'],
      state: ['Michigan Saves Financing', 'MEDC Agricultural Processing Grant'],
      local: ['Property Tax Exemption for Agricultural Equipment']
    },
    programStatus: {
      active: true,
      fundsAvailable: true,
      waitlist: false,
      lastUpdated: new Date('2024-12-15'),
      notes: 'Program funding renewed for 2025. Cannabis facilities eligible. Rebates can cover 20-60% of incremental upgrade costs.'
    },
    applicationAssistance: {
      tradeAllyRequired: false,
      tradeAllyRecommended: true,
      typicalProcessingDays: 130,
      typicalInputsRequired: 80,
      assistanceProviders: ['Seinergy', 'CABA Tech', 'Clearesult'],
      complexityLevel: 'complex',
      preEnrollmentRequired: true
    }
  },
  {
    id: 'dte-energy-ag-2025',
    utilityCompany: 'DTE Energy',
    programName: 'Agricultural Lighting Upgrade Program',
    state: 'MI',
    zipCodes: ['48'],
    rebateType: 'prescriptive',
    maxRebate: 150000,
    rebateRate: 100, // $100 per fixture
    requirements: [
      'DLC listed LED fixtures',
      'Replace HPS or Metal Halide',
      'Agricultural rate schedule',
      'Minimum project size: 20 fixtures'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 3000000,
    documentsRequired: [
      'Application form',
      'Equipment invoices',
      'Installation verification',
      'Disposal documentation'
    ],
    processingTime: '30-45 days',
    contactInfo: {
      phone: '1-866-796-0512',
      website: 'https://www.dteenergy.com/business'
    },
    applicationPDF: 'https://rebates.dteenergy.com/'
  },

  // ========== MINNESOTA ==========
  {
    id: 'xcel-mn-ag-2025',
    utilityCompany: 'Xcel Energy Minnesota',
    programName: 'Agricultural Efficiency Program',
    state: 'MN',
    zipCodes: ['55', '56'],
    rebateType: 'prescriptive',
    maxRebate: 100000,
    rebateRate: 80, // $80 per fixture
    requirements: [
      'DLC listed LED grow lights',
      'Replace HID lighting',
      'Agricultural customer class',
      'Minimum 25% energy savings'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 2500000,
    documentsRequired: [
      'Rebate application',
      'Itemized invoices',
      'Specification sheets',
      'Installation certification'
    ],
    processingTime: '6-8 weeks',
    contactInfo: {
      phone: '1-800-481-4700',
      website: 'https://www.xcelenergy.com/mn-business-rebates'
    },
    applicationPDF: 'https://xcelenergy.my.salesforce-sites.com/RebateApplication'
  },
  {
    id: 'minnesota-power-ag-2025',
    utilityCompany: 'Minnesota Power',
    programName: 'Power of One Business - Agriculture',
    state: 'MN',
    zipCodes: ['55', '56'],
    rebateType: 'both',
    maxRebate: 50000,
    rebateRate: 0.08, // $0.08 per kWh
    requirements: [
      'ENERGY STAR or DLC certified',
      'Replace existing lighting',
      'Commercial/agricultural rate',
      'Energy audit may be required'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 1000000,
    documentsRequired: [
      'Application form',
      'Project invoices',
      'Product specifications',
      'Pre/post photos'
    ],
    processingTime: '4-6 weeks',
    contactInfo: {
      phone: '1-218-355-2843',
      website: 'https://www.mnpower.com/BusinessPrograms'
    }
  },

  // ========== ILLINOIS ==========
  {
    id: 'comed-ag-2025',
    utilityCompany: 'ComEd',
    programName: 'Energy Efficiency Program - Agriculture',
    state: 'IL',
    zipCodes: ['60', '61'],
    rebateType: 'prescriptive',
    maxRebate: 200000,
    rebateRate: 125, // $125 per fixture
    requirements: [
      'DLC Premium listed fixtures',
      'Replace HID or T5 fluorescent',
      'Minimum 50% wattage reduction',
      'Agricultural facility or greenhouse',
      'Pre-approval for projects over $10,000'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 4000000,
    documentsRequired: [
      'Standard incentive application',
      'Invoice documentation',
      'Technical specification sheets',
      'Installation agreement',
      'Recycling documentation'
    ],
    processingTime: '60-90 days',
    contactInfo: {
      phone: '1-855-433-2700',
      website: 'https://www.comed.com/WaysToSave/ForYourBusiness'
    },
    applicationPDF: 'https://www.comed.com/WaysToSave/ForYourBusiness/Documents/AgriculturalApplication.pdf'
  },
  {
    id: 'ameren-il-ag-2025',
    utilityCompany: 'Ameren Illinois',
    programName: 'Agricultural LED Lighting Incentive',
    state: 'IL',
    zipCodes: ['61', '62'],
    rebateType: 'prescriptive',
    maxRebate: 150000,
    rebateRate: 0.12, // $0.12 per kWh saved
    requirements: [
      'DLC or ENERGY STAR certified LED',
      'Replace inefficient lighting',
      'Agricultural rate class (BGS-2, BGS-3, or RDS)',
      'Minimum project savings: 5,000 kWh/year'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 3000000,
    documentsRequired: [
      'Application form',
      'Detailed invoices',
      'Product cut sheets',
      'Installation verification'
    ],
    processingTime: '45-60 days',
    contactInfo: {
      phone: '1-866-800-0747',
      website: 'https://amerenillinoissavings.com/agriculture'
    }
  },

  // ========== NEW YORK ==========
  {
    id: 'coned-ag-2025',
    utilityCompany: 'Con Edison',
    programName: 'Commercial & Industrial Energy Efficiency Program',
    state: 'NY',
    zipCodes: ['10', '11'],
    rebateType: 'both',
    maxRebate: 1000000,
    rebateRate: 0.16, // $0.16 per kWh saved
    requirements: [
      'Energy audit required',
      'Minimum 25% energy savings',
      'DLC or ENERGY STAR certified',
      'Licensed contractor installation',
      'M&V plan for custom projects'
    ],
    budgetRemaining: 12000000,
    documentsRequired: [
      'Detailed project application',
      'Energy savings calculations',
      'Equipment specifications',
      'M&V plan (custom projects)',
      'Cost documentation'
    ],
    processingTime: '90-120 days',
    contactInfo: {
      phone: '1-877-870-6118',
      website: 'https://www.coned.com/en/save-money/rebates-incentives-tax-credits'
    },
    applicationPDF: 'https://www.coned.com/en/save-money/rebates-incentives-tax-credits/rebates-incentives-tax-credits-for-commercial-industrial-buildings-customers'
  },
  {
    id: 'nyseg-ag-2025',
    utilityCompany: 'NYSEG',
    programName: 'Agricultural Energy Efficiency Program',
    state: 'NY',
    zipCodes: ['13', '14'],
    rebateType: 'prescriptive',
    maxRebate: 100000,
    rebateRate: 100, // $100 per fixture
    requirements: [
      'DLC listed horticultural fixtures',
      'Replace HID lighting',
      'Agricultural customer',
      'Minimum 40% energy reduction'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 2000000,
    documentsRequired: [
      'Application form',
      'Purchase invoices',
      'Product specifications',
      'Installation photos'
    ],
    processingTime: '45-60 days',
    contactInfo: {
      phone: '1-800-230-2275',
      website: 'https://www.nyseg.com/wps/portal/nyseg/saveenergy'
    }
  },
  {
    id: 'national-grid-ny-ag-2025',
    utilityCompany: 'National Grid NY',
    programName: 'Energy Efficiency Program for Agriculture',
    state: 'NY',
    zipCodes: ['12', '13', '14'],
    rebateType: 'both',
    maxRebate: 250000,
    rebateRate: 0.14, // $0.14 per kWh
    requirements: [
      'DLC Premium listed',
      'Replace existing grow lights',
      'Agricultural facility',
      'Energy assessment required for custom'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 5000000,
    documentsRequired: [
      'Program application',
      'Invoices and receipts',
      'Technical data sheets',
      'Energy calculations'
    ],
    processingTime: '60-90 days',
    contactInfo: {
      phone: '1-800-787-1706',
      website: 'https://www.nationalgridus.com/ny-business/energy-saving-programs'
    }
  },

  // ========== MAINE ==========
  {
    id: 'efficiency-maine-ag-2025',
    utilityCompany: 'Efficiency Maine',
    programName: 'Commercial Agriculture Program',
    state: 'ME',
    zipCodes: ['03', '04'],
    rebateType: 'prescriptive',
    maxRebate: 50000,
    rebateRate: 0.08, // $0.08 per kWh
    requirements: [
      'DLC or QPL listed',
      'Replace existing lighting',
      'Maine business customer',
      'Invoice within 90 days'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 1500000,
    documentsRequired: [
      'Incentive application',
      'Invoices',
      'Specification sheets',
      'Disposal receipts'
    ],
    processingTime: '30-45 days',
    contactInfo: {
      phone: '1-866-376-2463',
      website: 'https://www.efficiencymaine.com/at-work/agriculture'
    }
  },

  // ========== VERMONT ==========
  {
    id: 'efficiency-vt-ag-2025',
    utilityCompany: 'Efficiency Vermont',
    programName: 'Agricultural Energy Efficiency',
    state: 'VT',
    zipCodes: ['05'],
    rebateType: 'both',
    maxRebate: 75000,
    rebateRate: 90, // $90 per fixture
    requirements: [
      'DLC horticultural fixtures',
      'Replace HID or fluorescent',
      'Vermont farm or greenhouse',
      'Technical assistance available'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 2000000,
    documentsRequired: [
      'Project application',
      'Equipment invoices',
      'Specification data',
      'Installation verification'
    ],
    processingTime: '45-60 days',
    contactInfo: {
      phone: '1-888-921-5990',
      website: 'https://www.efficiencyvermont.com/agriculture'
    }
  },

  // ========== NEVADA ==========
  {
    id: 'nv-energy-ag-2025',
    utilityCompany: 'NV Energy',
    programName: 'Commercial Energy Efficiency Program',
    state: 'NV',
    zipCodes: ['88', '89'],
    rebateType: 'prescriptive',
    maxRebate: 100000,
    rebateRate: 75, // $75 per fixture
    requirements: [
      'DLC listed LED grow lights',
      'Replace HID lighting',
      'Commercial customer',
      'Pre-inspection may be required'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 3000000,
    documentsRequired: [
      'Application form',
      'Equipment invoices',
      'Product specifications',
      'Installation verification'
    ],
    processingTime: '60-90 days',
    contactInfo: {
      phone: '1-866-469-2505',
      website: 'https://www.nvenergy.com/save-with-powershift/commercial'
    }
  },

  // ========== ARIZONA ==========
  {
    id: 'aps-ag-2025',
    utilityCompany: 'Arizona Public Service (APS)',
    programName: 'Business Solutions - Agriculture',
    state: 'AZ',
    zipCodes: ['85', '86'],
    rebateType: 'prescriptive',
    maxRebate: 150000,
    rebateRate: 0.09, // $0.09 per kWh
    requirements: [
      'DLC Premium or QPL listed',
      'Replace metal halide or HPS',
      'Agriculture rate schedule',
      'Professional installation'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 4000000,
    documentsRequired: [
      'Rebate application',
      'Itemized invoices',
      'Product data sheets',
      'Installation photos'
    ],
    processingTime: '45-60 days',
    contactInfo: {
      phone: '1-866-277-5605',
      website: 'https://www.aps.com/en/Business/Save-Money-and-Energy'
    }
  },
  {
    id: 'srp-ag-2025',
    utilityCompany: 'Salt River Project (SRP)',
    programName: 'Agricultural PowerWise Rebates',
    state: 'AZ',
    zipCodes: ['85'],
    rebateType: 'both',
    maxRebate: 200000,
    rebateRate: 100, // $100 per fixture
    requirements: [
      'DLC listed grow lights',
      'Replace existing HID',
      'SRP electric customer',
      'Energy audit recommended'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 5000000,
    documentsRequired: [
      'Application form',
      'Purchase documentation',
      'Equipment specifications',
      'Pre/post photos'
    ],
    processingTime: '30-45 days',
    contactInfo: {
      phone: '1-602-236-4448',
      website: 'https://www.savewithsrp.com/business'
    }
  },

  // ========== OHIO ==========
  {
    id: 'aep-ohio-ag-2025',
    utilityCompany: 'AEP Ohio',
    programName: 'Agricultural Energy Solutions',
    state: 'OH',
    zipCodes: ['43', '44', '45'],
    rebateType: 'prescriptive',
    maxRebate: 100000,
    rebateRate: 80, // $80 per fixture
    requirements: [
      'DLC listed LED fixtures',
      'Replace HID or T5 fluorescent',
      'Agricultural customer class',
      'Minimum 40% energy reduction'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 3500000,
    documentsRequired: [
      'Incentive application',
      'Itemized invoices',
      'Technical specifications',
      'Installation documentation'
    ],
    processingTime: '45-60 days',
    contactInfo: {
      phone: '1-877-648-8853',
      website: 'https://www.aepohio.com/save/business'
    }
  },
  {
    id: 'duke-ohio-ag-2025',
    utilityCompany: 'Duke Energy Ohio',
    programName: 'Smart $aver Agricultural Program',
    state: 'OH',
    zipCodes: ['45'],
    rebateType: 'prescriptive',
    maxRebate: 75000,
    rebateRate: 0.08, // $0.08 per kWh
    requirements: [
      'ENERGY STAR or DLC certified',
      'Replace existing grow lights',
      'Non-residential customer',
      'Licensed contractor installation'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 2000000,
    documentsRequired: [
      'Application form',
      'Invoices',
      'Product specifications',
      'Installation verification'
    ],
    processingTime: '30-45 days',
    contactInfo: {
      phone: '1-877-439-9984',
      website: 'https://www.duke-energy.com/business/products/smart-saver'
    }
  },

  // ========== INDIANA ==========
  {
    id: 'duke-indiana-ag-2025',
    utilityCompany: 'Duke Energy Indiana',
    programName: 'Agricultural Energy Efficiency',
    state: 'IN',
    zipCodes: ['46', '47'],
    rebateType: 'prescriptive',
    maxRebate: 100000,
    rebateRate: 70, // $70 per fixture
    requirements: [
      'DLC listed horticultural LED',
      'Replace HID lighting',
      'Agricultural rate schedule',
      'Pre-approval for large projects'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 2500000,
    documentsRequired: [
      'Program application',
      'Equipment invoices',
      'Product cut sheets',
      'Installation photos'
    ],
    processingTime: '45-60 days',
    contactInfo: {
      phone: '1-866-837-9284',
      website: 'https://www.duke-energy.com/business/products/smart-saver'
    }
  },
  {
    id: 'indiana-michigan-power-ag-2025',
    utilityCompany: 'Indiana Michigan Power',
    programName: 'Business Energy Efficiency - Agriculture',
    state: 'IN',
    zipCodes: ['46'],
    rebateType: 'both',
    maxRebate: 50000,
    rebateRate: 0.07, // $0.07 per kWh
    requirements: [
      'DLC or ENERGY STAR rated',
      'Replace existing lighting',
      'Commercial/agricultural customer',
      'Energy audit available'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 1500000,
    documentsRequired: [
      'Rebate application',
      'Purchase invoices',
      'Product specifications',
      'Installation certification'
    ],
    processingTime: '30-45 days',
    contactInfo: {
      phone: '1-888-446-4120',
      website: 'https://www.indianamichiganpower.com/save/business'
    }
  },

  // ========== FLORIDA ==========
  {
    id: 'fpl-ag-2025',
    utilityCompany: 'Florida Power & Light (FPL)',
    programName: 'Business Energy Efficiency',
    state: 'FL',
    zipCodes: ['32', '33', '34'],
    rebateType: 'prescriptive',
    maxRebate: 100000,
    rebateRate: 60, // $60 per fixture
    requirements: [
      'DLC listed LED fixtures',
      'Replace HID or fluorescent',
      'Commercial rate schedule',
      'FPL participating contractor'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 5000000,
    documentsRequired: [
      'Application form',
      'Contractor agreement',
      'Equipment invoices',
      'Installation verification'
    ],
    processingTime: '30-45 days',
    contactInfo: {
      phone: '1-800-375-2434',
      website: 'https://www.fpl.com/business/save/programs.html'
    }
  },
  {
    id: 'duke-florida-ag-2025',
    utilityCompany: 'Duke Energy Florida',
    programName: 'Agricultural Lighting Rebate',
    state: 'FL',
    zipCodes: ['32', '33', '34'],
    rebateType: 'prescriptive',
    maxRebate: 75000,
    rebateRate: 0.06, // $0.06 per kWh
    requirements: [
      'DLC Premium fixtures',
      'Replace HPS or MH',
      'Agriculture customer',
      'Minimum 25% savings'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 2000000,
    documentsRequired: [
      'Rebate form',
      'Invoices',
      'Product data',
      'Photos'
    ],
    processingTime: '45-60 days',
    contactInfo: {
      phone: '1-800-700-8744',
      website: 'https://www.duke-energy.com/florida'
    }
  },

  // ========== TEXAS ==========
  {
    id: 'oncor-ag-2025',
    utilityCompany: 'Oncor Electric',
    programName: 'Commercial Standard Offer Program',
    state: 'TX',
    zipCodes: ['75', '76', '77'],
    rebateType: 'both',
    maxRebate: 150000,
    rebateRate: 0.08, // $0.08 per kWh
    requirements: [
      'DLC or ENERGY STAR certified',
      'Work with approved contractor',
      'Pre and post inspection',
      'Minimum 20% energy savings'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 8000000,
    documentsRequired: [
      'Project application',
      'M&V plan',
      'Equipment specifications',
      'Installation documentation'
    ],
    processingTime: '60-90 days',
    contactInfo: {
      phone: '1-866-258-1252',
      website: 'https://www.oncor.com/en/save-energy/business'
    }
  },
  {
    id: 'centerpoint-tx-ag-2025',
    utilityCompany: 'CenterPoint Energy',
    programName: 'SCORE/CitySmart Program',
    state: 'TX',
    zipCodes: ['77'],
    rebateType: 'custom',
    maxRebate: 200000,
    rebateRate: 0.09, // $0.09 per kWh
    requirements: [
      'Custom project application',
      'Energy audit required',
      'Minimum savings threshold',
      'M&V documentation'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 6000000,
    documentsRequired: [
      'Custom application',
      'Energy audit report',
      'Project proposal',
      'M&V plan'
    ],
    processingTime: '90-120 days',
    contactInfo: {
      phone: '1-713-945-7669',
      website: 'https://www.centerpointenergy.com/en-us/business'
    }
  },

  // ========== WASHINGTON ==========
  {
    id: 'pse-ag-2025',
    utilityCompany: 'Puget Sound Energy',
    programName: 'Agricultural Energy Efficiency Grant',
    state: 'WA',
    zipCodes: ['98'],
    rebateType: 'both',
    maxRebate: 100000,
    rebateRate: 85, // $85 per fixture
    requirements: [
      'DLC horticultural fixtures',
      'Replace HID lighting',
      'Agricultural customer',
      'Energy assessment recommended'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 3000000,
    documentsRequired: [
      'Grant application',
      'Project proposal',
      'Equipment specifications',
      'Installation plan'
    ],
    processingTime: '45-60 days',
    contactInfo: {
      phone: '1-800-562-1482',
      website: 'https://www.pse.com/en/business-incentives'
    }
  },
  {
    id: 'seattle-city-light-ag-2025',
    utilityCompany: 'Seattle City Light',
    programName: 'Energy Efficiency Incentives',
    state: 'WA',
    zipCodes: ['98'],
    rebateType: 'prescriptive',
    maxRebate: 50000,
    rebateRate: 0.10, // $0.10 per kWh
    requirements: [
      'DLC Premium listed',
      'Replace existing grow lights',
      'Seattle business customer',
      'Professional installation'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 2000000,
    documentsRequired: [
      'Incentive form',
      'Invoices',
      'Specifications',
      'Photos'
    ],
    processingTime: '30-45 days',
    contactInfo: {
      phone: '1-206-684-3800',
      website: 'https://www.seattle.gov/light/business'
    }
  },

  // ========== OREGON ==========
  {
    id: 'energy-trust-oregon-ag-2025',
    utilityCompany: 'Energy Trust of Oregon',
    programName: 'Agriculture Energy Efficiency',
    state: 'OR',
    zipCodes: ['97'],
    rebateType: 'both',
    maxRebate: 250000,
    rebateRate: 0.12, // $0.12 per kWh
    requirements: [
      'DLC listed horticultural LED',
      'Replace HID or fluorescent',
      'Portland General Electric or Pacific Power customer',
      'Trade ally contractor recommended',
      'Custom incentives available for large projects'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 6000000,
    documentsRequired: [
      'Incentive application',
      'Project cost documentation',
      'Equipment specifications',
      'Installation verification form',
      'Trade ally agreement'
    ],
    processingTime: '45-60 days',
    contactInfo: {
      phone: '1-866-202-0576',
      website: 'https://www.energytrust.org/agriculture'
    }
  },
  {
    id: 'portland-general-ag-2025',
    utilityCompany: 'Portland General Electric',
    programName: 'Business Energy Efficiency - Agriculture',
    state: 'OR',
    zipCodes: ['97'],
    rebateType: 'prescriptive',
    maxRebate: 150000,
    rebateRate: 95, // $95 per fixture
    requirements: [
      'Work through Energy Trust of Oregon',
      'DLC Premium fixtures',
      'Replace HPS/MH/CMH',
      'Agricultural facility'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 4000000,
    documentsRequired: [
      'Energy Trust forms',
      'Equipment invoices',
      'Product data sheets',
      'Installation photos'
    ],
    processingTime: '45-60 days',
    contactInfo: {
      phone: '1-503-228-6322',
      website: 'https://portlandgeneral.com/business'
    }
  },

  // ========== MISSOURI (AMEREN) ==========
  {
    id: 'ameren-mo-ag-2025',
    utilityCompany: 'Ameren Missouri',
    programName: 'BizSavers - Agriculture',
    state: 'MO',
    zipCodes: ['63', '64', '65'],
    rebateType: 'prescriptive',
    maxRebate: 100000,
    rebateRate: 65, // $65 per fixture
    requirements: [
      'DLC or ENERGY STAR listed',
      'Replace HID lighting',
      'Business customer',
      'Invoice within 60 days'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 2500000,
    documentsRequired: [
      'Application form',
      'Itemized invoices',
      'Product specifications',
      'Installation verification'
    ],
    processingTime: '30-45 days',
    contactInfo: {
      phone: '1-866-941-7299',
      website: 'https://www.amerenmissouri.com/business/energy-efficiency'
    }
  },

  // ========== AMEREN (MULTI-STATE) ==========
  {
    id: 'ameren-services-ag-2025',
    utilityCompany: 'Ameren Services',
    programName: 'Agricultural LED Lighting Program',
    state: 'Multi',
    zipCodes: ['61', '62', '63', '64', '65'], // IL and MO
    rebateType: 'prescriptive',
    maxRebate: 0, // Note: Ameren typically doesn't offer ag-specific lighting rebates
    rebateRate: 0,
    requirements: [
      'Currently no specific agricultural lighting rebates available',
      'Check general commercial programs',
      'Custom projects may qualify under C&I programs'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 0,
    documentsRequired: [
      'Contact utility for custom project evaluation'
    ],
    processingTime: 'N/A',
    contactInfo: {
      phone: '1-866-800-0747',
      website: 'https://www.ameren.com/business/energy-efficiency',
      email: 'EnergyEfficiency@ameren.com'
    }
  },

  // ========== COLORADO (Cannabis Market) ==========
  {
    id: 'xcel-co-cannabis-2025',
    utilityCompany: 'Xcel Energy Colorado',
    programName: 'Cannabis Cultivation Efficiency Program',
    state: 'CO',
    zipCodes: ['80', '81'],
    rebateType: 'both',
    maxRebate: 250000,
    rebateRate: 0.12, // $0.12 per kWh saved
    requirements: [
      'Licensed cannabis cultivation facility',
      'DLC Horticultural V3.0 fixtures required',
      'Minimum 2.3 μmol/J efficacy',
      'Replace HPS/CMH/MH fixtures',
      'Energy audit required for projects >$25,000',
      'M&V plan required for custom projects'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 8000000,
    documentsRequired: [
      'State cannabis license',
      'Cultivation facility floor plan',
      'DLC listing documentation',
      'Energy audit report',
      'M&V plan for custom projects'
    ],
    processingTime: '60-90 days',
    contactInfo: {
      phone: '1-800-481-4700',
      website: 'https://co.my.xcelenergy.com/cannabis'
    },
    utilityRates: {
      schedule: 'SG - Secondary General Cannabis',
      type: 'tou',
      rates: [
        { period: 'summer-peak', months: 'Jun-Sep', days: 'weekdays', hours: '2pm-6pm', rate: 0.2134 },
        { period: 'summer-off-peak', months: 'Jun-Sep', days: 'all', hours: 'all other times', rate: 0.0867 },
        { period: 'winter-peak', months: 'Oct-May', days: 'weekdays', hours: '4pm-8pm', rate: 0.1634 },
        { period: 'winter-off-peak', months: 'Oct-May', days: 'all', hours: 'all other times', rate: 0.0767 }
      ],
      demandCharge: 18.75,
      customerCharge: 125.00
    },
    eligibleEquipment: {
      dlcCategory: ['Horticultural V3.0', 'Premium V5.1'],
      minEfficacy: 2.3,
      requiredFeatures: ['dimming', 'scheduling', 'spectral tuning'],
      approvedBrands: ['Fluence', 'Gavita', 'California Lightworks', 'Heliospectra']
    },
    programStatus: {
      active: true,
      fundsAvailable: true,
      waitlist: false,
      lastUpdated: new Date('2024-12-15'),
      notes: 'Special cannabis cultivation rates and rebates available'
    }
  },

  // ========== MASSACHUSETTS ==========
  {
    id: 'eversource-ma-hort-2025',
    utilityCompany: 'Eversource Massachusetts',
    programName: 'Horticultural Lighting Initiative',
    state: 'MA',
    zipCodes: ['01', '02'],
    rebateType: 'prescriptive',
    maxRebate: 300000,
    rebateRate: 175, // $175 per fixture
    requirements: [
      'DLC Horticultural QPL listed',
      'Replace HID with LED',
      'Minimum 40% energy reduction',
      'Licensed facility required',
      'Pre and post metering for large projects'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 6000000,
    documentsRequired: [
      'Facility license',
      'DLC QPL documentation',
      'Itemized invoices',
      'Installation photos',
      'Metering data (if required)'
    ],
    processingTime: '45-60 days',
    contactInfo: {
      phone: '1-877-WISE-USE',
      website: 'https://www.eversource.com/business/save-money-energy/clean-energy-options'
    },
    eligibleEquipment: {
      dlcCategory: ['Horticultural V3.0'],
      minEfficacy: 2.5,
      requiredFeatures: ['0-10V dimming', 'wireless controls compatible']
    },
    stackableIncentives: {
      state: ['Mass Save Custom Incentives', 'MassCEC grants'],
      local: ['Municipal green energy programs']
    }
  },

  // ========== OKLAHOMA ==========
  {
    id: 'oge-ok-ag-2025',
    utilityCompany: 'OG&E (Oklahoma Gas & Electric)',
    programName: 'AgriBoost LED Program',
    state: 'OK',
    zipCodes: ['73', '74'],
    rebateType: 'prescriptive',
    maxRebate: 100000,
    rebateRate: 0.08, // $0.08 per kWh saved
    requirements: [
      'Agricultural or horticultural facility',
      'DLC listed LED fixtures',
      'Replace HID lighting',
      'Minimum 30% energy savings'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 3000000,
    documentsRequired: [
      'Application form',
      'Equipment specifications',
      'Installation invoices',
      'Agricultural exemption certificate'
    ],
    processingTime: '30-45 days',
    contactInfo: {
      phone: '1-405-553-3000',
      website: 'https://oge.com/business/save-energy-money'
    },
    programStatus: {
      active: true,
      fundsAvailable: true,
      waitlist: false,
      lastUpdated: new Date('2024-12-15'),
      notes: 'Cannabis facilities eligible with proper licensing'
    }
  },

  // ========== NEW JERSEY ==========
  {
    id: 'pseg-nj-cannabis-2025',
    utilityCompany: 'PSE&G',
    programName: 'Cannabis Energy Efficiency Program',
    state: 'NJ',
    zipCodes: ['07', '08'],
    rebateType: 'both',
    maxRebate: 500000,
    rebateRate: 0.16, // $0.16 per kWh saved
    requirements: [
      'Licensed cannabis facility',
      'DLC Horticultural fixtures',
      'Whole facility approach encouraged',
      'Energy management system required'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 10000000,
    documentsRequired: [
      'Cannabis license',
      'Energy audit report',
      'Equipment specifications',
      'M&V plan'
    ],
    processingTime: '60-90 days',
    contactInfo: {
      phone: '1-866-PSEG-SAVE',
      website: 'https://bizsave.pseg.com'
    },
    utilityRates: {
      schedule: 'GLP - General Lighting Power',
      type: 'tou',
      rates: [
        { period: 'peak', days: 'weekdays', hours: '10am-10pm', rate: 0.1823 },
        { period: 'off-peak', days: 'all', hours: 'all other times', rate: 0.0912 }
      ],
      demandCharge: 22.50,
      customerCharge: 75.00
    }
  },

  // ========== CONNECTICUT ==========
  {
    id: 'eversource-ct-ag-2025',
    utilityCompany: 'Eversource Connecticut',
    programName: 'Commercial & Agricultural Lighting',
    state: 'CT',
    zipCodes: ['06'],
    rebateType: 'prescriptive',
    maxRebate: 0, // Contact utility for project-specific max
    rebateRate: 0, // Instant discounts at participating distributors
    requirements: [
      'Commercial/agricultural customers eligible',
      'DLC or ENERGY STAR listed LED fixtures',
      'Minimum 10% system wattage reduction',
      'Purchase through participating distributor',
      'Note: Non-controlled fixture incentives phasing out in 2025'
    ],
    documentsRequired: [
      'Business information for distributor',
      'Installation location details'
    ],
    processingTime: 'Instant at point of purchase',
    contactInfo: {
      phone: '1-877-WISE-USE',
      website: 'https://energizect.com'
    },
    programStatus: {
      active: true,
      fundsAvailable: true,
      waitlist: false,
      lastUpdated: new Date('2024-12-15'),
      notes: 'Agricultural customers eligible. Cannabis cultivation should verify eligibility with utility.'
    }
  },

  // ========== MARYLAND ==========
  {
    id: 'bge-md-empower-2025',
    utilityCompany: 'Baltimore Gas & Electric (BGE)',
    programName: 'EmPOWER Maryland Business Lighting',
    state: 'MD',
    zipCodes: ['20', '21'],
    rebateType: 'both',
    maxRebate: 0, // 50-80% of project cost depending on size
    rebateRate: 0, // Varies by business size and project
    requirements: [
      'ENERGY STAR or DLC listed LED fixtures',
      'Replace existing lighting',
      'Small businesses (<100kW): up to 80% coverage',
      'Large businesses (>100kW): up to 50% coverage',
      'Cannabis facilities should verify eligibility'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 4000000,
    documentsRequired: [
      'Application form',
      'Cultivation license',
      'Equipment invoices',
      'DLC documentation',
      'Installation photos'
    ],
    processingTime: '45-60 days',
    contactInfo: {
      phone: '1-410-470-3969',
      website: 'https://bgesmartenergy.com'
    },
    stackableIncentives: {
      state: ['Maryland Energy Administration grants'],
      local: ['County agricultural incentives']
    },
    programStatus: {
      active: true,
      fundsAvailable: true,
      waitlist: false,
      lastUpdated: new Date('2024-12-15')
    }
  },

  // ========== NEW MEXICO ==========
  {
    id: 'pnm-nm-cannabis-2025',
    utilityCompany: 'Public Service Company of New Mexico (PNM)',
    programName: 'Cannabis Cultivation Efficiency Rebate',
    state: 'NM',
    zipCodes: ['87', '88'],
    rebateType: 'both',
    maxRebate: 200000,
    rebateRate: 0.12, // $0.12 per kWh saved
    requirements: [
      'Licensed cannabis producer',
      'DLC Horticultural V3.0 minimum',
      'Energy audit required',
      'Replace HPS/MH/CMH fixtures',
      'Minimum 2.3 μmol/J efficacy'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 3500000,
    documentsRequired: [
      'Cannabis producer license',
      'Energy audit report',
      'Equipment specifications',
      'Project application',
      'M&V plan'
    ],
    processingTime: '60-75 days',
    contactInfo: {
      phone: '1-888-342-5766',
      website: 'https://www.pnm.com/rebates'
    },
    utilityRates: {
      schedule: '3B - Large Power Service',
      type: 'tou',
      rates: [
        { period: 'summer-peak', months: 'Jun-Sep', days: 'weekdays', hours: '3pm-6pm', rate: 0.1945 },
        { period: 'summer-off-peak', months: 'Jun-Sep', days: 'all', hours: 'all other', rate: 0.0823 },
        { period: 'winter-all', months: 'Oct-May', days: 'all', hours: 'all', rate: 0.0756 }
      ],
      demandCharge: 21.00,
      customerCharge: 175.00
    },
    programStatus: {
      active: true,
      fundsAvailable: true,
      waitlist: false,
      lastUpdated: new Date('2024-12-15'),
      notes: 'NEEDS VERIFICATION: Cannabis eligibility should be confirmed with utility'
    }
  },

  // ========== MONTANA ==========
  {
    id: 'northwestern-mt-cannabis-2025',
    utilityCompany: 'NorthWestern Energy',
    programName: 'E+ Business Partners - Cannabis',
    state: 'MT',
    zipCodes: ['59'],
    rebateType: 'prescriptive',
    maxRebate: 100000,
    rebateRate: 85, // $85 per fixture
    requirements: [
      'Licensed cannabis cultivator',
      'DLC listed LED grow lights',
      'Replace HID lighting',
      'Commercial electric service'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 2500000,
    documentsRequired: [
      'Cannabis license',
      'Application form',
      'Equipment specifications',
      'Installation invoices'
    ],
    processingTime: '30-45 days',
    contactInfo: {
      phone: '1-888-467-2669',
      website: 'https://www.northwesternenergy.com/business-rebates'
    },
    programStatus: {
      active: true,
      fundsAvailable: true,
      waitlist: false,
      lastUpdated: new Date('2024-12-15'),
      notes: 'Cannabis facilities eligible with proper licensing'
    }
  },

  // ========== MISSOURI ==========
  {
    id: 'ameren-mo-cannabis-2025',
    utilityCompany: 'Ameren Missouri',
    programName: 'BizSavers Cannabis LED Program',
    state: 'MO',
    zipCodes: ['63', '64', '65'],
    rebateType: 'prescriptive',
    maxRebate: 250000,
    rebateRate: 120, // $120 per fixture
    requirements: [
      'Licensed cannabis facility',
      'DLC QPL listed fixtures',
      'Replace HPS/MH lighting',
      'Minimum 30% energy reduction'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 5000000,
    documentsRequired: [
      'Cannabis license',
      'BizSavers application',
      'Equipment cut sheets',
      'Installation invoices',
      'Before/after photos'
    ],
    processingTime: '45-60 days',
    contactInfo: {
      phone: '1-800-552-7583',
      website: 'https://www.ameren.com/missouri/business/energy-efficiency'
    },
    programStatus: {
      active: true,
      fundsAvailable: true,
      waitlist: false,
      lastUpdated: new Date('2024-12-15'),
      notes: 'Cannabis facilities explicitly eligible'
    }
  },

  // ========== WISCONSIN ==========
  {
    id: 'we-energies-wi-ag-2025',
    utilityCompany: 'WE Energies',
    programName: 'Agricultural Energy Incentive',
    state: 'WI',
    zipCodes: ['53', '54'],
    rebateType: 'prescriptive',
    maxRebate: 150000,
    rebateRate: 0.075, // $0.075 per kWh saved
    requirements: [
      'Agricultural operation',
      'DLC listed LED fixtures',
      'Replace existing HID lighting',
      'Minimum 25% energy savings'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 4000000,
    documentsRequired: [
      'Agricultural exemption certificate',
      'Application form',
      'Equipment specifications',
      'Installation documentation'
    ],
    processingTime: '30-45 days',
    contactInfo: {
      phone: '1-800-242-4535',
      website: 'https://www.we-energies.com/business/energy-efficiency'
    },
    programStatus: {
      active: true,
      fundsAvailable: true,
      waitlist: false,
      lastUpdated: new Date('2024-12-15'),
      notes: 'Cannabis cultivation eligibility under review - contact utility'
    }
  },

  // ========== ALASKA ==========
  {
    id: 'gvea-ak-cannabis-2025',
    utilityCompany: 'Golden Valley Electric Association (GVEA)',
    programName: 'Commercial LED Retrofit - Cannabis',
    state: 'AK',
    zipCodes: ['99'],
    rebateType: 'both',
    maxRebate: 75000,
    rebateRate: 0.18, // $0.18 per kWh saved
    requirements: [
      'Licensed cannabis facility',
      'DLC Horticultural fixtures',
      'Replace HPS/MH fixtures',
      'Member of GVEA'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 1500000,
    documentsRequired: [
      'Cannabis license',
      'GVEA membership verification',
      'Equipment specifications',
      'Installation invoices'
    ],
    processingTime: '30-45 days',
    contactInfo: {
      phone: '1-907-452-1151',
      website: 'https://www.gvea.com/energy-efficiency'
    },
    utilityRates: {
      schedule: 'Commercial General Service',
      type: 'tiered',
      rates: [
        { period: 'first-500', rate: 0.2145 },
        { period: 'next-4500', rate: 0.1956 },
        { period: 'over-5000', rate: 0.1823 }
      ],
      demandCharge: 18.50,
      customerCharge: 25.00
    },
    programStatus: {
      active: true,
      fundsAvailable: true,
      waitlist: false,
      lastUpdated: new Date('2024-12-15'),
      notes: 'Cannabis facilities eligible - high energy rates make LED conversion extremely cost-effective'
    }
  },

  // ========== HAWAII ==========
  {
    id: 'hawaiian-electric-cannabis-2025',
    utilityCompany: 'Hawaiian Electric Company',
    programName: 'Business Energy Efficiency - Cannabis',
    state: 'HI',
    zipCodes: ['96'],
    rebateType: 'custom',
    maxRebate: 300000,
    rebateRate: 0, // Custom calculation based on project
    requirements: [
      'Licensed cannabis operation',
      'DLC Horticultural V3.0 minimum',
      'Energy audit required',
      'Replace HPS/MH lighting',
      'Minimum 40% energy reduction'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 2000000,
    documentsRequired: [
      'Cannabis license',
      'Energy audit report',
      'Equipment specifications',
      'Financial analysis',
      'M&V plan'
    ],
    processingTime: '60-90 days',
    contactInfo: {
      phone: '1-808-543-4777',
      website: 'https://www.hawaiianelectric.com/business/save-energy-and-money'
    },
    utilityRates: {
      schedule: 'Schedule P - Primary Service',
      type: 'tou',
      rates: [
        { period: 'peak', days: 'weekdays', hours: '5pm-10pm', rate: 0.3456 },
        { period: 'off-peak', days: 'all', hours: 'all other times', rate: 0.2789 }
      ],
      demandCharge: 35.00,
      customerCharge: 125.00
    },
    programStatus: {
      active: true,
      fundsAvailable: true,
      waitlist: false,
      lastUpdated: new Date('2024-12-15'),
      notes: 'Extremely high electricity rates make LED conversion highly beneficial'
    }
  },

  // ========== KENTUCKY ==========
  {
    id: 'lge-ky-ag-2025',
    utilityCompany: 'Louisville Gas & Electric (LG&E)',
    programName: 'Agricultural Energy Efficiency',
    state: 'KY',
    zipCodes: ['40', '41', '42'],
    rebateType: 'prescriptive',
    maxRebate: 125000,
    rebateRate: 95, // $95 per fixture
    requirements: [
      'Agricultural operation',
      'DLC listed LED fixtures',
      'Replace existing HID lighting',
      'Commercial service required'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 3000000,
    documentsRequired: [
      'Agricultural exemption certificate',
      'Application form',
      'Equipment documentation',
      'Installation invoices'
    ],
    processingTime: '30-45 days',
    contactInfo: {
      phone: '1-502-627-3800',
      website: 'https://lge-ku.com/business/energy-efficiency'
    },
    programStatus: {
      active: true,
      fundsAvailable: true,
      waitlist: false,
      lastUpdated: new Date('2024-12-15'),
      notes: 'Cannabis cultivation eligibility requires verification with utility'
    }
  },

  // ========== UTAH ==========
  {
    id: 'rocky-mountain-ut-cannabis-2025',
    utilityCompany: 'Rocky Mountain Power',
    programName: 'UtahSAVES Cannabis LED Program',
    state: 'UT',
    zipCodes: ['84'],
    rebateType: 'prescriptive',
    maxRebate: 200000,
    rebateRate: 0.10, // $0.10 per kWh saved
    requirements: [
      'Licensed medical cannabis facility',
      'DLC Horticultural certified',
      'Replace HPS/MH fixtures',
      'Minimum 35% energy reduction'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 4500000,
    documentsRequired: [
      'Medical cannabis license',
      'UtahSAVES application',
      'DLC documentation',
      'Installation verification'
    ],
    processingTime: '45-60 days',
    contactInfo: {
      phone: '1-888-221-7070',
      website: 'https://www.rockymountainpower.net/savings-energy-choices/business.html'
    },
    programStatus: {
      active: true,
      fundsAvailable: true,
      waitlist: false,
      lastUpdated: new Date('2024-12-15'),
      notes: 'Medical cannabis facilities eligible - recreational under review'
    }
  },

  // ========== WEST VIRGINIA ==========
  {
    id: 'appalachian-wv-ag-2025',
    utilityCompany: 'Appalachian Power',
    programName: 'Agricultural LED Incentive',
    state: 'WV',
    zipCodes: ['24', '25', '26'],
    rebateType: 'prescriptive',
    maxRebate: 100000,
    rebateRate: 80, // $80 per fixture
    requirements: [
      'Agricultural facility',
      'DLC listed LED grow lights',
      'Replace HPS/MH lighting',
      'Minimum 25% energy savings'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 2000000,
    documentsRequired: [
      'Agricultural operation verification',
      'Application form',
      'Equipment specifications',
      'Installation documentation'
    ],
    processingTime: '30-45 days',
    contactInfo: {
      phone: '1-800-956-4237',
      website: 'https://www.appalachianpower.com/business/save/'
    },
    programStatus: {
      active: true,
      fundsAvailable: true,
      waitlist: false,
      lastUpdated: new Date('2024-12-15'),
      notes: 'Cannabis cultivation eligibility under state review'
    }
  },

  // ========== ARKANSAS ==========
  {
    id: 'entergy-ar-ag-2025',
    utilityCompany: 'Entergy Arkansas',
    programName: 'Agricultural Energy Solutions',
    state: 'AR',
    zipCodes: ['71', '72'],
    rebateType: 'prescriptive',
    maxRebate: 100000,
    rebateRate: 0.085, // $0.085 per kWh saved
    requirements: [
      'Agricultural operation',
      'DLC listed LED fixtures',
      'Replace HPS/MH lighting',
      'Minimum 25% energy savings'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 3500000,
    documentsRequired: [
      'Agricultural exemption certificate',
      'Application form',
      'Equipment specifications',
      'Installation documentation'
    ],
    processingTime: '30-45 days',
    contactInfo: {
      phone: '1-800-368-3749',
      website: 'https://www.entergy-arkansas.com/business/energy-efficiency'
    },
    programStatus: {
      active: true,
      fundsAvailable: true,
      waitlist: false,
      lastUpdated: new Date('2024-12-15'),
      notes: 'Medical cannabis facilities may be eligible - contact utility for verification'
    }
  },

  // ========== SOUTH CAROLINA ==========
  {
    id: 'santee-cooper-sc-ag-2025',
    utilityCompany: 'Santee Cooper',
    programName: 'Agricultural Efficiency Program',
    state: 'SC',
    zipCodes: ['29'],
    rebateType: 'prescriptive',
    maxRebate: 150000,
    rebateRate: 110, // $110 per fixture
    requirements: [
      'Agricultural facility',
      'DLC QPL listed fixtures',
      'Replace HID lighting',
      'Commercial rate schedule'
    ],
    deadline: new Date('2025-12-31'),
    budgetRemaining: 2500000,
    documentsRequired: [
      'Agricultural operation verification',
      'Application form',
      'Equipment documentation',
      'Installation invoices'
    ],
    processingTime: '30-45 days',
    contactInfo: {
      phone: '1-843-761-8000',
      website: 'https://www.santeecooper.com/business/energy-efficiency'
    },
    programStatus: {
      active: true,
      fundsAvailable: true,
      waitlist: false,
      lastUpdated: new Date('2024-12-15'),
      notes: 'Cannabis cultivation eligibility under state review'
    }
  }
]
