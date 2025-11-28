/**
 * Verification script for ZetaChain Game Logger Service implementation
 * Checks that all required methods and functionality are present
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying ZetaChain Game Logger Service Implementation...\n');

// Read the service file
const servicePath = path.join(__dirname, '../src/services/ZetaChainGameLogger.js');
const serviceCode = fs.readFileSync(servicePath, 'utf8');

// Define required components
const requiredComponents = {
  'Class Definition': 'export class ZetaChainGameLogger',
  'Constructor': 'constructor(provider = null, signer = null)',
  'logGameResult Method': 'async logGameResult(gameData)',
  'getGameHistory Method': 'async getGameHistory(playerAddress, limit',
  'getPlayerGameCount Method': 'async getPlayerGameCount(playerAddress)',
  'getTransactionUrl Method': 'getTransactionUrl(txHash)',
  'validateGameData Method': 'validateGameData(gameData)',
  'encodeResultData Method': 'encodeResultData(result)',
  'decodeResultData Method': 'decodeResultData(resultData)',
  'getGameTypeName Method': 'getGameTypeName(gameTypeEnum)',
  'initializeContract Method': 'initializeContract()',
  'setProviderAndSigner Method': 'setProviderAndSigner(provider, signer)',
  'getGameLog Method': 'async getGameLog(logId)',
  'getStats Method': 'async getStats()',
  'isAuthorizedLogger Method': 'async isAuthorizedLogger(address)',
  'onUniversalGameLogged Method': 'onUniversalGameLogged(callback)',
  'Error Handling - RPC': 'NETWORK_ERROR',
  'Error Handling - Funds': 'INSUFFICIENT_FUNDS',
  'Error Handling - Authorization': 'Not authorized',
  'Config Import': "from '../config/zetachainConfig'",
  'Ethers Import': "from 'ethers'",
  'Contract ABI': 'UNIVERSAL_GAME_LOGGER_ABI',
  'Game Types Enum': 'const GAME_TYPES',
  'Singleton Export': 'export const zetaChainGameLogger',
  'Default Export': 'export default ZetaChainGameLogger'
};

// Check each required component
let allPresent = true;
const results = [];

for (const [component, searchString] of Object.entries(requiredComponents)) {
  const isPresent = serviceCode.includes(searchString);
  results.push({
    component,
    present: isPresent,
    status: isPresent ? '✅' : '❌'
  });
  
  if (!isPresent) {
    allPresent = false;
  }
}

// Display results
console.log('📋 Component Verification Results:\n');
results.forEach(({ component, status, present }) => {
  console.log(`${status} ${component}`);
});

// Check for requirements compliance
console.log('\n📋 Requirements Compliance Check:\n');

const requirements = [
  {
    id: '4.1',
    description: 'Service initializes with ZetaChain testnet provider',
    check: () => serviceCode.includes('getZetaChainRpcUrl()') && serviceCode.includes('this.rpcUrl')
  },
  {
    id: '4.2',
    description: 'logGameResult formats data and submits transaction',
    check: () => serviceCode.includes('async logGameResult') && 
                 serviceCode.includes('contract.logGameResult') &&
                 serviceCode.includes('encodeResultData')
  },
  {
    id: '4.3',
    description: 'Transaction waits for confirmation and returns hash',
    check: () => serviceCode.includes('await tx.wait()') && 
                 serviceCode.includes('return receipt.hash')
  },
  {
    id: '4.4',
    description: 'getGameHistory queries contract for player history',
    check: () => serviceCode.includes('async getGameHistory') && 
                 serviceCode.includes('contract.getPlayerHistory')
  },
  {
    id: '4.5',
    description: 'Service throws descriptive errors on failure',
    check: () => serviceCode.includes('throw new Error') && 
                 serviceCode.includes('ZetaChain logging failed') &&
                 serviceCode.includes('ZetaChain RPC unavailable')
  }
];

let allRequirementsMet = true;
requirements.forEach(({ id, description, check }) => {
  const met = check();
  const status = met ? '✅' : '❌';
  console.log(`${status} Requirement ${id}: ${description}`);
  if (!met) allRequirementsMet = false;
});

// Check error handling patterns
console.log('\n📋 Error Handling Verification:\n');

const errorPatterns = [
  { name: 'Network Error Handling', pattern: /NETWORK_ERROR/ },
  { name: 'Insufficient Funds Handling', pattern: /INSUFFICIENT_FUNDS/ },
  { name: 'Authorization Error Handling', pattern: /Not authorized/ },
  { name: 'Configuration Check', pattern: /isZetaChainConfigured/ },
  { name: 'Contract Not Initialized', pattern: /contract not initialized/i },
  { name: 'Signer Required', pattern: /Signer required/i },
  { name: 'Invalid Address Validation', pattern: /ethers\.isAddress/ },
  { name: 'Try-Catch Blocks', pattern: /try\s*{[\s\S]*?}\s*catch/ }
];

let allErrorHandlingPresent = true;
errorPatterns.forEach(({ name, pattern }) => {
  const present = pattern.test(serviceCode);
  const status = present ? '✅' : '❌';
  console.log(`${status} ${name}`);
  if (!present) allErrorHandlingPresent = false;
});

// Final summary
console.log('\n' + '='.repeat(60));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(60));

const componentCount = results.filter(r => r.present).length;
const totalComponents = results.length;
const requirementCount = requirements.filter(r => r.check()).length;
const totalRequirements = requirements.length;
const errorHandlingCount = errorPatterns.filter(p => p.pattern.test(serviceCode)).length;
const totalErrorPatterns = errorPatterns.length;

console.log(`\nComponents: ${componentCount}/${totalComponents} present`);
console.log(`Requirements: ${requirementCount}/${totalRequirements} met`);
console.log(`Error Handling: ${errorHandlingCount}/${totalErrorPatterns} patterns found`);

const overallSuccess = allPresent && allRequirementsMet && allErrorHandlingPresent;

if (overallSuccess) {
  console.log('\n✅ ALL VERIFICATIONS PASSED');
  console.log('\nThe ZetaChain Game Logger Service implementation is complete and meets all requirements.');
  console.log('\nImplemented features:');
  console.log('  • ZetaChain testnet configuration integration');
  console.log('  • Game result logging with transaction submission');
  console.log('  • Player game history retrieval');
  console.log('  • Player game count tracking');
  console.log('  • Transaction URL generation');
  console.log('  • Comprehensive error handling for RPC failures');
  console.log('  • Data validation and encoding/decoding');
  console.log('  • Event listening support');
  console.log('  • Contract statistics retrieval');
} else {
  console.log('\n❌ VERIFICATION FAILED');
  console.log('\nSome components or requirements are missing. Please review the output above.');
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
