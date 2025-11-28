import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { somniaTestnetConfig } from '@/config/somniaTestnetConfig';
import { SOMNIA_CONTRACTS, SOMNIA_NETWORKS } from '@/config/contracts';

/**
 * Withdraw API - Somnia Testnet
 * 
 * NETWORK ARCHITECTURE:
 * This API processes withdrawals on Somnia Testnet using STT tokens.
 * Uses the Treasury Contract to send funds to users.
 * Validates: Requirements 2.4, 12.2
 */

// Somnia Testnet Treasury private key from environment
const SOMNIA_TREASURY_PRIVATE_KEY = process.env.SOMNIA_TESTNET_TREASURY_PRIVATE_KEY || process.env.TREASURY_PRIVATE_KEY;

// Treasury Contract Address
const TREASURY_CONTRACT_ADDRESS = SOMNIA_CONTRACTS[SOMNIA_NETWORKS.TESTNET].treasury;

// Treasury Contract ABI (only the functions we need)
const TREASURY_ABI = [
  "function emergencyWithdraw(address to, uint256 amount) external",
  "function getBalance(address user) external view returns (uint256)",
  "function getTreasuryStats() external view returns (uint256 contractBalance, uint256 totalDeposited, uint256 totalWithdrawn, uint256 userCount)",
  "function owner() external view returns (address)"
];

// Somnia Testnet RPC URL from config
const SOMNIA_RPC_URL = somniaTestnetConfig.rpcUrls.default.http[0];

// Create provider and wallet
const provider = new ethers.JsonRpcProvider(SOMNIA_RPC_URL);
const treasuryWallet = SOMNIA_TREASURY_PRIVATE_KEY ? new ethers.Wallet(SOMNIA_TREASURY_PRIVATE_KEY, provider) : null;

