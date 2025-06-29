#!/usr/bin/env tsx
/**
 * Environment Validation Script
 * Checks that all required environment variables and services are configured
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  category: string;
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    required: boolean;
  }[];
}

class EnvironmentValidator {
  private results: ValidationResult[] = [];

  async validate(): Promise<void> {
    console.log('🔍 Validating Vibelux Environment Configuration...\n');

    await this.validateEnvironmentVariables();
    await this.validateDatabaseConnection();
    await this.validateExternalServices();
    await this.validateInfluxDB();
    await this.validateStripe();
    
    this.printResults();
    this.printSummary();
  }

  private validateEnvironmentVariables(): void {
    const envChecks = {
      name: 'Environment Variables',
      checks: []
    };

    // Core database
    this.checkEnvVar(envChecks, 'DATABASE_URL', true, 'Database connection string');
    this.checkEnvVar(envChecks, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', true, 'Clerk authentication');
    this.checkEnvVar(envChecks, 'CLERK_SECRET_KEY', true, 'Clerk authentication');

    // Stripe payment processing
    this.checkEnvVar(envChecks, 'STRIPE_SECRET_KEY', true, 'Stripe payment processing');
    this.checkEnvVar(envChecks, 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', true, 'Stripe frontend');
    this.checkEnvVar(envChecks, 'STRIPE_WEBHOOK_SECRET', false, 'Stripe webhook verification');

    // Energy monitoring
    this.checkEnvVar(envChecks, 'INFLUXDB_URL', false, 'Time-series data storage');
    this.checkEnvVar(envChecks, 'INFLUXDB_TOKEN', false, 'InfluxDB authentication');
    this.checkEnvVar(envChecks, 'ENERGY_API_KEY', false, 'Energy rate data (EIA API)');

    // Revenue sharing
    this.checkEnvVar(envChecks, 'CRON_SECRET_KEY', false, 'Scheduled job security');
    
    // Optional services
    this.checkEnvVar(envChecks, 'OPENEI_API_KEY', false, 'Utility rate database');
    this.checkEnvVar(envChecks, 'SLACK_CRON_WEBHOOK', false, 'Cron job monitoring alerts');

    this.results.push(envChecks);
  }

  private checkEnvVar(category: any, varName: string, required: boolean, description: string): void {
    const value = process.env[varName];
    const exists = !!value;

    category.checks.push({
      name: varName,
      status: exists ? 'pass' : (required ? 'fail' : 'warning'),
      message: exists ? 
        `✓ ${description}` : 
        `${required ? '✗' : '⚠'} Missing: ${description}`,
      required
    });
  }

  private async validateDatabaseConnection(): Promise<void> {
    const dbChecks = {
      name: 'Database Connection',
      checks: []
    };

    try {
      // Check if Prisma schema exists
      const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
      const financialSchemaPath = path.join(process.cwd(), 'prisma', 'schema-financial-automation.prisma');
      
      dbChecks.checks.push({
        name: 'Prisma Schema',
        status: fs.existsSync(schemaPath) ? 'pass' : 'fail',
        message: fs.existsSync(schemaPath) ? '✓ Main schema found' : '✗ Main schema missing',
        required: true
      });

      dbChecks.checks.push({
        name: 'Financial Automation Schema',
        status: fs.existsSync(financialSchemaPath) ? 'pass' : 'fail',
        message: fs.existsSync(financialSchemaPath) ? '✓ Financial schema found' : '✗ Financial schema missing',
        required: true
      });

      // Test database connection if DATABASE_URL exists
      if (process.env.DATABASE_URL) {
        try {
          // This is a simple test - in production you'd use actual Prisma client
          dbChecks.checks.push({
            name: 'Database URL Format',
            status: process.env.DATABASE_URL.includes('://') ? 'pass' : 'fail',
            message: process.env.DATABASE_URL.includes('://') ? '✓ Valid URL format' : '✗ Invalid URL format',
            required: true
          });
        } catch (error) {
          dbChecks.checks.push({
            name: 'Database Connection',
            status: 'fail',
            message: `✗ Connection failed: ${error}`,
            required: true
          });
        }
      }

    } catch (error) {
      dbChecks.checks.push({
        name: 'Database Validation',
        status: 'fail',
        message: `✗ Validation error: ${error}`,
        required: true
      });
    }

    this.results.push(dbChecks);
  }

  private async validateExternalServices(): Promise<void> {
    const serviceChecks = {
      name: 'External Services',
      checks: []
    };

    // Check if InfluxDB scripts exist
    const influxScripts = [
      'start-influxdb.sh',
      'init-influxdb.sh',
      'install_influxdb3.sh'
    ];

    influxScripts.forEach(script => {
      const scriptPath = path.join(process.cwd(), script);
      serviceChecks.checks.push({
        name: `InfluxDB Script: ${script}`,
        status: fs.existsSync(scriptPath) ? 'pass' : 'warning',
        message: fs.existsSync(scriptPath) ? `✓ ${script} found` : `⚠ ${script} missing`,
        required: false
      });
    });

    // Check cron configuration
    const cronConfigPath = path.join(process.cwd(), 'src', 'lib', 'cron', 'cron-config.ts');
    serviceChecks.checks.push({
      name: 'Cron Configuration',
      status: fs.existsSync(cronConfigPath) ? 'pass' : 'fail',
      message: fs.existsSync(cronConfigPath) ? '✓ Cron jobs configured' : '✗ Cron config missing',
      required: true
    });

    this.results.push(serviceChecks);
  }

  private async validateInfluxDB(): Promise<void> {
    const influxChecks = {
      name: 'InfluxDB Configuration',
      checks: []
    };

    const influxUrl = process.env.INFLUXDB_URL || 'http://localhost:8086';
    
    try {
      // Test InfluxDB connection
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${influxUrl}/health`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      influxChecks.checks.push({
        name: 'InfluxDB Service',
        status: response.ok ? 'pass' : 'warning',
        message: response.ok ? '✓ InfluxDB responding' : '⚠ InfluxDB not responding',
        required: false
      });

    } catch (error) {
      influxChecks.checks.push({
        name: 'InfluxDB Service',
        status: 'warning',
        message: '⚠ InfluxDB connection failed (may not be started)',
        required: false
      });
    }

    // Check InfluxDB client
    const clientPath = path.join(process.cwd(), 'src', 'lib', 'timeseries', 'influxdb-client.ts');
    influxChecks.checks.push({
      name: 'InfluxDB Client',
      status: fs.existsSync(clientPath) ? 'pass' : 'fail',
      message: fs.existsSync(clientPath) ? '✓ Client implementation found' : '✗ Client missing',
      required: true
    });

    this.results.push(influxChecks);
  }

  private async validateStripe(): Promise<void> {
    const stripeChecks = {
      name: 'Stripe Configuration',
      checks: []
    };

    if (process.env.STRIPE_SECRET_KEY) {
      try {
        // Basic Stripe validation
        const isTestKey = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
        const isLiveKey = process.env.STRIPE_SECRET_KEY.startsWith('sk_live_');

        if (isTestKey || isLiveKey) {
          stripeChecks.checks.push({
            name: 'Stripe API Key',
            status: 'pass',
            message: `✓ Valid ${isTestKey ? 'test' : 'live'} API key`,
            required: true
          });
        } else {
          stripeChecks.checks.push({
            name: 'Stripe API Key',
            status: 'fail',
            message: '✗ Invalid API key format',
            required: true
          });
        }

        // Check publishable key matches secret key environment
        const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (pubKey) {
          const pubIsTest = pubKey.startsWith('pk_test_');
          const pubIsLive = pubKey.startsWith('pk_live_');
          
          if ((isTestKey && pubIsTest) || (isLiveKey && pubIsLive)) {
            stripeChecks.checks.push({
              name: 'Key Environment Match',
              status: 'pass',
              message: '✓ Secret and publishable keys match environment',
              required: true
            });
          } else {
            stripeChecks.checks.push({
              name: 'Key Environment Match',
              status: 'fail',
              message: '✗ Secret and publishable keys are from different environments',
              required: true
            });
          }
        }

      } catch (error) {
        stripeChecks.checks.push({
          name: 'Stripe Validation',
          status: 'fail',
          message: `✗ Validation error: ${error}`,
          required: true
        });
      }
    }

    this.results.push(stripeChecks);
  }

  private printResults(): void {
    this.results.forEach(category => {
      console.log(`\n📋 ${category.name}`);
      console.log('─'.repeat(50));
      
      category.checks.forEach(check => {
        const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
        console.log(`${icon} ${check.message}`);
      });
    });
  }

  private printSummary(): void {
    const allChecks = this.results.flatMap(r => r.checks);
    const required = allChecks.filter(c => c.required);
    const optional = allChecks.filter(c => !c.required);
    
    const requiredPassed = required.filter(c => c.status === 'pass').length;
    const optionalPassed = optional.filter(c => c.status === 'pass').length;
    
    console.log('\n📊 Summary');
    console.log('─'.repeat(50));
    console.log(`Required: ${requiredPassed}/${required.length} passing`);
    console.log(`Optional: ${optionalPassed}/${optional.length} passing`);
    
    const criticalIssues = required.filter(c => c.status === 'fail').length;
    
    if (criticalIssues === 0) {
      console.log('\n🎉 Environment validation passed!');
      console.log('   Your Vibelux installation is ready for revenue sharing.');
    } else {
      console.log(`\n🚨 ${criticalIssues} critical issue(s) found.`);
      console.log('   Please fix the failing required checks before proceeding.');
    }

    console.log('\n📖 Next Steps:');
    if (criticalIssues === 0) {
      console.log('   1. Start InfluxDB: ./start-influxdb.sh');
      console.log('   2. Apply database schema: npx prisma db push');
      console.log('   3. Start cron jobs: npm run start:cron');
      console.log('   4. Monitor services: /admin/system-health');
    } else {
      console.log('   1. Fix environment variable issues');
      console.log('   2. Run validation again: npm run validate:env');
      console.log('   3. Check documentation for setup instructions');
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new EnvironmentValidator();
  validator.validate().catch(console.error);
}

export { EnvironmentValidator };