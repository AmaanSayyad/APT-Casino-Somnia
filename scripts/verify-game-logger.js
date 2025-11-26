/**
 * Verification Script for Somnia Game Logger
 * 
 * This script verifies the Game Logger service is properly configured
 * and can interact with the deployed contract.
 */

const { ethers } = require('ethers');
const { SOMNIA_CONTRACTS, SOMNIA_NETWORKS, SOMNIA_NETWORK_URLS } = require('../src/config/contracts');

// Game Logger ABI (minimal for verification)
const GAME_LOGGER_ABI = [
  'function getTotalLogs() external view returns (uint256)',
  'function getStats() external view returns (uint256 totalGames, uint256 totalBets, uint256 totalPayouts, uint256 rouletteCount, uint256 minesCount, uint256 wheelCount, uint256 plinkoCount)',
  'function isAuthorizedLogger(address logger) external view returns (bool)'
];

async function verifyGameLogger() {
  console.log('🔍 Verifying Somnia Game Logger Service...\n');

  try {
    // Get contract address
    const contractAddress = SOMNIA_CONTRACTS[SOMNIA_NETWORKS.TESTNET].gameLogger;
    console.log('📝 Contract Address:', contractAddress);

    // Create provider
    const rpcUrl = SOMNIA_NETWORK_URLS[SOMNIA_NETWORKS.TESTNET];
    console.log('🌐 RPC URL:', rpcUrl);
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    console.log('✅ Provider connected\n');

    // Create contract instance
    const contract = new ethers.Contract(contractAddress, GAME_LOGGER_ABI, provider);
    console.log('📄 Contract instance created\n');

    // Verify contract is deployed
    console.log('🔍 Checking contract deployment...');
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      throw new Error('Contract not deployed at this address');
    }
    console.log('✅ Contract is deployed\n');

    // Get total logs
    console.log('📊 Fetching contract statistics...');
    const totalLogs = await contract.getTotalLogs();
    console.log('   Total Logs:', totalLogs.toString());

    // Get detailed stats
    const stats = await contract.getStats();
    console.log('   Total Games:', stats.totalGames.toString());
    console.log('   Total Bets:', ethers.formatEther(stats.totalBets), 'STT');
    console.log('   Total Payouts:', ethers.formatEther(stats.totalPayouts), 'STT');
    console.log('   Game Type Counts:');
    console.log('     - Roulette:', stats.rouletteCount.toString());
    console.log('     - Mines:', stats.minesCount.toString());
    console.log('     - Wheel:', stats.wheelCount.toString());
    console.log('     - Plinko:', stats.plinkoCount.toString());
    console.log('');

    // Check if owner is authorized
    const ownerAddress = process.env.DEPLOYER_ADDRESS || '0x0000000000000000000000000000000000000000';
    if (ownerAddress !== '0x0000000000000000000000000000000000000000') {
      console.log('🔐 Checking authorization...');
      const isAuthorized = await contract.isAuthorizedLogger(ownerAddress);
      console.log('   Owner authorized:', isAuthorized);
      console.log('');
    }

    console.log('✅ Game Logger Service Verification Complete!\n');
    console.log('📋 Summary:');
    console.log('   - Contract deployed and accessible');
    console.log('   - All read functions working');
    console.log('   - Ready for game integration');
    console.log('');
    console.log('🔗 Explorer:', `https://shannon-explorer.somnia.network/address/${contractAddress}`);

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check contract is deployed to Somnia Testnet');
    console.error('2. Verify RPC URL is accessible');
    console.error('3. Ensure contract address is correct in src/config/contracts.js');
    process.exit(1);
  }
}

// Run verification
verifyGameLogger();
