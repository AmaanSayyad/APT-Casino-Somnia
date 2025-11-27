/**
 * API Routes Verification Script
 * 
 * Verifies that all API routes are correctly configured for Somnia Testnet migration:
 * - Deposit/Withdraw/Treasury: Somnia Testnet
 * - Entropy APIs: Arbitrum Sepolia (unchanged)
 * - Game Result APIs: Support Somnia transaction hashes
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying API Routes Configuration...\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function checkFile(filePath, checks) {
  console.log(`\n📄 Checking: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log('  ❌ File not found');
    checks.failed++;
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  return { content, checks };
}

function verifyNetwork(content, expectedNetwork, filePath) {
  const results = [];
  
  if (expectedNetwork === 'somnia') {
    // Check for Somnia references
    if (content.includes('somniaTestnetConfig') || content.includes('SOMNIA_')) {
      results.push({ pass: true, msg: '  ✅ Uses Somnia configuration' });
    } else {
      results.push({ pass: false, msg: '  ❌ Missing Somnia configuration' });
    }
    
    // Check for STT token
    if (content.includes('STT')) {
      results.push({ pass: true, msg: '  ✅ Uses STT token' });
    } else {
      results.push({ pass: false, msg: '  ⚠️  No STT token reference' });
    }
    
    // Check for MON token (should not exist)
    if (content.includes('MON') && !content.includes('SOMNIA')) {
      results.push({ pass: false, msg: '  ❌ Still references MON token' });
    }
  } else if (expectedNetwork === 'arbitrum-sepolia') {
    // Check for Arbitrum Sepolia references
    if (content.includes('ARBITRUM_SEPOLIA') || content.includes('arbitrum-sepolia')) {
      results.push({ pass: true, msg: '  ✅ Uses Arbitrum Sepolia configuration' });
    } else {
      results.push({ pass: false, msg: '  ❌ Missing Arbitrum Sepolia configuration' });
    }
  }
  
  return results;
}

// Test 1: Deposit API (should use Somnia)
console.log('\n═══════════════════════════════════════════════════════');
console.log('TEST 1: Deposit API - Somnia Testnet');
console.log('═══════════════════════════════════════════════════════');

const depositPath = path.join(__dirname, '../src/app/api/deposit/route.js');
const depositCheck = checkFile(depositPath);
if (depositCheck) {
  const results = verifyNetwork(depositCheck.content, 'somnia', depositPath);
  results.forEach(r => {
    console.log(r.msg);
    if (r.pass) checks.passed++;
    else checks.failed++;
  });
}

// Test 2: Withdraw API (should use Somnia)
console.log('\n═══════════════════════════════════════════════════════');
console.log('TEST 2: Withdraw API - Somnia Testnet');
console.log('═══════════════════════════════════════════════════════');

const withdrawPath = path.join(__dirname, '../src/app/api/withdraw/route.js');
const withdrawCheck = checkFile(withdrawPath);
if (withdrawCheck) {
  const results = verifyNetwork(withdrawCheck.content, 'somnia', withdrawPath);
  results.forEach(r => {
    console.log(r.msg);
    if (r.pass) checks.passed++;
    else checks.failed++;
  });
}

// Test 3: Treasury Balance API (should use Somnia for treasury, Arbitrum for entropy)
console.log('\n═══════════════════════════════════════════════════════');
console.log('TEST 3: Treasury Balance API - Dual Network');
console.log('═══════════════════════════════════════════════════════');

const treasuryPath = path.join(__dirname, '../src/app/api/treasury-balance/route.js');
const treasuryCheck = checkFile(treasuryPath);
if (treasuryCheck) {
  // Check for both networks
  if (treasuryCheck.content.includes('somniaTestnetConfig')) {
    console.log('  ✅ Uses Somnia for treasury');
    checks.passed++;
  } else {
    console.log('  ❌ Missing Somnia treasury configuration');
    checks.failed++;
  }
  
  if (treasuryCheck.content.includes('PYTH_ENTROPY_CONFIG') || treasuryCheck.content.includes('arbitrum-sepolia')) {
    console.log('  ✅ References Arbitrum Sepolia for entropy');
    checks.passed++;
  } else {
    console.log('  ⚠️  No Arbitrum Sepolia entropy reference');
    checks.warnings++;
  }
}

// Test 4: Generate Entropy API (MUST use Arbitrum Sepolia)
console.log('\n═══════════════════════════════════════════════════════');
console.log('TEST 4: Generate Entropy API - Arbitrum Sepolia (CRITICAL)');
console.log('═══════════════════════════════════════════════════════');

const entropyPath = path.join(__dirname, '../src/app/api/generate-entropy/route.js');
const entropyCheck = checkFile(entropyPath);
if (entropyCheck) {
  const results = verifyNetwork(entropyCheck.content, 'arbitrum-sepolia', entropyPath);
  results.forEach(r => {
    console.log(r.msg);
    if (r.pass) checks.passed++;
    else checks.failed++;
  });
  
  // Critical check: ensure it's NOT using Somnia for actual operations
  const hasSomniaConfig = entropyCheck.content.includes('somniaTestnetConfig') || 
                          entropyCheck.content.includes('SOMNIA_RPC') ||
                          entropyCheck.content.includes('SOMNIA_CONTRACTS');
  
  if (hasSomniaConfig) {
    console.log('  ❌ CRITICAL: Entropy API incorrectly uses Somnia configuration!');
    checks.failed++;
  } else {
    console.log('  ✅ Correctly isolated from Somnia (uses Arbitrum only)');
    checks.passed++;
  }
}

// Test 5: Pyth Entropy Test API (MUST use Arbitrum Sepolia)
console.log('\n═══════════════════════════════════════════════════════');
console.log('TEST 5: Pyth Entropy Test API - Arbitrum Sepolia');
console.log('═══════════════════════════════════════════════════════');

const pythTestPath = path.join(__dirname, '../src/app/api/pyth-entropy-test/route.js');
const pythTestCheck = checkFile(pythTestPath);
if (pythTestCheck) {
  if (pythTestCheck.content.includes('PythEntropyService')) {
    console.log('  ✅ Uses PythEntropyService');
    checks.passed++;
  } else {
    console.log('  ❌ Missing PythEntropyService');
    checks.failed++;
  }
  
  // Check for warning comment
  if (pythTestCheck.content.includes('DO NOT migrate') || 
      pythTestCheck.content.includes('Arbitrum Sepolia')) {
    console.log('  ✅ Has network architecture documentation');
    checks.passed++;
  } else {
    console.log('  ⚠️  Missing network architecture documentation');
    checks.warnings++;
  }
}

// Test 6: Save Game Result API (should support Somnia tx hash)
console.log('\n═══════════════════════════════════════════════════════');
console.log('TEST 6: Save Game Result API - Somnia Integration');
console.log('═══════════════════════════════════════════════════════');

const saveResultPath = path.join(__dirname, '../src/pages/api/games/save-result.js');
const saveResultCheck = checkFile(saveResultPath);
if (saveResultCheck) {
  if (saveResultCheck.content.includes('somniaTxHash')) {
    console.log('  ✅ Accepts Somnia transaction hash');
    checks.passed++;
  } else {
    console.log('  ❌ Missing Somnia transaction hash support');
    checks.failed++;
  }
  
  if (saveResultCheck.content.includes('somniaBlockNumber')) {
    console.log('  ✅ Accepts Somnia block number');
    checks.passed++;
  } else {
    console.log('  ⚠️  Missing Somnia block number support');
    checks.warnings++;
  }
  
  if (saveResultCheck.content.includes('vrfRequestId')) {
    console.log('  ✅ Maintains VRF request ID (Arbitrum Sepolia)');
    checks.passed++;
  } else {
    console.log('  ❌ Missing VRF request ID');
    checks.failed++;
  }
}

// Test 7: Game History API (should return Somnia tx hashes)
console.log('\n═══════════════════════════════════════════════════════');
console.log('TEST 7: Game History API - Dual Network Support');
console.log('═══════════════════════════════════════════════════════');

const historyPath = path.join(__dirname, '../src/pages/api/games/history.js');
const historyCheck = checkFile(historyPath);
if (historyCheck) {
  if (historyCheck.content.includes('GameHistoryService')) {
    console.log('  ✅ Uses GameHistoryService');
    checks.passed++;
  } else {
    console.log('  ❌ Missing GameHistoryService');
    checks.failed++;
  }
  
  if (historyCheck.content.includes('NETWORK ARCHITECTURE') || 
      historyCheck.content.includes('Somnia')) {
    console.log('  ✅ Has network architecture documentation');
    checks.passed++;
  } else {
    console.log('  ⚠️  Missing network architecture documentation');
    checks.warnings++;
  }
}

// Summary
console.log('\n═══════════════════════════════════════════════════════');
console.log('VERIFICATION SUMMARY');
console.log('═══════════════════════════════════════════════════════');
console.log(`✅ Passed: ${checks.passed}`);
console.log(`❌ Failed: ${checks.failed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);

if (checks.failed === 0) {
  console.log('\n🎉 All API routes are correctly configured!');
  console.log('\nNetwork Architecture:');
  console.log('  • Deposits/Withdrawals: Somnia Testnet (STT)');
  console.log('  • Treasury Balance: Somnia Testnet (STT)');
  console.log('  • Game Logging: Somnia Testnet (on-chain verification)');
  console.log('  • Entropy/VRF: Arbitrum Sepolia (provably fair randomness)');
  console.log('\n✅ Requirements 12.1, 12.2, 12.3, 12.4, 12.5 validated');
  process.exit(0);
} else {
  console.log('\n❌ Some API routes need attention. Please review the failures above.');
  process.exit(1);
}
