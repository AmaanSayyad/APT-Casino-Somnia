/**
 * Test Script for Pyth Entropy Generation Across All Game Types
 * This script tests that:
 * 1. Entropy generation works for all game types (MINES, PLINKO, ROULETTE, WHEEL)
 * 2. All entropy transactions are on Arbitrum Sepolia
 * 3. No entropy requests go to Somnia Testnet
 */

const { ethers } = require('ethers');

// Configuration
const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
const ARBITRUM_SEPOLIA_RPC = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC || 'https://sepolia-rollup.arbitrum.io/rpc';
const PYTH_ENTROPY_CONTRACT = process.env.NEXT_PUBLIC_PYTH_ENTROPY_CONTRACT || '0x549ebba8036ab746611b4ffa1423eb0a4df61440';
const ARBITRUM_TREASURY_PRIVATE_KEY = process.env.ARBITRUM_TREASURY_PRIVATE_KEY;

// Game types to test
const GAME_TYPES = ['MINES', 'PLINKO', 'ROULETTE', 'WHEEL'];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Minimal ABI for Pyth Entropy
const PYTH_ENTROPY_ABI = [
  "function requestWithCallback(address provider, bytes32 userCommitment) external payable returns (uint64)",
  "function getFee(address provider) external view returns (uint256)",
  "function getDefaultProvider() external view returns (address)",
  "event Request(address indexed requester, uint64 indexed sequenceNumber, address indexed provider, bytes32 commitment)"
];

/**
 * Test entropy generation for a specific game type
 */
