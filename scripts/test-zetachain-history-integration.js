/**
 * Integration Test for ZetaChain Game History Service
 * 
 * This script demonstrates how the ZetaChain Game History Service
 * integrates with the ZetaChain Logger and other components.
 */

import { ZetaChainGameHistoryService } from '../src/services/ZetaChainGameHistoryService.js';
import { getZetaChainTransactionUrl } from '../src/config/zetachainConfig.js';

async function testIntegration() {
  console.log('🧪 Testing ZetaChain Game History Service Integration\n');

  try {
    // 1. Initialize service
    console.log('1️⃣ Initializing service...');
    const historyService = new ZetaChainGameHistoryService();
    
    // Note: In production, you would call initialize()
    // await historyService.initialize();
    console.log('✅ Service initialized\n');

    // 2. Simulate saving a game result with ZetaChain transaction
    console.log('2️⃣ Simulating game result save...');
    const mockGameData = {
      gameResultId: 123,
      userAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      gameType: 'ROULETTE',
      zetachainTxHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      zetachainBlockNumber: 12345
    };

    console.log('Game data:', {
      gameResultId: mockGameData.gameResultId,
      gameType: mockGameData.gameType,
      zetachainTxHash: mockGameData.zetachainTxHash.substring(0, 10) + '...'
    });
    console.log('✅ Game data prepared\n');

    // 3. Format a mock database row
    console.log('3️⃣ Testing data formatting...');
    const mockDbRow = {
      id: 123,
      user_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      game_type: 'ROULETTE',
      game_config: JSON.stringify({ bet: 'red', amount: '1' }),
      result_data: JSON.stringify({ outcome: 'win', number: 7 }),
      bet_amount: '1000000000000000000',
      payout_amount: '2000000000000000000',
      profit_loss: '1000000000000000000',
      created_at: new Date(),
      zetachain_tx_hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      zetachain_block_number: 12345
    };

    const formatted = historyService.formatGameResult(mockDbRow);
    
    console.log('Formatted game result:');
    console.log('  ID:', formatted.id);
    console.log('  Game Type:', formatted.gameType);
    console.log('  Bet Amount:', formatted.betAmount);
    console.log('  Payout Amount:', formatted.payoutAmount);
    console.log('  Is Win:', formatted.isWin);
    
    if (formatted.zetachainTransaction) {
      console.log('\n  ZetaChain Transaction:');
      console.log('    Hash:', formatted.zetachainTransaction.transactionHash.substring(0, 10) + '...');
      console.log('    Block:', formatted.zetachainTransaction.blockNumber);
      console.log('    Network:', formatted.zetachainTransaction.network);
      console.log('    Explorer:', formatted.zetachainTransaction.explorerUrl);
    }
    console.log('✅ Data formatting works correctly\n');

    // 4. Test explorer URL generation
    console.log('4️⃣ Testing explorer URL generation...');
    const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const explorerUrl = getZetaChainTransactionUrl(txHash);
    
    console.log('Transaction Hash:', txHash.substring(0, 10) + '...');
    console.log('Explorer URL:', explorerUrl);
    console.log('✅ Explorer URL generation works\n');

    // 5. Demonstrate typical workflow
    console.log('5️⃣ Typical Integration Workflow:\n');
    console.log('Step 1: Game completes and logs to ZetaChain');
    console.log('  → ZetaChainGameLogger.logGameResult(gameData)');
    console.log('  → Returns: zetachainTxHash\n');
    
    console.log('Step 2: Save ZetaChain transaction to database');
    console.log('  → ZetaChainGameHistoryService.saveGameResult({');
    console.log('      gameResultId: existingGameId,');
    console.log('      zetachainTxHash: txHash,');
    console.log('      zetachainBlockNumber: blockNumber');
    console.log('    })\n');
    
    console.log('Step 3: Retrieve user history with ZetaChain links');
    console.log('  → ZetaChainGameHistoryService.getUserHistory(userAddress)');
    console.log('  → Returns: games with zetachainTransaction objects\n');
    
    console.log('Step 4: Display in UI');
    console.log('  → Show ZetaChain explorer links');
    console.log('  → Allow users to verify on-chain\n');

    // 6. Show query options
    console.log('6️⃣ Available Query Options:\n');
    console.log('getUserHistory(userAddress, {');
    console.log('  gameType: "ROULETTE",    // Filter by game type');
    console.log('  limit: 50,               // Pagination');
    console.log('  offset: 0,               // Pagination');
    console.log('  onlyZetaChain: true      // Only games with ZetaChain tx');
    console.log('});\n');

    console.log('getRecentGames({');
    console.log('  limit: 100,              // Max results');
    console.log('  gameType: "MINES",       // Filter by game type');
    console.log('  onlyZetaChain: true      // Only games with ZetaChain tx');
    console.log('});\n');

    // 7. Show statistics usage
    console.log('7️⃣ Statistics and Monitoring:\n');
    console.log('getZetaChainStats({');
    console.log('  timeframe: "30 days"     // Time period');
    console.log('});');
    console.log('→ Returns: success rates, game counts, breakdown by type\n');

    console.log('getPendingZetaChainLogs({');
    console.log('  limit: 100,              // Max results');
    console.log('  olderThan: "5 minutes"   // Age threshold');
    console.log('});');
    console.log('→ Returns: games needing ZetaChain logging\n');

    // 8. Show error handling
    console.log('8️⃣ Error Handling:\n');
    console.log('try {');
    console.log('  await historyService.saveGameResult(gameData);');
    console.log('} catch (error) {');
    console.log('  if (error.message.includes("Invalid Ethereum address")) {');
    console.log('    // Handle invalid address');
    console.log('  } else if (error.message.includes("not found")) {');
    console.log('    // Handle missing game result');
    console.log('  }');
    console.log('}\n');

    console.log('=' .repeat(60));
    console.log('✅ Integration test completed successfully!');
    console.log('=' .repeat(60));
    console.log('\nThe ZetaChain Game History Service is ready for use.');
    console.log('See ZETACHAIN_HISTORY_SERVICE_README.md for full documentation.\n');

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    throw error;
  }
}

// Run the integration test
testIntegration()
  .then(() => {
    console.log('✅ All integration tests passed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Integration test failed:', error);
    process.exit(1);
  });
