import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { somniaTestnetConfig } from '@/config/somniaTestnetConfig';

/**
 * Withdraw API - Somnia Testnet
 * 
 * NETWORK ARCHITECTURE:
 * This API processes withdrawals on Somnia Testnet using STT tokens.
 * Validates: Requirements 2.4, 12.2
 */

// Somnia Testnet Treasury private key from environment
const SOMNIA_TREASURY_PRIVATE_KEY = process.env.SOMNIA_TESTNET_TREASURY_PRIVATE_KEY || process.env.TREASURY_PRIVATE_KEY;

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
    console.log(`📍 Treasury: ${treasuryWallet.address}`);

    // Check treasury balance
    let treasuryBalance = 0;
    try {
      treasuryBalance = await provider.getBalance(treasuryWallet.address);
      console.log(`💰 Treasury balance: ${ethers.formatEther(treasuryBalance)} STT`);
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
    console.log('🔧 Treasury account:', treasuryWallet.address);
    console.log('🔧 Amount in Wei:', amountWei.toString());

    // Send transaction from treasury to user
    const tx = await treasuryWallet.sendTransaction({
      to: formattedUserAddress,
      value: amountWei,
      gasLimit: 500000 // Increased gas limit for Somnia Testnet
    });

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
      const balance = await provider.getBalance(treasuryWallet.address);

      return NextResponse.json({
        treasuryAddress: treasuryWallet.address,
        balance: ethers.formatEther(balance),
        balanceWei: balance.toString(),
        status: 'active',
        network: 'Somnia Testnet'
      });
    } catch (balanceError) {
      return NextResponse.json({
        treasuryAddress: treasuryWallet.address,
        balance: '0',
        balanceWei: '0',
        status: 'error',
        error: balanceError.message,
        network: 'Somnia Testnet'
      });
    }

  } catch (error) {
    console.error('Treasury balance check error:', error);
    return NextResponse.json(
      { error: 'Failed to check treasury balance: ' + error.message },
      { status: 500 }
    );
  }
}
