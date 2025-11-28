/**
 * Verification script for Wheel game ZetaChain integration
 * 
 * This script verifies that:
 * 1. ZetaChain config import is present
 * 2. ZetaChain state variables are defined
 * 3. ZetaChain availability check is implemented
 * 4. ZetaChain logging is added to game completion
 * 5. ZetaChain status indicator is in the UI
 */

const fs = require('fs');
const path = require('path');

const WHEEL_PAGE_PATH = path.join(__dirname, '../src/app/game/wheel/page.js');

console.log('🔍 Verifying Wheel game ZetaChain integration...\n');

// Read the Wheel page file
const wheelPageContent = fs.readFileSync(WHEEL_PAGE_PATH, 'utf8');

// Verification checks
const checks = [
  {
    name: 'ZetaChain config import',
    test: () => wheelPageContent.includes("import { isZetaChainConfigured } from '@/config/zetachainConfig'"),
    required: true
  },
  {
    name: 'ZetaChain state variables',
    test: () => {
      return wheelPageContent.includes('const [isZetaChainLogging, setIsZetaChainLogging] = useState(false)') &&
             wheelPageContent.includes('const [zetaChainError, setZetaChainError] = useState(null)') &&
             wheelPageContent.includes('const [zetaChainEnabled, setZetaChainEnabled] = useState(false)');
    },
    required: true
  },
  {
    name: 'Address extraction from useWalletStatus',
    test: () => wheelPageContent.includes('const { isConnected, address } = useWalletStatus()'),
    required: true
  },
  {
    name: 'ZetaChain availability check useEffect',
    test: () => {
      return wheelPageContent.includes('// Check ZetaChain availability (backend handles signing)') &&
             wheelPageContent.includes('const checkZetaChain = async () => {') &&
             wheelPageContent.includes('if (!isZetaChainConfigured())') &&
             wheelPageContent.includes("console.log('✅ ZetaChain logging available for Wheel (backend signing)')");
    },
    required: true
  },
  {
    name: 'ZetaChain logging in generateEntropyInBackground',
    test: () => {
      return wheelPageContent.includes("// Log game result to ZetaChain via backend API (optional, non-blocking)") &&
             wheelPageContent.includes("if (zetaChainEnabled) {") &&
             wheelPageContent.includes("fetch('/api/zetachain/log-game'") &&
             wheelPageContent.includes("gameType: 'WHEEL'") &&
             wheelPageContent.includes('playerAddress: address');
    },
    required: true
  },
  {
    name: 'ZetaChain error handling',
    test: () => {
      return wheelPageContent.includes('setIsZetaChainLogging(true)') &&
             wheelPageContent.includes('setZetaChainError(null)') &&
             wheelPageContent.includes("console.warn('⚠️ Failed to log Wheel game to ZetaChain:', error)") &&
             wheelPageContent.includes('setIsZetaChainLogging(false)');
    },
    required: true
  },
  {
    name: 'ZetaChain transaction hash update',
    test: () => {
      return wheelPageContent.includes('zetachainTxHash: data.txHash') &&
             wheelPageContent.includes("console.log('✅ Wheel game logged to ZetaChain:', data.explorerUrl)");
    },
    required: true
  },
  {
    name: 'ZetaChain status indicator in UI',
    test: () => {
      return wheelPageContent.includes('{/* ZetaChain logging status indicator */}') &&
             wheelPageContent.includes('{zetaChainEnabled && (') &&
             wheelPageContent.includes('{isZetaChainLogging ? (') &&
             wheelPageContent.includes('Logging to ZetaChain...') &&
             wheelPageContent.includes('✓ ZetaChain logging enabled');
    },
    required: true
  },
  {
    name: 'Non-blocking ZetaChain logging',
    test: () => {
      return wheelPageContent.includes("console.log('ℹ️ ZetaChain logging disabled or not configured')");
    },
    required: true
  },
  {
    name: 'Somnia logging still present',
    test: () => {
      return wheelPageContent.includes("// Log game result to Somnia Testnet (non-blocking)") &&
             wheelPageContent.includes("console.log('✅ Wheel game logged to Somnia:', getExplorerUrl(txHash))");
    },
    required: true
  }
];

// Run checks
let passedChecks = 0;
let failedChecks = 0;

checks.forEach((check, index) => {
  const passed = check.test();
  const status = passed ? '✅' : '❌';
  const required = check.required ? '(Required)' : '(Optional)';
  
  console.log(`${status} ${index + 1}. ${check.name} ${required}`);
  
  if (passed) {
    passedChecks++;
  } else {
    failedChecks++;
    if (check.required) {
      console.log(`   ⚠️  This is a required check!`);
    }
  }
});

console.log(`\n📊 Results: ${passedChecks}/${checks.length} checks passed`);

if (failedChecks === 0) {
  console.log('\n✅ All verification checks passed!');
  console.log('\n📋 Implementation Summary:');
  console.log('   • ZetaChain config imported');
  console.log('   • ZetaChain state management added');
  console.log('   • ZetaChain availability check implemented');
  console.log('   • ZetaChain logging integrated (non-blocking)');
  console.log('   • ZetaChain status indicator added to UI');
  console.log('   • Somnia logging preserved (dual logging)');
  console.log('\n🎮 Wheel game is ready for ZetaChain universal logging!');
  process.exit(0);
} else {
  console.log(`\n❌ ${failedChecks} check(s) failed. Please review the implementation.`);
  process.exit(1);
}
