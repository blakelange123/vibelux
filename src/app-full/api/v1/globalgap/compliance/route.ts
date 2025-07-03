import { NextRequest } from 'next/server';
import { validateApiKey, checkRateLimit } from '../../_middleware/auth';
import { handleApiError, successResponse } from '../../_middleware/error-handler';
import { rateLimitResponse, getRateLimitHeaders } from '../../_middleware/rate-limit';
import { validateRequestBody, complianceCheckSchema } from '../../_middleware/validation';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const authResult = await validateApiKey(req, 'compliance:write');
    if ('status' in authResult) return authResult;
    const { user } = authResult;

    const rateLimitKey = `compliance-check:${user.id}`;
    const isAllowed = await checkRateLimit(user.id, user.subscriptionTier);
    
    if (!isAllowed) {
      return rateLimitResponse(rateLimitKey, 200, 3600);
    }

    const body = await validateRequestBody(req, complianceCheckSchema);

    // Perform compliance check based on type
    const complianceResult = performComplianceCheck(body.checkType, body.data);
    
    // Store compliance check
    const checkRecord = await prisma.usageRecord.create({
      data: {
        userId: user.id,
        feature: 'globalgap-compliance',
        action: `check-${body.checkType}`,
        metadata: {
          checkType: body.checkType,
          data: body.data,
          result: complianceResult,
          timestamp: new Date().toISOString()
        }
      }
    });

    // Create alert if non-compliant
    if (!complianceResult.compliant) {
      await prisma.usageRecord.create({
        data: {
          userId: user.id,
          feature: 'alert',
          action: 'compliance-violation',
          metadata: {
            checkType: body.checkType,
            violations: complianceResult.violations,
            timestamp: new Date().toISOString()
          }
        }
      });
    }

    const response = successResponse({
      checkId: checkRecord.id,
      checkType: body.checkType,
      result: complianceResult,
      timestamp: checkRecord.createdAt
    });

    const rateLimitHeaders = getRateLimitHeaders(rateLimitKey, 200, 3600);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return handleApiError(error, req.nextUrl.pathname);
  }
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await validateApiKey(req, 'compliance:read');
    if ('status' in authResult) return authResult;
    const { user } = authResult;

    const rateLimitKey = `compliance-status:${user.id}`;
    const isAllowed = await checkRateLimit(user.id, user.subscriptionTier);
    
    if (!isAllowed) {
      return rateLimitResponse(rateLimitKey, 500, 3600);
    }

    // Get latest compliance checks for each type
    const checkTypes = ['water', 'pesticide', 'fertilizer', 'harvest', 'storage'];
    const latestChecks = await Promise.all(
      checkTypes.map(async (type) => {
        const check = await prisma.usageRecord.findFirst({
          where: {
            userId: user.id,
            feature: 'globalgap-compliance',
            action: `check-${type}`
          },
          orderBy: { createdAt: 'desc' }
        });
        return check ? { type, ...(check.metadata as Record<string, any>) } : null;
      })
    );

    // Calculate overall compliance score
    const validChecks = latestChecks.filter(c => c !== null);
    const compliantChecks = validChecks.filter(c => {
      const check = c as any;
      return check?.result?.compliant === true;
    });
    const complianceScore = validChecks.length > 0 
      ? Math.round((compliantChecks.length / validChecks.length) * 100)
      : 0;

    // Get upcoming audits/requirements
    const upcomingRequirements = getUpcomingRequirements();

    const response = successResponse({
      overallScore: complianceScore,
      status: complianceScore >= 95 ? 'compliant' : complianceScore >= 80 ? 'minor_issues' : 'non_compliant',
      checks: latestChecks.filter(c => c !== null),
      upcomingRequirements,
      lastUpdated: validChecks.length > 0 ? (validChecks[0] as any)?.timestamp : null
    });

    const rateLimitHeaders = getRateLimitHeaders(rateLimitKey, 500, 3600);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return handleApiError(error, req.nextUrl.pathname);
  }
}