export async function POST(request) {
  try {
    const { userAddress, amount } = await request.json();

    console.log('📥 Received withdrawal request:', { userAddress, amount, type: typeof userAddress });

    // Validate input
    if (!userAddress || !amount || amount <= 0) {
      return new Response(JSON.stringify({
        error: 'Invalid parameters'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (!SOMNIA_TREASURY_PRIVATE_KEY || !treasuryWallet) {
      return NextResponse.json(
        { error: 'Treasury not configured' },
        { status: 500 }
      );
    }

    console.log(`🏦 Processing withdrawal: ${amount} STT to ${userAddress}`);
    console.log(`📍 Treasury Contract: ${TREASURY_CONTRACT_ADDRESS}`);
    console.log(`📍 Treasury Wallet (Owner): ${treasuryWallet.address}`);

    // Create Treasury Contract instance
    const treasuryContract = new ethers.Contract(
      TREASURY_CONTRACT_ADDRESS,
      TREASURY_ABI,
      treasuryWallet
    );

    // Check treasury CONTRACT balance (not wallet balance)
    let treasuryBalance = BigInt(0);
    try {
      // First try direct balance check (most reliable)
      treasuryBalance = await provider.getBalance(TREASURY_CONTRACT_ADDRESS);
      console.log(`💰 Treasury Contract balance: ${ethers.formatEther(treasuryBalance)} STT`);
      
      // Also log stats for debugging
      try {
        const stats = await treasuryContract.getTreasuryStats();
        console.log(`📊 Treasury Stats:`, {
          contractBalance: ethers.formatEther(stats.contractBalance),
          totalDeposited: ethers.formatEther(stats.totalDeposited),
          totalWithdrawn: ethers.formatEther(stats.totalWithdrawn),
          userCount: stats.userCount.toString()
        });
      } catch (statsError) {
        console.log('⚠️ Could not fetch treasury stats:', statsError.message);
      }
    } catch (balanceError) {
      console.log('⚠️ Could not check treasury balance, proceeding with transfer attempt...');
      console.log('Balance error:', balanceError.message);
    }

    // Check if treasury has sufficient funds
    const amountWei = ethers.parseEther(amount.toString());
    if (treasuryBalance < amountWei) {
      return NextResponse.json(
        { error: `Insufficient treasury funds. Available: ${ethers.formatEther(treasuryBalance)} STT, Requested: ${amount} STT` },
        { status: 400 }
      );
    }

    // Format user address
    let formattedUserAddress;
    if (typeof userAddress === 'object' && userAddress.data) {
      // Convert Uint8Array-like object to hex string
      const bytes = Object.values(userAddress.data);
      formattedUserAddress = '0x' + bytes.map(b => b.toString(16).padStart(2, '0')).join('');
    } else if (typeof userAddress === 'string') {
      formattedUserAddress = userAddress.startsWith('0x') ? userAddress : `0x${userAddress}`;
    } else {
      throw new Error(`Invalid userAddress format: ${typeof userAddress}`);
    }

    console.log('🔧 Formatted user address:', formattedUserAddress);
    console.log('🔧 Treasury Contract:', TREASURY_CONTRACT_ADDRESS);
    console.log('🔧 Amount in Wei:', amountWei.toString());

    // Verify that the treasury wallet is the owner of the contract
    let contractOwner;
    try {
      contractOwner = await treasuryContract.owner();
      console.log(`🔐 Contract owner: ${contractOwner}`);
      console.log(`🔐 Treasury wallet: ${treasuryWallet.address}`);
      
      if (contractOwner.toLowerCase() !== treasuryWallet.address.toLowerCase()) {
        console.log('⚠️ Treasury wallet is NOT the contract owner, using direct transfer...');
        
        // If treasury wallet is not the owner, we need to check wallet balance
        // and send directly from wallet (if it has funds)
        const walletBalance = await provider.getBalance(treasuryWallet.address);
        console.log(`💰 Treasury Wallet balance: ${ethers.formatEther(walletBalance)} STT`);
        
        if (walletBalance < amountWei) {
          return NextResponse.json(
            { 
              error: `Treasury wallet has insufficient funds. Wallet balance: ${ethers.formatEther(walletBalance)} STT. Contract balance: ${ethers.formatEther(treasuryBalance)} STT. Contract owner: ${contractOwner}. Please contact admin to fix ownership.`,
              contractOwner: contractOwner,
              treasuryWallet: treasuryWallet.address
            },
            { status: 400 }
          );
        }
        
        // Send directly from wallet
        console.log('💸 Sending STT directly from Treasury wallet to user...');
        const tx = await treasuryWallet.sendTransaction({
          to: formattedUserAddress,
          value: amountWei,
          gasLimit: 100000
        });
        
        console.log(`📤 Transaction sent: ${tx.hash}`);
        
        return new Response(JSON.stringify({
          success: true,
          transactionHash: tx.hash,
          amount: amount,
          userAddress: userAddress,
          treasuryAddress: treasuryWallet.address,
          status: 'pending',
          message: 'Transaction sent from treasury wallet. Check Somnia Explorer for confirmation.',
          note: 'Used direct wallet transfer (contract ownership mismatch)'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (ownerError) {
      console.log('⚠️ Could not verify contract owner:', ownerError.message);
    }

    console.log('💸 Calling emergencyWithdraw on Treasury Contract...');
    
    // Use emergencyWithdraw function to send STT from contract to user
    // The treasury wallet is the contract owner, so it can call this function
    const tx = await treasuryContract.emergencyWithdraw(
      formattedUserAddress,
      amountWei,
      {
        gasLimit: 500000 // Increased gas limit for Somnia Testnet
      }
    );

    console.log(`📤 Transaction sent: ${tx.hash}`);

    // Return transaction hash immediately without waiting for confirmation
    // User can check transaction status on Somnia Explorer
    console.log(`✅ Withdraw STT to ${userAddress}, TX: ${tx.hash}`);

    return new Response(JSON.stringify({
      success: true,
      transactionHash: tx.hash,
      amount: amount,
      userAddress: userAddress,
      treasuryAddress: treasuryWallet.address,
      status: 'pending',
      message: 'Transaction sent successfully. Check Somnia Explorer for confirmation.'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Withdraw API error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Ensure error message is a string
    const errorMessage = error?.message || 'Unknown error occurred';
    const safeErrorMessage = typeof errorMessage === 'string' ? errorMessage : 'Unknown error occurred';

    return new Response(JSON.stringify({
      error: `Withdrawal failed: ${safeErrorMessage}`
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// GET endpoint to check treasury balance
export async function GET() {
  try {
    if (!SOMNIA_TREASURY_PRIVATE_KEY || !treasuryWallet) {
      return NextResponse.json(
        { error: 'Treasury not configured' },
        { status: 500 }
      );
    }

    try {
      // Create Treasury Contract instance (read-only)
      const treasuryContract = new ethers.Contract(
        TREASURY_CONTRACT_ADDRESS,
        TREASURY_ABI,
        provider
      );

      // Get treasury contract stats
      const stats = await treasuryContract.getTreasuryStats();
      const contractBalance = stats.contractBalance;

      // Also get the wallet balance for gas fees
      const walletBalance = await provider.getBalance(treasuryWallet.address);

      return NextResponse.json({
        treasuryContractAddress: TREASURY_CONTRACT_ADDRESS,
        treasuryWalletAddress: treasuryWallet.address,
        contractBalance: ethers.formatEther(contractBalance),
        contractBalanceWei: contractBalance.toString(),
        walletBalance: ethers.formatEther(walletBalance),
        walletBalanceWei: walletBalance.toString(),
        totalDeposited: ethers.formatEther(stats.totalDeposited),
        totalWithdrawn: ethers.formatEther(stats.totalWithdrawn),
        totalUsers: stats.userCount.toString(),
        status: 'active',
        network: 'Somnia Testnet'
      });
    } catch (balanceError) {
      // Fallback to direct balance check
      try {
        const contractBalance = await provider.getBalance(TREASURY_CONTRACT_ADDRESS);
        const walletBalance = await provider.getBalance(treasuryWallet.address);

        return NextResponse.json({
          treasuryContractAddress: TREASURY_CONTRACT_ADDRESS,
          treasuryWalletAddress: treasuryWallet.address,
          contractBalance: ethers.formatEther(contractBalance),
          contractBalanceWei: contractBalance.toString(),
          walletBalance: ethers.formatEther(walletBalance),
          walletBalanceWei: walletBalance.toString(),
          status: 'partial',
          network: 'Somnia Testnet',
          note: 'Could not fetch full stats, showing balances only'
        });
      } catch (directError) {
        return NextResponse.json({
          treasuryContractAddress: TREASURY_CONTRACT_ADDRESS,
          treasuryWalletAddress: treasuryWallet.address,
          contractBalance: '0',
          contractBalanceWei: '0',
          walletBalance: '0',
          walletBalanceWei: '0',
          status: 'error',
          error: directError.message,
          network: 'Somnia Testnet'
        });
      }
    }

  } catch (error) {
    console.error('Treasury balance check error:', error);
    return NextResponse.json(
      { error: 'Failed to check treasury balance: ' + error.message },
      { status: 500 }
    );
  }
}
