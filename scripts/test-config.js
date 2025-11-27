/**
 * Test Config Loading
 */

require('dotenv').config();

console.log('🔍 Testing Config Loading...\n');

// Test environment variables
console.log('Environment Variables:');
console.log('  NEXT_PUBLIC_SOMNIA_GAME_LOGGER_ADDRESS:', process.env.NEXT_PUBLIC_SOMNIA_GAME_LOGGER_ADDRESS);
console.log('  NEXT_PUBLIC_SOMNIA_TREASURY_ADDRESS:', process.env.NEXT_PUBLIC_SOMNIA_TREASURY_ADDRESS);
console.log('  NEXT_PUBLIC_SOMNIA_STREAMS_ADDRESS:', process.env.NEXT_PUBLIC_SOMNIA_STREAMS_ADDRESS);

// Test config import (CommonJS style for Node.js)
const contractsConfig = require('../src/config/contracts.js');

console.log('\nConfig Values:');
console.log('  SOMNIA_NETWORKS:', contractsConfig.SOMNIA_NETWORKS);
console.log('  SOMNIA_CONTRACTS:', contractsConfig.SOMNIA_CONTRACTS);

const testnetContracts = contractsConfig.SOMNIA_CONTRACTS['somnia-testnet'];
console.log('\nSomnia Testnet Contracts:');
console.log('  treasury:', testnetContracts?.treasury);
console.log('  gameLogger:', testnetContracts?.gameLogger);
console.log('  streams:', testnetContracts?.streams);

if (!testnetContracts?.gameLogger) {
  console.error('\n❌ ERROR: GameLogger address not found in config!');
  process.exit(1);
}

console.log('\n✅ Config loaded successfully!');
