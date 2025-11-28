/**
 * Test script for ZetaChain logging API endpoint
 * 
 * This script tests the /api/zetachain/log-game endpoint
 * to ensure it properly logs games to ZetaChain via backend signing
 */

const fetch = require('node-fetch');

async function testZetaChainAPI() {
  console.log('🧪 Testing ZetaChain Logging API...\n');

  const API_URL = 'http://localhost:3000/api/zetachain/log-game';
  
  // Test data
  const testGameData = {
    gameType: 'ROULETTE',
    playerAddress: '0xcc78505FE8707a1D85229BA0E7177aE26cE0f17D', // Example player address
    betAmount: '0.001',
    result: {
      winningNumber: 24,
      bets: [
        { type: 4, value: 0, amount: 0.001, name: '1st Dozen (1-12)' },
        { type: 4, value: 1, amount: 0.001, name: '2nd Dozen (13-24)' },
        { type: 4, value: 2, amount: 0.001, name: '3rd Dozen (25-36)' }
      ],
      winningBets: [
        { type: 4, value: 1, amount: 0.001, name: '2nd Dozen (13-24)', payout: 0.003, multiplier: 3 }
      ],
      losingBets: [
        { type: 4, value: 0, amount: 0.001, name: '1st Dozen (1-12)', loss: 0.001 },
        { type: 4, value: 2, amount: 0.001, name: '3rd Dozen (25-36)', loss: 0.001 }
      ],
      totalPayout: 0.003,
      netResult: 0.003
    },
    payout: '0.003',
    entropyProof: {
      requestId: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    }
  };

  console.log('📤 Sending test game data to API...');
  console.log('   Player:', testGameData.playerAddress);
  console.log('   Game Type:', testGameData.gameType);
  console.log('   Bet Amount:', testGameData.betAmount, 'ETH');
  console.log('   Payout:', testGameData.payout, 'ETH\n');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testGameData)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ SUCCESS! Game logged to ZetaChain\n');
      console.log('📋 Response Details:');
      console.log('   Transaction Hash:', data.txHash);
      console.log('   Block Number:', data.blockNumber);
      console.log('   Gas Used:', data.gasUsed);
      console.log('   Explorer URL:', data.explorerUrl);
      console.log('\n🔗 View on Explorer:', data.explorerUrl);
      
      return true;
    } else {
      console.log('❌ FAILED! API returned error\n');
      console.log('📋 Error Details:');
      console.log('   Status:', response.status);
      console.log('   Success:', data.success);
      console.log('   Error:', data.error);
      console.log('   Message:', data.message);
      
      return false;
    }
  } catch (error) {
    console.log('❌ FAILED! Request error\n');
    console.log('📋 Error Details:');
    console.log('   Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Make sure the Next.js dev server is running:');
      console.log('   npm run dev');
    }
    
    return false;
  }
}

// Run test
testZetaChainAPI()
  .then(success => {
    console.log('\n' + '═'.repeat(60));
    if (success) {
      console.log('✅ TEST PASSED - ZetaChain API is working correctly!');
    } else {
      console.log('❌ TEST FAILED - Check the error details above');
    }
    console.log('═'.repeat(60));
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  });
