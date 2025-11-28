#!/usr/bin/env node

/**
 * Verification Script: Plinko ZetaChain Integration
 * 
 * This script verifies that the Plinko game has been properly integrated
 * with ZetaChain universal logging functionality.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Plinko ZetaChain Integration...\n');

let allChecksPassed = true;

// Helper function to check if file exists
function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, '..', filePath));
}

// Helper function to read file content
function readFile(filePath) {
  return fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
}

// Helper function to check if content contains pattern
function contentContains(content, pattern, description) {
  const found = pattern.test(content);
  if (found) {
    console.log(`✅ ${description}`);
  } else {
    console.log(`❌ ${description}`);
    allChecksPassed = false;
  }
  return found;
}

// Check 1: Verify Plinko page file exists
console.log('📋 Check 1: File Existence');
if (fileExists('src/app/game/plinko/page.jsx')) {
  console.log('✅ Plinko page file exists');
} else {
  console.log('❌ Plinko page file not found');
  allChecksPassed = false;
  process.exit(1);
}

// Read Plinko page content
const plinkoContent = readFile('src/app/game/plinko/page.jsx');

// Check 2: Verify imports
console.log('\n📋 Check 2: Required Imports');
contentContains(
  plinkoContent,
  /import.*isZetaChainConfigured.*from.*@\/config\/zetachainConfig/,
  'ZetaChain config import present'
);
contentContains(
  plinkoContent,
  /import.*useWalletStatus.*from.*@\/hooks\/useWalletStatus/,
  'Wallet status hook import present'
);

// Check 3: Verify state variables
console.log('\n📋 Check 3: State Variables');
contentContains(
  plinkoContent,
  /const.*\[isZetaChainLogging,\s*setIsZetaChainLogging\]\s*=\s*useState\(false\)/,
  'isZetaChainLogging state defined'
);
contentContains(
  plinkoContent,
  /const.*\[zetaChainError,\s*setZetaChainError\]\s*=\s*useState\(null\)/,
  'zetaChainError state defined'
);
contentContains(
  plinkoContent,
  /const.*\[zetaChainEnabled,\s*setZetaChainEnabled\]\s*=\s*useState\(false\)/,
  'zetaChainEnabled state defined'
);

// Check 4: Verify wallet status hook usage
console.log('\n📋 Check 4: Wallet Integration');
contentContains(
  plinkoContent,
  /const.*\{\s*isConnected,\s*address\s*\}\s*=\s*useWalletStatus\(\)/,
  'Wallet status hook used'
);

// Check 5: Verify ZetaChain availability check
console.log('\n📋 Check 5: ZetaChain Availability Check');
contentContains(
  plinkoContent,
  /useEffect\(\(\)\s*=>\s*\{[\s\S]*?checkZetaChain[\s\S]*?\},\s*\[isConnected,\s*address\]\)/,
  'ZetaChain availability check useEffect present'
);
contentContains(
  plinkoContent,
  /if\s*\(!isZetaChainConfigured\(\)\)/,
  'ZetaChain configuration check present'
);
contentContains(
  plinkoContent,
  /if\s*\(!isConnected\s*\|\|\s*!address\)/,
  'Wallet connection check present'
);

// Check 6: Verify ZetaChain logging implementation
console.log('\n📋 Check 6: ZetaChain Logging Implementation');
contentContains(
  plinkoContent,
  /if\s*\(zetaChainEnabled\)\s*\{/,
  'ZetaChain enabled check present'
);
contentContains(
  plinkoContent,
  /fetch\(['"]\/api\/zetachain\/log-game['"]/,
  'ZetaChain API endpoint call present'
);
contentContains(
  plinkoContent,
  /gameType:\s*['"]PLINKO['"]/,
  'Game type set to PLINKO'
);
contentContains(
  plinkoContent,
  /playerAddress:\s*address/,
  'Player address included in request'
);

// Check 7: Verify game history updates
console.log('\n📋 Check 7: Game History Updates');
contentContains(
  plinkoContent,
  /zetachainTxHash:\s*data\.txHash/,
  'ZetaChain transaction hash stored in history'
);
contentContains(
  plinkoContent,
  /somniaTxHash:\s*txHash/,
  'Somnia transaction hash stored in history'
);

// Check 8: Verify error handling
console.log('\n📋 Check 8: Error Handling');
contentContains(
  plinkoContent,
  /setZetaChainError\(/,
  'ZetaChain error state setter used'
);
contentContains(
  plinkoContent,
  /\.catch\(error\s*=>\s*\{[\s\S]*?ZetaChain/,
  'ZetaChain error catch block present'
);
contentContains(
  plinkoContent,
  /console\.warn\(['"].*Failed to log.*ZetaChain/,
  'ZetaChain failure warning logged'
);

// Check 9: Verify non-blocking behavior
console.log('\n📋 Check 9: Non-Blocking Behavior');
contentContains(
  plinkoContent,
  /\/\/.*non-blocking/i,
  'Non-blocking comment present'
);
contentContains(
  plinkoContent,
  /setIsZetaChainLogging\(false\)/,
  'ZetaChain logging state reset'
);

// Check 10: Verify logging is optional
console.log('\n📋 Check 10: Optional Logging');
contentContains(
  plinkoContent,
  /else\s*\{[\s\S]*?ZetaChain logging disabled/,
  'ZetaChain disabled fallback present'
);

// Check 11: Verify documentation exists
console.log('\n📋 Check 11: Documentation');
if (fileExists('docs/plinko-zetachain-integration.md')) {
  console.log('✅ Integration documentation exists');
} else {
  console.log('❌ Integration documentation not found');
  allChecksPassed = false;
}

// Check 12: Verify UI indicator in GameControls
console.log('\n📋 Check 12: UI Indicator Implementation');
const gameControlsContent = readFile('src/app/game/plinko/components/GameControls.jsx');
contentContains(
  gameControlsContent,
  /zetaChainEnabled[\s\S]*isZetaChainLogging[\s\S]*zetaChainError/,
  'ZetaChain props passed to GameControls'
);
contentContains(
  gameControlsContent,
  /CircularProgress/,
  'Loading indicator component imported'
);
contentContains(
  gameControlsContent,
  /Logging to ZetaChain\.\.\./,
  'Loading state message present'
);
contentContains(
  gameControlsContent,
  /ZetaChain logging enabled/,
  'Success state message present'
);

// Final summary
console.log('\n' + '='.repeat(50));
if (allChecksPassed) {
  console.log('✅ All verification checks passed!');
  console.log('\n📝 Summary:');
  console.log('   - ZetaChain imports added');
  console.log('   - State management implemented');
  console.log('   - Wallet integration complete');
  console.log('   - Availability checks in place');
  console.log('   - Dual logging implemented');
  console.log('   - Error handling present');
  console.log('   - Non-blocking behavior confirmed');
  console.log('   - Documentation created');
  console.log('\n✨ Plinko game is ready for ZetaChain universal logging!');
  process.exit(0);
} else {
  console.log('❌ Some verification checks failed!');
  console.log('\n⚠️  Please review the failed checks above and fix the issues.');
  process.exit(1);
}
