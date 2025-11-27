/**
 * Authorize Treasury as Game Logger
 * 
 * This script authorizes the Treasury address to log games on behalf of players
 */

require('dotenv').config();
const { ethers } = require('ethers');

const SOMNIA_TESTNET_RPC = process.env.NEXT_PUBLIC_SOMNIA_RPC_URL || 'https://dream-rpc.somnia.network';
const GAME_LOGGER_ADDRESS = process.env.NEXT_PUBLIC_SOMNIA_GAME_LOGGER_ADDRESS;
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_SOMNIA_TREASURY_ADDRESS;
const OWNER_PRIVATE_KEY = process.env.SOMNIA_TESTNET_TREASURY_PRIVATE_KEY || process.env.TREASURY_PRIVATE_KEY;

const GAME_LOGGER_ABI = [
  'function addAuthorizedLogger(address logger) external',
  'function isAuthorizedLogger(address logger) external view returns (bool)',
  'function owner() external view returns (address)'
];

async function authorizeTreasury() {
  console.log('🔐 Authorizing Treasury as Game Logger...\n');

  try {
    // Validate environment variables
    if (!GAME_LOGGER_ADDRESS) {
      throw new Error('NEXT_PUBLIC_SOMNIA_GAME_LOGGER_ADDRESS not found in .env');
    }

    if (!TREASURY_ADDRESS) {
      throw new Error('NEXT_PUBLIC_SOMNIA_TREASURY_ADDRESS not found in .env');
    }

    if (!OWNER_PRIVATE_KEY) {
      throw new Error('SOMNIA_TESTNET_TREASURY_PRIVATE_KEY or TREASURY_PRIVATE_KEY not found in .env');
    }

    console.log('📋 Configuration:');
    console.log(`   GameLogger: ${GAME_LOGGER_ADDRESS}`);
    console.log(`   Treasury: ${TREASURY_ADDRESS}`);
    console.log(`   RPC: ${SOMNIA_TESTNET_RPC}\n`);

    // Create provider and signer
    const provider = new ethers.JsonRpcProvider(SOMNIA_TESTNET_RPC);
    const signer = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);

    console.log(`👤 Owner Address: ${signer.address}\n`);

    // Create contract instance
    const contract = new ethers.Contract(GAME_LOGGER_ADDRESS, GAME_LOGGER_ABI, signer);

    // Check current owner
    const owner = await contract.owner();
    console.log(`📝 Contract Owner: ${owner}`);

    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
      console.error('❌ ERROR: You are not the contract owner!');
      console.error(`   Your address: ${signer.address}`);
      console.error(`   Owner address: ${owner}`);
      process.exit(1);
    }

    // Check if already authorized
    console.log('\n🔍 Checking current authorization...');
    const isAuthorized = await contract.isAuthorizedLogger(TREASURY_ADDRESS);

    if (isAuthorized) {
      console.log('✅ Treasury is already authorized!');
      console.log('\n✨ No action needed.\n');
      return;
    }

    console.log('⚠️  Treasury is NOT authorized yet.');

    // Authorize Treasury
    console.log('\n📤 Authorizing Treasury...');
    const tx = await contract.addAuthorizedLogger(TREASURY_ADDRESS, {
      gasLimit: 100000
    });

    console.log(`⏳ Transaction submitted: ${tx.hash}`);
    console.log(`🔗 Explorer: https://shannon-explorer.somnia.network/tx/${tx.hash}\n`);

    // Wait for confirmation
    console.log('⏳ Waiting for confirmation...');
    const receipt = await tx.wait();

    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}\n`);

    // Verify authorization
    console.log('🔍 Verifying authorization...');
    const isNowAuthorized = await contract.isAuthorizedLogger(TREASURY_ADDRESS);

    if (isNowAuthorized) {
      console.log('✅ Treasury successfully authorized!\n');
      console.log('📝 Summary:');
      console.log(`   Treasury Address: ${TREASURY_ADDRESS}`);
      console.log(`   GameLogger Address: ${GAME_LOGGER_ADDRESS}`);
      console.log(`   Transaction: ${receipt.hash}`);
      console.log(`   Block: ${receipt.blockNumber}\n`);
      console.log('✨ Treasury can now log games on behalf of players!\n');
    } else {
      console.error('❌ Authorization verification failed!');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Error authorizing Treasury:');
    console.error(error);
    
    if (error.message) {
      console.error(`\nError message: ${error.message}`);
    }
    
    if (error.reason) {
      console.error(`\nReason: ${error.reason}`);
    }
    
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  authorizeTreasury()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { authorizeTreasury };