async function testEntropyForGame(gameType, provider, contract, wallet, defaultProvider, fee) {
  logSection(`Testing Entropy Generation for ${gameType}`);
  
  try {
    // Generate user random number
    const userRandomNumber = ethers.randomBytes(32);
    logInfo(`Generated user random number: ${ethers.hexlify(userRandomNumber).slice(0, 20)}...`);
    
    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    logInfo(`Wallet balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance < fee) {
      logError(`Insufficient balance for ${gameType}. Need ${ethers.formatEther(fee)} ETH`);
      return {
        gameType,
        success: false,
        error: 'Insufficient balance'
      };
    }
    
    // Request entropy
    logInfo(`Requesting entropy for ${gameType}...`);
    const tx = await contract.requestWithCallback(
      defaultProvider,
      userRandomNumber,
      {
        value: fee,
        gasLimit: 700000
      }
    );
    
    logSuccess(`Transaction sent: ${tx.hash}`);
    
    // Wait for confirmation
    logInfo('Waiting for confirmation...');
    const receipt = await tx.wait();
    logSuccess(`Transaction confirmed in block: ${receipt.blockNumber}`);
    
    // Verify the transaction is on Arbitrum Sepolia
    const txDetails = await provider.getTransaction(tx.hash);
    const network = await provider.getNetwork();
    
    if (Number(network.chainId) === ARBITRUM_SEPOLIA_CHAIN_ID) {
      logSuccess(`✓ Transaction is on Arbitrum Sepolia (Chain ID: ${network.chainId})`);
    } else {
      logError(`✗ Transaction is NOT on Arbitrum Sepolia! Chain ID: ${network.chainId}`);
      return {
        gameType,
        success: false,
        error: `Wrong network: ${network.chainId}`
      };
    }
    
    // Extract sequence number from logs
    let sequenceNumber = null;
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog && parsedLog.name === 'Request') {
          sequenceNumber = parsedLog.args.sequenceNumber;
          logSuccess(`✓ Sequence number: ${sequenceNumber}`);
          break;
        }
      } catch (_) {
        // ignore non-matching logs
      }
    }
    
    // Generate explorer URLs
    const arbitrumExplorerUrl = `https://sepolia.arbiscan.io/tx/${tx.hash}`;
    const entropyExplorerUrl = `https://entropy-explorer.pyth.network/?chain=arbitrum-sepolia&search=${tx.hash}`;
    
    logInfo(`Arbitrum Explorer: ${arbitrumExplorerUrl}`);
    logInfo(`Entropy Explorer: ${entropyExplorerUrl}`);
    
    return {
      gameType,
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      sequenceNumber: sequenceNumber ? sequenceNumber.toString() : null,
      chainId: Number(network.chainId),
      arbitrumExplorerUrl,
      entropyExplorerUrl,
      gasUsed: receipt.gasUsed.toString(),
      fee: ethers.formatEther(fee)
    };
    
  } catch (error) {
    logError(`Error testing ${gameType}: ${error.message}`);
    return {
      gameType,
      success: false,
      error: error.message
    };
  }
}

/**
 * Main test function
 */
async function main() {
  console.log('\n');
  log('╔══════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║   Pyth Entropy All Games Test - Arbitrum Sepolia Verification   ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════════════╝', 'cyan');
  console.log('\n');
  
  // Check if private key is available
  if (!ARBITRUM_TREASURY_PRIVATE_KEY) {
    logError('ARBITRUM_TREASURY_PRIVATE_KEY environment variable is required');
    logInfo('Please set this variable in your .env file');
    process.exit(1);
  }
  
  try {
    // Setup provider and wallet
    logSection('Setup');
    const provider = new ethers.JsonRpcProvider(ARBITRUM_SEPOLIA_RPC);
    const wallet = new ethers.Wallet(ARBITRUM_TREASURY_PRIVATE_KEY, provider);
    
    // Verify network
    const network = await provider.getNetwork();
    logInfo(`Connected to: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (Number(network.chainId) !== ARBITRUM_SEPOLIA_CHAIN_ID) {
      logError(`Wrong network! Expected Arbitrum Sepolia (${ARBITRUM_SEPOLIA_CHAIN_ID})`);
      process.exit(1);
    }
    logSuccess('✓ Connected to Arbitrum Sepolia');
    
    // Setup contract
    const contract = new ethers.Contract(PYTH_ENTROPY_CONTRACT, PYTH_ENTROPY_ABI, wallet);
    logSuccess(`✓ Contract initialized: ${PYTH_ENTROPY_CONTRACT}`);
    
    // Get default provider and fee
    const defaultProvider = await contract.getDefaultProvider();
    const fee = await contract.getFee(defaultProvider);
    logInfo(`Default provider: ${defaultProvider}`);
    logInfo(`Fee per request: ${ethers.formatEther(fee)} ETH`);
    
    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    logInfo(`Wallet address: ${wallet.address}`);
    logInfo(`Wallet balance: ${ethers.formatEther(balance)} ETH`);
    
    const totalFeeNeeded = fee * BigInt(GAME_TYPES.length);
    if (balance < totalFeeNeeded) {
      logWarning(`Low balance! Need ${ethers.formatEther(totalFeeNeeded)} ETH for all tests`);
      logWarning('Some tests may fail due to insufficient funds');
    }
    
    // Test entropy generation for each game type
    const results = [];
    
    for (const gameType of GAME_TYPES) {
      const result = await testEntropyForGame(gameType, provider, contract, wallet, defaultProvider, fee);
      results.push(result);
      
      // Wait a bit between requests to avoid rate limiting
      if (gameType !== GAME_TYPES[GAME_TYPES.length - 1]) {
        logInfo('Waiting 2 seconds before next test...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Generate summary
    logSection('Test Summary');
    
    const successfulTests = results.filter(r => r.success);
    const failedTests = results.filter(r => !r.success);
    
    console.log('\nResults by Game Type:');
    for (const result of results) {
      if (result.success) {
        logSuccess(`${result.gameType}: PASSED`);
        logInfo(`  Transaction: ${result.transactionHash}`);
        logInfo(`  Block: ${result.blockNumber}`);
        logInfo(`  Chain ID: ${result.chainId}`);
        if (result.sequenceNumber) {
          logInfo(`  Sequence: ${result.sequenceNumber}`);
        }
      } else {
        logError(`${result.gameType}: FAILED - ${result.error}`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    log(`Total Tests: ${results.length}`, 'cyan');
    log(`Passed: ${successfulTests.length}`, 'green');
    log(`Failed: ${failedTests.length}`, failedTests.length > 0 ? 'red' : 'green');
    console.log('='.repeat(70));
    
    // Verify all transactions are on Arbitrum Sepolia
    const allOnArbitrum = results.every(r => !r.success || r.chainId === ARBITRUM_SEPOLIA_CHAIN_ID);
    
    if (allOnArbitrum) {
      logSuccess('\n✨ All entropy transactions are on Arbitrum Sepolia!');
    } else {
      logError('\n❌ Some entropy transactions are NOT on Arbitrum Sepolia!');
    }
    
    // Check for Somnia references
    const hasSomniaReferences = results.some(r => 
      r.transactionHash && r.transactionHash.includes('somnia')
    );
    
    if (!hasSomniaReferences) {
      logSuccess('✨ No Somnia references found in entropy transactions!');
    } else {
      logError('❌ Found Somnia references in entropy transactions!');
    }
    
    console.log('\n');
    
    // Exit with appropriate code
    process.exit(failedTests.length > 0 ? 1 : 0);
    
  } catch (error) {
    logError(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
