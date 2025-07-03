import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

interface UserPreferences {
  userId: string;
  profile: {
    displayName: string;
    email: string;
    avatar?: string;
    timezone: string;
    language: string;
    dateFormat: string;
    temperatureUnit: 'celsius' | 'fahrenheit';
  };
  notifications: {
    email: {
      alerts: boolean;
      reports: boolean;
      marketing: boolean;
      investments: boolean;
      marketplace: boolean;
    };
    push: {
      critical: boolean;
      warnings: boolean;
      info: boolean;
      marketing: boolean;
    };
    sms: {
      critical: boolean;
      emergency: boolean;
    };
    frequency: {
      digest: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
      reports: 'daily' | 'weekly' | 'monthly';
    };
  };
  dashboard: {
    defaultView: 'overview' | 'operations' | 'investments' | 'marketplace';
    widgets: string[];
    layout: 'compact' | 'comfortable' | 'spacious';
    theme: 'light' | 'dark' | 'auto';
    refreshInterval: number; // seconds
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'contacts';
    dataSharing: boolean;
    analytics: boolean;
    crashReports: boolean;
  };
  integrations: {
    slack: {
      enabled: boolean;
      webhook?: string;
      channels: string[];
    };
    teams: {
      enabled: boolean;
      webhook?: string;
    };
    email: {
      provider: 'gmail' | 'outlook' | 'other';
      notifications: boolean;
    };
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number; // minutes
    loginAlerts: boolean;
    dataRetention: number; // days
  };
  createdAt: string;
  updatedAt: string;
}

// Demo user preferences store
const demoPreferences: Map<string, UserPreferences> = new Map();

