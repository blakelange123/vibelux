export type UserRole = 'user' | 'admin' | 'developer';

export interface UserPermissions {
  // Safe features (always available)
  canAccessFixtures: boolean;
  canAccessDesigner: boolean;
  canAccessCalculators: boolean;
  canAccessReports: boolean;
  canAccessDashboard: boolean;
  
  // Patent-risky features (admin only)
  canAccessSensors: boolean;          // Real-time monitoring - risky
  canAccessPredictions: boolean;      // Growth forecasting - risky  
  canAccessAIAssistant: boolean;      // AI recommendations - risky
  canAccessAutomation: boolean;       // Automated controls - risky
  canAccessComputerVision: boolean;   // Plant monitoring - risky
  canAccessDiseaseDetection: boolean; // Disease detection - risky
  
  // Admin features
  canManageUsers: boolean;
  canAccessAdminTools: boolean;
  canViewPatentRiskyFeatures: boolean;
}

export const DEFAULT_USER_PERMISSIONS: UserPermissions = {
  // Safe features
  canAccessFixtures: true,
  canAccessDesigner: true,
  canAccessCalculators: true,
  canAccessReports: true,
  canAccessDashboard: true,
  
  // Patent-risky features (now enabled for all users)
  canAccessSensors: true,
  canAccessPredictions: true,
  canAccessAIAssistant: true,
  canAccessAutomation: true,
  canAccessComputerVision: true,
  canAccessDiseaseDetection: true,
  
  // Admin features
  canManageUsers: false,
  canAccessAdminTools: false,
  canViewPatentRiskyFeatures: true,
};

export const ADMIN_PERMISSIONS: UserPermissions = {
  // Safe features
  canAccessFixtures: true,
  canAccessDesigner: true,
  canAccessCalculators: true,
  canAccessReports: true,
  canAccessDashboard: true,
  
  // Patent-risky features (enabled for admin)
  canAccessSensors: true,
  canAccessPredictions: true,
  canAccessAIAssistant: true,
  canAccessAutomation: true,
  canAccessComputerVision: true,
  canAccessDiseaseDetection: true,
  
  // Admin features
  canManageUsers: true,
  canAccessAdminTools: true,
  canViewPatentRiskyFeatures: true,
};

export function getUserPermissions(userRole: UserRole): UserPermissions {
  switch (userRole) {
    case 'admin':
    case 'developer':
      return ADMIN_PERMISSIONS;
    case 'user':
    default:
      return DEFAULT_USER_PERMISSIONS;
  }
}

// Temporary function to simulate user role - replace with actual auth
export function getCurrentUserRole(): UserRole {
  // In development, check for admin flag in localStorage
  if (typeof window !== 'undefined') {
    const isAdmin = localStorage.getItem('vibelux_admin_mode') === 'true';
    if (isAdmin) return 'admin';
  }
  return 'user';
}

export function getCurrentUserPermissions(): UserPermissions {
  return getUserPermissions(getCurrentUserRole());
}

// Patent-risky features that need to be hidden
export const PATENT_RISKY_FEATURES = [
  'sensors',
  'predictions', 
  'ai-assistant',
  'automation',
  'computer-vision',
  'disease-detection'
] as const;

export type PatentRiskyFeature = typeof PATENT_RISKY_FEATURES[number];