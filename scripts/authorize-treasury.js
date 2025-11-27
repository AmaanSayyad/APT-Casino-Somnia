/**
 * Authorize Treasury Wallet Script
 * 
 * This script authorizes the treasury wallet to log game results on the GameLogger contract.
 * Run this script with the contract owner's private key.
 * 
 * Usage:
 *   node scripts/authorize-treasury.js
 * 
 * Required environment variables:
 *   - OWNER_PRIVATE_KEY: Private key of the contract owner
 *   - NEXT_PUBLIC_SOMNIA_GAME_LOGGER_ADDRESS: GameLogger contract address
 *   - NEXT_PUBLIC_SOMNIA_RPC_URL: Somnia RPC URL (optional, defaults to mainnet)
 *   - TREASURY_PRIVATE_KEY or SOMNIA_TESTNET_TREASURY_PRIVATE_KEY: Treasury wallet private key
 */

const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

// Contract ABI for authorization functions
const GAME_LOGGER_ABI = [
  'function addAuthorizedLogger(address logger) external',
  'function removeAuthorizedLogger(address logger) external',
  'function isAuthorizedLogger(address logger) external view returns (bool)',
  'function owner() external view returns (address)'
];

async function main() {
  console.log('🔧 Authorize Treasury Wallet Script\n');

  // Get environment variables
  const rpcUrl = process.env.NEXT_PUBLIC_SOMNIA_RPC_URL || 'https://dream-rpc.somnia.network';
  const gameLoggerAddress = process.env.NEXT_PUBLIC_SOMNIA_GAME_LOGGER_ADDRESS;
  const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY;
  const treasuryPrivateKey = process.env.SOMNIA_TESTNET_TREASURY_PRIVATE_KEY || process.env.TREASURY_PRIVATE_KEY;

  // Validate required env vars
  if (!gameLoggerAddress) {
    console.error('❌ NEXT_PUBLIC_SOMNIA_GAME_LOGGER_ADDRESS not set');
    process.exit(1);
  }

  if (!ownerPrivateKey) {
    console.error('❌ OWNER_PRIVATE_KEY not set');
    console.log('\n📌 You need to set OWNER_PRIVATE_KEY to the private key of the contract owner.');
    console.log('   The contract owner is the address that deployed the GameLogger contract.');
    process.exit(1);
  }

  if (!treasuryPrivateKey) {
    console.error('❌ TREASURY_PRIVATE_KEY or SOMNIA_TESTNET_TREASURY_PRIVATE_KEY not set');
    process.exit(1);
  }

  // Create provider
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  // Create signers
  const ownerSigner = new ethers.Wallet(ownerPrivateKey, provider);
  const treasurySigner = new ethers.Wallet(treasuryPrivateKey, provider);
  
  const ownerAddress = await ownerSigner.getAddress();
  const treasuryAddress = await treasurySigner.getAddress();

  console.log('📍 Configuration:');
  console.log(`   RPC URL: ${rpcUrl}`);
  console.log(`   GameLogger Contract: ${gameLoggerAddress}`);
  console.log(`   Owner Address: ${ownerAddress}`);
  console.log(`   Treasury Address: ${treasuryAddress}`);
  console.log('');

  // Create contract instance with owner signer
  const contract = new ethers.Contract(gameLoggerAddress, GAME_LOGGER_ABI, ownerSigner);

  // Check current owner
  try {
    const currentOwner = await contract.owner();
    console.log(`👤 Current contract owner: ${currentOwner}`);
    
    if (currentOwner.toLowerCase() !== ownerAddress.toLowerCase()) {
      console.error(`\n❌ Error: Your address (${ownerAddress}) is not the contract owner.`);
      console.error(`   Contract owner is: ${currentOwner}`);
      process.exit(1);
    }
    console.log('✅ You are the contract owner\n');
  } catch (error) {
    console.warn('⚠️ Could not verify owner (contract might not have owner function)');
  }

  // Check if treasury is already authorized
  try {
    const isAuthorized = await contract.isAuthorizedLogger(treasuryAddress);
    
    if (isAuthorized) {
      console.log('✅ Treasury wallet is already authorized!');
      console.log(`   Address: ${treasuryAddress}`);
      process.exit(0);
    }
    
    console.log('⚠️ Treasury wallet is NOT authorized yet');
  } catch (error) {
    console.warn('⚠️ Could not check authorization status:', error.message);
  }

  // Authorize treasury wallet
  console.log('\n📝 Authorizing treasury wallet...');
  
  try {
    const tx = await contract.addAuthorizedLogger(treasuryAddress, {
      gasLimit: 100000
    });
    
    console.log(`⏳ Transaction submitted: ${tx.hash}`);
    console.log(`   Explorer: https://shannon-explorer.somnia.network/tx/${tx.hash}`);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log('\n✅ Treasury wallet authorized successfully!');
      console.log(`   Transaction: ${receipt.hash}`);
      console.log(`   Block: ${receipt.blockNumber}`);
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
      
      // Verify authorization
      const isNowAuthorized = await contract.isAuthorizedLogger(treasuryAddress);
      console.log(`\n🔐 Verification: Treasury wallet authorized = ${isNowAuthorized}`);
    } else {
      console.error('\n❌ Transaction reverted!');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Failed to authorize treasury wallet:', error.message);
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log('   → Your wallet needs STT tokens for gas');
    } else if (error.code === 'CALL_EXCEPTION') {
      console.log('   → The contract rejected the transaction. Are you the owner?');
    }
    
    process.exit(1);
  }
}

main().catch(console.error);


