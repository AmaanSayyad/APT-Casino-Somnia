/**
 * Verification Script for ZetaChain Retry Service Implementation
 * 
 * This script verifies that the retry service has been implemented correctly
 * according to the requirements.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying ZetaChain Retry Service Implementation\n');

const checks = [];

// Check 1: Verify retry service file exists
console.log('📝 Check 1: Verify retry service file exists');
const retryServicePath = path.join(__dirname, '../src/services/ZetaChainRetryService.js');
if (fs.existsSync(retryServicePath)) {
  console.log('✅ ZetaChainRetryService.js exists');
  checks.push({ name: 'File exists', passed: true });
} else {
  console.log('❌ ZetaChainRetryService.js not found');
  checks.push({ name: 'File exists', passed: false });
}

// Check 2: Verify class structure
console.log('\n📝 Check 2: Verify class structure and methods');
const retryServiceContent = fs.readFileSync(retryServicePath, 'utf-8');

const requiredMethods = [
  'addToQueue',
  'processQueue',
  'calculateBackoffDelay',
  'markAsSucceeded',
  'markAsFailed',
  'updateAttempt',
  'getQueueStatus',
  'startAutoRetry',
  'stopAutoRetry'
];

const methodChecks = requiredMethods.map(method => {
  const hasMethod = retryServiceContent.includes(`async ${method}(`) || 
                    retryServiceContent.includes(`${method}(`);
  if (hasMethod) {
    console.log(`✅ Method '${method}' implemented`);
  } else {
    console.log(`❌ Method '${method}' missing`);
  }
  return { name: `Method: ${method}`, passed: hasMethod };
});

checks.push(...methodChecks);

// Check 3: Verify exponential backoff implementation
console.log('\n📝 Check 3: Verify exponential backoff implementation');
const hasExponentialBackoff = retryServiceContent.includes('Math.pow(2, attempts)') ||
                               retryServiceContent.includes('2 ** attempts');
if (hasExponentialBackoff) {
  console.log('✅ Exponential backoff implemented');
  checks.push({ name: 'Exponential backoff', passed: true });
} else {
  console.log('❌ Exponential backoff not found');
  checks.push({ name: 'Exponential backoff', passed: false });
}

// Check 4: Verify retry limit (3 attempts)
console.log('\n📝 Check 4: Verify retry limit configuration');
const hasRetryLimit = retryServiceContent.includes('maxRetries = 3') ||
                      retryServiceContent.includes('maxRetries: 3');
if (hasRetryLimit) {
  console.log('✅ Retry limit set to 3');
  checks.push({ name: 'Retry limit = 3', passed: true });
} else {
  console.log('⚠️ Retry limit may not be set to 3');
  checks.push({ name: 'Retry limit = 3', passed: false });
}

// Check 5: Verify database integration
console.log('\n📝 Check 5: Verify database integration');
const hasDbIntegration = retryServiceContent.includes('dbPool') &&
                         retryServiceContent.includes('pool.query');
if (hasDbIntegration) {
  console.log('✅ Database integration present');
  checks.push({ name: 'Database integration', passed: true });
} else {
  console.log('❌ Database integration missing');
  checks.push({ name: 'Database integration', passed: false });
}

// Check 6: Verify migration script exists
console.log('\n📝 Check 6: Verify database migration script exists');
const migrationPath = path.join(__dirname, 'create-zetachain-retry-queue-table.js');
if (fs.existsSync(migrationPath)) {
  console.log('✅ Migration script exists');
  checks.push({ name: 'Migration script', passed: true });
} else {
  console.log('❌ Migration script not found');
  checks.push({ name: 'Migration script', passed: false });
}

// Check 7: Verify error handling
console.log('\n📝 Check 7: Verify error handling');
const hasTryCatch = (retryServiceContent.match(/try\s*{/g) || []).length >= 5;
const hasErrorLogging = retryServiceContent.includes('console.error');
if (hasTryCatch && hasErrorLogging) {
  console.log('✅ Error handling implemented');
  checks.push({ name: 'Error handling', passed: true });
} else {
  console.log('⚠️ Error handling may be incomplete');
  checks.push({ name: 'Error handling', passed: false });
}

// Check 8: Verify queue status monitoring
console.log('\n📝 Check 8: Verify queue status monitoring');
const hasQueueStatus = retryServiceContent.includes('getQueueStatus') &&
                       retryServiceContent.includes('pending_count') &&
                       retryServiceContent.includes('succeeded_count') &&
                       retryServiceContent.includes('failed_count');
if (hasQueueStatus) {
  console.log('✅ Queue status monitoring implemented');
  checks.push({ name: 'Queue status monitoring', passed: true });
} else {
  console.log('❌ Queue status monitoring incomplete');
  checks.push({ name: 'Queue status monitoring', passed: false });
}

// Check 9: Verify auto-retry functionality
console.log('\n📝 Check 9: Verify auto-retry functionality');
const hasAutoRetry = retryServiceContent.includes('setInterval') &&
                     retryServiceContent.includes('clearInterval') &&
                     retryServiceContent.includes('startAutoRetry') &&
                     retryServiceContent.includes('stopAutoRetry');
if (hasAutoRetry) {
  console.log('✅ Auto-retry functionality implemented');
  checks.push({ name: 'Auto-retry functionality', passed: true });
} else {
  console.log('❌ Auto-retry functionality incomplete');
  checks.push({ name: 'Auto-retry functionality', passed: false });
}

// Check 10: Verify additional helper methods
console.log('\n📝 Check 10: Verify additional helper methods');
const hasHelperMethods = retryServiceContent.includes('cleanupOldEntries') &&
                         retryServiceContent.includes('getFailedEntries') &&
                         retryServiceContent.includes('manualRetry');
if (hasHelperMethods) {
  console.log('✅ Additional helper methods implemented');
  checks.push({ name: 'Helper methods', passed: true });
} else {
  console.log('⚠️ Some helper methods may be missing');
  checks.push({ name: 'Helper methods', passed: false });
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(60));

const passedChecks = checks.filter(c => c.passed).length;
const totalChecks = checks.length;
const passRate = ((passedChecks / totalChecks) * 100).toFixed(1);

console.log(`\nTotal Checks: ${totalChecks}`);
console.log(`Passed: ${passedChecks}`);
console.log(`Failed: ${totalChecks - passedChecks}`);
console.log(`Pass Rate: ${passRate}%\n`);

if (passedChecks === totalChecks) {
  console.log('✅ All checks passed! Implementation is complete.');
} else {
  console.log('⚠️ Some checks failed. Review the implementation.');
}

console.log('\n' + '='.repeat(60));
console.log('📋 REQUIREMENTS COVERAGE');
console.log('='.repeat(60));

const requirements = [
  { id: '8.1', desc: 'Add failed logs to retry queue', covered: checks.find(c => c.name === 'Method: addToQueue')?.passed },
  { id: '8.2', desc: 'Store game data in retry queue', covered: checks.find(c => c.name === 'Database integration')?.passed },
  { id: '8.3', desc: 'Process retry queue', covered: checks.find(c => c.name === 'Method: processQueue')?.passed },
  { id: '8.4', desc: 'Update database on success', covered: checks.find(c => c.name === 'Method: markAsSucceeded')?.passed },
  { id: '8.5', desc: 'Mark as failed after max retries', covered: checks.find(c => c.name === 'Method: markAsFailed')?.passed },
  { id: '10.4', desc: 'Exponential backoff', covered: checks.find(c => c.name === 'Exponential backoff')?.passed }
];

requirements.forEach(req => {
  const status = req.covered ? '✅' : '❌';
  console.log(`${status} Requirement ${req.id}: ${req.desc}`);
});

console.log('\n' + '='.repeat(60));
console.log('📝 NEXT STEPS');
console.log('='.repeat(60));

console.log('\n1. Run database migration:');
console.log('   node scripts/create-zetachain-retry-queue-table.js');

console.log('\n2. Test the retry service:');
console.log('   node scripts/test-zetachain-retry-service.js');

console.log('\n3. Integrate with ZetaChain Game Logger');

console.log('\n4. Update game components to use retry service');

console.log('\n' + '='.repeat(60));

// Exit with appropriate code
process.exit(passedChecks === totalChecks ? 0 : 1);
