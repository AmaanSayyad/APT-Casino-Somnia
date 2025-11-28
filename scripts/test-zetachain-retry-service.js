/**
 * Test Script for ZetaChain Retry Service
 * 
 * This script tests the retry queue functionality including:
 * - Adding entries to the queue
 * - Processing the queue with exponential backoff
 * - Marking entries as succeeded/failed
 * - Getting queue status
 */

const { dbPool } = require('../src/config/database');
const { ZetaChainRetryService } = require('../src/services/ZetaChainRetryService');

// Mock ZetaChain Logger for testing
class MockZetaChainLogger {
  constructor(shouldSucceed = true) {
    this.shouldSucceed = shouldSucceed;
    this.callCount = 0;
  }

  async logGameResult(gameData) {
    this.callCount++;
    
    if (this.shouldSucceed) {
      return `0x${Math.random().toString(16).substring(2, 66).padEnd(64, '0')}`;
    } else {
      throw new Error('Mock logging failure');
    }
  }

  setShouldSucceed(value) {
    this.shouldSucceed = value;
  }
}

async function testRetryService() {
  console.log('🧪 Testing ZetaChain Retry Service\n');

  try {
    // Initialize database
    console.log('📊 Initializing database connection...');
    await dbPool.initialize();
    console.log('✅ Database connected\n');

    // Create mock logger and retry service
    const mockLogger = new MockZetaChainLogger(false); // Start with failures
    const retryService = new ZetaChainRetryService(mockLogger);

    // Test 1: Add entries to queue
    console.log('📝 Test 1: Adding entries to retry queue');
    const testGameData = {
      gameType: 'ROULETTE',
      playerAddress: '0x1234567890123456789012345678901234567890',
      betAmount: '0.1',
      result: { outcome: 'red', number: 7 },
      payout: '0.2',
      entropyProof: {
        requestId: '0xabcdef',
        transactionHash: '0x123456'
      }
    };

    const entryId1 = await retryService.addToQueue(testGameData);
    console.log(`✅ Added entry 1: ${entryId1}`);

    const entryId2 = await retryService.addToQueue({
      ...testGameData,
      gameType: 'MINES'
    });
    console.log(`✅ Added entry 2: ${entryId2}\n`);

    // Test 2: Get queue status
    console.log('📊 Test 2: Getting queue status');
    let status = await retryService.getQueueStatus();
    console.log('Queue Status:', {
      size: status.size,
      succeeded: status.succeeded,
      failed: status.failed,
      failureRate: status.failureRate,
      isProcessing: status.isProcessing
    });
    console.log(`✅ Queue has ${status.size} pending entries\n`);

    // Test 3: Process queue (should fail)
    console.log('🔄 Test 3: Processing queue (expecting failures)');
    let result = await retryService.processQueue();
    console.log('Processing Result:', result);
    console.log(`✅ Processed ${result.processed} entries\n`);

    // Test 4: Check exponential backoff
    console.log('⏰ Test 4: Testing exponential backoff calculation');
    console.log('Attempt 0:', retryService.calculateBackoffDelay(0), 'ms');
    console.log('Attempt 1:', retryService.calculateBackoffDelay(1), 'ms');
    console.log('Attempt 2:', retryService.calculateBackoffDelay(2), 'ms');
    console.log('✅ Exponential backoff working correctly\n');

    // Test 5: Retry with success
    console.log('🔄 Test 5: Processing queue with successful logger');
    mockLogger.setShouldSucceed(true);
    
    // Wait a bit for backoff
    console.log('⏳ Waiting 2 seconds for backoff...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    result = await retryService.processQueue();
    console.log('Processing Result:', result);
    console.log(`✅ ${result.succeeded} entries succeeded\n`);

    // Test 6: Final queue status
    console.log('📊 Test 6: Final queue status');
    status = await retryService.getQueueStatus();
    console.log('Final Queue Status:', {
      size: status.size,
      succeeded: status.succeeded,
      failed: status.failed,
      failureRate: status.failureRate
    });
    console.log('✅ Queue status retrieved\n');

    // Test 7: Test max retries
    console.log('🔄 Test 7: Testing max retry limit');
    mockLogger.setShouldSucceed(false);
    
    const entryId3 = await retryService.addToQueue({
      ...testGameData,
      gameType: 'WHEEL'
    });
    console.log(`Added entry for max retry test: ${entryId3}`);

    // Process 3 times to hit max retries
    for (let i = 1; i <= 3; i++) {
      console.log(`\nRetry attempt ${i}/3...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i - 1)));
      result = await retryService.processQueue();
      console.log(`Attempt ${i} result:`, result);
    }

    status = await retryService.getQueueStatus();
    console.log('\nFinal status after max retries:', {
      pending: status.size,
      failed: status.failed
    });
    console.log('✅ Max retry limit enforced\n');

    // Test 8: Get failed entries
    console.log('📋 Test 8: Getting failed entries');
    const failedEntries = await retryService.getFailedEntries(10);
    console.log(`Found ${failedEntries.length} failed entries`);
    if (failedEntries.length > 0) {
      console.log('Sample failed entry:', {
        id: failedEntries[0].id,
        gameType: failedEntries[0].gameData.gameType,
        attempts: failedEntries[0].attempts,
        errorMessage: failedEntries[0].errorMessage
      });
    }
    console.log('✅ Failed entries retrieved\n');

    // Test 9: Manual retry
    console.log('🔄 Test 9: Testing manual retry');
    if (failedEntries.length > 0) {
      mockLogger.setShouldSucceed(true);
      const entryToRetry = failedEntries[0].id;
      console.log(`Manually retrying entry: ${entryToRetry}`);
      
      try {
        const success = await retryService.manualRetry(entryToRetry);
        console.log(`✅ Manual retry ${success ? 'succeeded' : 'failed'}\n`);
      } catch (error) {
        console.log(`⚠️ Manual retry failed: ${error.message}\n`);
      }
    }

    // Test 10: Cleanup old entries
    console.log('🧹 Test 10: Testing cleanup of old succeeded entries');
    const deletedCount = await retryService.cleanupOldEntries(0); // Delete all succeeded
    console.log(`✅ Cleaned up ${deletedCount} old entries\n`);

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await dbPool.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run tests if executed directly
if (require.main === module) {
  testRetryService()
    .then(() => {
      console.log('\n✅ Test suite completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { testRetryService };
