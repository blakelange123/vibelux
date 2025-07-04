/**
 * Legal Agreements Service
 * Handles terms of service, liability protection, and compliance
 */

import { prisma } from '@/lib/prisma';

interface ServiceAgreement {
  facilityId: string;
  agreementType: 'energy_optimization' | 'data_sharing' | 'control_system_access';
  version: string;
  terms: string;
  signedAt?: Date;
  signedBy?: string;
  ipAddress?: string;
}

interface LiabilityWaiver {
  facilityId: string;
  waiverType: 'crop_damage' | 'equipment_failure' | 'system_downtime';
  acknowledged: boolean;
  signedAt: Date;
  signedBy: string;
}

export class LegalAgreementsService {
  private static instance: LegalAgreementsService;

  private constructor() {}

  static getInstance(): LegalAgreementsService {
    if (!LegalAgreementsService.instance) {
      LegalAgreementsService.instance = new LegalAgreementsService();
    }
    return LegalAgreementsService.instance;
  }

  /**
   * Get required agreements for facility setup
   */
  async getRequiredAgreements(facilityId: string): Promise<{
    agreements: ServiceAgreement[];
    waivers: LiabilityWaiver[];
    allSigned: boolean;
  }> {
    try {
      // Define required agreements
      const requiredAgreements: ServiceAgreement[] = [
        {
          facilityId,
          agreementType: 'energy_optimization',
          version: '1.0',
          terms: this.getEnergyOptimizationTerms()
        },
        {
          facilityId,
          agreementType: 'data_sharing',
          version: '1.0',
          terms: this.getDataSharingTerms()
        },
        {
          facilityId,
          agreementType: 'control_system_access',
          version: '1.0',
          terms: this.getControlSystemAccessTerms()
        }
      ];

      // Define required waivers
      const requiredWaivers: LiabilityWaiver[] = [
        {
          facilityId,
          waiverType: 'crop_damage',
          acknowledged: false,
          signedAt: new Date(),
          signedBy: ''
        },
        {
          facilityId,
          waiverType: 'equipment_failure',
          acknowledged: false,
          signedAt: new Date(),
          signedBy: ''
        },
        {
          facilityId,
          waiverType: 'system_downtime',
          acknowledged: false,
          signedAt: new Date(),
          signedBy: ''
        }
      ];

      // Check existing signatures
      const existingAgreements = await prisma.legal_agreements?.findMany({
        where: { facility_id: facilityId }
      });

      const existingWaivers = await prisma.liability_waivers?.findMany({
        where: { facility_id: facilityId }
      });

      // Mark signed agreements
      for (const agreement of requiredAgreements) {
        const existing = existingAgreements?.find(
          e => e.agreement_type === agreement.agreementType && e.version === agreement.version
        );
        if (existing) {
          agreement.signedAt = existing.signed_at;
          agreement.signedBy = existing.signed_by;
          agreement.ipAddress = existing.ip_address;
        }
      }

      // Mark acknowledged waivers
      for (const waiver of requiredWaivers) {
        const existing = existingWaivers?.find(
          e => e.waiver_type === waiver.waiverType
        );
        if (existing) {
          waiver.acknowledged = existing.acknowledged;
          waiver.signedAt = existing.signed_at;
          waiver.signedBy = existing.signed_by;
        }
      }

      const allSigned = requiredAgreements.every(a => a.signedAt) && 
                      requiredWaivers.every(w => w.acknowledged);

      return {
        agreements: requiredAgreements,
        waivers: requiredWaivers,
        allSigned
      };

    } catch (error) {
      console.error('Failed to get required agreements:', error);
      throw error;
    }
  }

