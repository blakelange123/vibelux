const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

console.log('🔄 Starting VibeLux Backup Scheduler...');

// Database backup every 6 hours
cron.schedule('0 */6 * * *', () => {
  console.log('📦 Starting scheduled database backup...');
  exec('sh /backup/scripts/db-backup.sh', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Database backup failed:', error);
      return;
    }
    console.log('✅ Database backup completed:', stdout);
  });
});

// Application data backup daily at 2 AM
cron.schedule('0 2 * * *', () => {
  console.log('📦 Starting scheduled application backup...');
  exec('sh /backup/scripts/app-backup.sh', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Application backup failed:', error);
      return;
    }
    console.log('✅ Application backup completed:', stdout);
  });
});

// Cleanup old backups weekly
cron.schedule('0 3 * * 0', () => {
  console.log('🧹 Starting backup cleanup...');
  exec('sh /backup/scripts/cleanup-backups.sh', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Backup cleanup failed:', error);
      return;
    }
    console.log('✅ Backup cleanup completed:', stdout);
  });
});

console.log('✅ Backup scheduler started successfully');
console.log('📅 Database backup: Every 6 hours');
console.log('📅 Application backup: Daily at 2 AM');
console.log('📅 Cleanup: Weekly on Sunday at 3 AM');

// Keep the process running
process.on('SIGTERM', () => {
  console.log('🛑 Backup scheduler shutting down...');
  process.exit(0);
});