// Helper functions
function performComplianceCheck(checkType: string, data: any): any {
  const complianceRules: Record<string, any> = {
    water: {
      maxEColi: 100, // CFU/100ml
      maxTurbidity: 5, // NTU
      minPH: 6.5,
      maxPH: 8.5,
      requiredTests: ['ecoli', 'turbidity', 'ph', 'heavyMetals']
    },
    pesticide: {
      maxResidueLimit: 0.01, // mg/kg (default MRL)
      prohibitedSubstances: ['DDT', 'Lindane', 'Endosulfan'],
      preHarvestInterval: 7, // days
      requiredRecords: ['application_date', 'product_name', 'dose', 'operator']
    },
    fertilizer: {
      maxNitrate: 2500, // mg/kg fresh weight
      requiredAnalysis: ['N', 'P', 'K', 'heavy_metals'],
      recordRetention: 2, // years
      organicCertified: true
    },
    harvest: {
      requiredHygiene: ['hand_washing', 'clean_containers', 'no_glass'],
      temperatureControl: { min: 2, max: 8 }, // °C
      traceability: ['batch_number', 'harvest_date', 'field_id']
    },
    storage: {
      temperatureRange: { min: 0, max: 10 }, // °C
      humidityRange: { min: 85, max: 95 }, // %
      pestControl: 'integrated',
      segregation: true
    }
  };

  const rules = complianceRules[checkType];
  if (!rules) {
    return { compliant: false, violations: ['Unknown check type'] };
  }

  const violations: string[] = [];
  let compliant = true;

  switch (checkType) {
    case 'water':
      if (data.ecoli > rules.maxEColi) {
        violations.push(`E. coli levels (${data.ecoli} CFU/100ml) exceed limit (${rules.maxEColi} CFU/100ml)`);
        compliant = false;
      }
      if (data.turbidity > rules.maxTurbidity) {
        violations.push(`Turbidity (${data.turbidity} NTU) exceeds limit (${rules.maxTurbidity} NTU)`);
        compliant = false;
      }
      if (data.ph < rules.minPH || data.ph > rules.maxPH) {
        violations.push(`pH (${data.ph}) outside acceptable range (${rules.minPH}-${rules.maxPH})`);
        compliant = false;
      }
      break;

    case 'pesticide':
      if (data.residueLevel > rules.maxResidueLimit) {
        violations.push(`Residue level (${data.residueLevel} mg/kg) exceeds MRL (${rules.maxResidueLimit} mg/kg)`);
        compliant = false;
      }
      if (data.daysSinceApplication < rules.preHarvestInterval) {
        violations.push(`Pre-harvest interval not met (${data.daysSinceApplication} days < ${rules.preHarvestInterval} days)`);
        compliant = false;
      }
      rules.requiredRecords.forEach((record: string) => {
        if (!data[record]) {
          violations.push(`Missing required record: ${record}`);
          compliant = false;
        }
      });
      break;

    case 'fertilizer':
      if (data.nitrateLevel > rules.maxNitrate) {
        violations.push(`Nitrate level (${data.nitrateLevel} mg/kg) exceeds limit (${rules.maxNitrate} mg/kg)`);
        compliant = false;
      }
      if (!data.organicCertified && rules.organicCertified) {
        violations.push('Fertilizer must be certified organic');
        compliant = false;
      }
      break;

    case 'harvest':
      rules.requiredHygiene.forEach((practice: string) => {
        if (!data[practice]) {
          violations.push(`Missing hygiene practice: ${practice.replace('_', ' ')}`);
          compliant = false;
        }
      });
      if (data.temperature < rules.temperatureControl.min || data.temperature > rules.temperatureControl.max) {
        violations.push(`Temperature (${data.temperature}°C) outside range (${rules.temperatureControl.min}-${rules.temperatureControl.max}°C)`);
        compliant = false;
      }
      break;

    case 'storage':
      if (data.temperature < rules.temperatureRange.min || data.temperature > rules.temperatureRange.max) {
        violations.push(`Storage temperature (${data.temperature}°C) outside range (${rules.temperatureRange.min}-${rules.temperatureRange.max}°C)`);
        compliant = false;
      }
      if (data.humidity < rules.humidityRange.min || data.humidity > rules.humidityRange.max) {
        violations.push(`Storage humidity (${data.humidity}%) outside range (${rules.humidityRange.min}-${rules.humidityRange.max}%)`);
        compliant = false;
      }
      break;
  }

  return {
    compliant,
    violations,
    recommendations: generateComplianceRecommendations(checkType, violations)
  };
}

function generateComplianceRecommendations(checkType: string, violations: string[]): string[] {
  const recommendations: string[] = [];

  if (violations.length === 0) {
    recommendations.push('Continue current practices to maintain compliance');
    return recommendations;
  }

  // Generate specific recommendations based on violations
  violations.forEach(violation => {
    if (violation.includes('E. coli')) {
      recommendations.push('Implement water treatment system (UV, ozone, or chlorination)');
      recommendations.push('Increase water testing frequency');
    }
    if (violation.includes('pH')) {
      recommendations.push('Install pH adjustment system');
      recommendations.push('Regular calibration of pH meters');
    }
    if (violation.includes('Residue level')) {
      recommendations.push('Review pesticide application rates and timing');
      recommendations.push('Consider biological pest control alternatives');
    }
    if (violation.includes('Pre-harvest interval')) {
      recommendations.push('Implement strict spray records and harvest scheduling');
      recommendations.push('Use color-coded field markers for treated areas');
    }
    if (violation.includes('Temperature')) {
      recommendations.push('Upgrade cooling/heating systems');
      recommendations.push('Install continuous temperature monitoring');
    }
    if (violation.includes('hygiene')) {
      recommendations.push('Conduct worker training on hygiene protocols');
      recommendations.push('Install hand washing stations in harvest areas');
    }
  });

  return [...new Set(recommendations)]; // Remove duplicates
}

function getUpcomingRequirements(): any[] {
  const today = new Date();
  const requirements: any[] = [];

  // Water testing (monthly)
  const nextWaterTest = new Date(today);
  nextWaterTest.setMonth(nextWaterTest.getMonth() + 1);
  requirements.push({
    type: 'water_testing',
    dueDate: nextWaterTest.toISOString(),
    description: 'Monthly water quality testing',
    priority: 'routine'
  });

  // Pesticide residue testing (pre-harvest)
  requirements.push({
    type: 'residue_testing',
    dueDate: 'Before each harvest',
    description: 'Pre-harvest pesticide residue analysis',
    priority: 'critical'
  });

  // Annual audit
  const nextAudit = new Date(today.getFullYear() + 1, 0, 1);
  requirements.push({
    type: 'annual_audit',
    dueDate: nextAudit.toISOString(),
    description: 'Annual GlobalGAP certification audit',
    priority: 'high'
  });

  // Worker training (quarterly)
  const nextTraining = new Date(today);
  nextTraining.setMonth(nextTraining.getMonth() + 3);
  requirements.push({
    type: 'worker_training',
    dueDate: nextTraining.toISOString(),
    description: 'Quarterly hygiene and safety training',
    priority: 'routine'
  });

  return requirements.sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
}

