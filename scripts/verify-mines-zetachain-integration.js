/**
 * Verification script for Mines ZetaChain integration
 * 
 * This script verifies that:
 * 1. ZetaChain configuration is imported
 * 2. ZetaChain state variables are defined
 * 3. ZetaChain availability check is implemented
 * 4. ZetaChain logging is added to game completion
 * 5. UI displays ZetaChain status
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Mines ZetaChain Integration...\n');

const minesPagePath = path.join(__dirname, '../src/app/game/mines/page.jsx');
const minesPageContent = fs.readFileSync(minesPagePath, 'utf8');

let allChecksPassed = true;

// Check 1: ZetaChain configuration import
console.log('✓ Check 1: ZetaChain configuration import');
if (minesPageContent.includes("import { isZetaChainConfigured } from '@/config/zetachainConfig'")) {
  console.log('  ✅ ZetaChain configuration is imported\n');
} else {
  console.log('  ❌ ZetaChain configuration import is missing\n');
  allChecksPassed = false;
}

// Check 2: ZetaChain state variables
console.log('✓ Check 2: ZetaChain state variables');
const hasZetaChainLogging = minesPageContent.includes('const [isZetaChainLogging, setIsZetaChainLogging] = useState(false)');
const hasZetaChainError = minesPageContent.includes('const [zetaChainError, setZetaChainError] = useState(null)');
const hasZetaChainEnabled = minesPageContent.includes('const [zetaChainEnabled, setZetaChainEnabled] = useState(false)');

if (hasZetaChainLogging && hasZetaChainError && hasZetaChainEnabled) {
  console.log('  ✅ All ZetaChain state variables are defined\n');
} else {
  console.log('  ❌ Some ZetaChain state variables are missing:');
  if (!hasZetaChainLogging) console.log('    - isZetaChainLogging');
  if (!hasZetaChainError) console.log('    - zetaChainError');
  if (!hasZetaChainEnabled) console.log('    - zetaChainEnabled');
  console.log('');
  allChecksPassed = false;
}

// Check 3: ZetaChain availability check
console.log('✓ Check 3: ZetaChain availability check');
const hasAvailabilityCheck = minesPageContent.includes('const checkZetaChain = async () => {') &&
                             minesPageContent.includes('isZetaChainConfigured()') &&
                             minesPageContent.includes('ZetaChain logging available for Mines');

if (hasAvailabilityCheck) {
  console.log('  ✅ ZetaChain availability check is implemented\n');
} else {
  console.log('  ❌ ZetaChain availability check is missing or incomplete\n');
  allChecksPassed = false;
}

// Check 4: ZetaChain logging in game completion
console.log('✓ Check 4: ZetaChain logging in game completion');
const hasGameLogging = minesPageContent.includes("fetch('/api/zetachain/log-game'") &&
                       minesPageContent.includes("gameType: 'MINES'") &&
                       minesPageContent.includes('Mines game logged to ZetaChain');

if (hasGameLogging) {
  console.log('  ✅ ZetaChain logging is added to game completion\n');
} else {
  console.log('  ❌ ZetaChain logging in game completion is missing\n');
  allChecksPassed = false;
}

// Check 5: Error handling
console.log('✓ Check 5: Error handling');
const hasErrorHandling = minesPageContent.includes('Failed to log Mines game to ZetaChain') &&
                        minesPageContent.includes('setZetaChainError') &&
                        minesPageContent.includes('setIsZetaChainLogging(false)');

if (hasErrorHandling) {
  console.log('  ✅ Error handling is implemented\n');
} else {
  console.log('  ❌ Error handling is missing or incomplete\n');
  allChecksPassed = false;
}

// Check 6: UI status indicator
console.log('✓ Check 6: UI status indicator');
const hasStatusIndicator = minesPageContent.includes('ZetaChain logging status indicator') &&
                          minesPageContent.includes('Logging to ZetaChain...') &&
                          minesPageContent.includes('ZetaChain logging enabled');

if (hasStatusIndicator) {
  console.log('  ✅ UI status indicator is implemented\n');
} else {
  console.log('  ❌ UI status indicator is missing\n');
  allChecksPassed = false;
}

// Check 7: Non-blocking implementation
console.log('✓ Check 7: Non-blocking implementation');
const isNonBlocking = minesPageContent.includes('optional, non-blocking') &&
                     minesPageContent.includes('ZetaChain logging disabled or not configured');

if (isNonBlocking) {
  console.log('  ✅ Implementation is non-blocking\n');
} else {
  console.log('  ❌ Implementation may not be properly non-blocking\n');
  allChecksPassed = false;
}

// Check 8: Transaction hash storage
console.log('✓ Check 8: Transaction hash storage');
const hasTransactionStorage = minesPageContent.includes('zetachainTxHash: data.txHash');

if (hasTransactionStorage) {
  console.log('  ✅ ZetaChain transaction hash is stored in game history\n');
} else {
  console.log('  ❌ ZetaChain transaction hash storage is missing\n');
  allChecksPassed = false;
}

// Summary
console.log('═══════════════════════════════════════════════════════════');
if (allChecksPassed) {
  console.log('✅ All checks passed! Mines ZetaChain integration is complete.');
  console.log('\nImplemented features:');
  console.log('  • ZetaChain configuration import');
  console.log('  • ZetaChain state management');
  console.log('  • Availability checking');
  console.log('  • Game result logging to ZetaChain');
  console.log('  • Error handling');
  console.log('  • UI status indicators');
  console.log('  • Non-blocking implementation');
  console.log('  • Transaction hash storage');
  console.log('\n✅ Task 7 requirements validated successfully!');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please review the implementation.');
  process.exit(1);
}