  /**
   * Sign service agreement
   */
  async signAgreement(
    facilityId: string,
    agreementType: string,
    version: string,
    signedBy: string,
    ipAddress: string
  ): Promise<void> {
    try {
      await prisma.legal_agreements?.upsert({
        where: {
          facility_id_agreement_type_version: {
            facility_id: facilityId,
            agreement_type: agreementType,
            version: version
          }
        },
        update: {
          signed_by: signedBy,
          signed_at: new Date(),
          ip_address: ipAddress,
          updated_at: new Date()
        },
        create: {
          facility_id: facilityId,
          agreement_type: agreementType,
          version: version,
          signed_by: signedBy,
          signed_at: new Date(),
          ip_address: ipAddress
        }
      });


    } catch (error) {
      console.error('Failed to sign agreement:', error);
      throw error;
    }
  }

  /**
   * Acknowledge liability waiver
   */
  async acknowledgeWaiver(
    facilityId: string,
    waiverType: string,
    signedBy: string,
    ipAddress: string
  ): Promise<void> {
    try {
      await prisma.liability_waivers?.upsert({
        where: {
          facility_id_waiver_type: {
            facility_id: facilityId,
            waiver_type: waiverType
          }
        },
        update: {
          acknowledged: true,
          signed_by: signedBy,
          signed_at: new Date(),
          ip_address: ipAddress,
          updated_at: new Date()
        },
        create: {
          facility_id: facilityId,
          waiver_type: waiverType,
          acknowledged: true,
          signed_by: signedBy,
          signed_at: new Date(),
          ip_address: ipAddress
        }
      });


    } catch (error) {
      console.error('Failed to acknowledge waiver:', error);
      throw error;
    }
  }

