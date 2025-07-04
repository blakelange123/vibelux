// Production-grade input validation system for VibeLux
// Supports multi-language error messages and custom validation rules

export interface ValidationRule {
  validator: (value: any) => boolean;
  message: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface ValidationSchema {
  [field: string]: ValidationRule[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [field: string]: string[] };
  warnings: { [field: string]: string[] };
  infos: { [field: string]: string[] };
}

// Common validation rules
export const ValidationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validator: (value: any) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
    message
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true; // Optional field
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true; // Optional field
      return value.length >= min;
    },
    message: message || `Minimum ${min} characters required`
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true; // Optional field
      return value.length <= max;
    },
    message: message || `Maximum ${max} characters allowed`
  }),

  numeric: (message = 'Please enter a valid number'): ValidationRule => ({
    validator: (value: any) => {
      if (value === '' || value === null || value === undefined) return true;
      return !isNaN(Number(value)) && isFinite(Number(value));
    },
    message
  }),

  min: (minimum: number, message?: string): ValidationRule => ({
    validator: (value: any) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && num >= minimum;
    },
    message: message || `Value must be at least ${minimum}`
  }),

  max: (maximum: number, message?: string): ValidationRule => ({
    validator: (value: any) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && num <= maximum;
    },
    message: message || `Value must be no more than ${maximum}`
  }),

  range: (min: number, max: number, message?: string): ValidationRule => ({
    validator: (value: any) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && num >= min && num <= max;
    },
    message: message || `Value must be between ${min} and ${max}`
  }),

  integer: (message = 'Please enter a whole number'): ValidationRule => ({
    validator: (value: any) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && Number.isInteger(num);
    },
    message
  }),

  positive: (message = 'Value must be positive'): ValidationRule => ({
    validator: (value: any) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && num > 0;
    },
    message
  }),

  nonNegative: (message = 'Value cannot be negative'): ValidationRule => ({
    validator: (value: any) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && num >= 0;
    },
    message
  }),

  oneOf: (options: any[], message?: string): ValidationRule => ({
    validator: (value: any) => {
      if (value === '' || value === null || value === undefined) return true;
      return options.includes(value);
    },
    message: message || `Value must be one of: ${options.join(', ')}`
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true; // Optional field
      return regex.test(value);
    },
    message
  }),

  custom: (validatorFn: (value: any) => boolean, message: string): ValidationRule => ({
    validator: validatorFn,
    message
  }),

  // Agricultural specific validators
  temperature: (message = 'Temperature must be between -20°C and 50°C'): ValidationRule => ({
    validator: (value: any) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && num >= -20 && num <= 50;
    },
    message
  }),

  humidity: (message = 'Humidity must be between 0% and 100%'): ValidationRule => ({
    validator: (value: any) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && num >= 0 && num <= 100;
    },
    message
  }),

  ph: (message = 'pH must be between 0 and 14'): ValidationRule => ({
    validator: (value: any) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && num >= 0 && num <= 14;
    },
    message
  }),

  ec: (message = 'EC must be between 0 and 10 mS/cm'): ValidationRule => ({
    validator: (value: any) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && num >= 0 && num <= 10;
    },
    message
  }),

  ppfd: (message = 'PPFD must be between 0 and 3000 μmol/m²/s'): ValidationRule => ({
    validator: (value: any) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && num >= 0 && num <= 3000;
    },
    message
  }),

  vpd: (message = 'VPD must be between 0 and 5 kPa'): ValidationRule => ({
    validator: (value: any) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && num >= 0 && num <= 5;
    },
    message
  }),

  co2: (message = 'CO₂ must be between 200 and 2000 ppm'): ValidationRule => ({
    validator: (value: any) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && num >= 200 && num <= 2000;
    },
    message
  }),

  // File validation
  fileSize: (maxSizeMB: number, message?: string): ValidationRule => ({
    validator: (file: File) => {
      if (!file) return true; // Optional field
      const maxBytes = maxSizeMB * 1024 * 1024;
      return file.size <= maxBytes;
    },
    message: message || `File size must be less than ${maxSizeMB}MB`
  }),

  fileType: (allowedTypes: string[], message?: string): ValidationRule => ({
    validator: (file: File) => {
      if (!file) return true; // Optional field
      return allowedTypes.some(type => file.type.startsWith(type));
    },
    message: message || `File type must be one of: ${allowedTypes.join(', ')}`
  }),

  // Warning validators (don't fail validation but show warnings)
  recommendedRange: (min: number, max: number, message?: string): ValidationRule => ({
    validator: (value: any) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      if (isNaN(num)) return true; // Let numeric validator handle this
      return num >= min && num <= max;
    },
    message: message || `Recommended range is ${min} to ${max}`,
    severity: 'warning'
  }),

  optimalValue: (optimal: number, tolerance: number, message?: string): ValidationRule => ({
    validator: (value: any) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      if (isNaN(num)) return true;
      return Math.abs(num - optimal) <= tolerance;
    },
    message: message || `Optimal value is around ${optimal}`,
    severity: 'info'
  })
};

