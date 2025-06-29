#!/usr/bin/env tsx
// Script to deploy updates with proper rollout management
// Usage: npm run deploy-update -- --version 2.1.0 --rollout 25

import { UpdateManager } from '../src/lib/update-manager';
import { Command } from 'commander';

const program = new Command();

program
  .name('deploy-update')
  .description('Deploy a new system update with rollout control')
  .requiredOption('-v, --version <version>', 'Version number (e.g., 2.1.0)')
  .requiredOption('-t, --title <title>', 'Update title')
  .requiredOption('-d, --description <description>', 'Update description')
  .option('-r, --rollout <percentage>', 'Rollout percentage (0-100)', '25')
  .option('--type <type>', 'Update type', 'feature')
  .option('--severity <severity>', 'Update severity', 'minor')
  .option('--plans <plans>', 'Affected plans (comma-separated)', 'starter,professional,business,enterprise')
  .option('--added <features>', 'Added features (comma-separated)', '')
  .option('--changed <features>', 'Changed features (comma-separated)', '')
  .option('--deprecated <features>', 'Deprecated features (comma-separated)', '')
  .option('--removed <features>', 'Removed features (comma-separated)', '')
  .option('--dry-run', 'Show what would be deployed without deploying')
  .parse();

const options = program.opts();

async function deployUpdate() {
  try {
    const update = {
      id: `update-${Date.now()}`,
      version: options.version,
      title: options.title,
      description: options.description,
      type: options.type as 'feature' | 'improvement' | 'bugfix' | 'security' | 'breaking',
      severity: options.severity as 'minor' | 'major' | 'critical',
      affectedPlans: options.plans.split(',').map((p: string) => p.trim()),
      rolloutPercentage: parseInt(options.rollout),
      scheduledFor: new Date(),
      features: {
        added: options.added ? options.added.split(',').map((f: string) => f.trim()) : [],
        changed: options.changed ? options.changed.split(',').map((f: string) => f.trim()) : [],
        deprecated: options.deprecated ? options.deprecated.split(',').map((f: string) => f.trim()) : [],
        removed: options.removed ? options.removed.split(',').map((f: string) => f.trim()) : []
      }
    };

    console.log('🚀 Deploying Update:', JSON.stringify(update, null, 2));

    if (options.dryRun) {
      console.log('✅ Dry run completed. Use --no-dry-run to actually deploy.');
      return;
    }

    // Deploy the update
    await UpdateManager.deployUpdate(update);
    
    console.log(`✅ Update ${update.version} deployed successfully!`);
    console.log(`📊 Rollout: ${update.rolloutPercentage}%`);
    console.log(`👥 Affected plans: ${update.affectedPlans.join(', ')}`);
    
    if (update.rolloutPercentage < 100) {
      console.log('\n⚠️  This is a gradual rollout. Monitor metrics and increase rollout with:');
      console.log(`npm run increase-rollout -- --feature <feature-name> --percentage <new-percentage>`);
    }

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Increase rollout percentage for a feature
program
  .command('increase-rollout')
  .description('Increase rollout percentage for a feature')
  .requiredOption('-f, --feature <name>', 'Feature name')
  .requiredOption('-p, --percentage <percentage>', 'New rollout percentage (0-100)')
  .action(async (options) => {
    try {
      await UpdateManager.increaseRollout(options.feature, parseInt(options.percentage));
      console.log(`✅ Increased rollout for ${options.feature} to ${options.percentage}%`);
    } catch (error) {
      console.error('❌ Rollout increase failed:', error);
      process.exit(1);
    }
  });

// Emergency disable a feature
program
  .command('emergency-disable')
  .description('Emergency disable a feature')
  .requiredOption('-f, --feature <name>', 'Feature name')
  .requiredOption('-r, --reason <reason>', 'Reason for disabling')
  .action(async (options) => {
    try {
      await UpdateManager.emergencyDisable(options.feature, options.reason);
      console.log(`🚨 Emergency disabled feature: ${options.feature}`);
    } catch (error) {
      console.error('❌ Emergency disable failed:', error);
      process.exit(1);
    }
  });

if (require.main === module) {
  deployUpdate();
}