  /**
   * Check if facility can proceed with optimization
   */
  async canProceedWithOptimization(facilityId: string): Promise<{
    canProceed: boolean;
    missingAgreements: string[];
    missingWaivers: string[];
  }> {
    try {
      const { agreements, waivers, allSigned } = await this.getRequiredAgreements(facilityId);

      const missingAgreements = agreements
        .filter(a => !a.signedAt)
        .map(a => a.agreementType);

      const missingWaivers = waivers
        .filter(w => !w.acknowledged)
        .map(w => w.waiverType);

      return {
        canProceed: allSigned,
        missingAgreements,
        missingWaivers
      };

    } catch (error) {
      console.error('Failed to check optimization eligibility:', error);
      return {
        canProceed: false,
        missingAgreements: ['system_error'],
        missingWaivers: ['system_error']
      };
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(facilityId: string): Promise<{
    facilityId: string;
    complianceStatus: 'compliant' | 'non_compliant' | 'pending';
    agreements: any[];
    waivers: any[];
    lastAuditDate: Date;
    nextAuditDue: Date;
  }> {
    try {
      const agreements = await prisma.legal_agreements?.findMany({
        where: { facility_id: facilityId },
        orderBy: { signed_at: 'desc' }
      });

      const waivers = await prisma.liability_waivers?.findMany({
        where: { facility_id: facilityId },
        orderBy: { signed_at: 'desc' }
      });

      const { canProceed } = await this.canProceedWithOptimization(facilityId);

      const complianceStatus = canProceed ? 'compliant' : 'non_compliant';
      const lastAuditDate = new Date();
      const nextAuditDue = new Date();
      nextAuditDue.setMonth(nextAuditDue.getMonth() + 12); // Annual audit

      return {
        facilityId,
        complianceStatus,
        agreements: agreements || [],
        waivers: waivers || [],
        lastAuditDate,
        nextAuditDue
      };

    } catch (error) {
      console.error('Failed to generate compliance report:', error);
      throw error;
    }
  }

  /**
   * Private methods for agreement text
   */
  private getEnergyOptimizationTerms(): string {
    return `
# VibeLux Energy Optimization Service Agreement

## 1. Service Description
VibeLux provides energy optimization services for horticultural facilities by integrating with existing control systems to reduce energy consumption while maintaining crop safety.

## 2. Revenue Sharing Model
- Customer pays 20% of verified energy savings
- No upfront costs or hardware requirements
- Savings verified using IPMVP standards
- Monthly billing based on actual savings

## 3. Performance Guarantees
- Minimum 5% energy savings required for billing
- 90% statistical confidence in savings calculations
- Crop safety prioritized over energy savings
- Manual override capability always available

## 4. Service Limitations
- VibeLux integrates with existing systems and does not replace them
- Customer retains full control of their facility
- Service may be suspended if crop safety is compromised
- Savings may vary based on facility operations and market conditions

## 5. Customer Responsibilities
- Provide accurate facility and energy usage data
- Maintain existing control systems in working order
- Allow VibeLux secure access to control system data
- Report any crop or equipment issues immediately

## 6. Liability Limitations
- VibeLux liability limited to service fees paid in current month
- Customer responsible for crop production and quality
- VibeLux not liable for consequential or indirect damages
- Insurance coverage recommended for crop protection

## 7. Data Privacy and Security
- Customer data encrypted and stored securely
- Data used only for optimization and billing purposes
- No data shared with third parties without consent
- Customer can request data deletion upon service termination

## 8. Termination
- Either party may terminate with 30 days written notice
- Customer retains all system controls upon termination
- Final billing based on savings through termination date
- Data deletion within 90 days of termination

By signing this agreement, Customer acknowledges understanding and acceptance of these terms.
    `.trim();
  }

  private getDataSharingTerms(): string {
    return `
# VibeLux Data Sharing Agreement

## 1. Data Collection
VibeLux collects the following data from Customer's facility:
- Power consumption and energy usage patterns
- Lighting intensity and scheduling data
- Environmental sensor readings (temperature, humidity, CO2)
- Equipment status and performance metrics

## 2. Data Usage
Customer data is used exclusively for:
- Energy optimization algorithms and recommendations
- Savings calculation and verification
- System performance monitoring and alerts
- Service improvement and maintenance

## 3. Data Protection
- All data transmitted using end-to-end encryption
- Data stored in SOC 2 compliant data centers
- Access restricted to authorized VibeLux personnel
- Regular security audits and penetration testing

## 4. Data Retention
- Operational data retained for duration of service agreement
- Historical data retained for 3 years for audit purposes
- Data anonymized for research with customer consent
- Data deleted upon service termination (90-day retention)

## 5. Customer Rights
- Right to access all data collected about their facility
- Right to correct inaccurate data
- Right to request data deletion
- Right to data portability in standard formats

## 6. Third-Party Access
- No data shared with competitors or unauthorized parties
- Aggregate, anonymized data may be used for industry research
- Court orders or legal requirements may require data disclosure
- Customer notified of any data requests where legally permitted

Customer consents to data collection and use as described above.
    `.trim();
  }

  private getControlSystemAccessTerms(): string {
    return `
# VibeLux Control System Access Agreement

## 1. Access Requirements
VibeLux requires secure access to Customer's control system for:
- Reading current system status and sensor data
- Sending optimization commands to lighting controls
- Monitoring system health and performance
- Providing emergency override capabilities

## 2. Security Measures
- All communications encrypted using industry standards
- Access limited to specific VibeLux personnel
- Multi-factor authentication required
- Activity logging and audit trails maintained

## 3. Access Limitations
- VibeLux cannot access non-lighting control functions
- No access to facility security or surveillance systems
- No access to business or financial systems
- Customer maintains full administrative control

## 4. Emergency Procedures
- Customer can revoke access immediately if needed
- Emergency stop system restores full lighting immediately
- 24/7 support available for system issues
- Backup controls always available to customer

## 5. System Integration
- VibeLux integrates with existing systems without modification
- No software installation required on customer systems
- Existing safety systems and interlocks remain active
- Customer control interfaces remain fully functional

## 6. Compliance and Auditing
- Access complies with applicable industry standards
- Regular security audits conducted
- Access logs available for customer review
- Compliance reporting available upon request

Customer authorizes VibeLux to access their control system as described above.
    `.trim();
  }
}

// Export singleton
export const legalAgreementsService = LegalAgreementsService.getInstance();