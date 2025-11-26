// Casino Treasury Configuration
// This file contains the treasury wallet address and related configuration

// Test Treasury Address (Replace with your actual treasury address in production)
export const TREASURY_CONFIG = {
  // Monad Testnet Treasury Wallet (for deposits/withdrawals)
  ADDRESS: process.env.MONAD_TREASURY_ADDRESS || process.env.TREASURY_ADDRESS || '0x025182b20Da64b5997d09a5a62489741F68d9B96',
  
  // ⚠️  DEVELOPMENT ONLY - Never use in production!
  PRIVATE_KEY: process.env.MONAD_TREASURY_PRIVATE_KEY || process.env.TREASURY_PRIVATE_KEY || '0x73e0cfb4d786d6e542533e18eb78fb5c727ab802b89c6850962042a8f0835f0c',
  
  // Network configuration for Monad Testnet (for deposit/withdraw)
  NETWORK: {
    CHAIN_ID: '0x279f', // Monad testnet (10143 in hex)
    CHAIN_NAME: 'Monad Testnet',
    RPC_URL: process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC || 'https://testnet-rpc.monad.xyz',
    EXPLORER_URL: process.env.NEXT_PUBLIC_MONAD_TESTNET_EXPLORER || 'https://testnet.monadexplorer.com'
  },
  
  // Gas settings for transactions
  GAS: {
    DEPOSIT_LIMIT: process.env.GAS_LIMIT_DEPOSIT ? '0x' + parseInt(process.env.GAS_LIMIT_DEPOSIT).toString(16) : '0x5208', // 21000 gas for simple ETH transfer
    WITHDRAW_LIMIT: process.env.GAS_LIMIT_WITHDRAW ? '0x' + parseInt(process.env.GAS_LIMIT_WITHDRAW).toString(16) : '0x186A0', // 100000 gas for more complex operations
  },
  
  // Minimum and maximum deposit amounts (in MON)
  LIMITS: {
    MIN_DEPOSIT: parseFloat(process.env.MIN_DEPOSIT) || 0.001, // 0.001 MON minimum
    MAX_DEPOSIT: parseFloat(process.env.MAX_DEPOSIT) || 100, // 100 MON maximum
  }
};

// Helper function to validate treasury address
export const isValidTreasuryAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Helper function to get treasury info
export const getTreasuryInfo = () => {
  return {
    address: TREASURY_CONFIG.ADDRESS,
    network: TREASURY_CONFIG.NETWORK.CHAIN_NAME,
    chainId: TREASURY_CONFIG.NETWORK.CHAIN_ID
  };
};