// Initialize default preferences for a user
const initializeDefaultPreferences = (userId: string, userEmail: string): UserPreferences => {
  if (demoPreferences.has(userId)) {
    return demoPreferences.get(userId)!;
  }

  const defaultPrefs: UserPreferences = {
    userId,
    profile: {
      displayName: userEmail.split('@')[0],
      email: userEmail,
      timezone: 'America/Los_Angeles',
      language: 'en-US',
      dateFormat: 'MM/DD/YYYY',
      temperatureUnit: 'fahrenheit'
    },
    notifications: {
      email: {
        alerts: true,
        reports: true,
        marketing: false,
        investments: true,
        marketplace: true
      },
      push: {
        critical: true,
        warnings: true,
        info: false,
        marketing: false
      },
      sms: {
        critical: true,
        emergency: true
      },
      frequency: {
        digest: 'daily',
        reports: 'weekly'
      }
    },
    dashboard: {
      defaultView: 'overview',
      widgets: [
        'facility-overview',
        'recent-alerts',
        'performance-metrics',
        'investment-summary',
        'energy-usage'
      ],
      layout: 'comfortable',
      theme: 'auto',
      refreshInterval: 300 // 5 minutes
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      analytics: true,
      crashReports: true
    },
    integrations: {
      slack: {
        enabled: false,
        channels: []
      },
      teams: {
        enabled: false
      },
      email: {
        provider: 'gmail',
        notifications: true
      }
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      reduceMotion: false,
      screenReader: false
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 480, // 8 hours
      loginAlerts: true,
      dataRetention: 365 // 1 year
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  demoPreferences.set(userId, defaultPrefs);
  return defaultPrefs;
};

export async function GET(request: NextRequest) {
  try {
    const { userId, user } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    // Get user preferences
    const preferences = initializeDefaultPreferences(userId, user?.emailAddresses?.[0]?.emailAddress || 'user@example.com');

    // Return specific section if requested
    if (section) {
      if (!(section in preferences)) {
        return NextResponse.json(
          { error: 'Invalid preferences section' },
          { status: 400 }
        );
      }
      return NextResponse.json({
        [section]: (preferences as any)[section]
      });
    }

    return NextResponse.json({
      preferences,
      availableSections: [
        'profile',
        'notifications',
        'dashboard',
        'privacy',
        'integrations',
        'accessibility',
        'security'
      ]
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, user } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const updateData = await request.json();
    
    // Get existing preferences
    const currentPrefs = initializeDefaultPreferences(userId, user?.emailAddresses?.[0]?.emailAddress || 'user@example.com');
    
    // Validate update data structure
    const allowedSections = ['profile', 'notifications', 'dashboard', 'privacy', 'integrations', 'accessibility', 'security'];
    const updateSections = Object.keys(updateData).filter(key => key !== 'section');
    
    for (const section of updateSections) {
      if (!allowedSections.includes(section)) {
        return NextResponse.json(
          { error: `Invalid preferences section: ${section}` },
          { status: 400 }
        );
      }
    }

    // Deep merge updates with current preferences
    const updatedPrefs: UserPreferences = {
      ...currentPrefs,
      updatedAt: new Date().toISOString()
    };

    for (const [section, sectionData] of Object.entries(updateData)) {
      if (section === 'section') continue; // Skip meta field
      
      if (section in updatedPrefs) {
        (updatedPrefs as any)[section] = {
          ...(updatedPrefs as any)[section],
          ...sectionData
        };
      }
    }

    // Save updated preferences
    demoPreferences.set(userId, updatedPrefs);

    return NextResponse.json({
      success: true,
      preferences: updatedPrefs,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update user preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, user } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { action, ...actionData } = await request.json();

    // Handle specific preference actions
    switch (action) {
      case 'reset_to_defaults':
        // Reset all preferences to defaults
        demoPreferences.delete(userId);
        const defaultPrefs = initializeDefaultPreferences(userId, user?.emailAddresses?.[0]?.emailAddress || 'user@example.com');
        return NextResponse.json({
          success: true,
          preferences: defaultPrefs,
          message: 'Preferences reset to defaults'
        });

      case 'export_preferences':
        // Export user preferences
        const currentPrefs = initializeDefaultPreferences(userId, user?.emailAddresses?.[0]?.emailAddress || 'user@example.com');
        return NextResponse.json({
          success: true,
          data: currentPrefs,
          exportedAt: new Date().toISOString()
        });

      case 'import_preferences':
        // Import preferences from backup
        if (!actionData.preferences) {
          return NextResponse.json(
            { error: 'No preferences data provided for import' },
            { status: 400 }
          );
        }
        
        const importedPrefs = {
          ...actionData.preferences,
          userId,
          updatedAt: new Date().toISOString()
        };
        
        demoPreferences.set(userId, importedPrefs);
        return NextResponse.json({
          success: true,
          preferences: importedPrefs,
          message: 'Preferences imported successfully'
        });

      case 'validate_integration':
        // Validate integration settings (e.g., test Slack webhook)
        const integrationType = actionData.type;
        const config = actionData.config;
        
        // Mock validation
        const isValid = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.2; // 80% success rate for demo
        
        return NextResponse.json({
          success: true,
          valid: isValid,
          message: isValid 
            ? `${integrationType} integration validated successfully`
            : `${integrationType} integration validation failed`,
          details: isValid ? 'Connection established' : 'Invalid webhook URL or credentials'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing preferences action:', error);
    return NextResponse.json(
      { error: 'Failed to process preferences action' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    
    if (!section) {
      return NextResponse.json(
        { error: 'Section parameter required' },
        { status: 400 }
      );
    }

    // Get current preferences
    const currentPrefs = demoPreferences.get(userId);
    if (!currentPrefs) {
      return NextResponse.json(
        { error: 'User preferences not found' },
        { status: 404 }
      );
    }

    // Reset specific section to defaults
    const defaultPrefs = initializeDefaultPreferences('temp', 'temp@example.com');
    
    if (section in defaultPrefs) {
      (currentPrefs as any)[section] = (defaultPrefs as any)[section];
      currentPrefs.updatedAt = new Date().toISOString();
      
      demoPreferences.set(userId, currentPrefs);
      
      return NextResponse.json({
        success: true,
        message: `${section} preferences reset to defaults`,
        section: (currentPrefs as any)[section]
      });
    }

    return NextResponse.json(
      { error: 'Invalid section' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting preferences section:', error);
    return NextResponse.json(
      { error: 'Failed to delete preferences section' },
      { status: 500 }
    );
  }
}