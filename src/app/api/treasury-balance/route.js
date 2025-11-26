import { NextResponse } from 'next/server';
import { ethers, JsonRpcProvider, Wallet } from 'ethers';
import { somniaTestnetConfig } from '@/config/somniaTestnetConfig';
import { SOMNIA_CONTRACTS, SOMNIA_NETWORKS } from '@/config/contracts';
import PYTH_ENTROPY_CONFIG from '@/config/pythEntropy.js';

export async function GET() {
  try {
    // Use Somnia Testnet for treasury operations
    const SOMNIA_RPC_URL = somniaTestnetConfig.rpcUrls.default.http[0];
    const SOMNIA_TREASURY_PRIVATE_KEY = process.env.SOMNIA_TESTNET_TREASURY_PRIVATE_KEY || process.env.TREASURY_PRIVATE_KEY;
    
    if (!SOMNIA_TREASURY_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Treasury not configured' },
        { status: 500 }
      );
    }

    // Create provider for Somnia Testnet
    const provider = new JsonRpcProvider(SOMNIA_RPC_URL);
    
    // Create treasury wallet
    const treasuryWallet = new Wallet(SOMNIA_TREASURY_PRIVATE_KEY, provider);
    
    // Get treasury balance on Somnia
    const balance = await provider.getBalance(treasuryWallet.address);
    const balanceInSTT = ethers.formatEther(balance);
    
    // Get Somnia treasury contract address
    const treasuryContractAddress = SOMNIA_CONTRACTS[SOMNIA_NETWORKS.TESTNET].treasury;
    
    // Get entropy network (still on Arbitrum Sepolia)
    const entropyNetwork = 'arbitrum-sepolia';
    const entropyConfig = PYTH_ENTROPY_CONFIG.getNetworkConfig(entropyNetwork);
    const entropyContractAddress = PYTH_ENTROPY_CONFIG.getEntropyContract(entropyNetwork);
    
    return NextResponse.json({
      success: true,
      treasury: {
        address: treasuryWallet.address,
        contractAddress: treasuryContractAddress,
        balance: balanceInSTT,
        balanceWei: balance.toString(),
        currency: 'STT'
      },
      network: {
        name: somniaTestnetConfig.name,
        chainId: somniaTestnetConfig.id,
        rpcUrl: SOMNIA_RPC_URL,
        explorer: somniaTestnetConfig.blockExplorers.default.url
      },
      entropy: {
        network: entropyConfig.name,
        chainId: entropyConfig.chainId,
        contractAddress: entropyContractAddress,
        requiredFee: "0.001" // ETH on Arbitrum Sepolia
      }
    });
    
  } catch (error) {
    console.error('❌ Treasury balance check failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check treasury balance',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
