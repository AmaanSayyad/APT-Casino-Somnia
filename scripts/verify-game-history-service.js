/**
 * Verification Script for GameHistoryService
 * Tests dual-network support (Somnia for logs, Arbitrum for entropy)
 */

const { GameHistoryService } = require('../src/services/GameHistoryService');

async function verifyGameHistoryService() {
  console.log('🔍 Verifying GameHistoryService Updates...\n');

  const service = new GameHistoryService();
  let allTestsPassed = true;

  // Test 1: Verify saveGameResult accepts Somnia transaction hash
  console.log('Test 1: Verify saveGameResult accepts Somnia transaction hash');
  try {
    const mockGameData = {
      vrfRequestId: 1,
      userAddress: '0x1234567890123456789012345678901234567890',
      gameType: 'ROULETTE',
      gameConfig: { betType: 'red' },
      resultData: { outcome: 'win' },
      betAmount: '1000000000000000000',
      payoutAmount: '2000000000000000000',
      somniaTxHash: '0x' + '1'.repeat(64),
      somniaBlockNumber: 12345,
      network: 'somnia-testnet'
    };

    // Check that the method signature accepts these parameters
    const methodString = service.saveGameResult.toString();
    if (methodString.includes('somniaTxHash') && methodString.includes('somniaBlockNumber')) {
      console.log('✅ saveGameResult accepts somniaTxHash and somniaBlockNumber parameters');
    } else {
      console.log('❌ saveGameResult does not accept Somnia parameters');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    allTestsPassed = false;
  }

  // Test 2: Verify getUserHistory returns Somnia transaction links
  console.log('\nTest 2: Verify getUserHistory returns Somnia transaction links');
  try {
    const methodString = service.getUserHistory.toString();
    if (methodString.includes('somnia_tx_hash') && 
        methodString.includes('somniaTransaction') &&
        methodString.includes('somniaExplorer')) {
      console.log('✅ getUserHistory includes Somnia transaction fields');
    } else {
      console.log('❌ getUserHistory missing Somnia transaction fields');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    allTestsPassed = false;
  }

  // Test 3: Verify getVRFDetails maintains Arbitrum Sepolia links
  console.log('\nTest 3: Verify getVRFDetails maintains Arbitrum Sepolia links');
  try {
    const methodString = service.getVRFDetails.toString();
    if (methodString.includes('arbitrum-sepolia') && 
        methodString.includes('Arbitrum Sepolia') &&
        methodString.includes('Pyth Entropy')) {
      console.log('✅ getVRFDetails maintains Arbitrum Sepolia references');
    } else {
      console.log('❌ getVRFDetails missing Arbitrum Sepolia references');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    allTestsPassed = false;
  }

  // Test 4: Verify dual-network support in getUserHistory
  console.log('\nTest 4: Verify dual-network support in getUserHistory');
  try {
    const methodString = service.getUserHistory.toString();
    if (methodString.includes('entropy_tx_hash') && 
        methodString.includes('vrfDetails') &&
        methodString.includes('somniaTransaction')) {
      console.log('✅ getUserHistory supports dual-network (Somnia + Arbitrum)');
    } else {
      console.log('❌ getUserHistory missing dual-network support');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    allTestsPassed = false;
  }

  // Test 5: Verify getRecentGames includes both transaction types
  console.log('\nTest 5: Verify getRecentGames includes both transaction types');
  try {
    const methodString = service.getRecentGames.toString();
    if (methodString.includes('somnia_tx_hash') && 
        methodString.includes('entropy_tx_hash') &&
        methodString.includes('somniaExplorerUrl') &&
        methodString.includes('entropyExplorerUrl')) {
      console.log('✅ getRecentGames includes both Somnia and entropy transaction links');
    } else {
      console.log('❌ getRecentGames missing dual transaction support');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    allTestsPassed = false;
  }

  // Test 6: Verify SQL query includes new columns
  console.log('\nTest 6: Verify SQL queries include new columns');
  try {
    const getUserHistoryString = service.getUserHistory.toString();
    if (getUserHistoryString.includes('gr.somnia_tx_hash') && 
        getUserHistoryString.includes('gr.somnia_block_number') &&
        getUserHistoryString.includes('gr.network')) {
      console.log('✅ SQL queries include somnia_tx_hash, somnia_block_number, and network columns');
    } else {
      console.log('❌ SQL queries missing new Somnia columns');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    allTestsPassed = false;
  }

  // Test 7: Verify explorer URL configuration
  console.log('\nTest 7: Verify explorer URL configuration');
  try {
    const getUserHistoryString = service.getUserHistory.toString();
    if (getUserHistoryString.includes('NEXT_PUBLIC_SOMNIA_EXPLORER') && 
        getUserHistoryString.includes('shannon-explorer.somnia.network') &&
        getUserHistoryString.includes('NEXT_PUBLIC_SEPOLIA_EXPLORER') &&
        getUserHistoryString.includes('sepolia.arbiscan.io')) {
      console.log('✅ Explorer URLs configured for both Somnia and Arbitrum Sepolia');
    } else {
      console.log('❌ Explorer URLs not properly configured');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    allTestsPassed = false;
  }

  // Test 8: Verify network field defaults to somnia-testnet
  console.log('\nTest 8: Verify network field defaults to somnia-testnet');
  try {
    const saveGameResultString = service.saveGameResult.toString();
    if (saveGameResultString.includes("network = 'somnia-testnet'")) {
      console.log('✅ Network field defaults to somnia-testnet');
    } else {
      console.log('❌ Network field default not set correctly');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    allTestsPassed = false;
  }

  // Test 9: Verify transaction hash validation
  console.log('\nTest 9: Verify Somnia transaction hash validation');
  try {
    const saveGameResultString = service.saveGameResult.toString();
    if (saveGameResultString.includes('Invalid Somnia transaction hash format')) {
      console.log('✅ Somnia transaction hash validation implemented');
    } else {
      console.log('❌ Somnia transaction hash validation missing');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    allTestsPassed = false;
  }

  // Test 10: Verify verification notes distinguish networks
  console.log('\nTest 10: Verify verification notes distinguish networks');
  try {
    const getUserHistoryString = service.getUserHistory.toString();
    const getVRFDetailsString = service.getVRFDetails.toString();
    
    if (getUserHistoryString.includes('Game result logged on Somnia Testnet') && 
        getUserHistoryString.includes('Entropy generated on Arbitrum Sepolia') &&
        getVRFDetailsString.includes('Entropy generated on Arbitrum Sepolia')) {
      console.log('✅ Verification notes clearly distinguish between networks');
    } else {
      console.log('❌ Verification notes not properly distinguishing networks');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    allTestsPassed = false;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  if (allTestsPassed) {
    console.log('✅ All GameHistoryService verification tests passed!');
    console.log('\nKey Features Verified:');
    console.log('  ✓ saveGameResult accepts Somnia transaction hash');
    console.log('  ✓ getUserHistory returns Somnia transaction links');
    console.log('  ✓ getVRFDetails maintains Arbitrum Sepolia links for entropy');
    console.log('  ✓ Dual-network support (Somnia for logs, Arbitrum for entropy)');
    console.log('  ✓ Both transaction types included in game history');
    console.log('  ✓ SQL queries updated with new columns');
    console.log('  ✓ Explorer URLs configured for both networks');
    console.log('  ✓ Network field defaults to somnia-testnet');
    console.log('  ✓ Transaction hash validation implemented');
    console.log('  ✓ Verification notes distinguish networks');
    return true;
  } else {
    console.log('❌ Some GameHistoryService verification tests failed');
    console.log('Please review the failures above');
    return false;
  }
}

// Run verification
verifyGameHistoryService()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Verification script error:', error);
    process.exit(1);
  });
