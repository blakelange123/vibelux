#!/usr/bin/env node

const { runButtonAudit } = require('../src/utils/buttonAudit.ts')

// Run the audit
runButtonAudit('./src')
  .then(() => {
    console.log('Button audit completed successfully')
  })
  .catch((error) => {
    console.error('Button audit failed:', error)
    process.exit(1)
  })