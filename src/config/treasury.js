// Casino Treasury Configuration
// This file contains the treasury wallet address and related configuration

// Treasury Contract Address (deployed on Somnia Testnet)
export const TREASURY_CONFIG = {
  // Somnia Testnet Treasury Contract (for deposits/withdrawals)
  ADDRESS: process.env.SOMNIA_TESTNET_TREASURY_ADDRESS || process.env.TREASURY_ADDRESS || '0xacA996A4d49e7Ed42dA68a20600F249BE6d024A4',
  
  // ⚠️  DEVELOPMENT ONLY - Never use in production!
  PRIVATE_KEY: process.env.SOMNIA_TESTNET_TREASURY_PRIVATE_KEY || process.env.TREASURY_PRIVATE_KEY || '0x73e0cfb4d786d6e542533e18eb78fb5c727ab802b89c6850962042a8f0835f0c',
  
  // Network configuration for Somnia Testnet (for deposit/withdraw)
  NETWORK: {
    CHAIN_ID: '0xc488', // Somnia Testnet (50312 in decimal)
    CHAIN_NAME: 'Somnia Testnet',
    RPC_URL: process.env.NEXT_PUBLIC_SOMNIA_TESTNET_TESTNET_RPC || 'https://dream-rpc.somnia.network',
    EXPLORER_URL: process.env.NEXT_PUBLIC_SOMNIA_TESTNET_TESTNET_EXPLORER || 'https://shannon-explorer.somnia.network'
  },
  
  // Gas settings for transactions
  GAS: {
    DEPOSIT_LIMIT: process.env.GAS_LIMIT_DEPOSIT ? '0x' + parseInt(process.env.GAS_LIMIT_DEPOSIT).toString(16) : '0x1E8480', // 2000000 gas for contract deposit() call
    WITHDRAW_LIMIT: process.env.GAS_LIMIT_WITHDRAW ? '0x' + parseInt(process.env.GAS_LIMIT_WITHDRAW).toString(16) : '0x1E8480', // 2000000 gas for contract withdraw() call
  },
  
  // Minimum and maximum deposit amounts (in STT)
  LIMITS: {
    MIN_DEPOSIT: parseFloat(process.env.MIN_DEPOSIT) || 0.001, // 0.001 STT minimum
    MAX_DEPOSIT: parseFloat(process.env.MAX_DEPOSIT) || 100, // 100 STT maximum
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

