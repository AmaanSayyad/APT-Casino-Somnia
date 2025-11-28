/**
 * Test script for ZetaChain Game Logger Service
 * Verifies the service implementation without requiring actual blockchain transactions
 */

import { ethers } from 'ethers';
import { ZetaChainGameLogger } from '../src/services/ZetaChainGameLogger.js';

// Mock the config module
const mockConfig = {
  getZetaChainConfig: () => ({
    id: 7001,
    name: 'ZetaChain Athens Testnet',
    rpcUrls: { default: { http: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'] } }
  }),
  getZetaChainRpcUrl: () => 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
  getZetaChainExplorerUrl: () => 'https://athens.explorer.zetachain.com',
  getUniversalGameLoggerAddress: () => process.env.NEXT_PUBLIC_ZETACHAIN_GAME_LOGGER_ADDRESS || '0x0000000000000000000000000000000000000000',
  getZetaChainTransactionUrl: (txHash) => `https://athens.explorer.zetachain.com/tx/${txHash}`,
  isZetaChainConfigured: () => !!(process.env.NEXT_PUBLIC_ZETACHAIN_GAME_LOGGER_ADDRESS)
};

// Test the service structure
async function testZetaChainGameLoggerService() {
  console.log('🧪 Testing ZetaChain Game Logger Service...\n');

  try {
    console.log('✅ Service imported successfully');

    // Test 1: Service instantiation
    console.log('\n📋 Test 1: Service Instantiation');
    const logger = new ZetaChainGameLogger();
    console.log('✅ Service instantiated without errors');
    console.log('   - Contract Address:', logger.contractAddress || 'Not configured');
    console.log('   - Explorer URL:', logger.explorerUrl);
    console.log('   - RPC URL:', logger.rpcUrl);

    // Test 2: getTransactionUrl method
    console.log('\n📋 Test 2: getTransactionUrl Method');
    const testTxHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const txUrl = logger.getTransactionUrl(testTxHash);
    console.log('✅ Transaction URL generated:', txUrl);
    
    if (!txUrl.includes('athens.explorer.zetachain.com/tx/')) {
      throw new Error('Transaction URL format incorrect');
    }
    if (!txUrl.includes(testTxHash)) {
      throw new Error('Transaction hash not included in URL');
    }
    console.log('✅ URL format validation passed');

    // Test 3: validateGameData method
    console.log('\n📋 Test 3: validateGameData Method');
    const validGameData = {
      gameType: 'ROULETTE',
      playerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      betAmount: 1.0,
      result: { number: 7, color: 'red' },
      payout: 2.0,
      entropyProof: {
        requestId: '0xabcd',
        transactionHash: '0x1234'
      }
    };

    try {
      logger.validateGameData(validGameData);
      console.log('✅ Valid game data passed validation');
    } catch (error) {
      throw new Error(`Valid data failed validation: ${error.message}`);
    }

    // Test invalid data
    const invalidGameData = {
      gameType: 'ROULETTE',
      playerAddress: 'invalid-address',
      betAmount: 1.0,
      result: { number: 7 },
      payout: 2.0
    };

    try {
      logger.validateGameData(invalidGameData);
      throw new Error('Invalid data should have failed validation');
    } catch (error) {
      if (error.message.includes('Valid player address is required')) {
        console.log('✅ Invalid player address correctly rejected');
      } else {
        throw error;
      }
    }

    // Test 4: encodeResultData and decodeResultData
    console.log('\n📋 Test 4: Result Data Encoding/Decoding');
    const testResult = {
      number: 7,
      color: 'red',
      multiplier: 2,
      timestamp: Date.now()
    };

    const encoded = logger.encodeResultData(testResult);
    console.log('✅ Result data encoded');

    const decoded = logger.decodeResultData(encoded);
    console.log('✅ Result data decoded');

    if (JSON.stringify(decoded) !== JSON.stringify(testResult)) {
      throw new Error('Decoded data does not match original');
    }
    console.log('✅ Round-trip encoding/decoding successful');

    // Test 5: getGameTypeName method
    console.log('\n📋 Test 5: getGameTypeName Method');
    const gameTypes = [
      { enum: 0, expected: 'ROULETTE' },
      { enum: 1, expected: 'MINES' },
      { enum: 2, expected: 'WHEEL' },
      { enum: 3, expected: 'PLINKO' }
    ];

    for (const { enum: enumValue, expected } of gameTypes) {
      const name = logger.getGameTypeName(enumValue);
      if (name !== expected) {
        throw new Error(`Game type ${enumValue} returned ${name}, expected ${expected}`);
      }
    }
    console.log('✅ All game type names correct');

    // Test 6: Error handling
    console.log('\n📋 Test 6: Error Handling');
    
    // Test missing game type
    try {
      logger.validateGameData({ ...validGameData, gameType: null });
      throw new Error('Should have thrown error for missing game type');
    } catch (error) {
      if (error.message.includes('Game type is required')) {
        console.log('✅ Missing game type error handled correctly');
      } else {
        throw error;
      }
    }

    // Test negative bet amount
    try {
      logger.validateGameData({ ...validGameData, betAmount: -1 });
      throw new Error('Should have thrown error for negative bet amount');
    } catch (error) {
      if (error.message.includes('Valid bet amount is required')) {
        console.log('✅ Negative bet amount error handled correctly');
      } else {
        throw error;
      }
    }

    // Test missing result
    try {
      logger.validateGameData({ ...validGameData, result: null });
      throw new Error('Should have thrown error for missing result');
    } catch (error) {
      if (error.message.includes('Game result is required')) {
        console.log('✅ Missing result error handled correctly');
      } else {
        throw error;
      }
    }

    console.log('\n✅ All tests passed!');
    console.log('\n📊 Summary:');
    console.log('   - Service instantiation: ✅');
    console.log('   - Transaction URL generation: ✅');
    console.log('   - Game data validation: ✅');
    console.log('   - Result encoding/decoding: ✅');
    console.log('   - Game type mapping: ✅');
    console.log('   - Error handling: ✅');

    return true;

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Run tests
testZetaChainGameLoggerService()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