// Validation schemas for different forms
export const ValidationSchemas = {
  plantHealth: {
    facilityId: [ValidationRules.required('Please select a facility')],
    cropId: [ValidationRules.required('Please select a crop')],
    temperature: [
      ValidationRules.temperature(),
      ValidationRules.recommendedRange(18, 30, 'Recommended temperature range for most crops is 18-30°C')
    ],
    humidity: [
      ValidationRules.humidity(),
      ValidationRules.recommendedRange(50, 80, 'Recommended humidity range is 50-80%')
    ],
    notes: [ValidationRules.maxLength(500, 'Notes cannot exceed 500 characters')],
    photoFile: [
      ValidationRules.fileType(['image/'], 'Please upload an image file'),
      ValidationRules.fileSize(5, 'Image file must be less than 5MB')
    ]
  } as ValidationSchema,

  waterUsage: {
    facilityId: [ValidationRules.required('Please select a facility')],
    volumeUsed: [
      ValidationRules.required('Please enter water volume used'),
      ValidationRules.positive('Water volume must be positive'),
      ValidationRules.max(10000, 'Volume seems unusually high - please verify')
    ],
    irrigationTime: [
      ValidationRules.nonNegative('Irrigation time cannot be negative'),
      ValidationRules.max(480, 'Irrigation time over 8 hours seems unusual')
    ],
    plantCount: [
      ValidationRules.positive('Plant count must be positive'),
      ValidationRules.integer('Plant count must be a whole number')
    ],
    costPerLiter: [
      ValidationRules.nonNegative('Cost cannot be negative'),
      ValidationRules.max(1, 'Cost per liter seems unusually high')
    ]
  } as ValidationSchema,

  sensorReading: {
    sensorId: [ValidationRules.required('Please select a sensor')],
    value: [ValidationRules.required('Please enter a value'), ValidationRules.numeric()],
    timestamp: [ValidationRules.required('Timestamp is required')]
  } as ValidationSchema,

  userProfile: {
    name: [
      ValidationRules.required('Name is required'),
      ValidationRules.minLength(2, 'Name must be at least 2 characters'),
      ValidationRules.maxLength(50, 'Name cannot exceed 50 characters')
    ],
    email: [
      ValidationRules.required('Email is required'),
      ValidationRules.email()
    ],
    phone: [
      ValidationRules.pattern(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    ]
  } as ValidationSchema,

  facility: {
    name: [
      ValidationRules.required('Facility name is required'),
      ValidationRules.minLength(2, 'Name must be at least 2 characters'),
      ValidationRules.maxLength(100, 'Name cannot exceed 100 characters')
    ],
    area: [
      ValidationRules.positive('Area must be positive'),
      ValidationRules.max(100000, 'Area seems unusually large')
    ],
    volume: [
      ValidationRules.positive('Volume must be positive'),
      ValidationRules.max(1000000, 'Volume seems unusually large')
    ],
    optimalTemp: [ValidationRules.temperature()],
    optimalHumidity: [ValidationRules.humidity()],
    optimalCO2: [ValidationRules.co2()],
    optimalVPD: [ValidationRules.vpd()]
  } as ValidationSchema
};

// Main validation function
export function validate(data: any, schema: ValidationSchema): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: {},
    warnings: {},
    infos: {}
  };

  Object.keys(schema).forEach(field => {
    const rules = schema[field];
    const value = data[field];

    rules.forEach(rule => {
      if (!rule.validator(value)) {
        const severity = rule.severity || 'error';
        
        if (severity === 'error') {
          if (!result.errors[field]) result.errors[field] = [];
          result.errors[field].push(rule.message);
          result.isValid = false;
        } else if (severity === 'warning') {
          if (!result.warnings[field]) result.warnings[field] = [];
          result.warnings[field].push(rule.message);
        } else if (severity === 'info') {
          if (!result.infos[field]) result.infos[field] = [];
          result.infos[field].push(rule.message);
        }
      }
    });
  });

  return result;
}

