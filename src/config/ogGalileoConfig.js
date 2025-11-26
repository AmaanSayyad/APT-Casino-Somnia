/**
 * Somnia Testnet Testnet Configuration
 * Configuration for Somnia Testnet testnet with MON token
 */

// Somnia Testnet Chain Configuration
export const SOMNIA_TESTNET_TESTNET_CONFIG = {
  chainId: 16602,
  name: 'somnia-testnet-testnet-Testnet',
  network: 'somnia-testnet-testnet-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'STT',
    symbol: 'STT',
  },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_0G_GALILEO_RPC || 'https://dream-rpc.somnia.network',
        process.env.NEXT_PUBLIC_0G_GALILEO_RPC_FALLBACK || 'https://evm-rpc-galileo.0g.ai'
      ],
    },
    public: {
      http: [
        'https://dream-rpc.somnia.network',
        'https://evm-rpc-galileo.0g.ai'
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Testnet Explorer',
      url: process.env.NEXT_PUBLIC_0G_GALILEO_EXPLORER || 'https://shannon-explorer.somnia.network',
    },
  },
  testnet: true,
};

// Somnia Testnet Tokens
export const SOMNIA_TESTNET_TESTNET_TOKENS = {
  MON: {
    symbol: 'STT',
    name: 'MON token',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000',
    isNative: true,
    icon: '🔮',
    faucet: 'https://faucet.0g.ai'
  }
};

// Casino configuration for Somnia Testnet
export const SOMNIA_TESTNET_TESTNET_CASINO_CONFIG = {
  // Deposit/Withdraw settings
  minDeposit: '0.001', // 0.001 MON
  maxDeposit: '100',   // 100 MON
  minWithdraw: '0.001', // 0.001 MON
  maxWithdraw: '100',   // 100 MON
  
  // Game settings (same as Arbitrum for consistency)
  games: {
    MINES: {
      minBet: '0.001',
      maxBet: '1.0',
      minMines: 1,
      maxMines: 24,
      defaultMines: 3,
      gridSize: 25
    },
    ROULETTE: {
      minBet: '0.001',
      maxBet: '1.0',
      houseEdge: 0.027
    },
    PLINKO: {
      minBet: '0.001',
      maxBet: '1.0',
      rows: [8, 12, 16],
      defaultRows: 12
    },
    WHEEL: {
      minBet: '0.001',
      maxBet: '1.0',
      segments: [2, 10, 20, 40, 50]
    }
  }
};

// Network switching helper for Somnia Testnet
export const switchToOGGalileo = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not found');
  }

  try {
    // Try to switch to Somnia Testnet
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x40da' }], // 16602 in hex
    });
  } catch (switchError) {
    // If network doesn't exist, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x40da',
          chainName: 'somnia-testnet-testnet-Testnet',
          nativeCurrency: {
            name: 'STT',
            symbol: 'STT',
            decimals: 18,
          },
          rpcUrls: ['https://dream-rpc.somnia.network'],
          blockExplorerUrls: ['https://shannon-explorer.somnia.network'],
        }],
      });
    } else {
      throw switchError;
    }
  }
};

export default SOMNIA_TESTNET_TESTNET_CONFIG;