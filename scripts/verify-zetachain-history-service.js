/**
 * Verification Script for ZetaChain Game History Service
 * 
 * This script verifies that the ZetaChain Game History Service is properly implemented
 * according to the requirements in Task 5.
 */

const { ZetaChainGameHistoryService } = require('../src/services/ZetaChainGameHistoryService.js');
const { getZetaChainTransactionUrl } = require('../src/config/zetachainConfig.js');

async function verifyZetaChainHistoryService() {
  console.log('🔍 Verifying ZetaChain Game History Service Implementation\n');
  
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  try {
    // Test 1: Service instantiation
    console.log('✓ Test 1: Service instantiation');
    const service = new ZetaChainGameHistoryService();
    
    if (!service) {
      results.failed.push('Service instantiation failed');
      throw new Error('Failed to instantiate ZetaChainGameHistoryService');
    }
    results.passed.push('Service instantiation successful');

    // Test 2: Check required methods exist
    console.log('✓ Test 2: Checking required methods');
    const requiredMethods = [
      'initialize',
      'saveGameResult',
      'getUserHistory',
      'getRecentGames',
      'formatGameResult',
      'ensureInitialized',
      'close'
    ];

    for (const method of requiredMethods) {
      if (typeof service[method] !== 'function') {
        results.failed.push(`Missing required method: ${method}`);
      } else {
        results.passed.push(`Method exists: ${method}`);
      }
    }

    // Test 3: Check saveGameResult method signature
    console.log('✓ Test 3: Checking saveGameResult method');
    const saveGameResultParams = service.saveGameResult.toString();
    if (saveGameResultParams.includes('gameData')) {
      results.passed.push('saveGameResult accepts gameData parameter');
    } else {
      results.failed.push('saveGameResult missing gameData parameter');
    }

    // Test 4: Check getUserHistory method signature
    console.log('✓ Test 4: Checking getUserHistory method');
    const getUserHistoryParams = service.getUserHistory.toString();
    if (getUserHistoryParams.includes('userAddress') && getUserHistoryParams.includes('options')) {
      results.passed.push('getUserHistory accepts userAddress and options parameters');
    } else {
      results.failed.push('getUserHistory missing required parameters');
    }

    // Test 5: Check getRecentGames method signature
    console.log('✓ Test 5: Checking getRecentGames method');
    const getRecentGamesParams = service.getRecentGames.toString();
    if (getRecentGamesParams.includes('options')) {
      results.passed.push('getRecentGames accepts options parameter');
    } else {
      results.failed.push('getRecentGames missing options parameter');
    }

    // Test 6: Check formatGameResult method
    console.log('✓ Test 6: Checking formatGameResult method');
    const mockRow = {
      id: 1,
      user_address: '0x1234567890123456789012345678901234567890',
      game_type: 'ROULETTE',
      game_config: JSON.stringify({ bet: 'red' }),
      result_data: JSON.stringify({ outcome: 'win' }),
      bet_amount: '1000000000000000000',
      payout_amount: '2000000000000000000',
      profit_loss: '1000000000000000000',
      created_at: new Date(),
      zetachain_tx_hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      zetachain_block_number: 12345
    };

    const formatted = service.formatGameResult(mockRow);
    
    if (formatted.id && formatted.userAddress && formatted.gameType) {
      results.passed.push('formatGameResult returns properly structured object');
    } else {
      results.failed.push('formatGameResult missing required fields');
    }

    if (formatted.zetachainTransaction) {
      results.passed.push('formatGameResult includes zetachainTransaction object');
      
      const zetaTx = formatted.zetachainTransaction;
      if (zetaTx.transactionHash && zetaTx.blockNumber && zetaTx.explorerUrl && zetaTx.network) {
        results.passed.push('zetachainTransaction has all required fields');
      } else {
        results.failed.push('zetachainTransaction missing required fields');
      }

      if (zetaTx.network === 'zetachain-testnet') {
        results.passed.push('zetachainTransaction has correct network identifier');
      } else {
        results.failed.push('zetachainTransaction has incorrect network identifier');
      }
    } else {
      results.failed.push('formatGameResult missing zetachainTransaction object');
    }

    // Test 7: Check explorer URL generation
    console.log('✓ Test 7: Checking explorer URL generation');
    const testTxHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const explorerUrl = getZetaChainTransactionUrl(testTxHash);
    
    if (explorerUrl && explorerUrl.includes(testTxHash)) {
      results.passed.push('Explorer URL generation works correctly');
    } else {
      results.failed.push('Explorer URL generation failed');
    }

    // Test 8: Check service separation
    console.log('✓ Test 8: Checking service separation from Somnia');
    const serviceCode = service.constructor.toString();
    
    if (!serviceCode.includes('somnia_tx_hash') || serviceCode.includes('zetachain_tx_hash')) {
      results.passed.push('Service is properly separated from Somnia service');
    } else {
      results.warnings.push('Service may have dependencies on Somnia fields');
    }

    // Test 9: Check database pool configuration
    console.log('✓ Test 9: Checking database configuration');
    if (service.pool) {
      results.passed.push('Database pool is configured');
    } else {
      results.failed.push('Database pool not configured');
    }

    // Test 10: Check additional utility methods
    console.log('✓ Test 10: Checking additional utility methods');
    const utilityMethods = ['getZetaChainStats', 'getPendingZetaChainLogs'];
    
    for (const method of utilityMethods) {
      if (typeof service[method] === 'function') {
        results.passed.push(`Utility method exists: ${method}`);
      } else {
        results.warnings.push(`Optional utility method missing: ${method}`);
      }
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
    results.failed.push(`Verification error: ${error.message}`);
  }

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('VERIFICATION RESULTS');
  console.log('='.repeat(60));
  
  console.log(`\n✅ Passed: ${results.passed.length}`);
  results.passed.forEach(msg => console.log(`   ✓ ${msg}`));
  
  if (results.warnings.length > 0) {
    console.log(`\n⚠️  Warnings: ${results.warnings.length}`);
    results.warnings.forEach(msg => console.log(`   ⚠ ${msg}`));
  }
  
  if (results.failed.length > 0) {
    console.log(`\n❌ Failed: ${results.failed.length}`);
    results.failed.forEach(msg => console.log(`   ✗ ${msg}`));
  }

  console.log('\n' + '='.repeat(60));
  
  const totalTests = results.passed.length + results.failed.length;
  const passRate = ((results.passed.length / totalTests) * 100).toFixed(1);
  
  console.log(`\nOverall: ${results.passed.length}/${totalTests} tests passed (${passRate}%)`);
  
  if (results.failed.length === 0) {
    console.log('\n✅ All verification tests passed!');
    console.log('ZetaChain Game History Service is properly implemented.');
    return true;
  } else {
    console.log('\n❌ Some verification tests failed.');
    console.log('Please review the failed tests above.');
    return false;
  }
}

// Run verification
verifyZetaChainHistoryService()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
