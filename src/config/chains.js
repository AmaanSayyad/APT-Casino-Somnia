/**
 * Custom Chain Definitions
 * Defines custom chains not included in wagmi/chains
 */

import { defineChain } from 'viem';

// Somnia Testnet Chain Definition
// Configuration based on official network.md documentation
export const somniaTestnet = defineChain({
  id: 50312, // Correct chain ID from network.md
  name: 'Somnia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'STT',
    symbol: 'STT',
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network'], // Primary RPC from network.md
    },
    public: {
      http: ['https://dream-rpc.somnia.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Shannon Explorer',
      url: 'https://shannon-explorer.somnia.network', // Primary explorer from network.md
    },
    socialscan: {
      name: 'Somnia Testnet SocialScan',
      url: 'https://somnia-testnet.socialscan.io', // Alternative explorer
    },
  },
  testnet: true,
});

export default {
  somniaTestnet,
};
