// Somnia Testnet Configuration
export const somniaTestnetConfig = {
  id: 50312,
  name: 'Somnia Testnet',
  network: 'somnia-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'STT',
    symbol: 'STT',
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network'],
      webSocket: ['wss://dream-rpc.somnia.network'],
    },
    public: {
      http: ['https://dream-rpc.somnia.network'],
      webSocket: ['wss://dream-rpc.somnia.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Shannon Explorer',
      url: 'https://shannon-explorer.somnia.network',
    },
    socialscan: {
      name: 'Somnia Testnet SocialScan',
      url: 'https://somnia-testnet.socialscan.io',
    },
  },
  testnet: true,
};

export const somniaTestnetTokens = {
  STT: {
    address: 'native',
    decimals: 18,
    symbol: 'STT',
    name: 'Somnia Testnet Token',
    isNative: true,
  },
};

export default somniaTestnetConfig;