// Utility function to validate a single field
export function validateField(value: any, rules: ValidationRule[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  infos: string[];
} {
  const result = {
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[],
    infos: [] as string[]
  };

  rules.forEach(rule => {
    if (!rule.validator(value)) {
      const severity = rule.severity || 'error';
      
      if (severity === 'error') {
        result.errors.push(rule.message);
        result.isValid = false;
      } else if (severity === 'warning') {
        result.warnings.push(rule.message);
      } else if (severity === 'info') {
        result.infos.push(rule.message);
      }
    }
  });

  return result;
}

// Sanitization functions
export const Sanitizers = {
  trim: (value: string): string => value?.trim() || '',
  
  toLowerCase: (value: string): string => value?.toLowerCase() || '',
  
  toUpperCase: (value: string): string => value?.toUpperCase() || '',
  
  removeSpaces: (value: string): string => value?.replace(/\s/g, '') || '',
  
  alphanumeric: (value: string): string => value?.replace(/[^a-zA-Z0-9]/g, '') || '',
  
  numeric: (value: string): string => value?.replace(/[^0-9.-]/g, '') || '',
  
  email: (value: string): string => value?.toLowerCase().trim() || '',
  
  phone: (value: string): string => value?.replace(/[^+\d\s\-\(\)]/g, '') || '',
  
  currency: (value: string): string => {
    const cleaned = value?.replace(/[^0-9.]/g, '') || '';
    const num = parseFloat(cleaned);
    return isNaN(num) ? '' : num.toFixed(2);
  },
  
  percentage: (value: string): string => {
    const cleaned = value?.replace(/[^0-9.]/g, '') || '';
    const num = parseFloat(cleaned);
    if (isNaN(num)) return '';
    return Math.min(100, Math.max(0, num)).toString();
  }
};

// Helper function to apply sanitization
export function sanitizeData(data: any, sanitizers: { [field: string]: (value: any) => any }): any {
  const sanitized = { ...data };
  
  Object.keys(sanitizers).forEach(field => {
    if (sanitized[field] !== undefined && sanitized[field] !== null) {
      sanitized[field] = sanitizers[field](sanitized[field]);
    }
  });
  
  return sanitized;
}

// Real-time validation hook for React components
export function useValidation(schema: ValidationSchema) {
  const [errors, setErrors] = React.useState<{ [field: string]: string[] }>({});
  const [warnings, setWarnings] = React.useState<{ [field: string]: string[] }>({});
  const [infos, setInfos] = React.useState<{ [field: string]: string[] }>({});
  const [isValid, setIsValid] = React.useState(true);

  const validateForm = (data: any) => {
    const result = validate(data, schema);
    setErrors(result.errors);
    setWarnings(result.warnings);
    setInfos(result.infos);
    setIsValid(result.isValid);
    return result;
  };

  const validateField = (field: string, value: any) => {
    if (schema[field]) {
      const fieldResult = validateField(value, schema[field]);
      
      setErrors(prev => ({
        ...prev,
        [field]: fieldResult.errors
      }));
      
      setWarnings(prev => ({
        ...prev,
        [field]: fieldResult.warnings
      }));
      
      setInfos(prev => ({
        ...prev,
        [field]: fieldResult.infos
      }));
      
      return fieldResult;
    }
    
    return { isValid: true, errors: [], warnings: [], infos: [] };
  };

  const clearFieldValidation = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    
    setWarnings(prev => {
      const newWarnings = { ...prev };
      delete newWarnings[field];
      return newWarnings;
    });
    
    setInfos(prev => {
      const newInfos = { ...prev };
      delete newInfos[field];
      return newInfos;
    });
  };

  return {
    errors,
    warnings,
    infos,
    isValid,
    validateForm,
    validateField,
    clearFieldValidation
  };
}